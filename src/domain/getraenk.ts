/**
 * Getraenke-Rechnerei — "Getraenke" in docs/konzept.md.
 *
 * Reine Rechnerei, kein idb, kein Svelte (tests/schichten.test.ts erzwingt
 * das). Drei Dinge, die das Konzept ausdruecklich vorschreibt:
 *
 * 1. Die Fuellmenge ist die Konstante, nicht die Milchmenge (konzept.md:903-913):
 *    Milch = Fuellmenge - Summe Shots. Eingegeben wird die Milchmenge, die
 *    App merkt sich daraus die Fuellmenge — beide Richtungen stehen hier.
 * 2. Ein Extra Shot verdraengt die Ausgleichszutat, addiert sie nicht. Jedes
 *    Getraenk hat dafuer eine Mindestmenge; wird sie unterschritten, wird der
 *    Extra Shot dort gar nicht erst angeboten (konzept.md:923).
 * 3. Die Bohnenliste in der Bestellung ist eine Schnittmenge aus
 *    geeignetFuer x Koffein x aktiv (K45 K46), kein Vorschlag.
 */

/** Milch = Fuellmenge - Summe Shots (konzept.md:908). */
export function milchAusFuellmenge(fuellmengeMl: number, shotsGesamtMl: number): number {
  return fuellmengeMl - shotsGesamtMl;
}

/** Die Umkehrung — beim Eintragen der Milchmenge merkt sich die App die Fuellmenge daraus. */
export function fuellmengeAusMilch(milchMl: number, shotsGesamtMl: number): number {
  return milchMl + shotsGesamtMl;
}

/**
 * Ob ein Extra Shot an diesem Getraenk angeboten wird — die Ausgleichszutat
 * darf dabei nicht unter die Mindestmenge fallen (Espresso Macchiato:
 * 30 ml Milch minus 20 ml Extra Shot waeren 10 ml, kein Macchiato mehr).
 *
 * Getraenke ohne Mindestmenge (typischerweise ohne Ausgleich ueberhaupt,
 * z. B. Espresso/Doppio) erlauben den Extra Shot immer — die einzige Grenze
 * dort ist das Tassenvolumen, das ist nicht Aufgabe dieser Funktion.
 */
export function extraShotErlaubt(
  ausgleichOhneExtraMl: number,
  mindestAusgleichMl: number | undefined,
  extraShotMl = 20,
): boolean {
  if (mindestAusgleichMl === undefined) return true;
  return ausgleichOhneExtraMl - extraShotMl >= mindestAusgleichMl;
}

export interface KaffeeFuerSchnittmenge {
  readonly id: string;
  readonly geeignetFuer: readonly string[];
  readonly entkoffeiniert: boolean;
  readonly aktiv: boolean;
}

/**
 * Die Bohnenliste in der Bestellung — Schnittmenge aus geeignetFuer x
 * Koffein x aktiv (K45 K46). Koffein filtert VOR der Bohne, deshalb ein
 * fester Parameter hier statt einer Rueckfrage danach.
 */
export function bohnenSchnittmenge<K extends KaffeeFuerSchnittmenge>(
  kaffees: readonly K[],
  zubereitung: string,
  koffein: 'normal' | 'entkoffeiniert',
): K[] {
  return kaffees.filter(
    (k) => k.aktiv && k.geeignetFuer.includes(zubereitung) && k.entkoffeiniert === (koffein === 'entkoffeiniert'),
  );
}
