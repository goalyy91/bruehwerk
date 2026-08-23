<script lang="ts">
  // Muster 15 · Lesart-Umschalter (Übergabe, Abschnitt 2 · K39 K73).
  // Zwei gleich große Felder, zwei Wörter. Wechselt die Sprache derselben
  // Daten, nicht ihren Umfang — nicht zulässig für Umfangsfilter
  // („meine · alle“), dafür gibt es die Filter-Kopfzeile.
  //
  // Visueller Redesign-Reset (Handoff Komponenten-Mapping: „wie Segment“) —
  // dieselbe Pillen-Bahn wie Segment.svelte: Vertiefung, Radius 999, ge-
  // wähltes Feld = Füllfläche statt Fettschrift + Akzentstrich.

  import { untrack } from 'svelte';

  let {
    optionA,
    optionB,
    start = 'a',
    onWahl,
  }: {
    optionA: string;
    optionB: string;
    start?: 'a' | 'b';
    onWahl?: (lesart: 'a' | 'b') => void;
  } = $props();

  let lesart = $state<'a' | 'b'>(untrack(() => start));

  function waehle(neu: 'a' | 'b') {
    lesart = neu;
    onWahl?.(neu);
  }
</script>

<div class="umschalter">
  <button type="button" class="feld" class:gewaehlt={lesart === 'a'} onclick={() => waehle('a')}>
    {optionA}
  </button>
  <button type="button" class="feld" class:gewaehlt={lesart === 'b'} onclick={() => waehle('b')}>
    {optionB}
  </button>
</div>

<style>
  .umschalter {
    display: flex;
    gap: 2px;
    background: var(--vertiefung);
    border-radius: var(--r-pille);
    padding: var(--segment-bahn-polster);
  }
  .feld {
    flex: 1;
    min-height: var(--segment-feld-hoehe);
    border: none;
    border-radius: var(--r-pille);
    background: transparent;
    color: var(--satz);
    font-family: var(--schrift);
    font-size: var(--fs-urteil);
    cursor: pointer;
    transition: background var(--t-auswahl) var(--e-rein);
  }
  .feld.gewaehlt {
    background: var(--fuellung);
    color: var(--auf-fuellung);
  }
</style>
