import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import {
  schnappschussAnlegen,
  schnappschuesse,
  schnappschussZurueckspielen,
  schnappschussLoeschen,
  WIEVIELE_BLEIBEN,
} from './schnappschuss';
import { alle, schreiben, loeschen } from './ablage';
import { _datenbankZuruecksetzen, oeffneDB } from './db';
import { MUEHLE_SCULPTOR, MUEHLE_K6 } from './stammdaten';

beforeEach(async () => {
  await _datenbankZuruecksetzen();
});

/**
 * Zwei Sicherungen im selben Millisekundentakt wuerden dieselbe Id tragen —
 * in den Tests laeuft alles zu schnell, im Betrieb liegen Aktualisierungen
 * Tage auseinander. Deshalb hier ausdruecklich Zeit vergehen lassen.
 */
async function kurzWarten() {
  await new Promise((weiter) => setTimeout(weiter, 2));
}

describe('Sicherung vor der Aktualisierung', () => {
  it('haelt den Bestand fest und meldet seinen Umfang', async () => {
    await schreiben('muehle', MUEHLE_SCULPTOR);
    await schreiben('muehle', MUEHLE_K6);

    const eintrag = await schnappschussAnlegen('vor der Aktualisierung');

    expect(eintrag.anlass).toBe('vor der Aktualisierung');
    expect(eintrag.umfang.shots).toBe(0);
    expect(eintrag.datei.sammlungen.muehle).toHaveLength(2);
  });

  it('spielt einen geloeschten Bestand wieder ein', async () => {
    await schreiben('muehle', MUEHLE_SCULPTOR);
    const eintrag = await schnappschussAnlegen('vor der Aktualisierung');

    await loeschen('muehle', MUEHLE_SCULPTOR.id);
    expect(await alle('muehle')).toHaveLength(0);

    await schnappschussZurueckspielen(eintrag.id);
    expect(await alle('muehle')).toHaveLength(1);
  });

  /**
   * Der Grund, warum der Store ausserhalb von SAMMLUNGEN liegt (db.ts): laege
   * er drin, wuerde das Zurueckspielen die uebrigen Sicherungen mit dem alten
   * Stand ueberschreiben — ausgerechnet das, was man danach noch braucht,
   * wenn auch der erste Versuch danebenging.
   */
  it('ueberlebt das Zurueckspielen selbst', async () => {
    const erste = await schnappschussAnlegen('erste');
    await kurzWarten();
    await schreiben('muehle', MUEHLE_K6);
    const zweite = await schnappschussAnlegen('zweite');

    await schnappschussZurueckspielen(erste.id);

    const uebrig = (await schnappschuesse()).map((e) => e.id);
    expect(uebrig).toContain(erste.id);
    expect(uebrig).toContain(zweite.id);
  });

  it(`behaelt die letzten ${WIEVIELE_BLEIBEN} und wirft aeltere weg`, async () => {
    for (let i = 0; i < WIEVIELE_BLEIBEN + 2; i++) {
      await schnappschussAnlegen(`Lauf ${i}`);
      await kurzWarten();
    }

    const liste = await schnappschuesse();
    expect(liste).toHaveLength(WIEVIELE_BLEIBEN);
    expect(liste[0]!.anlass).toBe(`Lauf ${WIEVIELE_BLEIBEN + 1}`);
  });

  it('liefert die neueste zuerst', async () => {
    await schnappschussAnlegen('alt');
    await kurzWarten();
    await schnappschussAnlegen('neu');

    expect((await schnappschuesse())[0]!.anlass).toBe('neu');
  });

  it('meldet eine Sicherung, die es nicht mehr gibt, statt still nichts zu tun', async () => {
    await expect(schnappschussZurueckspielen('gibt-es-nicht')).rejects.toThrow();
  });

  it('loeschen entfernt genau eine', async () => {
    const erste = await schnappschussAnlegen('erste');
    await kurzWarten();
    await schnappschussAnlegen('zweite');

    await schnappschussLoeschen(erste.id);

    const liste = await schnappschuesse();
    expect(liste).toHaveLength(1);
    expect(liste[0]!.anlass).toBe('zweite');
  });

  /** Sicherungen gehoeren nicht in den Datei-Export — sonst schachteln sie sich. */
  it('taucht nicht im Datei-Export auf', async () => {
    await schnappschussAnlegen('vor der Aktualisierung');
    const db = await oeffneDB();
    expect(await db.count('schnappschuss')).toBe(1);

    const { exportiere } = await import('./export');
    const datei = await exportiere();
    expect(Object.keys(datei.sammlungen)).not.toContain('schnappschuss');
  });
});
