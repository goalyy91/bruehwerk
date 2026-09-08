<script lang="ts">
  // Roestgrad als fuenf Bohnen — Systemregel aus der Uebergabe (K79), nicht
  // Bildschirmdetail: 13 x 17 px, gefuellt/leer, Luecke 4 px, Wort daneben.
  // Feste Stufenzahl, keine schlichtere Ersatzform im Leer- oder
  // Fehlerzustand — deshalb ein eigenes Bauteil statt Inline-Markup.
  //
  // UX-2: Die Form war ein reines CSS-Oval ohne die Mittelrille, die eine
  // Kaffeebohne erst als Bohne erkennbar macht ("sieht aus wie Punkte" —
  // Rueckmeldung zum Kaffees-Redesign). Jetzt ein eingebettetes SVG:
  // Aussenkontur plus die charakteristische S-Rille. Prop-Schnittstelle und
  // Massangabe bleiben unveraendert, nur die Zeichnung ist neu.

  const STUFEN = 5;
  const WOERTER = ['sehr hell', 'hell', 'mittel', 'dunkel', 'sehr dunkel'] as const;

  let {
    stufe,
    mitWort = true,
    onWahl,
  }: {
    /** 1-5, oder undefined fuer "noch nicht erfasst". */
    stufe?: number;
    mitWort?: boolean;
    /** Optional, additiv (wie IstGegenZiel::onAenderung) — tippbar nur, wenn gesetzt. */
    onWahl?: (stufe: number) => void;
  } = $props();

  const wort = $derived(stufe ? WOERTER[stufe - 1] : 'unbekannt');
</script>

{#snippet bohne(gefuellt: boolean)}
  <svg class="bohne" class:gefuellt viewBox="0 0 13 17" aria-hidden="true">
    <path
      class="kontur"
      d="M6.5 1C3.2 2.4 1 5.4 1 8.5S3.2 14.6 6.5 16c3.3-1.4 5.5-4.4 5.5-7.5S9.8 2.4 6.5 1Z"
    />
    <path class="rille" d="M6.5 2.6c-1.6 1.9-1 3.8.1 5.9s1.7 4 .1 5.9" />
  </svg>
{/snippet}

<div class="bohnen">
  <span class="reihe" role="img" aria-label={`Röstgrad ${stufe ?? 'unbekannt'} von ${STUFEN}`}>
    {#each Array(STUFEN) as _, i (i)}
      {@const gefuellt = stufe !== undefined && i < stufe}
      {#if onWahl}
        <button type="button" class="knopf" onclick={() => onWahl(i + 1)} aria-label={`Röstgrad ${i + 1}`}>
          {@render bohne(gefuellt)}
        </button>
      {:else}
        {@render bohne(gefuellt)}
      {/if}
    {/each}
  </span>
  {#if mitWort}<span class="wort">{wort}</span>{/if}
</div>

<style>
  .bohnen {
    display: flex;
    align-items: center;
    gap: var(--r2);
  }
  .reihe {
    display: flex;
    gap: 4px;
  }
  .knopf {
    /* Sichtbare Flaeche bleibt 13x17 (K79) — die Trefferflaeche wird per
       Padding+Gegen-Margin unsichtbar vergroessert, ohne den Abstand
       zwischen den Bohnen zu veraendern (Rueckmeldung: zu klein zum
       Tippen). */
    padding: 9px;
    margin: -9px;
    border: none;
    background: transparent;
    cursor: pointer;
  }
  .bohne {
    width: 13px;
    height: 17px;
    display: block;
  }
  .bohne .kontur {
    fill: none;
    stroke: var(--spur);
    stroke-width: 1;
  }
  .bohne .rille {
    fill: none;
    stroke: var(--spur);
    stroke-width: 1;
    stroke-linecap: round;
  }
  .bohne.gefuellt .kontur {
    fill: var(--tinte);
    stroke: var(--tinte);
  }
  .bohne.gefuellt .rille {
    /* Kontrast gegen die Fuellfarbe (--tinte) statt einer fest hellen Farbe —
       muss in beiden Themes sichtbar bleiben, --tinte kippt in Dunkel hell. */
    stroke: var(--grund);
  }
  .wort {
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
</style>
