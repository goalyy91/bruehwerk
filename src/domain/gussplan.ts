/**
 * Der Gussplan — "Pour Over: der Gussplan" in docs/konzept.md.
 *
 * Drei Rechnungen, alle reines TypeScript (kein Import aus daten/schema,
 * siehe CLAUDE.md "Architektur: die Schichten" — die Typen hier bilden nur
 * nach, was diese Datei tatsaechlich braucht, wie domain/plan.ts es tut):
 *
 *  - Summen: Input, Gesamtwasser, Verhaeltnis — mitlaufend, fuer die Kopf-
 *    zeile "Gussplan · V60 02 · 18 g · 300 g · 1:16,7".
 *  - Lesart-Umrechnung kumulativ <-> inkrementell. Gespeichert wird nur
 *    eine Lesart (K73) — der Umschalter wechselt die Sprache derselben
 *    Daten, nicht ihren Umfang.
 *  - Die lesbare Zeile je Baustein ("auf 150 g · Spirale · 30 s") — geteilt
 *    zwischen dem Editor (GussplanEditor.svelte, dort bearbeitbar) und der
 *    reinen Ansicht beim Shot-Loggen (Gussplanansicht.svelte, nur lesend),
 *    damit beide Bildschirme dieselbe Formatierung tragen (ux-regeln.md
 *    Regel 6/12) statt sie zweimal nachzubauen.
 *
 * Nur Bausteine vom Typ 'guss' sind lesart-abhaengig ("gieße auf 150 g"
 * gegen "gib 50 g dazu"). Bloom, Bypass und die alte generische Form
 * ('frei') tragen immer eine absolute Zugabemenge, unabhaengig von der
 * Lesart — das Notion-Format war schon immer inkrementell pro Zeile.
 */

export type Lesart = 'kumulativ' | 'inkrementell';

export type GussMuster = 'zentrum' | 'spirale' | 'aussen';
export type AgitationArt = 'schwenken' | 'rao-spin' | 'ruehren' | 'klopfen';
export type WartenModus = 'bis-durchgelaufen' | 'feste-dauer';

// Alle Anzeigefelder ausser der jeweils sinngebenden Menge sind hier
// optional, obwohl das Schema (daten/schema/kaffee.ts) sie teils verlangt —
// dieselbe bewusste Lockerung wie beim Rest der Datei: nur nachbilden, was
// diese Datei tatsaechlich braucht, nicht die Formvorschrift des Schemas
// verdoppeln. bausteinZeile() unten faengt jeden fehlenden Wert lesbar ab.
export type GussplanBaustein =
  | { readonly typ: 'vorbereiten'; readonly filterSpuelen?: boolean; readonly gefaessVorwaermen?: boolean; readonly notiz?: string }
  | { readonly typ: 'bloom'; readonly menge: number; readonly dauer?: number; readonly notiz?: string }
  | { readonly typ: 'guss'; readonly zielmenge: number; readonly dauer?: number; readonly muster?: GussMuster; readonly notiz?: string }
  | { readonly typ: 'agitation'; readonly art?: AgitationArt; readonly notiz?: string }
  | { readonly typ: 'warten'; readonly modus?: WartenModus; readonly dauer?: number; readonly notiz?: string }
  | { readonly typ: 'bypass'; readonly menge: number; readonly temperatur?: number; readonly notiz?: string }
  | { readonly typ: 'frei'; readonly menge: number; readonly dauer?: number; readonly rolle?: string };

/** Regel 8/Sprache: lesbare Labels statt der rohen Typ-Werte im Zeilenkopf. */
export const BAUSTEIN_LABEL: Record<GussplanBaustein['typ'], string> = {
  vorbereiten: 'Vorbereiten',
  bloom: 'Bloom',
  guss: 'Guss',
  agitation: 'Agitation',
  warten: 'Warten',
  bypass: 'Bypass',
  frei: 'Frei (Migration)',
};

