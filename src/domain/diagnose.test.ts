import { describe, it, expect } from 'vitest';
import { diagnostiziere, kehrtZurueck, berechneNeuenWert, ermittleDiagnose, type Befund, type VorherigerShot } from './diagnose';

function befund(symptomId: string, staerke: 'leicht' | 'deutlich' = 'deutlich'): Befund {
  return { symptomId, staerke };
}

/**
 * "Die Regeln dahinter", konzept.md:506-516. Jede Zeile hier ist eine Zeile
 * dort — die Tabelle im Konzept ist der Erwartungswert, nicht meine
 * Erinnerung daran.
 */
describe('Regelwerk aus dem Konzept', () => {
  it('zu sauer + duenn + lief zu schnell -> Unterextraktion, Mahlgrad feiner', () => {
    const d = diagnostiziere([befund('sauer'), befund('duenn'), befund('schnell')]);
    expect(d?.diagnose).toBe('Unterextraktion');
    expect(d?.aenderung).toEqual({ parameter: 'mg', richtung: 'feiner', schritte: 2 });
  });

  it('Schrittweite folgt der Staerke — leicht ergibt einen Schritt, deutlich zwei', () => {
    const leicht = diagnostiziere([befund('sauer', 'leicht'), befund('duenn', 'leicht'), befund('schnell', 'leicht')]);
    expect(leicht?.aenderung).toEqual({ parameter: 'mg', richtung: 'feiner', schritte: 1 });
  });

  it('zu sauer + salzig -> starke Unterextraktion, deutlich feiner', () => {
    const d = diagnostiziere([befund('sauer'), befund('salzig')]);
    expect(d?.diagnose).toBe('starke Unterextraktion');
    expect(d?.aenderung).toEqual({ parameter: 'mg', richtung: 'feiner', schritte: 2 });
  });

  it('zu bitter + adstringent + lief zu langsam -> Ueberextraktion, Mahlgrad groeber', () => {
    const d = diagnostiziere([befund('bitter'), befund('adstringent'), befund('langsam')]);
    expect(d?.diagnose).toBe('Überextraktion');
    expect(d?.aenderung).toEqual({ parameter: 'mg', richtung: 'groeber', schritte: 1 });
  });

  it('flach allein -> Konzentration zu niedrig, Output weniger', () => {
    const d = diagnostiziere([befund('flach')]);
    expect(d?.diagnose).toBe('Extraktion ok, Konzentration zu niedrig');
    expect(d?.aenderung).toEqual({ parameter: 'output', richtung: 'weniger', schritte: 2 });
  });

  it('flach zusammen mit einem zweiten Befund triggert die Regel NICHT — "sonst nichts auffaellig"', () => {
    const d = diagnostiziere([befund('flach'), befund('bitter')]);
    expect(d?.diagnose).not.toBe('Extraktion ok, Konzentration zu niedrig');
  });

  it('ungleichmaessig -> Verteilung/Channeling, KEIN Mahlgradwechsel', () => {
    const d = diagnostiziere([befund('ungleichmaessig')]);
    expect(d?.diagnose).toBe('Verteilung / Channeling');
    expect(d?.aenderung).toBeUndefined();
  });

  it('brandig + zu stark -> KT zu hoch, Mahlgrad bleibt', () => {
    const d = diagnostiziere([befund('brandig'), befund('stark')]);
    expect(d?.diagnose).toBe('KT zu hoch für diese Röstung');
    expect(d?.aenderung).toEqual({ parameter: 'kt', richtung: 'weniger', schritte: 1 });
  });

  it('keine Auswahl -> keine Diagnose, keine erzwungene Regel', () => {
    expect(diagnostiziere([])).toBeUndefined();
  });

  it('die spezifischere Regel gewinnt bei Ueberschneidung', () => {
    // sauer+duenn+schnell (3 Bedingungen) UND zusaetzlich salzig gewaehlt:
    // beide Regeln passen dem Wortlaut nach, die dreiteilige ist spezifischer.
    const d = diagnostiziere([befund('sauer'), befund('duenn'), befund('schnell'), befund('salzig')]);
    expect(d?.diagnose).toBe('Unterextraktion');
  });
});

