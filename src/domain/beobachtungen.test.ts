import { describe, it, expect } from 'vitest';
import { normalisiere, zaehle, offeneBeobachtungen, SCHWELLE } from './beobachtungen';

describe('normalisiere — konzept.md:465-474', () => {
  it('"zu Holzig!" und "holzige" ergeben denselben Begriff', () => {
    expect(normalisiere('zu Holzig!')).toBe('holzig');
    expect(normalisiere('holzige')).toBe('holzig');
    expect(normalisiere('holziger')).toBe('holzig');
  });

  it('loest Umlaute auf', () => {
    expect(normalisiere('säuerlich')).toBe('saeuerlich');
  });

  it('leerer Text ergibt einen leeren Begriff', () => {
    expect(normalisiere('   ')).toBe('');
  });
});

describe('zaehle', () => {
  it('zaehlt je normalisiertem Begriff, sortiert nach Haeufigkeit', () => {
    const h = zaehle(['holzig', 'zu Holzig!', 'bitter', 'holzige']);
    expect(h).toEqual([
      { begriff: 'holzig', anzahl: 3 },
      { begriff: 'bitter', anzahl: 1 },
    ]);
  });
});

describe('offeneBeobachtungen — Schwelle 3, ignoriert und alias', () => {
  const shots = [
    { id: 's1', freitext: 'holzig' },
    { id: 's2', freitext: 'zu Holzig!' },
    { id: 's3', freitext: 'bitter' },
    { id: 's4', freitext: 'holzige' },
  ];

  it('SCHWELLE ist 3, wie im Konzept', () => {
    expect(SCHWELLE).toBe(3);
  });

  it('meldet erst ab drei Vorkommen', () => {
    const b = offeneBeobachtungen(shots);
    expect(b).toEqual([{ begriff: 'holzig', anzahl: 3, shotIds: ['s1', 's2', 's4'] }]);
  });

  it('ignoriert zaehlt endgueltig nicht mehr mit', () => {
    const b = offeneBeobachtungen(shots, [{ begriff: 'holzig', entscheidung: 'ignoriert' }]);
    expect(b).toEqual([]);
  });

  it('bereits als Chip angelegt zaehlt nicht mehr als offen', () => {
    const b = offeneBeobachtungen(shots, [{ begriff: 'holzig', entscheidung: 'chip' }]);
    expect(b).toEqual([]);
  });

  it('alias faltet einen Begriff in einen anderen', () => {
    const mitAlias = [...shots, { id: 's5', freitext: 'papierig' }, { id: 's6', freitext: 'papierig' }];
    const b = offeneBeobachtungen(mitAlias, [{ begriff: 'papierig', entscheidung: 'alias', zielBegriff: 'holzig' }]);
    expect(b).toHaveLength(1);
    expect(b[0]?.anzahl).toBe(5);
  });

  it('kein Freitext bedeutet keine Beobachtung', () => {
    expect(offeneBeobachtungen([{ id: 's1' }, { id: 's2' }])).toEqual([]);
  });
});
