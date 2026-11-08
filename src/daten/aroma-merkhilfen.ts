/**
 * Merkhilfen zum Nachriechen — Etappe 2 des Lern-Nachzugs (docs/konzept.md,
 * Übungsmodus, "Nachriechen").
 *
 * Eine Merkhilfe ist **eine Zeile**, die beim zweiten Riechen nach einer
 * falschen Antwort neben dem Namen steht: erst die Beschreibungswörter, nach
 * dem Gedankenstrich ein Anker (eine Alltagserinnerung oder die Abgrenzung
 * zum Nachbarn). Der Zweck ist eng: Name und Geruch sollen *gleichzeitig*
 * aufgenommen werden — eine Bezeichnung hilft dem Geruchsgedächtnis nur,
 * wenn sie schon beim Einprägen da ist, nicht erst beim Abruf (Frank et al.
 * 2010, Chemical Senses). Geschichte, Gewinnung und Chemie bleiben im
 * Datenblatt; sie lenken in diesem Moment ab.
 *
 * **Jedes Wort stammt aus dem Datenblatt desselben Fläschchens** —
 * Beschreibung oder der Satz aus dem WCR Sensory Lexicon. Nichts ist
 * dazuerfunden. Wer eine Merkhilfe ändert, prüft sie gegen das Blatt.
 *
 * Kuratiert statt automatisch gezogen: der erste Satz eines Blatts ist nur
 * meistens eine Wortliste (bei Mandel steht dort „eines der fruchtigeren
 * Nussaromen", bei Grüner Paprika eine Abgrenzung zur Chilifamilie), und nur
 * 42 von 57 Blättern haben einen WCR-Satz.
 *
 * Fehlende Blätter (26 Gurke, 59 Karamellisiert, 60 Vanille) haben keine
 * Merkhilfe — dort bleibt es bei der Aufforderung, noch einmal zu riechen.
 * Statischer Text wie die Datenblätter: kein Schema, keine Ablage.
 */

/** Längste erlaubte Merkhilfe — eine Zeile, die man beim Riechen in einem Blick liest. */
export const MERKHILFE_MAX_ZEICHEN = 90;

