import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { seedFallsLeer } from './seed';
import { alle, schreiben } from './ablage';
import { _datenbankZuruecksetzen } from './db';
import { MUEHLEN, BRUEHGERAETE, ZUBEHOER, SETUPS } from './stammdaten';

beforeEach(async () => {
  await _datenbankZuruecksetzen();
});

describe('seedFallsLeer', () => {
  it('schreibt die Startbelegung in eine leere DB', async () => {
    await seedFallsLeer();
    expect(await alle('muehle')).toHaveLength(MUEHLEN.length);
    expect(await alle('bruehgeraet')).toHaveLength(BRUEHGERAETE.length);
    expect(await alle('zubehoer')).toHaveLength(ZUBEHOER.length);
    expect(await alle('setup')).toHaveLength(SETUPS.length);
    expect(await alle('ablauf')).toHaveLength(1);
  });

  it('jedes Setup verweist auf eine tatsaechlich geschriebene Muehle, Bruehgeraet und Ablauf', async () => {
    await seedFallsLeer();
    const muehlen = await alle('muehle');
    const bruehgeraete = await alle('bruehgeraet');
    const ablaeufe = await alle('ablauf');
    const setups = await alle('setup');
    for (const setup of setups) {
      expect(muehlen.some((m) => m.id === setup.muehleId)).toBe(true);
      expect(bruehgeraete.some((b) => b.id === setup.bruehgeraetId)).toBe(true);
      expect(ablaeufe.some((a) => a.id === setup.ablaufId)).toBe(true);
    }
  });

  it('ueberschreibt nichts, wenn schon ein Bruehgeraet existiert — z.B. aus der Migration', async () => {
    await schreiben('bruehgeraet', BRUEHGERAETE[0]!);
    await seedFallsLeer();
    expect(await alle('muehle')).toHaveLength(0);
    expect(await alle('setup')).toHaveLength(0);
  });

  it('ist ohne zweiten Effekt erneut aufrufbar', async () => {
    await seedFallsLeer();
    await seedFallsLeer();
    expect(await alle('muehle')).toHaveLength(MUEHLEN.length);
  });
});
