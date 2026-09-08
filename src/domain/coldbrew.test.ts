import { describe, it, expect } from 'vitest';
import { verhaeltnisZahl, ertragMl, fertigAbZeitpunkt } from './coldbrew';

describe('verhaeltnisZahl', () => {
  it('liest die zweite Zahl aus "1:15"', () => {
    expect(verhaeltnisZahl('1:15')).toBe(15);
  });

  it('liefert undefined bei einem Format ohne Doppelpunkt', () => {
    expect(verhaeltnisZahl('15')).toBeUndefined();
  });
});

describe('ertragMl — Absorption des Kaffeesatzes (konzept.md:953)', () => {
  it('60 g bei 1:15 ergeben 780 ml, nicht 900', () => {
    expect(ertragMl(60, 15)).toBe(780);
  });

  it('skaliert linear mit dem Input', () => {
    expect(ertragMl(120, 15)).toBe(1560);
  });
});

describe('fertigAbZeitpunkt', () => {
  it('16 Stunden nach dem Ansetzen', () => {
    const angesetzt = Date.UTC(2026, 0, 1, 20, 0);
    const erwartet = Date.UTC(2026, 0, 2, 12, 0);
    expect(fertigAbZeitpunkt(angesetzt, 16)).toBe(erwartet);
  });
});
