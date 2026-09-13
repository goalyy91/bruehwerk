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
 *  5. Auswertung eines Kontrastdurchgangs (werteKontrastAus) — eine
 *     gemeinsame Entscheidung für zwei Aromen statt einer einzelnen.
 */
import type { Uebungsart, UebungStufe } from '../daten/schema/uebung';
import { UEBUNGSARTEN } from '../daten/schema/uebung';
import type { Uebungsergebnis } from '../daten/schema/uebungsantwort';
import type { Box } from './leitner';
import { startBox, istEingefuehrt, einfuehrungErlaubt, bewegeBox, naechsteFaelligkeit } from './leitner';

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
  return { box, faellig, stufe, eingefuehrt };
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

  const neuErlaubt = einfuehrungErlaubt(eingefuehrt.map((k) => k.zustand.box));
  const zielNeu = neuErlaubt ? Math.min(NEU_MAX, Math.round(durchgangsGroesse * ANTEIL_NEU), nichtEingefuehrt.length) : 0;
  const neu = gemischt(nichtEingefuehrt, zufall).slice(0, zielNeu);

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
 * bestimmt hat. `formStufe` ist nur ein Mittel, überhaupt *irgendeine*
 * sinnvolle Form zeigen zu können, ohne Identität vorwegzunehmen — mehr
 * nicht. Bewertet wird unten ausschließlich gegen das tatsächlich
 * aufgedeckte Aroma, nie gegen das, dessen Stufe die Form geliefert hat.
 */
export interface AntwortEingabe {
  readonly formStufe: UebungStufe;
  /** Getippte Familie — bei Stufe A und B gefragt, bei C nicht vorhanden. */
  readonly tipFamilieId?: string;
  /** Getipptes Aroma — bei Stufe B (nach Familienwahl) und C gefragt, bei A nicht vorhanden. */
  readonly tipAromaId?: string;
  readonly tatsaechlicheAromaId: string;
  readonly tatsaechlicheFamilieId: string | undefined;
  readonly tatsaechlicherStand: GesamtStand | undefined;
}

export interface AntwortAuswertung {
  readonly ergebnis: Uebungsergebnis;
  readonly box: Box;
  readonly faellig: number;
  readonly stufe: UebungStufe;
  readonly familienSerie: number;
}

/** Ab wie vielen Treffern in Folge (Stufe A, Familie) auf Stufe B geschaltet wird — Lastenheft Abschnitt 3. */
const FAMILIENSERIE_SCHWELLE = 3;

/**
 * Wertet eine Antwort aus, **nachdem** die Nummer bekannt ist — vorher kann
 * die App nicht wissen, gegen welches Aroma sie überhaupt prüft. Die
 * Leitner-Bewegung (Box, Fälligkeit, Stufe, Familienserie) bezieht sich
 * immer auf das **tatsächliche** Aroma — `formStufe` hat damit nichts zu
 * tun, sie hat nur die Form geliefert (siehe Kopfkommentar zu
 * `AntwortEingabe`). Das gilt für jede Antwort, nicht nur für den seltenen
 * Fall eines echten Bereitlegen-Fehlers.
 */
export function werteAntwortAus(eingabe: AntwortEingabe, jetzt: number): AntwortAuswertung {
  const { formStufe, tipFamilieId, tipAromaId, tatsaechlicheAromaId, tatsaechlicheFamilieId, tatsaechlicherStand } = eingabe;
  const zustand = effektiverZustand(tatsaechlicherStand, jetzt);
  const familieRichtig = tipFamilieId !== undefined && tipFamilieId === tatsaechlicheFamilieId;

  let ergebnis: Uebungsergebnis;
  if (formStufe === 'c') {
    ergebnis = tipAromaId === tatsaechlicheAromaId ? 'richtig' : 'falsch';
  } else if (formStufe === 'a') {
    ergebnis = familieRichtig ? 'richtig' : 'falsch';
  } else {
    ergebnis = tipAromaId === tatsaechlicheAromaId ? 'richtig' : familieRichtig ? 'teilweise' : 'falsch';
  }

  const box = bewegeBox(zustand.box, ergebnis);
  const faellig = naechsteFaelligkeit(box, jetzt);

  // familienSerie zaehlt nur, solange das TATSAECHLICHE Aroma noch auf
  // Stufe A steht — unabhaengig von `formStufe`. Ein Aroma, das laengst auf
  // B oder C steht, aber (der Regelfall) mit der Stufe-A-Form gefragt wurde,
  // macht dadurch keinen Rueckschritt.
  let familienSerie = tatsaechlicherStand?.familienSerie ?? 0;
  let stufe = zustand.stufe;
  if (zustand.stufe === 'a') {
    familienSerie = familieRichtig ? familienSerie + 1 : 0;
    if (familienSerie >= FAMILIENSERIE_SCHWELLE) {
      stufe = 'b';
      familienSerie = 0;
    }
  }

  return { ergebnis, box, faellig, stufe, familienSerie };
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
// Auswertung eines Kontrastdurchgangs — eine gemeinsame Entscheidung für
// zwei Aromen (Aromapaket, Etappe 7).
// ============================================================================

export interface KontrastAuswertung {
  readonly ergebnis: 'richtig' | 'falsch';
  readonly aBox: Box;
  readonly aFaellig: number;
  readonly bBox: Box;
  readonly bFaellig: number;
}

/**
 * Wertet einen Kontrastdurchgang aus: **eine** Zuordnungsfrage ("welches war
 * welches") über zwei Aromen hinweg, nicht zwei Einzelfragen — das zweite
 * wäre nach dem ersten durch Ausschluss geschenkt (Lastenheft Abschnitt 6).
 * Deshalb kein `teilweise`: entweder beide richtig zugeordnet, oder beide
 * verwechselt — eine binäre Unterscheidungsleistung kennt keine Zwischenstufe.
 *
 * Beide Aromen bewegen sich **gemeinsam in dieselbe Richtung**, aber jedes
 * von seiner **eigenen** Box aus — ein Kontrastdurchgang bevorzugt zwar
 * Aromen mit dokumentierter Verwechslung (`verwechslungspaare`), das sagt
 * aber nichts darüber, dass beide zufällig denselben Fortschritt hätten.
 * Berührt bewusst weder `stufe` noch `familienSerie`: ein Kontrastdurchgang
 * ist keine Familien-Übung und bewegt diesen Fortschritt nicht.
 */
export function werteKontrastAus(
  richtigeReihenfolge: boolean,
  aStand: GesamtStand | undefined,
  bStand: GesamtStand | undefined,
  jetzt: number,
): KontrastAuswertung {
  const ergebnis: 'richtig' | 'falsch' = richtigeReihenfolge ? 'richtig' : 'falsch';
  const aZustand = effektiverZustand(aStand, jetzt);
  const bZustand = effektiverZustand(bStand, jetzt);
  const aBox = bewegeBox(aZustand.box, ergebnis);
  const bBox = bewegeBox(bZustand.box, ergebnis);
  return { ergebnis, aBox, aFaellig: naechsteFaelligkeit(aBox, jetzt), bBox, bFaellig: naechsteFaelligkeit(bBox, jetzt) };
}
