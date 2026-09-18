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
import type { Uebungsantwort, Uebungsform } from '../daten/schema/uebungsantwort';
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

/**
 * Fester Fallback, solange fuer eine Aufgabenform noch zu wenig eigene
 * Antwortzeit-Historie vorliegt (siehe `persoenlicheSchwelle` unten) — ohne
 * ihn waere die allererste Antwort einer Form immer "normal", weil ein
 * Median aus einem einzigen Wert nichts aussagt.
 */
export const LANGSAM_SCHWELLE_MS = 8000;

/**
 * Ab wie vielen eigenen richtigen Antworten derselben Form ein persoenlicher
 * Referenzwert die feste Schwelle abloest — Nutzergespraech 2026-09-17:
 * absolute Zeiten vermischen Person und Aufgabentyp ("1 aus 2 waehlen" ist
 * schneller als "aus 60 frei benennen"), deshalb der eigene Median statt
 * eines Werts fuer alle. Mit zu wenigen Antworten waere dieser Median aber
 * selbst nur Rauschen — dieselbe Vorsicht wie bei `KENNZAHL_MINDEST_STICHPROBE`
 * weiter unten, nur mit einer hoeheren Schwelle, weil eine Streuung (Median)
 * mehr Stichprobe braucht als eine reine Zaehlung.
 */
export const ANTWORTDAUER_MINDEST_STICHPROBE = 15;

/** Vielfaches des eigenen Medians, ab dem eine richtige Antwort "fuer diese Person, in dieser Form auffaellig langsam" gilt. */
const PERSOENLICHE_SCHWELLE_FAKTOR = 2;

function median(werte: readonly number[]): number {
  const sortiert = [...werte].sort((a, b) => a - b);
  const mitte = Math.floor(sortiert.length / 2);
  return sortiert.length % 2 === 0 ? (sortiert[mitte - 1]! + sortiert[mitte]!) / 2 : sortiert[mitte]!;
}

/**
 * Persoenliche Antwortzeit-Schwelle einer Aufgabenform: das Doppelte des
 * eigenen Medians unter den bisherigen RICHTIGEN Antworten dieser Form.
 * Getrennt je Form (nicht ein gemeinsamer Median ueber alle) — "familie",
 * "aromaInFamilie" und "freierAbruf" haben grundverschiedene Antwortzeiten,
 * ein gemeinsamer Wert wuerde die schnelle Form staendig als "auffaellig"
 * markieren und die langsame nie. Faellt auf `LANGSAM_SCHWELLE_MS` zurueck,
 * solange fuer diese Form weniger als `ANTWORTDAUER_MINDEST_STICHPROBE`
 * richtige Antworten mit Zeit vorliegen.
 */
function persoenlicheSchwelle(antworten: readonly Uebungsantwort[], form: Uebungsform): number {
  const zeiten = antworten
    .filter((a) => a.form === form && a.ergebnis === 'richtig' && a.antwortdauerMs !== undefined)
    .map((a) => a.antwortdauerMs!);
  if (zeiten.length < ANTWORTDAUER_MINDEST_STICHPROBE) return LANGSAM_SCHWELLE_MS;
  return median(zeiten) * PERSOENLICHE_SCHWELLE_FAKTOR;
}

export interface LangsameAntwort {
  readonly aromaId: string;
  readonly antwortdauerMs: number;
}

/**
 * Richtige Antworten mit auffällig langer Antwortdauer — ein Hinweis, kein
 * Urteil: lange Antwortzeit bei richtiger Antwort deutet auf Raten oder
 * starkes Zögern hin. Verändert bewusst nichts an der Box-Beförderung (siehe
 * Dateikopf) — reine Liste zum Ansehen. "Auffällig" heißt seit dem
 * Nutzergespräch 2026-09-17 "auffällig für diese Person, in dieser Form"
 * (`persoenlicheSchwelle`), nicht mehr ein einzelner Wert für alle.
 */
