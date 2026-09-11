/**
 * Ranking und Vorbelegung — K12, K25, K56.
 *
 * Zwei verschiedene Mechaniken, die man nicht verwechseln darf:
 *
 * 1. Getraenke-Reihenfolge: exponentiell abklingender Zaehler mit 60 Tagen
 *    Halbwertszeit. Eine intensive Woche kippt die Reihenfolge nicht sofort,
 *    eine ganze Saison verschwindet ueber den Winter von selbst.
 *
 * 2. Vorbelegte Fragen (Koffein, Kaennchen, Bohne, Extra Shot): fester
 *    Anteil ueber die letzten 20 Positionen, nicht Decay. Koffein ist eine
 *    Gewohnheit, die sich aendert — wer vor einem Jahr koffeinhaltig getrunken
 *    hat, sagt nichts darueber, was er heute will.
 */

/** Halbwertszeit in Tagen. Aenderbar in den Einstellungen. */
export const HALBWERTSZEIT_TAGE = 60;

const MS_PRO_TAG = 24 * 60 * 60 * 1000;

/**
 * Score aus einer vollstaendigen Log-Historie.
 *
 * score = Summe ueber 2^(-dt / H)
 *
 * Wird beim Neuaufbau gebraucht; im Betrieb laeuft die inkrementelle Form,
 * die dieselbe Zahl in konstanter Zeit fortschreibt.
 */
export function score(
  logZeitpunkte: readonly number[],
  jetzt: number,
  halbwertszeitTage: number = HALBWERTSZEIT_TAGE,
): number {
  let summe = 0;
  for (const ts of logZeitpunkte) {
    const tage = (jetzt - ts) / MS_PRO_TAG;
    summe += Math.pow(2, -tage / halbwertszeitTage);
  }
  return summe;
}

/**
 * Schreibt einen gespeicherten Score fort, ohne die Historie zu lesen.
 *
 * score <- score * 2^(-dt / H) + 1
 *
 * @param standAlt Score beim letzten Log.
 * @param standTs Zeitpunkt des letzten Logs.
 * @param jetzt Zeitpunkt des neuen Logs.
 */
export function scoreFortschreiben(
  standAlt: number,
  standTs: number,
  jetzt: number,
  halbwertszeitTage: number = HALBWERTSZEIT_TAGE,
): number {
  const tage = (jetzt - standTs) / MS_PRO_TAG;
  return standAlt * Math.pow(2, -tage / halbwertszeitTage) + 1;
}

/** Fenster fuer vorbelegte Fragen. Bewusst fest, nicht Decay. */
export const FENSTER_POSITIONEN = 20;
export const SCHWELLE_VORBELEGEN = 0.6;
export const SCHWELLE_FRAGEN = 0.4;

export type Vorbelegung =
  | { frage: false }
  | { frage: true; vorbelegt: true; anteil: number; treffer: number; von: number }
  | { frage: true; vorbelegt: false; anteil: number; treffer: number; von: number };

/**
 * Entscheidet, ob und wie gefragt wird.
 *
 * >= 60 %      fragen, mit Ja vorbelegt
 * > 40 < 60 %  fragen, ohne Vorbelegung — hier zu raten waere schlechter
 *              als zu fragen, und der Fehler faellt erst beim Trinken auf
 * <= 40 %      gar nicht fragen
 *
 * Ohne Historie wird gefragt, aber nicht vorbelegt: bei einer neu angelegten
 * Person gibt es nichts, worauf sich eine Vorbelegung stuetzen koennte.
 */
