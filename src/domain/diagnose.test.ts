import { describe, it, expect } from 'vitest';
import { diagnostiziere, kehrtZurueck, berechneNeuenWert, type Befund } from './diagnose';

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

  it('keine passende Kombination -> keine Diagnose, keine erzwungene Regel', () => {
    expect(diagnostiziere([befund('bitter')])).toBeUndefined();
    expect(diagnostiziere([])).toBeUndefined();
  });

  it('die spezifischere Regel gewinnt bei Ueberschneidung', () => {
    // sauer+duenn+schnell (3 Bedingungen) UND zusaetzlich salzig gewaehlt:
    // beide Regeln passen dem Wortlaut nach, die dreiteilige ist spezifischer.
    const d = diagnostiziere([befund('sauer'), befund('duenn'), befund('schnell'), befund('salzig')]);
    expect(d?.diagnose).toBe('Unterextraktion');
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
