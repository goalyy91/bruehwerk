import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Die Architekturregel als Test, nicht als Absichtserklaerung.
 *
 * domain/ und daten/ importieren nichts von Svelte. Damit sind die teuren
 * Teile — Planer, Totzonen, Spielraum, Ranking — ohne Bildschirm testbar,
 * und ein Framework-Wechsel liesse genau den Teil stehen, der Arbeit war.
 *
 * Eine Regel, die nur in der CLAUDE.md steht, haelt genau bis zu dem Tag,
 * an dem sie unbequem wird. Diese hier bricht den Build.
 */

const WURZEL = fileURLToPath(new URL('..', import.meta.url));
const SRC = join(WURZEL, 'src');

function statSyncOderNull(pfad: string) {
  try {
    return statSync(pfad);
  } catch {
    return null;
  }
}

/** Was in den reinen Schichten nichts zu suchen hat. */
const VERBOTEN = [
  { muster: /^svelte(\/|$)/, grund: 'Svelte' },
  { muster: /^@sveltejs\//, grund: 'Svelte' },
  { muster: /\.svelte$/, grund: 'eine Svelte-Komponente' },
];

/** Nur daten/ darf den Browser kennen — domain/ nicht einmal das. */
const NUR_DOMAIN_VERBOTEN = [{ muster: /^idb(\/|$)/, grund: 'IndexedDB' }];

const IMPORT_QUELLE =
  /(?:^|\n)\s*(?:import|export)[\s\S]*?from\s*['"]([^'"]+)['"]|(?:^|[^.\w])import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

function dateienUnter(verzeichnis: string): string[] {
  // Die Schicht existiert am Projektanfang noch nicht — das ist kein
  // Regelverstoss, sondern schlicht "noch nichts zu pruefen".
  if (!statSyncOderNull(verzeichnis)?.isDirectory()) return [];

  let treffer: string[] = [];
  for (const eintrag of readdirSync(verzeichnis)) {
    const pfad = join(verzeichnis, eintrag);
    if (statSync(pfad).isDirectory()) {
      treffer = treffer.concat(dateienUnter(pfad));
    } else if (/\.(ts|js|svelte)$/.test(eintrag)) {
      treffer.push(pfad);
    }
  }
  return treffer;
}

function importeIn(pfad: string): string[] {
  const quelle = readFileSync(pfad, 'utf8');
  const treffer: string[] = [];
  for (const m of quelle.matchAll(IMPORT_QUELLE)) {
    const spezifizierer = m[1] ?? m[2];
    if (spezifizierer) treffer.push(spezifizierer);
  }
  return treffer;
}

describe('src/domain — reine Rechnerei', () => {
  const dateien = dateienUnter(join(SRC, 'domain'));

  it('enthaelt ueberhaupt Code', () => {
    expect(dateien.length).toBeGreaterThan(0);
  });

  it.each(dateien.map((p) => [relative(WURZEL, p), p] as const))(
    '%s importiert weder Svelte noch IndexedDB',
    (_name, pfad) => {
      const verstoesse = importeIn(pfad).flatMap((spez) =>
        [...VERBOTEN, ...NUR_DOMAIN_VERBOTEN]
          .filter((v) => v.muster.test(spez))
          .map((v) => `${spez} (${v.grund})`),
      );
      expect(verstoesse).toEqual([]);
    },
  );

  it('enthaelt keine Svelte-Komponenten', () => {
    expect(dateien.filter((p) => p.endsWith('.svelte'))).toEqual([]);
  });
});

describe('src/daten — Persistenz ohne Oberflaeche', () => {
  const dateien = dateienUnter(join(SRC, 'daten'));

  it.each(dateien.length ? dateien.map((p) => [relative(WURZEL, p), p] as const) : [['(leer)', '']])(
    '%s importiert kein Svelte',
    (_name, pfad) => {
      if (!pfad) return;
      const verstoesse = importeIn(pfad).flatMap((spez) =>
        VERBOTEN.filter((v) => v.muster.test(spez)).map((v) => `${spez} (${v.grund})`),
      );
      expect(verstoesse).toEqual([]);
    },
  );

  it('enthaelt keine Svelte-Komponenten', () => {
    expect(dateien.filter((p) => p.endsWith('.svelte'))).toEqual([]);
  });
});
