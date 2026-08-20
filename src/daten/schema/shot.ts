/**
 * Shot, Symptom, Tasting, Aromaset — aus docs/konzept.md "Datenmodell",
 * "Dial-in und Alltagskorrektur" und "Die Verkostung".
 */
import { z } from 'zod';
import { Id, Herkunft, Urteil, Staerke } from './common';
import { ZielWerte } from './kaffee';

/** staerke sitzt am Befund, nicht am Shot — ein Shot kann gleichzeitig leicht sauer und deutlich duenn sein. */
export const Befund = z.object({
  symptomId: Id,
  staerke: Staerke,
});

/**
 * herkunft ist optional und deckt nur die Felder ab, die die Migration oder
 * eine spaetere Schaetzung tatsaechlich markiert (K54). Fehlt ein Feld, gilt
 * es als gemessen — das ist der Regelfall beim taeglichen Loggen.
 */
export const IstWerteHerkunft = z.record(z.string(), Herkunft).default({});

export const Shot = z.object({
  id: Id,
  ts: z.number().int().nonnegative(),
  kaffeeId: Id,
  chargeId: Id,
  profilId: Id,
  setupId: Id,
  ist: ZielWerte,
  istHerkunft: IstWerteHerkunft,
  /** Ein Bezug, ein oder zwei Tassen — der geteilte Bezug ist die Regel, kein Sonderfall. */
  portionen: z.union([z.literal(1), z.literal(2)]),
  urteil: Urteil,
  befunde: z.array(Befund).default([]),
  /** K10 — bleibt am Shot bis zum naechsten Shot, keine Vorbelegung (K12). */
  vorschlag: z.string().optional(),
  freitext: z.string().optional(),
  tastingId: Id.optional(),
  durchgangId: Id.optional(),
});
export type Shot = z.infer<typeof Shot>;

const Regel = z.object({
  parameter: z.string().min(1),
  richtung: z.enum(['feiner', 'groeber', 'mehr', 'weniger']),
  schritte: z.number(),
});

export const Symptom = z.object({
  id: Id,
  label: z.string().min(1),
  quelle: z.enum(['system', 'eigen']),
  regel: Regel.optional(),
});
export type Symptom = z.infer<typeof Symptom>;

/**
 * Sechs gleichrangige Groessen — K52. Bipolar (Mitte ist Ziel) oder
 * einseitig (mehr ist mehr) ist Eigenschaft der Groesse, keine getrennte
 * Struktur mehr.
 */
export const Groessen = z.object({
  saeure: z.number().min(0).max(10),
  koerper: z.number().min(0).max(10),
  bitterkeit: z.number().min(0).max(10),
  aroma: z.number().min(0).max(10),
  suesse: z.number().min(0).max(10),
  nachklang: z.number().min(0).max(10),
});

/** staerke traegt jetzt eine eigene Kraft im Chip — K53. */
export const Auffaelligkeit = z.object({
  id: Id,
  staerke: Staerke,
});

const AromaEintrag = z.object({
  set: z.string().min(1),
  pfad: z.array(z.string().min(1)).min(1),
  /** Nur bei Le Nez du Cafe belegt — die Flaeschchennummer. */
  nummer: z.number().int().positive().optional(),
});

export const Tasting = z.object({
  id: Id,
  shotId: Id,
  groessen: Groessen,
  auffaelligkeiten: z.array(Auffaelligkeit).default([]),
  aromen: z.array(AromaEintrag).default([]),
  freitext: z.string().optional(),
});
export type Tasting = z.infer<typeof Tasting>;

/** Beide Sets leben in denselben neun SCA-Kategorien — K55, kein Rueckgrat-Konstrukt. */
export const Aromaset = z.object({
  id: Id,
  name: z.string().min(1),
  quelle: z.string().min(1),
  kategorien: z.array(z.string().min(1)).min(1),
  vialNummern: z.boolean(),
});
export type Aromaset = z.infer<typeof Aromaset>;
