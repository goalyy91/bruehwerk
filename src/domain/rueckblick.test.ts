import { describe, it, expect } from 'vitest';
import { durchgangsRueckblick } from './rueckblick';
import type { Uebungsantwort } from '../daten/schema/uebungsantwort';

const T0 = 1_700_000_000_000;
const TAG = 24 * 60 * 60 * 1000;
const LABEL: Record<string, string> = {
  mandel: 'Mandel',
  haselnuss: 'Haselnuss',
  erdbeere: 'Erdbeere',
  himbeere: 'Himbeere',
  zitrone: 'Zitrone',
  vanille: 'Vanille',
};
const FAMILIE: Record<string, string> = {
  mandel: 'Nussig',
  haselnuss: 'Nussig',
  erdbeere: 'Fruchtig',
  himbeere: 'Fruchtig',
  zitrone: 'Fruchtig',
  vanille: 'Süß',
};
const labelVon = (id: string) => LABEL[id] ?? id;
const familieVon = (id: string) => FAMILIE[id];

let zaehler = 0;
const A = (ueber: Partial<Uebungsantwort>): Uebungsantwort => ({
  id: `a${zaehler++}`,
  durchgangId: 'heute',
  setId: 's1',
  aromaId: 'mandel',
  form: 'aromaInFamilie',
  ergebnis: 'richtig',
  zeitstempel: T0,
  unerwarteteNummer: false,
  ...ueber,
});
const rb = (heute: Uebungsantwort[], vorher: Uebungsantwort[] = []) =>
  durchgangsRueckblick({ durchgangAntworten: heute, vorherigeAntworten: vorher, labelVon, familieVon });

