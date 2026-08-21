<script lang="ts">
  // Einzelauswahl — Ergaenzung zum Musterblatt (Paket 03, Korrekturrunde).
  // Dieselbe Chip-Optik wie Muster 3 (Chips.svelte): gleiche Tokens, gleicher
  // "gewaehlt"-Zustand (Akzentstrich unten). Anders als Chips.svelte aber
  // *einfach* statt mehrfach, ohne Staerke-Untermenue, kontrolliert ueber
  // wert/onWahl — ersetzt ein natives <select>, wo wenige Optionen reichen.
  //
  // Kein eigenes Muster aus der Uebergabe, weil kein Alltagspfad-Bildschirm
  // eine Einzelauswahl aus > 2 Optionen braucht (K73s LesartUmschalter deckt
  // genau 2 ab). Verwaltungsformulare (Kaffee/Geraet anlegen) brauchen es
  // trotzdem — hier die Loesung in derselben Formsprache statt einer
  // nativen.

  type Option<T extends string> = { wert: T; label: string };

  let {
    optionen,
    wert,
    onWahl,
  }: {
    optionen: readonly Option<string>[];
    wert: string;
    onWahl: (wert: string) => void;
  } = $props();
</script>

<div class="einzelauswahl">
  {#each optionen as option (option.wert)}
    <button
      type="button"
      class="chip"
      class:gewaehlt={option.wert === wert}
      onclick={() => onWahl(option.wert)}
    >
      {option.label}
    </button>
  {/each}
</div>

<style>
  .einzelauswahl {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .chip {
    min-height: var(--treffer);
    padding: 0 var(--r3);
    border: 1px solid var(--feld-rahmen);
    border-radius: var(--radius-chip);
    background: var(--feld);
    color: var(--satz);
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    cursor: pointer;
  }
  .chip.gewaehlt {
    color: var(--tinte);
    font-weight: var(--gw-titel);
    box-shadow: inset 0 -2px 0 0 var(--akzent);
  }
</style>
