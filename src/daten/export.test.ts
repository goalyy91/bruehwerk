import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { exportiere, importiere, ImportFehler, EXPORT_SCHEMA_VERSION } from './export';
import { alle, schreiben } from './ablage';
import { _datenbankZuruecksetzen } from './db';
import { MUEHLE_SCULPTOR, MUEHLE_K6, BRUEHGERAET_MOZZAFIATO } from './stammdaten';

beforeEach(async () => {
  await _datenbankZuruecksetzen();
});

describe('export/import — Rundlauf', () => {
  it('exportiere() liefert einen leeren Bestand mit Schema-Version und Zeitstempel', async () => {
    const datei = await exportiere();
    expect(datei.schemaVersion).toBe(EXPORT_SCHEMA_VERSION);
    expect(datei.erzeugtAm).toBeGreaterThan(0);
    expect(datei.sammlungen.muehle).toEqual([]);
  });

  it('exportieren -> importieren in eine frische Datenbank ergibt denselben Bestand', async () => {
    await schreiben('muehle', MUEHLE_SCULPTOR);
    await schreiben('muehle', MUEHLE_K6);
    await schreiben('bruehgeraet', BRUEHGERAET_MOZZAFIATO);

    const datei = await exportiere();

    await _datenbankZuruecksetzen();
    await importiere(datei);

    const muehlen = await alle('muehle');
    const bruehgeraete = await alle('bruehgeraet');
    expect(muehlen.map((m) => m.id).sort()).toEqual([MUEHLE_K6.id, MUEHLE_SCULPTOR.id].sort());
    expect(bruehgeraete).toEqual([BRUEHGERAET_MOZZAFIATO]);
  });

  it('ein Backup mit einem kaputten Datensatz wird komplett abgelehnt — nichts wird geschrieben', async () => {
    const datei = await exportiere();
    const kaputterBestand = {
      ...datei,
      sammlungen: {
        ...datei.sammlungen,
        muehle: [{ id: 'kaputt' /* fehlt: name, skala, rpmEinstellbar */ }],
      },
    };

    await expect(importiere(kaputterBestand)).rejects.toBeInstanceOf(ImportFehler);
    expect(await alle('muehle')).toEqual([]);
  });

  it('ein Backup mit einem gueltigen UND einem kaputten Datensatz in derselben Sammlung schreibt gar nichts', async () => {
    const datei = await exportiere();
    const gemischt = {
      ...datei,
      sammlungen: {
        ...datei.sammlungen,
        muehle: [MUEHLE_SCULPTOR, { id: 'kaputt' }],
      },
    };

    await expect(importiere(gemischt)).rejects.toBeInstanceOf(ImportFehler);
    expect(await alle('muehle')).toEqual([]);
  });
});
