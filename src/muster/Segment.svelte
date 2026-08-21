<script lang="ts">
  // Segment — Auswahl aus 2-3 kurzen Optionen als durchgehende Leiste, alle
  // Felder gleich breit (UX-2). Ersetzt Einzelauswahl ueberall dort, wo eine
  // Zeile aus ungleich breiten Chips unruhig wirkt (Rueckmeldung zum
  // Kaffees-Redesign) — fuer laengere oder unterschiedlich lange Optionen
  // bleibt AuswahlListe.svelte die richtige Form.

  let {
    optionen,
    wert,
    onWahl,
  }: {
    optionen: readonly { wert: string; label: string }[];
    wert: string;
    onWahl: (wert: string) => void;
  } = $props();
</script>

<div class="segment" role="group">
  {#each optionen as option (option.wert)}
    <button
      type="button"
      class="feld"
      class:gewaehlt={option.wert === wert}
      aria-pressed={option.wert === wert}
      onclick={() => onWahl(option.wert)}
    >
      {option.label}
    </button>
  {/each}
</div>

<style>
  .segment {
    display: flex;
    border: 1px solid var(--feld-rahmen);
    border-radius: var(--radius-chip);
    overflow: hidden;
  }
  .feld {
    flex: 1;
    min-height: var(--treffer);
    padding: 0 var(--r2);
    border: none;
    border-left: 1px solid var(--feld-rahmen);
    background: var(--feld);
    color: var(--gedaempft);
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    cursor: pointer;
  }
  .feld:first-child {
    border-left: none;
  }
  .feld.gewaehlt {
    background: var(--akzent);
    color: var(--h-papier);
    font-weight: var(--gw-titel);
  }
</style>
