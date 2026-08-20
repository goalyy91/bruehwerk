import { describe, it, expect } from 'vitest';
import {
  pruefeSpielraum,
  istEingestellt,
  SPIELRAUM_VORGABE,
  type Spielraum,
} from './spielraum';

describe('Spielraum-Vorgabe aus dem Konzept', () => {
  it('ist Zeit +/- 2 s, Output +/- 0,4 g, Durchlaufzeit +/- 5 s', () => {
    expect(SPIELRAUM_VORGABE).toEqual({ zeit: 2, output: 0.4, durchlaufzeit: 5 });
  });
});

describe('Streuung erzeugt keinen Befund', () => {
  it('meldet 2 s Unterschied bei Zeit nicht', () => {
    expect(pruefeSpielraum('zeit', 30, 32).innerhalb).toBe(true);
    expect(pruefeSpielraum('zeit', 30, 28).innerhalb).toBe(true);
  });

  it('meldet 0,4 g Unterschied bei Output nicht — trotz Fliesskomma', () => {
    expect(pruefeSpielraum('output', 40, 40.4).innerhalb).toBe(true);
    expect(pruefeSpielraum('output', 40, 39.6).innerhalb).toBe(true);
  });

  it('meldet 5 s Unterschied bei Durchlaufzeit nicht', () => {
    expect(pruefeSpielraum('durchlaufzeit', 165, 170).innerhalb).toBe(true);
  });
});

describe('ausserhalb des Spielraums', () => {
  it('meldet als Satz, nicht als Zahl', () => {
    const befund = pruefeSpielraum('zeit', 30, 35);
    expect(befund.innerhalb).toBe(false);
    if (befund.innerhalb) throw new Error('unerwartet innerhalb');
    expect(befund.richtung).toBe('ueber');
    expect(befund.satz).toBe('lief laenger als geplant');
    // Der Satz darf die Abweichung nicht beziffern.
    expect(befund.satz).not.toMatch(/\d/);
  });

  it('unterscheidet ueber und unter', () => {
    const zuSchnell = pruefeSpielraum('zeit', 30, 25);
    if (zuSchnell.innerhalb) throw new Error('unerwartet innerhalb');
    expect(zuSchnell.richtung).toBe('unter');
    expect(zuSchnell.satz).toBe('lief schneller als geplant');
  });

  it('greift knapp jenseits der Grenze', () => {
    expect(pruefeSpielraum('output', 40, 40.5).innerhalb).toBe(false);
    expect(pruefeSpielraum('zeit', 30, 32.5).innerhalb).toBe(false);
  });
});

describe('Spielraum ist je Profil pflegbar', () => {
  it('nimmt einen abweichenden Spielraum an', () => {
    const eng: Spielraum = { zeit: 1, output: 0.2, durchlaufzeit: 3 };
    expect(pruefeSpielraum('zeit', 30, 32, eng).innerhalb).toBe(false);
    expect(pruefeSpielraum('zeit', 30, 31, eng).innerhalb).toBe(true);
  });
});

describe('eingestellte Groessen', () => {
  it('erkennt Input und Mahlgrad als eingestellt', () => {
    expect(istEingestellt('input')).toBe(true);
    expect(istEingestellt('mg')).toBe(true);
  });

  it('zaehlt gemessene Groessen nicht dazu', () => {
    expect(istEingestellt('zeit')).toBe(false);
    expect(istEingestellt('output')).toBe(false);
    expect(istEingestellt('durchlaufzeit')).toBe(false);
  });
});
