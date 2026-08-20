/**
 * Getraenk, Ansatz, Person — aus docs/konzept.md "Getraenke" und
 * "Ranking & Personen".
 */
import { z } from 'zod';
import { Id } from './common';

const MilchAngabe = z.object({
  textur: z.string().min(1),
  temperatur: z.number(),
});

const HeisswasserAngabe = z.object({
  temperatur: z.number(),
});

const Gefaess = z.object({
  name: z.string().min(1),
  volumen: z.number().positive(),
});

const Basis = z.object({
  bruehgeraetId: Id,
  anteilBezug: z.enum(['ganz', 'halb']),
  profilPraeferenz: z.string().optional(),
  ausVorrat: z.boolean(),
});

/**
 * fuellmenge ist die Konstante, nicht die Milchmenge (siehe CLAUDE.md):
 * Milch = Fuellmenge - Summe Shots. Eingegeben wird trotzdem die
 * Milchmenge; die App merkt sich die Fuellmenge daraus — das passiert in
 * domain/, nicht hier. Dieses Schema speichert nur die Konstante.
 */
export const Getraenk = z.object({
  id: Id,
  name: z.string().min(1),
  aktiv: z.boolean(),
  kategorie: z.string().min(1),
  vorlageId: Id.optional(),
  /** K46 — die Rezeptseite der Kopplung an Kaffee.geeignetFuer. */
  zubereitung: z.string().min(1),
  basis: Basis,
  fuellmenge: z.number().positive(),
  ausgleich: z.enum(['milch', 'heisswasser']).nullable(),
  /** Darunter wird der Extra Shot gar nicht erst angeboten (Espresso Macchiato: 30ml - 20ml waere keiner mehr). */
  mindestAusgleich: z.number().nonnegative().optional(),
  milch: MilchAngabe.optional(),
  heisswasser: HeisswasserAngabe.optional(),
  gefaess: Gefaess,
  /** Traegt den Unterschied zwischen Long Black und Americano. */
  reihenfolge: z.array(z.string().min(1)).default([]),
  empfindlichkeit: z.number().min(0).max(10),
  standardKaffeeId: Id.optional(),
});
export type Getraenk = z.infer<typeof Getraenk>;

export const Ansatz = z.object({
  id: Id,
  kaffeeId: Id,
  profilId: Id,
  angesetzt: z.number().int().nonnegative(),
  fertigAb: z.number().int().nonnegative(),
  menge: z.number().positive(),
  rest: z.number().nonnegative(),
  status: z.enum(['ziehend', 'fertig', 'aufgebraucht']),
});
export type Ansatz = z.infer<typeof Ansatz>;

/**
 * favoriten, koffeinAnteil und extraShotAnteil sind abgeleitet — sie werden
 * aus der Historie gerechnet (domain/ranking.ts), nie direkt gepflegt.
 * Sie stehen trotzdem im Schema, weil eine Ablage sie als Cache mitschreiben
 * darf; die Rechenregel bleibt in domain/.
 */
export const Person = z.object({
  id: Id,
  vorname: z.string().min(1),
  nachname: z.string().optional(),
  notiz: z.string().optional(),
  aktiv: z.boolean(),
  standard: z.boolean(),
  favoriten: z.array(Id).default([]),
  koffeinAnteil: z.number().min(0).max(1).default(0),
  extraShotAnteil: z.number().min(0).max(1).default(0),
});
export type Person = z.infer<typeof Person>;
