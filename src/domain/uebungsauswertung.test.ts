import { describe, it, expect } from 'vitest';
import {
  verwechslungsmatrix,
  familienTrefferquote,
  langsameRichtigeAntworten,
  zielfrequenzAbgleich,
  wochenfortschritt,
  uebungsKennzahlenPool,
  LANGSAM_SCHWELLE_MS,
  ANTWORTDAUER_MINDEST_STICHPROBE,
  ZIELFREQUENZ_MINDESTWOCHEN,
} from './uebungsauswertung';
import type { Uebungsantwort } from '../daten/schema/uebungsantwort';
import type { AromaOption, EffektiverZustand } from './uebung';

const TAG = 24 * 60 * 60 * 1000;
const WOCHE = 7 * TAG;
const JETZT = 1_700_000_000_000;

const ANTWORT = (ueber: Partial<Uebungsantwort>): Uebungsantwort => ({
  id: 'a1',
  durchgangId: 'd1',
  setId: 's1',
  aromaId: 'mandel',
  form: 'freierAbruf',
  zeitstempel: JETZT,
  unerwarteteNummer: false,
  ...ueber,
});

describe('verwechslungsmatrix — gerichtet, aus dem Antwortprotokoll', () => {
  it('eine richtige Antwort traegt nichts zur Matrix bei, auch mit getipptId gesetzt', () => {
    const antworten = [ANTWORT({ aromaId: 'mandel', getipptId: 'mandel', ergebnis: 'richtig' })];
    expect(verwechslungsmatrix(antworten)).toEqual([]);
  });

  it('eine falsche Antwort ohne getipptId (z. B. Stufe A) traegt nichts bei', () => {
    const antworten = [ANTWORT({ aromaId: 'mandel', ergebnis: 'falsch' })];
    expect(verwechslungsmatrix(antworten)).toEqual([]);
  });

  it('X fuer Y gehalten zaehlt getrennt von Y fuer X gehalten — gerichtet, keine Summe', () => {
    const antworten = [
      ANTWORT({ aromaId: 'mandel', getipptId: 'haselnuss', ergebnis: 'falsch' }),
      ANTWORT({ aromaId: 'haselnuss', getipptId: 'mandel', ergebnis: 'falsch' }),
      ANTWORT({ aromaId: 'haselnuss', getipptId: 'mandel', ergebnis: 'falsch' }),
    ];
    const matrix = verwechslungsmatrix(antworten);
    expect(matrix).toEqual([
      { tatsaechlichId: 'haselnuss', getipptId: 'mandel', anzahl: 2 },
      { tatsaechlichId: 'mandel', getipptId: 'haselnuss', anzahl: 1 },
    ]);
  });
});

describe('familienTrefferquote — nur Stufe A/B, teilweise zaehlt als Familie getroffen', () => {
  const AROMEN: AromaOption[] = [
    { id: 'mandel', label: 'Mandel', kategorieId: 'nussig-kakao' },
    { id: 'haselnuss', label: 'Haselnuss', kategorieId: 'nussig-kakao' },
    { id: 'himbeere', label: 'Himbeere', kategorieId: 'fruchtig' },
  ];

  it('freier Abruf (Stufe C) traegt keine Familienaussage bei', () => {
    const antworten = [ANTWORT({ aromaId: 'mandel', form: 'freierAbruf', ergebnis: 'richtig' })];
    expect(familienTrefferquote(antworten, AROMEN)).toEqual([]);
  });

  it('"teilweise" (Stufe B, Familie richtig, Aroma falsch) zaehlt als Familie getroffen', () => {
    const antworten = [ANTWORT({ aromaId: 'mandel', form: 'aromaInFamilie', ergebnis: 'teilweise' })];
    const quote = familienTrefferquote(antworten, AROMEN);
    expect(quote).toEqual([{ kategorieId: 'nussig-kakao', richtig: 1, versuche: 1 }]);
  });

  it('mehrere Aromen derselben Familie zaehlen zusammen', () => {
    const antworten = [
      ANTWORT({ aromaId: 'mandel', form: 'familie', ergebnis: 'richtig' }),
      ANTWORT({ aromaId: 'haselnuss', form: 'familie', ergebnis: 'falsch' }),
      ANTWORT({ aromaId: 'himbeere', form: 'familie', ergebnis: 'richtig' }),
    ];
    const quote = familienTrefferquote(antworten, AROMEN);
    expect(quote).toContainEqual({ kategorieId: 'nussig-kakao', richtig: 1, versuche: 2 });
    expect(quote).toContainEqual({ kategorieId: 'fruchtig', richtig: 1, versuche: 1 });
  });
});

