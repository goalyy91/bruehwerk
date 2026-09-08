/**
 * Die Messreihe — Grundlage fuer K67/K75 ("außerhalb der Messreihe").
 *
 * Min/Max ueber alle bisherigen Shots einer Bohne, ueber alle Chargen
 * hinweg, ohne Mindestzahl an Shots (siehe CLAUDE.md "Werte ohne eigenen
 * Leerzustand"). Ein Wert ausserhalb wird nie abgewiesen — diese Datei
 * stellt nur fest, ob er innerhalb liegt, und liefert den Satz, der die
 * Reihe nennt ("30 bis 42 g").
 */

export interface Messreihe {
  readonly min: number;
  readonly max: number;
  readonly anzahl: number;
}

/** undefined bei leerer Reihe — "kein Punkt", kein Nullwert, der wie eine Messung aussieht. */
export function bildeMessreihe(werte: readonly number[]): Messreihe | undefined {
  if (werte.length === 0) return undefined;
  return { min: Math.min(...werte), max: Math.max(...werte), anzahl: werte.length };
}

export function innerhalbMessreihe(reihe: Messreihe | undefined, wert: number): boolean {
  if (!reihe) return true; // keine Reihe da -> nichts, wogegen zu pruefen waere
  return wert >= reihe.min && wert <= reihe.max;
}

/** "30 bis 42 g" — ein Satz, keine Zahl allein, K67/K75. */
export function messreiheSatz(reihe: Messreihe, einheit: string): string {
  return `${reihe.min} bis ${reihe.max} ${einheit}`;
}
