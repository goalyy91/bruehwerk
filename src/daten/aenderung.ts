/**
 * Meldet, dass sich der Bestand geändert hat — ohne zu wissen, wer zuhört.
 *
 * Gebraucht von der Cloud-Sicherung (daten/cloud.ts), die nach einer Änderung
 * verzögert sichert. Als eigenes Modul statt eines direkten Aufrufs aus
 * ablage.ts, weil cloud.ts über export.ts selbst auf ablage.ts zugreift — ein
 * direkter Aufruf wäre ein Importkreis.
 */

type Zuhoerer = () => void;

const zuhoerer = new Set<Zuhoerer>();

export function aenderungMelden(): void {
  for (const z of zuhoerer) {
    try {
      z();
    } catch {
      // Ein Zuhörer darf das Schreiben nie stören — die Sicherung ist entkoppelt.
    }
  }
}

/** Gibt die Abmeldung zurück. */
export function aufAenderungHoeren(z: Zuhoerer): () => void {
  zuhoerer.add(z);
  return () => zuhoerer.delete(z);
}
