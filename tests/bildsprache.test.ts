import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Die Bildsprache als Test, nicht als Absichtserklaerung.
 *
 * Julian, 2026-09-07: *"lass uns so vorgehen, dass wir ganz sicher keinen
 * Screen vergessen und auch jeden Screen mit der gleichen Intensitaet
 * bearbeiten."* Seine drei Funde davor — `.text-eingabe`, `.panel`, der alte
 * Look beim Bestand-Korrigieren — waren allesamt **lokale Kopien** von etwas,
 * das zentral laengst existiert. Kopien driften, und zwar unbemerkt, bis
 * jemand sie am Geraet sieht.
 *
 * Dieselbe Antwort wie bei der Architekturregel (tests/schichten.test.ts):
 * die Regel bricht den Build, statt in einem Dokument zu stehen.
 *
 * **Sperrklinke, kein grosser Knall.** Die noch betroffenen Dateien
 * stehen unten namentlich. Der Test schlaegt an, wenn
 *
 *   - eine Datei **ausserhalb** der Liste etwas kopiert  -> nichts Neues
 *     kann hinzukommen;
 *   - eine Datei **auf** der Liste sauber ist            -> die Liste kann
 *     nicht verrotten, jede aufgeraeumte Datei muss ausgetragen werden.
 *
 * Damit kann die Zahl nur fallen. Sie ist die ehrliche Antwort auf "wie
 * viele Bildschirme fehlen noch".
 */

const WURZEL = fileURLToPath(new URL('..', import.meta.url));
const BEREICHE = join(WURZEL, 'src', 'bereiche');

/** Was zentral existiert und deshalb nicht lokal nachgebaut werden darf. */
const REGELN = [
  {
    name: 'eigenes .panel statt muster/Blattliste.svelte',
    pruefen: (s: string) => /^\s*\.panel\s*\{/m.test(s),
  },
  {
    name: 'eigener Gruppenkopf statt des globalen h2 aus tokens.css',
    pruefen: (s: string) => /^\s*\.gruppenkopf\s*\{/m.test(s),
  },
  {
    name: 'eigene Feldkopie statt der globalen .eingabefeld-text',
    pruefen: (s: string) => /^\s*\.text-eingabe\s*\{/m.test(s),
  },
  {
    name: 'Formularzeilen ohne Karte (Blattliste) drumherum',
    pruefen: (s: string) => /class="formularzeile/.test(s) && !/Blattliste/.test(s),
  },
  {
    /**
     * Serif ist die Anzeigenschrift (Namen, Titel, Zahlen). Was man bedient,
     * traegt Sans — siehe Commit "Zug A".
     *
     * Die Unterscheidung ist nicht immer mechanisch moeglich: eine antippbare
     * Kachel, die einen *Getraenkenamen* zeigt, ist Inhalt und darf Serif
     * behalten (Bar.svelte). Solche Faelle tragen den Vermerk
     * `Serif bewusst` in derselben Regel — das erzwingt eine Entscheidung,
     * statt sie stillschweigend durchzulassen.
     */
    name: 'Serif auf einem Bedienelement statt --schrift-sans',
    pruefen: (s: string) =>
      (s.match(/\{[^{}]*\}/g) ?? []).some(
        (block) =>
          block.includes('font-family: var(--schrift);') &&
          !block.includes('Serif bewusst') &&
          /cursor: pointer|background: var\(--vertiefung\)/.test(block),
      ),
  },
] as const;

/**
 * Stand 2026-09-08 nach Runde 2. Diese Dateien duerfen noch, alle anderen
 * nicht. **Wer eine davon aufraeumt, traegt sie hier aus** — sonst schlaegt
 * der Test an.
 */
const ALTLASTEN: readonly string[] = [
  'Musterblatt.svelte',
  'einstellungen/Aromadatenblatt.svelte',
  'einstellungen/Bruehgeraetblatt.svelte',
  'einstellungen/Migration.svelte',
  'einstellungen/Muehleblatt.svelte',
  'einstellungen/Personen.svelte',
  'einstellungen/Setupblatt.svelte',
  'einstellungen/TempReferenz.svelte',
  'historie/Historie.svelte',
  'historie/Shotblatt.svelte',
  'kaffees/GussplanEditor.svelte',
  'kaffees/KaffeeBearbeiten.svelte',
  'kaffees/Profilblatt.svelte',
  'tasting/Verkostungsbogen.svelte',
];

function alleBildschirme(verzeichnis: string): string[] {
  const gefunden: string[] = [];
  for (const eintrag of readdirSync(verzeichnis)) {
    const pfad = join(verzeichnis, eintrag);
    if (statSync(pfad).isDirectory()) gefunden.push(...alleBildschirme(pfad));
    else if (eintrag.endsWith('.svelte')) gefunden.push(pfad);
  }
  return gefunden;
}

/** Pfad relativ zu src/bereiche, mit Schrägstrichen — plattformunabhängig. */
function kurzname(pfad: string): string {
  return relative(BEREICHE, pfad).split('\\').join('/');
}

function verstoesse(pfad: string): string[] {
  const inhalt = readFileSync(pfad, 'utf8');
  return REGELN.filter((r) => r.pruefen(inhalt)).map((r) => r.name);
}

describe('Bildsprache — kein Bildschirm baut nach, was es zentral gibt', () => {
  const bildschirme = alleBildschirme(BEREICHE);

  it('findet ueberhaupt Bildschirme (sonst prueft der Test nichts)', () => {
    expect(bildschirme.length).toBeGreaterThan(20);
  });

  it('kein Bildschirm ausserhalb der Altlasten-Liste kopiert etwas', () => {
    const neu = bildschirme
      .map((p) => ({ datei: kurzname(p), funde: verstoesse(p) }))
      .filter((e) => e.funde.length > 0 && !ALTLASTEN.includes(e.datei));

    expect(
      neu,
      `Neue lokale Kopie(n). Statt nachzubauen die zentrale Fassung nutzen:\n` +
        neu.map((e) => `  ${e.datei}\n    - ${e.funde.join('\n    - ')}`).join('\n'),
    ).toEqual([]);
  });

  it('die Altlasten-Liste enthaelt nichts, was laengst sauber ist', () => {
    const bekannt = new Map(bildschirme.map((p) => [kurzname(p), verstoesse(p)]));
    const erledigt = ALTLASTEN.filter((d) => (bekannt.get(d) ?? []).length === 0);

    expect(
      erledigt,
      `Aufgeraeumt, aber noch als Altlast gefuehrt — bitte aus ALTLASTEN austragen:\n` +
        erledigt.map((d) => `  ${d}`).join('\n'),
    ).toEqual([]);
  });

  it('nennt jede Altlast auch wirklich (kein Eintrag zeigt ins Leere)', () => {
    const vorhanden = new Set(bildschirme.map(kurzname));
    const geister = ALTLASTEN.filter((d) => !vorhanden.has(d));
    expect(geister, `Eintraege ohne Datei: ${geister.join(', ')}`).toEqual([]);
  });
});