export const MERKHILFEN: Readonly<Record<number, string>> = {
  1: 'süß, hellbraun, leicht würzig, blumig — dazu Heu, Wachs, Karamell',
  2: 'süß-erdig, leicht muffig, getrocknete Pflanze und Rinde — Malz, Honig',
  3: 'süß, weich, blumig, leicht staubig — grüne Frische, Hagebutte',
  4: 'intensiv, süß, blumig, moschusartig — grüner, muffig-staubiger Zug',
  5: 'hell, süß, saftig, herb-säuerlich, blumig — Konfitüre, Dessert',
  6: 'dunkel-fruchtig, süß, leicht sauer — teeartig, blumig',
  7: 'dunkle Frucht, scharf, herb, moschusartig-schwefelig — Trauben, Pinot Noir',
  8: 'süß, weich, blumig, leicht saure, oft weinige Note — Sahne, Konfitüre',
  9: 'konzentriert, süß, braun, dunkel-fruchtig — getrocknete Trauben',
  10: 'tief, dunkle Frucht, erdig, überreif, leicht braun — getrocknete Pflaumen',
  11: 'dunkel-fruchtig, leicht säuerlich, leicht bitter — Vanille, Rose',
  12: 'süß-sauer, saftig, leicht scharf — apfelartig, Honig, Kokos',
  13: 'saftig, süß, blumig, Honig — grüne Noten: Gras, Kiefer',
  14: 'leicht, kühl, hell, frisch-fruchtig — grün wie Gurke oder cremig',
  15: 'süß, vanillig, holzig, blumig — unreif mit grünen Noten',
  16: 'warm, knackig, leicht süß, fruchtig — frisch oder als Apfelmus',
  17: 'weich, saftig, parfümiert-blumig, leicht sauer — Litschi, Birne',
  18: 'zitrisch, warm, eher süß, blumig — Schale bitter und adstringierend',
  19: 'scharf, säuerlich, herb, saftig — harzig-holzige Schale',
  20: 'zitrisch, grün, grasig, harzig — dunkler und grasiger als Zitrone',
  21: 'durchdringend sauer, schweißig, käsig — ranzige Butter, Parmesan',
  22: 'scharf, durchdringend, alkoholartig, dunkle Frucht — Rotwein',
  23: 'süß, gärend, stechend, intensiv fruchtig — Waschstation, Kompost',
  24: 'grün, süß, bohnig, roh, muffig-erdig — Gartenerde',
  25: 'grün, frisch, blättrig, roh, süß-durchdringend — frisch geschnitten',
  27: 'grün, erdig, frisch, grasig, süß — nicht Chili, schon in kleinsten Mengen wirksam',
  28: 'süß, trocken, staubig-pudrig, leicht grün — trockene Gräser',
  29: 'krautig, würzig, minzig, holzig, pfeffrig',
  30: 'warm, frisch, klar, süß — Kiefernwald, Weihnachtsbaum',
  31: 'würzig, harzig, duftendes Holz — Bleistiftspäne, Kleiderschrank',
  32: 'scharf, erdig, muffig, erdig-grün — rohe, geschälte Kartoffel',
  33: 'holzig, süß, muffig, abgestanden — Papierverpackung',
  34: 'süß, braun, muffig, dunkel — die Rinde eines Baums',
  35: 'muffig, dumpf, leicht grün — feuchter Keller, Korkfehler',
  36: 'süßlich, schwer — feuchte, frisch umgegrabene Erde',
  37: 'erdig, kräftig, warm, leicht holzig — Sattel, Schuhe, Bauernhof',
  38: 'steril, beißend, chemisch, jodartig — Pflaster, Alkohol, Krankenhaus',
  39: 'stechend, rauchig, ölig, harzig — Straßenbaustelle, Sauna',
  40: 'dunkel, schwer, muffig, beißend — Autoreifen',
  41: 'braun, leicht süß, durchdringend — ausgereifter Tabak, nicht aschig wie Rauch',
  42: 'scharf, durchdringend, beißend, harzig — Lagerfeuer, Kamin',
  43: 'frisch, süß, cremig, warm, leicht geröstet — Buttergebäck',
  44: 'süß, braun, nussig, getreideartig — Toaster, Frühstück',
  45: 'hellbraun, süß, getreideartig, staubig, leicht fermentiert — Keks',
  46: 'scharf, holzig, harzig, warm, muffig — gemahlener schwarzer Pfeffer',
  47: 'süß, trocken, holzig, leicht blumig — Lakritz, Fenchel',
  48: 'warm, süß, braun, holzig, schwer, leicht zitronig — Backgewürz',
  49: 'süß, braun, leicht holzig, würzig — Gebäck',
  50: 'warm, würzig, süß, leicht medizinisch-minzig — Glühwein',
  51: 'fettig, geröstet, süß, ölig, bohnig — Erdnussbutter',
  52: 'reich, nussig, erdig, buttrig, holzig — leicht zederartig',
  53: 'süß, hellbraun, buttrig, eine der fruchtigeren Nüsse — Marzipan, Kirsche',
  54: 'muffig, nussig, erdig, harzig wie Kiefer — scharf adstringierend',
  55: 'intensiver und bitterer als Schokolade, röstig — blumig, tabakartig',
  56: 'süß, milchig, erdig, röstig, Kakao — Vanille, Milch',
  57: 'kräftig, dunkel, süß, karamellisiert — Lebkuchen, Hauch Muskat',
  58: 'süß, holzig, braun, karamellisiert, leicht grün — Pancakes',
};

/**
 * Die Wörter, aus denen beim ersten Kontakt mit einem Aroma blind gewählt
 * wird (Lern-Nachzug Etappe 4, docs/konzept.md "Kennenlernen"). Gezogen aus
 * den häufigsten Beschreibungswörtern der Merkhilfen oben — dieselbe
 * Sprache, die direkt danach angezeigt wird. "süß" fehlt mit Absicht: es
 * steht in 34 von 57 Merkhilfen und unterscheidet damit fast nichts.
 */
export const BESCHREIBUNGSWOERTER: readonly string[] = [
  'fruchtig',
  'blumig',
  'grün',
  'frisch',
  'saftig',
  'sauer',
  'würzig',
  'scharf',
  'harzig',
  'holzig',
  'nussig',
  'röstig',
  'warm',
  'erdig',
  'muffig',
  'beißend',
];

export function merkhilfeZu(nummer: number | undefined): string | undefined {
  return nummer === undefined ? undefined : MERKHILFEN[nummer];
}
