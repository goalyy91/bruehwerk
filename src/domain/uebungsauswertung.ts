/**
 * Auswertung des Übungsmodus — Aromapaket, Etappe 8 (Neubau nach
 * Lastenheft, docs/konzept.md "Übungsmodus", Abschnitt 8 "Auswertung und
 * Statistik"). Reines TypeScript, kein idb, kein Svelte
 * (tests/schichten.test.ts erzwingt das) — reine Rechnerei auf den
 * Antwort-Datensätzen (daten/schema/uebungsantwort.ts), die der
 * Statistik-Bildschirm anzeigt.
 *
 * Bewusst **nicht** aus `Uebung.verwechslungen` gebaut, obwohl die Zahlen
 * dort ähnlich aussehen: jenes Feld ist eine laufend fortgeführte Summe, die
 * auch Altbestand aus der ersten Fassung des Übungsmodus mitschleppen kann
 * (`domain/uebung.ts`, Kopfkommentar). Diese Auswertung liest stattdessen
 * das Antwortprotokoll direkt — jede Zahl hier lässt sich auf ein
 * tatsächliches Ereignis der neuen Fassung zurückführen.
 *
 * Die im Lastenheft als optional markierte Dämpfung der Box-Beförderung bei
 * langer Antwortzeit ist bewusst nicht gebaut — `langsameRichtigeAntworten`
 * liefert nur die Liste zum Ansehen, verändert nichts an der
 * Leitner-Bewegung (die bleibt allein in domain/leitner.ts/domain/uebung.ts).
 */
import type { Uebungsantwort } from '../daten/schema/uebungsantwort';
import type { AromaOption, EffektiverZustand } from './uebung';
import type { Kennzahl } from './hinweise';

const MS_PRO_TAG = 24 * 60 * 60 * 1000;
const MS_PRO_WOCHE = 7 * MS_PRO_TAG;

// ---- Verwechslungsmatrix ---------------------------------------------------

export interface VerwechslungsEintrag {
  readonly tatsaechlichId: string;
  readonly getipptId: string;
  readonly anzahl: number;
}

/**
 * Gerichtete Verwechslungsmatrix aus dem Antwortprotokoll: für jedes Paar
 * (tatsächliches Aroma, stattdessen getipptes Aroma) die Anzahl. Gerichtet
 * bewusst — "X für Y gehalten" ist eine andere Aussage als "Y für X
 * gehalten", auch wenn beide oft zusammen auftreten. Absteigend nach
 * Häufigkeit, damit das auffälligste Paar zuerst steht.
 */
export function verwechslungsmatrix(antworten: readonly Uebungsantwort[]): readonly VerwechslungsEintrag[] {
  const zaehler = new Map<string, number>();
  for (const a of antworten) {
    if (a.ergebnis === 'richtig') continue;
    if (!a.getipptId || a.getipptId === a.aromaId) continue;
    const schluessel = `${a.aromaId}|${a.getipptId}`;
    zaehler.set(schluessel, (zaehler.get(schluessel) ?? 0) + 1);
  }
  return [...zaehler.entries()]
    .map(([schluessel, anzahl]) => {
      const [tatsaechlichId, getipptId] = schluessel.split('|') as [string, string];
      return { tatsaechlichId, getipptId, anzahl };
    })
    .sort((a, b) => b.anzahl - a.anzahl);
}

// ---- Familien-Trefferquote --------------------------------------------------

export interface FamilienQuote {
  readonly kategorieId: string;
  readonly richtig: number;
  readonly versuche: number;
}

/**
 * Trefferquote je Familie — nur aus den Formen "familie" (Stufe A) und
 * "aromaInFamilie" (Stufe B), den einzigen, die überhaupt eine Familienfrage
 * stellen. "richtig" und "teilweise" zählen beide als Familie getroffen (bei
 * "teilweise" war die Familie richtig, nur das Aroma nicht,
 * domain/uebung.ts::werteAntwortAus) — "falsch" nicht. Freier Abruf (Stufe
 * C) trägt keine Familienaussage: dort wird nur das Aroma direkt verglichen,
 * ohne dass eine Familie abgefragt wurde.
 */
export function familienTrefferquote(antworten: readonly Uebungsantwort[], aromen: readonly AromaOption[]): readonly FamilienQuote[] {
  const kategorieVonId = new Map(aromen.map((a) => [a.id, a.kategorieId] as const));
  const zaehler = new Map<string, { richtig: number; versuche: number }>();
  for (const a of antworten) {
    if (a.form !== 'familie' && a.form !== 'aromaInFamilie') continue;
    const kategorieId = kategorieVonId.get(a.aromaId);
    if (!kategorieId) continue;
    const eintrag = zaehler.get(kategorieId) ?? { richtig: 0, versuche: 0 };
    eintrag.versuche += 1;
    if (a.ergebnis === 'richtig' || a.ergebnis === 'teilweise') eintrag.richtig += 1;
    zaehler.set(kategorieId, eintrag);
  }
  return [...zaehler.entries()].map(([kategorieId, e]) => ({ kategorieId, richtig: e.richtig, versuche: e.versuche }));
}

