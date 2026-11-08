/**
 * Uebungsmodus — Aromapaket, Etappe 6 (Neubau nach Lastenheft, docs/konzept.md
 * "Übungsmodus"). Ersetzt die erste Fassung (konzept.md, bis Paket 05): die
 * zeigte die Fläschchennummer vor der Antwort — wer regelmäßig übt, lernt
 * dabei die Nummer statt den Geruch. Diese Fassung kehrt die Reihenfolge um:
 * erst raten, dann ablesen.
 *
 * Reines TypeScript, kein idb, kein Svelte (tests/schichten.test.ts erzwingt
 * das) — jede Funktion bekommt ihre Daten explizit uebergeben, auch die
 * Kategorie (aus daten/aromen.ts). Der Zufall wird injiziert (Default
 * Math.random), damit die Auswahl selbst testbar ist, ohne echten Zufall
 * nachzubilden — ebenso `jetzt`, ohne Default.
 *
 * Fünf Teile:
 *  1. Trefferquote (bereinigteQuote/gesamtquote) — historisch aus der ersten
 *     Fassung, lebt weiter: sie füttert domain/leitner.ts::startBox bei der
 *     Übernahme eines Altbestands ohne `box`.
 *  2. Zusammenstellung eines Übungsdurchgangs (planeDurchgang) — welche
 *     zwölf Aromen verdeckt bereitliegen.
 *  3. Auswertung einer Antwort (werteAntwortAus) — Ergebnis und
 *     Leitner-Bewegung, nachdem die Nummer feststeht.
 *  4. Verwechslungspaare (verwechslungspaare) — welche Aromen sich ein
 *     Kontrastdurchgang vornehmen darf (Aromapaket, Etappe 7).
 *  5. Kontrastdurchgang (kontrastpaare, waehleDurchgangsart,
 *     werteKontrastAus) — bis zu vier Paare, eine Zuordnungsfrage je Paar,
 *     gewertet am Verwechslungszähler statt an der Box.
 */
import type { Uebungsart, UebungStufe } from '../daten/schema/uebung';
import { UEBUNGSARTEN } from '../daten/schema/uebung';
import type { Uebungsergebnis } from '../daten/schema/uebungsantwort';
import type { Box } from './leitner';
import { startBox, istEingefuehrt, einfuehrungErlaubt, bewegeBox, naechsteFaelligkeit, starkUeberfaellig, istZaeh } from './leitner';

export interface AromaOption {
  readonly id: string;
  readonly label: string;
  readonly nummer?: number;
  /** Id der SCA-Kategorie (daten/aromen.ts) — die Familie aus dem Lastenheft. */
  readonly kategorieId?: string;
  /** Ids der laut Datenblatt verwandten Aromen — Rohstoff für den Kontrastdurchgang (Etappe 4). */
  readonly verwandte?: readonly string[];
}

export interface TrefferStand {
  readonly versuche: number;
  readonly treffer: number;
}

/** Der volle Uebungsstand eines Aromas — eine Zahl je Aufgabenart plus Verwechslungen. */
export interface GesamtStand {
  readonly benennen: TrefferStand;
  readonly unterscheiden: TrefferStand;
  /** Id des stattdessen getippten Aromas -> wie oft (nur bei "benennen" befuellt). */
  readonly verwechslungen: Readonly<Record<string, number>>;
  readonly letzterVersuch?: number;
  // Aromapaket, Etappe 6 — Leitner-Zustand aus daten/schema/uebung.ts, hier
  // durchgereicht statt neu erfunden. Optional: fehlt bei einem Altbestand,
  // der noch nicht migriert ist (siehe effektiverZustand() unten).
  readonly box?: Box;
  readonly faellig?: number;
  readonly stufe?: UebungStufe;
  readonly familienSerie?: number;
  // Stufenlogik-Nachzug (2026-11-08) — siehe werteAntwortAus(). Alle optional:
  // ein Datensatz von vorher kennt sie nicht und startet bei 0.
  readonly abrufSerie?: number;
  readonly abrufSerieZuletzt?: number;
  readonly familieFalschSerie?: number;
  readonly fehlerSerie?: number;
}

// ---- Trefferquote, um den Zufall bereinigt -------------------------------

/** Wie viele Optionen im Schnitt zur Wahl stehen, je alter Aufgabenart — 1 aus 60 ist praktisch kein Raten. */
const RATEWAHRSCHEINLICHKEIT: Record<Uebungsart, number> = {
  benennen: 1 / 60,
  unterscheiden: 1 / 2,
};

/**
 * Trefferquote einer einzelnen Aufgabenart, bereinigt um die
 * Ratewahrscheinlichkeit dieser Art — sonst saehe "9 von 11" bei
 * "Unterscheiden" (1 aus 2) nach Koennen aus, obwohl Muenzwurf schon 5,5
 * ergibt. Nie negativ: eine Quote unter dem Zufallsniveau zaehlt als 0, nicht
 * als Minus.
 */
export function bereinigteQuote(stand: TrefferStand, art: Uebungsart): number {
  if (stand.versuche === 0) return 0;
  const roh = stand.treffer / stand.versuche;
  const rate = RATEWAHRSCHEINLICHKEIT[art];
  return Math.max(0, (roh - rate) / (1 - rate));
}

/**
 * Eine Sicherheit ueber beide Aufgabenarten, gewichtet nach Versuchen je Art
 * — eine Art mit 20 Versuchen sagt mehr als eine mit 2. Ohne jeden Versuch: 0
 * (wie ein nie geuebtes Aroma). Historische Groesse aus der ersten Fassung —
 * lebt weiter als Eingabe fuer domain/leitner.ts::startBox.
 */
