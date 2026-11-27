/**
 * Riechprotokoll — "frei riechen" in der Aromaschule (Nachzug 27.11.2026,
 * Lern-Review Aromatraining). Ein Datensatz je Aroma, das du außerhalb jeder
 * Abfrage gezielt aufgeschlagen hast, um es mit Namen zu riechen.
 *
 * **Ohne jede Wirkung auf den Lernplan** — ausdrückliche Entscheidung: kein
 * Ausschluss aus dem nächsten Übungsdurchgang (der verriete den
 * Kandidatenkreis: was heute fehlt, kann es nicht sein), keine gedämpfte
 * Wertung eines späteren Treffers. Box, Stufe, Fälligkeit bleiben, wie sie
 * sind.
 *
 * Bewusst eine eigene Sammlung und **nicht** `uebungsantwort`: dort hängen
 * Meilenstein, Rückblick und Statistik dran, und ein offenes Riechen ist
 * keine Antwort. Festgehalten wird es trotzdem, damit sich später mit den
 * eigenen Daten prüfen lässt, ob frei Gerochenes besser sitzt — die Frage,
 * die die Literatur offenlässt.
 */
import { z } from 'zod';
import { Id, Zeitpunkt } from './common';

export const Riechprotokoll = z.object({
  id: Id,
  setId: Id,
  aromaId: Id,
  zeitstempel: Zeitpunkt,
});
export type Riechprotokoll = z.infer<typeof Riechprotokoll>;
