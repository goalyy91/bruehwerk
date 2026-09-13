/**
 * Uebungsmodus — konzept.md:810-812 plus Aromapaket, Etappe 4. Zwei
 * Aufgabenarten (daten/schema/uebung.ts::UEBUNGSARTEN) statt einer, eine
 * gemeinsame Auswahl-Logik, die aus Trefferquote, "wie lange her" und der
 * Verwechslungsliste entscheidet, was als Naechstes drankommt.
 *
 * Eine dritte Art ("Aussenseiter" — zwei aus einer Kategorie, eins aus einer
 * anderen) ist nachtraeglich wieder raus: bei Le Nez sind die Nummern strikt
 * nach Kategorie sortiert (Sauer/Fermentiert = 21-23, Sonstiges = 33-40, …).
 * Die Segment-Beschriftung zeigt zwangslaeufig die Nummer, nicht den Namen —
 * damit war der Aussenseiter allein am Zahlenabstand erkennbar, ganz ohne zu
 * riechen. Eine Uebung, die man ohne Nase loesen kann, ist keine.
 *
 * Reines TypeScript, kein idb, kein Svelte (tests/schichten.test.ts erzwingt
 * das) — jede Funktion bekommt ihre Daten explizit uebergeben, auch die
 * Kategorie und die "verwandten" Aromen (aus aroma-datenblaetter.ts), statt
 * sie sich selbst zu besorgen. Der Zufall wird injiziert (Default
 * Math.random), damit die Auswahl selbst testbar ist, ohne echten Zufall
 * nachzubilden.
 *
 * Aromapaket, Etappe 6 (Neubau nach Lastenheft, docs/konzept.md
 * "Übungsmodus"): ab dem Abschnitt "Zusammenstellung eines
 * Übungsdurchgangs" unten kommt die neue Logik dazu — welche zwölf Aromen
 * ein Durchgang verdeckt bereitlegt. Alles darüber (Aufgabe,
 * aufgabeBenennen, aufgabeUnterscheiden, naechstesZiel, naechsteAufgabe,
 * zielGewicht) gehört noch dem **alten** Übungsmodus-Bildschirm
 * (bereiche/einstellungen/Uebungsmodus.svelte) und bleibt bewusst stehen,
 * bis Etappe 3 diesen Bildschirm ersetzt — sonst bräche der noch aktive
 * Bildschirm mitten in einem Zwischenschritt. `bereinigteQuote` und
 * `gesamtquote` bleiben dagegen dauerhaft: sie füttern
 * `domain/leitner.ts::startBox` bei der Übernahme des Altbestands.
 */
import type { Uebungsart, UebungStufe } from '../daten/schema/uebung';
import { UEBUNGSARTEN } from '../daten/schema/uebung';
import type { Box } from './leitner';
import { startBox, istEingefuehrt, einfuehrungErlaubt } from './leitner';

