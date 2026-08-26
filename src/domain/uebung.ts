/**
 * Uebungsmodus — konzept.md:810-812. "Sie zieht bevorzugt, was zuletzt
 * nicht getroffen wurde" — reine Gewichtung + gewichtete Zufallsauswahl,
 * kein idb, kein Svelte (tests/schichten.test.ts erzwingt das). Der Zufall
 * wird injiziert (Default Math.random), damit die Gewichtung selbst
 * testbar ist, ohne echten Zufall im Test nachzubilden.
 */

export interface AromaOption {
  readonly id: string;
  readonly label: string;
  readonly nummer?: number;
}

export interface TrefferStand {
  readonly versuche: number;
  readonly treffer: number;
}

export function trefferquote(stand: TrefferStand | undefined): number {
  if (!stand || stand.versuche === 0) return 0;
  return stand.treffer / stand.versuche;
}

/**
 * Ein noch nie geuebtes Aroma bekommt volles Gewicht (1). Ein perfekt
 * getroffenes bekommt nicht 0, sondern ein Mindestgewicht — sonst
 * verschwindet es dauerhaft aus der Ziehung, sobald es einmal gut sass,
 * und die Auskunft "was kann ich noch" waere nicht mehr ehrlich, weil sie
 * nie erneut geprueft wird.
 */
const MINDESTGEWICHT = 0.15;

export function gewicht(stand: TrefferStand | undefined): number {
  if (!stand || stand.versuche === 0) return 1;
  return Math.max(MINDESTGEWICHT, 1 - trefferquote(stand));
}

/**
 * Gewichtete Zufallsauswahl aus den Aromen eines Sets. `staende` ist eine
 * Map von Aroma-Id auf ihren bisherigen Stand (fehlender Eintrag = noch nie
 * geuebt). `zufall()` liefert einen Wert in [0, 1) — Default Math.random.
 */
export function naechstesAroma(
  aromen: readonly AromaOption[],
  staende: ReadonlyMap<string, TrefferStand>,
  zufall: () => number = Math.random,
): AromaOption | undefined {
  if (aromen.length === 0) return undefined;
  const gewichte = aromen.map((a) => gewicht(staende.get(a.id)));
  const summe = gewichte.reduce((s, g) => s + g, 0);
  let ziel = zufall() * summe;
  for (let i = 0; i < aromen.length; i++) {
    ziel -= gewichte[i]!;
    if (ziel <= 0) return aromen[i];
  }
  return aromen[aromen.length - 1];
}