export function gesamtquote(stand: GesamtStand): number {
  let versucheGesamt = 0;
  let summe = 0;
  for (const art of UEBUNGSARTEN) {
    const s = stand[art];
    versucheGesamt += s.versuche;
    summe += bereinigteQuote(s, art) * s.versuche;
  }
  return versucheGesamt === 0 ? 0 : summe / versucheGesamt;
}

// ---- Kleiner Zufallshelfer, injizierbar wie ueberall hier -----------------

/** Fisher-Yates mit injiziertem Zufall — Reihenfolgen sollen nicht immer gleich stehen (echte Zufallsreihenfolge, keine Blöcke). */
function gemischt<T>(liste: readonly T[], zufall: () => number): T[] {
  const kopie = [...liste];
  for (let i = kopie.length - 1; i > 0; i--) {
    const j = Math.floor(zufall() * (i + 1));
    [kopie[i], kopie[j]] = [kopie[j]!, kopie[i]!];
  }
  return kopie;
}

// ============================================================================
// Zusammenstellung eines Übungsdurchgangs — welche zwölf Aromen verdeckt
// bereitliegen (acht abgefragt, vier Zusatzfläschchen).
// ============================================================================

/** Der aufgelöste Leitner-Zustand eines Aromas — Altbestand ohne `box`/`stufe` eingerechnet. */
export interface EffektiverZustand {
  readonly box: Box;
  readonly faellig: number;
  readonly stufe: UebungStufe;
  readonly eingefuehrt: boolean;
  /** Siehe domain/leitner.ts::ZAEH_SCHWELLE — zählt nicht für die Einführungssperre. */
  readonly zaeh: boolean;
}

const LEERER_STAND: GesamtStand = {
  benennen: { versuche: 0, treffer: 0 },
  unterscheiden: { versuche: 0, treffer: 0 },
  verwechslungen: {},
};

/**
 * Löst den gespeicherten Stand eines Aromas in seinen tatsächlichen
 * Leitner-Zustand auf. Ein Altbestand ohne `box` bekommt seine Startbox aus
 * der historischen Trefferquote (`domain/leitner.ts::startBox`) — aber nur,
 * wenn er überhaupt schon eingeführt ist; ein nie geübtes Aroma landet immer
 * auf Box 1, unabhängig von seiner (dann ohnehin leeren) Quote. Ein Aroma
 * ohne `faellig` gilt als sofort fällig — es war noch nie in der neuen
 * Mechanik dran.
 */
export function effektiverZustand(stand: GesamtStand | undefined, jetzt: number): EffektiverZustand {
  const s = stand ?? LEERER_STAND;
  const eingefuehrt = istEingefuehrt(s);
  const box = s.box ?? (eingefuehrt ? startBox(s) : 1);
  const faellig = s.faellig ?? jetzt;
  const stufe = s.stufe ?? 'a';
  return { box, faellig, stufe, eingefuehrt, zaeh: istZaeh(s.fehlerSerie ?? 0) };
}

/** Rundengröße aus dem Lastenheft, Abschnitt 6 — acht abgefragte Items je Durchgang. */
export const DURCHGANG_GROESSE = 8;

/**
 * Gesamtgröße der verdeckt bereitgelegten Menge (Lastenheft Abschnitt 2:
 * "Beutelgröße ≈ Rundengröße × 1,5, mindestens +3"). Bei acht Abgefragten
 * macht das zwölf — vier Zusatzfläschchen, die nie geöffnet werden und die
 * Restunsicherheit bis zum letzten Item aufrechthalten.
 */
export function verdeckteGesamtgroesse(durchgangsGroesse: number = DURCHGANG_GROESSE): number {
  return Math.max(Math.round(durchgangsGroesse * 1.5), durchgangsGroesse + 3);
}

export interface DurchgangsPlan {
  /** Die acht (bzw. `durchgangsGroesse`) tatsächlich abgefragten Aromen, in Ziehreihenfolge — bereits gemischt, keine Blöcke. */
  readonly abgefragt: readonly AromaOption[];
  /** Die nie geöffneten Zusatzfläschchen — werden nie aufgelöst. */
  readonly zusatz: readonly AromaOption[];
}

interface Kandidat {
  readonly option: AromaOption;
  readonly stand: GesamtStand | undefined;
  readonly zustand: EffektiverZustand;
}

const ANTEIL_NIEDRIG = 0.5; // Box 1-2, faellig
const ANTEIL_NEU = 0.2;
const NEU_MAX = 2; // Lastenheft Abschnitt 6: "maximal 2 pro Sitzung"

/** Ab wie vielen Verwechslungen mit demselben Aroma gilt sie als auffällig genug, um bevorzugt zu werden bzw. einen Kontrastdurchgang (Etappe 4) freizuschalten. */
const SCHWELLE_VERWECHSLUNGSPARTNER = 2;

/** Der am stärksten dokumentierte Verwechslungspartner eines Aromas, wenn er die Schwelle erreicht — sonst undefined. */
function staerksterPartnerId(stand: GesamtStand | undefined): string | undefined {
  if (!stand) return undefined;
  let bestId: string | undefined;
  let bestAnzahl = 0;
  for (const [id, anzahl] of Object.entries(stand.verwechslungen)) {
    if (anzahl > bestAnzahl) {
      bestId = id;
      bestAnzahl = anzahl;
    }
  }
  return bestAnzahl >= SCHWELLE_VERWECHSLUNGSPARTNER ? bestId : undefined;
}