export interface AromaOption {
  readonly id: string;
  readonly label: string;
  readonly nummer?: number;
  /** Id der SCA-Kategorie (daten/aromen.ts) — Fallback-Partner fuer "Unterscheiden" ohne Datenblatt. */
  readonly kategorieId?: string;
  /** Ids der laut Datenblatt verwandten Aromen — Grundlage fuer "Unterscheiden". */
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

/** Eine Aufgabe, gleich welcher Art — der Bildschirm kennt nur diese Form, nicht die einzelnen Arten. */
export interface Aufgabe {
  readonly art: Uebungsart;
  /** Die Flaeschchen, die gerochen werden sollen, in Riechreihenfolge. */
  readonly riechen: readonly AromaOption[];
  readonly frage: string;
  /** Antwortmoeglichkeiten — bei "benennen" alle bekannten Aromen, sonst nur die riechenden. */
  readonly optionen: readonly AromaOption[];
  /** Die Id aus `optionen`/`riechen`, die richtig ist — bindet die Statistik immer an das Ziel-Aroma. */
  readonly richtigeId: string;
}

// ---- Trefferquote, um den Zufall bereinigt -------------------------------

/** Wie viele Optionen im Schnitt zur Wahl stehen, je Aufgabenart — 1 aus 60 ist praktisch kein Raten. */
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
 * (wie ein nie geuebtes Aroma).
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

// ---- Auswahl des Ziel-Aromas: Sicherheit UND "wie lange her" -------------

/** Halbwertszeit in Tagen fuer "wie lange nicht mehr geuebt" — kuerzer als bei
 * Getraenken (60 Tage, domain/ranking.ts): ein Geruchsgedaechtnis verblasst
 * schneller als eine Trinkgewohnheit. */
export const UEBUNG_HALBWERTSZEIT_TAGE = 14;

const MS_PRO_TAG = 24 * 60 * 60 * 1000;

/** 1 = eben erst geuebt, faellt gegen 0 ueber mehrere Halbwertszeiten. Nie geuebt: 0 ("unendlich lange her"). */
function frische(letzterVersuch: number | undefined, jetzt: number, halbwertszeitTage = UEBUNG_HALBWERTSZEIT_TAGE): number {
  if (letzterVersuch === undefined) return 0;
  const tage = (jetzt - letzterVersuch) / MS_PRO_TAG;
  return Math.pow(2, -tage / halbwertszeitTage);
}

/**
 * Ein nie geuebtes Aroma bekommt volles Gewicht (1). Ein perfekt sitzendes
 * bekommt nicht 0, sondern ein Mindestgewicht — sonst verschwaende es
 * dauerhaft aus der Ziehung, sobald es einmal gut sass. Danach der groessere
 * von zwei Gruenden, wieder dranzukommen: schwach ODER lange her (nicht
 * addiert — beides zusammen soll nicht staerker wiegen als der schlimmere
 * der beiden Gruende allein).
 */
const MINDESTGEWICHT = 0.15;

export function zielGewicht(stand: GesamtStand | undefined, jetzt: number): number {
  if (!stand) return 1;
  const unsicherheit = 1 - gesamtquote(stand);
  const vergessenheit = 1 - frische(stand.letzterVersuch, jetzt);
  return Math.max(MINDESTGEWICHT, unsicherheit, vergessenheit);
}

/** Gewichtete Zufallsauswahl eines Ziel-Aromas. `zufall()` liefert einen Wert in [0, 1) — Default Math.random. */
export function naechstesZiel(
  aromen: readonly AromaOption[],
  staende: ReadonlyMap<string, GesamtStand>,
  jetzt: number,
  zufall: () => number = Math.random,
): AromaOption | undefined {
  if (aromen.length === 0) return undefined;
  const gewichte = aromen.map((a) => zielGewicht(staende.get(a.id), jetzt));
  const summe = gewichte.reduce((s, g) => s + g, 0);
  let ziel = zufall() * summe;
  for (let i = 0; i < aromen.length; i++) {
    ziel -= gewichte[i]!;
    if (ziel <= 0) return aromen[i];
  }
  return aromen[aromen.length - 1];
}

// ---- Kleine Zufallshelfer, injizierbar wie ueberall hier -----------------

function ziehe<T>(liste: readonly T[], zufall: () => number): T | undefined {
  if (liste.length === 0) return undefined;
  return liste[Math.floor(zufall() * liste.length)];
}

/** Fisher-Yates mit injiziertem Zufall — Optionen sollen nicht immer in derselben Reihenfolge stehen. */
function gemischt<T>(liste: readonly T[], zufall: () => number): T[] {
  const kopie = [...liste];
  for (let i = kopie.length - 1; i > 0; i--) {
    const j = Math.floor(zufall() * (i + 1));
    [kopie[i], kopie[j]] = [kopie[j]!, kopie[i]!];
  }
  return kopie;
}

// ---- Die zwei Aufgabenarten ------------------------------------------------

/**
 * Übung 1 — ein Fläschchen riechen, aus allen bekannten Aromen benennen.
 * `frage` nennt bewusst keine Nummer — die zeigt der Bildschirm separat im
 * "riechen"-Kopf, hier steht nur die eigentliche Frage.
 */
export function aufgabeBenennen(ziel: AromaOption, alleAromen: readonly AromaOption[]): Aufgabe {
  return {
    art: 'benennen',
    riechen: [ziel],
    frage: 'Welches Aroma ist das?',
    optionen: alleAromen,
    richtigeId: ziel.id,
  };
}

/**
 * Übung 2 — zwei verwandte Fläschchen riechen, ein Name ist vorgegeben.
 * `ziel` ist immer der gesuchte Name (`richtigeId`), `partner` das zweite,
 * verwechselbare Fläschchen.
 */
export function aufgabeUnterscheiden(ziel: AromaOption, partner: AromaOption, zufall: () => number = Math.random): Aufgabe {
  const zwei = gemischt([ziel, partner], zufall);
  return {
    art: 'unterscheiden',
    riechen: zwei,
    frage: `Welches der beiden ist „${ziel.label}“?`,
    optionen: zwei,
    richtigeId: ziel.id,
  };
}

// ---- Die gezielte Auswahl: welche Art passt zu diesem Ziel? --------------

/** Ab wie vielen Verwechslungen mit demselben Aroma gilt sie als auffällig genug für eine gezielte Übung 2. */
const SCHWELLE_VERWECHSLUNGSPARTNER = 2;

/** Das am häufigsten verwechselte Aroma, wenn es die Schwelle erreicht — sonst undefined. */
function staerksterVerwechslungspartner(
  verwechslungen: Readonly<Record<string, number>>,
  nachId: ReadonlyMap<string, AromaOption>,
): AromaOption | undefined {
  let bestId: string | undefined;
  let bestAnzahl = 0;
  for (const [id, anzahl] of Object.entries(verwechslungen)) {
    if (anzahl > bestAnzahl && nachId.has(id)) {
      bestId = id;
      bestAnzahl = anzahl;
    }
  }
  if (bestId === undefined || bestAnzahl < SCHWELLE_VERWECHSLUNGSPARTNER) return undefined;
  return nachId.get(bestId);
}

/** Ein Partner für "Unterscheiden": zuerst ein echter Verwandter (Datenblatt), sonst irgendwer aus derselben Kategorie. Bevorzugt, wen die Verwechslungsliste tatsächlich nennt. */
function findePartnerFuerUnterscheiden(
  ziel: AromaOption,
  alleAromen: readonly AromaOption[],
  nachId: ReadonlyMap<string, AromaOption>,
  verwechslungen: Readonly<Record<string, number>>,
  zufall: () => number,
): AromaOption | undefined {
  const verwandte = (ziel.verwandte ?? []).map((id) => nachId.get(id)).filter((a): a is AromaOption => a !== undefined);
  if (verwandte.length > 0) {
    const bevorzugt = [...verwandte].sort((a, b) => (verwechslungen[b.id] ?? 0) - (verwechslungen[a.id] ?? 0))[0]!;
    return (verwechslungen[bevorzugt.id] ?? 0) > 0 ? bevorzugt : ziehe(verwandte, zufall);
  }
  if (!ziel.kategorieId) return undefined;
  const gleicheKategorie = alleAromen.filter((a) => a.id !== ziel.id && a.kategorieId === ziel.kategorieId);
  if (gleicheKategorie.length === 0) return undefined;
  const meistverwechselt = [...gleicheKategorie].sort((a, b) => (verwechslungen[b.id] ?? 0) - (verwechslungen[a.id] ?? 0))[0]!;
  return (verwechslungen[meistverwechselt.id] ?? 0) > 0 ? meistverwechselt : ziehe(gleicheKategorie, zufall);
}

/**
 * Zieht ein Ziel-Aroma und entscheidet, welche Aufgabenart dazu passt:
 *
 * 1. Ein einzelnes Aroma wird auffällig oft verwechselt UND ist laut
 *    Datenblatt damit verwandt → "Unterscheiden" genau mit diesem Paar.
 * 2. Sonst: meistens "Benennen", gelegentlich "Unterscheiden" (wenn ein
 *    Partner bekannt ist — echter Verwandter oder sonst irgendwer aus
 *    derselben Kategorie). Reicht der Vorrat dafür nicht, fällt es auf
 *    "Benennen" zurück — das geht immer, solange überhaupt Aromen vorliegen.
 */
export function naechsteAufgabe(
  alleAromen: readonly AromaOption[],
  staende: ReadonlyMap<string, GesamtStand>,
  jetzt: number,
  zufall: () => number = Math.random,
): Aufgabe | undefined {
  const ziel = naechstesZiel(alleAromen, staende, jetzt, zufall);
  if (!ziel) return undefined;

  const nachId = new Map(alleAromen.map((a) => [a.id, a] as const));
  const verwechslungen = staende.get(ziel.id)?.verwechslungen ?? {};

  const verwechslungspartner = staerksterVerwechslungspartner(verwechslungen, nachId);
  if (verwechslungspartner && (ziel.verwandte ?? []).includes(verwechslungspartner.id)) {
    return aufgabeUnterscheiden(ziel, verwechslungspartner, zufall);
  }

  if (zufall() < 0.15) {
    const partner = findePartnerFuerUnterscheiden(ziel, alleAromen, nachId, verwechslungen, zufall);
    if (partner) return aufgabeUnterscheiden(ziel, partner, zufall);
  }
  return aufgabeBenennen(ziel, alleAromen);
}

// ============================================================================
// Aromapaket, Etappe 6 — Zusammenstellung eines Übungsdurchgangs
//
// Ab hier die neue Logik: welche zwölf Aromen ein Durchgang verdeckt
// bereitlegt (acht abgefragt, vier Zusatzfläschchen), nicht mehr "welches
// einzelne Aroma kommt jetzt dran". Der Bildschirm (Etappe 3) entscheidet
// pro Item selbst, welche Übungsform und Frage daraus wird — diese Datei
// kennt nur die Auswahl, nicht die Frage.
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

/**
 * Der am stärksten dokumentierte Verwechslungspartner eines Aromas, wenn er
 * die Schwelle erreicht — dieselbe Schwelle wie beim alten "Unterscheiden"
 * oben (`SCHWELLE_VERWECHSLUNGSPARTNER`), absichtlich wiederverwendet statt
 * verdoppelt.
 */
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
 * des einzelnen Aromas beim Ziehen), entscheidet Etappe 3, nicht diese
 * Funktion. Insbesondere baut diese Funktion **keine** Liste von Namen für
 * eine Auswahl im Bildschirm — die Antwort-/Nummernliste dort umfasst immer
 * alle 60, sonst verriete ihre Kürzung den Kandidatenkreis (CLAUDE.md,
 * "Übungsmodus: verdecktes Ziehen, keine offene Nummer").
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
