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