/**
 * Sortiert einen Kandidatenpool nach "am längsten überfällig zuerst"
 * (Lastenheft Abschnitt 7), mit einem Vorzug davor: **beide** Hälften eines
 * dokumentierten Verwechslungspaares rücken gemeinsam nach vorn, wenn beide
 * im selben Pool stehen (Lastenheft Abschnitt 6, "verwechselte Paare
 * bevorzugt in denselben Durchgang") — nicht nur die Seite, die die
 * Verwechslung eingetragen hat, sonst würde genau der Partner ausgeschlossen
 * bleiben, um dessentwillen der Vorzug überhaupt existiert. Wirkt bewusst
 * nur innerhalb einer Box-Kategorie (Niedrig/Hoch) — ein Vorzug über
 * Kategorien hinweg würde die 50/30/20-Mischung verwässern, die selbst
 * schon eine Absicht ist.
 */
function nachUeberfaelligkeitMitVerwechslungsvorzug(kandidaten: readonly Kandidat[], jetzt: number): Kandidat[] {
  const idsImPool = new Set(kandidaten.map((k) => k.option.id));
  const gepaart = new Set<string>();
  for (const k of kandidaten) {
    const partnerId = staerksterPartnerId(k.stand);
    if (partnerId && idsImPool.has(partnerId)) {
      gepaart.add(k.option.id);
      gepaart.add(partnerId);
    }
  }
  return [...kandidaten].sort((a, b) => {
    const aVorzug = gepaart.has(a.option.id) ? 0 : 1;
    const bVorzug = gepaart.has(b.option.id) ? 0 : 1;
    if (aVorzug !== bVorzug) return aVorzug - bVorzug;
    return jetzt - a.zustand.faellig - (jetzt - b.zustand.faellig); // absteigend: am laengsten ueberfaellig zuerst
  });
}

/**
 * Stellt einen Übungsdurchgang zusammen: acht abgefragte Aromen aus der
 * Mischung ~50 % fällig Box 1–2, ~30 % fällig Box 3–5, ~20 % (max. 2) neu
 * (Lastenheft Abschnitt 6), plus die Zusatzfläschchen bis zur vollen
 * verdeckten Menge. `alleAromen` ist bewusst der volle Bestand, nicht nur
 * die eingeführten — nur so lässt sich "noch nie dran" überhaupt feststellen.
 *
 * Reine Auswahl, kein Rendern: das Ergebnis nennt nur, *welche* Aromen
 * gezogen werden. Was der Bildschirm daraus an Fragen macht (Familie,
 * Aroma-in-Familie, freier Abruf — je nach `effektiverZustand(...).stufe`
 * des einzelnen Aromas beim Planen), entscheidet der Aufrufer. Insbesondere
 * baut diese Funktion **keine** Liste von Namen für eine Auswahl im
 * Bildschirm — die Antwort-/Nummernliste dort umfasst immer alle 60, sonst
 * verriete ihre Kürzung den Kandidatenkreis (CLAUDE.md, "Übungsmodus:
 * verdecktes Ziehen, keine offene Nummer").
 */
export function planeDurchgang(
  alleAromen: readonly AromaOption[],
  staende: ReadonlyMap<string, GesamtStand>,
  jetzt: number,
  durchgangsGroesse: number = DURCHGANG_GROESSE,
  zufall: () => number = Math.random,
  /**
   * Aromen aus den eigenen Verkostungen (Kaffee-Brücke, domain/
   * kaffeebruecke.ts): werden zuerst *eingeführt*. Auf eingeführte Aromen
   * wirkt das nicht — deren Abfrage folgt allein der Fälligkeit.
   */
  bevorzugt: ReadonlySet<string> = new Set(),
): DurchgangsPlan {
  const kandidaten: Kandidat[] = alleAromen.map((option) => {
    const stand = staende.get(option.id);
    return { option, stand, zustand: effektiverZustand(stand, jetzt) };
  });

  const eingefuehrt = kandidaten.filter((k) => k.zustand.eingefuehrt);
  const nichtEingefuehrt = kandidaten.filter((k) => !k.zustand.eingefuehrt);

  const faelligNiedrig = eingefuehrt.filter((k) => k.zustand.box <= 2 && k.zustand.faellig <= jetzt);
  const faelligHoch = eingefuehrt.filter((k) => k.zustand.box >= 3 && k.zustand.faellig <= jetzt);
  // Fallback, falls insgesamt zu wenige faellige Aromen vorhanden sind (z. B.
  // ganz am Anfang) — sonst kaeme ein Durchgang nie auf seine Groesse.
  // Aufsteigend nach Faelligkeit: am wenigsten verfrueht zuerst.
  const nichtFaellig = [...eingefuehrt].filter((k) => k.zustand.faellig > jetzt).sort((a, b) => a.zustand.faellig - b.zustand.faellig);

  const niedrigSortiert = nachUeberfaelligkeitMitVerwechslungsvorzug(faelligNiedrig, jetzt);
  const hochSortiert = nachUeberfaelligkeitMitVerwechslungsvorzug(faelligHoch, jetzt);

  const neuErlaubt = einfuehrungErlaubt(eingefuehrt.filter((k) => !k.zustand.zaeh).map((k) => k.zustand.box));
  const zielNeu = neuErlaubt ? Math.min(NEU_MAX, Math.round(durchgangsGroesse * ANTEIL_NEU), nichtEingefuehrt.length) : 0;
  const neu = [
    ...gemischt(nichtEingefuehrt.filter((k) => bevorzugt.has(k.option.id)), zufall),
    ...gemischt(nichtEingefuehrt.filter((k) => !bevorzugt.has(k.option.id)), zufall),
  ].slice(0, zielNeu);

  const zielNiedrig = Math.min(niedrigSortiert.length, Math.round(durchgangsGroesse * ANTEIL_NIEDRIG));
  const genommenNiedrig = niedrigSortiert.slice(0, zielNiedrig);

  const restNachNiedrig = durchgangsGroesse - neu.length - genommenNiedrig.length;
  const genommenHoch = hochSortiert.slice(0, Math.max(0, restNachNiedrig));

  const ausgewaehlt: Kandidat[] = [...neu, ...genommenNiedrig, ...genommenHoch];

  // Rückstau-Auffüllung, am längsten überfällig zuerst: erst mit weiteren
  // fälligen Kandidaten (aus welcher Box auch immer noch übrig ist), dann
  // mit dem nicht-fälligen Fallback, zuletzt notfalls mit nicht eingeführten
  // Aromen — Letzteres nur relevant bei einem winzigen Bestand (Tests, ganz
  // neue Installation mit wenigen Aromen), nicht im Regelbetrieb bei 60.
  const fuelleAuf = (pool: readonly Kandidat[]) => {
    if (ausgewaehlt.length >= durchgangsGroesse) return;
    const bereits = new Set(ausgewaehlt.map((k) => k.option.id));
    for (const k of pool) {
      if (ausgewaehlt.length >= durchgangsGroesse) break;
      if (bereits.has(k.option.id)) continue;
      ausgewaehlt.push(k);
      bereits.add(k.option.id);
    }
  };
  fuelleAuf([...niedrigSortiert, ...hochSortiert]);
  fuelleAuf(nichtFaellig);
  fuelleAuf(nichtEingefuehrt);

  const abgefragt = gemischt(ausgewaehlt, zufall).map((k) => k.option);

  // Zusatzfläschchen: aus allen Boxen, unabhängig von Fälligkeit — ihre
  // Zusammensetzung darf nichts über die acht Abgefragten verraten
  // (Lastenheft Abschnitt 6). Bevorzugt aus eingeführten Aromen; nur bei
  // einem sehr kleinen Bestand faellt der Pool auf alle uebrigen zurueck.
  const gewaehlteIds = new Set(ausgewaehlt.map((k) => k.option.id));
  const zusatzAnzahl = verdeckteGesamtgroesse(durchgangsGroesse) - durchgangsGroesse;
  const zusatzPoolEingefuehrt = eingefuehrt.filter((k) => !gewaehlteIds.has(k.option.id));
  const zusatzPool =
    zusatzPoolEingefuehrt.length >= zusatzAnzahl ? zusatzPoolEingefuehrt : kandidaten.filter((k) => !gewaehlteIds.has(k.option.id));
  const zusatz = gemischt(zusatzPool, zufall)
    .slice(0, Math.min(zusatzAnzahl, zusatzPool.length))
    .map((k) => k.option);

  return { abgefragt, zusatz };
}

