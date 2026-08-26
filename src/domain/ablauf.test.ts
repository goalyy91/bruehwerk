import { describe, it, expect } from 'vitest';
import { dauerFuerSetup, geschaetzteDauer, reihenfolge, type AblaufFuerSetup, type ReihenfolgeDurchgang } from './ablauf';

describe('dauerFuerSetup — ohne hinterlegte Schritte keine erfundene Zahl', () => {
  const LEER: AblaufFuerSetup = { schritte: [], buendel: [] };

  it('liefert 0 fuer einen leeren Ablauf (heutiger Zustand jedes Setups)', () => {
    expect(dauerFuerSetup(LEER, 3)).toBe(0);
  });

  it('liefert 0 ohne Durchgaenge', () => {
    const ablauf: AblaufFuerSetup = { schritte: [{ id: 's1', dauer: 30 }], buendel: [] };
    expect(dauerFuerSetup(ablauf, 0)).toBe(0);
  });
});

describe('dauerFuerSetup — Buendelung', () => {
  const ABLAUF: AblaufFuerSetup = {
    schritte: [
      { id: 'muehle-einstellen', dauer: 20 },
      { id: 'tampern', dauer: 10 },
    ],
    buendel: [{ schrittIds: ['muehle-einstellen'], dauer: 20 }],
  };

  it('ein gebuendelter Schritt faellt nur einmal an, unabhaengig von der Zahl der Durchgaenge', () => {
    // tampern (10s) x 3 Durchgaenge + einmal muehle-einstellen (20s)
    expect(dauerFuerSetup(ABLAUF, 3)).toBe(10 * 3 + 20);
  });

  it('bei einem einzigen Durchgang ist der Unterschied zur Summe noch nicht sichtbar', () => {
    expect(dauerFuerSetup(ABLAUF, 1)).toBe(10 + 20);
  });
});

describe('geschaetzteDauer — Summe ueber mehrere Setups', () => {
  it('ein Setup ohne hinterlegten Ablauf traegt 0 bei', () => {
    const ergebnis = geschaetzteDauer([{ setupId: 'unbekannt', anzahlDurchgaenge: 2 }], new Map());
    expect(ergebnis).toBe(0);
  });

  it('summiert ueber mehrere Setups', () => {
    const ablaufProSetup = new Map<string, AblaufFuerSetup>([
      ['s1', { schritte: [{ id: 'a', dauer: 30 }], buendel: [] }],
      ['s2', { schritte: [{ id: 'b', dauer: 10 }], buendel: [] }],
    ]);
    const ergebnis = geschaetzteDauer(
      [
        { setupId: 's1', anzahlDurchgaenge: 2 },
        { setupId: 's2', anzahlDurchgaenge: 1 },
      ],
      ablaufProSetup,
    );
    expect(ergebnis).toBe(30 * 2 + 10);
  });
});

describe('reihenfolge — lange Pole zuerst, dann Setup gruppiert, dann empfindlichstes zuletzt', () => {
  const D: ReihenfolgeDurchgang[] = [
    { id: 'espresso-hart', bruehgeraetTyp: 'espresso', setupId: 'espresso', empfindlichkeit: 9 },
    { id: 'pourover', bruehgeraetTyp: 'pourover', setupId: 'pourover', empfindlichkeit: 3 },
    { id: 'espresso-milch', bruehgeraetTyp: 'espresso', setupId: 'espresso', empfindlichkeit: 5 },
  ];

  it('Pour Over steht vor beiden Espresso-Durchgaengen', () => {
    const ergebnis = reihenfolge(D);
    expect(ergebnis[0]!.id).toBe('pourover');
  });

  it('innerhalb desselben Setups steht das empfindlichere zuletzt', () => {
    const ergebnis = reihenfolge(D);
    const espressoReihenfolge = ergebnis.filter((d) => d.setupId === 'espresso').map((d) => d.id);
    expect(espressoReihenfolge).toEqual(['espresso-milch', 'espresso-hart']);
  });

  it('ist eine reine Funktion — die Eingabe bleibt unveraendert', () => {
    const kopie = [...D];
    reihenfolge(D);
    expect(D).toEqual(kopie);
  });
});
