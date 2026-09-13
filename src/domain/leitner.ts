/**
 * Leitner-Mechanik des Übungsmodus — Aromapaket, Etappe 6 (Neubau nach
 * Lastenheft, docs/konzept.md "Übungsmodus", CLAUDE.md "Übungsmodus:
 * verdecktes Ziehen, keine offene Nummer"). Fünf Boxen, feste Intervalle,
 * eine Einführungssperre für neue Aromen — sonst nichts. Die
 * Zusammenstellung eines Übungsdurchgangs (welche zwölf, welche Mischung aus
 * den Boxen) lebt in `domain/uebung.ts`, nicht hier; diese Datei kennt nur
 * die Bewegung einer einzelnen Box.
 *
 * Reines TypeScript, kein idb, kein Svelte (tests/schichten.test.ts erzwingt
 * das) — `jetzt` ist überall ein Pflichtparameter ohne Default, wie in
 * `domain/ranking.ts` und `domain/uebung.ts::naechstesZiel` schon üblich.
 */
import type { GesamtStand } from './uebung';
import { gesamtquote } from './uebung';
import type { Uebungsergebnis } from '../daten/schema/uebungsantwort';

export type Box = 1 | 2 | 3 | 4 | 5;

const MS_PRO_TAG = 24 * 60 * 60 * 1000;

/**
 * Die Intervalltabelle aus dem Lastenheft, Abschnitt 5 — **bewusst fix,
 * nicht an die Trainingshäufigkeit angepasst** (Lastenheft Abschnitt 7,
 * CLAUDE.md). Drei Gründe, warum das so bleiben muss und nicht "klüger"
 * werden darf:
 *
 * 1. Die Vergessenskurve kennt den Trainingskalender nicht — ein Aroma auf
 *    Box 3 ist nach 5 Tagen fällig, egal ob diese Woche einmal oder fünfmal
 *    geübt wurde.
 * 2. Eine adaptive App verwechselt Ist mit Soll: eine faule Woche würde als
 *    Präferenz gelesen, die Intervalle würden gestreckt, es kämen weniger
 *    Erinnerungen — eine sich selbst verstärkende Abwärtsspirale.
 * 3. In den ersten Wochen gibt es schlicht keine Daten, aus denen sich
 *    etwas ableiten ließe.
 *
 * Box 1 = "sofort", deshalb Intervall 0.
 */
export const INTERVALL_TAGE: Readonly<Record<Box, number>> = {
  1: 0,
  2: 2,
  3: 5,
  4: 12,
  5: 30,
};

/** Zeitpunkt der nächsten Fälligkeit einer Box, von `jetzt` aus gerechnet. */
export function naechsteFaelligkeit(box: Box, jetzt: number): number {
  return jetzt + INTERVALL_TAGE[box] * MS_PRO_TAG;
}

/**
 * Bewegt eine Box nach dem Ergebnis einer Antwort.
 *
 * Richtig → eine Box hoch (Decke bei 5). Falsch → zurück auf 1. **Teilerfolg
 * (Familie richtig, Aroma falsch) → nur eine Box runter, nicht auf Null** —
 * die wichtige Nuance aus dem Lastenheft: wer die Familie trifft, hat den
 * Geruch grundsätzlich verortet und verdient keinen Reset auf Los.
 */
export function bewegeBox(box: Box, ergebnis: Uebungsergebnis): Box {
  switch (ergebnis) {
    case 'richtig':
      return Math.min(5, box + 1) as Box;
    case 'falsch':
      return 1;
    case 'teilweise':
      return Math.max(1, box - 1) as Box;
  }
}

/**
 * Rückstufung nach langer Pause (Lastenheft Abschnitt 7): ist ein Aroma
 * **mehr als doppelt so lange überfällig wie sein eigenes Intervall**, ist
 * das reale Niveau gesunken. Die Box selbst bleibt dabei unverändert — nur
 * die Abfrage-Stufe wird für diesen einen Versuch eine Stufe tiefer gewählt
 * (das übernimmt der Aufrufer in `domain/uebung.ts`, nicht diese Funktion).
 *
 * Box 1 hat Intervall 0 — dort ist jede Verspätung "mehr als doppelt so
 * lang" und die Funktion liefert sofort `true`. Das ist beabsichtigt: Box 1
 * bedeutet ohnehin "sofort", ein Aufschub dort ist immer ein Alarmsignal.
 */
export function starkUeberfaellig(box: Box, faellig: number, jetzt: number): boolean {
  const ueberfaelligSeit = jetzt - faellig;
  if (ueberfaelligSeit <= 0) return false;
  return ueberfaelligSeit > INTERVALL_TAGE[box] * MS_PRO_TAG;
}

// ---- Migration eines Altbestands ohne Box/Stufe --------------------------

/**
 * Schwellen für die Startbox eines Aromas, das schon in der ersten Fassung
 * des Übungsmodus geübt wurde, aber noch keine `box` trägt
 * (`daten/schema/uebung.ts`, Dateikopf: das Feld fehlt bei einem
 * Altdatensatz, statt fälschlich "Box 1" zu behaupten). Bewusst **nicht**
 * bis Box 5 hoch — eine hohe bereinigte Trefferquote aus der alten Zählweise
 * ist kein Nachweis dafür, dass das Aroma 30 Tage ohne Übung hält, deshalb
 * bleibt die höchste migrierte Box 4. Ohne diese Übernahme würde die
 * Einführungssperre (siehe unten) zwei Monate lang zurückhalten, was längst
 * sitzt.
 */
export function startBox(stand: GesamtStand): Box {
  const quote = gesamtquote(stand);
  if (quote >= 0.85) return 4;
  if (quote >= 0.6) return 3;
  if (quote >= 0.3) return 2;
  return 1;
}

/**
 * Ein Aroma gilt als eingeführt, sobald es mindestens einmal — in welcher
 * Aufgabenart auch immer — dran war. Braucht kein eigenes Schema-Feld: die
 * bestehenden Zähler beantworten das bereits eindeutig (siehe
 * `daten/schema/uebung.ts`, Dateikopf).
 */
export function istEingefuehrt(stand: GesamtStand): boolean {
  return stand.benennen.versuche + stand.unterscheiden.versuche > 0;
}

// ---- Einführungssperre ----------------------------------------------------

/** Anteil, ab dem die Einführung neuer Aromen pausiert (Lastenheft Abschnitt 7). */
const EINFUEHRUNGSSPERRE_ANTEIL = 0.3;

/**
 * Neue Aromen werden nur eingeführt, wenn **weniger als 30 %** der bereits
 * eingeführten Aromen in Box 1–2 stehen (Lastenheft Abschnitt 7). Braucht
 * die tatsächliche Trainingsfrequenz nicht zu kennen: der Boxenzustand
 * reguliert sich selbst — viel Training leert die unteren Boxen und öffnet
 * die Sperre wieder, wenig Training hält sie geschlossen.
 *
 * Ohne eingeführte Aromen ist die Sperre nie aktiv (0⁄0 zählt als 0 %).
 */
export function einfuehrungErlaubt(boxenEingefuehrterAromen: readonly Box[]): boolean {
  if (boxenEingefuehrterAromen.length === 0) return true;
  const inUnterenBoxen = boxenEingefuehrterAromen.filter((box) => box <= 2).length;
  return inUnterenBoxen / boxenEingefuehrterAromen.length < EINFUEHRUNGSSPERRE_ANTEIL;
}