/**
 * Etappe 5, "Evidenz statt Konjunktion" (docs/design/redesign-v2-plan.md):
 * greift erst, wenn keine exakte Konzept-Kombination passt. Vorher lieferte
 * z. B. "bitter" allein gar nichts (siehe Git-Historie dieses Tests) — genau
 * das war der gemeldete Fehler ("fuer viele realistisch auftretende
 * Kombinationen keine Reaktionsvorschlaege").
 */
describe('Achsen-Scoring — greift, wenn keine exakte Regel passt', () => {
  it('ein einzelnes Symptom ergibt einen geschaetzten Vorschlag auf seiner Achse', () => {
    const d = diagnostiziere([befund('bitter')]);
    expect(d?.diagnose).toBe('Überextraktion');
    expect(d?.geschaetzt).toBe(true);
    expect(d?.aenderung).toEqual({ parameter: 'mg', richtung: 'groeber', schritte: 1 });
  });

  it('Schrittweite folgt weiterhin der Staerke, nur auf der Unterextraktions-Achse', () => {
    const leicht = diagnostiziere([befund('sauer', 'leicht')]);
    expect(leicht?.aenderung).toEqual({ parameter: 'mg', richtung: 'feiner', schritte: 1 });
    const deutlich = diagnostiziere([befund('sauer', 'deutlich')]);
    expect(deutlich?.aenderung).toEqual({ parameter: 'mg', richtung: 'feiner', schritte: 2 });
  });

  it('zwei von drei Ueberextraktions-Symptomen ohne exakten Treffer -> trotzdem ein Vorschlag', () => {
    const d = diagnostiziere([befund('bitter'), befund('langsam')]);
    expect(d?.diagnose).toBe('Überextraktion');
    expect(d?.geschaetzt).toBe(true);
  });

  it('ein einzelnes "salzig" bekommt die einfache Unterextraktion, NICHT die verschaerfte Variante', () => {
    // "starke Unterextraktion" bleibt der exakten sauer+salzig-Kombination vorbehalten.
    const d = diagnostiziere([befund('salzig')]);
    expect(d?.diagnose).toBe('Unterextraktion');
    expect(d?.regelId).toBe('achse-unterextraktion');
  });

  it('Gleichstand zwischen zwei Achsen -> die Prioritaetsreihenfolge entscheidet', () => {
    // sauer (unterextraktion, 1 Treffer) vs. bitter (ueberextraktion, 1 Treffer) —
    // unterextraktion steht in der Konzepttabelle zuerst.
    const d = diagnostiziere([befund('sauer'), befund('bitter')]);
    expect(d?.diagnose).toBe('Unterextraktion');
  });

  it('"stark" allein (ohne "brandig") ergibt trotzdem KT zu hoch, geschaetzt', () => {
    const d = diagnostiziere([befund('stark')]);
    expect(d?.diagnose).toBe('KT zu hoch für diese Röstung');
    expect(d?.geschaetzt).toBe(true);
  });

  it('leere Auswahl bleibt ohne Diagnose, auch im Achsen-Fallback', () => {
    expect(diagnostiziere([])).toBeUndefined();
  });

  it('ein exakter Treffer ist NICHT geschaetzt', () => {
    const d = diagnostiziere([befund('sauer'), befund('duenn'), befund('schnell')]);
    expect(d?.geschaetzt).toBeUndefined();
  });
});

describe('berechneNeuenWert — "Mahlgrad 3,75 -> 3,65 · zwei Schritte feiner"', () => {
  it('mg feiner rechnet mit der Muehlen-Schrittgroesse', () => {
    expect(berechneNeuenWert({ parameter: 'mg', richtung: 'feiner', schritte: 2 }, 3.75, 0.05)).toBe(3.65);
  });

  it('mg groeber addiert', () => {
    expect(berechneNeuenWert({ parameter: 'mg', richtung: 'groeber', schritte: 1 }, 65, 1)).toBe(66);
  });

  it('output/kt rechnen direkt in ihrer Einheit, ohne Muehlen-Schrittgroesse', () => {
    expect(berechneNeuenWert({ parameter: 'output', richtung: 'weniger', schritte: 2 }, 36, 0.05)).toBe(34);
    expect(berechneNeuenWert({ parameter: 'kt', richtung: 'weniger', schritte: 1 }, 121)).toBe(120);
  });
});

