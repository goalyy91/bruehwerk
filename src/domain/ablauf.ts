/**
 * Das Ruestzeiten-Rechenmodell — K48, "Was der Planer weiterhin rechnet"
 * (konzept.md:731-741). Reine Rechnerei, kein idb, kein Svelte. Erscheint
 * an keiner Stelle im Bild (K47) — nur die geschaetzte Dauer als ein
 * grosser Wert im Plan liest daraus.
 *
 * Ohne hinterlegte Schritte (heute jedes Setup, siehe daten/stammdaten.ts
 * ABLAUF_LEER) liefert geschaetzteDauer() 0 — keine erfundene Zahl. Der
 * Plan zeigt dann ehrlich "keine Ruestzeiten hinterlegt" statt einer
 * Schaetzung ohne Grundlage.
 */

export interface AblaufFuerSetup {
  readonly schritte: readonly { readonly id: string; readonly dauer: number }[];
  readonly buendel: readonly { readonly schrittIds: readonly string[]; readonly dauer?: number }[];
}

/**
 * Ruestzeit fuer `anzahlDurchgaenge` Durchgaenge an einem Setup. Ein
 * gebuendelter Schritt (z. B. "Muehle einstellen" fuer mehrere Bezuege
 * hintereinander) faellt nur einmal an, unabhaengig von der Zahl der
 * Durchgaenge, die ihn teilen — alles andere zaehlt je Durchgang.
 */
export function dauerFuerSetup(ablauf: AblaufFuerSetup, anzahlDurchgaenge: number): number {
  if (anzahlDurchgaenge <= 0 || ablauf.schritte.length === 0) return 0;

  const gebuendelteIds = new Set(ablauf.buendel.flatMap((b) => b.schrittIds));
  const einzelJeDurchgang = ablauf.schritte
    .filter((s) => !gebuendelteIds.has(s.id))
    .reduce((summe, s) => summe + s.dauer, 0);

  const buendelSumme = ablauf.buendel.reduce((summe, b) => {
    const dauer = b.dauer ?? ablauf.schritte.find((s) => b.schrittIds.includes(s.id))?.dauer ?? 0;
    return summe + dauer;
  }, 0);

  return einzelJeDurchgang * anzahlDurchgaenge + buendelSumme;
}

export interface SetupNutzung {
  readonly setupId: string;
  readonly anzahlDurchgaenge: number;
}

/** Summe ueber alle Setups einer Bestellung. Ein Setup ohne hinterlegten Ablauf traegt 0 bei. */
export function geschaetzteDauer(nutzung: readonly SetupNutzung[], ablaufProSetup: ReadonlyMap<string, AblaufFuerSetup>): number {
  return nutzung.reduce((summe, n) => {
    const ablauf = ablaufProSetup.get(n.setupId);
    return summe + (ablauf ? dauerFuerSetup(ablauf, n.anzahlDurchgaenge) : 0);
  }, 0);
}

/**
 * Reihenfolge der Durchgaenge — konzept.md:731-741 nennt drei Regeln ohne
 * Prioritaet zwischen ihnen; das ist meine Setzung (Ruecksprache
 * 2026-08-26), korrigierbar falls sie sich im Betrieb falsch anfuehlt:
 *
 * 1. Lange Pole zuerst — Pour Over/Moka sind ueberwiegend Wartezeit an
 *    einer Ressource, die sonst nichts blockiert.
 * 2. Muehlenwechsel minimieren — nach Setup gruppiert.
 * 3. Empfindlichstes zuletzt — innerhalb einer Gruppe ans Ende.
 */
export interface ReihenfolgeDurchgang {
  readonly id: string;
  readonly bruehgeraetTyp: 'espresso' | 'moka' | 'pourover' | 'coldbrew';
  readonly setupId: string;
  /** Hoechste Empfindlichkeit (Getraenk.empfindlichkeit) unter den beteiligten Positionen. */
  readonly empfindlichkeit: number;
}

const LANGE_POLE: ReadonlySet<ReihenfolgeDurchgang['bruehgeraetTyp']> = new Set(['pourover', 'moka']);

export function reihenfolge<T extends ReihenfolgeDurchgang>(durchgaenge: readonly T[]): T[] {
  return [...durchgaenge].sort((a, b) => {
    const aPol = LANGE_POLE.has(a.bruehgeraetTyp) ? 0 : 1;
    const bPol = LANGE_POLE.has(b.bruehgeraetTyp) ? 0 : 1;
    if (aPol !== bPol) return aPol - bPol;

    if (a.setupId !== b.setupId) return a.setupId < b.setupId ? -1 : 1;

    return a.empfindlichkeit - b.empfindlichkeit;
  });
}
