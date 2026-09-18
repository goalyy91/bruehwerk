/**
 * Meilenstein-Satz am Ende eines Übungsdurchgangs — Aromapaket, Nachschärfung
 * (Livebetrieb-Rückmeldung 2026-09-18: der Ende-Screen war "emotional leer").
 *
 * Bewusst KEIN Zähler, KEINE Serie, KEIN Rang — genau das bleibt nach
 * docs/ux-regeln.md, Regel 10, verboten (Begründung dort und in
 * domain/begruessung.ts: ein Zähler, der bei Null stehenbleibt, wirkt wie ein
 * Vorwurf). Diese Funktion liefert höchstens EINEN Satz, und nur, wenn er
 * wahr ist — bei einem schwachen Durchgang liefert sie `undefined`, nie einen
 * bemitleidenden oder anspornenden Text. Das Schweigen bei Misserfolg ist der
 * Punkt, nicht eine Lücke.
 *
 * Nur aus dem Antwortprotokoll rekonstruiert (dieselbe Linie wie
 * domain/uebungsauswertung.ts, Dateikopf: "jede Zahl lässt sich auf ein
 * tatsächliches Ereignis zurückführen"). Bewusst KEIN "sitzt jetzt sicher"
 * (Box-Aufstieg) als Kandidat — dafür bräuchte es den Box-Stand VOR dem
 * Durchgang, der nirgends gespeichert ist.
 *
 * Gilt nur für "normal"-Durchgänge (Formen familie/aromaInFamilie/
 * freierAbruf) — Kontrast und Reverse haben andere Größen und laufen nie über
 * die 'ende'-Phase, siehe Uebungsmodus.svelte.
 */
import type { Uebungsantwort } from '../daten/schema/uebungsantwort';

const NORMAL_FORMEN = new Set(['familie', 'aromaInFamilie', 'freierAbruf']);

function punktzahl(antworten: readonly Uebungsantwort[]): number {
  return antworten.reduce((summe, a) => summe + (a.ergebnis === 'richtig' ? 1 : a.ergebnis === 'teilweise' ? 0.5 : 0), 0);
}

export interface MeilensteinEingabe {
  /** Alle Antworten DIESES Durchgangs. */
  readonly durchgangAntworten: readonly Uebungsantwort[];
  /** Alle Antworten VOR diesem Durchgang (gleiches Set) — für den Vergleich mit früheren Durchgängen und "erstmals getroffen". */
  readonly vorherigeAntworten: readonly Uebungsantwort[];
  readonly labelVon: (aromaId: string) => string;
}

/**
 * Reihenfolge der Kandidaten, stärkster zuerst — nur einer wird gezeigt:
 * 1. fehlerfrei, 2. bester Durchgang bisher, 3. ein Aroma zum ersten Mal
 * überhaupt getroffen, sonst kein Satz.
 */
export function meilensteinSatz(eingabe: MeilensteinEingabe): string | undefined {
  const { durchgangAntworten, vorherigeAntworten, labelVon } = eingabe;
  if (durchgangAntworten.length === 0) return undefined;

  if (durchgangAntworten.every((a) => a.ergebnis === 'richtig')) {
    return `Fehlerfrei — alle ${durchgangAntworten.length}.`;
  }

  const vorherigeNormale = vorherigeAntworten.filter((a) => NORMAL_FORMEN.has(a.form));
  const vorherigeDurchgaenge = new Map<string, Uebungsantwort[]>();
  for (const a of vorherigeNormale) {
    const liste = vorherigeDurchgaenge.get(a.durchgangId) ?? [];
    liste.push(a);
    vorherigeDurchgaenge.set(a.durchgangId, liste);
  }
  const vorherigePunkte = [...vorherigeDurchgaenge.values()].map(punktzahl);
  if (vorherigePunkte.length > 0 && punktzahl(durchgangAntworten) > Math.max(...vorherigePunkte)) {
    return 'Bester Durchgang bisher.';
  }

  const bekannteAromen = new Set(vorherigeNormale.filter((a) => a.ergebnis === 'richtig').map((a) => a.aromaId));
  const erstmals = durchgangAntworten.find((a) => a.ergebnis === 'richtig' && !bekannteAromen.has(a.aromaId));
  if (erstmals) {
    return `„${labelVon(erstmals.aromaId)}“ zum ersten Mal getroffen.`;
  }

  return undefined;
}
