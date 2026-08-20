import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Die Token-Regel als Test, nicht als Absichtserklaerung.
 *
 * Eine Farbe, die einmal direkt als Hex-Wert in einem Muster oder einem
 * Bereich landet statt als --token, ist im Dunkelmodus falsch und faellt
 * erst am Telefon auf. tokens.css ist die einzige Stelle, an der Rohfarben
 * stehen duerfen — alles andere referenziert sie per var(--...).
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

function dateienUnter(verzeichnis: string, endungen: RegExp): string[] {
  if (!statSyncOderNull(verzeichnis)?.isDirectory()) return [];

  let treffer: string[] = [];
  for (const eintrag of readdirSync(verzeichnis)) {
    const pfad = join(verzeichnis, eintrag);
    if (statSync(pfad).isDirectory()) {
      treffer = treffer.concat(dateienUnter(pfad, endungen));
    } else if (endungen.test(eintrag)) {
      treffer.push(pfad);
    }
  }
  return treffer;
}

const HEX_FARBE = /#[0-9a-fA-F]{3,8}\b/g;

describe('src/muster und src/bereiche — nur Tokens, keine Rohfarben', () => {
  const dateien = [
    ...dateienUnter(join(SRC, 'muster'), /\.svelte$/),
    ...dateienUnter(join(SRC, 'bereiche'), /\.svelte$/),
  ];

  it('enthaelt ueberhaupt Komponenten', () => {
    expect(dateien.length).toBeGreaterThan(0);
  });

  it.each(dateien.map((p) => [relative(WURZEL, p), p] as const))(
    '%s enthaelt keinen Hex-Farbwert',
    (_name, pfad) => {
      const quelle = readFileSync(pfad, 'utf8');
      const treffer = [...quelle.matchAll(HEX_FARBE)].map((m) => m[0]);
      expect(treffer).toEqual([]);
    },
  );
});
