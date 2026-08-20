// Node hat kein IndexedDB — das Polyfill muss vor jedem Import von db.ts stehen.
import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { schreiben, lesen, alle, loeschen, zaehlen, SchreibFehler, LeseFehler } from './ablage';
import { _datenbankZuruecksetzen, oeffneDB } from './db';
import { MUEHLE_SCULPTOR, MUEHLE_K6 } from './stammdaten';

beforeEach(async () => {
  // Ohne Reset wuerde fake-indexeddb Daten aus vorherigen Tests im selben
  // Prozess behalten, weil immer derselbe DB_NAME geoeffnet wird.
  await _datenbankZuruecksetzen();
});

describe('ablage — schreiben/lesen/loeschen', () => {
  it('schreibt und liest einen validen Datensatz', async () => {
    await schreiben('muehle', MUEHLE_SCULPTOR);
    const geladen = await lesen('muehle', MUEHLE_SCULPTOR.id);
    expect(geladen).toEqual(MUEHLE_SCULPTOR);
  });

  it('lesen() liefert undefined fuer eine nicht vorhandene Id', async () => {
    expect(await lesen('muehle', 'nicht-vorhanden')).toBeUndefined();
  });

  it('alle() liest die ganze Sammlung', async () => {
    await schreiben('muehle', MUEHLE_SCULPTOR);
    await schreiben('muehle', MUEHLE_K6);
    const bestand = await alle('muehle');
    expect(bestand).toHaveLength(2);
    expect(bestand.map((m) => m.id).sort()).toEqual([MUEHLE_K6.id, MUEHLE_SCULPTOR.id].sort());
  });

  it('zaehlen() zaehlt die Sammlung', async () => {
    expect(await zaehlen('muehle')).toBe(0);
    await schreiben('muehle', MUEHLE_SCULPTOR);
    expect(await zaehlen('muehle')).toBe(1);
  });

  it('loeschen() entfernt einen Datensatz', async () => {
    await schreiben('muehle', MUEHLE_SCULPTOR);
    await loeschen('muehle', MUEHLE_SCULPTOR.id);
    expect(await lesen('muehle', MUEHLE_SCULPTOR.id)).toBeUndefined();
  });

  it('schreiben() eines kaputten Datensatzes wirft SchreibFehler statt still zu scheitern', async () => {
    // rpmBereich ohne rpmEinstellbar verletzt das Refine in geraete.ts
    const kaputt = { ...MUEHLE_K6, rpmEinstellbar: false, rpmBereich: { min: 0, max: 1, schritt: 1 } };
    await expect(schreiben('muehle', kaputt as never)).rejects.toBeInstanceOf(SchreibFehler);
    expect(await zaehlen('muehle')).toBe(0);
  });

  it('lesen() eines Datensatzes, der nicht mehr dem aktuellen Schema entspricht, wirft LeseFehler', async () => {
    const db = await oeffneDB();
    // Direkt am Schema vorbei geschrieben — simuliert eine aeltere DB-Version.
    await db.put('muehle', { id: 'kaputt' } as never);
    await expect(lesen('muehle', 'kaputt')).rejects.toBeInstanceOf(LeseFehler);
  });

  it('alle() bricht bei der ersten kaputten Zeile, statt einen Teilbestand zurueckzugeben', async () => {
    await schreiben('muehle', MUEHLE_SCULPTOR);
    const db = await oeffneDB();
    await db.put('muehle', { id: 'kaputt' } as never);
    await expect(alle('muehle')).rejects.toBeInstanceOf(LeseFehler);
  });
});
