/**
 * Traegt das per Zwei-Tap-Kachel angetippte Getraenk von Bar.svelte zu
 * BestellungAufnehmen.svelte ueber den Bildschirmwechsel hinweg — ein
 * lokaler $state in Bar.svelte waere beim Navigieren verloren. Gleiches,
 * bereits etabliertes Muster wie
 * einstellungen/bruehgeraetEntwurf.svelte.ts (Singleton-Draft ausserhalb
 * der Komponente).
 *
 * Beim Einstieg ueber den allgemeinen "Getraenk waehlen"-Knopf bleibt das
 * Feld leer — nur die Kacheln setzen es.
 */
let vorausgewaehlterGetraenkId = $state<string | undefined>(undefined);

export const bestellungEntwurf = {
  vorwaehlen(getraenkId: string): void {
    vorausgewaehlterGetraenkId = getraenkId;
  },
  /** Liest den Wert und leert ihn sofort — gilt nur fuer den naechsten Einstieg. */
  abgeholt(): string | undefined {
    const id = vorausgewaehlterGetraenkId;
    vorausgewaehlterGetraenkId = undefined;
    return id;
  },
};
