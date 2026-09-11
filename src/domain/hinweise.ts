/**
 * Dashboard-Hinweise — Redesign v2, Etappe 8 (docs/design/offene-punkte-redesign.md,
 * Abschnitt 30). Reines TypeScript, kein Svelte, kein idb (tests/schichten.test.ts
 * erzwingt das) — dieselbe Grenze wie domain/vorrat.ts.
 *
 * Zwei getrennte Aufgaben in einer Datei, weil beide zur selben Dashboard-Zone
 * gehören, aber nichts miteinander zu tun haben:
 *
 *   1. Meldungen  — priorisierte Liste, gedeckelt auf eine feste Anzahl
 *      (Rückmeldung 2026-09-06: 1-2, optimiert fürs Galaxy S25, kein Scrollen
 *      auf dem Dashboard). Was nicht reinpasst, zählt nur noch mit ("weitere").
 *   2. Kennzahl   — eine zufällig aus einem Pool gezogene, ehrliche Zahl über
 *      die eigene Nutzung. Kein Wert ohne ausreichende Datenbasis (K64).
 *
 * Die eigentliche Rechnerei für "knapp"/"alt" bleibt in domain/vorrat.ts
 * (restGramm, brauchtAufmerksamkeit, …) — Bar.svelte ruft beide Module auf und
 * fügt die Ergebnisse zu Meldungskandidaten zusammen. Hier lebt nur, was neu
 * ist: die Priorisierung/Deckelung selbst, und die beiden neuen Prüfungen
 * (Restmenge unbekannt, Dial-in offen), die keine eigene Datei rechtfertigen.
 */

/** Reihenfolge ist Bedeutung — Index 0 verdrängt jede andere Art zuerst. */
export type MeldungsArt = 'knapp' | 'alt' | 'restUnbekannt' | 'dialinOffen' | 'beobachtung';

const PRIORITAET: readonly MeldungsArt[] = ['knapp', 'alt', 'restUnbekannt', 'dialinOffen', 'beobachtung'];

export function prioritaetsRang(art: MeldungsArt): number {
  const index = PRIORITAET.indexOf(art);
  return index === -1 ? PRIORITAET.length : index;
}

export interface Meldungskandidat {
  readonly art: MeldungsArt;
}

export interface Gedeckelt<T> {
  readonly sichtbar: readonly T[];
  /** Wie viele Kandidaten ueber die Deckelung hinaus noch da waeren — nicht ihre Inhalte, nur die Zahl. */
  readonly weitere: number;
}

/**
 * Sortiert nach Prioritaet (stabil: gleicher Rang behaelt die Aufrufreihenfolge)
 * und deckelt auf `max` sichtbare Eintraege. Der Rest verschwindet nicht
 * kommentarlos — `weitere` zaehlt ihn, ohne ihn zu benennen (K57/K58-Geist:
 * keine zusaetzliche Wertung ueber das Nicht-Angezeigte).
 */
export function sortiereUndDeckeln<T extends Meldungskandidat>(kandidaten: readonly T[], max: number): Gedeckelt<T> {
  const sortiert = [...kandidaten].sort((a, b) => prioritaetsRang(a.art) - prioritaetsRang(b.art));
  return {
    sichtbar: sortiert.slice(0, max),
    weitere: Math.max(0, sortiert.length - max),
  };
}

/**
 * Prio C: die aktuelle Charge hat weder Einwaage noch Korrektur — restGramm()
 * (domain/vorrat.ts) liefert dafuer bewusst `undefined` statt eines geratenen
 * Werts (K64). Diese Bohne wuerde deshalb nie als "knapp" auffallen, egal wie
 * leer sie ist — die Meldung macht die Luecke selbst sichtbar.
 */
export function restmengeUnbekannt(charge: { readonly einwaage?: number; readonly korrektur?: unknown } | undefined): boolean {
  return charge !== undefined && charge.einwaage === undefined && charge.korrektur === undefined;
}

/**
 * Prio D: ein Profil steht seit mindestens `schwelle` eigenen Shots noch auf
 * "dialin". `Profil.modus` wird heute nirgends automatisch umgestellt (Fund
 * 2026-09-06) — diese Meldung ist erst durch den neuen Umschalter im
 * Profilblatt (Etappe 8, Block C) ueberhaupt abstellbar.
 */
export function dialinOffen(profil: { readonly modus: 'dialin' | 'eingefahren' }, eigeneShotAnzahl: number, schwelle = 5): boolean {
  return profil.modus === 'dialin' && eigeneShotAnzahl >= schwelle;
}

// ---------------------------------------------------------------------------
// Kennzahl — eine zufaellige, wahre Zahl aus einem festen Fakten-Pool.
// ---------------------------------------------------------------------------

export interface Kennzahl {
  readonly label: string;
  readonly wert: string;
}

export interface ShotFuerKennzahl {
  readonly ts: number;
  readonly kaffeeId: string;
  /** Vom Aufrufer aufgeloest: Profil -> Setup -> Bruehgeraet.typ (bestand.bruehgeraetVon). */
  readonly zubereitung?: string;
}

export interface KaffeeFuerKennzahl {
  readonly id: string;
  readonly name: string;
  readonly aktiv: boolean;
  readonly entkoffeiniert: boolean;
}

const ZUBEREITUNG_LABEL: Readonly<Record<string, string>> = {
  espresso: 'Espresso',
  moka: 'Moka',
  pourover: 'Pour Over',
  coldbrew: 'Cold Brew',
};

const TAG_MS = 24 * 60 * 60 * 1000;

