import { describe, it, expect } from 'vitest';
import { ermittleUebergaenge, chargenHinweis, driftHinweis } from './drift';

describe('ermittleUebergaenge — der jeweils erste Shot je Charge, chronologisch', () => {
  it('bildet Deltas zwischen aufeinanderfolgenden Chargen', () => {
    const shots = [
      { chargeId: 'c1', ts: 1, zeit: 30 },
      { chargeId: 'c1', ts: 2, zeit: 29 }, // nicht der erste der Charge, zaehlt nicht
      { chargeId: 'c2', ts: 10, zeit: 26 },
      { chargeId: 'c3', ts: 20, zeit: 24 },
    ];
    expect(ermittleUebergaenge(shots)).toEqual([{ deltaSekunden: -4 }, { deltaSekunden: -2 }]);
  });
});

describe('chargenHinweis — konzept.md:528', () => {
  it('"Neue Charge — die letzten beiden Male lief sie 4–6 s schneller" bei zwei schnelleren Wechseln', () => {
    const hinweis = chargenHinweis([{ deltaSekunden: -4 }, { deltaSekunden: -6 }]);
    expect(hinweis).toBe('Neue Charge — die letzten beiden Male lief sie 4–6 s schneller. Starte einen Schritt feiner.');
  });

  it('kein Hinweis bei nur einem schnelleren Wechsel', () => {
    expect(chargenHinweis([{ deltaSekunden: -4 }])).toBeUndefined();
  });

  it('kein Hinweis, wenn der vorletzte Wechsel langsamer war', () => {
    expect(chargenHinweis([{ deltaSekunden: 3 }, { deltaSekunden: -4 }])).toBeUndefined();
  });
});

describe('driftHinweis — die siebte Regelzeile, konzept.md:514', () => {
  it('feuert, wenn die Zeit schneller ist als jeder bisherige Shot UND das Urteil ok ist', () => {
    const hinweis = driftHinweis([28, 29, 30], 25, true);
    expect(hinweis).toContain('Drift oder neue Charge');
    expect(hinweis).toContain('als Alltagskorrektur');
  });

  it('feuert nicht bei "daneben"', () => {
    expect(driftHinweis([28, 29, 30], 25, false)).toBeUndefined();
  });

  it('feuert nicht innerhalb der bisherigen Messreihe', () => {
    expect(driftHinweis([28, 29, 30], 28.5, true)).toBeUndefined();
  });

  it('feuert nicht ohne Historie', () => {
    expect(driftHinweis([], 25, true)).toBeUndefined();
  });
});
