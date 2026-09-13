import { describe, it, expect } from 'vitest';
import {
  bereinigteQuote,
  gesamtquote,
  zielGewicht,
  naechstesZiel,
  aufgabeBenennen,
  aufgabeUnterscheiden,
  naechsteAufgabe,
  UEBUNG_HALBWERTSZEIT_TAGE,
  effektiverZustand,
  verdeckteGesamtgroesse,
  planeDurchgang,
  DURCHGANG_GROESSE,
  type AromaOption,
  type GesamtStand,
  type TrefferStand,
} from './uebung';

const LEER: TrefferStand = { versuche: 0, treffer: 0 };
const STAND = (ueber: Partial<GesamtStand> = {}): GesamtStand => ({
  benennen: LEER,
  unterscheiden: LEER,
  verwechslungen: {},
  ...ueber,
});

const TAG = 24 * 60 * 60 * 1000;
const JETZT = 1_700_000_000_000;

describe('bereinigteQuote — um die Ratewahrscheinlichkeit bereinigt', () => {
  it('ohne Versuche 0', () => {
    expect(bereinigteQuote(LEER, 'benennen')).toBe(0);
  });

  it('reines Raten bei "unterscheiden" (1 aus 2) zaehlt als 0, nicht als 0,5', () => {
    expect(bereinigteQuote({ versuche: 10, treffer: 5 }, 'unterscheiden')).toBeCloseTo(0);
  });

  it('perfekte Quote bleibt 1, unabhaengig von der Ratewahrscheinlichkeit', () => {
    expect(bereinigteQuote({ versuche: 10, treffer: 10 }, 'unterscheiden')).toBeCloseTo(1);
    expect(bereinigteQuote({ versuche: 10, treffer: 10 }, 'benennen')).toBeCloseTo(1);
  });

  it('unter dem Zufallsniveau faellt nicht ins Minus', () => {
    expect(bereinigteQuote({ versuche: 10, treffer: 2 }, 'unterscheiden')).toBe(0);
  });

  it('"benennen" (1 aus 60) korrigiert kaum, "unterscheiden" (1 aus 2) stark', () => {
    const stand: TrefferStand = { versuche: 10, treffer: 8 };
    expect(bereinigteQuote(stand, 'benennen')).toBeGreaterThan(bereinigteQuote(stand, 'unterscheiden'));
  });
});

describe('gesamtquote — gewichtet nach Versuchen je Art', () => {
  it('ohne jeden Versuch 0', () => {
    expect(gesamtquote(STAND())).toBe(0);
  });

  it('eine Art mit mehr Versuchen zaehlt staerker', () => {
    const stand = STAND({
      benennen: { versuche: 20, treffer: 20 }, // bereinigt ~1
      unterscheiden: { versuche: 2, treffer: 1 }, // bereinigt 0
    });
    expect(gesamtquote(stand)).toBeGreaterThan(0.8);
  });
});

describe('zielGewicht — Sicherheit UND "wie lange her"', () => {
  it('nie geuebt bekommt volles Gewicht', () => {
    expect(zielGewicht(undefined, JETZT)).toBe(1);
  });

  it('perfekt UND eben erst geuebt faellt auf das Mindestgewicht, nie auf 0', () => {
    const stand = STAND({ benennen: { versuche: 10, treffer: 10 }, letzterVersuch: JETZT });
    expect(zielGewicht(stand, JETZT)).toBeCloseTo(0.15);
  });

  it('perfekt, aber lange her, bekommt wieder hohes Gewicht — Vergessen schlaegt Koennen', () => {
    const langeHer = STAND({ benennen: { versuche: 10, treffer: 10 }, letzterVersuch: JETZT - 10 * UEBUNG_HALBWERTSZEIT_TAGE * TAG });
    expect(zielGewicht(langeHer, JETZT)).toBeGreaterThan(0.9);
  });

  it('schwach, aber eben erst geuebt, behaelt trotzdem hohes Gewicht — Koennen schlaegt Frische', () => {
    const schwach = STAND({ benennen: { versuche: 10, treffer: 1 }, letzterVersuch: JETZT });
    expect(zielGewicht(schwach, JETZT)).toBeGreaterThan(0.8);
  });
});