/** Kleinste Stichprobe, ab der ein Anteil/eine Mehrheit nicht wie geraten wirkt. */
const MINDEST_STICHPROBE = 3;

function haeufigster<V>(werte: readonly V[]): V | undefined {
  const zaehler = new Map<V, number>();
  for (const w of werte) zaehler.set(w, (zaehler.get(w) ?? 0) + 1);
  let bester: V | undefined;
  let besterWert = 0;
  for (const [wert, anzahl] of zaehler) {
    if (anzahl > besterWert) {
      bester = wert;
      besterWert = anzahl;
    }
  }
  return bester;
}

function selberMonat(ts: number, jetzt: number): boolean {
  const a = new Date(ts);
  const b = new Date(jetzt);
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/**
 * Die kaffeeId mit den meisten Shots innerhalb eines Zeitfensters — dieselbe
 * Zaehlung, die kennzahlenPool() intern fuer "Meistgenutzte Bohne" braucht,
 * hier eigens exportiert: Bar.svelte braucht sie ein zweites Mal fuer den
 * Ruhezustand der Meldungs-Zone (keine Meldung offen -> zeig die Bohne, mit
 * der gerade gearbeitet wird, statt eines Platzhalters).
 */
export function meistgenutzteKaffeeId(shots: readonly { readonly ts: number; readonly kaffeeId: string }[], tageFenster: number, jetzt: number): string | undefined {
  return haeufigster(shots.filter((s) => jetzt - s.ts < tageFenster * TAG_MS).map((s) => s.kaffeeId));
}

/**
 * Baut den Fakten-Pool aus den sieben von Julian festgelegten Kennzahlen
 * (Rückmeldung 2026-09-06). Jede erscheint nur, wenn genug Datenbasis da ist
 * — leer statt geraten (K64). Die Auswahl, welche zwei angezeigt werden,
 * passiert separat in `waehleKennzahlen` (eigene Funktion, damit sie mit
 * einem festen `zufall` testbar bleibt — Muster aus domain/begruessung.ts).
 */
export function kennzahlenPool(shots: readonly ShotFuerKennzahl[], kaffees: readonly KaffeeFuerKennzahl[], jetzt: number): readonly Kennzahl[] {
  const pool: Kennzahl[] = [];
  const kaffeeById = new Map(kaffees.map((k) => [k.id, k]));
  const inFenster = (tage: number) => shots.filter((s) => jetzt - s.ts < tage * TAG_MS);

  const diesenMonat = shots.filter((s) => selberMonat(s.ts, jetzt));
  if (diesenMonat.length > 0) pool.push({ label: 'Bezüge diesen Monat', wert: String(diesenMonat.length) });

  const dieseWoche = inFenster(7);
  if (dieseWoche.length > 0) pool.push({ label: 'Bezüge diese Woche', wert: String(dieseWoche.length) });

  const letzte30 = inFenster(30);
  if (letzte30.length >= MINDEST_STICHPROBE) {
    const koffeinhaltig = letzte30.filter((s) => kaffeeById.get(s.kaffeeId)?.entkoffeiniert === false).length;
    pool.push({ label: 'Koffeinhaltig · 30 Tage', wert: `${Math.round((koffeinhaltig / letzte30.length) * 100)} %` });

    const meistgenutzteId = haeufigster(letzte30.map((s) => s.kaffeeId));
    const meistgenutzterName = meistgenutzteId ? kaffeeById.get(meistgenutzteId)?.name : undefined;
    if (meistgenutzterName) pool.push({ label: 'Meistgenutzte Bohne · 30 Tage', wert: meistgenutzterName });

    const zubereitungen = letzte30.map((s) => s.zubereitung).filter((z): z is string => z !== undefined);
    const haeufigsteZubereitung = zubereitungen.length >= MINDEST_STICHPROBE ? haeufigster(zubereitungen) : undefined;
    if (haeufigsteZubereitung) {
      pool.push({ label: 'Häufigste Zubereitung · 30 Tage', wert: ZUBEREITUNG_LABEL[haeufigsteZubereitung] ?? haeufigsteZubereitung });
    }
  }

  // "Probiert" verspricht Abwechslung — bei genau einer Bohne waere das
  // irrefuehrend, deshalb erst ab zwei verschiedenen.
  const verschiedeneBohnen = new Set(inFenster(90).map((s) => s.kaffeeId)).size;
  if (verschiedeneBohnen >= 2) pool.push({ label: 'Verschiedene Bohnen · 90 Tage', wert: String(verschiedeneBohnen) });

  const aktiveBohnen = kaffees.filter((k) => k.aktiv).length;
  if (aktiveBohnen > 0) pool.push({ label: 'Aktive Bohnen im Bestand', wert: String(aktiveBohnen) });

  return pool;
}

/**
 * Zieht bis zu `max` verschiedene Kennzahlen zufaellig aus dem Pool — einmal
 * beim Oeffnen, nicht bei jedem Rerender (Aufrufer nutzt `untrack`, wie schon
 * bei domain/begruessung.ts::begruessung). `zufall` ist injizierbar fuer
 * deterministische Tests, Default ist echter Zufall.
 */
export function waehleKennzahlen(pool: readonly Kennzahl[], max: number, zufall: () => number = Math.random): readonly Kennzahl[] {
  const rest = [...pool];
  const gewaehlt: Kennzahl[] = [];
  while (rest.length > 0 && gewaehlt.length < max) {
    const index = Math.floor(zufall() * rest.length);
    gewaehlt.push(rest.splice(index, 1)[0]!);
  }
  return gewaehlt;
}
