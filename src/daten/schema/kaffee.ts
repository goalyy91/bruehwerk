/**
 * Kaffee, Charge, Profil, Gussplan — aus docs/konzept.md "Datenmodell".
 */
import { z } from 'zod';
import type { Spielraum } from '../../domain/spielraum';
import { Id, Herkunft } from './common';

export const Aufbereitung = z.enum([
  'washed',
  'honey',
  'natural',
  'anaerob',
  'wet-hulled',
  'sonstige',
]);
export type Aufbereitung = z.infer<typeof Aufbereitung>;

export const Entkoffeinierung = z.enum(['swiss-water', 'co2', 'ea', 'mc', 'unbekannt']);

/** Prozente von Arabica und Robusta muessen sich zu 100 summieren — sonst ist "70/40" gueltig. */
export const Botanik = z
  .object({ arabicaProzent: z.number().min(0).max(100), robustaProzent: z.number().min(0).max(100) })
  .refine((b) => Math.abs(b.arabicaProzent + b.robustaProzent - 100) < 1e-9, {
    message: 'arabicaProzent + robustaProzent muss 100 ergeben',
  });

export const Erkenntnis = z.object({
  ts: z.number().int().nonnegative(),
  text: z.string().min(1),
  herkunft: Herkunft,
  shotId: Id.optional(),
});

/**
 * Roestgrad und Bewertung sind feste fuenfstufige Skalen (Bohnen bzw. Sterne
 * in der Oberflaeche) — kein Freitext, keine vereinfachte Ersatzform im
 * Leerzustand (siehe CLAUDE.md K79-Verweis im Musterblatt).
 */
/**
 * roestgrad, aufbereitung, botanik und status stehen im Konzept ohne "?",
 * sind hier aber bewusst optional: die Notion-Migration (Paket 02) liefert
 * sie nicht — dort standen sie nie strukturiert, nur in Fliesstext. Sie
 * "raten" waere genau das Platzhalter-Problem aus CLAUDE.md "Offen — noch
 * nicht geliefert". Das Kaffeeblatt (Paket 03, K51) traegt sie nach.
 */
export const Kaffee = z.object({
  id: Id,
  name: z.string().min(1),
  roester: z.string().min(1),
  aktiv: z.boolean(),
  art: z.enum(['single', 'blend']),
  /** Laender-Liste, deckt Blends mehrfach ab. */
  herkunft: z.array(z.string().min(1)).default([]),
  varietaet: z.string().optional(),
  anbauhoehe: z.number().positive().optional(),
  aufbereitung: Aufbereitung.optional(),
  botanik: Botanik.optional(),
  roestgrad: z.number().int().min(1).max(5).optional(),
  roestgradRoester: z.string().optional(),
  entkoffeiniert: z.boolean(),
  entkoffeinierung: Entkoffeinierung.optional(),
  /** K46 — die Bohnen-Seite der Kopplung an Getraenke.zubereitung. */
  geeignetFuer: z.array(z.string().min(1)).default([]),
  chargeIds: z.array(Id).default([]),
  aktuelleChargeId: Id.optional(),
  bewertung: z.number().min(0).max(5).optional(),
  // UX-2: kein eigener Kaffee-Status mehr (offen/angebrochen/leer) — doppelt
  // gefuehrt neben Charge.leer und in der Praxis nie zwei offene Chargen
  // gleichzeitig. Eine neue Charge markiert die vorherige automatisch als
  // leer (Kaffeeblatt.svelte), das reicht.
  erkenntnisse: z.array(Erkenntnis).default([]),
});
export type Kaffee = z.infer<typeof Kaffee>;

/** K61 — bewusst ohne Packungsgroesse, die wurde nie gepflegt. */
export const Charge = z.object({
  id: Id,
  kaffeeId: Id,
  nummer: z.string().min(1),
  roestdatum: z.number().int().nonnegative(),
  leer: z.boolean(),
});
export type Charge = z.infer<typeof Charge>;

/**
 * Ziel und Ist teilen dieselbe Form. Reihenfolge im Objekt folgt K5:
 * Output vor Preinfusion vor Zeit. input/mg stehen davor, weil sie
 * eingestellt statt gemessen werden.
 */
export const ZielWerte = z.object({
  input: z.number().positive(),
  mg: z.number(),
  rpm: z.number().optional(),
  kt: z.number().optional(),
  output: z.number().nonnegative(),
  pre: z.number().nonnegative().optional(),
  zeit: z.number().nonnegative(),
});
export type ZielWerte = z.infer<typeof ZielWerte>;

