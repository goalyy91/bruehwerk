/**
 * Cloud-Sicherung in ein privates GitHub-Repo (Entscheidung 14.11.2026).
 *
 * Warum GitHub: kostenlos, ohne Stilllegung bei Inaktivität (Supabase legt
 * kostenlose Projekte nach 7 Tagen still), ohne eigenen Server, und jede
 * Sicherung ist ein Commit — die Versionsgeschichte gibt es geschenkt.
 *
 * Grundsätze aus CLAUDE.md "Datenquelle", hier eingehalten:
 * - IndexedDB bleibt die Wahrheit. Nichts hier blockiert das Schreiben;
 *   jeder Fehler landet im Zustand, nie als Ausnahme beim Loggen.
 * - Der Datei-Export bleibt unberührt — dieselbe ExportDatei, nur woanders.
 *
 * Zwei Schutzregeln, die die automatische Sicherung tragen:
 * 1. **Ein neues Gerät überschreibt nie die Cloud.** Liegt dort schon ein
 *    Stand, wird erst automatisch gesichert, nachdem entschieden wurde:
 *    zurückholen oder überschreiben (`freigegeben`).
 * 2. **Ein anderes Gerät wird nicht still überschrieben.** Jede Sicherung
 *    schickt den zuletzt bekannten Stand (`sha`) mit; hat inzwischen jemand
 *    anderes gesichert, lehnt GitHub ab, und der Zustand heißt `konflikt`.
 *
 * Zugang und Zustand liegen im localStorage, bewusst **nicht** in IndexedDB:
 * sonst stünde der Token in jeder Export-Datei und in jeder Sicherung.
 *
 * Kein Svelte, kein DOM außer dem, was hineingereicht wird (fetch, Speicher,
 * Uhr) — dadurch ohne Netz testbar.
 */
import { exportiere, importiere, type ExportDatei } from './export';
import { SAMMLUNGEN } from './db';
import { schnappschussAnlegen } from './schnappschuss';
import { aufAenderungHoeren } from './aenderung';

export const DATEINAME = 'bruehwerk.json';
/** Ab wann die Bar meldet, dass die Sicherung wartet — Entscheidung 14.11.2026, ersetzt "ab dem zweiten Fehlversuch" aus K77. */
export const WARTET_AB_MS = 3 * 24 * 60 * 60 * 1000;
/** Verzögerung nach einer Änderung — mehrere Schreibvorgänge eines Shots werden eine Sicherung. */
export const VERZOEGERUNG_MS = 8_000;

const SPEICHER_SCHLUESSEL = 'bruehwerk.cloud';
const API = 'https://api.github.com';

export interface CloudZugang {
  /** "besitzer/name" */
  readonly repo: string;
  readonly token: string;
}

export interface CloudZustand {
  readonly zugang?: CloudZugang;
  readonly eingerichtetAm?: number;
  /** Stand der Datei in der Cloud, auf dem die nächste Sicherung aufsetzt. */
  readonly sha?: string;
  /** Darf automatisch gesichert werden? Erst nach der Entscheidung auf einem neuen Gerät. */
  readonly freigegeben: boolean;
  readonly konflikt?: boolean;
  readonly letzteSicherungAm?: number;
  readonly letzterFehler?: string;
  readonly letzterFehlerAm?: number;
  /** Prüfsumme des zuletzt gesicherten Bestands — ohne Änderung kein neuer Commit. */
  readonly pruefsumme?: string;
}

export interface CloudStand {
  readonly sha: string;
  readonly datei: ExportDatei;
}

export type Fehlerart = 'zugang' | 'repo' | 'netz' | 'konflikt' | 'sonstig';

export class CloudFehler extends Error {
  constructor(
    public readonly art: Fehlerart,
    nachricht: string,
  ) {
    super(nachricht);
    this.name = 'CloudFehler';
  }
}

export interface Umgebung {
  readonly fetch: typeof fetch;
  readonly speicher: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
  readonly jetzt: () => number;
}

function standardUmgebung(): Umgebung {
  return { fetch: (...a) => globalThis.fetch(...a), speicher: globalThis.localStorage, jetzt: () => Date.now() };
}

// ---- Zustand ----------------------------------------------------------------

type Beobachter = (z: CloudZustand) => void;
const beobachter = new Set<Beobachter>();

