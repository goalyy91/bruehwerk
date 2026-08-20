import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { pruefeSeiten, type SeedSeite } from './pruefung';

const SEED_PFAD = fileURLToPath(new URL('../../../daten/seed/notion-2026-08-20.json', import.meta.url));
const seed = JSON.parse(readFileSync(SEED_PFAD, 'utf8')) as { seiten: SeedSeite[] };

describe('pruefeSeiten — gegen die echte Seed-Datei', () => {
  const bericht = pruefeSeiten(seed.seiten);

  it('findet alle 8 Kaffees und zaehlt Profile/Shots korrekt', () => {
    expect(bericht.zahlen.kaffees).toBe(8);
    expect(bericht.zahlen.shots).toBe(59);
  });

  it('Manaresi Shot 2 (MG 30) landet im Prueflauf statt geraten zu werden', () => {
    const eintrag = bericht.offen.find((o) => o.quelle.includes('Manaresi') && o.quelle.includes('Shot 2'));
    expect(eintrag).toBeDefined();
    expect(eintrag?.was).toContain('MG 30');
  });

  it('Manaresi Shot 5 / Profil (MG 65) wird dem K6 zugeordnet', () => {
    const manaresi = bericht.kaffees.find((k) => k.titel.includes('Manaresi'));
    const shot5 = manaresi?.shots.find((s) => s.nummer === 5);
    expect(shot5?.muehle).toBe('k6');
    expect(manaresi?.profile[0]?.muehle).toBe('k6'); // Profil-MG ist ebenfalls 65
  });

  it('Espresso-Entcoffeiniert-Profil (MG 3.9) wird dem Sculptor zugeordnet', () => {
    const kaffee = bericht.kaffees.find((k) => k.titel === 'Espresso Entcoffeiniert');
    expect(kaffee?.profile[0]?.muehle).toBe('sculptor');
  });

  it('FairLangen-Profil (MG 3.35, ausserhalb des dokumentierten Espresso-Bereichs) landet im Bericht', () => {
    const fairlangen = bericht.kaffees.find((k) => k.titel === 'FairLangen Espresso BIO');
    expect(fairlangen?.profile[0]?.muehle).toBeNull();
    expect(bericht.offen.some((o) => o.quelle.includes('FairLangen') && o.was.includes('3.35'))).toBe(true);
  });

  it('Art Kaffee Pour-Over-Shots mit K6 im dreistelligen Click-Bereich sind ambig und landen im Bericht', () => {
    const artKaffee = bericht.kaffees.find((k) => k.titel.startsWith('Art Kaffee'));
    const shot3 = artKaffee?.shots.find((s) => s.nummer === 3 && s.gruppe === 'Pour Over');
    expect(shot3?.muehle).toBeNull(); // MG 100 Clicks faellt nicht in den Moka-Bereich 60-70
  });

  it('entkoffeiniert wird aus dem Titel erkannt', () => {
    const decafs = bericht.kaffees.filter((k) => k.entkoffeiniert).map((k) => k.titel);
    expect(decafs).toEqual(
      expect.arrayContaining(['Espresso Entcoffeiniert', 'Bio Espresso DECAF No. 19', 'Kimbo Espresso Barista Decaf']),
    );
    expect(decafs).toHaveLength(3);
  });

  it('Bewertung liest Sterne-Emoji als Zahl', () => {
    const fairlangen = bericht.kaffees.find((k) => k.titel === 'FairLangen Espresso BIO');
    expect(fairlangen?.bewertung).toBe(4);
  });

  it('jeder Röster ist vorhanden — keine offenen Punkte dafür bei diesem Bestand', () => {
    expect(bericht.offen.some((o) => o.was === 'Kaffee ohne Röster')).toBe(false);
  });
});
