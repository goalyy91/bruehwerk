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
 * Normalisiert eine chronologische Reihe auf x in [0, 1] — dieselbe Technik,
 * die Profilblatt.svelte fuer den Mahlgrad-Verlauf schon inline verwendet
 * (normiereZeit), hier fuer beliebige Groessen wiederverwendbar. Ein
 * einzelner Punkt hat keine Zeitspanne zu normalisieren und landet mittig.
 */
export function normiereZeitreihe(punkte: readonly ZeitWert[]): readonly { x: number; wert: number }[] {
  if (punkte.length === 0) return [];
  const von = punkte[0]!.ts;
  const bis = punkte[punkte.length - 1]!.ts;
  return punkte.map((p) => ({ x: bis === von ? 0.5 : (p.ts - von) / (bis - von), wert: p.wert }));
}

export interface AromaPfad {
  readonly pfad: readonly string[];
}

export interface HaeufigesAroma {
  readonly label: string;
  readonly anzahl: number;
}

/** Die haeufigsten Aromen ueber mehrere Verkostungen, absteigend, oben abgeschnitten bei `limit`. */
export function haeufigsteAromen(eintraege: readonly AromaPfad[], limit = 5): readonly HaeufigesAroma[] {
  const zaehler = new Map<string, number>();
  for (const eintrag of eintraege) {
    const label = eintrag.pfad[eintrag.pfad.length - 1];
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
