/**
 * Der Werkstattbericht — Weg c, konzept.md:486-488. Ein Tap erzeugt einen
 * fertigen Textblock: die offenen Begriffe mit Haeufigkeit, die zugehoerigen
 * Shots mit Parametern und Urteil, der aktuelle Chip- und Regelbestand. Den
 * wirfst du in einen Claude-Chat und bekommst einen Regelvorschlag zurueck,
 * den du ueber den Regeleditor eintraegst.
 *
 * Derselbe Kontext-Baukasten, der fuer die LLM-Naht (domain/vorschlag.ts)
 * ohnehin gebraucht wird — hier nur textuell statt strukturiert.
 */

import type { OffeneBeobachtung } from './beobachtungen';
import type { RegelParameter, Richtung } from './diagnose';

export interface BerichtShot {
  readonly id: string;
  readonly kaffeeName: string;
  readonly urteil: string;
  readonly input: number;
  readonly mg: number;
  readonly output: number;
  readonly zeit: number;
}

export interface BerichtChip {
  readonly label: string;
  readonly quelle: 'system' | 'eigen';
}

export interface BerichtRegel {
  readonly chipLabel: string;
  readonly parameter: RegelParameter;
  readonly richtung: Richtung;
  readonly schritte: number;
}

export interface BerichtKontext {
  readonly offeneBeobachtungen: readonly OffeneBeobachtung[];
  readonly shots: readonly BerichtShot[];
  readonly chips: readonly BerichtChip[];
  readonly regeln: readonly BerichtRegel[];
}

export function werkstattbericht(kontext: BerichtKontext): string {
  const zeilen: string[] = ['Werkstattbericht — Brühwerk', ''];

  zeilen.push('Offene Begriffe');
  if (kontext.offeneBeobachtungen.length === 0) {
    zeilen.push('  keine');
  } else {
    for (const b of kontext.offeneBeobachtungen) {
      zeilen.push(`  ${b.begriff} · ${b.anzahl}×`);
      for (const shotId of b.shotIds) {
        const shot = kontext.shots.find((s) => s.id === shotId);
        if (!shot) continue;
        zeilen.push(
          `    Shot ${shot.id} · ${shot.kaffeeName} · Input ${shot.input} g · MG ${shot.mg} · Output ${shot.output} g · Zeit ${shot.zeit} s · ${shot.urteil}`,
        );
      }
    }
  }

  zeilen.push('', 'Chip-Bestand');
  if (kontext.chips.length === 0) {
    zeilen.push('  keiner');
  } else {
    for (const chip of kontext.chips) zeilen.push(`  ${chip.label} (${chip.quelle})`);
  }

  zeilen.push('', 'Regel-Bestand');
  if (kontext.regeln.length === 0) {
    zeilen.push('  keine');
  } else {
    for (const regel of kontext.regeln) {
      zeilen.push(`  ${regel.chipLabel} -> ${regel.parameter}, ${regel.richtung}, ${regel.schritte}`);
    }
  }

  return zeilen.join('\n');
}
