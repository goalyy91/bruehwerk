<script lang="ts">
  // Segment — Auswahl aus 2-3 kurzen Optionen als durchgehende Leiste, alle
  // Felder gleich breit (UX-2). Ersetzt Einzelauswahl ueberall dort, wo eine
  // Zeile aus ungleich breiten Chips unruhig wirkt (Rueckmeldung zum
  // Kaffees-Redesign) — fuer laengere oder unterschiedlich lange Optionen
  // bleibt AuswahlListe.svelte die richtige Form.
  //
  // Visueller Redesign-Reset (Handoff Abschnitt 3.8 "Segment"): Bahn in
  // Vertiefung, Radius 999, Innenpolster 3, gewähltes Feld = Füllfläche.
  // Der frühere Akzentstrich (Einzelauswahl u.a.) entfällt hier komplett zu-
  // gunsten der einen gefüllten Fläche des Themes.

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
    gap: 2px;
    background: var(--vertiefung);
    border-radius: var(--r-pille);
    padding: var(--segment-bahn-polster);
  }
  .feld {
    flex: 1;
    min-height: var(--segment-feld-hoehe);
    padding: 0 var(--r2);
    border: none;
    border-radius: var(--r-pille);
    background: transparent;
    color: var(--satz);
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    cursor: pointer;
    transition: background var(--t-auswahl) var(--e-rein);
  }
  .feld.gewaehlt {
    background: var(--fuellung);
    color: var(--auf-fuellung);
  }
</style>