/**
 * Reverse-Vorschlag für die Übungsmodus-Übersicht (Aromapaket, Etappe 9 —
 * Julians eigener Vorschlag: "Aromen für Reverse vorschlagen, bei denen man
 * sich schwer tut"). Schwertun heißt hier: niedrigste Box unter den
 * eingeführten Aromen — dieselbe Bedeutung, die "schwierig" im übrigen
 * Aromapaket schon hat (planeDurchgang bevorzugt genau diese Aromen). Bei
 * mehreren Kandidaten auf derselben Box wird zufällig gezogen. Ohne
 * eingeführtes Aroma: kein Vorschlag.
 */
export function reverseVorschlag(
  alleAromen: readonly AromaOption[],
  staende: ReadonlyMap<string, GesamtStand>,
  jetzt: number,
  zufall: () => number = Math.random,
): AromaOption | undefined {
  const eingefuehrt = alleAromen
    .map((option) => ({ option, zustand: effektiverZustand(staende.get(option.id), jetzt) }))
    .filter((k) => k.zustand.eingefuehrt);
  if (eingefuehrt.length === 0) return undefined;

  const niedrigsteBox = Math.min(...eingefuehrt.map((k) => k.zustand.box));
  const kandidaten = eingefuehrt.filter((k) => k.zustand.box === niedrigsteBox);
  return gemischt(kandidaten, zufall)[0]!.option;
}

// ============================================================================
// Auswertung einer Antwort — nachdem die Nummer feststeht.
// ============================================================================

/**
 * Was eine Antwort ausmacht: `formStufe` bestimmt die gezeigte Form (Familie
 * / Familie-dann-Aroma / freier Abruf), festgelegt *vor* dem Riechen, weil
 * die App da noch nicht wissen kann, welches der zwölf verdeckten Fläschchen
 * gleich gezogen wird. **`formStufe` ist keine Vorhersage, welches Aroma
 * gezogen wird** — bei einem echten blinden Griff aus zwölf ununterscheid-
 * baren Fläschchen ist das sogar der Regelfall: praktisch jeder Griff trifft
 * ein anderes Aroma als das, dessen Stufe zufällig die Form dieses Platzes
 * bestimmt hat. Deshalb trennt die Auswertung zwei Dinge (siehe
 * `AntwortAuswertung`): ob die *gezeigte Frage* richtig beantwortet wurde,
 * und was das über die *Stufe des tatsächlichen Aromas* aussagt.
 */
export interface AntwortEingabe {
  readonly formStufe: UebungStufe;
  /** Getippte Familie — bei Form A und B gefragt, bei C nicht vorhanden. */
  readonly tipFamilieId?: string;
  /** Getipptes Aroma — bei Form B (nach Familienwahl) und C gefragt, bei A nicht vorhanden. */
  readonly tipAromaId?: string;
  /**
   * Familie des getippten Aromas. Bei Form C die einzige Quelle für ein
   * Familienurteil (gefragt wird dort keine Familie, aber das getippte Aroma
   * hat eine) — gebraucht, wenn das tatsächliche Aroma erst auf Stufe A/B
   * steht, und für den Rückweg von C nach B.
   */
  readonly tipAromaFamilieId?: string;
  /** "nur geraten" — ein Treffer zählt dann wie ein Teilerfolg. */
  readonly geraten?: boolean;
  readonly tatsaechlicheAromaId: string;
  readonly tatsaechlicheFamilieId: string | undefined;
  readonly tatsaechlicherStand: GesamtStand | undefined;
}

