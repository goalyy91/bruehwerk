/**
 * Die schmale Auswertung am Profilblatt — Paket 05, "Auswertung gegen
 * Parameter" (konzept.md:1169), bewusst eng gefasst (Rueckfrage
 * 2026-08-26): beschreibt, was in den eigenen Verkostungen steht, behauptet
 * keine Ursachen und keine Korrelationen (vgl. konzept.md:649, dieselbe
 * Zurueckhaltung fuer RPM).
 *
 * Reine Rechnerei auf plain Objects statt Schema-Typen — domain/ importiert
 * nichts aus daten/ (siehe CLAUDE.md "Architektur: die Schichten"), die
 * Extraktion aus Shot/Tasting passiert im Aufrufer (Profilblatt.svelte).
 */

export interface ZeitWert {
  readonly ts: number;
  readonly wert: number;
}

/**
 * Normalisiert eine chronologische Reihe auf x in [0, 1] — ueber die
 * **Reihenfolge**, nicht ueber die verstrichene Zeit.
 *
 * Bis 2026-09-08 war es die Zeit, und das ging kaputt, sobald nach dem
 * Notion-Import der erste echte Shot dazukam: die importierten Shots tragen
 * synthetische Zeitstempel im Minutenabstand (migrieren.ts — Notion hat pro
 * Shot nie ein Datum gefuehrt), der neue Shot einen echten von Stunden oder
 * Tagen spaeter. Die Spanne sprang von 13 Minuten auf zwei Tage, und der
 * gesamte Import lag danach in den ersten 0,45 % der Breite: ein senkrechter
 * Klumpen links, ein einzelner Punkt rechts.
 *
 * Die Kurve beantwortet ohnehin "wie hat sich der Wert ueber die Versuche
 * entwickelt" — das ist eine Reihenfolge. Eine Achse auf erfundenen
 * Zeitstempeln zu bauen, war die eigentliche Falschaussage. Der Preis ist
 * bekannt und akzeptiert: eine dreimonatige Pause sieht aus wie eine von
 * fuenf Minuten.
 *
 * Ein einzelner Punkt hat keine Reihe zu normalisieren und landet mittig.
 */
export function normiereReihe(punkte: readonly { readonly wert: number }[]): readonly { x: number; wert: number }[] {
  if (punkte.length === 0) return [];
  if (punkte.length === 1) return [{ x: 0.5, wert: punkte[0]!.wert }];
  return punkte.map((p, i) => ({ x: i / (punkte.length - 1), wert: p.wert }));
}

export interface AromaPfad {
  readonly pfad: readonly string[];
  /**
   * Kanonisches Label zum setuebergreifenden Zusammenzaehlen, z. B. wenn ein
   * Le-Nez-Flaeschchen und ein SCA-Aroma denselben Geruch meinen
   * (daten/aromen.ts::kanonischesAromaLabel, K55). Faellt der Aufrufer das
   * nicht mit, zaehlt weiterhin das letzte Pfadglied — deshalb optional und
   * hier ohne Import aus daten/ aufgeloest (siehe Dateikopf).
   */
  readonly kanonischesLabel?: string;
}

export interface HaeufigesAroma {
  readonly label: string;
  readonly anzahl: number;
}

/** Die haeufigsten Aromen ueber mehrere Verkostungen, absteigend, oben abgeschnitten bei `limit`. */
export function haeufigsteAromen(eintraege: readonly AromaPfad[], limit = 5): readonly HaeufigesAroma[] {
  const zaehler = new Map<string, number>();
  for (const eintrag of eintraege) {
    const label = eintrag.kanonischesLabel ?? eintrag.pfad[eintrag.pfad.length - 1];
    if (!label) continue;
    zaehler.set(label, (zaehler.get(label) ?? 0) + 1);
  }
  return [...zaehler.entries()]
    .map(([label, anzahl]) => ({ label, anzahl }))
    .sort((a, b) => b.anzahl - a.anzahl)
    .slice(0, limit);
}

export interface AuffaelligkeitsEreignis {
  readonly ts: number;
  readonly auffaelligkeitIds: readonly string[];
}

/**
 * Auffaelligkeiten, die in frueheren Verkostungen vorkamen, in den letzten
 * `fensterLetzte` aber nicht mehr — "dass am Ende keine Auffaelligkeit mehr
 * steht, ist das Ergebnis" eines Dial-ins (konzept.md:798). Weniger als zwei
 * Verkostungen ergeben kein "davor/danach" und damit keine Aussage.
 */
export function verschwundeneAuffaelligkeiten(
  chronologisch: readonly AuffaelligkeitsEreignis[],
  fensterLetzte = 3,
): readonly string[] {
  if (chronologisch.length < 2) return [];
  const sortiert = [...chronologisch].sort((a, b) => a.ts - b.ts);
  const frueher = sortiert.slice(0, -fensterLetzte);
  const letzte = sortiert.slice(-fensterLetzte);
  if (frueher.length === 0) return [];
  const letzteIds = new Set(letzte.flatMap((t) => t.auffaelligkeitIds));
  const frueherIds = new Set(frueher.flatMap((t) => t.auffaelligkeitIds));
  return [...frueherIds].filter((id) => !letzteIds.has(id));
}
