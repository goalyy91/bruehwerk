/**
 * Waechter fuer die Datenblatt-Erfassung. Die 60 Blaetter kommen ueber Monate
 * in Haeppchen dazu, von Hand abgetippt — diese Pruefungen fangen genau die
 * Fehler, die man dabei macht und im Bild nicht sieht: eine doppelte Nummer,
 * eine Kategorie, die es nicht gibt (und dann still als zehnte auftaucht),
 * ein Querverweis ins Leere.
 */
import { describe, it, expect } from 'vitest';
import { DATENBLAETTER, FLAESCHCHEN_GESAMT, datenblattZu } from './aroma-datenblaetter';
import { AROMASET_SCA, AROMASET_LENEZ } from './aromen';

const SCA_KATEGORIEN = new Set(AROMASET_SCA.kategorien.map((k) => k.id));

describe('Datenblaetter — Erfassungsfehler, die man im Bild nicht sieht', () => {
  it('vergibt jede Flaeschchennummer hoechstens einmal', () => {
    const nummern = DATENBLAETTER.map((b) => b.nummer);
    expect(new Set(nummern).size).toBe(nummern.length);
  });

  it('haelt alle Nummern im Bereich des Kartons', () => {
    for (const blatt of DATENBLAETTER) {
      expect(blatt.nummer, blatt.name).toBeGreaterThanOrEqual(1);
      expect(blatt.nummer, blatt.name).toBeLessThanOrEqual(FLAESCHCHEN_GESAMT);
    }
  });

  it('nutzt nur Kategorien, die es im SCA-Set wirklich gibt (K55)', () => {
    for (const blatt of DATENBLAETTER) {
      expect(SCA_KATEGORIEN.has(blatt.kategorieId), `${blatt.name}: ${blatt.kategorieId}`).toBe(true);
    }
  });

  it('verweist nur auf gueltige Nummern und nie auf sich selbst', () => {
    for (const blatt of DATENBLAETTER) {
      for (const v of blatt.verwandte) {
        expect(v.nummer, `${blatt.name} -> ${v.original}`).toBeGreaterThanOrEqual(1);
        expect(v.nummer, `${blatt.name} -> ${v.original}`).toBeLessThanOrEqual(FLAESCHCHEN_GESAMT);
        expect(v.nummer, `${blatt.name} verweist auf sich selbst`).not.toBe(blatt.nummer);
      }
    }
  });

  it('laesst kein Blatt ohne Beschreibung und ohne Kaffee-Teil', () => {
    for (const blatt of DATENBLAETTER) {
      expect(blatt.beschreibung.length, blatt.name).toBeGreaterThan(0);
      expect(blatt.imKaffee.length, blatt.name).toBeGreaterThan(0);
    }
  });
});

describe('Le-Nez-Set wird aus den Datenblaettern gebaut', () => {
  const alleAromen = AROMASET_LENEZ.kategorien.flatMap((k) => k.gruppen.flatMap((g) => g.aromen));

  it('fuehrt genau 60 Flaeschchen, luckenlos von 1 bis 60', () => {
    expect(alleAromen).toHaveLength(FLAESCHCHEN_GESAMT);
    const nummern = alleAromen.map((a) => a.nummer).sort((x, y) => (x ?? 0) - (y ?? 0));
    expect(nummern).toEqual(Array.from({ length: FLAESCHCHEN_GESAMT }, (_, i) => i + 1));
  });

  it('beschriftet erfasste Flaeschchen mit ihrem echten Namen', () => {
    for (const blatt of DATENBLAETTER) {
      const aroma = alleAromen.find((a) => a.nummer === blatt.nummer);
      expect(aroma?.label, `Nr. ${blatt.nummer}`).toBe(blatt.name);
    }
  });

  it('markiert nicht erfasste Flaeschchen als solche, statt sie zu erfinden', () => {
    const offen = alleAromen.filter((a) => a.nummer !== undefined && !datenblattZu(a.nummer));
    expect(offen.length).toBe(FLAESCHCHEN_GESAMT - DATENBLAETTER.length);
    for (const a of offen) expect(a.label).toBe(`Nr. ${a.nummer} (noch nicht erfasst)`);
  });

  it('haengt die offenen Flaeschchen ans Ende, nicht zwischen die Kategorien', () => {
    const letzte = AROMASET_LENEZ.kategorien[AROMASET_LENEZ.kategorien.length - 1];
    expect(letzte?.id).toBe('nicht-erfasst');
  });

  it('bindet Ids an die Nummer, damit Uebungsdaten Haeppchen ueberleben', () => {
    for (const a of alleAromen) expect(a.id).toBe(`flaeschchen-${a.nummer}`);
  });

  it('bleibt Platzhalter, solange Blaetter fehlen', () => {
    expect(AROMASET_LENEZ.platzhalter).toBe(DATENBLAETTER.length < FLAESCHCHEN_GESAMT);
  });
});

describe('Die ersten drei Blaetter (21, 39, 40)', () => {
  it('kennt Buttersaeure als Nr. 21 in Sauer/Fermentiert', () => {
    const b = datenblattZu(21);
    expect(b?.name).toBe('Buttersäure');
    expect(b?.nameOriginal).toBe('Butyric Acid');
    expect(b?.kategorieId).toBe('sauer-fermentiert');
  });

  it('verlinkt Teer und Gummi wechselseitig — die Querverweise sind begehbar', () => {
    expect(datenblattZu(39)?.verwandte.some((v) => v.nummer === 40)).toBe(true);
    expect(datenblattZu(40)?.verwandte.some((v) => v.nummer === 39)).toBe(true);
  });

  it('haelt noch nicht erfasste Verweise mit ihrem gedruckten Wort fest', () => {
    // Nr. 41 (Tabak) ist noch nicht erfasst — der Verweis darf trotzdem nicht
    // zu einem nackten "Nr. 41" verkuemmern.
    const tabak = datenblattZu(39)?.verwandte.find((v) => v.nummer === 41);
    expect(tabak?.original).toBe('Tabak');
    expect(datenblattZu(41)).toBeUndefined();
  });
});
