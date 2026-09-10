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
 */
import type { Uebungsart } from '../daten/schema/uebung';
import { UEBUNGSARTEN } from '../daten/schema/uebung';

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