describe('langsameRichtigeAntworten — Hinweis, kein Eingriff', () => {
  it('richtig und unter der Schwelle faellt nicht auf', () => {
    const antworten = [ANTWORT({ ergebnis: 'richtig', antwortdauerMs: LANGSAM_SCHWELLE_MS - 1 })];
    expect(langsameRichtigeAntworten(antworten)).toEqual([]);
  });

  it('richtig und ueber der Schwelle faellt auf', () => {
    const antworten = [ANTWORT({ aromaId: 'mandel', ergebnis: 'richtig', antwortdauerMs: LANGSAM_SCHWELLE_MS + 1 })];
    expect(langsameRichtigeAntworten(antworten)).toEqual([{ aromaId: 'mandel', antwortdauerMs: LANGSAM_SCHWELLE_MS + 1 }]);
  });

  it('falsch und langsam faellt nicht auf — nur richtige Antworten sind hier interessant', () => {
    const antworten = [ANTWORT({ ergebnis: 'falsch', antwortdauerMs: LANGSAM_SCHWELLE_MS + 1000 })];
    expect(langsameRichtigeAntworten(antworten)).toEqual([]);
  });
});

describe('langsameRichtigeAntworten — persoenliche Schwelle je Form ab Mindeststichprobe', () => {
  it('unter der Mindeststichprobe bleibt es bei der festen Schwelle, auch bei durchweg schnellen Antworten', () => {
    // 14 sehr schnelle Antworten (500ms) und eine bei genau der festen Schwelle + 1 —
    // ohne genug Stichprobe darf die letzte trotz winzigem eigenen Median nicht schon bei 1000ms auffallen.
    const schnelle = Array.from({ length: ANTWORTDAUER_MINDEST_STICHPROBE - 1 }, () =>
      ANTWORT({ ergebnis: 'richtig', antwortdauerMs: 500 }),
    );
    const antworten = [...schnelle, ANTWORT({ aromaId: 'mandel', ergebnis: 'richtig', antwortdauerMs: LANGSAM_SCHWELLE_MS + 1 })];
    expect(langsameRichtigeAntworten(antworten)).toEqual([{ aromaId: 'mandel', antwortdauerMs: LANGSAM_SCHWELLE_MS + 1 }]);
  });

  it('ab der Mindeststichprobe loest der eigene Median (× 2) die feste Schwelle ab — auch deutlich darunter', () => {
    // Median 500ms -> persoenliche Schwelle 1000ms, weit unter den festen 8000ms.
    const schnelle = Array.from({ length: ANTWORTDAUER_MINDEST_STICHPROBE }, () =>
      ANTWORT({ ergebnis: 'richtig', antwortdauerMs: 500 }),
    );
    const antworten = [...schnelle, ANTWORT({ aromaId: 'mandel', ergebnis: 'richtig', antwortdauerMs: 1001 })];
    expect(langsameRichtigeAntworten(antworten)).toEqual([{ aromaId: 'mandel', antwortdauerMs: 1001 }]);
  });

  it('eine Form mit hohem eigenen Median toleriert Zeiten, die die feste Schwelle ueberschreiten wuerden', () => {
    // Median 5000ms -> persoenliche Schwelle 10000ms: 9000ms faellt hier NICHT auf, obwohl es ueber den festen 8000ms liegt.
    const langsame = Array.from({ length: ANTWORTDAUER_MINDEST_STICHPROBE }, () =>
      ANTWORT({ form: 'freierAbruf', ergebnis: 'richtig', antwortdauerMs: 5000 }),
    );
    const antworten = [...langsame, ANTWORT({ aromaId: 'mandel', form: 'freierAbruf', ergebnis: 'richtig', antwortdauerMs: 9000 })];
    expect(langsameRichtigeAntworten(antworten)).toEqual([]);
  });

  it('die Schwelle wird getrennt je Form berechnet — der niedrige Median einer Form markiert keine andere Form', () => {
    const schnelleFamilie = Array.from({ length: ANTWORTDAUER_MINDEST_STICHPROBE }, () =>
      ANTWORT({ form: 'familie', ergebnis: 'richtig', antwortdauerMs: 500 }),
    );
    const normalerFreierAbruf = ANTWORT({ aromaId: 'mandel', form: 'freierAbruf', ergebnis: 'richtig', antwortdauerMs: 4000 });
    expect(langsameRichtigeAntworten([...schnelleFamilie, normalerFreierAbruf])).toEqual([]);
  });
});

