/**
 * Das Dial-in-Regelwerk — Paket 04, "Wenn es daneben war" in docs/konzept.md.
 *
 * Reine Rechnerei: aus den gewaehlten Befunden (Symptom + Staerke) wird eine
 * Diagnose und ein Vorschlag. Kein idb, kein Svelte (tests/schichten.test.ts
 * erzwingt das) — die Oberflaeche (ShotErfassung.svelte) ruft nur
 * diagnostiziere() auf und entscheidet selbst, was sie mit dem Ergebnis tut.
 *
 * K1/K53 — die Staerke sitzt am Befund, nicht am Shot: derselbe Katalog
 * traegt deshalb keine eigene Shot-weite Staerke, jede Zeile in REGELN liest
 * die Staerke aus den Befunden, die sie selbst betrifft.
 */

/**
 * Eigener Typ statt Import aus daten/schema/common — domain/ darf nichts aus
 * daten/ importieren (siehe CLAUDE.md "Architektur: die Schichten", umgekehrt
 * ist es erlaubt: daten/schema/shot.ts importiert Staerke von hier drueben
 * nicht, weil das Konzept dort ohnehin denselben Zwei-Werte-Zaun braucht —
 * beide Seiten fuehren "leicht"/"deutlich" bewusst getrennt, wie
 * SpielraumSchema/Spielraum es fuer Zeit/Output/Durchlaufzeit vormacht.
 */
export type Staerke = 'leicht' | 'deutlich';

export type Gruppe = 'geschmack' | 'lauf';

export interface SymptomKatalogEintrag {
  readonly id: string;
  readonly label: string;
  readonly gruppe: Gruppe;
}

/**
 * Elf Chips aus konzept.md:433-437 — acht Geschmack, drei Lauf. Das ist der
 * Systembestand (Symptom.quelle === 'system'); eigene Chips aus den offenen
 * Beobachtungen (Weg a, Etappe C) kommen dazu, aendern an dieser Liste aber
 * nichts.
 */
export const SYMPTOME: readonly SymptomKatalogEintrag[] = [
  { id: 'sauer', label: 'zu sauer', gruppe: 'geschmack' },
  { id: 'bitter', label: 'zu bitter', gruppe: 'geschmack' },
  { id: 'duenn', label: 'dünn', gruppe: 'geschmack' },
  { id: 'flach', label: 'flach', gruppe: 'geschmack' },
  { id: 'adstringent', label: 'adstringent', gruppe: 'geschmack' },
  { id: 'brandig', label: 'brandig', gruppe: 'geschmack' },
  { id: 'salzig', label: 'salzig', gruppe: 'geschmack' },
  { id: 'stark', label: 'zu stark', gruppe: 'geschmack' },
  { id: 'schnell', label: 'lief zu schnell', gruppe: 'lauf' },
  { id: 'langsam', label: 'lief zu langsam', gruppe: 'lauf' },
  { id: 'ungleichmaessig', label: 'ungleichmäßig', gruppe: 'lauf' },
];

export type RegelParameter = 'mg' | 'kt' | 'output' | 'input';
export type Richtung = 'feiner' | 'groeber' | 'mehr' | 'weniger';

export interface Befund {
  readonly symptomId: string;
  readonly staerke: Staerke;
}

export interface Aenderung {
  readonly parameter: RegelParameter;
  readonly richtung: Richtung;
  readonly schritte: number;
}

export interface Diagnose {
  readonly regelId: string;
  readonly diagnose: string;
  readonly empfehlungstext: string;
  /** Fehlt bei Regeln ohne eindeutigen Einzelwert (Verteilung/Channeling, K nicht automatisch aenderbar). */
  readonly aenderung?: Aenderung;
}

interface RegelDefinition {
  readonly id: string;
  readonly benoetigt: readonly string[];
  /** true = die Auswahl darf NICHTS ausser den benoetigten Symptomen enthalten ("flach, sonst nichts auffaellig"). */
  readonly exakt?: boolean;
  readonly diagnose: string;
  readonly empfehlungstext: string;
  readonly aenderung?: (staerke: Staerke) => Aenderung;
}

function maxStaerke(befunde: readonly Befund[], ids: readonly string[]): Staerke {
  const betroffen = befunde.filter((b) => ids.includes(b.symptomId));
  return betroffen.some((b) => b.staerke === 'deutlich') ? 'deutlich' : 'leicht';
}

/**
 * Die sieben Zeilen aus "Die Regeln dahinter", konzept.md:506-516. Die
 * siebte Zeile ("läuft schneller als die eigene Historie") gehört nicht
 * hierher — sie feuert ohne Meldung, allein aus der Profil-Laufzeit, und
 * steht deshalb in domain/drift.ts (Etappe B), als Alltagskorrektur statt
 * Dial-in-Diagnose.
 */
