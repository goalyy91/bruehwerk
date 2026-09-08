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

const Basis = z.object({
  bruehgeraetId: Id,
  anteilBezug: z.enum(['ganz', 'halb']),
  profilPraeferenz: z.string().optional(),
  ausVorrat: z.boolean(),
});

/**
 * Ein Getraenk ist ein Rezept, keine Mengenrechnung.
 *
 * Bis 2026-09-07 stand hier die Regel "fuellmenge ist die Konstante, nicht
 * die Milchmenge" (Milch = Fuellmenge - Summe Shots). Sie ist auf Julians
 * Entscheidung entfallen: "ich habe meine Standardtassen und weiss was
 * worein kommt, und alles was Kaffeemenge ist richtet sich immer nach dem
 * Kaffeerezept."
 *
 * Damit sind `fuellmenge`, `mindestAusgleich`, `gefaess` (Name + Volumen)
 * und `reihenfolge` weggefallen. Die ersten beiden trugen ausschliesslich
 * die Extra-Shot-Entscheidung, die jetzt `extraShotMoeglich` direkt sagt;
 * die letzten beiden hat nachweislich nie jemand gelesen.
 *
 * Folge, bewusst in Kauf genommen: die App kennt keine Getraenkemengen mehr
 * und kann daher weder eine Milchmenge rechnen noch vor einer zu kleinen
 * Tasse warnen. Ohne Neuerfassung ist das nicht umkehrbar.
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
  ausgleich: z.enum(['milch', 'heisswasser']).nullable(),
  milch: MilchAngabe.optional(),
  heisswasser: HeisswasserAngabe.optional(),
  /**
   * Ob beim Bestellen ein zweiter Shot dazukommen darf (2026-09-07).
   *
   * Ersetzt die Rechnung aus `fuellmenge` und `mindestAusgleich`, die vorher
   * bestimmte, wann der Extra Shot verschwindet (Espresso Macchiato: 30 ml
   * Milch minus 20 ml waeren 10 ml, kein Macchiato mehr). Julian:
   * "ich habe meine Standardtassen und weiss was worein kommt" — die
   * Rechnung loeste ein Problem, das er nicht hat, und kostete drei Felder,
   * deren Zweck aus der Beschriftung nicht hervorging.
   *
   * `.default(true)` traegt bestehende Datensaetze, die das Feld noch nicht
   * kennen. Fuer den Macchiato gehoert der Schalter danach einmal von Hand
   * ausgeschaltet — er ist der einzige Fall, fuer den die alte Rechnung
   * ueberhaupt gedacht war.
   */
  extraShotMoeglich: z.boolean().default(true),
  /**
   * Wie schnell das Getraenk verfaellt — 0 haelt lange (Cold Brew), 10 will
   * sofort getrunken werden (Espresso pur). Steuert allein die Reihenfolge
   * im Plan (domain/ablauf.ts) und erscheint nirgends in der Bedienung (K48).
   * Im Getraenkeblatt als drei benannte Stufen eingegeben, nicht als Zahl.
   */
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