describe('zielfrequenzAbgleich — nur fuer den Hinweis, nie fuer die Intervalle', () => {
  it('vor der Mindestwochenzahl gibt es keinen Abgleich', () => {
    const begonnen = [JETZT - (ZIELFREQUENZ_MINDESTWOCHEN - 1) * WOCHE];
    expect(zielfrequenzAbgleich(4, begonnen, JETZT)).toBeUndefined();
  });

  it('ohne jeden Durchgang gibt es keinen Abgleich', () => {
    expect(zielfrequenzAbgleich(4, [], JETZT)).toBeUndefined();
  });

  it('nahe am Ziel: kein Abweichungs-Hinweis', () => {
    // 4 Wochen, Ziel 4/Woche -> 16 Durchgaenge treffen genau
    const begonnen = Array.from({ length: 16 }, (_, i) => JETZT - 4 * WOCHE + i * (4 * WOCHE) / 16);
    const abgleich = zielfrequenzAbgleich(4, begonnen, JETZT);
    expect(abgleich?.weichtAb).toBe(false);
  });

  it('deutlich unter dem Ziel: Abweichungs-Hinweis', () => {
    // 4 Wochen, Ziel 4/Woche, aber nur 3 Durchgaenge insgesamt (0,75/Woche)
    const begonnen = [JETZT - 3 * WOCHE, JETZT - 2 * WOCHE, JETZT - 1 * WOCHE];
    const abgleich = zielfrequenzAbgleich(4, begonnen, JETZT);
    expect(abgleich?.weichtAb).toBe(true);
  });
});

describe('wochenfortschritt — rollierende letzte 7 Tage, keine Mindest-Geschichte', () => {
  it('Ziel erreicht: nicht hinterher', () => {
    const begonnen = [JETZT - 1 * TAG, JETZT - 2 * TAG, JETZT - 3 * TAG];
    expect(wochenfortschritt(3, begonnen, JETZT)).toEqual({ anzahl: 3, ziel: 3, hinterher: false });
  });

  it('Ziel verfehlt: hinterher, mit der tatsaechlichen Zahl', () => {
    const begonnen = [JETZT - 1 * TAG];
    expect(wochenfortschritt(3, begonnen, JETZT)).toEqual({ anzahl: 1, ziel: 3, hinterher: true });
  });

  it('ohne jeden Durchgang: hinterher, sofort — keine Mindest-Trainingsgeschichte noetig', () => {
    expect(wochenfortschritt(2, [], JETZT)).toEqual({ anzahl: 0, ziel: 2, hinterher: true });
  });

  it('nur Durchgaenge der letzten 7 Tage zaehlen — aelter faellt raus', () => {
    const begonnen = [JETZT - 1 * TAG, JETZT - 2 * TAG, JETZT - 8 * TAG];
    expect(wochenfortschritt(2, begonnen, JETZT)).toEqual({ anzahl: 2, ziel: 2, hinterher: false });
  });
});

