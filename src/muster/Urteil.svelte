<script lang="ts">
  // Muster 1 · Urteil (Sitzung 6 - Übergabe, Abschnitt 2).
  // 2×2-Gitter, vier gleich große Kacheln, Wort mittig, kein Rangzeichen.
  //
  // Visueller Redesign-Reset (Handoff Abschnitt 3.6/3.8): Gewählt ist jetzt
  // ausschließlich die Füllfläche des Themes — kein Akzentstrich mehr, kein
  // zusätzliches "gut"-Zeichen obendrauf. Das Zustandszeichen (gefüllt/halb/
  // schraffiert) bleibt eine eigene Sprache für Messwerte (siehe
  // Verlaufskurve.svelte, IstGegenZiel.svelte) und beschreibt dort einen
  // Shot-Befund — hier ging es um die Auswahlmarkierung einer Bedienfläche,
  // die beiden Zeichen wurden vorher unnötig vermischt.

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
    min-height: var(--urteilskachel-hoehe);
    border: none;
    border-radius: var(--r-kachel);
    background: var(--vertiefung);
    color: var(--satz);
    font-family: var(--schrift);
    font-size: var(--fs-urteil);
    font-weight: var(--gw-text);
    cursor: pointer;
    transition: background var(--t-auswahl) var(--e-rein);
  }
  .kachel.gewaehlt {
    background: var(--fuellung);
    color: var(--auf-fuellung);
  }
</style>
