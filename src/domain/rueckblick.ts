/**
 * Rückblick am Ende eines Übungsdurchgangs — "was hat der heutige Durchgang
 * gebracht" (Rückmeldung 08.11.2026: kurze Zusammenfassung, *wie ich mich
 * entwickelt habe*, ausdrücklich ohne Technik — keine Boxen, keine Stufen,
 * keine Fälligkeiten).
 *
 * Geschwister von domain/meilenstein.ts und an dieselben Regeln gebunden:
 * - nur wahre Sätze, alle aus dem Antwortprotokoll rekonstruiert, nie aus
 *   einem mitgeführten Zustand (den Box-Stand vor dem Durchgang gibt es
 *   nirgends gespeichert);
 * - kein Zähler, keine Serie, kein Trost (docs/ux-regeln.md, Regel 10). Ein
 *   schwächerer Durchgang als sonst bekommt deshalb **keinen** Vergleichssatz
 *   — der Vergleich mit dem eigenen Schnitt erscheint nur nach oben;
 * - höchstens drei Sätze, stärkster zuerst. Nichts zu sagen → leere Liste,
 *   und der Ende-Screen zeigt den Abschnitt gar nicht.
 *
 * Bewusst disjunkt zum Meilenstein-Satz, damit nichts doppelt steht:
 * "zum ersten Mal getroffen" (nie zuvor richtig) gehört dem Meilenstein,
 * "sitzt wieder" (früher schon einmal richtig, zuletzt nicht) gehört hierher;
 * der Vergleich mit dem Schnitt entfällt, wenn der Meilenstein ohnehin
 * "fehlerfrei" oder "bester Durchgang" sagt.
 *
 * "Getroffen" heißt hier immer: die gezeigte Frage richtig beantwortet
 * (`ergebnis === 'richtig'`) und nicht als "nur geraten" markiert — ein
 * geratener Treffer ist kein Beleg für Entwicklung.
 *
 * Gilt nur für "normal"-Durchgänge; Kontrast und Reverse haben eigene Enden.
 */
import type { Uebungsantwort } from '../daten/schema/uebungsantwort';

const NORMAL_FORMEN = new Set(['familie', 'aromaInFamilie', 'freierAbruf']);
const HOECHSTENS_SAETZE = 3;
/** Ab so vielen früheren Durchgängen ist "im Schnitt" eine ehrliche Aussage. */
const MIN_VERGLEICHSDURCHGAENGE = 3;
/** So viele der letzten Durchgänge bilden den Schnitt — "zuletzt", nicht "seit jeher". */
const VERGLEICHSFENSTER = 5;

const ZAHLWORT = ['null', 'eins', 'zwei', 'drei', 'vier', 'fünf', 'sechs', 'sieben', 'acht', 'neun', 'zehn', 'elf', 'zwölf'];

function zahlwort(n: number): string {
  return ZAHLWORT[n] ?? String(n);
}

export interface RueckblickEingabe {
  /** Alle Antworten DIESES Durchgangs. */
  readonly durchgangAntworten: readonly Uebungsantwort[];
  /** Alle Antworten VOR diesem Durchgang (gleiches Set). */
  readonly vorherigeAntworten: readonly Uebungsantwort[];
  readonly labelVon: (aromaId: string) => string;
  /** Familienname des Aromas (z. B. "Fruchtig"), undefined wenn unbekannt. */
  readonly familieVon: (aromaId: string) => string | undefined;
}

function getroffen(a: Uebungsantwort): boolean {
  return a.ergebnis === 'richtig' && !a.geraten;
}

function punktzahl(antworten: readonly Uebungsantwort[]): number {
  return antworten.reduce((summe, a) => summe + (a.ergebnis === 'richtig' ? 1 : a.ergebnis === 'teilweise' ? 0.5 : 0), 0);
}

/** „X“ · „X“ und „Y“ · „X“, „Y“ und „Z“ — höchstens drei Namen. */
function namen(ids: readonly string[], labelVon: (id: string) => string): string {
  const n = ids.slice(0, 3).map((id) => `„${labelVon(id)}“`);
  if (n.length <= 1) return n[0] ?? '';
  return `${n.slice(0, -1).join(', ')} und ${n[n.length - 1]}`;
}

function eindeutig<T>(werte: readonly T[]): T[] {
  return [...new Set(werte)];
}

