<script lang="ts">
  // Muster 1 · Urteil (Sitzung 6 - Übergabe, Abschnitt 2).
  // 2×2-Gitter, vier gleich große Kacheln, Wort mittig, kein Rangzeichen.
  // Gewählt: Tinte 600 + Akzentstrich unten 2 px + Marke „gut“.

  import { untrack } from 'svelte';

  const STUFEN = ['daneben', 'okay', 'sehr gut', 'Referenz'] as const;
  type Stufe = (typeof STUFEN)[number];

  let { start, onWahl }: { start?: Stufe; onWahl?: (stufe: Stufe) => void } = $props();

  // `start` ist nur der Anfangswert — danach führt die Komponente ihre
  // eigene Auswahl. untrack() macht dieses Nur-einmal-lesen ausdrücklich.
  let gewaehlt = $state<Stufe | undefined>(untrack(() => start));

  function waehle(stufe: Stufe) {
    gewaehlt = stufe;
    onWahl?.(stufe);
  }
</script>

<div class="urteil">
  {#each STUFEN as stufe (stufe)}
    <button
      type="button"
      class="kachel"
      class:gewaehlt={gewaehlt === stufe}
      onclick={() => waehle(stufe)}
    >
      {#if gewaehlt === stufe}<span class="marke" aria-hidden="true"></span>{/if}
      {stufe}
    </button>
  {/each}
</div>

<style>
  .urteil {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--r2);
  }
  .kachel {
    position: relative;
    min-height: 60px;
    border: none;
    border-radius: var(--radius-chip);
    background: var(--feld);
    color: var(--satz);
    font-family: var(--schrift);
    font-size: var(--fs-urteil);
    font-weight: var(--gw-text);
    cursor: pointer;
  }
  .kachel.gewaehlt {
    color: var(--tinte);
    font-weight: var(--gw-titel);
    box-shadow: inset 0 -2px 0 0 var(--akzent);
  }
  .marke {
    position: absolute;
    top: var(--r2);
    right: var(--r2);
    width: 10px;
    height: 10px;
    background: var(--marke-gut);
  }
</style>
