import { describe, it, expect } from 'vitest';
import { bildeMessreihe, innerhalbMessreihe, messreiheSatz } from './messreihe';

describe('bildeMessreihe', () => {
  it('leere Reihe ist undefined — "kein Punkt", kein Nullwert', () => {
    expect(bildeMessreihe([])).toBeUndefined();
  });

  it('ein einzelner Shot ist trotzdem eine gueltige Reihe — keine Mindestzahl', () => {
    expect(bildeMessreihe([36])).toEqual({ min: 36, max: 36, anzahl: 1 });
  });

  it('Min/Max ueber mehrere Shots, unabhaengig von der Reihenfolge', () => {
    expect(bildeMessreihe([36, 30, 42, 38])).toEqual({ min: 30, max: 42, anzahl: 4 });
  });
});

describe('innerhalbMessreihe', () => {
  const REIHE = { min: 30, max: 42, anzahl: 4 };

  it('Werte am Rand zaehlen als innerhalb', () => {
    expect(innerhalbMessreihe(REIHE, 30)).toBe(true);
    expect(innerhalbMessreihe(REIHE, 42)).toBe(true);
  });

  it('ausserhalb ist ausserhalb', () => {
    expect(innerhalbMessreihe(REIHE, 29.9)).toBe(false);
    expect(innerhalbMessreihe(REIHE, 42.1)).toBe(false);
  });

  it('ohne Reihe gibt es nichts, wogegen zu pruefen waere', () => {
    expect(innerhalbMessreihe(undefined, 100)).toBe(true);
  });
});

describe('messreiheSatz — K67/K75: ein Satz, keine Zahl allein', () => {
  it('nennt die Reihe mit Einheit', () => {
    expect(messreiheSatz({ min: 30, max: 42, anzahl: 4 }, 'g')).toBe('30 bis 42 g');
  });
});
