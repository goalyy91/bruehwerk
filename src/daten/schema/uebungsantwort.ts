/**
 * Uebungsantwort — Aromapaket, Etappe 6 (Neubau nach Lastenheft,
 * docs/konzept.md "Übungsmodus"). Ein Datensatz je einzelner Antwort in
 * einem Übungsdurchgang: tatsächliches Aroma, getipptes Aroma, Übungsform,
 * Stufe, Ergebnis, Zeitstempel, Antwortdauer. Der Rohstoff fuer
 * domain/uebungsauswertung.ts — Verwechslungsmatrix, Familien-Trefferquote,
 * Antwortdauer als Sicherheitsindikator.
 *
 * Getrennt von `Uebung` (der fortgefuehrte Trefferstand je Aroma): hier
 * steht das einzelne Ereignis, dort die daraus verdichtete Summe. Beide
 * Sammlungen wachsen bei jeder Antwort gemeinsam — `Uebung` bekommt die neue
 * Box/Stufe, `Uebungsantwort` haelt das Ereignis fest, aus dem sie folgt.
 *
 * `ergebnis` fehlt bei der Uebungsform "reverse": die ist ausdruecklich
 * ungescort (Lastenheft Abschnitt 4) und darf die Boxen/die Auswertung nicht
 * beeinflussen — ein Datensatz ohne Ergebnis wird dort schlicht nicht
 * mitgezaehlt.
 */
import { z } from 'zod';
import { Id, Zeitpunkt } from './common';

/**
 * Die fuenf Uebungsformen aus dem Lastenheft. "familie" und "aromaInFamilie"
 * sind die zwei Schritte der Lernstufe B (Stufe A allein hat keine eigene
 * Form, sie *ist* "familie") — siehe docs/konzept.md, Abschnitt Übungsmodus.
 */
export const UEBUNGSFORMEN = ['familie', 'aromaInFamilie', 'freierAbruf', 'kontrast', 'reverse'] as const;
export type Uebungsform = (typeof UEBUNGSFORMEN)[number];

export const UEBUNGSERGEBNISSE = ['richtig', 'teilweise', 'falsch'] as const;
export type Uebungsergebnis = (typeof UEBUNGSERGEBNISSE)[number];

export const Uebungsantwort = z.object({
  id: Id,
  durchgangId: Id,
  setId: Id,
  aromaId: Id,
  /** Fehlt, wenn "reverse" ohne Fläschchensuche abgebrochen wurde. */
  getipptId: Id.optional(),
  form: z.enum(UEBUNGSFORMEN),
  stufe: z.enum(['a', 'b', 'c']),
  /** Fehlt bei "reverse" — siehe Dateikopf. */
  ergebnis: z.enum(UEBUNGSERGEBNISSE).optional(),
  zeitstempel: Zeitpunkt,
  antwortdauerMs: z.number().int().nonnegative().optional(),
  /**
   * true, wenn die beim Bereitlegen tatsaechlich gegriffene Nummer von der
   * geplanten abwich (Lastenheft Abschnitt 10, Punkt 5: die Wahrheit muss
   * eintragbar bleiben, auch wenn beim Bereitlegen etwas danebenging).
   */
  unerwarteteNummer: z.boolean().default(false),
});
export type Uebungsantwort = z.infer<typeof Uebungsantwort>;