export function vorbelegung(
  letztePositionen: readonly boolean[],
  fenster: number = FENSTER_POSITIONEN,
): Vorbelegung {
  const betrachtet = letztePositionen.slice(-fenster);
  const von = betrachtet.length;
  if (von === 0) {
    return { frage: true, vorbelegt: false, anteil: 0, treffer: 0, von: 0 };
  }

  const treffer = betrachtet.filter(Boolean).length;
  const anteil = treffer / von;

  if (anteil >= SCHWELLE_VORBELEGEN) {
    return { frage: true, vorbelegt: true, anteil, treffer, von };
  }
  if (anteil <= SCHWELLE_FRAGEN) {
    return { frage: false };
  }
  return { frage: true, vorbelegt: false, anteil, treffer, von };
}

/**
 * Die Zeile, die eine Vorbelegung von einer Behauptung unterscheidet — sie
 * zeigt, worauf die App sich stuetzt. Abschaltbar in den Einstellungen,
 * getrennt fuer Koffein und Bohne.
 */
export function begruendung(v: Vorbelegung): string | null {
  if (!v.frage || v.von === 0) return null;
  return `${v.treffer} von ${v.von} zuletzt`;
}

/**
 * Bildet alle drei Faelle der Tabelle einmal auf einen echten Antwortwert ab
 * — bislang uebersetzte nur der ≤40%-Fall ("gar nicht fragen" -> `false`)
 * in eine echte Vorbelegung des Zustands, der ≥60%-Fall blieb rein optisch
 * (`VorbelegteFrage.svelte` markierte "Ja" nur als Vorschlag, `onWahl` feuerte
 * erst beim Tippen). Wer vorbelegt aussieht, soll auch vorbelegt *sein* —
 * sonst haengt der Rest eines Formulars an einem Tap, der nichts entscheidet,
 * was nicht laengst entschieden waere.
 *
 * `undefined` heisst ausdruecklich "kein Default" (40-60 %, K56: hier zu
 * raten waere schlechter als zu fragen) — nicht "unbekannt".
 */
export function vorbelegteAntwort(v: Vorbelegung): boolean | undefined {
  if (!v.frage) return false;
  return v.vorbelegt ? true : undefined;
}

/** Minimaler Ausschnitt einer Position, den das Ranking braucht — kein Import aus daten/schema (domain/ bleibt unabhaengig davon). */
export interface PositionFuerRanking {
  /** Fehlt bei Positionen aus dem Mengen-Modus (keine Personenzuordnung). */
  readonly personId?: string;
  readonly getraenkId: string;
  readonly ts: number;
}

/**
 * Getraenke einer Person nach Decay-Score sortiert, hoechster Score zuerst —
 * die Reihenfolge fuer den Getraenk-Schritt der Bestellung (Paket 06) und
 * fuer die Zwei-Tap-Kacheln auf dem Bar-Screen (Paket 07). Bisher stand das
 * als $derived.by-Block inline in BestellungAufnehmen.svelte; hier einmal
 * statt zweimal (ux-regeln.md Regel 6/12).
 *
 * `getraenke` traegt schon die gewuenschte Vorauswahl (z. B. nur aktive) —
 * diese Funktion sortiert nur um, sie filtert nicht.
 *
 * `personId` ohne Wert (Redesign v2, Etappe 7 — Mengen-Modus) zaehlt alle
 * Positionen ungefiltert statt je Person — dieselbe Rechnung, kein zweiter
 * Code-Pfad.
 */
export function rangiereGetraenke<G extends { readonly id: string }>(
  positionen: readonly PositionFuerRanking[],
  getraenke: readonly G[],
  personId: string | undefined,
  jetzt: number,
): G[] {
  const zeitenJeGetraenk = new Map<string, number[]>();
  for (const p of positionen) {
    if (personId !== undefined && p.personId !== personId) continue;
    const liste = zeitenJeGetraenk.get(p.getraenkId) ?? [];
    liste.push(p.ts);
    zeitenJeGetraenk.set(p.getraenkId, liste);
  }
  return [...getraenke]
    .map((g) => ({ getraenk: g, score: score(zeitenJeGetraenk.get(g.id) ?? [], jetzt) }))
    .sort((a, b) => b.score - a.score)
    .map((e) => e.getraenk);
}
