/**
 * Der Geraetepark — Setup, Muehle, Bruehgeraet, Zubehoer, Ablauf.
 *
 * Aus docs/konzept.md "Datenmodell" und "Dein Geraetepark". Ein Profil haengt
 * immer an einem Setup, damit "MG 65" nie wieder mehrdeutig ist.
 */
import { z } from 'zod';
import { Id } from './common';

export const MuehleSkala = z.object({
  typ: z.enum(['numerisch', 'klicks']),
  min: z.number(),
  max: z.number(),
  schritt: z.number().positive(),
});

/** rpm ist die zweite Mahlachse (siehe CLAUDE.md) — nicht jede Muehle hat sie. */
export const Muehle = z
  .object({
    id: Id,
    name: z.string().min(1),
    skala: MuehleSkala,
    rpmEinstellbar: z.boolean(),
    rpmBereich: z.object({ min: z.number(), max: z.number(), schritt: z.number().positive() }).optional(),
  })
  .refine((m) => m.rpmEinstellbar || m.rpmBereich === undefined, {
    message: 'rpmBereich nur, wenn rpmEinstellbar — sonst waere das Feld eine offene Frage ohne Antwort',
    path: ['rpmBereich'],
  });
export type Muehle = z.infer<typeof Muehle>;

export const TempReferenzPunkt = z.object({
  kt: z.number(),
  flush: z.number().nonnegative(),
  gruppe: z.number(),
  // Optional: die Konzepttabelle traegt "-" fuer Reihen ohne Messdatum
  // (z. B. die geschaetzte Startbelegung).
  ts: z.number().int().nonnegative().optional(),
  herkunft: z.enum(['uebernommen', 'gemessen', 'geschaetzt']),
});
export type TempReferenzPunkt = z.infer<typeof TempReferenzPunkt>;

export const Sieb = z.object({
  art: z.enum(['einzel', 'doppel']),
  portionen: z.number().int().positive(),
});

/**
 * fuehrungswert: ein Wert je Geraet steht gross, der Rest begleitet — K7.
 * Moka hat keinen: es gibt beim Moka nichts zu fuehren, die Menge kommt aus
 * der Kanne, die Zeit wird nicht gesteuert. Erzwungen im Refine unten.
 */
export const Bruehgeraet = z
  .object({
    id: Id,
    name: z.string().min(1),
    typ: z.enum(['espresso', 'moka', 'pourover', 'coldbrew']),
    gruppen: z.number().int().positive(),
    dampflanze: z.boolean(),
    ktEinstellbar: z.boolean(),
    sieb: Sieb.optional(),
    fuehrungswert: z.enum(['output', 'durchlaufzeit']).nullable(),
    /** K8 — 1x immer, 2x am Doppelsieb, 3x an der 3er, Pour Over bis 2. */
    mengen: z.array(z.number().int().positive()).min(1),
    /** Cooling Flush in Sekunden. 0 = keiner. */
    flushDauer: z.number().nonnegative().optional(),
    tempReferenz: z.array(TempReferenzPunkt).default([]),
  })
  .refine((b) => b.typ !== 'moka' || b.fuehrungswert === null, {
    message: 'Moka fuehrt nichts — K7. fuehrungswert muss null sein.',
    path: ['fuehrungswert'],
  });
export type Bruehgeraet = z.infer<typeof Bruehgeraet>;

/** art ist bewusst offen (siehe Konzept: "…") — neue Zubehoerarten brauchen kein Schema-Update. */
export const Zubehoer = z.object({
  id: Id,
  name: z.string().min(1),
  art: z.string().min(1),
  volumen: z.number().positive().optional(),
  /** Milchkanne: nutzbar = volumen * fuellfaktor. */
  fuellfaktor: z.number().min(0).max(1).optional(),
  temperaturEinstellbar: z.boolean().optional(),
});
export type Zubehoer = z.infer<typeof Zubehoer>;

const AblaufSchritt = z.object({
  id: Id,
  name: z.string().min(1),
  dauer: z.number().nonnegative(),
  ressource: z.string().min(1),
  phase: z.string().min(1),
  unbeaufsichtigt: z.boolean(),
  bedingung: z.string().optional(),
});

const AblaufBuendel = z.object({
  name: z.string().min(1),
  schrittIds: z.array(Id).min(1),
  dauer: z.number().nonnegative().optional(),
});

/**
 * K48 — reines Rechenmodell. Traegt die geschaetzte Dauer und die Buendelung,
 * erscheint aber nirgends in der Oberflaeche. Keine Ansagen im Plan (K47).
 */
export const Ablauf = z.object({
  id: Id,
  schritte: z.array(AblaufSchritt),
  buendel: z.array(AblaufBuendel).default([]),
});
export type Ablauf = z.infer<typeof Ablauf>;

export const Setup = z.object({
  id: Id,
  name: z.string().min(1),
  muehleId: Id,
  bruehgeraetId: Id,
  zubehoerIds: z.array(Id).default([]),
  parallelSchaeumen: z.boolean(),
  sammelSchaeumen: z.enum(['nie', 'geteilterBezug', 'immer']),
  /** K31 — zwei getrennte Schalter, Standard an. */
  begruendungKoffein: z.boolean().default(true),
  begruendungBohne: z.boolean().default(true),
  ablaufId: Id,
});
export type Setup = z.infer<typeof Setup>;
