import { describe, it, expect } from 'vitest';
import { ausPfad, elternVon, tabVon, zuPfad, wurzelVon, START, type Route } from './route';

const ALLE_ROUTEN: Route[] = [
  { name: 'bar' },
  { name: 'historie' },
  { name: 'getraenke' },
  { name: 'kaffees' },
  { name: 'kaffeeNeu' },
  { name: 'kaffee', kaffeeId: 'k1' },
  { name: 'kaffeeBearbeiten', kaffeeId: 'k1' },
  { name: 'profil', kaffeeId: 'k1', profilId: 'p1' },
  { name: 'shot', kaffeeId: 'k1', profilId: 'p1' },
  { name: 'einstellungen' },
  { name: 'geraete' },
  { name: 'musterblatt' },
  { name: 'muehle', id: 'm1' },
  { name: 'muehleNeu' },
  { name: 'muehleBearbeiten', id: 'm1' },
  { name: 'bruehgeraet', id: 'b1' },
  { name: 'bruehgeraetNeu' },
  { name: 'bruehgeraetBearbeiten', id: 'b1' },
  { name: 'setup', id: 's1' },
  { name: 'setupNeu' },
  { name: 'setupBearbeiten', id: 's1' },
];

describe('route — Hin- und Rueckweg', () => {
  it.each(ALLE_ROUTEN.map((r) => [zuPfad(r), r] as const))('%s parst zurueck auf dieselbe Route', (_pfad, route) => {
    expect(ausPfad(zuPfad(route))).toEqual(route);
  });
});

describe('route — unbekannte Pfade', () => {
  it.each(['', '/', '/nirgendwo', '/kaffees/k1/profil', '/einstellungen/geraete/muehle', '/kaffees/k1/x/y'])(
    '%s landet auf START',
    (pfad) => {
      expect(ausPfad(pfad)).toEqual(START);
    },
  );
});

describe('route — elternVon', () => {
  it('shot -> profil -> kaffee -> kaffees -> Wurzel', () => {
    const shot: Route = { name: 'shot', kaffeeId: 'k1', profilId: 'p1' };
    const profil = elternVon(shot);
    expect(profil).toEqual({ name: 'profil', kaffeeId: 'k1', profilId: 'p1' } satisfies Route);
    const kaffee = elternVon(profil!);
    expect(kaffee).toEqual({ name: 'kaffee', kaffeeId: 'k1' } satisfies Route);
    const kaffees = elternVon(kaffee!);
    expect(kaffees).toEqual({ name: 'kaffees' } satisfies Route);
    expect(elternVon(kaffees!)).toBeUndefined();
  });

  it('kaffeeBearbeiten -> kaffee', () => {
    expect(elternVon({ name: 'kaffeeBearbeiten', kaffeeId: 'k1' })).toEqual({ name: 'kaffee', kaffeeId: 'k1' } satisfies Route);
  });

  it('muehleBearbeiten -> muehle -> geraete', () => {
    const bearbeiten: Route = { name: 'muehleBearbeiten', id: 'm1' };
    const ansicht = elternVon(bearbeiten);
    expect(ansicht).toEqual({ name: 'muehle', id: 'm1' } satisfies Route);
    expect(elternVon(ansicht!)).toEqual({ name: 'geraete' } satisfies Route);
  });

  it('muehle -> geraete -> einstellungen -> Wurzel', () => {
    const muehle: Route = { name: 'muehle', id: 'm1' };
    const geraete = elternVon(muehle);
    expect(geraete).toEqual({ name: 'geraete' } satisfies Route);
    const einstellungen = elternVon(geraete!);
    expect(einstellungen).toEqual({ name: 'einstellungen' } satisfies Route);
    expect(elternVon(einstellungen!)).toBeUndefined();
  });

  it('Tab-Wurzeln haben kein Eltern-Blatt', () => {
    for (const route of [{ name: 'bar' }, { name: 'historie' }, { name: 'getraenke' }, { name: 'kaffees' }, { name: 'einstellungen' }] as Route[]) {
      expect(elternVon(route)).toBeUndefined();
    }
  });
});

describe('route — tabVon', () => {
  it.each(ALLE_ROUTEN)('%o gehoert zu einem der fuenf Bereiche', (route) => {
    expect(['bar', 'historie', 'getraenke', 'kaffees', 'einstellungen']).toContain(tabVon(route));
  });

  it('Kaffees-Teilbaum gehoert komplett zu kaffees', () => {
    expect(tabVon({ name: 'kaffeeNeu' })).toBe('kaffees');
    expect(tabVon({ name: 'kaffee', kaffeeId: 'k1' })).toBe('kaffees');
    expect(tabVon({ name: 'kaffeeBearbeiten', kaffeeId: 'k1' })).toBe('kaffees');
    expect(tabVon({ name: 'profil', kaffeeId: 'k1', profilId: 'p1' })).toBe('kaffees');
    expect(tabVon({ name: 'shot', kaffeeId: 'k1', profilId: 'p1' })).toBe('kaffees');
  });

  it('Geraete-Teilbaum gehoert komplett zu einstellungen', () => {
    expect(tabVon({ name: 'geraete' })).toBe('einstellungen');
    expect(tabVon({ name: 'musterblatt' })).toBe('einstellungen');
    expect(tabVon({ name: 'muehle', id: 'm1' })).toBe('einstellungen');
    expect(tabVon({ name: 'muehleNeu' })).toBe('einstellungen');
    expect(tabVon({ name: 'muehleBearbeiten', id: 'm1' })).toBe('einstellungen');
    expect(tabVon({ name: 'bruehgeraet', id: 'b1' })).toBe('einstellungen');
    expect(tabVon({ name: 'setup', id: 's1' })).toBe('einstellungen');
  });
});

describe('route — wurzelVon', () => {
  it('jeder Bereich fuehrt auf eine Route, deren tabVon wieder derselbe Bereich ist', () => {
    for (const bereich of ['bar', 'historie', 'getraenke', 'kaffees', 'einstellungen'] as const) {
      expect(tabVon(wurzelVon(bereich))).toBe(bereich);
    }
  });
});
