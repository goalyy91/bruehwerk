import { describe, it, expect } from 'vitest';
import { trefferquote, gewicht, naechstesAroma, type TrefferStand, type AromaOption } from './uebung';

describe('trefferquote', () => {
  it('ist 0 ohne Versuche', () => {
    expect(trefferquote(undefined)).toBe(0);
    expect(trefferquote({ versuche: 0, treffer: 0 })).toBe(0);
  });

  it('rechnet Treffer durch Versuche', () => {
    expect(trefferquote({ versuche: 4, treffer: 1 })).toBe(0.25);
  });
});

describe('gewicht — bevorzugt, was zuletzt nicht getroffen wurde', () => {
  it('noch nie geuebt bekommt volles Gewicht', () => {
    expect(gewicht(undefined)).toBe(1);
  });

  it('schlechte Quote bekommt hohes Gewicht', () => {
    const schlecht: TrefferStand = { versuche: 4, treffer: 0 };
    expect(gewicht(schlecht)).toBe(1);
  });

  it('perfekte Quote faellt nicht auf 0 — Mindestgewicht bleibt', () => {
    const perfekt: TrefferStand = { versuche: 10, treffer: 10 };
    expect(gewicht(perfekt)).toBeGreaterThan(0);
    expect(gewicht(perfekt)).toBeCloseTo(0.15);
  });

  it('mittlere Quote liegt dazwischen', () => {
    const mittel: TrefferStand = { versuche: 4, treffer: 2 };
    expect(gewicht(mittel)).toBeCloseTo(0.5);
  });
});

describe('naechstesAroma — gewichtete Ziehung', () => {
  const AROMEN: AromaOption[] = [
    { id: 'a', label: 'A' },
    { id: 'b', label: 'B' },
  ];

  it('ohne Aromen gibt es nichts zu ziehen', () => {
    expect(naechstesAroma([], new Map())).toBeUndefined();
  });

  it('zufall() = 0 trifft immer das erste Gewicht', () => {
    const staende = new Map<string, TrefferStand>();
    expect(naechstesAroma(AROMEN, staende, () => 0)?.id).toBe('a');
  });

  it('ein Aroma mit hoher Trefferquote hat weniger Anteil an der Ziehung', () => {
    const staende = new Map<string, TrefferStand>([
      ['a', { versuche: 10, treffer: 10 }], // Gewicht 0.15
      ['b', { versuche: 0, treffer: 0 }], // Gewicht 1
    ]);
    // Summe 1.15 — bei zufall() knapp ueber a-Anteil (0.15/1.15) faellt die
    // Ziehung schon auf b.
    const grenze = 0.15 / 1.15;
    expect(naechstesAroma(AROMEN, staende, () => grenze + 0.01)?.id).toBe('b');
    expect(naechstesAroma(AROMEN, staende, () => grenze - 0.01)?.id).toBe('a');
  });
});