describe('uebungsKennzahlenPool — sechs Fakten, jeder erst ab ausreichender Datenbasis (K64)', () => {
  const AROMEN: AromaOption[] = [
    { id: 'mandel', label: 'Mandel', kategorieId: 'nussig-kakao' },
    { id: 'haselnuss', label: 'Haselnuss', kategorieId: 'nussig-kakao' },
    { id: 'himbeere', label: 'Himbeere', kategorieId: 'fruchtig' },
  ];
  const FAMILIEN_LABELS = new Map([
    ['nussig-kakao', 'Nussig/Kakao'],
    ['fruchtig', 'Fruchtig'],
  ]);
  const ZUSTAND = (ueber: Partial<EffektiverZustand> = {}): EffektiverZustand => ({
    box: 1,
    faellig: JETZT,
    stufe: 'a',
    eingefuehrt: true,
    ...ueber,
  });
  const LEER = {
    eingefuehrteZustaende: [] as EffektiverZustand[],
    antworten: [] as Uebungsantwort[],
    durchgaengeBegonnenAm: [] as number[],
    aromen: AROMEN,
    familienLabels: FAMILIEN_LABELS,
    gesamtAnzahlAromen: 60,
    jetzt: JETZT,
  };

  it('ganz ohne Datenbasis: leerer Pool', () => {
    expect(uebungsKennzahlenPool(LEER)).toEqual([]);
  });

  it('Gesamtfortschritt nur ab mindestens einem eingefuehrten Aroma, "sicher" ab Box 4', () => {
    const zustaende = [ZUSTAND({ box: 4 }), ZUSTAND({ box: 3 }), ZUSTAND({ box: 5 })];
    const pool = uebungsKennzahlenPool({ ...LEER, eingefuehrteZustaende: zustaende });
    expect(pool).toContainEqual({ label: 'Sicher gelernt', wert: '2 von 60' });
  });

  it('Aktivitaet diese Woche nur bei mindestens einem Durchgang in den letzten 7 Tagen', () => {
    const zuAlt = uebungsKennzahlenPool({ ...LEER, durchgaengeBegonnenAm: [JETZT - 8 * TAG] });
    expect(zuAlt.find((k) => k.label === 'Durchgänge diese Woche')).toBeUndefined();

    const dieseWoche = uebungsKennzahlenPool({ ...LEER, durchgaengeBegonnenAm: [JETZT - 8 * TAG, JETZT - 1 * TAG, JETZT - 2 * TAG] });
    expect(dieseWoche).toContainEqual({ label: 'Durchgänge diese Woche', wert: '2' });
  });

  it('mit gesetztem Wochenziel nennt "Durchgänge diese Woche" das Ziel mit, sonst bleibt es bei der reinen Zahl', () => {
    const begonnen = [JETZT - 1 * TAG, JETZT - 2 * TAG];
    const ohneZiel = uebungsKennzahlenPool({ ...LEER, durchgaengeBegonnenAm: begonnen });
    expect(ohneZiel).toContainEqual({ label: 'Durchgänge diese Woche', wert: '2' });

    const mitZiel = uebungsKennzahlenPool({ ...LEER, durchgaengeBegonnenAm: begonnen, zielProWoche: 4 });
    expect(mitZiel).toContainEqual({ label: 'Durchgänge diese Woche', wert: '2 von 4' });
  });

  it('Staerkste Familie erst ab Mindeststichprobe, waehlt die hoechste Quote', () => {
    const zuWenig = [ANTWORT_KENNZAHL({ aromaId: 'mandel', form: 'familie', ergebnis: 'richtig' })];
    expect(uebungsKennzahlenPool({ ...LEER, antworten: zuWenig }).find((k) => k.label === 'Stärkste Familie')).toBeUndefined();

    const genug = [
      ANTWORT_KENNZAHL({ aromaId: 'mandel', form: 'familie', ergebnis: 'richtig' }),
      ANTWORT_KENNZAHL({ aromaId: 'haselnuss', form: 'familie', ergebnis: 'richtig' }),
      ANTWORT_KENNZAHL({ aromaId: 'mandel', form: 'familie', ergebnis: 'richtig' }),
      ANTWORT_KENNZAHL({ aromaId: 'himbeere', form: 'familie', ergebnis: 'falsch' }),
      ANTWORT_KENNZAHL({ aromaId: 'himbeere', form: 'familie', ergebnis: 'falsch' }),
      ANTWORT_KENNZAHL({ aromaId: 'himbeere', form: 'familie', ergebnis: 'falsch' }),
    ];
    const pool = uebungsKennzahlenPool({ ...LEER, antworten: genug });
    expect(pool).toContainEqual({ label: 'Stärkste Familie', wert: 'Nussig/Kakao' });
  });

  it('Meistverwechselt nur, wenn die Verwechslungsmatrix ueberhaupt ein Paar liefert', () => {
    const ohne = uebungsKennzahlenPool({ ...LEER, antworten: [ANTWORT_KENNZAHL({ ergebnis: 'richtig' })] });
    expect(ohne.find((k) => k.label === 'Meistverwechselt')).toBeUndefined();

    const mit = [ANTWORT_KENNZAHL({ aromaId: 'mandel', getipptId: 'haselnuss', ergebnis: 'falsch' })];
    const pool = uebungsKennzahlenPool({ ...LEER, antworten: mit });
    expect(pool).toContainEqual({ label: 'Meistverwechselt', wert: 'Mandel ↔ Haselnuss' });
  });

  it('Dabei seit nur ab mindestens einer Woche seit dem ersten Durchgang', () => {
    const zuFrisch = uebungsKennzahlenPool({ ...LEER, durchgaengeBegonnenAm: [JETZT - 3 * TAG] });
    expect(zuFrisch.find((k) => k.label === 'Dabei seit')).toBeUndefined();

    const pool = uebungsKennzahlenPool({ ...LEER, durchgaengeBegonnenAm: [JETZT - 2 * WOCHE] });
    expect(pool).toContainEqual({ label: 'Dabei seit', wert: '2 Wochen' });
  });

  it('Reverse-Trefferquote nur ab Mindeststichprobe gewerteter Reverse-Antworten', () => {
    const zuWenig = [
      ANTWORT_KENNZAHL({ form: 'reverse', ergebnis: 'richtig' }),
      ANTWORT_KENNZAHL({ form: 'reverse', ergebnis: 'richtig' }),
    ];
    expect(uebungsKennzahlenPool({ ...LEER, antworten: zuWenig }).find((k) => k.label === 'Reverse-Trefferquote')).toBeUndefined();

    const genug = [
      ANTWORT_KENNZAHL({ form: 'reverse', ergebnis: 'richtig' }),
      ANTWORT_KENNZAHL({ form: 'reverse', ergebnis: 'richtig' }),
      ANTWORT_KENNZAHL({ form: 'reverse', ergebnis: 'falsch' }),
    ];
    const pool = uebungsKennzahlenPool({ ...LEER, antworten: genug });
    expect(pool).toContainEqual({ label: 'Reverse-Trefferquote', wert: '2 von 3' });
  });

  function ANTWORT_KENNZAHL(ueber: Partial<Uebungsantwort>): Uebungsantwort {
    return {
      id: 'a1',
      durchgangId: 'd1',
      setId: 's1',
      aromaId: 'mandel',
      form: 'freierAbruf',
      zeitstempel: JETZT,
      unerwarteteNummer: false,
      ...ueber,
    };
  }
});
