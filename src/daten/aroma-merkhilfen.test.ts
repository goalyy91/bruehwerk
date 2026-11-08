import { describe, it, expect } from 'vitest';
import { MERKHILFEN, MERKHILFE_MAX_ZEICHEN } from './aroma-merkhilfen';
import { DATENBLAETTER, type AromaDatenblatt } from './aroma-datenblaetter';

function volltext(d: AromaDatenblatt): string {
  return [d.name, ...d.beschreibung, ...d.abschnitte.flatMap((a) => a.text), ...d.imKaffee.flatMap((a) => a.text)].join(' ').toLowerCase();
}

/** Füllwörter, die keine Beschreibung tragen und deshalb nicht im Blatt stehen müssen. */
const FUELLWOERTER = new Set(['und', 'oder', 'wie', 'als', 'mit', 'ohne', 'dazu', 'eher', 'leicht', 'schon', 'in', 'der', 'die', 'eine', 'nicht', 'noten', 'grüne', 'oft', 'hauch', 'frisch', 'unreif']);

describe('Merkhilfen — eine Zeile, nur aus dem eigenen Datenblatt', () => {
  const blatt = new Map(DATENBLAETTER.map((d) => [d.nummer, d]));

  it('jede Merkhilfe gehört zu einem vorhandenen Datenblatt', () => {
    for (const nummer of Object.keys(MERKHILFEN).map(Number)) expect(blatt.has(nummer), `Nr. ${nummer}`).toBe(true);
  });

  it('jedes vorhandene Datenblatt hat eine Merkhilfe', () => {
    for (const d of DATENBLAETTER) expect(MERKHILFEN[d.nummer], `Nr. ${d.nummer} ${d.name}`).toBeDefined();
  });

  it(`höchstens ${MERKHILFE_MAX_ZEICHEN} Zeichen`, () => {
    for (const [nummer, text] of Object.entries(MERKHILFEN)) expect(text.length, `Nr. ${nummer}`).toBeLessThanOrEqual(MERKHILFE_MAX_ZEICHEN);
  });

  it('jedes tragende Wort steht (als Wortstamm) im Blatt desselben Fläschchens — nichts dazuerfunden', () => {
    const fremd: string[] = [];
    for (const [nummer, text] of Object.entries(MERKHILFEN)) {
      const quelle = volltext(blatt.get(Number(nummer))!);
      const woerter = text.toLowerCase().split(/[\s,—:-]+/).filter((w) => w.length > 2 && !FUELLWOERTER.has(w));
      for (const wort of woerter) {
        const stamm = wort.slice(0, Math.max(4, Math.min(6, wort.length - 2)));
        if (!quelle.includes(stamm)) fremd.push(`Nr. ${nummer}: „${wort}“`);
      }
    }
    expect(fremd).toEqual([]);
  });
});
