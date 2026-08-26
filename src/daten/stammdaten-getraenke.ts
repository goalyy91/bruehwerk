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
  basis: { bruehgeraetId: BRUEHGERAET_MOZZAFIATO.id, anteilBezug: 'ganz', ausVorrat: false },
  fuellmenge: 80,
  ausgleich: null,
  gefaess: { name: 'Espressotasse', volumen: 80 },
  reihenfolge: ['shot'],
  empfindlichkeit: 9, // verfaellt am schnellsten (konzept.md:739 "Empfindlichstes zuletzt")
};

export const GETRAENK_DOPPIO: Getraenk = {
  id: 'getraenk-doppio',
  name: 'Doppio',
  aktiv: true,
  kategorie: 'schwarz',
  zubereitung: 'espresso',
  basis: { bruehgeraetId: BRUEHGERAET_MOZZAFIATO.id, anteilBezug: 'ganz', ausVorrat: false },
  fuellmenge: 100,
  ausgleich: null,
  gefaess: { name: 'Doppio-Glas', volumen: 100 },
  reihenfolge: ['shot'],
  empfindlichkeit: 9,
};

export const GETRAENK_ESPRESSO_MACCHIATO: Getraenk = {
  id: 'getraenk-espresso-macchiato',
  name: 'Espresso Macchiato',
  aktiv: true,
  kategorie: 'milch',
  zubereitung: 'espresso',
  basis: { bruehgeraetId: BRUEHGERAET_MOZZAFIATO.id, anteilBezug: 'halb', ausVorrat: false },
  fuellmenge: 50, // konzept.md:920
  ausgleich: 'milch',
  // Darunter waere es kein Macchiato mehr — 30 ml minus 20 ml Extra Shot
  // waeren 10 ml (konzept.md:923).
  mindestAusgleich: 20,
  milch: { textur: 'Tupfer Schaum', temperatur: 60 },
  gefaess: { name: 'Macchiato-Glas', volumen: 80 },
  reihenfolge: ['shot', 'milch'],
  empfindlichkeit: 7,
};

export const GETRAENK_CAPPUCCINO: Getraenk = {
  id: 'getraenk-cappuccino',
  name: 'Cappuccino',
  aktiv: true,
  kategorie: 'milch',
  zubereitung: 'espresso',
  basis: { bruehgeraetId: BRUEHGERAET_MOZZAFIATO.id, anteilBezug: 'halb', ausVorrat: false },
  fuellmenge: 150, // konzept.md:917
  ausgleich: 'milch',
  mindestAusgleich: 20,
  milch: { textur: 'mikrogeschäumt', temperatur: 60 },
  gefaess: { name: 'Cappuccino-Tasse', volumen: 180 },
  reihenfolge: ['shot', 'milch'],
  empfindlichkeit: 5,
};

export const GETRAENK_LATTE_MACCHIATO: Getraenk = {
  id: 'getraenk-latte-macchiato',
  name: 'Latte Macchiato',
  aktiv: true,
  kategorie: 'milch',
  zubereitung: 'espresso',
  basis: { bruehgeraetId: BRUEHGERAET_MOZZAFIATO.id, anteilBezug: 'halb', ausVorrat: false },
  fuellmenge: 240, // konzept.md:918
  ausgleich: 'milch',
  mindestAusgleich: 20,
  milch: { textur: 'leicht geschäumt, geschichtet', temperatur: 65 },
  gefaess: { name: 'Latte-Glas', volumen: 300 },
  reihenfolge: ['milch', 'shot'], // Schicht: Milch zuerst, der Shot sinkt durch
  empfindlichkeit: 4,
};

export const GETRAENK_LONG_BLACK: Getraenk = {
  id: 'getraenk-long-black',
  name: 'Long Black',
  aktiv: true,
  kategorie: 'schwarz',
  zubereitung: 'espresso',
  basis: { bruehgeraetId: BRUEHGERAET_MOZZAFIATO.id, anteilBezug: 'ganz', ausVorrat: false },
  fuellmenge: 160, // konzept.md:919
  ausgleich: 'heisswasser',
  heisswasser: { temperatur: 90 },
  gefaess: { name: 'Long-Black-Glas', volumen: 200 },
  // Traegt den Unterschied zu einem Americano (konzept.md:325): Wasser
  // zuerst, der Shot obendrauf erhaelt die Crema.
  reihenfolge: ['wasser', 'shot'],
  empfindlichkeit: 6,
};

export const GETRAENK_POUR_OVER: Getraenk = {
  id: 'getraenk-pourover',
  name: 'Pour Over',
  aktiv: true,
  kategorie: 'filter',
  zubereitung: 'pourover',
  basis: { bruehgeraetId: BRUEHGERAET_HARIO_V60.id, anteilBezug: 'ganz', ausVorrat: false },
  fuellmenge: 350,
  ausgleich: null,
  gefaess: { name: 'Karaffe/Becher', volumen: 350 },
  reihenfolge: [],
  empfindlichkeit: 3,
};

export const GETRAENK_MOKA: Getraenk = {
  id: 'getraenk-moka',
  name: 'Moka',
  aktiv: true,
  kategorie: 'moka',
  zubereitung: 'moka',
  basis: { bruehgeraetId: BRUEHGERAET_BIALETTI_1.id, anteilBezug: 'ganz', ausVorrat: false },
  fuellmenge: 60, // 1er-Kanne; die 3er liefert 130 ml auf drei Tassen (konzept.md:845)
  ausgleich: null,
  gefaess: { name: 'Espressotasse', volumen: 60 },
  reihenfolge: [],
  empfindlichkeit: 3,
};

export const GETRAENK_COLD_BREW: Getraenk = {
  id: 'getraenk-coldbrew',
  name: 'Cold Brew',
  aktiv: true,
  kategorie: 'coldbrew',
  zubereitung: 'coldbrew',
  basis: { bruehgeraetId: BRUEHGERAET_COLDBREW_KARAFFE.id, anteilBezug: 'ganz', ausVorrat: true },
  fuellmenge: 300,
  ausgleich: null,
  gefaess: { name: 'Cold-Brew-Glas', volumen: 300 },
  reihenfolge: [],
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
