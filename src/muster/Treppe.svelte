<script lang="ts">
  // Muster 2 · Fünf-Stufen-Skala als Treppe (Übergabe, Abschnitt 2 · K52).
  //
  // Redesign v2, Etappe 1: Pixel-Balken (14–46px) wurden zu gestapelten
  // Strichen (1–3 je Stufe) — Julians Wunsch aus dem Bildsprache-Mockup,
  // "in der Höhe komprimiert, aber alle fünf Stufen weiter sichtbar". Die
  // Zahlenreihen sind keine Pixelmaße mehr, sondern Strich-Anzahlen:
  // bipolar faellt zur Mitte hin auf 1 (Ziel = wenigste Striche, traegt aber
  // immer den Akzent sobald erreicht), einseitig waechst von 1 auf 3.
  // istGefuellt() — welche Stufen "erreicht" sind — ist unveraendert.

  import { untrack } from 'svelte';

  type Art = 'bipolar' | 'einseitig';
  const STRICHE: Record<Art, readonly number[]> = {
    bipolar: [3, 2, 1, 2, 3],
    einseitig: [1, 1, 2, 3, 3],
  };

  let {
    titel,
    art,
    woerter,
    start,
    onWahl,
    mitErklaerung = true,
  }: {
    titel: string;
    art: Art;
    woerter: readonly [string, string, string, string, string];
    start?: number;
    onWahl?: (index: number) => void;
    /** false, wenn mehrere Treppen hintereinander stehen und ein einzelner
     *  zusammenfassender Satz die Erklaerung uebernimmt (siehe
     *  Verkostungsbogen.svelte) — Default true fuer den Alleinstand
     *  (Musterblatt.svelte). */
    mitErklaerung?: boolean;
  } = $props();

  // `start` ist nur der Anfangswert — danach führt die Komponente ihre
  // eigene Auswahl. untrack() macht dieses Nur-einmal-lesen ausdrücklich.
  let gewaehlt = $state<number | undefined>(untrack(() => start));
  const striche = $derived(STRICHE[art]);

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
    {#if mitErklaerung}
      <span class="meta">{art === 'bipolar' ? 'bipolar · Mitte ist Ziel' : 'einseitig · mehr ist mehr'}</span>
    {/if}
  </div>
  <div class="staebe">
    {#each striche as anzahl, i (i)}
      <button type="button" class="spalte" onclick={() => waehle(i)} aria-label={woerter[i]}>
        <span class="tick-stapel">
          {#each Array.from({ length: anzahl }) as _, t (t)}
            <span class="tick" class:gefuellt={istGefuellt(i)}></span>
          {/each}
        </span>
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
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    font-weight: var(--gw-titel);
    letter-spacing: 0.02em;
    color: var(--tinte);
  }
  .meta {
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  .staebe {
    display: flex;
    align-items: flex-end;
    gap: 4px;
  }
  .spalte {
    flex: 1;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    border: none;
    background: none;
    padding: 0;
    cursor: pointer;
    min-height: var(--treffer);
  }
  .tick-stapel {
    width: 18px;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 2px;
    padding-bottom: var(--r2);
  }
  .tick {
    display: block;
    width: 100%;
    height: 3px;
    border-radius: 1px;
    background: var(--fuellung-leicht);
  }
  .tick.gefuellt {
    background: var(--akzent);
  }
  .woerter {
    display: flex;
    gap: 4px;
  }
  .wort {
    flex: 1;
    min-width: 0;
    text-align: center;
    overflow-wrap: break-word;
    hyphens: auto;
    font-size: var(--fs-meta);
    color: var(--satz);
    font-weight: var(--gw-text);
  }
  .wort.gewaehlt {
    font-weight: var(--gw-titel);
    color: var(--tinte);
  }
</style>
