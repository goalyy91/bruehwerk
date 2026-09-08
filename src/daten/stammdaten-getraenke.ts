/**
 * Die neun Getraenke zum Start — docs/konzept.md:832-846.
 *
 * Zwei Sorten von Zahl stecken hier ineinander, bewusst unterschiedlich
 * sicher:
 *
 * - **Milliliter, Fuellmenge, Mindestmenge** kommen direkt aus der
 *   Konzepttabelle (`konzept.md:836-846`, Extra-Shot-Tabelle `:915-921`).
 *   Das Konzept selbst sagt: "Vorschlaege von mir, keine Messungen von dir"
 *   — kein Blocker, weil dieses Paket genau das Formular baut, mit dem sie
 *   sich sofort korrigieren lassen.
 * - **Textur, Temperatur, Reihenfolge, Empfindlichkeit** stehen nirgends im
 *   Konzept beziffert. Das sind meine eigenen, plausiblen Startwerte fuer
 *   Felder, die das Schema verlangt — nicht mit derselben Sicherheit wie die
 *   Konzepttabelle, ebenfalls im Getraenkeblatt aenderbar.
 *
 * zubereitung nutzt dieselben Woerter wie Bruehgeraet.typ ('espresso' |
 * 'moka' | 'pourover' | 'coldbrew') — eine Vokabel fuer beide Seiten der
 * Kopplung (K46), kein Uebersetzungsschritt dazwischen.
 *
 * Moka ist ein Getraenk mit zwei Geraeten (konzept.md:972): diese Zeile
 * traegt das 1er-Bialetti als Basis, der Planer (Etappe E) waehlt bei
 * Bedarf das 3er anhand der gewuenschten Tassenzahl — `basis.bruehgeraetId`
 * ist hier nur "welche Art Geraet", keine feste Bindung.
 */
import type { Getraenk } from './schema';
import { BRUEHGERAET_MOZZAFIATO, BRUEHGERAET_HARIO_V60, BRUEHGERAET_BIALETTI_1, BRUEHGERAET_COLDBREW_KARAFFE } from './stammdaten';

export const GETRAENK_ESPRESSO: Getraenk = {
  id: 'getraenk-espresso',
  name: 'Espresso',
  aktiv: true,
  kategorie: 'schwarz',
  zubereitung: 'espresso',
  // Rückmeldung 2026-09-04: war faelschlich 'ganz' — ein Espresso braucht
  // physisch nur einen Shot (halben Bezug), genau wie die Espresso-
  // Komponente eines Cappuccino. Erst dadurch buendeln Espresso + Cappuccino
  // derselben Bohne ueber die unveraenderte Logik in domain/plan.ts zu einem
  // gemeinsamen Bezug ("Doppelbezug"), 0 g Verschnitt statt 9 g. Doppio
  // bleibt bewusst 'ganz' — zwei Shots, die volle Bezugsmenge.
  basis: { bruehgeraetId: BRUEHGERAET_MOZZAFIATO.id, anteilBezug: 'halb', ausVorrat: false },
  ausgleich: null,
  // Extra Shot: nur der Macchiato verbietet ihn — 30 ml Milch minus 20 ml
  // Extra Shot waeren 10 ml, das ist keiner mehr (konzept.md:923).
  extraShotMoeglich: true,
  empfindlichkeit: 9, // verfaellt am schnellsten (konzept.md:739 "Empfindlichstes zuletzt")
};

export const GETRAENK_DOPPIO: Getraenk = {
  id: 'getraenk-doppio',
  name: 'Doppio',
  aktiv: true,
  kategorie: 'schwarz',
  zubereitung: 'espresso',
  basis: { bruehgeraetId: BRUEHGERAET_MOZZAFIATO.id, anteilBezug: 'ganz', ausVorrat: false },
  ausgleich: null,
  // Extra Shot: nur der Macchiato verbietet ihn — 30 ml Milch minus 20 ml
  // Extra Shot waeren 10 ml, das ist keiner mehr (konzept.md:923).
  extraShotMoeglich: true,
  empfindlichkeit: 9,
};

export const GETRAENK_ESPRESSO_MACCHIATO: Getraenk = {
  id: 'getraenk-espresso-macchiato',
  name: 'Espresso Macchiato',
  aktiv: true,
  kategorie: 'milch',
  zubereitung: 'espresso',
  basis: { bruehgeraetId: BRUEHGERAET_MOZZAFIATO.id, anteilBezug: 'halb', ausVorrat: false },
  ausgleich: 'milch',
  // Darunter waere es kein Macchiato mehr — 30 ml minus 20 ml Extra Shot
  // waeren 10 ml (konzept.md:923).
  milch: { textur: 'Tupfer Schaum', temperatur: 60 },
  // Extra Shot: nur der Macchiato verbietet ihn — 30 ml Milch minus 20 ml
  // Extra Shot waeren 10 ml, das ist keiner mehr (konzept.md:923).
  extraShotMoeglich: false,
  empfindlichkeit: 7,
};