export function durchgangsRueckblick(eingabe: RueckblickEingabe): string[] {
  const { labelVon, familieVon } = eingabe;
  const heute = eingabe.durchgangAntworten.filter((a) => NORMAL_FORMEN.has(a.form));
  if (heute.length === 0) return [];
  const vorher = [...eingabe.vorherigeAntworten.filter((a) => NORMAL_FORMEN.has(a.form))].sort((a, b) => a.zeitstempel - b.zeitstempel);

  const vorherJeAroma = new Map<string, Uebungsantwort[]>();
  for (const a of vorher) {
    const liste = vorherJeAroma.get(a.aromaId) ?? [];
    liste.push(a);
    vorherJeAroma.set(a.aromaId, liste);
  }

  const saetze: string[] = [];

  // 1. Frei benannt — zum ersten Mal ohne Familie als Stütze, nachdem es mit
  //    ihr schon geklappt hat. Der eigentliche Entwicklungsschritt.
  const frei = eindeutig(
    heute
      .filter((a) => a.form === 'freierAbruf' && getroffen(a))
      .map((a) => a.aromaId)
      .filter((id) => {
        const frueher = vorherJeAroma.get(id) ?? [];
        return frueher.some(getroffen) && !frueher.some((f) => f.form === 'freierAbruf' && getroffen(f));
      }),
  );
  if (frei.length > 0) {
    saetze.push(`${namen(frei, labelVon)} hast du heute frei benannt — bisher ging das nur mit der Familie als Stütze.`);
  }

  // 2. Sitzt wieder — früher schon einmal getroffen, beim letzten Mal nicht.
  //    (Nie zuvor getroffen gehört dem Meilenstein-Satz, siehe Dateikopf.)
  const wieder = eindeutig(
    heute
      .filter(getroffen)
      .map((a) => a.aromaId)
      .filter((id) => !frei.includes(id))
      .filter((id) => {
        const frueher = vorherJeAroma.get(id) ?? [];
        const letzte = frueher[frueher.length - 1];
        return letzte !== undefined && !getroffen(letzte) && frueher.some(getroffen);
      }),
  );
  if (wieder.length === 1) {
    saetze.push(`${namen(wieder, labelVon)} sitzt wieder — beim letzten Mal lag es noch daneben.`);
  } else if (wieder.length > 1) {
    saetze.push(`${namen(wieder, labelVon)} sitzen wieder — beim letzten Mal lagen sie noch daneben.`);
  }

  // 3. Eine Familie, die heute durchweg saß (mindestens drei Fläschchen).
  const jeFamilie = new Map<string, Uebungsantwort[]>();
  for (const a of heute) {
    const familie = familieVon(a.aromaId);
    if (!familie) continue;
    const liste = jeFamilie.get(familie) ?? [];
    liste.push(a);
    jeFamilie.set(familie, liste);
  }
  const starkeFamilie = [...jeFamilie.entries()]
    .filter(([, liste]) => liste.length >= 3 && liste.every(getroffen))
    .sort((a, b) => b[1].length - a[1].length)[0];
  if (starkeFamilie) {
    saetze.push(`${starkeFamilie[0]} liegt dir: alle ${zahlwort(starkeFamilie[1].length)} richtig eingeordnet.`);
  }

  // 4. Über dem eigenen Schnitt der letzten Durchgänge — nur nach oben, und
  //    nicht, wenn der Meilenstein schon "fehlerfrei"/"bester" sagt.
  const vorherigeDurchgaenge = new Map<string, Uebungsantwort[]>();
  for (const a of vorher) {
    const liste = vorherigeDurchgaenge.get(a.durchgangId) ?? [];
    liste.push(a);
    vorherigeDurchgaenge.set(a.durchgangId, liste);
  }
  const letzte = [...vorherigeDurchgaenge.values()]
    .sort((a, b) => Math.max(...a.map((x) => x.zeitstempel)) - Math.max(...b.map((x) => x.zeitstempel)))
    .slice(-VERGLEICHSFENSTER);
  const heutePunkte = punktzahl(heute);
  const fehlerfrei = heute.every((a) => a.ergebnis === 'richtig');
  if (letzte.length >= MIN_VERGLEICHSDURCHGAENGE && !fehlerfrei) {
    const allePunkte = [...vorherigeDurchgaenge.values()].map(punktzahl);
    const besterBisher = heutePunkte > Math.max(...allePunkte);
    const schnitt = letzte.map(punktzahl).reduce((s, p) => s + p, 0) / letzte.length;
    if (!besterBisher && heutePunkte >= schnitt + 1) {
      saetze.push(`Mehr getroffen als zuletzt — im Schnitt waren es etwa ${zahlwort(Math.round(schnitt))} von ${zahlwort(heute.length)}.`);
    }
  }

  // 5. Die Richtung stimmte — Familie richtig, das Aroma noch nicht.
  const richtung = eindeutig(heute.filter((a) => a.ergebnis === 'teilweise').map((a) => a.aromaId));
  if (richtung.length === 1) {
    const familie = familieVon(richtung[0]!);
    saetze.push(
      familie
        ? `Bei ${namen(richtung, labelVon)} lag deine Nase schon in der richtigen Familie, ${familie} — das genaue Aroma kommt noch.`
        : `Bei ${namen(richtung, labelVon)} lag deine Nase schon in der richtigen Familie — das genaue Aroma kommt noch.`,
    );
  } else if (richtung.length > 1) {
    saetze.push(`Bei ${namen(richtung, labelVon)} lag deine Nase schon in der richtigen Familie — das genaue Aroma kommt noch.`);
  }

  // 6. Eine Verwechslung, die nicht zum ersten Mal passiert — eine
  //    Erkenntnis, kein Fehlerbericht: das Paar hat einen Namen bekommen.
  const wiederholt = heute.find(
    (a) =>
      a.getipptId !== undefined &&
      a.getipptId !== a.aromaId &&
      a.ergebnis !== 'richtig' &&
      vorher.some((f) => f.aromaId === a.aromaId && f.getipptId === a.getipptId),
  );
  if (wiederholt) {
    saetze.push(
      `„${labelVon(wiederholt.aromaId)}“ hast du wieder für „${labelVon(wiederholt.getipptId!)}“ gehalten — die beiden direkt nacheinander zu riechen schärft den Unterschied.`,
    );
  }

  // 7. Neu kennengelernt — Aromen, die heute zum ersten Mal überhaupt dran waren.
  const neu = eindeutig(heute.map((a) => a.aromaId).filter((id) => !vorherJeAroma.has(id)));
  if (neu.length > 3) {
    saetze.push(`${zahlwort(neu.length).replace(/^./, (c) => c.toUpperCase())} Aromen zum ersten Mal in der Nase.`);
  } else if (neu.length > 0) {
    saetze.push(`Neu kennengelernt: ${namen(neu, labelVon)}.`);
  }

  return saetze.slice(0, HOECHSTENS_SAETZE);
}
