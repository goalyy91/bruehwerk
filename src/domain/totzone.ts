/**
 * Die Totzonen-Karte — K40, konzept.md:518-526.
 *
 * "Bereiche, die mehrfach schlecht abschnitten, werden markiert — und nicht
 * mehr vorgeschlagen." Gezeichnet wird das nicht als eigene Karte, sondern
 * als schraffierter Streifen in der Verlaufskurve (Muster 14) — diese Datei
 * liefert nur die Bereiche und den Satz, der darunter steht.
 */

export interface Totzone {
  readonly von: number;
  readonly bis: number;
  readonly anzahl: number;
  readonly satz: string;
}

export interface MgPunkt {
  readonly mg: number;
  readonly daneben: boolean;
}

/** "Dreimal getestet" — konzept.md:522, Espresso-Entcoffeiniert-Beispiel. */
const SCHWELLE = 3;

/**
 * Gruppiert die *daneben*-Mahlgrade zu Baendern: zwei Werte gehoeren
 * zusammen, wenn ihr Abstand nicht groesser als `toleranz` ist (typischerweise
 * ein paar Muehle-Schritte). Ein Band zaehlt erst ab SCHWELLE Treffern als
 * Totzone — ein einzelner daneben-Shot ist noch kein toter Bereich.
 */
export function findeTotzonen(punkte: readonly MgPunkt[], toleranz: number): readonly Totzone[] {
  const werte = punkte
    .filter((p) => p.daneben)
    .map((p) => p.mg)
    .sort((a, b) => a - b);

  // Epsilon gegen Fliesskomma-Ungenauigkeit (3.9 - 3.8 wird in JS zu
  // 0.10000000000000009, ein blankes <= toleranz wuerde bei einer Toleranz
  // von genau 0.1 zufaellig durchfallen).
  const EPSILON = 1e-9;
  const cluster: number[][] = [];
  for (const mg of werte) {
    const letztesCluster = cluster[cluster.length - 1];
    const letzterWert = letztesCluster?.[letztesCluster.length - 1];
    if (letztesCluster && letzterWert !== undefined && mg - letzterWert <= toleranz + EPSILON) {
      letztesCluster.push(mg);
    } else {
      cluster.push([mg]);
    }
  }

  return cluster
    .filter((c) => c.length >= SCHWELLE)
    .map((c) => {
      const von = c[0]!;
      const bis = c[c.length - 1]!;
      return { von, bis, anzahl: c.length, satz: `${formatiere(von)}–${formatiere(bis)}: ${c.length}× getestet, alle daneben` };
    });
}

function formatiere(wert: number): string {
  return Number.isInteger(wert) ? String(wert) : wert.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

/** true, wenn ein Mahlgrad in eine der gefundenen Totzonen faellt — fuer "nicht mehr vorschlagen". */
export function inTotzone(mg: number, totzonen: readonly Totzone[]): boolean {
  const EPSILON = 1e-9;
  return totzonen.some((z) => mg >= z.von - EPSILON && mg <= z.bis + EPSILON);
}