export const GETRAENK_CAPPUCCINO: Getraenk = {
  id: 'getraenk-cappuccino',
  name: 'Cappuccino',
  aktiv: true,
  kategorie: 'milch',
  zubereitung: 'espresso',
  basis: { bruehgeraetId: BRUEHGERAET_MOZZAFIATO.id, anteilBezug: 'halb', ausVorrat: false },
  ausgleich: 'milch',
  milch: { textur: 'mikrogeschäumt', temperatur: 60 },
  // Extra Shot: nur der Macchiato verbietet ihn — 30 ml Milch minus 20 ml
  // Extra Shot waeren 10 ml, das ist keiner mehr (konzept.md:923).
  extraShotMoeglich: true,
  empfindlichkeit: 5,
};

export const GETRAENK_LATTE_MACCHIATO: Getraenk = {
  id: 'getraenk-latte-macchiato',
  name: 'Latte Macchiato',
  aktiv: true,
  kategorie: 'milch',
  zubereitung: 'espresso',
  basis: { bruehgeraetId: BRUEHGERAET_MOZZAFIATO.id, anteilBezug: 'halb', ausVorrat: false },
  ausgleich: 'milch',
  milch: { textur: 'leicht geschäumt, geschichtet', temperatur: 65 },
  // Extra Shot: nur der Macchiato verbietet ihn — 30 ml Milch minus 20 ml
  // Extra Shot waeren 10 ml, das ist keiner mehr (konzept.md:923).
  extraShotMoeglich: true,
  empfindlichkeit: 4,
};

export const GETRAENK_LONG_BLACK: Getraenk = {
  id: 'getraenk-long-black',
  name: 'Long Black',
  aktiv: true,
  kategorie: 'schwarz',
  zubereitung: 'espresso',
  basis: { bruehgeraetId: BRUEHGERAET_MOZZAFIATO.id, anteilBezug: 'ganz', ausVorrat: false },
  ausgleich: 'heisswasser',
  heisswasser: { temperatur: 90 },
  // Traegt den Unterschied zu einem Americano (konzept.md:325): Wasser
  // zuerst, der Shot obendrauf erhaelt die Crema.
  // Extra Shot: nur der Macchiato verbietet ihn — 30 ml Milch minus 20 ml
  // Extra Shot waeren 10 ml, das ist keiner mehr (konzept.md:923).
  extraShotMoeglich: true,
  empfindlichkeit: 6,
};

export const GETRAENK_POUR_OVER: Getraenk = {
  id: 'getraenk-pourover',
  name: 'Pour Over',
  aktiv: true,
  kategorie: 'filter',
  zubereitung: 'pourover',
  basis: { bruehgeraetId: BRUEHGERAET_HARIO_V60.id, anteilBezug: 'ganz', ausVorrat: false },
  ausgleich: null,
  // Extra Shot: nur der Macchiato verbietet ihn — 30 ml Milch minus 20 ml
  // Extra Shot waeren 10 ml, das ist keiner mehr (konzept.md:923).
  extraShotMoeglich: true,
  empfindlichkeit: 3,
};

export const GETRAENK_MOKA: Getraenk = {
  id: 'getraenk-moka',
  name: 'Moka',
  aktiv: true,
  kategorie: 'moka',
  zubereitung: 'moka',
  basis: { bruehgeraetId: BRUEHGERAET_BIALETTI_1.id, anteilBezug: 'ganz', ausVorrat: false },
  ausgleich: null,
  // Extra Shot: nur der Macchiato verbietet ihn — 30 ml Milch minus 20 ml
  // Extra Shot waeren 10 ml, das ist keiner mehr (konzept.md:923).
  extraShotMoeglich: true,
  empfindlichkeit: 3,
};

export const GETRAENK_COLD_BREW: Getraenk = {
  id: 'getraenk-coldbrew',
  name: 'Cold Brew',
  aktiv: true,
  kategorie: 'coldbrew',
  zubereitung: 'coldbrew',
  basis: { bruehgeraetId: BRUEHGERAET_COLDBREW_KARAFFE.id, anteilBezug: 'ganz', ausVorrat: true },
  ausgleich: null,
  // Extra Shot: nur der Macchiato verbietet ihn — 30 ml Milch minus 20 ml
  // Extra Shot waeren 10 ml, das ist keiner mehr (konzept.md:923).
  extraShotMoeglich: true,
  empfindlichkeit: 1, // verfaellt am langsamsten — kalt, fertig aus dem Vorrat
};

export const GETRAENKE: readonly Getraenk[] = [
  GETRAENK_ESPRESSO,
  GETRAENK_DOPPIO,
  GETRAENK_ESPRESSO_MACCHIATO,
  GETRAENK_CAPPUCCINO,
  GETRAENK_LATTE_MACCHIATO,
  GETRAENK_LONG_BLACK,
  GETRAENK_POUR_OVER,
  GETRAENK_MOKA,
  GETRAENK_COLD_BREW,
];