export function langsameRichtigeAntworten(antworten: readonly Uebungsantwort[]): readonly LangsameAntwort[] {
  const schwellenProForm = new Map<Uebungsform, number>();
  const schwelleFuer = (form: Uebungsform): number => {
    let schwelle = schwellenProForm.get(form);
    if (schwelle === undefined) {
      schwelle = persoenlicheSchwelle(antworten, form);
      schwellenProForm.set(form, schwelle);
    }
    return schwelle;
  };
  return antworten
    .filter((a) => a.ergebnis === 'richtig' && a.antwortdauerMs !== undefined && a.antwortdauerMs > schwelleFuer(a.form))
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

// ---- Verlaufskurven fuer die Statistik-Seite -------------------------------
//
// Aromapaket, Nachschaerfung (Livebetrieb-Rueckmeldung 2026-09-18): die
// Statistik zeigte bisher nur den aktuellen Stand, keine Entwicklung — "werde
// ich schneller, werde ich treffsicherer" liess sich nicht beantworten. Die
// Funktionen hier liefern rollierende Wochen-Eimer rueckwaerts von `jetzt`,
// kein Kalenderwochen-Reset (dieselbe Begruendung wie `wochenfortschritt`
// oben: "letzte X Wochen" bleibt immer aktuell).
//
// Wichtig, aus demselben Grund wie bei `persoenlicheSchwelle`: Zeit- und
// Trefferquoten-Verlauf trennen zwingend nach Aufgabenform. Die App erhoeht
// die Schwierigkeit automatisch, sobald ein Aroma sicherer sitzt (Stufe
// A -> B -> C, domain/uebung.ts::effektiverZustand) — eine gemischte Kurve
// zeigte echten Fortschritt als Stillstand oder sogar als Verschlechterung.

/** Kleinste Zahl richtiger Antworten in einem Wochen-Eimer, ab der ein Punkt gezeichnet wird (K64) — sonst waere ein Eimer mit einer Antwort nur Rauschen. */
export const VERLAUF_MINDEST_STICHPROBE_JE_WOCHE = 3;

/**
 * Wochen-Eimer rueckwaerts von `jetzt`: Eimer 0 sind die letzten 7 Tage,
 * Eimer 1 die sieben davor usw. — `wochen` Eimer insgesamt, aelteste zuerst
 * (fuer eine von links nach rechts steigende Kurve).
 */
function wochenEimer<T extends { zeitstempel: number }>(eintraege: readonly T[], jetzt: number, wochen: number): T[][] {
  const eimer: T[][] = Array.from({ length: wochen }, () => []);
  for (const eintrag of eintraege) {
    const alterMs = jetzt - eintrag.zeitstempel;
    if (alterMs < 0) continue;
    const index = Math.floor(alterMs / MS_PRO_WOCHE);
    if (index < wochen) eimer[wochen - 1 - index]!.push(eintrag);
  }
  return eimer;
}

export interface VerlaufsPunkt {
  readonly wert: number;
  /** Wochen vor `jetzt`, 0 = aelteste dargestellte Woche. Fuer die Achsenbeschriftung des Aufrufers, kein eigener Zeitstempel. */
  readonly wocheIndex: number;
}

/**
 * Median der Antwortdauer RICHTIGER Antworten einer Form, je rollierender
 * Woche — dieselbe "nur richtige Antworten zaehlen"-Regel wie bei
 * `langsameRichtigeAntworten`: eine schnelle falsche Antwort ist kein
 * Fortschritt. Wochen unter der Mindeststichprobe fehlen im Ergebnis
 * (kein Punkt statt eines aus zu wenig Werten geratenen).
 */
export function antwortzeitVerlauf(
  antworten: readonly Uebungsantwort[],
  form: Uebungsform,
  jetzt: number,
  wochen: number,
): readonly VerlaufsPunkt[] {
  const richtige = antworten.filter((a) => a.form === form && a.ergebnis === 'richtig' && a.antwortdauerMs !== undefined);
  return wochenEimer(richtige, jetzt, wochen)
    .map((eimer, wocheIndex) => ({ eimer, wocheIndex }))
    .filter(({ eimer }) => eimer.length >= VERLAUF_MINDEST_STICHPROBE_JE_WOCHE)
    .map(({ eimer, wocheIndex }) => ({ wert: median(eimer.map((a) => a.antwortdauerMs!)), wocheIndex }));
}

/** Trefferquote (0–1) einer Form, je rollierender Woche — "teilweise" zaehlt als halber Treffer, dieselbe Gewichtung wie sonst nirgends noetig, weil diese Funktion (anders als familienTrefferquote) auch Stufe C mit einschliesst. */
export function trefferquoteVerlauf(
  antworten: readonly Uebungsantwort[],
  form: Uebungsform,
  jetzt: number,
  wochen: number,
): readonly VerlaufsPunkt[] {
  const eigene = antworten.filter((a) => a.form === form && a.ergebnis !== undefined);
  return wochenEimer(eigene, jetzt, wochen)
    .map((eimer, wocheIndex) => ({ eimer, wocheIndex }))
    .filter(({ eimer }) => eimer.length >= VERLAUF_MINDEST_STICHPROBE_JE_WOCHE)
    .map(({ eimer, wocheIndex }) => {
      const punkte = eimer.reduce((summe, a) => summe + (a.ergebnis === 'richtig' ? 1 : a.ergebnis === 'teilweise' ? 0.5 : 0), 0);
      return { wert: punkte / eimer.length, wocheIndex };
    });
}

/**
 * Kumulativ: wie viele verschiedene Aromen wurden bis zum Ende jeder Woche
 * schon mindestens einmal richtig benannt (Stufe B/C, `getipptId` gesetzt —
 * Stufe A liefert keine Aroma-Identitaet, nur eine Familie). Waechst nie,
 * faellt aber auch nie — ein einmal gezeigtes Wissen zaehlt weiter, auch wenn
 * es spaeter vergessen wird (dafuer gibt es die Boxenverteilung).
 */
export function abdeckungVerlauf(antworten: readonly Uebungsantwort[], jetzt: number, wochen: number): readonly VerlaufsPunkt[] {
  const treffer = antworten.filter((a) => a.ergebnis === 'richtig' && (a.form === 'aromaInFamilie' || a.form === 'freierAbruf'));
  const eimer = wochenEimer(treffer, jetzt, wochen);
  const bekannt = new Set<string>();
  return eimer.map((woche, wocheIndex) => {
    for (const a of woche) bekannt.add(a.aromaId);
    return { wert: bekannt.size, wocheIndex };
  });
}

/** Durchgaenge (art "normal", Beginn) je rollierender Woche — fuer den "in welchem Rhythmus uebe ich"-Verlauf, ohne die Mindest-Trainingsgeschichte von zielfrequenzAbgleich(). */
export function volumenVerlauf(durchgaengeBegonnenAm: readonly number[], jetzt: number, wochen: number): readonly VerlaufsPunkt[] {
  const eintraege = durchgaengeBegonnenAm.map((zeitstempel) => ({ zeitstempel }));
  return wochenEimer(eintraege, jetzt, wochen).map((eimer, wocheIndex) => ({ wert: eimer.length, wocheIndex }));
}

// ---- Abdeckung nach Lernstufe -----------------------------------------------

export interface StufenVerteilung {
  readonly a: number;
  readonly b: number;
  readonly c: number;
}

/** Anzahl eingefuehrter Aromen je Lernstufe — reine Umsortierung von effektiverZustand()-Ergebnissen, keine eigene Rechnung. */
export function stufenverteilung(eingefuehrteZustaende: readonly { readonly stufe: 'a' | 'b' | 'c' }[]): StufenVerteilung {
  const verteilung: StufenVerteilung = { a: 0, b: 0, c: 0 };
  return eingefuehrteZustaende.reduce(
    (acc, z) => ({ ...acc, [z.stufe]: acc[z.stufe] + 1 }),
    verteilung,
  );
}

// ---- Schwaechste Aromen ------------------------------------------------------

export interface AromaQuote {
  readonly aromaId: string;
  readonly richtig: number;
  readonly versuche: number;
}

/**
 * Trefferquote je Aroma (nur als tatsaechliches Ziel gewertete Antworten,
 * "richtig"/"teilweise" als 0.5 wie trefferquoteVerlauf), niedrigste Quote
 * zuerst — "welche Aromen sollte ich mir vornehmen". Erst ab
 * `mindestVersuche`, sonst waere ein einziger Fehlversuch schon "0 %" und
 * stuende faelschlich oben.
 */
export function schwaechsteAromen(antworten: readonly Uebungsantwort[], mindestVersuche: number): readonly AromaQuote[] {
  const zaehler = new Map<string, { richtig: number; versuche: number }>();
  for (const a of antworten) {
    if (a.ergebnis === undefined) continue;
    const eintrag = zaehler.get(a.aromaId) ?? { richtig: 0, versuche: 0 };
    eintrag.versuche += 1;
    if (a.ergebnis === 'richtig') eintrag.richtig += 1;
    else if (a.ergebnis === 'teilweise') eintrag.richtig += 0.5;
    zaehler.set(a.aromaId, eintrag);
  }
  return [...zaehler.entries()]
    .map(([aromaId, e]) => ({ aromaId, richtig: e.richtig, versuche: e.versuche }))
    .filter((e) => e.versuche >= mindestVersuche)
    .sort((a, b) => a.richtig / a.versuche - b.richtig / b.versuche);
}

// ---- Kontrast/Reverse-Bilanz -------------------------------------------------

export interface UebungsartQuote {
  readonly richtig: number;
  readonly versuche: number;
}

/** Trefferquote fuer Kontrast- und Reverse-Durchgaenge getrennt — beide sind eigene Uebungsformen ohne Stufe (siehe daten/schema/uebungsantwort.ts), gehoeren deshalb nicht in familienTrefferquote() oder schwaechsteAromen(). */
export function uebungsartBilanz(antworten: readonly Uebungsantwort[]): { readonly kontrast: UebungsartQuote; readonly reverse: UebungsartQuote } {
  const bilanz = (form: 'kontrast' | 'reverse'): UebungsartQuote => {
    const eigene = antworten.filter((a) => a.form === form && a.ergebnis !== undefined);
    return { richtig: eigene.filter((a) => a.ergebnis === 'richtig').length, versuche: eigene.length };
  };
  return { kontrast: bilanz('kontrast'), reverse: bilanz('reverse') };
}

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