describe('naechstesZiel — gewichtete Ziehung', () => {
  const AROMEN: AromaOption[] = [
    { id: 'a', label: 'A' },
    { id: 'b', label: 'B' },
  ];

  it('ohne Aromen nichts zu ziehen', () => {
    expect(naechstesZiel([], new Map(), JETZT)).toBeUndefined();
  });

  it('ein schwaches Aroma hat mehr Anteil an der Ziehung als ein perfektes, eben geuebtes', () => {
    // 'b' hat gar keinen Eintrag -> nie geuebt -> Gewicht 1.
    const staende = new Map<string, GesamtStand>([
      ['a', STAND({ benennen: { versuche: 10, treffer: 10 }, letzterVersuch: JETZT })], // Gewicht 0.15
    ]);
    const grenze = 0.15 / 1.15;
    expect(naechstesZiel(AROMEN, staende, JETZT, () => grenze + 0.01)?.id).toBe('b');
    expect(naechstesZiel(AROMEN, staende, JETZT, () => grenze - 0.01)?.id).toBe('a');
  });
});

// ---- Die zwei Aufgabenarten ------------------------------------------------

const HIMBEERE: AromaOption = { id: 'himbeere', label: 'Himbeere', nummer: 5, kategorieId: 'fruchtig' };
const BLAUBEERE: AromaOption = { id: 'blaubeere', label: 'Blaubeere', nummer: 6, kategorieId: 'fruchtig' };
const TEER: AromaOption = { id: 'teer', label: 'Teer', nummer: 39, kategorieId: 'sonstiges', verwandte: ['gummi'] };
const GUMMI: AromaOption = { id: 'gummi', label: 'Gummi', nummer: 40, kategorieId: 'sonstiges', verwandte: ['teer'] };
const ALLE = [HIMBEERE, BLAUBEERE, TEER, GUMMI];

describe('aufgabeBenennen', () => {
  it('riecht das Ziel, die Frage nennt keine Nummer (die zeigt der Bildschirm separat), Optionen sind alle Aromen', () => {
    const aufgabe = aufgabeBenennen(TEER, ALLE);
    expect(aufgabe.art).toBe('benennen');
    expect(aufgabe.riechen).toEqual([TEER]);
    expect(aufgabe.frage).not.toMatch(/\d/);
    expect(aufgabe.optionen).toEqual(ALLE);
    expect(aufgabe.richtigeId).toBe('teer');
  });
});

describe('aufgabeUnterscheiden', () => {
  it('fragt nach dem Namen des Ziels, Optionen sind genau die zwei Riechenden', () => {
    const aufgabe = aufgabeUnterscheiden(TEER, GUMMI, () => 0);
    expect(aufgabe.art).toBe('unterscheiden');
    expect(aufgabe.frage).toBe('Welches der beiden ist „Teer“?');
    expect(aufgabe.riechen.map((a) => a.id).sort()).toEqual(['gummi', 'teer']);
    expect(aufgabe.optionen).toEqual(aufgabe.riechen);
    expect(aufgabe.richtigeId).toBe('teer');
  });
});

describe('naechsteAufgabe — die gezielte Auswahl', () => {
  it('ein auffaellig verwechseltes, verwandtes Aroma loest gezielt "Unterscheiden" aus', () => {
    const staende = new Map<string, GesamtStand>([
      ['teer', STAND({ benennen: { versuche: 5, treffer: 2 }, verwechslungen: { gummi: 3 } })],
    ]);
    // zufall() = 0 zieht ohnehin das erste Gewicht (hier: das einzige Aroma mit Stand).
    const aufgabe = naechsteAufgabe([TEER, GUMMI, HIMBEERE], staende, JETZT, () => 0);
    expect(aufgabe?.art).toBe('unterscheiden');
    expect(aufgabe?.richtigeId).toBe('teer');
    expect(aufgabe?.riechen.some((a) => a.id === 'gummi')).toBe(true);
  });

  it('ohne auffaellige Verwechslungen und hohem Wuerfelwert kommt "Benennen"', () => {
    const staende = new Map<string, GesamtStand>();
    const folge = [0, 0.99]; // erst die Ziehung (trifft das erste Aroma), dann der Aufgaben-Wuerfel
    let i = 0;
    const zufall = () => folge[i++]!;
    const aufgabe = naechsteAufgabe(ALLE, staende, JETZT, zufall);
    expect(aufgabe?.art).toBe('benennen');
  });

  it('ohne jedes Aroma gibt es keine Aufgabe', () => {
    expect(naechsteAufgabe([], new Map(), JETZT)).toBeUndefined();
  });
});

// ============================================================================
// Aromapaket, Etappe 6 — Zusammenstellung eines Übungsdurchgangs
// ============================================================================

const TEXT_ID = (praefix: string, n: number) => `${praefix}${n}`;

/** Baut n AromaOption mit fortlaufenden Ids `praefix1..praefixn`. */
function aromen(praefix: string, n: number): AromaOption[] {
  return Array.from({ length: n }, (_, i) => ({ id: TEXT_ID(praefix, i + 1), label: TEXT_ID(praefix, i + 1) }));
}

