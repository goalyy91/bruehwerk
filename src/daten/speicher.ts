/**
 * Dauerhafter Speicher — angefordert beim Start (Fund 2026-09-08, vor dem
 * Echtbetrieb).
 *
 * IndexedDB ist die Wahrheit dieser App (CLAUDE.md "Datenquelle"), aber ohne
 * ausdrueckliche Anforderung gilt sie dem Browser als *best effort*: geraet
 * das Geraet unter Speicherdruck, darf Chrome die Datenbank raeumen — ohne
 * Rueckfrage und ohne Meldung. Solange es kein Cloud-Backup gibt, waere das
 * alles ausser der letzten von Hand exportierten Datei.
 *
 * `navigator.storage.persist()` bittet um den dauerhaften Zustand. Chrome
 * entscheidet selbst und schweigend anhand eigener Kriterien (installierte
 * PWA, Lesezeichen, Nutzungshaeufigkeit) — die Bitte kann also abgelehnt
 * werden. Deshalb wird das Ergebnis zurueckgegeben statt verworfen: die
 * Einstellungen zeigen es an, damit "nicht dauerhaft" ein sichtbarer
 * Zustand ist und keine stille Annahme.
 */

export type SpeicherZustand =
  /** Der Browser hat zugesagt: die Datenbank wird nicht automatisch geraeumt. */
  | 'dauerhaft'
  /** Der Browser hat nicht zugesagt — die Datenbank darf bei Speicherdruck weg. */
  | 'nicht-dauerhaft'
  /** Der Browser kennt die Storage-API nicht; keine Aussage moeglich. */
  | 'unbekannt';

/**
 * Fragt den Zustand ab und bittet einmalig um Dauerhaftigkeit, falls er noch
 * nicht besteht. Mehrfachaufrufe sind harmlos.
 */
export async function speicherSichern(): Promise<SpeicherZustand> {
  const speicher = globalThis.navigator?.storage;
  if (!speicher?.persisted || !speicher.persist) return 'unbekannt';
  if (await speicher.persisted()) return 'dauerhaft';
  return (await speicher.persist()) ? 'dauerhaft' : 'nicht-dauerhaft';
}
