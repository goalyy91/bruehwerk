/**
 * Globale App-Einstellungen — ein Singleton-Datensatz mit fester Id
 * 'global'. Bis zur Korrekturrunde gab es dafuer keinen Platz im
 * Datenmodell; Begruendungsschalter und Sammel-Schaeumen standen faelschlich
 * am Setup (Geraete-Kombination), obwohl mit "Setup" im Konzept die
 * allgemeinen Einstellungen gemeint waren, nicht die Geraete-Entitaet.
 *
 * K24/K31 — die zwei Begruendungsschalter steuern, ob die App zeigt, worauf
 * sie sich bei automatischen Entscheidungen stuetzt (Reihenfolge, Vorschlag,
 * Aenderung), z. B. "7 von 8 zuletzt" neben einer vorbelegten Koffein-Frage.
 * Getrennt nach Koffein/Bohne, weil man die eine Begruendung kennen kann und
 * die andere nicht.
 *
 * sammelSchaeumen: ob Milch fuer mehrere Getraenke im selben Durchgang
 * gesammelt oder je Getraenk einzeln geschaeumt wird — bewusst dir
 * ueberlassen, die App entscheidet das nicht selbst.
 */
import { z } from 'zod';
import { Id } from './common';

export const AppEinstellungen = z.object({
  id: Id,
  begruendungKoffein: z.boolean().default(true),
  begruendungBohne: z.boolean().default(true),
  sammelSchaeumen: z.enum(['einzeln', 'gesammelt']).default('einzeln'),
  /**
   * Redesign v2, Etappe 2 — Schwellen fuer die Bestandsverwaltung
   * (domain/vorrat.ts::brauchtAufmerksamkeit). Julians Vorgabe als Default:
   * "knapp" unter 2 Bezuegen, "sollte bald raus" ab 8 Wochen frisch bzw. 8
   * Monaten eingefroren — bewusst hier statt als Konstante in domain/, damit
   * sie in den Einstellungen aenderbar sind.
   */
  bestandKnappBezuege: z.number().int().positive().default(2),
  bestandFrischWochen: z.number().positive().default(8),
  bestandEingefrorenMonate: z.number().positive().default(8),
  /**
   * Hell, dunkel oder wie das Telefon (2026-09-08).
   *
   * Die Werte heissen genau wie die Selektoren in muster/tokens.css
   * (`[data-theme='hell']` / `[data-theme='dunkel']`), damit die Einstellung
   * ohne Uebersetzungsschritt an das Wurzelelement geschrieben werden kann.
   * `system` setzt gar kein Attribut — dann greift die Media-Abfrage
   * `:root:not([data-theme])`, und das Telefon entscheidet.
   */
  thema: z.enum(['system', 'hell', 'dunkel']).default('system'),
});
export type AppEinstellungen = z.infer<typeof AppEinstellungen>;

export const EINSTELLUNGEN_ID = 'global';
