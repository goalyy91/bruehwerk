/**
 * Startbelegung des Geraeteparks in die leere IndexedDB schreiben —
 * einmalig, beim allerersten Start. stammdaten.ts traegt nur, was das
 * Konzept tatsaechlich beziffert (siehe dort); diese Datei schreibt es in
 * die Ablage, mehr nicht.
 *
 * Erkennung "leer" laeuft ueber die Sammlung 'bruehgeraet': gibt es dort
 * schon einen Datensatz, hat entweder die Migration (Paket 02) oder ein
 * vorheriger Start bereits geschrieben — dann wird nichts ueberschrieben.
 */
import { alle, lesen, schreiben } from './ablage';
import { MUEHLEN, BRUEHGERAETE, ZUBEHOER, SETUPS, ABLAUF_LEER, SYMPTOME_STAMM, AUFFAELLIGKEITEN_STAMM } from './stammdaten';
import { AROMASETS } from './aromen';
import { EINSTELLUNGEN_ID } from './schema';

export async function seedFallsLeer(): Promise<void> {
  const vorhandene = await alle('bruehgeraet');
  if (vorhandene.length === 0) {
    await schreiben('ablauf', ABLAUF_LEER);
    for (const muehle of MUEHLEN) await schreiben('muehle', muehle);
    for (const bruehgeraet of BRUEHGERAETE) await schreiben('bruehgeraet', bruehgeraet);
    for (const zubehoer of ZUBEHOER) await schreiben('zubehoer', zubehoer);
    for (const setup of SETUPS) await schreiben('setup', setup);
  }

  // Eigenes Gate: der Symptom-Store bleibt leer, solange nur Geraete gesetzt
  // wurden (z. B. teilweise migrierte DB) — er wird unabhaengig geprueft.
  // Die Fehlerliste des Verkostungsbogens (K53, AUFFAELLIGKEITEN_STAMM) lebt
  // im selben Store (gruppe: 'auffaelligkeit', siehe daten/schema/shot.ts)
  // und gehoert deshalb ins selbe Gate.
  const symptomeVorhanden = await alle('symptom');
  if (symptomeVorhanden.length === 0) {
    for (const symptom of [...SYMPTOME_STAMM, ...AUFFAELLIGKEITEN_STAMM]) await schreiben('symptom', symptom);
  }

  // Paket 05 — die zwei Aromen-Sets (SCA + Le-Nez-Platzhalter, daten/aromen.ts).
  const aromasetsVorhanden = await alle('aromaset');
  if (aromasetsVorhanden.length === 0) {
    for (const aromaset of AROMASETS) await schreiben('aromaset', aromaset);
  }

  // Eigenes Gate, unabhaengig vom Geraetepark oben — sonst wuerde der
  // Singleton uebersprungen, sobald irgendein Geraet (z.B. aus der
  // Migration) schon existiert.
  const einstellungenVorhanden = await lesen('einstellungen', EINSTELLUNGEN_ID);
  if (!einstellungenVorhanden) {
    await schreiben('einstellungen', {
      id: EINSTELLUNGEN_ID,
      begruendungKoffein: true,
      begruendungBohne: true,
      sammelSchaeumen: 'einzeln',
    });
  }
}
