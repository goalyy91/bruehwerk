import { describe, it, expect } from 'vitest';
import { normiereZeitreihe, haeufigsteAromen, verschwundeneAuffaelligkeiten } from './auswertung';

describe('normiereZeitreihe', () => {
  it('leer bleibt leer', () => {
    expect(normiereZeitreihe([])).toEqual([]);
  });

  it('ein einzelner Punkt landet mittig', () => {
    expect(normiereZeitreihe([{ ts: 100, wert: 2 }])).toEqual([{ x: 0.5, wert: 2 }]);
  });

  it('mehrere Punkte normalisieren auf 0..1', () => {
    const ergebnis = normiereZeitreihe([
      { ts: 0, wert: 1 },
      { ts: 50, wert: 2 },
      { ts: 100, wert: 3 },
    ]);
    expect(ergebnis.map((p) => p.x)).toEqual([0, 0.5, 1]);
  });
});

describe('haeufigsteAromen', () => {
  it('zaehlt nach dem letzten Pfadglied und sortiert absteigend', () => {
    const ergebnis = haeufigsteAromen([
      { pfad: ['Fruchtig', 'Beere', 'Himbeere'] },
      { pfad: ['Fruchtig', 'Beere', 'Himbeere'] },
      { pfad: ['Süß', 'Vanille', 'Vanille'] },
    ]);
    expect(ergebnis[0]).toEqual({ label: 'Himbeere', anzahl: 2 });
    expect(ergebnis[1]).toEqual({ label: 'Vanille', anzahl: 1 });
  });

  it('schneidet bei limit ab', () => {
    const eintraege = Array.from({ length: 10 }, (_, i) => ({ pfad: [`Aroma ${i}`] }));
    expect(haeufigsteAromen(eintraege, 3)).toHaveLength(3);
  });
});

describe('verschwundeneAuffaelligkeiten', () => {
  it('unter zwei Verkostungen gibt es keine Aussage', () => {
    expect(verschwundeneAuffaelligkeiten([{ ts: 1, auffaelligkeitIds: ['papierig'] }])).toEqual([]);
  });

  it('eine Auffaelligkeit aus frueheren Verkostungen, die zuletzt nicht mehr auftrat', () => {
    const ergebnis = verschwundeneAuffaelligkeiten(
      [
        { ts: 1, auffaelligkeitIds: ['papierig'] },
        { ts: 2, auffaelligkeitIds: ['papierig'] },
        { ts: 3, auffaelligkeitIds: [] },
        { ts: 4, auffaelligkeitIds: [] },
      ],
      2,
    );
    expect(ergebnis).toEqual(['papierig']);
  });

  it('eine Auffaelligkeit, die auch zuletzt noch auftrat, gilt nicht als verschwunden', () => {
    const ergebnis = verschwundeneAuffaelligkeiten(
      [
        { ts: 1, auffaelligkeitIds: ['papierig'] },
        { ts: 2, auffaelligkeitIds: ['papierig'] },
        { ts: 3, auffaelligkeitIds: ['papierig'] },
      ],
      2,
    );
    expect(ergebnis).toEqual([]);
  });
});
