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
 *
 * UX-Korrekturrunde: `start` haelt den Ausgangsstand fest (Startbelegung
 * beim Bearbeiten, leerer Entwurf beim Neu-Anlegen), damit Bruehgeraetblatt.svelte
 * pruefen kann, ob "zurueck" wirklich etwas verwirft — sonst loescht ein "‹"
 * nach zehn gepflegten Temperaturzeilen den Entwurf ohne Rueckfrage.
 */
import type { Bruehgeraet } from '../../daten/schema';

let entwurf = $state<Bruehgeraet | undefined>(undefined);
let start: Bruehgeraet | undefined = undefined;

export const bruehgeraetEntwurf = {
  get aktuell(): Bruehgeraet | undefined {
    return entwurf;
  },
  setzen(neu: Bruehgeraet): void {
    entwurf = neu;
    start = structuredClone($state.snapshot(neu));
  },
  verwerfen(): void {
    entwurf = undefined;
    start = undefined;
  },
  /** true, sobald sich der Entwurf vom Ausgangsstand unterscheidet. */
  istVeraendert(): boolean {
    if (!entwurf || !start) return false;
    return JSON.stringify($state.snapshot(entwurf)) !== JSON.stringify(start);
  },
};
