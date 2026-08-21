<script lang="ts">
  // Roestgrad als fuenf Bohnen — Systemregel aus der Uebergabe (K79), nicht
  // Bildschirmdetail: 13 x 17 px, gefuellt/leer, Luecke 4 px, Wort daneben.
  // Feste Stufenzahl, keine schlichtere Ersatzform im Leer- oder
  // Fehlerzustand — deshalb ein eigenes Bauteil statt Inline-Markup.

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

<div class="bohnen">
  <span class="reihe" role="img" aria-label={`Röstgrad ${stufe ?? 'unbekannt'} von ${STUFEN}`}>
    {#each Array(STUFEN) as _, i (i)}
      {#if onWahl}
        <button type="button" class="bohne tippbar" class:gefuellt={stufe !== undefined && i < stufe}
          onclick={() => onWahl(i + 1)} aria-label={`Röstgrad ${i + 1}`}></button>
      {:else}
        <span class="bohne" class:gefuellt={stufe !== undefined && i < stufe}></span>
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
  .bohne {
    width: 13px;
    height: 17px;
    border: 1px solid var(--spur);
    border-radius: 60% 60% 60% 60% / 50% 50% 50% 50%;
  }
  .bohne.gefuellt {
    background: var(--tinte);
    border-color: var(--tinte);
  }
  .bohne.tippbar {
    padding: 0;
    background: transparent;
    cursor: pointer;
    /* Sichtbare Flaeche bleibt 13x17 (K79), Trefferflaeche wird ueber
       Padding im umgebenden Formularkontext sichergestellt. */
  }
  .bohne.tippbar.gefuellt {
    background: var(--tinte);
  }
  .wort {
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
</style>
