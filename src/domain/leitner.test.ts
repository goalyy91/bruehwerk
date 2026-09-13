import { describe, it, expect } from 'vitest';
import { INTERVALL_TAGE, naechsteFaelligkeit, bewegeBox, starkUeberfaellig, startBox, istEingefuehrt, einfuehrungErlaubt, type Box } from './leitner';
import type { GesamtStand, TrefferStand } from './uebung';

const LEER: TrefferStand = { versuche: 0, treffer: 0 };
const STAND = (ueber: Partial<GesamtStand> = {}): GesamtStand => ({
  benennen: LEER,
  unterscheiden: LEER,
  verwechslungen: {},
  ...ueber,
});

const TAG = 24 * 60 * 60 * 1000;
const JETZT = 1_700_000_000_000;

describe('INTERVALL_TAGE — die Erwartungswerte aus dem Lastenheft, Abschnitt 5', () => {
  it('fünf Boxen, genau diese Tage', () => {
    expect(INTERVALL_TAGE).toEqual({ 1: 0, 2: 2, 3: 5, 4: 12, 5: 30 });
  });
});

describe('naechsteFaelligkeit', () => {
  it('Box 1 ist sofort wieder fällig', () => {
    expect(naechsteFaelligkeit(1, JETZT)).toBe(JETZT);
  });

  it('Box 3 ist in 5 Tagen fällig', () => {
    expect(naechsteFaelligkeit(3, JETZT)).toBe(JETZT + 5 * TAG);
  });

  it('Box 5 ist in 30 Tagen fällig', () => {
    expect(naechsteFaelligkeit(5, JETZT)).toBe(JETZT + 30 * TAG);
  });
});

describe('bewegeBox', () => {
  it('richtig bewegt eine Box hoch', () => {
    expect(bewegeBox(2, 'richtig')).toBe(3);
  });

  it('richtig auf Box 5 bleibt auf Box 5 — es gibt keine sechste', () => {
    expect(bewegeBox(5, 'richtig')).toBe(5);
  });

  it('falsch wirft immer auf Box 1 zurück, unabhängig vom Ausgangspunkt', () => {
    expect(bewegeBox(4, 'falsch')).toBe(1);
    expect(bewegeBox(1, 'falsch')).toBe(1);
  });

  it('Teilerfolg (Familie richtig, Aroma falsch) bewegt genau eine Box runter, nicht auf Null', () => {
    expect(bewegeBox(3, 'teilweise')).toBe(2);
  });

  it('Teilerfolg auf Box 1 bleibt auf Box 1', () => {
    expect(bewegeBox(1, 'teilweise')).toBe(1);
  });
});

describe('starkUeberfaellig — Rückstufung nach langer Pause, Lastenheft Abschnitt 7', () => {
  it('nicht überfällig ist nicht "stark überfällig"', () => {
    const faellig = JETZT + TAG; // liegt noch in der Zukunft
    expect(starkUeberfaellig(3, faellig, JETZT)).toBe(false);
  });

  it('Box 3 (Intervall 5 Tage): 4 Tage überfällig ist noch nicht "mehr als doppelt so lang"', () => {
    const faellig = JETZT - 4 * TAG;
    expect(starkUeberfaellig(3, faellig, JETZT)).toBe(false);
  });

  it('Box 3 (Intervall 5 Tage): 6 Tage überfällig ist "mehr als doppelt so lang"', () => {
    const faellig = JETZT - 6 * TAG;
    expect(starkUeberfaellig(3, faellig, JETZT)).toBe(true);
  });

  it('Box 1 (Intervall 0): jede Verspätung zählt sofort als stark überfällig', () => {
    const faellig = JETZT - 1000;
    expect(starkUeberfaellig(1, faellig, JETZT)).toBe(true);
  });
});

describe('startBox — Übernahme des Altbestands aus der bereinigten Trefferquote', () => {
  it('ohne jeden Versuch: Box 1', () => {
    expect(startBox(STAND())).toBe(1);
  });

  it('hohe bereinigte Quote landet auf Box 4, nicht auf Box 5 — die alte Zählung belegt keine 30-Tage-Festigkeit', () => {
    const stand = STAND({ benennen: { versuche: 20, treffer: 20 } }); // Quote 1.0 nach Bereinigung
    expect(startBox(stand)).toBe(4);
  });

  it('mittlere Quote landet auf Box 2 oder 3, abgestuft', () => {
    // bereinigte Quote bei 'benennen' (Ratewahrscheinlichkeit 1/60): (0.7 - 1/60) / (1 - 1/60) ≈ 0.695
    const mittel = STAND({ benennen: { versuche: 20, treffer: 14 } });
    expect(startBox(mittel)).toBe(3);
  });

  it('schwache Quote landet auf Box 1', () => {
    const schwach = STAND({ benennen: { versuche: 20, treffer: 2 } });
    expect(startBox(schwach)).toBe(1);
  });
});

describe('istEingefuehrt', () => {
  it('ohne jeden Versuch: nicht eingeführt', () => {
    expect(istEingefuehrt(STAND())).toBe(false);
  });

  it('ein einziger Versuch in irgendeiner Aufgabenart reicht', () => {
    expect(istEingefuehrt(STAND({ unterscheiden: { versuche: 1, treffer: 0 } }))).toBe(true);
  });
});

describe('einfuehrungErlaubt — Sperre bei 30 % in Box 1–2, Lastenheft Abschnitt 7', () => {
  it('ohne eingeführte Aromen ist die Sperre nie aktiv', () => {
    expect(einfuehrungErlaubt([])).toBe(true);
  });

  it('unter 30 % in Box 1–2: Einführung erlaubt', () => {
    const boxen: Box[] = [1, 3, 3, 4, 5, 5, 5, 5, 5, 5]; // 10 %
    expect(einfuehrungErlaubt(boxen)).toBe(true);
  });

  it('genau an der Schwelle (30 %) ist die Sperre schon aktiv — "weniger als 30 %" ist strikt', () => {
    const boxen: Box[] = [1, 1, 1, 4, 4, 4, 4, 4, 4, 4]; // genau 30 %
    expect(einfuehrungErlaubt(boxen)).toBe(false);
  });

  it('über 30 % in Box 1–2: Einführung gesperrt', () => {
    const boxen: Box[] = [1, 1, 1, 1, 2, 4, 4, 4, 4, 4]; // 50 %
    expect(einfuehrungErlaubt(boxen)).toBe(false);
  });
});
