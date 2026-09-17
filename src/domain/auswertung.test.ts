import { describe, it, expect } from 'vitest';
import { normiereReihe, achsMarken, haeufigsteAromen, verschwundeneAuffaelligkeiten } from './auswertung';

describe('normiereReihe', () => {
  it('leer bleibt leer', () => {
    expect(normiereReihe([])).toEqual([]);
  });

  it('ein einzelner Punkt landet mittig', () => {
    expect(normiereReihe([{ wert: 2 }])).toEqual([{ x: 0.5, wert: 2 }]);
  });

  it('mehrere Punkte verteilen sich gleichmaessig auf 0..1', () => {
    const ergebnis = normiereReihe([{ wert: 1 }, { wert: 2 }, { wert: 3 }]);
    expect(ergebnis.map((p) => p.x)).toEqual([0, 0.5, 1]);
  });

  /**
   * Der Fall, der die Kurve am 08.09.2026 zerlegt hat: 14 importierte Shots
   * im Minutenabstand, dann ein echter zwei Tage spaeter. Ueber die Zeit
   * gerechnet lagen die ersten 14 in den ersten 0,45 % der Breite.
   */
  it('ein spaeter Nachzuegler quetscht die frueheren nicht zusammen', () => {
    const ergebnis = normiereReihe([...Array(15)].map((_, i) => ({ wert: i })));
    expect(ergebnis[1]!.x).toBeCloseTo(1 / 14);
    expect(ergebnis[13]!.x).toBeCloseTo(13 / 14);
    expect(ergebnis[14]!.x).toBe(1);
  });
});

describe('achsMarken', () => {
  it('bei echter Spanne stehen drei Beschriftungen: min, Mitte, max', () => {
    expect(achsMarken(60, 70, String)).toEqual(['60', '65', '70']);
  });

  it('ein einziger Messwert ergibt nur die mittlere Beschriftung, nicht dieselbe Zahl dreimal', () => {
    expect(achsMarken(65, 65, String)).toEqual(['', '65', '']);
  });

  /**
   * Der Fall, der muster/Verlaufskurve.svelte am 17.09.2026 abstuerzen liess:
   * zwei verschiedene Mahlgrade koennen nach dem Runden auf die
   * Muehlen-Schrittweite denselben Text ergeben (64 und 65 Klicks, Mitte
   * 64,5 -> "65"). Zwei gleiche Beschriftungen sind hier ein zulaessiges
   * Ergebnis — die Kurve muss sie aushalten (Fix dort: kein Schluessel mehr
   * auf dem Beschriftungstext), nicht diese Funktion sie vermeiden.
   */
  it('darf zwei gleiche Beschriftungen liefern, wenn die Formatierung sie zusammenrundet', () => {
    const rundeAufGanzzahl = (wert: number) => String(Math.round(wert));
    expect(achsMarken(64, 65, rundeAufGanzzahl)).toEqual(['64', '65', '65']);
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

  it('zaehlt ueber kanonischesLabel zusammen, wenn der Aufrufer es mitgibt (K55)', () => {
    // Ein Le-Nez-Flaeschchen ("Heidelbeere") und ein SCA-Eintrag ("Blaubeere")
    // meinen denselben Geruch — Profilblatt.svelte loest das ueber
    // daten/aromen.ts::kanonischesAromaLabel auf, bevor es hier ankommt.
    const ergebnis = haeufigsteAromen([
      { pfad: ['Fruchtig', 'Beere', 'Heidelbeere'], kanonischesLabel: 'Blaubeere' },
      { pfad: ['Fruchtig', 'Beere', 'Blaubeere'], kanonischesLabel: 'Blaubeere' },
      { pfad: ['Fruchtig', 'Beere', 'Himbeere'], kanonischesLabel: 'Himbeere' },
    ]);
    expect(ergebnis[0]).toEqual({ label: 'Blaubeere', anzahl: 2 });
    expect(ergebnis[1]).toEqual({ label: 'Himbeere', anzahl: 1 });
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
