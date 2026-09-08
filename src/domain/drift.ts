/**
 * Chargenwechsel-Hinweis und Drift — konzept.md:528 und die siebte
 * Regelzeile aus "Die Regeln dahinter" (:514-516).
 *
 * Beide feuern OHNE dass etwas gemeldet wird — allein aus der Profil- bzw.
 * Kaffee-Laufzeit. Der Drift-Hinweis ist ausdruecklich eine
 * Alltagskorrektur, kein Dial-in-Vorschlag: er aendert keine Rezeptur von
 * selbst, er sagt nur, dass ein Schritt feiner naheliegt.
 */

import { bildeMessreihe } from './messreihe';

export interface ChargenUebergang {
  /** Sekunden, um die der erste Shot der neuen Charge schneller (negativ) oder langsamer (positiv) lief. */
  readonly deltaSekunden: number;
}

interface ChargenShot {
  readonly chargeId: string;
  readonly ts: number;
  readonly zeit: number;
}

/**
 * Der jeweils erste Shot je Charge, chronologisch — daraus die Deltas
 * zwischen aufeinanderfolgenden Chargen. "Erster Shot" ist der fruehste `ts`
 * je `chargeId`, unabhaengig davon, wie viele Shots insgesamt vorliegen.
 */
export function ermittleUebergaenge(shots: readonly ChargenShot[]): readonly ChargenUebergang[] {
  const ersterJeCharge = new Map<string, ChargenShot>();
  for (const shot of shots) {
    const bisher = ersterJeCharge.get(shot.chargeId);
    if (!bisher || shot.ts < bisher.ts) ersterJeCharge.set(shot.chargeId, shot);
  }
  const chronologisch = [...ersterJeCharge.values()].sort((a, b) => a.ts - b.ts);

  const uebergaenge: ChargenUebergang[] = [];
  for (let i = 1; i < chronologisch.length; i++) {
    uebergaenge.push({ deltaSekunden: chronologisch[i]!.zeit - chronologisch[i - 1]!.zeit });
  }
  return uebergaenge;
}

/**
 * "Neue Charge — die letzten beiden Male lief sie 4–6 s schneller. Starte
 * einen Schritt feiner." (konzept.md:528) — erst, wenn die letzten ZWEI
 * Chargenwechsel beide schneller liefen; ein einzelner Wechsel reicht nicht,
 * das waere wieder die Sorte Alarmsignal ohne Inhalt, die K6 vermeiden will.
 */
export function chargenHinweis(uebergaenge: readonly ChargenUebergang[]): string | undefined {
  const letzteZwei = uebergaenge.slice(-2);
  if (letzteZwei.length < 2 || !letzteZwei.every((u) => u.deltaSekunden < 0)) return undefined;

  const betraege = letzteZwei.map((u) => Math.abs(Math.round(u.deltaSekunden)));
  const min = Math.min(...betraege);
  const max = Math.max(...betraege);
  const spanne = min === max ? `${min}` : `${min}–${max}`;
  return `Neue Charge — die letzten beiden Male lief sie ${spanne} s schneller. Starte einen Schritt feiner.`;
}

/**
 * Siebte Regelzeile, konzept.md:514: "läuft schneller als die eigene
 * Historie, Urteil ok" -> "Drift oder neue Charge" -> "einen Schritt feiner
 * — als Alltagskorrektur, nicht als Dial-in". "Schneller als die eigene
 * Historie" heisst hier: schneller als jeder bisherige Shot dieses Profils
 * (ausserhalb der Messreihe, K67/K75 in die andere Richtung gelesen).
 */
export function driftHinweis(vorherigeZeiten: readonly number[], aktuelleZeit: number, urteilOk: boolean): string | undefined {
  if (!urteilOk) return undefined;
  const reihe = bildeMessreihe(vorherigeZeiten);
  if (!reihe || aktuelleZeit >= reihe.min) return undefined;
  return 'Drift oder neue Charge — läuft schneller als die eigene Historie. Einen Schritt feiner, als Alltagskorrektur.';
}
