/**
 * Der reaktive Bestand — Bindeglied zwischen daten/ablage.ts (IndexedDB als
 * Wahrheit) und den Bildschirmen. Lebt bewusst in bereiche/, nicht in
 * daten/: daten/ darf kein Svelte importieren, das erzwingt
 * tests/schichten.test.ts.
 *
 * Schreiben ist sofort und offline (siehe CLAUDE.md "Datenquelle") — ein
 * schreiben() aktualisiert den Speicher direkt aus dem Rueckgabewert von
 * ablage.schreiben(), es folgt kein Neuladen der ganzen Sammlung.
 */
import { alle, schreiben as ablageSchreiben, type SammlungWert } from '../daten/ablage';
import type { Sammlung } from '../daten/db';

class Bestand {
  kaffees = $state<SammlungWert['kaffee'][]>([]);
  chargen = $state<SammlungWert['charge'][]>([]);
  profile = $state<SammlungWert['profil'][]>([]);
  gusslpaene = $state<SammlungWert['gussplan'][]>([]);
  shots = $state<SammlungWert['shot'][]>([]);

  geladen = $state(false);
  ladeFehler = $state<Error | undefined>(undefined);

  async laden(): Promise<void> {
    this.ladeFehler = undefined;
    try {
      const [kaffees, chargen, profile, gusslpaene, shots] = await Promise.all([
        alle('kaffee'),
        alle('charge'),
        alle('profil'),
        alle('gussplan'),
        alle('shot'),
      ]);
      this.kaffees = kaffees;
      this.chargen = chargen;
      this.profile = profile;
      this.gusslpaene = gusslpaene;
      this.shots = shots;
      this.geladen = true;
    } catch (fehler) {
      this.ladeFehler = fehler instanceof Error ? fehler : new Error(String(fehler));
    }
  }

  chargenVon(kaffeeId: string): SammlungWert['charge'][] {
    return this.chargen.filter((c) => c.kaffeeId === kaffeeId);
  }

  profileVon(kaffeeId: string): SammlungWert['profil'][] {
    return this.profile.filter((p) => p.kaffeeId === kaffeeId);
  }
}

export const bestand = new Bestand();

/** Schreibt einen Datensatz und haelt den Speicher synchron — wirft SchreibFehler weiter (K66). */
export async function schreiben<S extends Sammlung>(sammlung: S, wert: SammlungWert[S]): Promise<void> {
  await ablageSchreiben(sammlung, wert);
  const liste = listeFuer(sammlung);
  if (!liste) return;
  const index = liste.findIndex((eintrag) => (eintrag as { id: string }).id === (wert as { id: string }).id);
  if (index === -1) liste.push(wert as never);
  else liste[index] = wert as never;
}

function listeFuer(sammlung: Sammlung): unknown[] | undefined {
  switch (sammlung) {
    case 'kaffee':
      return bestand.kaffees;
    case 'charge':
      return bestand.chargen;
    case 'profil':
      return bestand.profile;
    case 'gussplan':
      return bestand.gusslpaene;
    case 'shot':
      return bestand.shots;
    default:
      return undefined;
  }
}
