/**
 * Uebungsmodus — Paket 05, konzept.md:810-812. Trefferstatistik je Aroma
 * eines Sets: die App zieht bevorzugt, was zuletzt nicht getroffen wurde
 * (domain/uebung.ts::naechstesAroma), und diese Sammlung traegt dafuer den
 * Zustand.
 *
 * Ein Datensatz je (setId, aromaId) statt einer Zaehlliste am Aromaset
 * selbst — Uebungsergebnisse sind Nutzungsdaten, kein Teil des Aromaset-
 * Bestands, und sollen beim Ersetzen eines Platzhalter-Sets (siehe
 * daten/aromen.ts) einzeln loeschbar sein, ohne das Set selbst anzufassen.
 */
import { z } from 'zod';
import { Id, Zeitpunkt } from './common';

export const Uebung = z.object({
  id: Id,
  setId: Id,
  aromaId: Id,
  versuche: z.number().int().nonnegative().default(0),
  treffer: z.number().int().nonnegative().default(0),
  letzterVersuch: Zeitpunkt.optional(),
});
export type Uebung = z.infer<typeof Uebung>;
