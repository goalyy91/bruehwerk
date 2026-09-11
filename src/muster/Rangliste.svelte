<script lang="ts">
  // Muster 11 · Rangliste (Übergabe, Abschnitt 2 · K25 K71).
  // Im Alltag ohne Score, in der Auswertung dasselbe Muster mit Balken und
  // Zahl. Erster Eintrag in 600. Die Reihenfolge gehört immer einer
  // Person, und die Person steht im Gruppenkopf (K71 — kein Possessiv).

  // `farbe` optional (Aromapaket): der Kategorie-Punkt vor dem Namen, wenn
  // ein Aufrufer ihn mitgibt — rein additiv, andere Aufrufer (Getraenke-,
  // Bestellungs-Rangliste) lassen es weg und sehen keine Aenderung.
  //
  // `onKlick` optional (Uebungsmodus-Rueckmeldung): macht den Namen
  // begehbar, z. B. zum Datenblatt eines Aromas. Rein additiv wie `farbe` —
  // ohne Aufrufer bleibt der Name ein <span> wie bisher. Optik bewusst
  // unveraendert (kein Akzentton, kein Chevron): Praezedenzfall ist die
  // "Muehle X"-Zeile in Blattzeile.svelte, die navigiert und trotzdem ein
  // normaler Objektname bleibt.
  type Eintrag = { id: string; name: string; wert?: number; farbe?: string; onKlick?: () => void };

  let {
    person,
    eintraege,
    mitBalken = false,
    grenze,
  }: {
    person: string;
    eintraege: Eintrag[];
    mitBalken?: boolean;
    /** Ungesetzt: alles zeigen (bisheriges Verhalten). Gesetzt: erst die ersten `grenze`,
     * dahinter ein Umschalter "+ N"/"weniger" — fuer lange Listen (Aromapaket, Uebungsmodus). */
    grenze?: number;
  } = $props();

  const maxWert = $derived(Math.max(1, ...eintraege.map((e) => e.wert ?? 0)));

  let ausgeklappt = $state(false);
  const sichtbar = $derived(grenze !== undefined && !ausgeklappt ? eintraege.slice(0, grenze) : eintraege);
</script>

<div class="rangliste">
  <div class="gruppenkopf">{person}</div>
  {#if eintraege.length === 0}
    <div class="leer">Reihenfolge unbekannt · alphabetisch</div>
  {:else}
    {#each sichtbar as eintrag, i (eintrag.id)}
      <div class="zeile">
        {#if eintrag.onKlick}
          <button type="button" class="name klickbar" class:erste={i === 0} onclick={eintrag.onKlick}>
            {#if eintrag.farbe}<span class="kategorie-punkt" style="--punkt-farbe: {eintrag.farbe}"></span>{/if}
            {eintrag.name}
          </button>
        {:else}
          <span class="name" class:erste={i === 0}>
            {#if eintrag.farbe}<span class="kategorie-punkt" style="--punkt-farbe: {eintrag.farbe}"></span>{/if}
            {eintrag.name}
          </span>
        {/if}
        {#if mitBalken && eintrag.wert !== undefined}
          <span class="balkenspur">
            <span class="balken" style:width={`${(eintrag.wert / maxWert) * 100}%`}></span>
          </span>
          <span class="zahl zahlspalte">{eintrag.wert}</span>
        {/if}
      </div>
    {/each}
    {#if grenze !== undefined && eintraege.length > grenze}
      <button type="button" class="mehr" onclick={() => (ausgeklappt = !ausgeklappt)}>
        {ausgeklappt ? 'weniger' : `+ ${eintraege.length - grenze}`}
      </button>
    {/if}
  {/if}
</div>

<style>
  .rangliste {
    display: flex;
    flex-direction: column;
  }
  .gruppenkopf {
    font-size: var(--fs-label);
    letter-spacing: var(--label-spacing);
    text-transform: uppercase;
    color: var(--gedaempft);
    padding-bottom: var(--r2);
  }
  .zeile {
    display: flex;
    align-items: center;
    gap: var(--r3);
    min-height: 44px;
  }
  .name {
    flex: none;
    width: var(--rangname);
    font-size: var(--fs-satz);
    color: var(--satz);
  }
  .name.erste {
    font-weight: var(--gw-titel);
    color: var(--tinte);
  }
  /* Optik bleibt die eines Objektnamens (siehe Kopfkommentar) — nur
     Knopf-Reset und Zeiger kommen dazu. */
  button.name.klickbar {
    border: none;
    background: none;
    padding: 0;
    text-align: left;
    font-family: inherit;
    cursor: pointer;
  }
  .balkenspur {
    flex: 1;
    height: 10px;
    background: var(--spur);
  }
  .balken {
    display: block;
    height: 100%;
    background: var(--akzent);
  }
  .zahlspalte {
    flex: none;
    width: var(--rangzahl);
    text-align: right;
    font-size: var(--fs-satz);
    color: var(--gedaempft);
  }
  .leer {
    font-size: var(--fs-satz);
    color: var(--gedaempft);
  }
  /* Wie der "+ N"-Umschalter in DrillDown.svelte: Akzentfarbe statt der
     Zeilenfarbe — das ist eine Handlung, kein weiterer Rang-Eintrag. */
  .mehr {
    margin-top: 4px;
    padding: 4px 0;
    border: none;
    background: none;
    color: var(--akzent);
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    text-align: left;
    cursor: pointer;
  }
</style>
