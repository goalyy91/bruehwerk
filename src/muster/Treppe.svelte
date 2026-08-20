<script lang="ts">
  // Muster 2 · Fünf-Stufen-Skala als Treppe (Übergabe, Abschnitt 2).
  // Höhe der Stäbe = Entfernung vom Ziel. bipolar 46·32·18·32·46 px (Mitte
  // am niedrigsten, trägt aber immer den Akzent), einseitig 14·22·30·38·46 px.
  // Sechs Größen sind gleichrangig, keine Trennung in Achsen und Skalen.

  import { untrack } from 'svelte';

  type Art = 'bipolar' | 'einseitig';
  const HOEHEN: Record<Art, readonly number[]> = {
    bipolar: [46, 32, 18, 32, 46],
    einseitig: [14, 22, 30, 38, 46],
  };

  let {
    titel,
    art,
    woerter,
    start,
    onWahl,
  }: {
    titel: string;
    art: Art;
    woerter: readonly [string, string, string, string, string];
    start?: number;
    onWahl?: (index: number) => void;
  } = $props();

  // `start` ist nur der Anfangswert — danach führt die Komponente ihre
  // eigene Auswahl. untrack() macht dieses Nur-einmal-lesen ausdrücklich.
  let gewaehlt = $state<number | undefined>(untrack(() => start));
  const hoehen = $derived(HOEHEN[art]);

  function istGefuellt(i: number): boolean {
    if (gewaehlt === undefined) return i === 2 && art === 'bipolar';
    if (art === 'bipolar') {
      const lo = Math.min(gewaehlt, 2);
      const hi = Math.max(gewaehlt, 2);
      return i >= lo && i <= hi;
    }
    return i <= gewaehlt;
  }

  function waehle(i: number) {
    gewaehlt = i;
    onWahl?.(i);
  }
</script>

<div class="treppe">
  <div class="kopf">
    <span class="titel">{titel}</span>
    <span class="meta">{art === 'bipolar' ? 'bipolar · Mitte ist Ziel' : 'einseitig · mehr ist mehr'}</span>
  </div>
  <div class="staebe">
    {#each hoehen as hoehe, i (i)}
      <button type="button" class="spalte" onclick={() => waehle(i)} aria-label={woerter[i]}>
        <span class="stab" class:gefuellt={istGefuellt(i)} style:height={`${hoehe}px`}></span>
      </button>
    {/each}
  </div>
  <div class="woerter">
    {#each woerter as wort, i (i)}
      <span class="wort" class:gewaehlt={gewaehlt === i}>{wort}</span>
    {/each}
  </div>
</div>

<style>
  .treppe {
    display: flex;
    flex-direction: column;
    gap: var(--r2);
  }
  .kopf {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  .titel {
    font-size: var(--fs-satz);
    font-weight: var(--gw-titel);
    color: var(--tinte);
  }
  .meta {
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  .staebe {
    display: flex;
    align-items: flex-end;
    gap: 4px;
    height: 46px;
  }
  .spalte {
    flex: 1;
    display: flex;
    align-items: flex-end;
    border: none;
    background: none;
    padding: 0;
    cursor: pointer;
    min-height: var(--treffer);
  }
  .stab {
    display: block;
    width: 100%;
    background: var(--spur);
    border-radius: 1px;
  }
  .stab.gefuellt {
    background: var(--akzent);
  }
  .woerter {
    display: flex;
    gap: 4px;
  }
  .wort {
    flex: 1;
    text-align: center;
    font-size: var(--fs-meta);
    color: var(--satz);
    font-weight: var(--gw-text);
  }
  .wort.gewaehlt {
    font-weight: var(--gw-titel);
    color: var(--tinte);
  }
</style>
