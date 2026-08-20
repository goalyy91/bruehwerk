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
import { alle, schreiben } from './ablage';
import { MUEHLEN, BRUEHGERAETE, ZUBEHOER, SETUPS, ABLAUF_LEER } from './stammdaten';

export async function seedFallsLeer(): Promise<void> {
  const vorhandene = await alle('bruehgeraet');
  if (vorhandene.length > 0) return;

  await schreiben('ablauf', ABLAUF_LEER);
  for (const muehle of MUEHLEN) await schreiben('muehle', muehle);
  for (const bruehgeraet of BRUEHGERAETE) await schreiben('bruehgeraet', bruehgeraet);
  for (const zubehoer of ZUBEHOER) await schreiben('zubehoer', zubehoer);
  for (const setup of SETUPS) await schreiben('setup', setup);
}
