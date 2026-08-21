/**
 * Die Temperatur-Referenztabelle — "Dein Gerätepark", Abschnitt
 * "Die Temperatur-Referenztabelle" in docs/konzept.md.
 *
 * Die Rocket Mozzafiato ist ein Waermetauscher: die Kesseltemperatur ist
 * eine Maschineneinstellung, keine Bruehtemperatur. Diese Datei rechnet
 * zwischen beiden — vorwaerts (Kessel -> Gruppe, fuer die Anzeige am
 * Profil) und rueckwaerts (ein Roester nennt die Bruehtemperatur -> welche
 * Kesseleinstellung ist das bei mir).
 *
 * Zwei Regeln aus dem Konzept, beide bewusst streng:
 *  - Ausserhalb der Messreihe wird NICHT extrapoliert. Die Funktion gibt
 *    einen ausdruecklichen Nicht-Ergebnis-Zustand zurueck statt einer Zahl.
 *  - Nur Zeilen GLEICHER Herkunft werden miteinander interpoliert. Eine
 *    eigene Messung und eine geschaetzte Startbelegung sind nicht dieselbe
 *    Praezision, und die App behauptet keine, die die Quelle nicht hergibt.
 */
/**
 * Deckungsgleich mit daten/schema/common.ts::Herkunft — lokal definiert
 * statt importiert, damit domain/ frei von daten/ bleibt (siehe
 * CLAUDE.md "Architektur: die Schichten").
 */
export type Herkunft = 'gemessen' | 'uebernommen' | 'geschaetzt';

export interface TempReferenzPunkt {
  readonly kt: number;
  readonly gruppe: number;
  readonly herkunft: Herkunft;
}

export type TempErgebnis =
  | { readonly bekannt: true; readonly wert: number; readonly herkunft: Herkunft }
  | { readonly bekannt: false; readonly grund: 'ausserhalb-messreihe' };

/** Punkte derselben Herkunft, nach x aufsteigend sortiert. Reihenfolge der Gruppen = erstes Vorkommen in der Reihe. */
function nachHerkunftGruppieren(reihe: readonly TempReferenzPunkt[]): TempReferenzPunkt[][] {
  const gruppen = new Map<Herkunft, TempReferenzPunkt[]>();
  for (const punkt of reihe) {
    const liste = gruppen.get(punkt.herkunft) ?? [];
    liste.push(punkt);
    gruppen.set(punkt.herkunft, liste);
  }
  return [...gruppen.values()].map((liste) => [...liste].sort((a, b) => a.kt - b.kt));
}

function interpoliereLinear(x0: number, y0: number, x1: number, y1: number, x: number): number {
  if (x1 === x0) return y0;
  return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
}

/** Kessel -> Gruppe. Sucht die erste Herkunftsgruppe, deren kt-Bereich den Wert abdeckt. */
export function kesselZuGruppe(reihe: readonly TempReferenzPunkt[], kt: number): TempErgebnis {
  for (const gruppe of nachHerkunftGruppieren(reihe)) {
    if (gruppe.length === 0) continue;
    const min = gruppe[0]!;
    const max = gruppe[gruppe.length - 1]!;
    if (kt < min.kt || kt > max.kt) continue;

    for (let i = 0; i < gruppe.length - 1; i++) {
      const a = gruppe[i]!;
      const b = gruppe[i + 1]!;
      if (kt >= a.kt && kt <= b.kt) {
        return { bekannt: true, wert: interpoliereLinear(a.kt, a.gruppe, b.kt, b.gruppe, kt), herkunft: a.herkunft };
      }
    }
    // Einzelner Punkt oder exakter Treffer am Rand.
    return { bekannt: true, wert: min.kt === kt ? min.gruppe : max.gruppe, herkunft: min.herkunft };
  }
  return { bekannt: false, grund: 'ausserhalb-messreihe' };
}

/** Rueckwaerts: "Roester empfiehlt X °C Gruppe — welche Kesseltemperatur ist das bei mir?" */
export function gruppeZuKessel(reihe: readonly TempReferenzPunkt[], gruppe: number): TempErgebnis {
  for (const grp of nachHerkunftGruppieren(reihe)) {
    if (grp.length === 0) continue;
    const werte = grp.map((p) => p.gruppe);
    const min = Math.min(...werte);
    const max = Math.max(...werte);
    if (gruppe < min || gruppe > max) continue;

    for (let i = 0; i < grp.length - 1; i++) {
      const a = grp[i]!;
      const b = grp[i + 1]!;
      const zwischen = (gruppe - a.gruppe) * (gruppe - b.gruppe) <= 0;
      if (zwischen) {
        return { bekannt: true, wert: interpoliereLinear(a.gruppe, a.kt, b.gruppe, b.kt, gruppe), herkunft: a.herkunft };
      }
    }
    const treffer = grp.find((p) => p.gruppe === gruppe) ?? grp[0]!;
    return { bekannt: true, wert: treffer.kt, herkunft: treffer.herkunft };
  }
  return { bekannt: false, grund: 'ausserhalb-messreihe' };
}
