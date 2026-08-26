/**
 * Die Verkostung — K52, K38, K54, "Die Verkostung" in docs/konzept.md.
 *
 * Reine Rechnerei auf den sechs Groessen: kein idb, kein Svelte
 * (tests/schichten.test.ts erzwingt das). Balance, Komplexitaet und Gesamt
 * werden nie gespeichert (K38) — sie werden bei jeder Anzeige aus dem
 * Tasting bzw. dem Shot-Urteil gerechnet, hier und nur hier.
 *
 * Wortwahl fuer Balance/Komplexitaet ist bewusst keine Konzeptzahl wie
 * Spielraum oder Decay-Halbwertszeit, sondern eine Gestaltungsentscheidung
 * dieses Pakets: "Sprache fuehrt, Werte begleiten" (Haltung, konzept.md:1213)
 * gilt fuer Gerechnetes genauso wie fuer Spielraum-Meldungen (K6). Die
 * Bucket-Grenzen sind frei anpassbar, ohne dass sich an der Bedeutung von
 * `Groessen` etwas aendert.
 */
import type { Urteil } from '../daten/schema/common';

/**
 * Fuenf benannte Stufen, keine zehn (konzept.md:764) — deckungsgleich mit
 * den fuenf Staeben von Treppe.svelte. Index 0..4, Mitte bei 2. Ganzzahliges
 * `number` statt eines Literal-Unions: zod (daten/schema/shot.ts::Groessen)
 * kann den Wertebereich pruefen, aber keinen Literal-Union inferieren — die
 * Grenzen 0..4 durchzusetzen ist Aufgabe des Schemas, nicht dieser Datei.
 */
export type Stufe = number;

export type GroessenArt = 'bipolar' | 'einseitig';

export interface GroesseDef {
  readonly id: 'saeure' | 'koerper' | 'bitterkeit' | 'aroma' | 'suesse' | 'nachklang';
  readonly titel: string;
  readonly art: GroessenArt;
  readonly woerter: readonly [string, string, string, string, string];
}

/** Sechs gleichrangige Groessen, in Bogen-Reihenfolge (konzept.md:755-762). */
export const GROESSEN: readonly GroesseDef[] = [
  { id: 'saeure', titel: 'Säure', art: 'bipolar', woerter: ['flach', 'zurückhaltend', 'saftig', 'lebhaft', 'spitz'] },
  { id: 'koerper', titel: 'Körper', art: 'bipolar', woerter: ['wässrig', 'schlank', 'rund', 'satt', 'schwer'] },
  { id: 'bitterkeit', titel: 'Bitterkeit', art: 'bipolar', woerter: ['fehlt', 'dezent', 'präsent', 'kräftig', 'beißend'] },
  { id: 'aroma', titel: 'Aroma-Intensität', art: 'einseitig', woerter: ['kaum', 'verhalten', 'klar', 'ausgeprägt', 'intensiv'] },
  { id: 'suesse', titel: 'Süße', art: 'einseitig', woerter: ['keine', 'angedeutet', 'spürbar', 'deutlich', 'üppig'] },
  { id: 'nachklang', titel: 'Nachklang', art: 'einseitig', woerter: ['weg', 'kurz', 'trägt', 'lang', 'sehr lang'] },
] as const;

const BIPOLARE_GROESSEN = ['saeure', 'koerper', 'bitterkeit'] as const;
export type BipolareGroesse = (typeof BIPOLARE_GROESSEN)[number];

/** Die drei bipolaren Groessen — Mitte (Index 2) ist das Ziel. */
export type BipolareWerte = Record<BipolareGroesse, Stufe>;

const MITTE: Stufe = 2;

const BALANCE_STUFEN: readonly { bis: number; wort: string }[] = [
  { bis: 0.5, wort: 'ausgewogen' },
  { bis: 1.0, wort: 'leicht betont' },
  { bis: 1.5, wort: 'deutlich betont' },
  { bis: Infinity, wort: 'weit vom Ziel' },
];

/**
 * Balance aus dem mittleren Abstand der drei bipolaren Groessen zu ihrer
 * Mitte (konzept.md:776). 0 = alle drei genau auf der Mitte, 2 = alle drei
 * an einem Rand.
 */
export function balanceAbstand(werte: BipolareWerte): number {
  const abstaende = BIPOLARE_GROESSEN.map((g) => Math.abs(werte[g] - MITTE));
  return abstaende.reduce((summe, a) => summe + a, 0) / abstaende.length;
}

export function berechneBalance(werte: BipolareWerte): string {
  const abstand = balanceAbstand(werte);
  return BALANCE_STUFEN.find((s) => abstand <= s.bis)!.wort;
}

const KOMPLEXITAET_STUFEN: readonly { bis: number; wort: string }[] = [
  { bis: 0, wort: 'keine Aromen' },
  { bis: 2, wort: 'einfach' },
  { bis: 5, wort: 'vielschichtig' },
  { bis: Infinity, wort: 'komplex' },
];

/** Komplexitaet aus der Zahl der gefundenen Aromen (konzept.md:777). */
export function berechneKomplexitaet(anzahlAromen: number): string {
  return KOMPLEXITAET_STUFEN.find((s) => anzahlAromen <= s.bis)!.wort;
}

/**
 * Gesamt kommt aus dem Shot-Urteil, es gibt keine zweite Note (K38) — diese
 * Funktion tut nur, was Urteil.svelte fuer die Anzeige ohnehin braucht:
 * 'referenz' -> 'Referenz', der Rest bleibt wie er ist.
 */
export function berechneGesamt(urteil: Urteil): string {
  return urteil === 'referenz' ? 'Referenz' : urteil;
}
