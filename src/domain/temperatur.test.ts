import { describe, it, expect } from 'vitest';
import { kesselZuGruppe, gruppeZuKessel, type TempReferenzPunkt } from './temperatur';

// Startbelegung aus stammdaten.ts: Kessel - 27 K (grob 1:1 im genutzten Bereich).
const GESCHAETZT: TempReferenzPunkt[] = [
  { kt: 119, gruppe: 92, herkunft: 'geschaetzt' },
  { kt: 120, gruppe: 93, herkunft: 'geschaetzt' },
  { kt: 121, gruppe: 94, herkunft: 'geschaetzt' },
];

describe('kesselZuGruppe', () => {
  it('interpoliert linear zwischen zwei Messpunkten', () => {
    const ergebnis = kesselZuGruppe(GESCHAETZT, 119.5);
    expect(ergebnis).toEqual({ bekannt: true, wert: 92.5, herkunft: 'geschaetzt' });
  });

  it('trifft einen Messpunkt exakt', () => {
    expect(kesselZuGruppe(GESCHAETZT, 120)).toEqual({ bekannt: true, wert: 93, herkunft: 'geschaetzt' });
  });

  it('extrapoliert nicht — ausserhalb der Reihe kommt kein Wert', () => {
    expect(kesselZuGruppe(GESCHAETZT, 125)).toEqual({ bekannt: false, grund: 'ausserhalb-messreihe' });
    expect(kesselZuGruppe(GESCHAETZT, 100)).toEqual({ bekannt: false, grund: 'ausserhalb-messreihe' });
  });

  it('leere Reihe ist immer ausserhalb', () => {
    expect(kesselZuGruppe([], 120)).toEqual({ bekannt: false, grund: 'ausserhalb-messreihe' });
  });
});

describe('gruppeZuKessel — rueckwaerts lesen', () => {
  it('sagt, welche Kesseltemperatur eine Roester-Empfehlung bei mir ist', () => {
    expect(gruppeZuKessel(GESCHAETZT, 93)).toEqual({ bekannt: true, wert: 120, herkunft: 'geschaetzt' });
  });

  it('interpoliert auch rueckwaerts', () => {
    const ergebnis = gruppeZuKessel(GESCHAETZT, 92.5);
    expect(ergebnis.bekannt).toBe(true);
    if (ergebnis.bekannt) expect(ergebnis.wert).toBeCloseTo(119.5);
  });

  it('extrapoliert nicht rueckwaerts', () => {
    expect(gruppeZuKessel(GESCHAETZT, 100)).toEqual({ bekannt: false, grund: 'ausserhalb-messreihe' });
  });
});

describe('nur Zeilen gleicher Herkunft werden verglichen', () => {
  const GEMISCHT: TempReferenzPunkt[] = [
    { kt: 119, gruppe: 92, herkunft: 'geschaetzt' },
    { kt: 121, gruppe: 94, herkunft: 'geschaetzt' },
    { kt: 122, gruppe: 96, herkunft: 'gemessen' },
    { kt: 124, gruppe: 98, herkunft: 'gemessen' },
  ];

  it('interpoliert innerhalb der gemessenen Gruppe, nicht ueber die geschaetzte hinweg', () => {
    const ergebnis = kesselZuGruppe(GEMISCHT, 123);
    expect(ergebnis).toEqual({ bekannt: true, wert: 97, herkunft: 'gemessen' });
  });

  it('ein Punkt zwischen den Gruppen (121-122) faellt durch beide Raster', () => {
    expect(kesselZuGruppe(GEMISCHT, 121.5)).toEqual({ bekannt: false, grund: 'ausserhalb-messreihe' });
  });

  it('behaelt die Herkunft der jeweiligen Gruppe im Ergebnis', () => {
    const geschaetzt = kesselZuGruppe(GEMISCHT, 120);
    expect(geschaetzt).toEqual({ bekannt: true, wert: 93, herkunft: 'geschaetzt' });
  });
});
