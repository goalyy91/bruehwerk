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

  // Optionales `symbol` je Option — dieselben drei Herkunftszeichen aus K54
  // (gefuellter Punkt · Ring · gestrichelter Ring, siehe Herkunft.svelte),
  // fuer Auswahlen wie die Herkunft-Zeile der Temperaturtabelle. Rein
  // additiv: wer es weglaesst, sieht nur den Text wie bisher.
  type Zeichen = 'punkt' | 'ring' | 'gestrichelt';
  type Option<T extends string> = { wert: T; label: string; symbol?: Zeichen };

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
      {#if option.symbol}
        <span class="zeichen" class:voll={option.symbol === 'punkt'} class:ring={option.symbol === 'ring'} class:gestrichelt={option.symbol === 'gestrichelt'}></span>
      {/if}
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
    display: inline-flex;
    align-items: center;
    gap: 6px;
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
  .zeichen {
    display: inline-block;
    width: var(--zeichen);
    height: var(--zeichen);
    border-radius: 50%;
    flex: none;
  }
  .zeichen.voll {
    background: var(--tinte);
  }
  .zeichen.ring {
    border: 1px solid var(--gedaempft);
  }
  .zeichen.gestrichelt {
    border: 1px dashed var(--gedaempft);
  }
  .chip.gewaehlt {
    color: var(--tinte);
    font-weight: var(--gw-titel);
    box-shadow: inset 0 -2px 0 0 var(--akzent);
  }
</style>
