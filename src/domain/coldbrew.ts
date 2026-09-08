/**
 * Cold Brew — "Cold Brew — wieder drin, aber an anderer Stelle" in
 * docs/konzept.md:933-955. Reine Rechnerei, kein idb, kein Svelte.
 */

/** "1:15" -> 15. Kein Verhaeltnis im Store ist ungueltig, weil das Formular es erzwingt — trotzdem ohne Wurf bei Fehlformat. */
export function verhaeltnisZahl(verhaeltnis: string): number | undefined {
  const teile = verhaeltnis.split(':');
  const zahl = Number(teile[1]);
  return teile.length === 2 && Number.isFinite(zahl) && zahl > 0 ? zahl : undefined;
}

/**
 * Der Kaffeesatz behaelt Wasser — rund das Doppelte seines Eigengewichts
 * (konzept.md:953). 60 g bei 1:15 ergeben deshalb 780 ml, nicht 900:
 * 60 * 15 - 60 * 2 = 780.
 */
export function ertragMl(inputGramm: number, verhaeltnis: number, absorptionFaktor = 2): number {
  return inputGramm * (verhaeltnis - absorptionFaktor);
}

/** Fertig-Zeitpunkt aus Ansatz-Zeitpunkt und Ziehzeit — kein Countdown, ein Zeitpunkt (konzept.md:940). */
export function fertigAbZeitpunkt(angesetztMs: number, ziehzeitStunden: number): number {
  return angesetztMs + ziehzeitStunden * 60 * 60 * 1000;
}
