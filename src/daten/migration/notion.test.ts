import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseKaffeeSeite } from './notion';

const SEED_PFAD = fileURLToPath(new URL('../../../daten/seed/notion-2026-08-20.json', import.meta.url));
const seed = JSON.parse(readFileSync(SEED_PFAD, 'utf8')) as {
  seiten: { titel: string; inhalt: string }[];
};

function seite(titel: string) {
  const gefunden = seed.seiten.find((s) => s.titel === titel);
  if (!gefunden) throw new Error(`Seed-Seite "${titel}" nicht gefunden`);
  return gefunden;
}

describe('parseKaffeeSeite — gegen die echte Seed-Datei', () => {
  it('Manaresi liefert 5 Shots, nicht 0 — der Regressionstest fuer Befund 1', () => {
    const entwurf = parseKaffeeSeite(seite('Manaresi Caffè Arabica').inhalt);
    expect(entwurf.shots).toHaveLength(5);
    expect(entwurf.shots.map((s) => s.nummer)).toEqual([1, 2, 3, 4, 5]);
    expect(entwurf.shots.every((s) => s.gruppe === 'Bialetti')).toBe(true);
  });

  it('Espresso Entcoffeiniert: gemischte Ebenen (#### und ###) ergeben 15 Shots, keine verschluckt', () => {
    const entwurf = parseKaffeeSeite(seite('Espresso Entcoffeiniert').inhalt);
    expect(entwurf.shots).toHaveLength(15);
    expect(entwurf.shots.every((s) => s.gruppe === 'Espresso')).toBe(true);
  });

  it('Kimbo: zwei Geraete-Gruppen (Bialetti 1er / 3er) bleiben getrennt', () => {
    const entwurf = parseKaffeeSeite(seite('Kimbo Espresso Barista Decaf').inhalt);
    const gruppen = new Set(entwurf.shots.map((s) => s.gruppe));
    expect(gruppen).toEqual(new Set(['Bialetti 1er', 'Bialetti 3er']));
    expect(entwurf.shots.filter((s) => s.gruppe === 'Bialetti 1er')).toHaveLength(5);
    expect(entwurf.shots.filter((s) => s.gruppe === 'Bialetti 3er')).toHaveLength(3);
  });

  it('MG-Parameter kommt roh und unausgewertet aus dem Parser — Manaresi Shot 2 hat MG 30', () => {
    const entwurf = parseKaffeeSeite(seite('Manaresi Caffè Arabica').inhalt);
    const shot2 = entwurf.shots.find((s) => s.nummer === 2);
    expect(shot2?.parameter['MG']).toBe('30');
  });

  it('Varianten aus Manaresi: eine Profil-Variante "Bialetti", Standard und Laufend', () => {
    const entwurf = parseKaffeeSeite(seite('Manaresi Caffè Arabica').inhalt);
    expect(entwurf.profile).toHaveLength(1);
    expect(entwurf.profile[0]).toMatchObject({
      varianteName: 'Bialetti',
      standard: true,
      laufend: true,
      parameter: { Dose: '7.5g', MG: '65' },
    });
  });

  it('Gussplan aus Huila: drei Bausteine mit Rolle (Bloom/Hauptguss/Drawdown)', () => {
    const entwurf = parseKaffeeSeite(seite('Huila Women Coffee').inhalt);
    expect(entwurf.gussbausteine).toHaveLength(3);
    expect(entwurf.gussbausteine.map((b) => b.rolle)).toEqual(['Bloom', 'Hauptguss', 'Drawdown']);
    expect(entwurf.gussbausteine[0]).toMatchObject({ menge: '50g', dauer: '0:30', rolle: 'Bloom' });
  });

  it('Gussplan aus Art Kaffee: ein Baustein ohne "Rolle:"-Praefix bleibt reiner Text', () => {
    const entwurf = parseKaffeeSeite(seite('Art Kaffee – Single Origin Filterkaffee (Äthiopien Limu Grade 1)').inhalt);
    expect(entwurf.gussbausteine).toHaveLength(2);
    expect(entwurf.gussbausteine[1]).toMatchObject({ menge: '214g', dauer: '–', rolle: '' });
    expect(entwurf.gussbausteine[1]?.text).toContain('Kontinuierlicher Guss bis 250g');
  });

  it('Seiten ohne Dial-in Log liefern 0 Shots, keinen Fehler', () => {
    expect(parseKaffeeSeite(seite('Huila Women Coffee').inhalt).shots).toEqual([]);
    expect(parseKaffeeSeite(seite('Bio Espresso DECAF No. 19').inhalt).shots).toEqual([]);
  });

  it('Gesamtbestand: mehr Shots als die alte, kaputte Zaehlung — Regressionsschutz nach oben', () => {
    const gesamt = seed.seiten.reduce((n, s) => n + parseKaffeeSeite(s.inhalt).shots.length, 0);
    // 15 (Espresso Entcoffeiniert) + 0 (Huila) + 8 (FairLangen) + 0 (Bio Decaf 19)
    // + 15 (Red Honey) + 8 (Art Kaffee) + 8 (Kimbo) + 5 (Manaresi) = 59
    expect(gesamt).toBe(59);
  });
});