// ---- Antwortdauer als Sicherheitsindikator ---------------------------------

/** Ab welcher Antwortdauer eine richtige Antwort eher nach Raten/langem Zögern aussieht als nach sicherem Wissen. */
export const LANGSAM_SCHWELLE_MS = 8000;

export interface LangsameAntwort {
  readonly aromaId: string;
  readonly antwortdauerMs: number;
}

/**
 * Richtige Antworten mit auffällig langer Antwortdauer — ein Hinweis, kein
 * Urteil: lange Antwortzeit bei richtiger Antwort deutet auf Raten oder
 * starkes Zögern hin. Verändert bewusst nichts an der Box-Beförderung (siehe
 * Dateikopf) — reine Liste zum Ansehen.
 */
export function langsameRichtigeAntworten(
  antworten: readonly Uebungsantwort[],
  schwelleMs: number = LANGSAM_SCHWELLE_MS,
): readonly LangsameAntwort[] {
  return antworten
    .filter((a) => a.ergebnis === 'richtig' && a.antwortdauerMs !== undefined && a.antwortdauerMs > schwelleMs)
    .map((a) => ({ aromaId: a.aromaId, antwortdauerMs: a.antwortdauerMs! }));
}

// ---- Zielfrequenz-Abgleich --------------------------------------------------

/** Weniger als so viele Wochen Trainingsgeschichte ergeben keine verlässliche Aussage — Lastenheft Abschnitt 7: "erscheint erst nach einigen Wochen". */
export const ZIELFREQUENZ_MINDESTWOCHEN = 3;

export interface ZielfrequenzAbgleich {
  readonly faktischProWoche: number;
  /** true, wenn die faktische Frequenz um mehr als ein Drittel vom Ziel abweicht — ab da lohnt der Hinweis "Ziel anpassen?". */
  readonly weichtAb: boolean;
}

/**
 * Vergleicht die Zielfrequenz mit der tatsächlichen — **ausschließlich für
 * den Hinweis auf der Übersicht**, nie für die Leitner-Intervalle oder die
 * Session-Zusammenstellung (Lastenheft Abschnitt 7: "für Erinnerungen, nicht
 * für den Algorithmus"). Ohne genug Wochen Trainingsgeschichte liefert die
 * Funktion `undefined` — kein Abgleich, keine verfrühte Aussage.
 */
export function zielfrequenzAbgleich(
  zielProWoche: number,
  durchgaengeBegonnenAm: readonly number[],
  jetzt: number,
): ZielfrequenzAbgleich | undefined {
  if (durchgaengeBegonnenAm.length === 0) return undefined;
  const erstes = Math.min(...durchgaengeBegonnenAm);
  const wochen = (jetzt - erstes) / MS_PRO_WOCHE;
  if (wochen < ZIELFREQUENZ_MINDESTWOCHEN) return undefined;
  const faktischProWoche = durchgaengeBegonnenAm.length / wochen;
  const weichtAb = Math.abs(faktischProWoche - zielProWoche) / zielProWoche > 1 / 3;
  return { faktischProWoche, weichtAb };
}

// ---- Wochenfortschritt (rollierend) -----------------------------------------

export interface Wochenfortschritt {
  readonly anzahl: number;
  readonly ziel: number;
  /** true, wenn die letzten sieben Tage unter dem Wochenziel liegen. */
  readonly hinterher: boolean;
}

/**
 * Rollierender 7-Tage-Fortschritt gegen das Wochenziel — für die
 * Bar-Dashboard-Meldung ("hinkst du gerade hinterher", Rückmeldung
 * 2026-09-17). Anders als zielfrequenzAbgleich() oben (Langzeit-Durchschnitt
 * seit Trainingsbeginn, mindestens drei Wochen Geschichte nötig, für den
 * "Ziel anpassen?"-Hinweis auf der Aromaschule-Übersicht) braucht diese
 * Funktion keine Mindest-Trainingsgeschichte — sie beantwortet eine andere
 * Frage ("bin ich diese Woche dran") und tut das immer, ab dem ersten Tag.
 * Kein Kalenderwochen-Reset: "letzte sieben Tage" ist immer aktuell, ohne den
 * künstlichen Montags-Cliff eines Kalenderwochen-Zählers.
 */
export function wochenfortschritt(
  zielProWoche: number,
  durchgaengeBegonnenAm: readonly number[],
  jetzt: number,
): Wochenfortschritt {
  const anzahl = durchgaengeBegonnenAm.filter((ts) => jetzt - ts < MS_PRO_WOCHE).length;
  return { anzahl, ziel: zielProWoche, hinterher: anzahl < zielProWoche };
}

