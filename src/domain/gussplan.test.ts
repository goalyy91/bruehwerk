import { describe, it, expect } from 'vitest';
import { gesamtwasser, verhaeltnis, umrechnen, bausteinZeile, type GussplanBaustein } from './gussplan';

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

describe('bausteinZeile — dieselbe Formatierung fuer Editor und Ansicht', () => {
  it('vorbereiten: die angehakten Schritte, oder ein Platzhalter', () => {
    expect(bausteinZeile({ typ: 'vorbereiten', filterSpuelen: true, gefaessVorwaermen: true }, 'kumulativ')).toBe(
      'Filter spülen · Gefäß vorwärmen',
    );
    expect(bausteinZeile({ typ: 'vorbereiten', filterSpuelen: false, gefaessVorwaermen: false }, 'kumulativ')).toBe('—');
  });

  it('bloom: Menge und Dauer', () => {
    expect(bausteinZeile({ typ: 'bloom', menge: 50, dauer: 30 }, 'kumulativ')).toBe('50 g · 30 s');
  });

  it('guss: "auf" kumulativ, "+" inkrementell, Muster nur wenn gesetzt', () => {
    expect(bausteinZeile({ typ: 'guss', zielmenge: 150 }, 'kumulativ')).toBe('auf 150 g');
    expect(bausteinZeile({ typ: 'guss', zielmenge: 50 }, 'inkrementell')).toBe('+ 50 g');
    expect(bausteinZeile({ typ: 'guss', zielmenge: 150, dauer: 30, muster: 'spirale' }, 'kumulativ')).toBe(
      'auf 150 g · 30 s · spirale',
    );
  });

  it('warten: immer "bis", Modus-Text nie mehr als Rueckfall (Rueckmeldung 2026-09-08)', () => {
    expect(bausteinZeile({ typ: 'warten', modus: 'bis-durchgelaufen' }, 'kumulativ')).toBe('bis');
    expect(bausteinZeile({ typ: 'warten', modus: 'feste-dauer', dauer: 45 }, 'kumulativ')).toBe('bis');
    expect(
      bausteinZeile({ typ: 'warten', modus: 'feste-dauer', dauer: 45, notiz: 'der Rand trocken ist' }, 'kumulativ'),
    ).toBe('bis der Rand trocken ist');
    expect(bausteinZeile({ typ: 'warten', modus: 'bis-durchgelaufen', notiz: 'der Rand trocken ist' }, 'kumulativ')).toBe(
      'bis der Rand trocken ist',
    );
  });

  it('bypass: Menge, Temperatur nur wenn gesetzt', () => {
    expect(bausteinZeile({ typ: 'bypass', menge: 20 }, 'kumulativ')).toBe('20 g');
    expect(bausteinZeile({ typ: 'bypass', menge: 20, temperatur: 90 }, 'kumulativ')).toBe('20 g · 90 °C');
  });

  it('frei (Migration): Rolle, Menge und Dauer nur wenn gesetzt', () => {
    expect(bausteinZeile({ typ: 'frei', menge: 0, rolle: 'Bloom' }, 'kumulativ')).toBe('Bloom');
    expect(bausteinZeile({ typ: 'frei', menge: 50, dauer: 30, rolle: 'Bloom' }, 'kumulativ')).toBe('Bloom · 50 g · 30 s');
  });
});