export function zustandLesen(u: Umgebung = standardUmgebung()): CloudZustand {
  try {
    const roh = u.speicher.getItem(SPEICHER_SCHLUESSEL);
    if (roh) return { freigegeben: false, ...(JSON.parse(roh) as Partial<CloudZustand>) };
  } catch {
    // Kaputter oder gesperrter Speicher heißt: nicht eingerichtet.
  }
  return { freigegeben: false };
}

function zustandSchreiben(z: CloudZustand, u: Umgebung): CloudZustand {
  try {
    u.speicher.setItem(SPEICHER_SCHLUESSEL, JSON.stringify(z));
  } catch {
    // Ohne Speicher keine Erinnerung — die Sicherung selbst bleibt trotzdem gültig.
  }
  for (const b of beobachter) b(z);
  return z;
}

function zustandAendern(u: Umgebung, aenderung: Partial<CloudZustand>): CloudZustand {
  return zustandSchreiben({ ...zustandLesen(u), ...aenderung }, u);
}

export function zustandBeobachten(b: Beobachter): () => void {
  beobachter.add(b);
  return () => beobachter.delete(b);
}

/**
 * Wartet die Sicherung so lange, dass die Bar es sagen soll? Erst nach
 * `WARTET_AB_MS` ohne gelungene Sicherung — kurze Ausfälle (Funkloch, GitHub
 * kurz weg) sieht man nie, einen abgelaufenen Token aber rechtzeitig.
 * Zählt ab der letzten gelungenen Sicherung, sonst ab der Einrichtung.
 */
export function wartetSeit(z: CloudZustand, jetzt: number): number | undefined {
  if (!z.zugang) return undefined;
  const bezug = z.letzteSicherungAm ?? z.eingerichtetAm;
  if (bezug === undefined) return undefined;
  return jetzt - bezug >= WARTET_AB_MS ? bezug : undefined;
}

function uhrzeit(ts: number, jetzt: number): string {
  const d = new Date(ts);
  const zeit = d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  const tag = (t: number) => new Date(t).toDateString();
  if (tag(ts) === tag(jetzt)) return `heute ${zeit}`;
  if (tag(ts) === tag(jetzt - 24 * 60 * 60 * 1000)) return `gestern ${zeit}`;
  return `am ${d.toLocaleDateString('de-DE')}`;
}

/**
 * Der Zustand als ein Satz — das Wichtige zuerst, das Wort "Fehler" kommt
 * nicht vor (K65): lokal ist nichts verloren, die Sicherung wartet nur.
 */
export function statusSatz(z: CloudZustand, jetzt: number): string {
  if (!z.zugang) return 'aus';
  if (z.konflikt) return 'wartet — ein anderes Gerät hat gesichert';
  if (!z.freigegeben) return 'wartet auf deine Entscheidung';
  if (z.letzterFehler && (!z.letzteSicherungAm || (z.letzterFehlerAm ?? 0) > z.letzteSicherungAm)) {
    return z.letzteSicherungAm ? `zuletzt gesichert ${uhrzeit(z.letzteSicherungAm, jetzt)} · Sicherung wartet` : 'Sicherung wartet';
  }
  return z.letzteSicherungAm ? `zuletzt gesichert ${uhrzeit(z.letzteSicherungAm, jetzt)}` : 'an';
}

// ---- GitHub -----------------------------------------------------------------

function kopf(zugang: CloudZugang, accept = 'application/vnd.github+json'): HeadersInit {
  return {
    Accept: accept,
    Authorization: `Bearer ${zugang.token}`,
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

function dateiUrl(zugang: CloudZugang): string {
  return `${API}/repos/${zugang.repo}/contents/${DATEINAME}`;
}

async function anfrage(u: Umgebung, url: string, init: RequestInit): Promise<Response> {
  try {
    return await u.fetch(url, init);
  } catch {
    throw new CloudFehler('netz', 'Keine Verbindung zu GitHub.');
  }
}

function fehlerAus(antwort: Response, kontext: 'repo' | 'datei'): CloudFehler {
  if (antwort.status === 401) return new CloudFehler('zugang', 'Der Token wird nicht mehr angenommen — abgelaufen oder widerrufen.');
  if (antwort.status === 403) return new CloudFehler('zugang', 'Der Token darf dieses Repo nicht beschreiben (Recht „Contents: Read and write“ fehlt).');
  if (antwort.status === 404 && kontext === 'repo') return new CloudFehler('repo', 'Repo nicht gefunden — Name prüfen, oder der Token ist nicht dafür freigegeben.');
  if (antwort.status === 409 || antwort.status === 422) return new CloudFehler('konflikt', 'Ein anderes Gerät hat inzwischen gesichert.');
  return new CloudFehler('sonstig', `GitHub antwortet mit ${antwort.status}.`);
}

function nachBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binaer = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binaer += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binaer);
}

