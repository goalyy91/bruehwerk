/**
 * Die LLM-Naht — konzept.md:1078-1088, "Die LLM-Naht".
 *
 *   vorschlag(kontext)  ->  { text, begruendung, quelle: 'regel' | 'llm' }
 *
 * Jeder Vorschlag der App soll spaeter durch diese eine Funktion laufen.
 * Gebaut ist bewusst nur die Regel-Seite (diagnose.ts) — ein API-Aufbau ist
 * laufender Aufwand und wird erst gebaut, wenn Modellwahl, Auslösefrequenz
 * und Monatskosten auf dem Tisch lagen (CLAUDE.md "Was bewusst nicht gebaut
 * wird"). Kommt das dazu, aendert sich genau diese eine Implementierung,
 * nicht ihre Aufrufer.
 */

import { diagnostiziere, type Befund, type Diagnose } from './diagnose';

export interface VorschlagKontext {
  readonly befunde: readonly Befund[];
}

export interface VorschlagErgebnis {
  readonly text: string;
  readonly begruendung: string;
  readonly quelle: 'regel' | 'llm';
  /** Die volle Diagnose fuer Aufrufer, die den Wert tatsaechlich uebernehmen wollen. */
  readonly diagnose?: Diagnose;
}

export function vorschlag(kontext: VorschlagKontext): VorschlagErgebnis | undefined {
  const diagnose = diagnostiziere(kontext.befunde);
  if (!diagnose) return undefined;
  return {
    text: diagnose.empfehlungstext,
    begruendung: diagnose.diagnose,
    quelle: 'regel',
    diagnose,
  };
}
