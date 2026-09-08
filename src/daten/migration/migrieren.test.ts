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

describe('migriereSeiten — gegen die echte Seed-Datei, lockere Zuordnung (>= 50 -> K6)', () => {
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

  it('die lockere Regel migriert deutlich mehr als die strenge Bereichspruefung — mindestens ein Profil je Kaffee', () => {
    // Vorher (strenge "gueltige Bereiche"): nur 1 Profil, 14 Shots.
    expect(ergebnis.profile.length).toBeGreaterThanOrEqual(8);
    expect(ergebnis.shots.length).toBeGreaterThan(14);
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
    expect(shotsDiesesKaffees.length).toBeGreaterThanOrEqual(14);
  });

  it('Espresso-Entcoffeiniert-Profil (MG 3.9, < 50) landet im Espresso-Setup', () => {
    const kaffee = ergebnis.kaffees.find((k) => k.name === 'Espresso Entcoffeiniert');
    const profil = ergebnis.profile.find((p) => p.kaffeeId === kaffee!.id);
    expect(profil?.setupId).toBe(SETUP_ESPRESSO.id);
  });

  it('Kimbo Shot 1 (MG 21 — im Notion-Text fälschlich als K6 dokumentiert) scheitert jetzt an fehlenden Parametern, nicht mehr an der Mühlen-Zuordnung', () => {
    // Kimbo hat wie Manaresi nie Yield/Zeit getrackt (K7, Moka) — bleibt
    // deshalb unmigriert, aber aus dem RICHTIGEN Grund: die alte, strenge
    // Regel hätte hier "außerhalb beider Setup-Bereiche" gemeldet.
    const eintrag = ergebnis.bericht.offen.find(
      (o) => o.quelle.includes('Kimbo') && o.quelle.includes('Bialetti 1er Shot 1'),
    );
    expect(eintrag?.was).toContain('fehlende Parameter');
    expect(eintrag?.was).not.toContain('Zahl lesbar');
  });

  it('Art Kaffee Pour-Over-Profil (MG 120, >= 50) landet im Moka-1-Setup als Annahme, sichtbar im Bericht', () => {
    const kaffee = ergebnis.kaffees.find((k) => k.name.startsWith('Art Kaffee'));
    const profil = ergebnis.profile.find((p) => p.kaffeeId === kaffee!.id && p.name === 'Pour Over');
    expect(profil?.setupId).toBe(SETUP_MOKA_1.id);
    expect(
      ergebnis.bericht.offen.some((o) => o.quelle.includes('Art Kaffee') && o.was.includes('Moka 1 Tasse')),
    ).toBe(true);
  });

  it('FairLangen (MG 3.35, frueher "außerhalb") wird jetzt migriert, nicht mehr ausgeschlossen', () => {
    const kaffee = ergebnis.kaffees.find((k) => k.name === 'FairLangen Espresso BIO');
    const profil = ergebnis.profile.find((p) => p.kaffeeId === kaffee!.id);
    expect(profil?.setupId).toBe(SETUP_ESPRESSO.id);
  });

  it('Manaresi (MG 65, >= 50) landet im Moka-1-Setup — Yield/Zeit fehlen dort aber, deshalb nur der Shot mit vollstaendigen Werten', () => {
    const kaffee = ergebnis.kaffees.find((k) => k.name.includes('Manaresi'));
    const profile = ergebnis.profile.filter((p) => p.kaffeeId === kaffee!.id);
    // Die Variante selbst hat keine Yield/Zeit (K7 — Moka hat das nie
    // getrackt) und wird deshalb gemeldet statt geschrieben.
    expect(profile).toHaveLength(0);
    expect(
      ergebnis.bericht.offen.some((o) => o.quelle.includes('Manaresi') && o.was.includes('fehlende Parameter')),
    ).toBe(true);
  });

  it('ein Wert, der gar keine Zahl ist ("unbekannt/sehr fein"), wird gemeldet statt geraten', () => {
    expect(
      ergebnis.bericht.offen.some((o) => o.quelle.includes('Manaresi') && o.was.includes('nicht als Zahl lesbar')),
    ).toBe(true);
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
    expect(zweiterLauf.shots.map((s) => s.id)).toEqual(ergebnis.shots.map((s) => s.id));
  });
});