function ausBase64(b64: string): string {
  const binaer = atob(b64.replace(/\s/g, ''));
  const bytes = Uint8Array.from(binaer, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** Prüft Token und Repo, ohne etwas zu schreiben. */
export async function zugangPruefen(zugang: CloudZugang, u: Umgebung = standardUmgebung()): Promise<void> {
  if (!/^[\w.-]+\/[\w.-]+$/.test(zugang.repo)) throw new CloudFehler('repo', 'Repo als „besitzer/name“ angeben.');
  const antwort = await anfrage(u, `${API}/repos/${zugang.repo}`, { headers: kopf(zugang) });
  if (!antwort.ok) throw fehlerAus(antwort, 'repo');
}

/** Der Stand in der Cloud, oder undefined, wenn dort noch nichts liegt. */
export async function cloudLesen(zugang: CloudZugang, u: Umgebung = standardUmgebung()): Promise<CloudStand | undefined> {
  const url = dateiUrl(zugang);
  const antwort = await anfrage(u, url, { headers: kopf(zugang), cache: 'no-store' });
  if (antwort.status === 404) return undefined;
  if (!antwort.ok) throw fehlerAus(antwort, 'datei');
  const meta = (await antwort.json()) as { sha: string; content?: string; encoding?: string };
  let text: string;
  if (meta.content && meta.encoding === 'base64') {
    text = ausBase64(meta.content);
  } else {
    // Über 1 MB liefert GitHub den Inhalt nur als Rohfassung.
    const roh = await anfrage(u, url, { headers: kopf(zugang, 'application/vnd.github.raw+json'), cache: 'no-store' });
    if (!roh.ok) throw fehlerAus(roh, 'datei');
    text = await roh.text();
  }
  let datei: ExportDatei;
  try {
    datei = JSON.parse(text) as ExportDatei;
  } catch {
    throw new CloudFehler('sonstig', 'Die Datei in der Cloud ist kein lesbares Brühwerk-Backup.');
  }
  return { sha: meta.sha, datei };
}

/** FNV-1a — reicht, um "hat sich etwas geändert" zu beantworten, kein Schutz gegen Absicht. */
function pruefsummeVon(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return `${text.length}-${(h >>> 0).toString(16)}`;
}

async function hochladen(zugang: CloudZugang, datei: ExportDatei, sha: string | undefined, u: Umgebung): Promise<string> {
  const antwort = await anfrage(u, dateiUrl(zugang), {
    method: 'PUT',
    headers: { ...kopf(zugang), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: `Sicherung ${new Date(datei.erzeugtAm).toISOString()}`,
      content: nachBase64(JSON.stringify(datei, null, 1)),
      ...(sha ? { sha } : {}),
    }),
  });
  if (!antwort.ok) throw fehlerAus(antwort, 'datei');
  const ergebnis = (await antwort.json()) as { content: { sha: string } };
  return ergebnis.content.sha;
}

// ---- Abläufe ------------------------------------------------------------------

export type Einrichtung =
  /** Die Cloud war leer — es wurde sofort gesichert, ab jetzt automatisch. */
  | { readonly art: 'gesichert' }
  /** In der Cloud liegt schon ein Stand — erst entscheiden: zurückholen oder überschreiben. */
  | { readonly art: 'entscheiden'; readonly stand: CloudStand };

/** Zugang setzen und prüfen. Wirft CloudFehler, wenn Token oder Repo nicht passen — dann bleibt der alte Zustand. */
export async function einrichten(zugang: CloudZugang, u: Umgebung = standardUmgebung()): Promise<Einrichtung> {
  const sauber = { repo: zugang.repo.trim(), token: zugang.token.trim() };
  await zugangPruefen(sauber, u);
  const stand = await cloudLesen(sauber, u);
  zustandSchreiben({ zugang: sauber, eingerichtetAm: u.jetzt(), freigegeben: stand === undefined }, u);
  if (stand) return { art: 'entscheiden', stand };
  await sichern(u, { erzwingen: true });
  const nachher = zustandLesen(u);
  if (nachher.letzterFehler) throw new CloudFehler('sonstig', nachher.letzterFehler);
  return { art: 'gesichert' };
}

/**
 * Neuen Token für dasselbe Repo — der Fall "abgelaufen". Alles andere
 * (Stand, Freigabe) bleibt; danach wird sofort gesichert.
 */
export async function tokenErsetzen(token: string, u: Umgebung = standardUmgebung()): Promise<void> {
  const z = zustandLesen(u);
  if (!z.zugang) throw new CloudFehler('zugang', 'Keine Cloud-Sicherung eingerichtet.');
  const zugang = { repo: z.zugang.repo, token: token.trim() };
  await zugangPruefen(zugang, u);
  zustandAendern(u, { zugang, letzterFehler: undefined, letzterFehlerAm: undefined });
  await sichern(u);
}

/** Zugang entfernen — die Cloud-Datei bleibt, wo sie ist. */
export function trennen(u: Umgebung = standardUmgebung()): void {
  try {
    u.speicher.removeItem(SPEICHER_SCHLUESSEL);
  } catch {
    // nichts zu tun
  }
  for (const b of beobachter) b({ freigegeben: false });
}

/**
 * Holt den Cloud-Stand auf dieses Gerät. Vorher eine Sicherung im Gerät
 * (dieselbe wie vor einer Aktualisierung) — schlägt sie fehl, wird nicht
 * zurückgeholt. Danach ist automatisches Sichern freigegeben.
 */
export async function zurueckholen(u: Umgebung = standardUmgebung()): Promise<void> {
  const z = zustandLesen(u);
  if (!z.zugang) throw new CloudFehler('zugang', 'Keine Cloud-Sicherung eingerichtet.');
  const stand = await cloudLesen(z.zugang, u);
  if (!stand) throw new CloudFehler('sonstig', 'In der Cloud liegt noch kein Stand.');
  await schnappschussAnlegen('vor dem Zurückholen aus der Cloud');
  await importiere(stand.datei);
  // Nach dem Import entspricht der lokale Bestand dem Cloud-Stand plus dem,
  // was nur hier lag — die Prüfsumme bleibt leer, damit die nächste
  // Sicherung diesen vereinigten Stand hochlädt.
  zustandAendern(u, { sha: stand.sha, freigegeben: true, konflikt: false, letzterFehler: undefined, letzterFehlerAm: undefined, pruefsumme: undefined });
}

/**
 * Löst einen Konflikt: nimmt aus der Cloud alles dazu, was auf diesem Gerät
 * fehlt — ein Eintrag, den es auf beiden Seiten gibt, bleibt wie er hier
 * ist. Anders als `zurueckholen` (neues Gerät, die Cloud gilt): beim Konflikt
 * hat *dieses* Gerät die Änderung, die gerade gesichert werden sollte, und
 * die darf nicht verschwinden. Danach wird die Vereinigung gesichert.
 *
 * Grenze, bekannt und gewollt bis zu echtem Abgleich je Datensatz: ein
 * Eintrag, der hier gelöscht und in der Cloud noch vorhanden ist, kommt
 * zurück; eine Änderung am selben Eintrag auf dem anderen Gerät geht verloren
 * (bleibt aber in der Versionsgeschichte des Repos).
 */
export async function zusammenfuehren(u: Umgebung = standardUmgebung()): Promise<void> {
  const z = zustandLesen(u);
  if (!z.zugang) throw new CloudFehler('zugang', 'Keine Cloud-Sicherung eingerichtet.');
  const stand = await cloudLesen(z.zugang, u);
  if (stand) {
    const hier = await exportiere();
    const nurDort: Record<string, unknown[]> = {};
    for (const s of SAMMLUNGEN) {
      const vorhanden = new Set((hier.sammlungen[s] as { id: string }[]).map((e) => e.id));
      const dort = (stand.datei.sammlungen as Record<string, { id: string }[] | undefined>)[s] ?? [];
      nurDort[s] = dort.filter((e) => !vorhanden.has(e.id));
    }
    await schnappschussAnlegen('vor dem Zusammenführen mit der Cloud');
    await importiere({ ...stand.datei, sammlungen: nurDort });
  }
  zustandAendern(u, { sha: stand?.sha, freigegeben: true, konflikt: false, letzterFehler: undefined, letzterFehlerAm: undefined, pruefsumme: undefined });
  await sichern(u);
  const nachher = zustandLesen(u);
  if (nachher.letzterFehler) throw new CloudFehler('sonstig', nachher.letzterFehler);
}

/** Überschreibt die Cloud mit dem Stand dieses Geräts — die Versionsgeschichte im Repo behält den alten. */
export async function ueberschreiben(u: Umgebung = standardUmgebung()): Promise<void> {
  const z = zustandLesen(u);
  if (!z.zugang) throw new CloudFehler('zugang', 'Keine Cloud-Sicherung eingerichtet.');
  const stand = await cloudLesen(z.zugang, u);
  zustandAendern(u, { sha: stand?.sha, freigegeben: true, konflikt: false, pruefsumme: undefined });
  await sichern(u, { erzwingen: true });
  const nachher = zustandLesen(u);
  if (nachher.letzterFehler) throw new CloudFehler('sonstig', nachher.letzterFehler);
}

/**
 * Sichern und Abholen laufen nie gleichzeitig — beide lesen und schreiben
 * denselben Zustand (`sha`, `pruefsumme`). Ein zweiter Aufruf derselben Art,
 * während einer läuft, teilt sich dessen Lauf.
 */
let laufend: Promise<void> | undefined;
let laufendArt: 'sichern' | 'abholen' | undefined;

function exklusiv(art: 'sichern' | 'abholen', tat: () => Promise<void>): Promise<void> {
  if (laufend && laufendArt === art) return laufend;
  const vorher = laufend ?? Promise.resolve();
  const lauf = vorher.then(tat).finally(() => {
    if (laufend === lauf) {
      laufend = undefined;
      laufendArt = undefined;
    }
  });
  laufend = lauf;
  laufendArt = art;
  return lauf;
}

function alsCloudFehler(e: unknown): CloudFehler {
  return e instanceof CloudFehler ? e : new CloudFehler('sonstig', e instanceof Error ? e.message : String(e));
}

/**
 * Sichert den Bestand, wenn eingerichtet, freigegeben und ohne Konflikt.
 * Wirft nie — jedes Ergebnis steht danach im Zustand.
 */
export function sichern(u: Umgebung = standardUmgebung(), optionen: { erzwingen?: boolean } = {}): Promise<void> {
  return exklusiv('sichern', async () => {
    const z = zustandLesen(u);
    if (!z.zugang || !z.freigegeben || z.konflikt) return;
    try {
      const datei = await exportiere();
      const summe = pruefsummeVon(JSON.stringify(datei.sammlungen));
      if (!optionen.erzwingen && summe === z.pruefsumme) {
        // Nichts Neues — der letzte Stand dieses Geräts liegt schon oben.
        zustandAendern(u, { letzteSicherungAm: u.jetzt(), letzterFehler: undefined, letzterFehlerAm: undefined });
        return;
      }
      const sha = await hochladen(z.zugang, datei, z.sha, u);
      zustandAendern(u, { sha, pruefsumme: summe, letzteSicherungAm: u.jetzt(), letzterFehler: undefined, letzterFehlerAm: undefined });
    } catch (e) {
      const fehler = alsCloudFehler(e);
      zustandAendern(u, {
        konflikt: fehler.art === 'konflikt' ? true : z.konflikt,
        letzterFehler: fehler.message,
        letzterFehlerAm: u.jetzt(),
      });
    }
  });
}

export type Abholergebnis = 'aus' | 'aktuell' | 'geholt' | 'konflikt' | 'fehler';

/**
 * Holt den Stand eines anderen Geräts, wenn eins inzwischen gesichert hat
 * (Nachzug 14.11.2026: "am Tablet ist nichts drin" — Sichern allein bringt
 * nichts auf das zweite Gerät).
 *
 * - Cloud unverändert seit der letzten eigenen Sicherung → nichts zu tun.
 * - Cloud neuer, dieses Gerät ohne Ungesichertes → still übernehmen. Ohne
 *   Sicherung im Gerät davor: alles, was hier lag, liegt bereits in der
 *   Versionsgeschichte des Repos — und drei Gerätesicherungen, die bei jedem
 *   Öffnen rotieren, wären für den Update-Fall verloren.
 * - Cloud neuer UND hier Ungesichertes → Konflikt, wie beim Sichern. Nichts
 *   wird still überschrieben.
 *
 * Wirft nie.
 */
export function abholen(u: Umgebung = standardUmgebung()): Promise<Abholergebnis> {
  let ergebnis: Abholergebnis = 'aus';
  return exklusiv('abholen', async () => {
    const z = zustandLesen(u);
    if (!z.zugang || !z.freigegeben || z.konflikt) return;
    try {
      const stand = await cloudLesen(z.zugang, u);
      if (!stand || stand.sha === z.sha) {
        ergebnis = 'aktuell';
        return;
      }
      const hier = await exportiere();
      const ungesichert = z.pruefsumme === undefined || pruefsummeVon(JSON.stringify(hier.sammlungen)) !== z.pruefsumme;
      if (ungesichert) {
        zustandAendern(u, { konflikt: true });
        ergebnis = 'konflikt';
        return;
      }
      await importiere(stand.datei);
      const nachher = pruefsummeVon(JSON.stringify((await exportiere()).sammlungen));
      const cloud = pruefsummeVon(JSON.stringify(stand.datei.sammlungen));
      // Gleich: nichts hochzuladen. Verschieden (hier lag etwas, das oben
      // fehlt): Prüfsumme leer lassen, damit die nächste Sicherung es nachträgt.
      zustandAendern(u, {
        sha: stand.sha,
        pruefsumme: nachher === cloud ? nachher : undefined,
        letzteSicherungAm: u.jetzt(),
        letzterFehler: undefined,
        letzterFehlerAm: undefined,
      });
      ergebnis = 'geholt';
    } catch (e) {
      zustandAendern(u, { letzterFehler: alsCloudFehler(e).message, letzterFehlerAm: u.jetzt() });
      ergebnis = 'fehler';
    }
  }).then(() => ergebnis);
}

/**
 * Hängt die Automatik an:
 * - Sichern verzögert nach jeder Änderung und sofort beim Wechsel in den
 *   Hintergrund.
 * - Abholen beim Start und bei jeder Rückkehr in die App; danach sichern,
 *   falls hier etwas lag, das oben fehlte.
 * `onGeholt` meldet der Oberfläche, dass sie den Bestand neu laden muss.
 * Gibt die Abmeldung zurück.
 */
export function automatikStarten(u: Umgebung = standardUmgebung(), onGeholt?: () => void): () => void {
  let zeitgeber: ReturnType<typeof setTimeout> | undefined;
  let offen = false;
  const jetztSichern = () => {
    clearTimeout(zeitgeber);
    zeitgeber = undefined;
    offen = false;
    void sichern(u);
  };
  const abgleichen = async () => {
    if ((await abholen(u)) === 'geholt') onGeholt?.();
    await sichern(u);
  };
  const abmelden = aufAenderungHoeren(() => {
    offen = true;
    clearTimeout(zeitgeber);
    zeitgeber = setTimeout(jetztSichern, VERZOEGERUNG_MS);
  });
  const sichtbarkeit = () => {
    const zustand = globalThis.document?.visibilityState;
    if (zustand === 'hidden' && offen) jetztSichern();
    // Ungesichertes zuerst hoch, sonst wäre jede Rückkehr mit offener
    // Änderung ein Konflikt mit dem eigenen, noch nicht gesicherten Stand.
    if (zustand === 'visible') {
      if (offen) {
        clearTimeout(zeitgeber);
        zeitgeber = undefined;
        offen = false;
        void sichern(u).then(abgleichen);
      } else {
        void abgleichen();
      }
    }
  };
  globalThis.document?.addEventListener('visibilitychange', sichtbarkeit);
  void abgleichen();
  return () => {
    abmelden();
    clearTimeout(zeitgeber);
    globalThis.document?.removeEventListener('visibilitychange', sichtbarkeit);
  };
}
