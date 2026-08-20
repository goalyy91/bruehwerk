/**
 * Manueller Datei-Export — der zweite, anbieterfreie Backup-Weg (siehe
 * CLAUDE.md "Datenquelle"). Ein Tap, vollstaendiger Bestand, kein Backend
 * beteiligt. Funktioniert auch dann noch, wenn ein spaeterer Cloud-Dienst
 * eingestellt wird.
 *
 * Die Datei-Auswahl selbst (Download, Dateidialog) gehoert in die
 * Oberflaeche — hier entsteht nur die Funktion darunter.
 */
import { z, type ZodError } from 'zod';
import type { IDBPTransaction } from 'idb';
import { SAMMLUNGEN, oeffneDB, type Sammlung, type BruehwerkSchema } from './db';
import { alle, schreiben, SCHEMA_FUER, type SammlungWert } from './ablage';

export const EXPORT_SCHEMA_VERSION = 1;

export type ExportSammlungen = { [S in Sammlung]: SammlungWert[S][] };

export interface ExportDatei {
  schemaVersion: number;
  erzeugtAm: number;
  sammlungen: ExportSammlungen;
}

// Eigene generische Huelle statt der Zuweisung direkt in einer for-of-Schleife:
// innerhalb einer Schleife ueber SAMMLUNGEN ist die Laufvariable vom Typ
// Sammlung (die ganze Union), und TS kann dann nicht mehr beweisen, dass
// alle(s) fuer *dieses* s denselben Werttyp liefert wie sammlungen[s]
// erwartet. Ueber einen eigenen Typparameter S je Aufruf bleibt die
// Korrelation erhalten, ganz ohne Cast.
// `ziel` wird hier ueber Record<Sammlung, unknown> statt Partial<ExportSammlungen>
// indiziert: TS berechnet den Zugriff eines Mapped Type ueber einen
// generischen Schluessel S als seltsame Schnittmenge aller Zweige statt als
// den einen passenden — ein bekanntes Limit, kein Bug in diesem Code. Der
// Typparameter S haelt trotzdem die Korrelation zwischen `s` und dem
// geschriebenen Wert exakt — nur die Zielseite braucht die Nachhilfe.
async function ladeInSammlung<S extends Sammlung>(ziel: Partial<ExportSammlungen>, s: S): Promise<void> {
  (ziel as Record<Sammlung, unknown>)[s] = await alle(s);
}

/** Ein JSON-Objekt mit allen Sammlungen. Liest ueber ablage.alle() — validiert also denselben Bestand, der auch beim Lesen im Betrieb geprueft wuerde. */
export async function exportiere(): Promise<ExportDatei> {
  const sammlungen: Partial<ExportSammlungen> = {};
  for (const s of SAMMLUNGEN) {
    await ladeInSammlung(sammlungen, s);
  }
  return { schemaVersion: EXPORT_SCHEMA_VERSION, erzeugtAm: Date.now(), sammlungen: sammlungen as ExportSammlungen };
}

const AUSSENSCHEMA = z.object({
  schemaVersion: z.number().int().positive(),
  erzeugtAm: z.number().int().nonnegative(),
  sammlungen: z.record(z.string(), z.array(z.unknown())),
});

export interface ImportEinzelfehler {
  readonly sammlung: Sammlung;
  readonly index: number;
  readonly ursache: ZodError;
}

export class ImportFehler extends Error {
  constructor(public readonly einzelfehler: readonly ImportEinzelfehler[]) {
    super(
      `Import abgelehnt: ${einzelfehler.length} Datensatz/Datensätze entsprechen nicht dem Schema — ` +
        einzelfehler.map((e) => `${e.sammlung}[${e.index}]`).join(', '),
    );
    this.name = 'ImportFehler';
  }
}

/**
 * Validiert die komplette Datei, BEVOR irgendetwas geschrieben wird, und
 * schreibt dann in einer Transaktion ueber alle betroffenen Stores. Ein
 * halb eingespieltes Backup waere schlimmer als ein abgelehntes — deshalb
 * kein Store wird angefasst, solange auch nur ein Datensatz nicht passt.
 */
/** Siehe ladeInSammlung oben — derselbe Grund fuer die generische Huelle statt einer Schleife ueber die Union. */
function pruefeSammlung<S extends Sammlung>(
  ziel: Partial<ExportSammlungen>,
  einzelfehler: ImportEinzelfehler[],
  sammlung: S,
  roh: readonly unknown[],
): void {
  const schema = SCHEMA_FUER[sammlung];
  const eintraege: SammlungWert[S][] = [];
  roh.forEach((eintrag, index) => {
    const ergebnis = schema.safeParse(eintrag);
    if (!ergebnis.success) {
      einzelfehler.push({ sammlung, index, ursache: ergebnis.error });
    } else {
      eintraege.push(ergebnis.data);
    }
  });
  (ziel as Record<Sammlung, unknown>)[sammlung] = eintraege;
}

export async function importiere(datei: unknown): Promise<void> {
  const aussen = AUSSENSCHEMA.parse(datei); // wirft ZodError bei kaputter Grundstruktur — bewusst ungefangen, das ist ein Programmierfehler des Aufrufers, kein erwarteter Fall

  const einzelfehler: ImportEinzelfehler[] = [];
  const geparst: Partial<ExportSammlungen> = {};

  for (const sammlung of SAMMLUNGEN) {
    pruefeSammlung(geparst, einzelfehler, sammlung, aussen.sammlungen[sammlung] ?? []);
  }

  if (einzelfehler.length > 0) throw new ImportFehler(einzelfehler);

  const db = await oeffneDB();
  const tx = db.transaction(SAMMLUNGEN, 'readwrite');
  await Promise.all([...SAMMLUNGEN.flatMap((sammlung) => schreibeAlle(tx, sammlung, geparst[sammlung] ?? [])), tx.done]);
}

type SchreibTransaktion = IDBPTransaction<BruehwerkSchema, typeof SAMMLUNGEN, 'readwrite'>;

/** Wieder die generische Huelle (siehe ladeInSammlung) statt eines Casts an store.put(). */
function schreibeAlle<S extends Sammlung>(
  tx: SchreibTransaktion,
  sammlung: S,
  eintraege: readonly SammlungWert[S][],
): Promise<string>[] {
  const store = tx.objectStore(sammlung);
  return eintraege.map((eintrag) => store.put(eintrag));
}

// schreiben() bleibt fuer Einzelschreibvorgaenge importiert nutzbar, falls
// spaeter ein selektiver Wiederherstellungspfad gebraucht wird.
export { schreiben as _schreibenEinzeln };
