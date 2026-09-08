/**
 * Getraenke-Rechnerei — "Getraenke" in docs/konzept.md.
 *
 * Reine Rechnerei, kein idb, kein Svelte (tests/schichten.test.ts erzwingt
 * das).
 *
 * **Hier stand bis 2026-09-07 mehr.** `milchAusFuellmenge`,
 * `fuellmengeAusMilch` und `extraShotErlaubt` sind entfallen: sie rechneten
 * aus Fuellmenge und Mindestmenge aus, wann der Extra Shot verschwinden
 * muss. Julian braucht die Rechnung nicht ("ich habe meine Standardtassen
 * und weiss was worein kommt"); ob ein Extra Shot moeglich ist, sagt das
 * Getraenk jetzt direkt (`Getraenk.extraShotMoeglich`). Damit sind auch
 * `fuellmenge` und `mindestAusgleich` aus dem Schema verschwunden — siehe
 * daten/schema/getraenk.ts fuer die Folgen.
 *
 * Was bleibt: die Bohnenliste in der Bestellung ist eine Schnittmenge aus
 * geeignetFuer x Koffein x aktiv (K45 K46), kein Vorschlag.
 */

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
