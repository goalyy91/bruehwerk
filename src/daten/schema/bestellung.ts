/**
 * Durchgang, Position, Bestellung — aus docs/konzept.md "Die Bestellung".
 *
 * Durchgang ist das Kernobjekt (K18, K19, K20): was ein Geraet in einem Zug
 * bedient. Bohne und Profil sind je Durchgang identisch — das ist zugleich
 * die Buendelungsregel aus domain/plan.ts.
 */
import { z } from 'zod';
import { Id } from './common';

export const Position = z.object({
  id: Id,
  personId: Id,
  getraenkId: Id,
  kaffeeId: Id,
  koffein: z.enum(['normal', 'entkoffeiniert']),
  /** Heute nur 'extra-shot' — bewusst Liste statt Flag, damit Spaeteres ein Datensatz ist. */
  modifikatoren: z.array(z.string().min(1)).default([]),
  durchgangId: Id.optional(),
});
export type Position = z.infer<typeof Position>;

export const Durchgang = z.object({
  id: Id,
  geraetId: Id,
  kaffeeId: Id,
  chargeId: Id,
  profilId: Id,
  /** Was das Geraet in diesem Zug tatsaechlich bediente. */
  shotId: Id.optional(),
  /** Ein bis drei Getraenke — K18. */
  positionIds: z.array(Id).min(1).max(3),
  urteilGemeinsam: z.boolean().default(true),
  erledigt: z.boolean(),
});
export type Durchgang = z.infer<typeof Durchgang>;

/**
 * K57, K58 — kein Urteil, kein Abschluss-Bildschirm. Bewertet wird
 * ausschliesslich ueber die Historie, nie hier.
 */
export const Bestellung = z.object({
  id: Id,
  ts: z.number().int().nonnegative(),
  positionIds: z.array(Id).default([]),
  durchgangIds: z.array(Id).default([]),
  /** Sekunden. Erscheint als Vorabschaetzung, nicht als laufende Uhr — kein Timer. */
  dauerGeschaetzt: z.number().nonnegative(),
  /** Gramm. Wird mitgerechnet, nicht als Warnung dargestellt. */
  verschnitt: z.number().nonnegative(),
  status: z.enum(['offen', 'abgeschlossen']),
});
export type Bestellung = z.infer<typeof Bestellung>;
