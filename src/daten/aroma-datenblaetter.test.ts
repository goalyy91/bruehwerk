/**
 * Waechter fuer die Datenblatt-Erfassung. Die 60 Blaetter kommen ueber Monate
 * in Haeppchen dazu, von Hand abgetippt — diese Pruefungen fangen genau die
 * Fehler, die man dabei macht und im Bild nicht sieht: eine doppelte Nummer,
 * eine Kategorie, die es nicht gibt (und dann still als zehnte auftaucht),
 * ein Querverweis ins Leere.
 */
import { describe, it, expect } from 'vitest';
import { DATENBLAETTER, FLAESCHCHEN, FLAESCHCHEN_GESAMT, datenblattZu, flaeschchenZu } from './aroma-datenblaetter';
import { AROMASET_SCA, AROMASET_LENEZ } from './aromen';

const SCA_KATEGORIEN = new Set(AROMASET_SCA.kategorien.map((k) => k.id));
const SCA_GRUPPEN = new Set(AROMASET_SCA.kategorien.flatMap((k) => k.gruppen.map((g) => g.id)));
const SCA_AROMEN = new Set(AROMASET_SCA.kategorien.flatMap((k) => k.gruppen.flatMap((g) => g.aromen.map((a) => a.id))));

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

describe('Kurzindex (FLAESCHCHEN) — Nummer, Name, Kategorie aller 60', () => {
  it('fuehrt genau 60 Flaeschchen, luckenlos von 1 bis 60, keine doppelt', () => {
    expect(FLAESCHCHEN).toHaveLength(FLAESCHCHEN_GESAMT);
    const nummern = FLAESCHCHEN.map((f) => f.nummer).sort((x, y) => x - y);
    expect(nummern).toEqual(Array.from({ length: FLAESCHCHEN_GESAMT }, (_, i) => i + 1));
  });

  it('nutzt nur Kategorien, die es im SCA-Set wirklich gibt (K55)', () => {
    for (const f of FLAESCHCHEN) {
      expect(SCA_KATEGORIEN.has(f.kategorieId), `${f.name}: ${f.kategorieId}`).toBe(true);
    }
  });

  it('verweist mit sca.gruppeId und sca.aromaId nur auf Ids, die es im SCA-Set gibt', () => {
    for (const f of FLAESCHCHEN) {
      if (!f.sca) continue;
      expect(SCA_GRUPPEN.has(f.sca.gruppeId), `${f.name} -> Gruppe ${f.sca.gruppeId}`).toBe(true);
      if (f.sca.aromaId) {
        expect(SCA_AROMEN.has(f.sca.aromaId), `${f.name} -> Aroma ${f.sca.aromaId}`).toBe(true);
      }
    }
  });

  it('deckt sich mit den bereits erfassten Volltext-Blaettern (Nummer, Name, Kategorie)', () => {
    for (const blatt of DATENBLAETTER) {
      const kurz = flaeschchenZu(blatt.nummer);
      expect(kurz?.name, `Nr. ${blatt.nummer}`).toBe(blatt.name);
      expect(kurz?.kategorieId, `Nr. ${blatt.nummer}`).toBe(blatt.kategorieId);
    }
  });
});

describe('Le-Nez-Set wird aus dem Kurzindex gebaut', () => {
  const alleAromen = AROMASET_LENEZ.kategorien.flatMap((k) => k.gruppen.flatMap((g) => g.aromen));

  it('fuehrt genau 60 Flaeschchen mit ihrem echten Namen', () => {
    expect(alleAromen).toHaveLength(FLAESCHCHEN_GESAMT);
    for (const f of FLAESCHCHEN) {
      const aroma = alleAromen.find((a) => a.nummer === f.nummer);
      expect(aroma?.label, `Nr. ${f.nummer}`).toBe(f.name);
    }
  });

  it('bindet Ids an die Nummer, damit Uebungsdaten Haeppchen ueberleben', () => {
    for (const a of alleAromen) expect(a.id).toBe(`flaeschchen-${a.nummer}`);
  });

  it('ist kein Platzhalter mehr — die Namen sind echt, nur der Volltext waechst noch', () => {
    expect(AROMASET_LENEZ.platzhalter).toBe(false);
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
