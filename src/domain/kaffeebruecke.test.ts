import { describe, it, expect } from 'vitest';
import { leNezNummer, nummernAusKaffees, abgleichSatz, KAFFEE_FENSTER_TAGE } from './kaffeebruecke';
import { AROMASET_SCA, AROMASET_LENEZ } from '../daten/aromen';

const LENEZ = AROMASET_LENEZ.kategorien.flatMap((k) => k.gruppen.flatMap((g) => g.aromen)).map((a) => ({ label: a.label, nummer: a.nummer! }));
const TAG = 24 * 60 * 60 * 1000;
const JETZT = 1_700_000_000_000;

describe('leNezNummer — vom verkosteten Aroma zum Fläschchen', () => {
  it('eine gespeicherte Nummer (Le-Nez-Set) gewinnt', () => {
    expect(leNezNummer({ pfad: ['x', 'y', 'irgendwas'], nummer: 53 }, LENEZ)).toBe(53);
  });

  it('wortgleiche SCA-Blätter finden ihr Fläschchen', () => {
    expect(leNezNummer({ pfad: ['nussig-kakao', 'Nüsse', 'Mandel'] }, LENEZ)).toBe(53);
    expect(leNezNummer({ pfad: ['x', 'y', 'schwarzer Tee'] }, LENEZ)).toBe(2);
  });

  it('eindeutige Entsprechungen: Anis, Muskat, Nelke, malzig, erdig-muffig, schimmelig', () => {
    expect(leNezNummer({ pfad: ['Anis'] }, LENEZ)).toBe(47);
    expect(leNezNummer({ pfad: ['Muskat'] }, LENEZ)).toBe(48);
    expect(leNezNummer({ pfad: ['Nelke'] }, LENEZ)).toBe(50);
    expect(leNezNummer({ pfad: ['malzig'] }, LENEZ)).toBe(45);
    expect(leNezNummer({ pfad: ['erdig-muffig'] }, LENEZ)).toBe(36);
    expect(leNezNummer({ pfad: ['schimmelig'] }, LENEZ)).toBe(35);
  });

  it('ohne Gegenstück nichts — "papierig" ist nicht "Pappe"', () => {
    expect(leNezNummer({ pfad: ['papierig'] }, LENEZ)).toBeUndefined();
    expect(leNezNummer({ pfad: ['Kokosnuss'] }, LENEZ)).toBeUndefined();
  });

  it('41 der SCA-Blätter haben ein Fläschchen (35 wortgleich + 6 Entsprechungen)', () => {
    const blaetter = AROMASET_SCA.kategorien.flatMap((k) => k.gruppen.flatMap((g) => g.aromen.map((a) => a.label)));
    expect(blaetter.filter((l) => leNezNummer({ pfad: [l] }, LENEZ) !== undefined)).toHaveLength(41);
  });
});

describe('nummernAusKaffees — Verkostungen der letzten 60 Tage', () => {
  it(`zaehlt nur, was juenger als ${KAFFEE_FENSTER_TAGE} Tage ist`, () => {
    const nummern = nummernAusKaffees(
      [
        { ts: JETZT - 10 * TAG, aromen: [{ pfad: ['Mandel'] }, { pfad: ['Kokosnuss'] }] },
        { ts: JETZT - 61 * TAG, aromen: [{ pfad: ['Honig'] }] },
      ],
      LENEZ,
      JETZT,
    );
    expect([...nummern]).toEqual([53]);
  });
});

describe('abgleichSatz', () => {
  it('ein Fläschchen', () => {
    expect(abgleichSatz([{ name: 'Mandel', nummer: 53 }])).toBe('Zum Abgleich: riech Nr. 53 neben der Tasse — war es wirklich Mandel?');
  });
  it('höchstens drei, mit "und"', () => {
    expect(
      abgleichSatz([
        { name: 'Mandel', nummer: 53 },
        { name: 'Honig', nummer: 1 },
        { name: 'Rose', nummer: 3 },
        { name: 'Zimt', nummer: 49 },
      ]),
    ).toBe('Zum Abgleich: riech Nr. 53, Nr. 1 und Nr. 3 neben der Tasse — war es wirklich Mandel, Honig und Rose?');
  });
  it('ohne Fläschchen kein Satz', () => {
    expect(abgleichSatz([])).toBeUndefined();
  });
});