/**
 * Was eine Antwort für die Leitner-Mechanik bedeutet — gegen die Stufe des
 * **tatsächlichen** Aromas, nicht gegen die gezeigte Form:
 *
 * - `richtig` / `teilweise` / `falsch` wie gehabt (Box hoch / eine runter / auf 1).
 * - `ohneAussage`: die gezeigte Frage war leichter als die Stufe des Aromas
 *   und wurde richtig beantwortet. Das beweist nichts über die eigentliche
 *   Stufe — Box, Fälligkeit und Serien bleiben stehen, das Aroma bleibt fällig.
 * - `aufgefrischt`: lange liegen geblieben (`starkUeberfaellig`), auf der
 *   eigenen Stufe nicht gewusst, aber auf der Stufe darunter — Box 2, bald
 *   wieder dran, ohne den Rückfall auf 1.
 */
export type Wertung = Uebungsergebnis | 'ohneAussage' | 'aufgefrischt';

export interface AntwortAuswertung {
  /** Ob die gezeigte Frage richtig beantwortet wurde — für die Anzeige und das Protokoll (`uebungsantwort`). */
  readonly ergebnis: Uebungsergebnis;
  /** Was das für das tatsächliche Aroma heißt — bewegt Box und Stufe. */
  readonly wertung: Wertung;
  readonly box: Box;
  readonly faellig: number;
  readonly stufe: UebungStufe;
  /** Gesetzt, wenn sich die Stufe mit dieser Antwort geändert hat. */
  readonly stufenwechsel?: 'auf' | 'ab';
  readonly familienSerie: number;
  readonly abrufSerie: number;
  readonly abrufSerieZuletzt?: number;
  readonly familieFalschSerie: number;
  readonly fehlerSerie: number;
  /** true, wenn das Aroma mit dieser Antwort zum ersten Mal überhaupt dran war. */
  readonly erstkontakt: boolean;
}

/** Ab wie vielen Treffern in Folge (Stufe A, Familie) auf Stufe B geschaltet wird — Lastenheft Abschnitt 3. */
const FAMILIENSERIE_SCHWELLE = 3;
/** Ab wie vielen Treffern (Stufe B, zeitlich getrennt) auf Stufe C geschaltet wird. */
const ABRUFSERIE_SCHWELLE = 2;
/** Mindestabstand zwischen zwei Treffern, die für den Aufstieg B → C zählen — zwei Durchgänge am selben Abend sind einer. */
const ABRUFSERIE_MINDESTABSTAND_MS = 12 * 60 * 60 * 1000;
/** Ab wie vielen Antworten in Folge mit falscher Familie ein Aroma von C auf B zurückfällt. */
const RUECKWEG_SCHWELLE = 2;
/** Box nach einem Stufenwechsel nach oben: eine schwerere Abrufform ist eine neue Karte, aber nicht bei null. */
const BOX_NACH_AUFSTIEG: Box = 2;

const STUFE_DARUNTER: Record<UebungStufe, UebungStufe | undefined> = { a: undefined, b: 'a', c: 'b' };
const STUFE_DARUEBER: Record<UebungStufe, UebungStufe | undefined> = { a: 'b', b: 'c', c: undefined };
const RANG: Record<UebungStufe, number> = { a: 0, b: 1, c: 2 };

/**
 * Wertet die Antwort gegen eine bestimmte Stufe — mit dem, was die Antwort
 * hergibt. Form C enthält ein Aroma und damit auch dessen Familie, Form A
 * nur eine Familie. War die Form leichter als die Stufe, kann ein Treffer
 * nichts beweisen (`ohneAussage`); ein Fehler in leichterer Form zählt voll.
 */
function wertungGegenStufe(stufe: UebungStufe, form: UebungStufe, familieRichtig: boolean, aromaRichtig: boolean | undefined): Uebungsergebnis | 'ohneAussage' {
  if (RANG[form] < RANG[stufe]) {
    const gezeigteFrageRichtig = form === 'a' ? familieRichtig : aromaRichtig === true;
    return gezeigteFrageRichtig ? 'ohneAussage' : 'falsch';
  }
  switch (stufe) {
    case 'a':
      return familieRichtig ? 'richtig' : 'falsch';
    case 'b':
      return aromaRichtig ? 'richtig' : familieRichtig ? 'teilweise' : 'falsch';
    case 'c':
      return aromaRichtig ? 'richtig' : 'falsch';
  }
}

/**
 * Wertet eine Antwort aus, **nachdem** die Nummer bekannt ist — vorher kann
 * die App nicht wissen, gegen welches Aroma sie überhaupt prüft. Konzept:
 * docs/konzept.md, Übungsmodus, "Gewertet wird gegen die Stufe des
 * gezogenen Aromas".
 */
