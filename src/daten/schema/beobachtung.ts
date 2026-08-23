/**
 * Offene Beobachtungen — Paket 04, Etappe C, konzept.md:461-502.
 *
 * Gespeichert wird nur die ENTSCHEIDUNG zu einem normalisierten Freitext-
 * Begriff, nicht seine Haeufigkeit — die wird bei jeder Anzeige aus
 * Shot.freitext gerechnet (CLAUDE.md: "gerechnete Werte werden nie
 * gespeichert"). "offen" ist deshalb kein Wert dieses Schemas: ein Begriff
 * ohne Eintrag hier IST offen, solange er die Schwelle erreicht.
 */
import { z } from 'zod';
import { Id, Zeitpunkt } from './common';

export const Beobachtung = z.object({
  id: Id,
  /** Normalisierte Form (domain/beobachtungen.ts::normalisiere), nicht der Rohtext. */
  begriff: z.string().min(1),
  entscheidung: z.enum(['ignoriert', 'chip', 'alias']),
  /** Nur bei 'alias' belegt — der Begriff, in dem dieser hier fortan mitgezaehlt wird. */
  zielBegriff: z.string().min(1).optional(),
  ts: Zeitpunkt,
});
export type Beobachtung = z.infer<typeof Beobachtung>;
