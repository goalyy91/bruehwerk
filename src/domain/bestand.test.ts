import { describe, it, expect } from 'vitest';
import { filtereKaffees, sortiereKaffees, zaehlform, type KaffeeEintrag } from './bestand';

const KAFFEES: KaffeeEintrag[] = [
  { id: '1', name: 'Finca La Esperanza', roester: 'Blackwood', aktiv: true, entkoffeiniert: false, bewertung: 4 },
  { id: '2', name: 'Espresso Entcoffeiniert', roester: 'Blackwood', aktiv: true, entkoffeiniert: true, bewertung: 3 },
  { id: '3', name: 'Alter Rest', roester: 'Rösterei Nord', aktiv: false, entkoffeiniert: false },
  { id: '4', name: 'Anaerobic Natural', roester: 'Rösterei Nord', aktiv: true, entkoffeiniert: false, bewertung: 5 },
];

describe('filtereKaffees', () => {
  it('ohne Filter liefert alle', () => {
    expect(filtereKaffees(KAFFEES)).toHaveLength(4);
  });

  it('nurAktive laesst inaktive weg', () => {
    const ergebnis = filtereKaffees(KAFFEES, { nurAktive: true });
    expect(ergebnis.map((k) => k.id)).not.toContain('3');
  });

  it('koffein filtert entkoffeiniert', () => {
    const ergebnis = filtereKaffees(KAFFEES, { koffein: 'entkoffeiniert' });
    expect(ergebnis.map((k) => k.id)).toEqual(['2']);
  });

  it('koffein filtert koffeinhaltig', () => {
    const ergebnis = filtereKaffees(KAFFEES, { koffein: 'koffeinhaltig' });
    expect(ergebnis.map((k) => k.id)).toEqual(['1', '3', '4']);
  });

  it('Suchtext prueft Name und Roester, klein geschrieben', () => {
    expect(filtereKaffees(KAFFEES, { suchtext: 'nord' }).map((k) => k.id)).toEqual(['3', '4']);
    expect(filtereKaffees(KAFFEES, { suchtext: 'ESPERANZA' }).map((k) => k.id)).toEqual(['1']);
  });

  it('Filter sind UND-verknuepft', () => {
    const ergebnis = filtereKaffees(KAFFEES, { nurAktive: true, koffein: 'entkoffeiniert' });
    expect(ergebnis.map((k) => k.id)).toEqual(['2']);
  });
});

describe('sortiereKaffees', () => {
  it('name sortiert alphabetisch, deutsche Umlaute korrekt', () => {
    const ergebnis = sortiereKaffees(KAFFEES, 'name');
    expect(ergebnis.map((k) => k.name)).toEqual([
      'Alter Rest',
      'Anaerobic Natural',
      'Espresso Entcoffeiniert',
      'Finca La Esperanza',
    ]);
  });

  it('bewertung sortiert absteigend, Fehlendes steht hinten', () => {
    const ergebnis = sortiereKaffees(KAFFEES, 'bewertung');
    expect(ergebnis.map((k) => k.id)).toEqual(['4', '1', '2', '3']);
  });

  it('roester sortiert alphabetisch nach Roesterei, nicht nach Roestgrad', () => {
    const ergebnis = sortiereKaffees(KAFFEES, 'roester');
    expect(ergebnis.map((k) => k.roester)).toEqual(['Blackwood', 'Blackwood', 'Rösterei Nord', 'Rösterei Nord']);
  });

  it('mutiert den Eingabe-Array nicht', () => {
    const original = [...KAFFEES];
    sortiereKaffees(KAFFEES, 'name');
    expect(KAFFEES).toEqual(original);
  });
});

describe('zaehlform', () => {
  it('K72 — "Kaffee · 6 von 14" auch bei nur einem Besitzer', () => {
    expect(zaehlform(6, 14, 'Kaffee')).toBe('Kaffee · 6 von 14');
  });
});