export function werteAntwortAus(eingabe: AntwortEingabe, jetzt: number): AntwortAuswertung {
  const { formStufe, tipFamilieId, tipAromaId, tipAromaFamilieId, geraten, tatsaechlicheAromaId, tatsaechlicheFamilieId, tatsaechlicherStand } =
    eingabe;
  const zustand = effektiverZustand(tatsaechlicherStand, jetzt);
  const getippteFamilie = tipFamilieId ?? tipAromaFamilieId;
  const familieRichtig = getippteFamilie !== undefined && getippteFamilie === tatsaechlicheFamilieId;
  const aromaRichtig = formStufe === 'a' ? undefined : tipAromaId === tatsaechlicheAromaId;

  // 1. Die gezeigte Frage — unverändert gegenüber der ersten Fassung.
  const ergebnis: Uebungsergebnis =
    formStufe === 'a'
      ? familieRichtig
        ? 'richtig'
        : 'falsch'
      : aromaRichtig
        ? 'richtig'
        : formStufe === 'b' && familieRichtig
          ? 'teilweise'
          : 'falsch';

  // 2. Gegen die Stufe des tatsächlichen Aromas.
  let wertung: Wertung = wertungGegenStufe(zustand.stufe, formStufe, familieRichtig, aromaRichtig);
  if (wertung === 'richtig' && geraten) wertung = 'teilweise';
  const darunter = STUFE_DARUNTER[zustand.stufe];
  if (wertung !== 'richtig' && !geraten && darunter && starkUeberfaellig(zustand.box, zustand.faellig, jetzt)) {
    if (wertungGegenStufe(darunter, formStufe, familieRichtig, aromaRichtig) === 'richtig') wertung = 'aufgefrischt';
  }

  // 3. Box und Fälligkeit.
  let box: Box;
  let faellig: number;
  if (wertung === 'ohneAussage') {
    box = zustand.box;
    faellig = zustand.faellig;
  } else {
    box = wertung === 'aufgefrischt' ? 2 : bewegeBox(zustand.box, wertung);
    faellig = naechsteFaelligkeit(box, jetzt);
  }

  // 4. Serien und Stufenwechsel.
  let stufe = zustand.stufe;
  let stufenwechsel: 'auf' | 'ab' | undefined;
  let familienSerie = tatsaechlicherStand?.familienSerie ?? 0;
  let abrufSerie = tatsaechlicherStand?.abrufSerie ?? 0;
  let abrufSerieZuletzt = tatsaechlicherStand?.abrufSerieZuletzt;
  let familieFalschSerie = tatsaechlicherStand?.familieFalschSerie ?? 0;
  let fehlerSerie = tatsaechlicherStand?.fehlerSerie ?? 0;

  if (wertung === 'richtig') fehlerSerie = 0;
  else if (wertung === 'teilweise' || wertung === 'falsch') fehlerSerie += 1;

  if (stufe === 'a' && wertung !== 'ohneAussage') {
    familienSerie = wertung === 'richtig' ? familienSerie + 1 : 0;
    if (familienSerie >= FAMILIENSERIE_SCHWELLE) stufenwechsel = 'auf';
  } else if (stufe === 'b' && wertung !== 'ohneAussage') {
    if (wertung === 'richtig') {
      if (abrufSerieZuletzt === undefined || jetzt - abrufSerieZuletzt >= ABRUFSERIE_MINDESTABSTAND_MS) {
        abrufSerie += 1;
        abrufSerieZuletzt = jetzt;
      }
    } else {
      abrufSerie = 0;
      abrufSerieZuletzt = undefined;
    }
    if (abrufSerie >= ABRUFSERIE_SCHWELLE) stufenwechsel = 'auf';
  } else if (stufe === 'c') {
    // Die Familie ist in jeder Form bekannt (bei C über das getippte Aroma).
    familieFalschSerie = familieRichtig ? 0 : familieFalschSerie + 1;
    if (familieFalschSerie >= RUECKWEG_SCHWELLE) stufenwechsel = 'ab';
  }

  if (stufenwechsel) {
    stufe = (stufenwechsel === 'auf' ? STUFE_DARUEBER[stufe] : STUFE_DARUNTER[stufe])!;
    familienSerie = 0;
    abrufSerie = 0;
    abrufSerieZuletzt = undefined;
    familieFalschSerie = 0;
    fehlerSerie = 0;
    if (stufenwechsel === 'auf') {
      box = BOX_NACH_AUFSTIEG;
      faellig = naechsteFaelligkeit(box, jetzt);
    }
  }

  return {
    ergebnis,
    wertung,
    box,
    faellig,
    stufe,
    stufenwechsel,
    familienSerie,
    abrufSerie,
    abrufSerieZuletzt,
    familieFalschSerie,
    fehlerSerie,
    erstkontakt: !zustand.eingefuehrt,
  };
}

// ============================================================================
// Nachriechen — nach einer falschen Antwort das Fläschchen noch einmal, jetzt
// mit Namen (Etappe 2 des Lern-Nachzugs, docs/konzept.md "Nachriechen").
// ============================================================================

/**
 * Höchstens so viele Riechvorgänge je Übungsdurchgang (abgefragte
 * Fläschchen plus Nachriechen). Das Lastenheft setzte 10; angehoben auf 12,
 * damit nach Fehlern nachgerochen werden kann, ohne die Zahl der Abfragen zu
 * senken. Klinische Identifikationstests (Sniffin' Sticks) arbeiten mit 16
 * Gerüchen in einer Sitzung — 12 bleibt deutlich darunter.
 */
export const RIECHGRENZE = 12;

/**
 * Ob nach dieser Auflösung zum Nachriechen aufgefordert wird: wenn die
 * gezeigte Frage nicht richtig beantwortet wurde, oder die Wertung für das
 * Aroma kein voller Treffer war (geraten, aufgefrischt). Genau dort fehlt
 * die Verknüpfung von Name und Geruch — und eine Bezeichnung hilft dem
 * Geruchsgedächtnis nur, wenn sie beim Riechen da ist (Frank et al. 2010).
 * Nach einem echten Treffer wäre es ein Riechvorgang ohne Lerngewinn, der
 * gegen die Grenze zählt.
 */
export function nachriechenAngebracht(
  auswertung: Pick<AntwortAuswertung, 'ergebnis' | 'wertung'> & { readonly erstkontakt?: boolean },
  bisherNachgerochen: number,
  durchgangsGroesse: number = DURCHGANG_GROESSE,
): boolean {
  // Beim ersten Kontakt immer: auch ein Zufallstreffer (Familie 1 zu 9)
  // hiesse sonst, das Aroma nie bewusst mit Namen gerochen zu haben.
  const lueckeDa =
    auswertung.erstkontakt === true ||
    auswertung.ergebnis !== 'richtig' || auswertung.wertung === 'teilweise' || auswertung.wertung === 'falsch' || auswertung.wertung === 'aufgefrischt';
  return lueckeDa && durchgangsGroesse + bisherNachgerochen < RIECHGRENZE;
}

