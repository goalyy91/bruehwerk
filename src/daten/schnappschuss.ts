/**
 * Sicherung vor der Aktualisierung (2026-09-08).
 *
 * Eine neue Fassung der App kann eine Migration mitbringen, ein geaendertes
 * Schema oder schlicht einen Fehler. Weil es kein Cloud-Backup gibt und der
 * Datei-Export von Hand angestossen werden muss, gaebe es danach nichts, auf
 * das man zurueckfaellt. Deshalb legt die App unmittelbar vor jeder
 * Aktualisierung selbst eine an — denselben vollstaendigen Bestand, den auch
 * `exportiere()` in eine Datei schreibt, nur im Geraet.
 *
 * Warum im Geraet und nicht als Datei: eine Datei braucht einen Dialog, einen
 * Speicherort und eine Entscheidung. Genau in dem Moment, in dem man
 * "aktualisieren" antippt, will niemand drei Fragen beantworten — und eine
 * Sicherung, die man wegklicken kann, ist im Ernstfall nicht da. Die Datei
 * bleibt der Weg *aus* dem Geraet heraus; das hier ist der Weg *zurueck*.
 *
 * Der Store liegt ausserhalb von SAMMLUNGEN (siehe db.ts): Sicherungen
 * gehoeren nicht in den Export und werden beim Zurueckspielen nicht
 * ueberschrieben.
 */
import { oeffneDB } from './db';
import { exportiere, importiere, type ExportDatei } from './export';

/** So viele bleiben liegen — die aelteste faellt danach heraus. */
export const WIEVIELE_BLEIBEN = 3;

export interface Schnappschuss {
  readonly id: string;
  readonly erzeugtAm: number;
  /** Wofuer sie angelegt wurde, in einem Halbsatz — steht so in der Liste. */
  readonly anlass: string;
  /** Zaehlwerte fuer die Anzeige, damit man nicht die ganze Datei aufmachen muss. */
  readonly umfang: { readonly shots: number; readonly kaffees: number; readonly verkostungen: number };
  readonly datei: ExportDatei;
}

/**
 * Legt eine Sicherung an und raeumt die aeltesten weg. Gibt sie zurueck,
 * damit der Aufrufer melden kann, was gesichert wurde.
 */
export async function schnappschussAnlegen(anlass: string): Promise<Schnappschuss> {
  const datei = await exportiere();
  const eintrag: Schnappschuss = {
    id: `schnappschuss-${datei.erzeugtAm}`,
    erzeugtAm: datei.erzeugtAm,
    anlass,
    umfang: {
      shots: datei.sammlungen.shot.length,
      kaffees: datei.sammlungen.kaffee.length,
      verkostungen: datei.sammlungen.tasting.length,
    },
    datei,
  };
  const db = await oeffneDB();
  await db.put('schnappschuss', eintrag);
  await aufraeumen();
  return eintrag;
}

/** Neueste zuerst. */
export async function schnappschuesse(): Promise<Schnappschuss[]> {
  const db = await oeffneDB();
  const alle = await db.getAll('schnappschuss');
  return alle.sort((a, b) => b.erzeugtAm - a.erzeugtAm);
}

/**
 * Spielt eine Sicherung zurueck. Laeuft ueber `importiere()`, also durch
 * dieselbe Pruefung wie eine Datei von aussen — eine Sicherung aus einer
 * aelteren Fassung, die zum heutigen Schema nicht mehr passt, faellt damit
 * mit einer Meldung auf, statt halb eingespielt zu werden.
 */
export async function schnappschussZurueckspielen(id: string): Promise<void> {
  const db = await oeffneDB();
  const eintrag = await db.get('schnappschuss', id);
  if (!eintrag) throw new Error('Diese Sicherung gibt es nicht mehr.');
  await importiere(eintrag.datei);
}

export async function schnappschussLoeschen(id: string): Promise<void> {
  const db = await oeffneDB();
  await db.delete('schnappschuss', id);
}

/** Aeltere als die letzten WIEVIELE_BLEIBEN loeschen. */
async function aufraeumen(): Promise<void> {
  const db = await oeffneDB();
  const alle = await db.getAll('schnappschuss');
  const zuAlt = alle.sort((a, b) => b.erzeugtAm - a.erzeugtAm).slice(WIEVIELE_BLEIBEN);
  for (const eintrag of zuAlt) await db.delete('schnappschuss', eintrag.id);
}
