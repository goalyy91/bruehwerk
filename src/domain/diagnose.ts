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
  { id: 'schnell', label: 'zu schnell', gruppe: 'lauf' },
  { id: 'langsam', label: 'zu langsam', gruppe: 'lauf' },
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
  /**
   * true, wenn dieser Vorschlag nicht aus einer exakten Konzept-Kombination
   * stammt, sondern aus dem Achsen-Scoring (diagnostiziereAchse) — ein
   * einzelnes Symptom oder eine unvollstaendige Kombination, die auf eine
   * Achse einzahlt. Die Oberflaeche zeigt das als gedaempfte Meta-Zeile,
   * dieselbe Sprache wie bei geschaetzten Zahlenwerten (K54/K13).
   */
  readonly geschaetzt?: boolean;
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
 * keine Auswahl-Kombination exakt im Regelwerk steht — diagnostiziere()
 * faellt dann auf das Achsen-Scoring zurueck, statt hier schon aufzugeben.
 */
function diagnostiziereExakt(befunde: readonly Befund[]): Diagnose | undefined {
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
 * Fuenf Achsen, dieselbe Gruppierung, die schon in der Konzepttabelle steckt
 * (konzept.md "Die Regeln dahinter"), hier nur benannt statt implizit ueber
 * Regel-Kombinationen. "starke-unterextraktion" hat bewusst keine eigene
 * Achse — sie bleibt exklusiv der exakten sauer+salzig-Kombination
 * vorbehalten, sonst wuerde ein einzelnes "salzig" zu stark gedeutet.
 */
type Achse = 'unterextraktion' | 'ueberextraktion' | 'konzentration-niedrig' | 'kt-hoch' | 'verteilung';

const SYMPTOM_ACHSE: Readonly<Record<string, Achse>> = {
  sauer: 'unterextraktion',
  duenn: 'unterextraktion',
  schnell: 'unterextraktion',
  salzig: 'unterextraktion',
  bitter: 'ueberextraktion',
  adstringent: 'ueberextraktion',
  langsam: 'ueberextraktion',
  brandig: 'kt-hoch',
  stark: 'kt-hoch',
  flach: 'konzentration-niedrig',
  ungleichmaessig: 'verteilung',
};

/** Bei Gleichstand entscheidet diese Reihenfolge — dieselbe wie in der Konzepttabelle. */
const ACHSEN_PRIORITAET: readonly Achse[] = [
  'unterextraktion',
  'ueberextraktion',
  'konzentration-niedrig',
  'kt-hoch',
  'verteilung',
];

/** Welche der sechs REGELN eine Achse vertritt, wenn kein exakter Treffer vorliegt. */
const ACHSEN_REGEL_ID: Readonly<Record<Achse, string>> = {
  unterextraktion: 'unterextraktion',
  ueberextraktion: 'ueberextraktion',
  'konzentration-niedrig': 'konzentration-niedrig',
  'kt-hoch': 'kt-zu-hoch',
  verteilung: 'verteilung',
};

/**
 * Zweite, weichere Stufe (Redesign v2, Etappe 5 — "Evidenz statt
 * Konjunktion"): greift nur, wenn diagnostiziereExakt() nichts findet. Jedes
 * Symptom zahlt auf seine Achse ein, die Achse mit den meisten Treffern
 * gewinnt. Titel/Empfehlungstext/Aenderungsformel kommen unveraendert von
 * der Vertreter-Regel dieser Achse — kein neuer Text, nur eine weichere
 * Voraussetzung, um ihn zu zeigen.
 */
function diagnostiziereAchse(befunde: readonly Befund[]): Diagnose | undefined {
  const proAchse = new Map<Achse, Befund[]>();
  for (const befund of befunde) {
    const achse = SYMPTOM_ACHSE[befund.symptomId];
    if (!achse) continue;
    const bisher = proAchse.get(achse) ?? [];
    bisher.push(befund);
    proAchse.set(achse, bisher);
  }

  let beste: Achse | undefined;
  let besteAnzahl = 0;
  for (const achse of ACHSEN_PRIORITAET) {
    const anzahl = proAchse.get(achse)?.length ?? 0;
    if (anzahl > besteAnzahl) {
      beste = achse;
      besteAnzahl = anzahl;
    }
  }
  if (!beste) return undefined;

  const regel = REGELN.find((r) => r.id === ACHSEN_REGEL_ID[beste!])!;
  const staerke = maxStaerke(befunde, proAchse.get(beste)!.map((b) => b.symptomId));
  return {
    regelId: `achse-${regel.id}`,
    diagnose: regel.diagnose,
    empfehlungstext: regel.empfehlungstext,
    aenderung: regel.aenderung?.(staerke),
    geschaetzt: true,
  };
}

export function diagnostiziere(befunde: readonly Befund[]): Diagnose | undefined {
  return diagnostiziereExakt(befunde) ?? diagnostiziereAchse(befunde);
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

export interface EigenerChip {
  readonly id: string;
  readonly label: string;
  readonly regel?: { readonly parameter: RegelParameter; readonly richtung: Richtung; readonly schritte: number };
}

/**
 * Weg b, konzept.md:482-484 — "ein Chip wird nuetzlich, wenn ein Vorschlag
 * daran haengt". Anders als das System-Regelwerk braucht ein eigener Chip
 * keine Kombination: er triggert allein, sobald er gewaehlt ist, mit der
 * fest hinterlegten Regel (Parameter/Richtung/Schritte, keine
 * Staerke-Skalierung — das waere ein viertes Feld im Editor, das das
 * Konzept ausdruecklich nicht will).
 *
 * Bewusst getrennt von diagnostiziere(): das System-Regelwerk bleibt so
 * lesbar wie die Konzepttabelle, statt mit einer dynamischen Chip-Liste
 * vermischt zu werden. Der erste Treffer gewinnt.
 */
export function diagnostiziereEigen(befunde: readonly Befund[], chips: readonly EigenerChip[]): Diagnose | undefined {
  for (const befund of befunde) {
    const chip = chips.find((c) => c.id === befund.symptomId);
    if (chip?.regel) {
      return {
        regelId: `eigen-${chip.id}`,
        diagnose: chip.label,
        empfehlungstext: `${chip.regel.parameter} ${chip.regel.richtung}, ${chip.regel.schritte} Schritte`,
        aenderung: chip.regel,
      };
    }
  }
  return undefined;
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