/**
 * Die Kopfzeile eines Bausteins — "50 g · 30 s", "auf 150 g · Spirale". Bei
 * `warten` ersetzt eine vorhandene Notiz den Wert ganz ("bis der Rand
 * trocken ist" statt "bis durchgelaufen") — deine Entscheidung 2026-09-08:
 * der Umschalter bis-durchgelaufen/feste-dauer bleibt im Modell, aber die
 * Zeile liest sich als Satz, nicht als Zustand. Ohne Notiz bleibt der alte
 * Text. Die Notiz ist damit bei `warten` der Wert selbst — ein Aufrufer
 * zeigt sie deshalb nicht zusaetzlich als eigene Notizzeile an.
 */
export function bausteinZeile(b: GussplanBaustein, lesart: Lesart): string {
  switch (b.typ) {
    case 'vorbereiten':
      return [b.filterSpuelen && 'Filter spülen', b.gefaessVorwaermen && 'Gefäß vorwärmen'].filter(Boolean).join(' · ') || '—';
    case 'bloom':
      return `${b.menge} g${b.dauer !== undefined ? ` · ${b.dauer} s` : ''}`;
    case 'guss':
      return `${lesart === 'kumulativ' ? 'auf' : '+'} ${b.zielmenge} g${b.dauer ? ` · ${b.dauer} s` : ''}${b.muster ? ` · ${b.muster}` : ''}`;
    case 'agitation':
      return b.art ?? '—';
    case 'warten':
      if (b.notiz) return `bis ${b.notiz}`;
      return b.modus === 'feste-dauer' ? `${b.dauer ?? 0} s` : 'bis durchgelaufen';
    case 'bypass':
      return `${b.menge} g${b.temperatur ? ` · ${b.temperatur} °C` : ''}`;
    case 'frei':
      return `${b.rolle ?? 'Baustein'}${b.menge ? ` · ${b.menge} g` : ''}${b.dauer ? ` · ${b.dauer} s` : ''}`;
  }
}

/** Gesamtwasser = die laufende Summe nach dem letzten Baustein. */
export function gesamtwasser(bausteine: readonly GussplanBaustein[], lesart: Lesart): number {
  let laufsumme = 0;
  for (const b of bausteine) {
    if (b.typ === 'bloom' || b.typ === 'bypass' || b.typ === 'frei') {
      laufsumme += b.menge;
    } else if (b.typ === 'guss') {
      laufsumme = lesart === 'kumulativ' ? b.zielmenge : laufsumme + b.zielmenge;
    }
  }
  return laufsumme;
}

/** "1:16,7" — eine Nachkommastelle, deutsches Komma. */
export function verhaeltnis(input: number, gesamtwasser: number): string {
  if (input <= 0) return '—';
  return `1:${(gesamtwasser / input).toFixed(1).replace('.', ',')}`;
}

/**
 * Rechnet die Guss-Bausteine zwischen den Lesarten um. Bloom/Bypass/frei
 * bleiben unveraendert — sie tragen die laufende Summe nur mit, sie
 * werden von ihr nicht selbst umgerechnet.
 */
export function umrechnen<T extends GussplanBaustein>(bausteine: readonly T[], von: Lesart, nach: Lesart): T[] {
  if (von === nach) return [...bausteine];

  let laufsumme = 0;
  return bausteine.map((b) => {
    if (b.typ === 'bloom' || b.typ === 'bypass' || b.typ === 'frei') {
      laufsumme += b.menge;
      return b;
    }
    if (b.typ !== 'guss') return b;

    if (von === 'kumulativ') {
      // gespeichert als laufende Summe -> Zuwachs seit dem letzten Stand
      const zuwachs = b.zielmenge - laufsumme;
      laufsumme = b.zielmenge;
      return { ...b, zielmenge: zuwachs };
    }
    // gespeichert als Zuwachs -> neue laufende Summe
    laufsumme += b.zielmenge;
    return { ...b, zielmenge: laufsumme };
  });
}
