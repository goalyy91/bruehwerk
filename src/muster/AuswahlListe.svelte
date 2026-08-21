<script lang="ts">
  // AuswahlListe — Auswahl aus n Optionen als gestapelte Zeilen ueber die
  // volle Breite, die gewaehlte mit Haken (UX-2). Fuer laengere oder
  // unterschiedlich lange Listen, bei denen Segment.svelte (immer gleich
  // breite Felder) nicht mehr passt — z. B. Aufbereitung mit sechs Optionen
  // oder eine Setup-Auswahl mit freien Namen. Kein Overlay, keine eigene
  // Buehne: bleibt ein einfaches Bauteil im Fluss der Seite, ruehrt also den
  // Verlauf aus dem Navigations-Umbau (UX-1) nicht an.
  //
  // Rueckmeldung: ohne umrahmenden Kasten sah die leere/unausgewaehlte
  // Liste wie gewoehnlicher Fliesstext aus, nicht wie ein Bedienelement —
  // erst der Tap (und die Markierung danach) machte sichtbar, dass da
  // etwas zum Auswaehlen war. Jetzt derselbe Kasten wie ein Textfeld
  // (--feld/--feld-rahmen), von Anfang an erkennbar.

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

<div class="liste">
  {#each optionen as option (option.wert)}
    <button
      type="button"
      class="zeile"
      class:gewaehlt={option.wert === wert}
      aria-pressed={option.wert === wert}
      onclick={() => onWahl(option.wert)}
    >
      <span class="label">{option.label}</span>
      {#if option.wert === wert}<span class="haken" aria-hidden="true">✓</span>{/if}
    </button>
  {/each}
</div>

<style>
  .liste {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--feld-rahmen);
    background: var(--feld);
  }
  .zeile {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-height: var(--treffer);
    padding: 0 var(--r3);
    border: none;
    border-bottom: 1px solid var(--linie-zart);
    background: transparent;
    color: var(--satz);
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    text-align: left;
    cursor: pointer;
  }
  .zeile:last-child {
    border-bottom: none;
  }
  .zeile.gewaehlt {
    color: var(--tinte);
    font-weight: var(--gw-titel);
  }
  .haken {
    color: var(--akzent);
  }
</style>
