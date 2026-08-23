/**
 * Shot, Symptom, Tasting, Aromaset — aus docs/konzept.md "Datenmodell",
 * "Dial-in und Alltagskorrektur" und "Die Verkostung".
 */
import { z } from 'zod';
import { Id, Herkunft, Urteil, Staerke, Zeitpunkt } from './common';
import { ZielWerte } from './kaffee';

/** staerke sitzt am Befund, nicht am Shot — ein Shot kann gleichzeitig leicht sauer und deutlich duenn sein. */
export const Befund = z.object({
  symptomId: Id,
  staerke: Staerke,
});
export type Befund = z.infer<typeof Befund>;

/**
 * herkunft ist optional und deckt nur die Felder ab, die die Migration oder
 * eine spaetere Schaetzung tatsaechlich markiert (K54). Fehlt ein Feld, gilt
 * es als gemessen — das ist der Regelfall beim taeglichen Loggen.
 */
export const IstWerteHerkunft = z.record(z.string(), Herkunft).default({});

/**
 * Paket 04 — Regelparameter, den ein Vorschlag oder ein eigener Chip
 * (Weg b, Etappe C) tatsaechlich anwenden kann. Deckungsgleich mit
 * domain/diagnose.ts::RegelParameter — dort ist es die eine Quelle
 * (domain/ darf nichts aus daten/ importieren, siehe CLAUDE.md
 * "Architektur: die Schichten"; die Zuweisung unten haelt beide synchron,
 * wie SpielraumSchema es fuer Spielraum tut).
 */
export const RegelParameter = z.enum(['mg', 'kt', 'output', 'input']);
export type RegelParameter = z.infer<typeof RegelParameter>;
function pruefeRegelParameterTyp(p: RegelParameter): import('../../domain/diagnose').RegelParameter {
  return p;
}
void pruefeRegelParameterTyp;

/**
 * K68 — ein abgelehnter Vorschlag bleibt als gedaempfte Zeile mit Datum und
 * Ring stehen, "doch uebernehmen" bleibt tippbar. Dafuer braucht der
 * Vorschlag Zustand und Zeitpunkt, nicht nur einen Anzeigetext.
 *
 * Altbestand (vor Paket 04) hatte hier einen blanken String — ein
 * preprocess wandelt ihn in die neue Form, kein migrierter oder importierter
 * Shot wird dadurch ungueltig.
 */
export const Vorschlag = z.preprocess(
  (wert) => (typeof wert === 'string' ? { diagnose: wert, zustand: 'offen' } : wert),
  z.object({
    /** Regel-Id aus domain/diagnose.ts, fuer K76 (Rueckkehr bei zwei aufeinanderfolgenden Shots). */
    regelId: z.string().optional(),
    diagnose: z.string().min(1),
    empfehlungstext: z.string().min(1).optional(),
    parameter: RegelParameter.optional(),
    richtung: z.enum(['feiner', 'groeber', 'mehr', 'weniger']).optional(),
    alt: z.number().optional(),
    neu: z.number().optional(),
    zustand: z.enum(['offen', 'uebernommen', 'abgelehnt']).default('offen'),
    ts: Zeitpunkt.optional(),
  }),
);
export type Vorschlag = z.infer<typeof Vorschlag>;

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
  vorschlag: Vorschlag.optional(),
  freitext: z.string().optional(),
  tastingId: Id.optional(),
  durchgangId: Id.optional(),
});
export type Shot = z.infer<typeof Shot>;

/**
 * Der kleine Regeleditor (Weg b, Etappe C, konzept.md:482-484) — genau drei
 * Felder, mehr nicht: "holzig + deutlich -> KT, runter, 2". Alles darueber
 * hinaus waere eine Programmiersprache in einem Formular.
 */
const Regel = z.object({
  parameter: RegelParameter,
  richtung: z.enum(['feiner', 'groeber', 'mehr', 'weniger']),
  schritte: z.number(),
});

export const Symptom = z.object({
  id: Id,
  label: z.string().min(1),
  /** Geschmack oder Lauf — dieselben zwei Gruppen wie im Chip-Bildschirm (konzept.md:427-437). */
  gruppe: z.enum(['geschmack', 'lauf']).default('geschmack'),
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
