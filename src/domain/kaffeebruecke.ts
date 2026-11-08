/**
 * Kaffee-Brücke — Etappe 6 des Lern-Nachzugs (docs/konzept.md, Übungsmodus,
 * "Kaffee-Brücke"). Verbindet, was in der Tasse notiert wurde, mit den
 * Fläschchen der Aromaschule.
 *
 * Gelerntes überträgt sich umso schlechter, je weiter Übungs- und
 * Ernstsituation auseinanderliegen. Zwei Folgen:
 *  1. Aromen, die in den eigenen Verkostungen der letzten 60 Tage vorkamen,
 *     werden zuerst *eingeführt* (`planeDurchgang`, Parameter `bevorzugt`).
 *     Die Abfrage bereits eingeführter Aromen bleibt davon unberührt — die
 *     Abstände folgen weiter allein der Fälligkeit.
 *  2. Die Verkostung in der Historie nennt die passenden Fläschchen zum
 *     Abgleich neben der Tasse — so eichen sich auch Sensorik-Panels.
 *
 * Reines TypeScript: die Le-Nez-Liste kommt als Parameter herein, nicht als
 * Import aus daten/ — die Domäne rechnet, sie lädt nichts.
 */

/** Wie weit zurück Verkostungen als "aus deinen Kaffees" zählen. */
export const KAFFEE_FENSTER_TAGE = 60;

const MS_PRO_TAG = 24 * 60 * 60 * 1000;

export interface LeNezAroma {
  readonly label: string;
  readonly nummer: number;
}

export interface VerkosteterEintrag {
  readonly pfad: readonly string[];
  /** Bei einer Verkostung mit dem Le-Nez-Set schon gesetzt. */
  readonly nummer?: number;
}

function normiert(text: string): string {
  return text.toLowerCase().replace(/[^a-zäöüß]/g, '');
}

/**
 * SCA-Begriffe, die nicht wortgleich, aber eindeutig dasselbe Fläschchen
 * meinen (normiert → normiert). Bewusst kurz: "papierig" ist nicht "Pappe",
 * "staubig-muffig" nicht "Muffig/Erdig" — das WCR-Lexikon führt beide
 * getrennt, eine Zuordnung wäre geraten.
 */
const SCA_NACH_LENEZ: Readonly<Record<string, string>> = {
  anis: 'sternanis',
  muskat: 'muskatnuss',
  nelke: 'gewürznelke',
  malzig: 'malz',
  erdigmuffig: 'muffigerdig',
  schimmelig: 'schimmligfeucht',
};

/**
 * Die Le-Nez-Nummer zu einem verkosteten Aroma: die gespeicherte Nummer,
 * sonst über den Namen des Blatts (SCA-Aromarad) — wortgleich oder über die
 * kurze Liste eindeutiger Entsprechungen. Ohne Gegenstück: undefined.
 */
export function leNezNummer(eintrag: VerkosteterEintrag, leNez: readonly LeNezAroma[]): number | undefined {
  if (eintrag.nummer !== undefined) return eintrag.nummer;
  const blatt = eintrag.pfad[eintrag.pfad.length - 1];
  if (!blatt) return undefined;
  const gesucht = SCA_NACH_LENEZ[normiert(blatt)] ?? normiert(blatt);
  return leNez.find((a) => normiert(a.label) === gesucht)?.nummer;
}

export interface Verkostung {
  /** Zeitpunkt des Shots, zu dem die Verkostung gehört. */
  readonly ts: number;
  readonly aromen: readonly VerkosteterEintrag[];
}

/** Alle Le-Nez-Nummern aus den Verkostungen der letzten `KAFFEE_FENSTER_TAGE` Tage. */
export function nummernAusKaffees(verkostungen: readonly Verkostung[], leNez: readonly LeNezAroma[], jetzt: number): ReadonlySet<number> {
  const grenze = jetzt - KAFFEE_FENSTER_TAGE * MS_PRO_TAG;
  const nummern = new Set<number>();
  for (const v of verkostungen) {
    if (v.ts < grenze) continue;
    for (const a of v.aromen) {
      const nummer = leNezNummer(a, leNez);
      if (nummer !== undefined) nummern.add(nummer);
    }
  }
  return nummern;
}

/**
 * Der Abgleich-Satz unter den Aromen einer Verkostung, oder undefined, wenn
 * keines ein Fläschchen hat. Höchstens drei — mehr Fläschchen auf einmal
 * neben die Tasse zu stellen, ist kein Abgleich mehr, sondern eine Übung.
 */
export function abgleichSatz(fundstuecke: readonly { readonly name: string; readonly nummer: number }[]): string | undefined {
  const auswahl = fundstuecke.slice(0, 3);
  if (auswahl.length === 0) return undefined;
  const liste = (teile: readonly string[]) =>
    teile.length === 1 ? teile[0]! : `${teile.slice(0, -1).join(', ')} und ${teile[teile.length - 1]}`;
  const nummern = liste(auswahl.map((f) => `Nr. ${f.nummer}`));
  const namen = liste(auswahl.map((f) => f.name));
  return `Zum Abgleich: riech ${nummern} neben der Tasse — war es wirklich ${namen}?`;
}