const REGELN: readonly RegelDefinition[] = [
  {
    id: 'unterextraktion',
    benoetigt: ['sauer', 'duenn', 'schnell'],
    diagnose: 'Unterextraktion',
    empfehlungstext: 'Mahlgrad feiner, Schrittweite nach Stärke',
    aenderung: (staerke) => ({ parameter: 'mg', richtung: 'feiner', schritte: staerke === 'deutlich' ? 2 : 1 }),
  },
  {
    id: 'starke-unterextraktion',
    benoetigt: ['sauer', 'salzig'],
    diagnose: 'starke Unterextraktion',
    empfehlungstext: 'deutlich feiner, KT +1',
    aenderung: () => ({ parameter: 'mg', richtung: 'feiner', schritte: 2 }),
  },
  {
    id: 'ueberextraktion',
    benoetigt: ['bitter', 'adstringent', 'langsam'],
    diagnose: 'Überextraktion',
    empfehlungstext: 'Mahlgrad gröber, KT prüfen',
    aenderung: () => ({ parameter: 'mg', richtung: 'groeber', schritte: 1 }),
  },
  {
    id: 'konzentration-niedrig',
    benoetigt: ['flach'],
    exakt: true,
    diagnose: 'Extraktion ok, Konzentration zu niedrig',
    empfehlungstext: 'Output −2 g oder Input +0,5 g',
    aenderung: () => ({ parameter: 'output', richtung: 'weniger', schritte: 2 }),
  },
  {
    id: 'verteilung',
    benoetigt: ['ungleichmaessig'],
    diagnose: 'Verteilung / Channeling',
    empfehlungstext: 'Puck-Prep, WDT — kein Mahlgradwechsel',
    // Bewusst kein aenderung() — die Empfehlung ist eine Handgriffaenderung,
    // kein Parameterwert, den "Uebernehmen" ins Profil schreiben koennte.
  },
  {
    id: 'kt-zu-hoch',
    benoetigt: ['brandig', 'stark'],
    diagnose: 'KT zu hoch für diese Röstung',
    empfehlungstext: 'KT −1 bis −2, Mahlgrad lassen',
    aenderung: () => ({ parameter: 'kt', richtung: 'weniger', schritte: 1 }),
  },
];

/**
 * Spezifischste Regel gewinnt: bei mehreren passenden Regeln zaehlt die mit
 * den meisten geforderten Symptomen (z. B. "sauer+duenn+schnell" schlaegt
 * eine zweistellige Regel, die zufaellig ebenfalls passt). undefined, wenn
 * keine Auswahl-Kombination im Regelwerk steht — dann bleibt der Shot ohne
 * Diagnose, statt eine zu erzwingen.
 */
export function diagnostiziere(befunde: readonly Befund[]): Diagnose | undefined {
  const ids = new Set(befunde.map((b) => b.symptomId));
  const kandidaten = REGELN.filter(
    (regel) =>
      regel.benoetigt.every((id) => ids.has(id)) && (!regel.exakt || ids.size === regel.benoetigt.length),
  );
  if (kandidaten.length === 0) return undefined;

  const regel = [...kandidaten].sort((a, b) => b.benoetigt.length - a.benoetigt.length)[0]!;
  const staerke = maxStaerke(befunde, regel.benoetigt);
  return {
    regelId: regel.id,
    diagnose: regel.diagnose,
    empfehlungstext: regel.empfehlungstext,
    aenderung: regel.aenderung?.(staerke),
  };
}

/**
 * K68/K76 — ein abgelehnter Vorschlag legt sich nicht bei jedem folgenden
 * Shot erneut vor. Er kehrt erst zurueck, wenn ZWEI aufeinanderfolgende
 * Shots denselben Befund (dieselbe Regel) zeigen; ein einzelner Shot reicht
 * nicht, ein Chargenwechsel ist keine Voraussetzung.
 */
export function kehrtZurueck(vorherigeRegelId: string | undefined, aktuelleRegelId: string): boolean {
  return vorherigeRegelId !== undefined && vorherigeRegelId === aktuelleRegelId;
}

/**
 * "Mahlgrad 3,75 -> 3,65 · zwei Schritte feiner" (konzept.md:441) — der neue
 * Wert aus einer Aenderung. Bei mg zaehlt "Schritte" in Muehle-Schritten
 * (mgSchrittgroesse, z. B. 0,05 am Sculptor); bei kt/output/input ist
 * "Schritte" bereits die Einheit selbst (KT -1, Output -2 g).
 */
export function berechneNeuenWert(aenderung: Aenderung, aktuellerWert: number, mgSchrittgroesse = 1): number {
  const delta = aenderung.parameter === 'mg' ? aenderung.schritte * mgSchrittgroesse : aenderung.schritte;
  const positiv = aenderung.richtung === 'groeber' || aenderung.richtung === 'mehr';
  const roh = positiv ? aktuellerWert + delta : aktuellerWert - delta;
  // Fliesskomma-Reste vermeiden (3.75 - 0.1 = 3.6499999999999995).
  return Math.round(roh * 1000) / 1000;
}