describe('K76 — Rueckkehr erst bei zwei aufeinanderfolgenden Shots mit demselben Befund', () => {
  it('kehrt nicht zurueck ohne Vorgeschichte', () => {
    expect(kehrtZurueck(undefined, 'unterextraktion')).toBe(false);
  });

  it('kehrt nicht zurueck bei einer anderen Regel im Vorshot', () => {
    expect(kehrtZurueck('ueberextraktion', 'unterextraktion')).toBe(false);
  });

  it('kehrt zurueck, wenn der unmittelbar vorherige Shot dieselbe Regel zeigte', () => {
    expect(kehrtZurueck('unterextraktion', 'unterextraktion')).toBe(true);
  });
});

describe('ermittleDiagnose — Diagnose + K68/K76 in einem Aufruf (zweiter echter Aufrufer: Shotblatt.svelte)', () => {
  const FLACH: Befund[] = [befund('flach')];

  it('ohne Befunde kein Ergebnis, nichts unterdrueckt', () => {
    expect(ermittleDiagnose([], [], 1000, [])).toEqual({ ergebnis: undefined, unterdrueckt: false });
  });

  it('erstmalig (keine Vorgeschichte) wird nichts unterdrueckt', () => {
    const a = ermittleDiagnose(FLACH, [], 1000, []);
    expect(a.ergebnis?.regelId).toBe('konzentration-niedrig');
    expect(a.unterdrueckt).toBe(false);
  });

  it('schon einmal gezeigt, und der unmittelbar vorherige Shot zeigt es erneut -> nicht unterdrueckt (K76: zwei in Folge)', () => {
    const vorherige: VorherigerShot[] = [
      { ts: 500, vorschlagRegelId: 'konzentration-niedrig', vorschlagZustand: 'offen' }, // unmittelbar davor: dieselbe Regel
      { ts: 100, vorschlagRegelId: 'konzentration-niedrig', vorschlagZustand: 'offen' }, // schon einmal gezeigt
    ];
    expect(ermittleDiagnose(FLACH, [], 1000, vorherige).unterdrueckt).toBe(false);
  });

  it('schon einmal gezeigt, aber NICHT beim unmittelbar vorherigen Shot -> unterdrueckt', () => {
    const vorherige: VorherigerShot[] = [
      { ts: 500, vorschlagRegelId: 'ueberextraktion', vorschlagZustand: 'offen' }, // unmittelbar davor: andere Regel
      { ts: 100, vorschlagRegelId: 'konzentration-niedrig', vorschlagZustand: 'offen' }, // schon einmal gezeigt
    ];
    expect(ermittleDiagnose(FLACH, [], 1000, vorherige).unterdrueckt).toBe(true);
  });

  it('ein uebernommener Vorschlag zaehlt nicht als "schon gezeigt, nicht entschieden"', () => {
    const vorherige: VorherigerShot[] = [{ ts: 500, vorschlagRegelId: 'konzentration-niedrig', vorschlagZustand: 'uebernommen' }];
    expect(ermittleDiagnose(FLACH, [], 1000, vorherige).unterdrueckt).toBe(false);
  });

  it('spaetere Shots zaehlen nicht als "vorherig" — wichtig fuer einen Shot aus der Mitte der Historie', () => {
    const vorherige: VorherigerShot[] = [{ ts: 2000, vorschlagRegelId: 'konzentration-niedrig', vorschlagZustand: 'offen' }];
    expect(ermittleDiagnose(FLACH, [], 1000, vorherige).unterdrueckt).toBe(false);
  });
});
