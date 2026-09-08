import { describe, it, expect } from 'vitest';
import { gesamtwasser, verhaeltnis, umrechnen, type GussplanBaustein } from './gussplan';

// Das Beispiel aus der Bildschirm-Skizze in docs/konzept.md,
// "Pour Over: der Gussplan": Bloom 50 g, dann kumulativ auf 150 g,
// dann auf 300 g. Kopfzeile dort: "18 g · 300 g · 1:16,7".
const KUMULATIV: GussplanBaustein[] = [
  { typ: 'vorbereiten' },
  { typ: 'bloom', menge: 50 },
  { typ: 'agitation' },
  { typ: 'guss', zielmenge: 150 },
  { typ: 'guss', zielmenge: 300 },
  { typ: 'warten' },
];

describe('gesamtwasser', () => {
  it('kumulativ: die laufende Summe endet beim letzten Guss', () => {
    expect(gesamtwasser(KUMULATIV, 'kumulativ')).toBe(300);
  });

  it('inkrementell: Bloom plus alle Zuwaechse addieren sich', () => {
    const inkrementell: GussplanBaustein[] = [
      { typ: 'bloom', menge: 50 },
      { typ: 'guss', zielmenge: 100 },
      { typ: 'guss', zielmenge: 150 },
    ];
    expect(gesamtwasser(inkrementell, 'inkrementell')).toBe(300);
  });

  it('Bypass zaehlt mit', () => {
    const mitBypass: GussplanBaustein[] = [
      { typ: 'bloom', menge: 50 },
      { typ: 'guss', zielmenge: 300 },
      { typ: 'bypass', menge: 20 },
    ];
    expect(gesamtwasser(mitBypass, 'kumulativ')).toBe(320);
  });
});

describe('verhaeltnis', () => {
  it('18 g auf 300 g ist 1:16,7', () => {
    expect(verhaeltnis(18, 300)).toBe('1:16,7');
  });

  it('Input 0 ergibt einen Platzhalter statt einer Division durch 0', () => {
    expect(verhaeltnis(0, 300)).toBe('—');
  });
});

describe('umrechnen — dieselbe Wassermenge, andere Sprache', () => {
  it('kumulativ -> inkrementell liefert die Zuwaechse', () => {
    const ergebnis = umrechnen(KUMULATIV, 'kumulativ', 'inkrementell');
    const guesse = ergebnis.filter((b) => b.typ === 'guss');
    expect(guesse).toEqual([
      { typ: 'guss', zielmenge: 100 }, // 150 - 50 (Bloom)
      { typ: 'guss', zielmenge: 150 }, // 300 - 150
    ]);
  });

  it('hin und zurueck ergibt wieder die Ausgangswerte', () => {
    const hin = umrechnen(KUMULATIV, 'kumulativ', 'inkrementell');
    const zurueck = umrechnen(hin, 'inkrementell', 'kumulativ');
    expect(zurueck).toEqual(KUMULATIV);
  });

  it('gleiche Lesart auf beiden Seiten aendert nichts', () => {
    expect(umrechnen(KUMULATIV, 'kumulativ', 'kumulativ')).toEqual(KUMULATIV);
  });

  it('Gesamtwasser ist in beiden Lesarten identisch', () => {
    const inkrementell = umrechnen(KUMULATIV, 'kumulativ', 'inkrementell');
    expect(gesamtwasser(inkrementell, 'inkrementell')).toBe(gesamtwasser(KUMULATIV, 'kumulativ'));
  });
});
