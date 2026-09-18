import { describe, it, expect } from 'vitest';
import { meilensteinSatz } from './meilenstein';
import type { Uebungsantwort } from '../daten/schema/uebungsantwort';

const JETZT = 1_700_000_000_000;
const LABEL = new Map([
  ['mandel', 'Mandel'],
  ['haselnuss', 'Haselnuss'],
  ['erdbeere', 'Erdbeere'],
]);
const labelVon = (id: string) => LABEL.get(id) ?? id;

const ANTWORT = (ueber: Partial<Uebungsantwort>): Uebungsantwort => ({
  id: 'a1',
  durchgangId: 'd-aktuell',
  setId: 's1',
  aromaId: 'mandel',
  form: 'freierAbruf',
  ergebnis: 'richtig',
  zeitstempel: JETZT,
  unerwarteteNummer: false,
  ...ueber,
});

describe('meilensteinSatz — hoechstens ein Satz, nur wenn er wahr ist', () => {
  it('kein Durchgang, kein Satz', () => {
    expect(meilensteinSatz({ durchgangAntworten: [], vorherigeAntworten: [], labelVon })).toBeUndefined();
  });

  it('alle richtig: fehlerfrei-Satz mit der tatsaechlichen Anzahl', () => {
    const durchgang = [ANTWORT({ aromaId: 'mandel' }), ANTWORT({ aromaId: 'haselnuss' })];
    expect(meilensteinSatz({ durchgangAntworten: durchgang, vorherigeAntworten: [], labelVon })).toBe('Fehlerfrei — alle 2.');
  });

  it('ein Fehler dabei: kein fehlerfrei-Satz', () => {
    const durchgang = [ANTWORT({ aromaId: 'mandel' }), ANTWORT({ aromaId: 'haselnuss', ergebnis: 'falsch' })];
    expect(meilensteinSatz({ durchgangAntworten: durchgang, vorherigeAntworten: [], labelVon })).not.toBe('Fehlerfrei — alle 2.');
  });

  it('bester Durchgang bisher: eigener Punktestand schlaegt jeden frueheren Durchgang', () => {
    const durchgang = [
      ANTWORT({ aromaId: 'mandel', ergebnis: 'richtig' }),
      ANTWORT({ aromaId: 'haselnuss', ergebnis: 'richtig' }),
      ANTWORT({ aromaId: 'erdbeere', ergebnis: 'falsch' }), // nicht fehlerfrei, also greift Kandidat 2
    ];
    const vorherige = [
      ANTWORT({ durchgangId: 'd1', aromaId: 'mandel', ergebnis: 'richtig' }),
      ANTWORT({ durchgangId: 'd1', aromaId: 'haselnuss', ergebnis: 'falsch' }),
      ANTWORT({ durchgangId: 'd2', aromaId: 'mandel', ergebnis: 'richtig' }),
    ];
    expect(meilensteinSatz({ durchgangAntworten: durchgang, vorherigeAntworten: vorherige, labelVon })).toBe('Bester Durchgang bisher.');
  });

  it('gleichauf mit dem bisherigen Bestwert: kein "bester Durchgang"-Satz — nur strikt besser zaehlt', () => {
    const durchgang = [ANTWORT({ aromaId: 'mandel', ergebnis: 'richtig' }), ANTWORT({ aromaId: 'haselnuss', ergebnis: 'falsch' })];
    const vorherige = [
      ANTWORT({ durchgangId: 'd1', aromaId: 'mandel', ergebnis: 'richtig' }),
      ANTWORT({ durchgangId: 'd1', aromaId: 'haselnuss', ergebnis: 'falsch' }),
    ];
    expect(meilensteinSatz({ durchgangAntworten: durchgang, vorherigeAntworten: vorherige, labelVon })).toBeUndefined();
  });

  it('erster Durchgang ueberhaupt (keine Vorgeschichte): kein "bester Durchgang bisher" ohne Vergleichswert — stattdessen greift "erstmals getroffen"', () => {
    const durchgang = [ANTWORT({ aromaId: 'mandel', ergebnis: 'richtig' }), ANTWORT({ aromaId: 'haselnuss', ergebnis: 'falsch' })];
    expect(meilensteinSatz({ durchgangAntworten: durchgang, vorherigeAntworten: [], labelVon })).toBe('„Mandel“ zum ersten Mal getroffen.');
  });

  it('Aroma zum ersten Mal ueberhaupt getroffen, wenn kein staerkerer Kandidat greift', () => {
    const durchgang = [
      ANTWORT({ aromaId: 'erdbeere', ergebnis: 'richtig' }),
      ANTWORT({ aromaId: 'haselnuss', ergebnis: 'falsch' }),
    ];
    const vorherige = [
      ANTWORT({ durchgangId: 'd1', aromaId: 'mandel', ergebnis: 'richtig' }),
      ANTWORT({ durchgangId: 'd1', aromaId: 'erdbeere', ergebnis: 'falsch' }), // schon mal versucht, aber nie richtig
    ];
    expect(meilensteinSatz({ durchgangAntworten: durchgang, vorherigeAntworten: vorherige, labelVon })).toBe(
      '„Erdbeere“ zum ersten Mal getroffen.',
    );
  });

  it('Aroma war schon einmal richtig: kein "erstmals"-Satz dafuer', () => {
    const durchgang = [ANTWORT({ aromaId: 'mandel', ergebnis: 'richtig' }), ANTWORT({ aromaId: 'haselnuss', ergebnis: 'falsch' })];
    const vorherige = [ANTWORT({ durchgangId: 'd1', aromaId: 'mandel', ergebnis: 'richtig' })];
    expect(meilensteinSatz({ durchgangAntworten: durchgang, vorherigeAntworten: vorherige, labelVon })).toBeUndefined();
  });

  it('nichts trifft zu: kein Satz, kein Trost-Text', () => {
    const durchgang = [ANTWORT({ aromaId: 'mandel', ergebnis: 'falsch' }), ANTWORT({ aromaId: 'haselnuss', ergebnis: 'falsch' })];
    const vorherige = [
      ANTWORT({ durchgangId: 'd1', aromaId: 'mandel', ergebnis: 'richtig' }),
      ANTWORT({ durchgangId: 'd1', aromaId: 'haselnuss', ergebnis: 'richtig' }),
      ANTWORT({ durchgangId: 'd1', aromaId: 'erdbeere', ergebnis: 'richtig' }),
    ];
    expect(meilensteinSatz({ durchgangAntworten: durchgang, vorherigeAntworten: vorherige, labelVon })).toBeUndefined();
  });

  it('ein einzelner Reverse-Treffer in der Vorgeschichte zaehlt nicht als frueherer normaler Durchgang — sonst waere er trivial zu schlagen', () => {
    const durchgang = [
      ANTWORT({ aromaId: 'mandel', ergebnis: 'richtig' }),
      ANTWORT({ aromaId: 'haselnuss', ergebnis: 'richtig' }),
      ANTWORT({ aromaId: 'erdbeere', ergebnis: 'falsch' }), // nicht fehlerfrei, sonst greift schon Kandidat 1
    ];
    const vorherige = [ANTWORT({ durchgangId: 'd1', form: 'reverse', aromaId: 'erdbeere', ergebnis: 'richtig' })];
    // Kein "bester Durchgang"-Satz trotz 2 > 0 vergleichbaren Punkten — Reverse ist kein vergleichbarer Durchgang.
    // Stattdessen greift Kandidat 3 (Mandel zuerst in der Liste, erstmals normal benannt).
    expect(meilensteinSatz({ durchgangAntworten: durchgang, vorherigeAntworten: vorherige, labelVon })).toBe(
      '„Mandel“ zum ersten Mal getroffen.',
    );
  });
});