// ---- Kennzahlen-Pool für die Übersicht -------------------------------------

/**
 * Aromapaket, Etappe 9 (Livebetrieb-Rückmeldung: "Boxen ohne Namen" auf der
 * Übungsmodus-Übersicht sagen niemandem etwas, der nicht die interne
 * Leitner-Mechanik kennt). Ersetzt die rohe Fünf-Boxen-Liste dort durch
 * dasselbe Muster, das die Bar für ihre Kennzahl-Kacheln schon hat
 * (`domain/hinweise.ts::Kennzahl` + `waehleKennzahlen`) — ein Pool ehrlicher
 * Fakten, zwei werden beim Öffnen zufällig gezogen. Kein Wert ohne
 * ausreichende Datenbasis (K64), wie beim Kaffee-Pool.
 */
export interface UebungsKennzahlEingabe {
  readonly eingefuehrteZustaende: readonly EffektiverZustand[];
  readonly antworten: readonly Uebungsantwort[];
  readonly durchgaengeBegonnenAm: readonly number[];
  readonly aromen: readonly AromaOption[];
  /** kategorieId -> Familienname, vom Aufrufer aufgelöst (domain/ kennt das Aromaset nicht). */
  readonly familienLabels: ReadonlyMap<string, string>;
  readonly gesamtAnzahlAromen: number;
  readonly jetzt: number;
  /** Optional — nur gesetzt, wenn in den Einstellungen ein Wochenziel hinterlegt ist. Lässt "Durchgänge diese Woche" das Ziel mitnennen. */
  readonly zielProWoche?: number;
}

/** Ab Box 4 gilt ein Aroma als "sicher" — dieselbe Grenze, die vorher als Boxenverteilung auf der Übersicht stand. */
const SICHER_AB_BOX = 4;

/** Kleinste Stichprobe, ab der eine Familien-/Reverse-Quote nicht wie geraten wirkt — dieselbe Zahl wie sonst im Aromapaket (z. B. KONTRASTDURCHGANG_SCHWELLE). */
const KENNZAHL_MINDEST_STICHPROBE = 3;

export function uebungsKennzahlenPool(eingabe: UebungsKennzahlEingabe): readonly Kennzahl[] {
  const { eingefuehrteZustaende, antworten, durchgaengeBegonnenAm, aromen, familienLabels, gesamtAnzahlAromen, jetzt, zielProWoche } = eingabe;
  const pool: Kennzahl[] = [];
  const labelVon = (aromaId: string) => aromen.find((a) => a.id === aromaId)?.label ?? aromaId;

  if (eingefuehrteZustaende.length > 0) {
    const sicher = eingefuehrteZustaende.filter((z) => z.box >= SICHER_AB_BOX).length;
    pool.push({ label: 'Sicher gelernt', wert: `${sicher} von ${gesamtAnzahlAromen}` });
  }

  const dieseWoche = durchgaengeBegonnenAm.filter((ts) => jetzt - ts < MS_PRO_WOCHE).length;
  if (dieseWoche > 0) {
    pool.push({ label: 'Durchgänge diese Woche', wert: zielProWoche ? `${dieseWoche} von ${zielProWoche}` : String(dieseWoche) });
  }

  const familienQuoten = familienTrefferquote(antworten, aromen).filter((f) => f.versuche >= KENNZAHL_MINDEST_STICHPROBE);
  if (familienQuoten.length > 0) {
    const beste = [...familienQuoten].sort((a, b) => b.richtig / b.versuche - a.richtig / a.versuche)[0]!;
    pool.push({ label: 'Stärkste Familie', wert: familienLabels.get(beste.kategorieId) ?? beste.kategorieId });
  }

  const matrix = verwechslungsmatrix(antworten);
  if (matrix.length > 0) {
    const top = matrix[0]!;
    pool.push({ label: 'Meistverwechselt', wert: `${labelVon(top.tatsaechlichId)} ↔ ${labelVon(top.getipptId)}` });
  }

  if (durchgaengeBegonnenAm.length > 0) {
    const wochenDabei = Math.floor((jetzt - Math.min(...durchgaengeBegonnenAm)) / MS_PRO_WOCHE);
    if (wochenDabei >= 1) pool.push({ label: 'Dabei seit', wert: `${wochenDabei} Woche${wochenDabei === 1 ? '' : 'n'}` });
  }

  const reverseAntworten = antworten.filter((a) => a.form === 'reverse' && a.ergebnis !== undefined);
  if (reverseAntworten.length >= KENNZAHL_MINDEST_STICHPROBE) {
    const richtig = reverseAntworten.filter((a) => a.ergebnis === 'richtig').length;
    pool.push({ label: 'Reverse-Trefferquote', wert: `${richtig} von ${reverseAntworten.length}` });
  }

  return pool;
}
