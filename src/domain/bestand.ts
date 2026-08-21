/**
 * Filter und Sortierung der Kaffee-Bestandsliste — Paket 03.
 *
 * Reines TypeScript, kein Import aus daten/schema (siehe CLAUDE.md
 * "Architektur: die Schichten") — der Eintragstyp bildet nur die Felder
 * nach, die diese Datei tatsaechlich braucht, genau wie domain/plan.ts es
 * fuer Position/Durchgang tut.
 */

export interface KaffeeEintrag {
  readonly id: string;
  readonly name: string;
  readonly roester: string;
  readonly aktiv: boolean;
  readonly entkoffeiniert: boolean;
  readonly bewertung?: number;
  readonly roestgrad?: number;
}

export interface KaffeeFilter {
  /** Klein geschrieben, gegen Name und Roester geprueft. */
  suchtext?: string;
  nurAktive?: boolean;
  koffein?: 'beide' | 'koffeinhaltig' | 'entkoffeiniert';
}

export type KaffeeSortierung = 'name' | 'bewertung' | 'roestgrad';

function passtSuchtext(kaffee: KaffeeEintrag, suchtext: string): boolean {
  const ziel = suchtext.trim().toLowerCase();
  if (ziel === '') return true;
  return kaffee.name.toLowerCase().includes(ziel) || kaffee.roester.toLowerCase().includes(ziel);
}

function passtKoffein(kaffee: KaffeeEintrag, koffein: KaffeeFilter['koffein']): boolean {
  if (!koffein || koffein === 'beide') return true;
  return koffein === 'entkoffeiniert' ? kaffee.entkoffeiniert : !kaffee.entkoffeiniert;
}

/** Reihenfolge der Pruefungen ist beliebig — alle Filter sind UND-verknuepft. */
export function filtereKaffees<T extends KaffeeEintrag>(kaffees: readonly T[], filter: KaffeeFilter = {}): T[] {
  return kaffees.filter(
    (k) =>
      (filter.nurAktive ? k.aktiv : true) &&
      passtKoffein(k, filter.koffein) &&
      passtSuchtext(k, filter.suchtext ?? ''),
  );
}

/**
 * Bewertung und Roestgrad fehlen bei einem frisch migrierten oder neu
 * angelegten Kaffee oft noch (K51 — das Kaffeeblatt traegt sie nach). Wer
 * nichts hat, steht hinten, nicht vorne — sonst gewinnt eine leere Zeile
 * gegen eine fuenf-Sterne-Bewertung.
 */
export function sortiereKaffees<T extends KaffeeEintrag>(kaffees: readonly T[], sortierung: KaffeeSortierung): T[] {
  const sortiert = [...kaffees];
  switch (sortierung) {
    case 'name':
      return sortiert.sort((a, b) => a.name.localeCompare(b.name, 'de'));
    case 'bewertung':
      return sortiert.sort((a, b) => (b.bewertung ?? -1) - (a.bewertung ?? -1));
    case 'roestgrad':
      return sortiert.sort((a, b) => (b.roestgrad ?? -1) - (a.roestgrad ?? -1));
  }
}

/** Zaehlform K72: "Kaffee · 6 von 14" — auch bei nur einem Besitzer. */
export function zaehlform(gefiltert: number, gesamt: number, bezeichnung: string): string {
  return `${bezeichnung} · ${gefiltert} von ${gesamt}`;
}
