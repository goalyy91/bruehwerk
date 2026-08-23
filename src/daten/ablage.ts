/**
 * Eine generische, typisierte Ablage ueber allen Sammlungen — mit
 * Zod-Validierung beim Schreiben *und* beim Lesen.
 *
 * Beim Lesen deshalb, weil eine aeltere DB-Version auf dem Telefon sonst
 * stillschweigend kaputte Objekte in die Oberflaeche schiebt. Schreibfehler
 * werden nicht geschluckt: sie werfen SchreibFehler, damit ein spaeterer
 * Bildschirm den kritischen Zustand "nochmal speichern" / "Shot verwerfen"
 * bauen kann (K66) — diese Datei baut nur den Fehler, auf den er sich
 * stuetzt, keine Anzeige.
 */
import type { ZodError, ZodType } from 'zod';
import { oeffneDB, type Sammlung, type WertVon } from './db';
import {
  Setup,
  Muehle,
  Bruehgeraet,
  Zubehoer,
  Ablauf,
  Kaffee,
  Charge,
  Profil,
  Gussplan,
  Shot,
  Symptom,
  Tasting,
  Aromaset,
  Getraenk,
  Ansatz,
  Person,
  Durchgang,
  Position,
  Bestellung,
  AppEinstellungen,
  Beobachtung,
} from './schema';

/** Wert-Typ je Sammlung, abgeleitet aus WertVon (db.ts) statt neu getippt. */
export type SammlungWert = { [S in Sammlung]: WertVon<S> };

/** Exportiert fuer export.ts — dieselbe Validierung fuer Datei-Import wie fuer die Ablage selbst. */
export const SCHEMA_FUER: { [S in Sammlung]: ZodType<SammlungWert[S]> } = {
  setup: Setup,
  muehle: Muehle,
  bruehgeraet: Bruehgeraet,
  zubehoer: Zubehoer,
  ablauf: Ablauf,
  kaffee: Kaffee,
  charge: Charge,
  profil: Profil,
  gussplan: Gussplan,
  shot: Shot,
  symptom: Symptom,
  tasting: Tasting,
  aromaset: Aromaset,
  getraenk: Getraenk,
  ansatz: Ansatz,
  person: Person,
  durchgang: Durchgang,
  position: Position,
  bestellung: Bestellung,
  einstellungen: AppEinstellungen,
  beobachtung: Beobachtung,
};

export class SchreibFehler extends Error {
  constructor(
    public readonly sammlung: Sammlung,
    public readonly ursache: ZodError,
  ) {
    super(`Schreiben in "${sammlung}" abgelehnt: ${ursache.issues.map((i) => i.message).join('; ')}`);
    this.name = 'SchreibFehler';
  }
}

export class LeseFehler extends Error {
  constructor(
    public readonly sammlung: Sammlung,
    public readonly id: string,
    public readonly ursache: ZodError,
  ) {
    super(`"${sammlung}/${id}" entspricht nicht mehr dem aktuellen Schema: ${ursache.issues.map((i) => i.message).join('; ')}`);
    this.name = 'LeseFehler';
  }
}

/** Schreibt einen validierten Datensatz. Wirft SchreibFehler statt still zu scheitern. */
export async function schreiben<S extends Sammlung>(sammlung: S, wert: SammlungWert[S]): Promise<void> {
  const ergebnis = SCHEMA_FUER[sammlung].safeParse(wert);
  if (!ergebnis.success) throw new SchreibFehler(sammlung, ergebnis.error);
  const db = await oeffneDB();
  await db.put(sammlung, ergebnis.data);
}

/** Liest einen Datensatz. undefined, wenn er nicht existiert; LeseFehler, wenn er dem Schema nicht mehr entspricht. */
export async function lesen<S extends Sammlung>(sammlung: S, id: string): Promise<SammlungWert[S] | undefined> {
  const db = await oeffneDB();
  const roh = await db.get(sammlung, id);
  if (roh === undefined) return undefined;
  const ergebnis = SCHEMA_FUER[sammlung].safeParse(roh);
  if (!ergebnis.success) throw new LeseFehler(sammlung, id, ergebnis.error);
  return ergebnis.data;
}

/** Liest die ganze Sammlung. Bricht bei der ersten kaputten Zeile — ein teilweise gelesener Bestand waere schwerer zu bemerken als ein Fehler. */
export async function alle<S extends Sammlung>(sammlung: S): Promise<SammlungWert[S][]> {
  const db = await oeffneDB();
  const roh = await db.getAll(sammlung);
  return roh.map((eintrag) => {
    const ergebnis = SCHEMA_FUER[sammlung].safeParse(eintrag);
    if (!ergebnis.success) {
      const id = typeof eintrag === 'object' && eintrag && 'id' in eintrag ? String(eintrag.id) : '?';
      throw new LeseFehler(sammlung, id, ergebnis.error);
    }
    return ergebnis.data;
  });
}

export async function loeschen(sammlung: Sammlung, id: string): Promise<void> {
  const db = await oeffneDB();
  await db.delete(sammlung, id);
}

export async function zaehlen(sammlung: Sammlung): Promise<number> {
  const db = await oeffneDB();
  return db.count(sammlung);
}
