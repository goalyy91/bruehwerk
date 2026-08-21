/**
 * Der laufende Bruehgeraet-Entwurf — lebt ausserhalb von Bruehgeraetblatt.svelte,
 * damit er einen Bildschirmwechsel auf den PID-Screen (offene-punkte-ux.md
 * Punkt 3) uebersteht. Rahmen.svelte raeumt Bruehgeraetblatt.svelte beim
 * Wechsel auf die Route 'tempReferenz' komplett ab — ein rein lokaler
 * $state waere damit verloren, noch nicht gespeicherte Eingaben inklusive.
 *
 * Es kann jeweils nur ein Bruehgeraet-Formular offen sein (K-Analogie zu
 * GussplanEditor.svelte, das denselben Trick fuer Profile nutzt: Zustand im
 * Formular, kein sofortiges Schreiben in die Ablage) — deshalb genuegt ein
 * einzelner Singleton statt einer Sammlung nach id.
 */
import type { Bruehgeraet } from '../../daten/schema';

let entwurf = $state<Bruehgeraet | undefined>(undefined);

export const bruehgeraetEntwurf = {
  get aktuell(): Bruehgeraet | undefined {
    return entwurf;
  },
  setzen(neu: Bruehgeraet): void {
    entwurf = neu;
  },
  verwerfen(): void {
    entwurf = undefined;
  },
};