/**
 * Deckungsgleich mit domain/spielraum.ts::Spielraum — importiert statt neu
 * getippt. `pruefeSpielraumTyp` haelt beide Definitionen synchron: weicht
 * das Zod-Schema vom domain-Typ ab, nimmt die Zuweisung darin keinen
 * Typecheck mehr und der Build bricht.
 */
export const SpielraumSchema = z.object({
  zeit: z.number().positive(),
  output: z.number().positive(),
  durchlaufzeit: z.number().positive(),
});
function pruefeSpielraumTyp(s: z.infer<typeof SpielraumSchema>): Spielraum {
  return s;
}
void pruefeSpielraumTyp;

/**
 * Sechs typisierte Bausteine — "Pour Over: der Gussplan" in docs/konzept.md,
 * Abschnitt "Bausteine mit Notizzeile". Jeder traegt zusaetzlich `notiz`
 * fuer das, was kein Feld abdeckt.
 *
 * `frei` ist die alte, generische Form (menge/dauer/rolle/text) und bleibt
 * gueltig, weil das Notion-Format `[50g | 30s] Bloom: Beschreibung` genau
 * diese Form hat — die Migration (Paket 02) uebersetzt eins zu eins dorthin.
 * Kein importierter Plan wird durch die Typisierung ungueltig.
 */
const BausteinVorbereiten = z.object({
  typ: z.literal('vorbereiten'),
  filterSpuelen: z.boolean(),
  gefaessVorwaermen: z.boolean(),
  notiz: z.string().optional(),
});

const BausteinBloom = z.object({
  typ: z.literal('bloom'),
  menge: z.number().nonnegative(),
  dauer: z.number().nonnegative(),
  notiz: z.string().optional(),
});

export const GussMuster = z.enum(['zentrum', 'spirale', 'aussen']);

const BausteinGuss = z.object({
  typ: z.literal('guss'),
  zielmenge: z.number().nonnegative(),
  dauer: z.number().nonnegative().optional(),
  muster: GussMuster.optional(),
  /** Nur belegt, wenn dieser Guss von der Kannen-Temperatur abweicht. */
  temperaturAbweichend: z.number().optional(),
  notiz: z.string().optional(),
});

export const AgitationArt = z.enum(['schwenken', 'rao-spin', 'ruehren', 'klopfen']);

const BausteinAgitation = z.object({
  typ: z.literal('agitation'),
  art: AgitationArt,
  notiz: z.string().optional(),
});

const BausteinWarten = z.object({
  typ: z.literal('warten'),
  modus: z.enum(['bis-durchgelaufen', 'feste-dauer']),
  dauer: z.number().nonnegative().optional(),
  notiz: z.string().optional(),
});

const BausteinBypass = z.object({
  typ: z.literal('bypass'),
  menge: z.number().nonnegative(),
  temperatur: z.number().optional(),
  notiz: z.string().optional(),
});

/** Altbestand — Notion-Migration und alles vor der Typisierung. */
const BausteinFrei = z.object({
  typ: z.literal('frei'),
  menge: z.number().nonnegative(),
  dauer: z.number().nonnegative().optional(),
  rolle: z.string().min(1),
  text: z.string().optional(),
});

export const GussBaustein = z.discriminatedUnion('typ', [
  BausteinVorbereiten,
  BausteinBloom,
  BausteinGuss,
  BausteinAgitation,
  BausteinWarten,
  BausteinBypass,
  BausteinFrei,
]);
export type GussBaustein = z.infer<typeof GussBaustein>;

export const Gussplan = z.object({
  id: Id,
  name: z.string().min(1),
  gesamtwasser: z.number().positive(),
  lesart: z.enum(['kumulativ', 'inkrementell']),
  bausteine: z.array(GussBaustein).default([]),
});
export type Gussplan = z.infer<typeof Gussplan>;

const AnsatzCold = z.object({
  verhaeltnis: z.string().min(1),
  ziehzeit: z.number().positive(),
  ort: z.string().min(1),
  filtern: z.boolean(),
});

export const Profil = z.object({
  id: Id,
  kaffeeId: Id,
  setupId: Id,
  name: z.string().min(1),
  standard: z.boolean(),
  ziel: ZielWerte,
  /** K6, K34, K56 — je Groesse pflegbar. Input und Mahlgrad haben keinen. */
  spielraum: SpielraumSchema,
  gussplanId: Id.optional(),
  ansatz: AnsatzCold.optional(),
  modus: z.enum(['dialin', 'eingefahren']),
  hinweise: z.string().optional(),
});
export type Profil = z.infer<typeof Profil>;