// ============================================================================
// Verwechslungspaare — welche Aromen sich ein Kontrastdurchgang vornehmen
// darf (Aromapaket, Etappe 7).
// ============================================================================

/** Ab wie vielen dokumentierten Verwechslungen ein Paar für einen Kontrastdurchgang infrage kommt — Lastenheft Abschnitt 8. */
export const KONTRASTDURCHGANG_SCHWELLE = 3;

export interface Verwechslungspaar {
  readonly aId: string;
  readonly bId: string;
  /** Die höhere der beiden Richtungen — siehe verwechslungspaare(). */
  readonly anzahl: number;
}

/**
 * Alle Verwechslungspaare, die die Schwelle erreichen, absteigend nach
 * Häufigkeit — die Grundlage dafür, welchen Kontrastdurchgang die App
 * anbietet. Liest `GesamtStand.verwechslungen` direkt (dieselbe laufend
 * gepflegte Liste, die schon `planeDurchgang` für den Verwechslungsvorzug
 * nutzt) statt eine eigene Auswertung aus `Uebungsantwort` aufzubauen — die
 * ausführlichere, gerichtete Verwechslungsmatrix aus dem Antwortprotokoll
 * ist Sache von domain/uebungsauswertung.ts (Etappe 8), nicht dieser hier.
 *
 * Eine Verwechslung kann in beide Richtungen dokumentiert sein (A tippt B,
 * UND B tippt A) — das zählt als **ein** Paar, nicht zwei, mit der höheren
 * der beiden Zahlen. Eine Summe wäre hier falsch: sie würde ein Paar, bei
 * dem nur eine Richtung tatsächlich oft verwechselt wird, künstlich
 * aufwerten.
 */
export function verwechslungspaare(staende: ReadonlyMap<string, GesamtStand>): readonly Verwechslungspaar[] {
  const gesehen = new Set<string>();
  const paare: Verwechslungspaar[] = [];
  for (const [aId, stand] of staende) {
    for (const [bId, anzahlHin] of Object.entries(stand.verwechslungen)) {
      const schluessel = [aId, bId].sort().join('|');
      if (gesehen.has(schluessel)) continue;
      gesehen.add(schluessel);
      const anzahlRueck = staende.get(bId)?.verwechslungen[aId] ?? 0;
      const anzahl = Math.max(anzahlHin, anzahlRueck);
      if (anzahl >= KONTRASTDURCHGANG_SCHWELLE) paare.push({ aId, bId, anzahl });
    }
  }
  return paare.sort((a, b) => b.anzahl - a.anzahl);
}

// ============================================================================
// Kontrastdurchgang mit mehreren Paaren (Etappe 3 des Lern-Nachzugs,
// docs/konzept.md "Kontrastdurchgang").
// ============================================================================

/** Höchstens so viele Paare je Kontrastdurchgang — 8 Riechvorgänge, Rest der Riechgrenze fürs Nachriechen. */
export const KONTRAST_PAARE_MAX = 4;
/** Ab so vielen verfügbaren Paaren darf die App einen Kontrastdurchgang von sich aus wählen. */
export const KONTRAST_PAARE_MIN_ZUFALL = 3;
/** Anteil der Durchgänge, die die App als Kontrast wählt, wenn genug Paare da sind. */
export const KONTRAST_ANTEIL = 0.25;

export interface Kontrastpaar {
  readonly aId: string;
  readonly bId: string;
  /**
   * Woher das Paar kommt — zugleich die Rangfolge: belegte Verwechslungen
   * zuerst, dann zähe Aromen mit ihrem nächsten Nachbarn, dann vorbeugend
   * verwandte Aromen (Datenblatt "Related Aromas"), bevor sie verwechselt werden.
   */
  readonly quelle: 'verwechslung' | 'zaeh' | 'verwandt';
}

/**
 * Stellt bis zu `max` Paare zusammen. **Jedes Aroma höchstens einmal** — ein
 * Fläschchen kann nicht in zwei Paaren zugleich liegen. Vorbeugend verwandte
 * Paare nur, wenn beide Aromen eingeführt sind und mindestens auf Stufe B
 * stehen: wer die Familie noch sucht, lernt am Unterscheiden zweier
 * Familienmitglieder nichts.
 */