describe('durchgangsRueckblick', () => {
  it('ohne Antworten: nichts', () => {
    expect(rb([])).toEqual([]);
  });

  it('frei benannt: zum ersten Mal ohne Familie, nachdem es mit ihr geklappt hat', () => {
    const vorher = [A({ durchgangId: 'd1', aromaId: 'zitrone', form: 'aromaInFamilie', zeitstempel: T0 - TAG })];
    const heute = [A({ aromaId: 'zitrone', form: 'freierAbruf' })];
    expect(rb(heute, vorher)[0]).toBe('„Zitrone“ hast du heute frei benannt — bisher ging das nur mit der Familie als Stütze.');
  });

  it('frei benannt zählt nicht, wenn es schon einmal frei geklappt hat', () => {
    const vorher = [A({ durchgangId: 'd1', aromaId: 'zitrone', form: 'freierAbruf', zeitstempel: T0 - TAG })];
    expect(rb([A({ aromaId: 'zitrone', form: 'freierAbruf' })], vorher).join(' ')).not.toContain('frei benannt');
  });

  it('sitzt wieder: früher getroffen, zuletzt daneben', () => {
    const vorher = [
      A({ durchgangId: 'd1', aromaId: 'vanille', zeitstempel: T0 - 2 * TAG }),
      A({ durchgangId: 'd2', aromaId: 'vanille', ergebnis: 'falsch', zeitstempel: T0 - TAG }),
    ];
    expect(rb([A({ aromaId: 'vanille' })], vorher)).toContain('„Vanille“ sitzt wieder — beim letzten Mal lag es noch daneben.');
  });

  it('nie zuvor getroffen gehört dem Meilenstein, nicht dem Rückblick', () => {
    const vorher = [A({ durchgangId: 'd1', aromaId: 'vanille', ergebnis: 'falsch', zeitstempel: T0 - TAG })];
    expect(rb([A({ aromaId: 'vanille' })], vorher).join(' ')).not.toContain('sitzt wieder');
  });

  it('ein geratener Treffer ist kein Beleg', () => {
    const vorher = [
      A({ durchgangId: 'd1', aromaId: 'vanille', zeitstempel: T0 - 2 * TAG }),
      A({ durchgangId: 'd2', aromaId: 'vanille', ergebnis: 'falsch', zeitstempel: T0 - TAG }),
    ];
    expect(rb([A({ aromaId: 'vanille', geraten: true })], vorher).join(' ')).not.toContain('sitzt wieder');
  });

  it('Mehrzahl mit „und“', () => {
    const vorher = ['vanille', 'mandel'].flatMap((id) => [
      A({ durchgangId: 'd1', aromaId: id, zeitstempel: T0 - 2 * TAG }),
      A({ durchgangId: 'd2', aromaId: id, ergebnis: 'falsch', zeitstempel: T0 - TAG }),
    ]);
    expect(rb([A({ aromaId: 'vanille' }), A({ aromaId: 'mandel' })], vorher)).toContain(
      '„Vanille“ und „Mandel“ sitzen wieder — beim letzten Mal lagen sie noch daneben.',
    );
  });

  it('starke Familie ab drei, alle getroffen', () => {
    const vorher = ['erdbeere', 'himbeere', 'zitrone'].map((id) => A({ durchgangId: 'd1', aromaId: id, zeitstempel: T0 - TAG }));
    const heute = ['erdbeere', 'himbeere', 'zitrone'].map((id) => A({ aromaId: id }));
    expect(rb(heute, vorher)).toContain('Fruchtig liegt dir: alle drei richtig eingeordnet.');
    expect(rb(heute.slice(0, 2), vorher).join(' ')).not.toContain('liegt dir');
  });

  it('Vergleich mit dem Schnitt nur nach oben, und nicht beim besten Durchgang', () => {
    // drei frühere Durchgänge mit je 1 von 4, einer mit 4 von 4 → bester = 4
    const frueher = (d: string, t: number, richtig: number) =>
      ['erdbeere', 'mandel', 'vanille', 'zitrone'].map((id, i) =>
        A({ durchgangId: d, aromaId: id, ergebnis: i < richtig ? 'richtig' : 'falsch', zeitstempel: t }),
      );
    const vorher = [...frueher('d0', T0 - 9 * TAG, 4), ...frueher('d1', T0 - 3 * TAG, 1), ...frueher('d2', T0 - 2 * TAG, 1), ...frueher('d3', T0 - TAG, 1)];
    // Schnitt der letzten fünf: (4+1+1+1)/4 = 1,75 → heute 3 ≥ 2,75
    const heute = ['erdbeere', 'mandel', 'vanille', 'zitrone'].map((id, i) => A({ aromaId: id, ergebnis: i < 3 ? 'richtig' : 'falsch' }));
    expect(rb(heute, vorher)).toContain('Mehr getroffen als zuletzt — im Schnitt waren es etwa zwei von vier.');
    // schwächer als sonst: kein Vergleichssatz, kein Trost
    const schwach = ['erdbeere', 'mandel', 'vanille', 'zitrone'].map((id) => A({ aromaId: id, ergebnis: 'falsch' }));
    expect(rb(schwach, vorher).join(' ')).not.toMatch(/Schnitt|zuletzt —/);
  });

  it('Richtung stimmte: Familie richtig, Aroma noch nicht', () => {
    const vorher = [A({ durchgangId: 'd1', aromaId: 'erdbeere', zeitstempel: T0 - TAG })];
    expect(rb([A({ aromaId: 'erdbeere', ergebnis: 'teilweise', getipptId: 'himbeere' })], vorher)).toContain(
      'Bei „Erdbeere“ lag deine Nase schon in der richtigen Familie, Fruchtig — das genaue Aroma kommt noch.',
    );
  });

  it('wiederholte Verwechslung wird als Erkenntnis benannt', () => {
    const vorher = [A({ durchgangId: 'd1', aromaId: 'mandel', getipptId: 'haselnuss', ergebnis: 'teilweise', zeitstempel: T0 - TAG })];
    const satz = rb([A({ aromaId: 'mandel', getipptId: 'haselnuss', ergebnis: 'falsch' })], vorher);
    expect(satz.join(' ')).toContain('„Mandel“ hast du wieder für „Haselnuss“ gehalten');
  });

  it('neu kennengelernt: Namen bis drei, darüber die Zahl', () => {
    expect(rb([A({ aromaId: 'mandel', ergebnis: 'falsch' })])).toEqual(['Neu kennengelernt: „Mandel“.']);
    const acht = Array.from({ length: 8 }, (_, i) => A({ aromaId: `x${i}`, ergebnis: 'falsch' }));
    expect(rb(acht)).toEqual(['Acht Aromen zum ersten Mal in der Nase.']);
  });

  it('höchstens drei Sätze, und kein Wort aus der Technik', () => {
    const vorher = [
      A({ durchgangId: 'd1', aromaId: 'zitrone', zeitstempel: T0 - 3 * TAG }),
      A({ durchgangId: 'd1', aromaId: 'vanille', zeitstempel: T0 - 3 * TAG }),
      A({ durchgangId: 'd2', aromaId: 'vanille', ergebnis: 'falsch', zeitstempel: T0 - 2 * TAG }),
      A({ durchgangId: 'd2', aromaId: 'mandel', getipptId: 'haselnuss', ergebnis: 'falsch', zeitstempel: T0 - 2 * TAG }),
    ];
    const heute = [
      A({ aromaId: 'zitrone', form: 'freierAbruf' }),
      A({ aromaId: 'vanille' }),
      A({ aromaId: 'erdbeere', ergebnis: 'teilweise' }),
      A({ aromaId: 'mandel', getipptId: 'haselnuss', ergebnis: 'falsch' }),
      A({ aromaId: 'himbeere', ergebnis: 'falsch' }),
    ];
    const saetze = rb(heute, vorher);
    expect(saetze).toHaveLength(3);
    expect(saetze.join(' ')).not.toMatch(/Box|Stufe|fällig|Leitner|Punkt/i);
  });

  it('Kontrast und Reverse werden ignoriert', () => {
    expect(rb([A({ form: 'kontrast' }), A({ form: 'reverse' })])).toEqual([]);
  });
});
