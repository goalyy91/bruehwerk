/**
 * Der Gussplan — "Pour Over: der Gussplan" in docs/konzept.md.
 *
 * Zwei Rechnungen, beide reines TypeScript (kein Import aus daten/schema,
 * siehe CLAUDE.md "Architektur: die Schichten" — die Typen hier bilden nur
 * nach, was diese Datei tatsaechlich braucht, wie domain/plan.ts es tut):
 *
 *  - Summen: Input, Gesamtwasser, Verhaeltnis — mitlaufend, fuer die Kopf-
 *    zeile "Gussplan · V60 02 · 18 g · 300 g · 1:16,7".
 *  - Lesart-Umrechnung kumulativ <-> inkrementell. Gespeichert wird nur
 *    eine Lesart (K73) — der Umschalter wechselt die Sprache derselben
 *    Daten, nicht ihren Umfang.
 *
 * Nur Bausteine vom Typ 'guss' sind lesart-abhaengig ("gieße auf 150 g"
 * gegen "gib 50 g dazu"). Bloom, Bypass und die alte generische Form
 * ('frei') tragen immer eine absolute Zugabemenge, unabhaengig von der
 * Lesart — das Notion-Format war schon immer inkrementell pro Zeile.
 */

export type Lesart = 'kumulativ' | 'inkrementell';

export type GussplanBaustein =
  | { readonly typ: 'vorbereiten' }
  | { readonly typ: 'bloom'; readonly menge: number }
  | { readonly typ: 'guss'; readonly zielmenge: number }
  | { readonly typ: 'agitation' }
  | { readonly typ: 'warten' }
  | { readonly typ: 'bypass'; readonly menge: number }
  | { readonly typ: 'frei'; readonly menge: number };

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