export function kontrastpaare(
  alleAromen: readonly AromaOption[],
  staende: ReadonlyMap<string, GesamtStand>,
  jetzt: number,
  zufall: () => number = Math.random,
  max: number = KONTRAST_PAARE_MAX,
): readonly Kontrastpaar[] {
  const zustand = (id: string) => effektiverZustand(staende.get(id), jetzt);
  const bekannt = new Set(alleAromen.map((a) => a.id));
  const kandidaten: Kontrastpaar[] = [];

  for (const p of verwechslungspaare(staende)) {
    if (bekannt.has(p.aId) && bekannt.has(p.bId)) kandidaten.push({ aId: p.aId, bId: p.bId, quelle: 'verwechslung' });
  }

  const verwandteVon = (option: AromaOption) => (option.verwandte ?? []).filter((id) => bekannt.has(id) && zustand(id).eingefuehrt);
  const zaehe = alleAromen
    .filter((a) => zustand(a.id).eingefuehrt && zustand(a.id).zaeh)
    .sort((x, y) => (staende.get(y.id)?.fehlerSerie ?? 0) - (staende.get(x.id)?.fehlerSerie ?? 0));
  for (const a of zaehe) {
    const verwechslungen = Object.entries(staende.get(a.id)?.verwechslungen ?? {})
      .filter(([id]) => bekannt.has(id))
      .sort((x, y) => y[1] - x[1]);
    const partner = verwechslungen[0]?.[0] ?? verwandteVon(a)[0];
    if (partner) kandidaten.push({ aId: a.id, bId: partner, quelle: 'zaeh' });
  }

  // Vorbeugende Paare in drei Rängen, innerhalb eines Rangs zufällig: erst
  // Paare, deren Datenblätter sich gegenseitig nennen (die belastbarste
  // Ähnlichkeit, auch über Familiengrenzen: Holzig–Zeder, Teer–Rauchig),
  // dann einseitig genannte aus derselben Familie, zuletzt einseitig genannte
  // über Familiengrenzen (Zeder–Pappe, aber auch Zitrone–Jasmin). Ein Filter
  // nach Familie wäre falsch — er striche Holzig–Zeder.
  const abStufeB = (id: string) => zustand(id).eingefuehrt && zustand(id).stufe !== 'a';
  const nachId = new Map(alleAromen.map((a) => [a.id, a]));
  const gesehen = new Set<string>();
  const raenge: [Kontrastpaar[], Kontrastpaar[], Kontrastpaar[]] = [[], [], []];
  for (const a of alleAromen) {
    if (!abStufeB(a.id)) continue;
    for (const bId of verwandteVon(a)) {
      const schluessel = [a.id, bId].sort().join('|');
      if (gesehen.has(schluessel) || !abStufeB(bId)) continue;
      gesehen.add(schluessel);
      const b = nachId.get(bId)!;
      const gegenseitig = (b.verwandte ?? []).includes(a.id);
      const gleicheFamilie = a.kategorieId !== undefined && a.kategorieId === b.kategorieId;
      raenge[gegenseitig ? 0 : gleicheFamilie ? 1 : 2].push({ aId: a.id, bId, quelle: 'verwandt' });
    }
  }
  for (const rang of raenge) kandidaten.push(...gemischt(rang, zufall));

  const belegt = new Set<string>();
  const paare: Kontrastpaar[] = [];
  for (const p of kandidaten) {
    if (paare.length >= max) break;
    if (p.aId === p.bId || belegt.has(p.aId) || belegt.has(p.bId)) continue;
    belegt.add(p.aId);
    belegt.add(p.bId);
    paare.push(p);
  }
  return paare;
}

/**
 * Welche Art Durchgang "durchgang starten" beginnt: etwa jeder vierte wird
 * ein Kontrastdurchgang, aber nur, wenn mindestens drei Paare da sind —
 * sonst wäre er zu kurz, um die Riechvorbereitung zu lohnen.
 */
export function waehleDurchgangsart(verfuegbarePaare: number, zufall: () => number = Math.random): 'normal' | 'kontrast' {
  return verfuegbarePaare >= KONTRAST_PAARE_MIN_ZUFALL && zufall() < KONTRAST_ANTEIL ? 'kontrast' : 'normal';
}

export interface KontrastAuswertung {
  readonly ergebnis: 'richtig' | 'falsch';
  /** Neue Verwechslungsliste von A (Eintrag für B angepasst). */
  readonly aVerwechslungen: Readonly<Record<string, number>>;
  /** Neue Verwechslungsliste von B (Eintrag für A angepasst). */
  readonly bVerwechslungen: Readonly<Record<string, number>>;
}

function verwechslungAngepasst(liste: Readonly<Record<string, number>>, partnerId: string, delta: number): Record<string, number> {
  const neu = { ...liste };
  const wert = (neu[partnerId] ?? 0) + delta;
  if (wert > 0) neu[partnerId] = wert;
  else delete neu[partnerId];
  return neu;
}

/**
 * Wertet ein Paar aus: **eine** Zuordnungsfrage ("welches war welches"),
 * nicht zwei Einzelfragen — die zweite wäre nach der ersten durch Ausschluss
 * geschenkt (Lastenheft Abschnitt 6). Deshalb kein `teilweise`.
 *
 * **Bewegt keine Box.** Bei zwei Antwortmöglichkeiten liegt Raten zur Hälfte
 * richtig — ein Treffer schöbe sonst bei jedem zweiten Versuch beide Boxen
 * hoch, auch für ein Paar, das man nicht auseinanderhalten kann. Gezählt wird
 * stattdessen am Paar: richtig senkt den Verwechslungszähler in beide
 * Richtungen um 1, falsch erhöht ihn. Ein Paar, das dauerhaft gelingt,
 * wandert so aus dem Kontrastpool; eines, das nicht gelingt, steigt auf.
 */
export function werteKontrastAus(
  richtigeReihenfolge: boolean,
  aId: string,
  bId: string,
  aStand: GesamtStand | undefined,
  bStand: GesamtStand | undefined,
): KontrastAuswertung {
  const delta = richtigeReihenfolge ? -1 : 1;
  return {
    ergebnis: richtigeReihenfolge ? 'richtig' : 'falsch',
    aVerwechslungen: verwechslungAngepasst(aStand?.verwechslungen ?? {}, bId, delta),
    bVerwechslungen: verwechslungAngepasst(bStand?.verwechslungen ?? {}, aId, delta),
  };
}

/**
 * Ob nach einem Paar beide Fläschchen noch einmal gerochen werden — nach
 * einer falschen Zuordnung, solange die Riechgrenze zwei weitere
 * Riechvorgänge trägt. Beide nacheinander mit Namen zu riechen ist der
 * direkte Vergleich, um den es im Kontrastdurchgang geht.
 */
export function kontrastNachriechenAngebracht(ergebnis: 'richtig' | 'falsch', paareImDurchgang: number, bisherNachgerochen: number): boolean {
  return ergebnis === 'falsch' && 2 * paareImDurchgang + bisherNachgerochen + 2 <= RIECHGRENZE;
}
