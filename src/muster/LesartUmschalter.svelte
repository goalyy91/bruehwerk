<script lang="ts">
  // Muster 15 · Lesart-Umschalter (Übergabe, Abschnitt 2 · K39 K73).
  // Zwei gleich große Felder, zwei Wörter, Auswahl als Gewicht +
  // Akzentstrich. Wechselt die Sprache derselben Daten, nicht ihren
  // Umfang — nicht zulässig für Umfangsfilter („meine · alle“), dafür
  // gibt es die Filter-Kopfzeile.

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
    gap: var(--r2);
  }
  .feld {
    flex: 1;
    min-height: 56px;
    border: none;
    border-radius: var(--radius-chip);
    background: var(--feld);
    color: var(--satz);
    font-family: var(--schrift);
    font-size: var(--fs-urteil);
    cursor: pointer;
  }
  .feld.gewaehlt {
    color: var(--tinte);
    font-weight: var(--gw-titel);
    box-shadow: inset 0 -2px 0 0 var(--akzent);
  }
</style>
