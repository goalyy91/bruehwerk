/**
 * Gemeinsame Bausteine der Schemata — Id, Zeitpunkt, Herkunft.
 *
 * `daten/` kennt IndexedDB, aber `domain/` bleibt aussen vor (K siehe
 * CLAUDE.md "Architektur: die Schichten"). Diese Datei importiert deshalb
 * nichts aus `domain/` ausser reinen Typen, die keine Laufzeit-Abhaengigkeit
 * erzeugen.
 */
import { z } from 'zod';

/** Jede Sammlung bekommt eine textuelle Id — vom Aufrufer vergeben, nicht autoinkrementiert. */
export const Id = z.string().min(1);

/** Millisekunden seit Epoche, wie `Date.now()`. */
export const Zeitpunkt = z.number().int().nonnegative();

/**
 * Die drei Herkunftszeichen — K54, K13. Absichtlich nur drei, nicht vier:
 * ein gerechneter Wert bekommt kein eigenes Zeichen, er ist so sicher wie
 * seine Eingaben und traegt deshalb denselben gefuellten Punkt wie ein
 * gemessener.
 */
export const Herkunft = z.enum(['gemessen', 'uebernommen', 'geschaetzt']);
export type Herkunft = z.infer<typeof Herkunft>;

/** Bewertungsstufen am Shot. Kein numerischer Score — vier feste Woerter. */
export const Urteil = z.enum(['daneben', 'okay', 'sehr gut', 'referenz']);
export type Urteil = z.infer<typeof Urteil>;

export const Staerke = z.enum(['leicht', 'deutlich']);
export type Staerke = z.infer<typeof Staerke>;