describe('verdeckteGesamtgroesse — Beutelgroesse ≈ Rundengroesse × 1,5, mindestens +3', () => {
  it('bei 8 Abgefragten: 12', () => {
    expect(verdeckteGesamtgroesse(8)).toBe(12);
    expect(verdeckteGesamtgroesse()).toBe(12); // Default DURCHGANG_GROESSE
  });

  it('bei kleiner Rundengroesse greift die Mindestens-+3-Regel statt der ×1,5', () => {
    expect(verdeckteGesamtgroesse(4)).toBe(7); // round(4*1.5)=6 < 4+3=7
  });
});

describe('effektiverZustand — Altbestand ohne box/stufe migriert, sonst unveraendert', () => {
  it('nie geuebt: Box 1, Stufe A, nicht eingefuehrt, sofort faellig', () => {
    const z = effektiverZustand(undefined, JETZT);
    expect(z).toEqual({ box: 1, faellig: JETZT, stufe: 'a', eingefuehrt: false });
  });

  it('Altbestand mit hoher bereinigter Quote, aber ohne box: wird eingefuehrt und auf Box 4 migriert', () => {
    const alt = STAND({ benennen: { versuche: 20, treffer: 20 } });
    const z = effektiverZustand(alt, JETZT);
    expect(z.eingefuehrt).toBe(true);
    expect(z.box).toBe(4);
  });

  it('ein bereits migrierter Stand behaelt seine Box unveraendert, auch bei niedriger Quote', () => {
    const migriert = STAND({ benennen: { versuche: 20, treffer: 1 }, box: 5 });
    expect(effektiverZustand(migriert, JETZT).box).toBe(5);
  });

  it('gesetzte Faelligkeit und Stufe bleiben erhalten', () => {
    const stand = STAND({ benennen: { versuche: 1, treffer: 1 }, faellig: JETZT + 5 * TAG, stufe: 'c' });
    const z = effektiverZustand(stand, JETZT);
    expect(z.faellig).toBe(JETZT + 5 * TAG);
    expect(z.stufe).toBe('c');
  });
});

describe('planeDurchgang — Groesse und Trennung', () => {
  it('bei ausreichendem Bestand: acht Abgefragte, vier Zusatzfläschchen, disjunkt', () => {
    const alle = aromen('a', 30);
    const staende = new Map<string, GesamtStand>(alle.map((a) => [a.id, STAND({ benennen: { versuche: 5, treffer: 5 }, box: 1, faellig: JETZT - TAG })]));
    const plan = planeDurchgang(alle, staende, JETZT);
    expect(plan.abgefragt).toHaveLength(DURCHGANG_GROESSE);
    expect(plan.zusatz).toHaveLength(4);
    const abgefragtIds = new Set(plan.abgefragt.map((a) => a.id));
    expect(plan.zusatz.every((z) => !abgefragtIds.has(z.id))).toBe(true);
  });
});

describe('planeDurchgang — Einfuehrungssperre (Lastenheft Abschnitt 7)', () => {
  it('bei ueber 30% in Box 1-2 werden keine neuen Aromen aufgenommen, obwohl welche verfuegbar waeren', () => {
    const eingefuehrt = aromen('alt', 20); // alle Box 1, faellig -> Sperre garantiert aktiv
    const neuKandidaten = aromen('neu', 3); // duerfen nicht gezogen werden
    const alle = [...eingefuehrt, ...neuKandidaten];
    const staende = new Map<string, GesamtStand>(
      eingefuehrt.map((a) => [a.id, STAND({ benennen: { versuche: 5, treffer: 5 }, box: 1, faellig: JETZT - TAG })]),
    );
    const plan = planeDurchgang(alle, staende, JETZT);
    expect(plan.abgefragt.some((a) => a.id.startsWith('neu'))).toBe(false);
    expect(plan.zusatz.some((a) => a.id.startsWith('neu'))).toBe(false);
  });
});

