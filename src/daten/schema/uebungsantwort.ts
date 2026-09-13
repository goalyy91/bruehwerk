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
 * Bei "reverse" traegt `ergebnis` die Selbsteinschaetzung ("getroffen" als
 * `richtig`, "daneben" als `falsch`, nie `teilweise`) — reine Auskunft fuer
 * spaetere Kalibrierungs-Auswertung, ausdruecklich OHNE Leitner-Wirkung: der
 * Bildschirm schreibt bei "reverse" nie in die Sammlung `uebung` (siehe
 * Uebungsmodus.svelte). Ungescort heisst hier also "ohne Folgen fuer Box/
 * Faelligkeit", nicht "ohne jede Auskunft".
 *
 * `stufe` fehlt bei "kontrast" und "reverse" — beide sind nicht an eine der
 * drei Lernstufen A/B/C gebunden, jedes beteiligte Aroma behaelt seine
 * eigene, unabhaengig davon.
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
  /** Getippte Familie bei Stufe A/B — Rohstoff für den Ende-Screen ("welche Familie hast du gewählt, welche wäre richtig gewesen"). Fehlt bei Stufe C (kein Familientipp) sowie bei "kontrast"/"reverse". */
  getipptFamilieId: Id.optional(),
  form: z.enum(UEBUNGSFORMEN),
  /** Fehlt bei "kontrast" und "reverse" — siehe Dateikopf. */
  stufe: z.enum(['a', 'b', 'c']).optional(),
  /** Fehlt bei "reverse" (Selbsteinschaetzung statt Bewertung) — siehe Dateikopf. */
  ergebnis: z.enum(UEBUNGSERGEBNISSE).optional(),
  zeitstempel: Zeitpunkt,
  antwortdauerMs: z.number().int().nonnegative().optional(),
  /**
   * true, wenn die abgelesene Nummer zu keinem der verdeckten Fläschchen
   * dieses Durchgangs gehört — ein echter, seltener Fehler beim Bereitlegen
   * (Lastenheft Abschnitt 10, Punkt 5). **Nicht** dasselbe wie "ein anderes
   * als das app-intern zur Formwahl herangezogene Aroma" — das ist bei
   * blindem Ziehen der Regelfall und rechtfertigt keine eigene Markierung
   * (siehe Uebungsmodus.svelte, Kopfkommentar).
   */
  unerwarteteNummer: z.boolean().default(false),
});
export type Uebungsantwort = z.infer<typeof Uebungsantwort>;
