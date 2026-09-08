/**
 * Offene Beobachtungen — konzept.md:461-502, "Wenn die Auswahl nicht
 * reicht". Vier Schritte, bewusst grob (ein Wortschatz von vielleicht
 * dreissig Begriffen braucht keinen Stemmer):
 *
 *   1 normalisieren   klein, Umlaute aufloesen, Satzzeichen weg,
 *                     Fuellwoerter und Endungen kappen
 *   2 zaehlen         je normalisiertem Begriff, ueber alle Shots
 *   3 schwelle        ab 3 Vorkommen -> offene Beobachtung
 *   4 vorlegen        gesammelt in den Einstellungen (Etappe C UI)
 *
 * "ignoriert" ist endgueltig — ein Begriff mit dieser Entscheidung zaehlt
 * nie wieder mit. "alias" faltet einen Begriff dauerhaft in einen anderen.
 */

/** Fuellwoerter, die vor dem eigentlichen Geschmacksbegriff stehen — "zu Holzig!" ist "holzig". */
const FUELLWOERTER = new Set(['zu', 'sehr', 'etwas', 'ein', 'eine', 'der', 'die', 'das', 'ist', 'war', 'wirkt', 'schmeckt']);

export function normalisiere(text: string): string {
  const bereinigt = text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim();
  if (!bereinigt) return '';

  const woerter = bereinigt.split(/\s+/).filter((w) => w.length > 0 && !FUELLWOERTER.has(w));
  // Der tragende Begriff steht bei kurzen Ausrufen meist am Ende ("zu Holzig", "sehr bitter").
  const kern = woerter[woerter.length - 1] ?? bereinigt;
  return kappeEndung(kern);
}

/**
 * Nur die Endungen der "-ig"-Adjektive (holzig/holzige/holziger, das
 * Konzept-Beispiel) — ein blankes Kappen von "-e"/"-er" auf jedem Wort
 * wuerde Grundformen wie "bitter" oder "sauer" verstuemmeln (bitter ->
 * bitt), die selbst schon Systemchips sind.
 */
function kappeEndung(wort: string): string {
  if (wort.endsWith('iger')) return wort.slice(0, -2);
  if (wort.endsWith('ige')) return wort.slice(0, -1);
  return wort;
}

export interface Haeufigkeit {
  readonly begriff: string;
  readonly anzahl: number;
}

/** Reine Zaehlfunktion, ohne Schwelle — genutzt fuer den Werkstattbericht (der zeigt auch Begriffe unter 3). */
export function zaehle(freitexte: readonly string[]): readonly Haeufigkeit[] {
  const zaehler = new Map<string, number>();
  for (const text of freitexte) {
    const begriff = normalisiere(text);
    if (!begriff) continue;
    zaehler.set(begriff, (zaehler.get(begriff) ?? 0) + 1);
  }
  return [...zaehler.entries()]
    .map(([begriff, anzahl]) => ({ begriff, anzahl }))
    .sort((a, b) => b.anzahl - a.anzahl);
}

export const SCHWELLE = 3;

export type EntscheidungsArt = 'ignoriert' | 'chip' | 'alias';

export interface Entscheidung {
  readonly begriff: string;
  readonly entscheidung: EntscheidungsArt;
  readonly zielBegriff?: string;
}

export interface OffeneBeobachtung {
  readonly begriff: string;
  readonly anzahl: number;
  readonly shotIds: readonly string[];
}

interface FreitextShot {
  readonly id: string;
  readonly freitext?: string;
}

/**
 * Gruppiert alle Freitexte zu offenen Beobachtungen — normalisiert, per
 * Alias zusammengefasst, ignorierte und bereits-zu-Chip-gemachte Begriffe
 * ausgefiltert, erst ab SCHWELLE Vorkommen ueberhaupt gemeldet.
 */
export function offeneBeobachtungen(
  shots: readonly FreitextShot[],
  entscheidungen: readonly Entscheidung[] = [],
): readonly OffeneBeobachtung[] {
  const aliasZiel = new Map(
    entscheidungen.filter((e) => e.entscheidung === 'alias' && e.zielBegriff).map((e) => [e.begriff, e.zielBegriff!]),
  );
  const erledigt = new Set(entscheidungen.filter((e) => e.entscheidung !== 'alias').map((e) => e.begriff));

  const shotIdsJeBegriff = new Map<string, string[]>();
  for (const shot of shots) {
    if (!shot.freitext) continue;
    const roh = normalisiere(shot.freitext);
    if (!roh) continue;
    const begriff = aliasZiel.get(roh) ?? roh;
    if (erledigt.has(begriff)) continue;
    const liste = shotIdsJeBegriff.get(begriff) ?? [];
    liste.push(shot.id);
    shotIdsJeBegriff.set(begriff, liste);
  }

  return [...shotIdsJeBegriff.entries()]
    .filter(([, shotIds]) => shotIds.length >= SCHWELLE)
    .map(([begriff, shotIds]) => ({ begriff, anzahl: shotIds.length, shotIds }))
    .sort((a, b) => b.anzahl - a.anzahl);
}