describe('planeDurchgang — Mischung ohne Sperre (Lastenheft Abschnitt 6)', () => {
  it('~50% faellig Box 1-2, ~30% faellig Box 3-5, bis zu 2 neue', () => {
    const niedrig = aromen('n', 3);
    const hoch = aromen('h', 9);
    const neuKandidaten = aromen('neu', 5);
    const alle = [...niedrig, ...hoch, ...neuKandidaten];
    const staende = new Map<string, GesamtStand>([
      ...niedrig.map((a): [string, GesamtStand] => [a.id, STAND({ benennen: { versuche: 5, treffer: 5 }, box: 1, faellig: JETZT - TAG })]),
      ...hoch.map((a): [string, GesamtStand] => [a.id, STAND({ benennen: { versuche: 5, treffer: 5 }, box: 4, faellig: JETZT - TAG })]),
    ]);
    // Anteil Box 1-2 an den eingefuehrten: 3/12 = 25% < 30% -> Einfuehrung erlaubt.
    const plan = planeDurchgang(alle, staende, JETZT, DURCHGANG_GROESSE, () => 0);
    expect(plan.abgefragt).toHaveLength(8);

    const niedrigIds = new Set(niedrig.map((a) => a.id));
    const hochIds = new Set(hoch.map((a) => a.id));
    const neuIds = new Set(neuKandidaten.map((a) => a.id));
    const gezogen = plan.abgefragt.map((a) => a.id);

    expect(gezogen.filter((id) => niedrigIds.has(id))).toHaveLength(3); // alle drei, es gibt nicht mehr
    expect(gezogen.filter((id) => hochIds.has(id))).toHaveLength(3);
    expect(gezogen.filter((id) => neuIds.has(id))).toHaveLength(2); // Obergrenze aus dem Lastenheft
  });
});

describe('planeDurchgang — Rueckstau-Fallback (Lastenheft Abschnitt 7)', () => {
  it('reicht die Zahl faelliger Aromen nicht, fuellt die Funktion trotzdem auf die Zielgroesse auf', () => {
    const faellig = aromen('f', 2);
    const nichtFaellig = aromen('s', 2);
    const alle = [...faellig, ...nichtFaellig];
    const staende = new Map<string, GesamtStand>([
      ...faellig.map((a): [string, GesamtStand] => [a.id, STAND({ benennen: { versuche: 5, treffer: 5 }, box: 1, faellig: JETZT - TAG })]),
      ...nichtFaellig.map((a): [string, GesamtStand] => [a.id, STAND({ benennen: { versuche: 5, treffer: 5 }, box: 1, faellig: JETZT + TAG })]),
    ]);
    const plan = planeDurchgang(alle, staende, JETZT, 4);
    expect(plan.abgefragt).toHaveLength(4);
    expect(new Set(plan.abgefragt.map((a) => a.id))).toEqual(new Set(alle.map((a) => a.id)));
    expect(plan.zusatz).toHaveLength(0); // der Bestand ist erschoepft — kein Absturz, nur ein leerer Rest
  });
});

describe('planeDurchgang — Zusatzfläschchen aus allen Boxen (Lastenheft Abschnitt 6)', () => {
  it('die Zusatzfläschchen stammen nicht aus nur einer Box', () => {
    const niedrig = aromen('n', 3);
    const hoch = aromen('h', 4);
    const alle = [...niedrig, ...hoch];
    const staende = new Map<string, GesamtStand>([
      ...niedrig.map((a): [string, GesamtStand] => [a.id, STAND({ benennen: { versuche: 5, treffer: 5 }, box: 1, faellig: JETZT - TAG })]),
      ...hoch.map((a): [string, GesamtStand] => [a.id, STAND({ benennen: { versuche: 5, treffer: 5 }, box: 4, faellig: JETZT - TAG })]),
    ]);
    // durchgangsGroesse 4 -> Zusatzanzahl 3, und genau 3 Aromen bleiben uebrig
    // (n3, h3, h4) — deren gesamter Pool wird genommen, unabhaengig vom Zufall.
    const plan = planeDurchgang(alle, staende, JETZT, 4);
    expect(new Set(plan.zusatz.map((a) => a.id))).toEqual(new Set(['n3', 'h3', 'h4']));
  });
});

describe('planeDurchgang — verwechselte Paare bevorzugt in denselben Durchgang (Lastenheft Abschnitt 6)', () => {
  it('ein dokumentiertes Verwechslungspaar rueckt gemeinsam vor eine sonst gleichrangige Konkurrenz', () => {
    const hoch = aromen('h', 4); // h1..h4, alle gleich ueberfaellig
    const staende = new Map<string, GesamtStand>(
      hoch.map((a): [string, GesamtStand] => [
        a.id,
        STAND({
          benennen: { versuche: 5, treffer: 5 },
          box: 4,
          faellig: JETZT - TAG,
          // h1 wurde dokumentiert oft mit h4 verwechselt — beide sollen
          // gemeinsam gezogen werden, nicht nur h1 allein.
          verwechslungen: a.id === 'h1' ? { h4: 2 } : {},
        }),
      ]),
    );
    const plan = planeDurchgang(hoch, staende, JETZT, 2);
    expect(new Set(plan.abgefragt.map((a) => a.id))).toEqual(new Set(['h1', 'h4']));
  });
});
