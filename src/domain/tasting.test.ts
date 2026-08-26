import { describe, it, expect } from 'vitest';
import { GROESSEN, balanceAbstand, berechneBalance, berechneKomplexitaet, berechneGesamt } from './tasting';

describe('GROESSEN aus dem Konzept', () => {
  it('sind sechs, in Bogen-Reihenfolge (konzept.md:798-804)', () => {
    expect(GROESSEN.map((g) => g.id)).toEqual(['saeure', 'koerper', 'bitterkeit', 'aroma', 'suesse', 'nachklang']);
  });

  it('die drei bipolaren zuerst, dann die drei einseitigen', () => {
    expect(GROESSEN.slice(0, 3).every((g) => g.art === 'bipolar')).toBe(true);
    expect(GROESSEN.slice(3).every((g) => g.art === 'einseitig')).toBe(true);
  });

  it('jede Groesse traegt genau fuenf Woerter', () => {
    for (const g of GROESSEN) expect(g.woerter).toHaveLength(5);
  });
});

describe('Balance — mittlerer Abstand der bipolaren Groessen zur Mitte', () => {
  it('ist 0, wenn alle drei auf der Mitte stehen', () => {
    expect(balanceAbstand({ saeure: 2, koerper: 2, bitterkeit: 2 })).toBe(0);
    expect(berechneBalance({ saeure: 2, koerper: 2, bitterkeit: 2 })).toBe('ausgewogen');
  });

  it('ist 2, wenn alle drei an einem Rand stehen', () => {
    expect(balanceAbstand({ saeure: 0, koerper: 0, bitterkeit: 0 })).toBe(2);
    expect(berechneBalance({ saeure: 4, koerper: 4, bitterkeit: 4 })).toBe('weit vom Ziel');
  });

  it('mittelt ueber alle drei, nicht nur eine', () => {
    // Abstaende 0, 1, 2 -> Mittel 1
    expect(balanceAbstand({ saeure: 2, koerper: 1, bitterkeit: 0 })).toBe(1);
    expect(berechneBalance({ saeure: 2, koerper: 1, bitterkeit: 0 })).toBe('leicht betont');
  });
});

describe('Komplexitaet — aus der Zahl der gefundenen Aromen', () => {
  it('keine Aromen', () => {
    expect(berechneKomplexitaet(0)).toBe('keine Aromen');
  });

  it('wenige Aromen sind einfach', () => {
    expect(berechneKomplexitaet(1)).toBe('einfach');
    expect(berechneKomplexitaet(2)).toBe('einfach');
  });

  it('mehr Aromen werden vielschichtig, dann komplex', () => {
    expect(berechneKomplexitaet(3)).toBe('vielschichtig');
    expect(berechneKomplexitaet(5)).toBe('vielschichtig');
    expect(berechneKomplexitaet(6)).toBe('komplex');
  });
});

describe('Gesamt — kommt aus dem Shot-Urteil, keine zweite Note (K38)', () => {
  it('gibt das Urteilswort zurueck', () => {
    expect(berechneGesamt('daneben')).toBe('daneben');
    expect(berechneGesamt('okay')).toBe('okay');
    expect(berechneGesamt('sehr gut')).toBe('sehr gut');
  });

  it('referenz wird fuer die Anzeige grossgeschrieben, wie in Urteil.svelte', () => {
    expect(berechneGesamt('referenz')).toBe('Referenz');
  });
});
