import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { migriereSeiten } from './migrieren';
import type { SeedSeite } from './pruefung';
import { SETUP_ESPRESSO, SETUP_MOKA_1 } from '../stammdaten';
import { Kaffee, Charge, Profil, Shot, Gussplan } from '../schema';

const SEED_PFAD = fileURLToPath(new URL('../../../daten/seed/notion-2026-08-20.json', import.meta.url));
const seed = JSON.parse(readFileSync(SEED_PFAD, 'utf8')) as { seiten: SeedSeite[]; gezogenAm: string };
const GEZOGEN_AM_MS = Date.parse(seed.gezogenAm);

describe('migriereSeiten — gegen die echte Seed-Datei', () => {
  const ergebnis = migriereSeiten(seed.seiten, GEZOGEN_AM_MS);

  it('schreibt alle 8 Kaffees', () => {
    expect(ergebnis.kaffees).toHaveLength(8);
    expect(ergebnis.bericht.kaffees).toBe(8);
  });

  it('jeder geschriebene Kaffee besteht das Zod-Schema', () => {
    for (const k of ergebnis.kaffees) expect(Kaffee.safeParse(k).success).toBe(true);
  });

  it('jede geschriebene Charge, jedes Profil, jeder Shot, jeder Gussplan besteht das Zod-Schema', () => {
    for (const c of ergebnis.chargen) expect(Charge.safeParse(c).success).toBe(true);
    for (const p of ergebnis.profile) expect(Profil.safeParse(p).success).toBe(true);
    for (const s of ergebnis.shots) expect(Shot.safeParse(s).success).toBe(true);
    for (const g of ergebnis.gussplaene) expect(Gussplan.safeParse(g).success).toBe(true);
  });

  it('jeder Kaffee bekommt genau eine Platzhalter-Charge als aktuelle Charge', () => {
    for (const k of ergebnis.kaffees) {
      expect(k.aktuelleChargeId).toBeDefined();
      expect(ergebnis.chargen.some((c) => c.id === k.aktuelleChargeId)).toBe(true);
    }
  });

  it('die 14 vormals verschuetteten Shots bei Espresso Entcoffeiniert sind darunter (Befund 1)', () => {
    const kaffee = ergebnis.kaffees.find((k) => k.name === 'Espresso Entcoffeiniert');
    expect(kaffee).toBeDefined();
    const shotsDiesesKaffees = ergebnis.shots.filter((s) => s.kaffeeId === kaffee!.id);
    // 14 Shots "Espresso" + 1 automatisch geschriebener "Ergebnis: –" — beide Formate.
    expect(shotsDiesesKaffees.length).toBeGreaterThanOrEqual(14);
  });

  it('Espresso-Entcoffeiniert-Profil landet im Espresso-Setup (Sculptor-Bereich)', () => {
    const kaffee = ergebnis.kaffees.find((k) => k.name === 'Espresso Entcoffeiniert');
    const profil = ergebnis.profile.find((p) => p.kaffeeId === kaffee!.id);
    expect(profil?.setupId).toBe(SETUP_ESPRESSO.id);
  });

  it('Manaresi (MG 65, K6-Moka-Bereich) wird gemeldet statt geraten — Notion hat fuer Moka nie Yield/Zeit getrackt (K7)', () => {
    const kaffee = ergebnis.kaffees.find((k) => k.name.includes('Manaresi'));
    const profilAnzahl = ergebnis.profile.filter((p) => p.kaffeeId === kaffee!.id).length;
    expect(profilAnzahl).toBe(0);
    expect(
      ergebnis.bericht.offen.some((o) => o.quelle.includes('Manaresi') && o.was.includes('fehlende Parameter')),
    ).toBe(true);
  });

  it('Befund: kein einziges Moka-Profil/-Shot hat in Notion je Yield/Zeit getrackt (K7) — die Moka-Annahme-Logik greift bei diesem Bestand nie, ist aber fuer zukuenftige Seiten vorhanden', () => {
    expect(ergebnis.profile.some((p) => p.setupId === SETUP_MOKA_1.id)).toBe(false);
    expect(ergebnis.shots.some((s) => s.setupId === SETUP_MOKA_1.id)).toBe(false);
  });

  it('FairLangen (MG ausserhalb beider Setup-Bereiche) wird nicht geschrieben, sondern gemeldet', () => {
    const kaffee = ergebnis.kaffees.find((k) => k.name === 'FairLangen Espresso BIO');
    const profilAnzahl = ergebnis.profile.filter((p) => p.kaffeeId === kaffee!.id).length;
    expect(profilAnzahl).toBe(0);
    expect(ergebnis.bericht.offen.some((o) => o.quelle.includes('FairLangen'))).toBe(true);
  });

  it('drei Kaffees sind entkoffeiniert', () => {
    expect(ergebnis.kaffees.filter((k) => k.entkoffeiniert)).toHaveLength(3);
  });

  it('kein Shot referenziert ein Profil, das nicht mitgeschrieben wurde', () => {
    const profilIds = new Set(ergebnis.profile.map((p) => p.id));
    for (const s of ergebnis.shots) expect(profilIds.has(s.profilId)).toBe(true);
  });

  it('jeder Shot referenziert seine eigene aktuelle Charge desselben Kaffees', () => {
    const chargeVonKaffee = new Map(ergebnis.kaffees.map((k) => [k.id, k.aktuelleChargeId]));
    for (const s of ergebnis.shots) expect(s.chargeId).toBe(chargeVonKaffee.get(s.kaffeeId));
  });

  it('migrierte Shots tragen das neutrale Urteil "okay" — Notion kennt keine Urteil-Stufen', () => {
    expect(ergebnis.shots.every((s) => s.urteil === 'okay')).toBe(true);
  });

  it('ist wiederholbar aufrufbar (idempotente Ids) — zweiter Lauf liefert identische Ids', () => {
    const zweiterLauf = migriereSeiten(seed.seiten, GEZOGEN_AM_MS);
    expect(zweiterLauf.kaffees.map((k) => k.id)).toEqual(ergebnis.kaffees.map((k) => k.id));
  });
});
