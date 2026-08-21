<script lang="ts">
  // Bewertung als fuenf Sterne — Systemregel aus der Uebergabe (K79), immer
  // in dieser Form, keine schlichtere Ersatzform in Leer- oder
  // Fehlerzustaenden.
  //
  // K57 ("kein Urteil in der Bestellung, ausschliesslich ueber die
  // Historie") betrifft Shot.urteil an der einzelnen Tasse — nicht dieses
  // Feld. Kaffee.bewertung ist eine eigene, direkt gepflegte Eigenschaft
  // der Bohne (K51, "Zwei Groessen, die man vergleicht, ohne zu lesen"),
  // genau wie Roestgrad, und stand schon in Notion als manuell gesetzter
  // Stern-Wert. Deshalb optional tippbar wie Bohnen.svelte::onWahl.

  const STUFEN = 5;

  let {
    wert,
    onWahl,
  }: {
    /** 0-5, halbe Schritte erlaubt (z.B. 3.5); undefined fuer "noch keine". */
    wert?: number;
    onWahl?: (wert: number) => void;
  } = $props();
</script>

<span class="sterne" role="img" aria-label={wert !== undefined ? `Bewertung ${wert} von ${STUFEN} Sternen` : 'noch keine Bewertung'}>
  {#each Array(STUFEN) as _, i (i)}
    {@const anteil = wert === undefined ? 0 : Math.min(1, Math.max(0, wert - i))}
    {#if onWahl}
      <button type="button" class="stern tippbar" style:--anteil={anteil} onclick={() => onWahl(i + 1)} aria-label={`Bewertung ${i + 1}`}></button>
    {:else}
      <span class="stern" style:--anteil={anteil}></span>
    {/if}
  {/each}
</span>

<style>
  .sterne {
    display: inline-flex;
    gap: 2px;
  }
  .stern {
    position: relative;
    width: 14px;
    height: 14px;
    color: var(--spur);
  }
  .stern::before,
  .stern::after {
    content: '★';
    position: absolute;
    inset: 0;
    font-size: 14px;
    line-height: 1;
  }
  .stern::before {
    color: var(--spur);
  }
  .stern::after {
    color: var(--tinte);
    width: calc(var(--anteil) * 100%);
    overflow: hidden;
    white-space: nowrap;
  }
  .stern.tippbar {
    padding: 0;
    background: transparent;
    border: none;
    cursor: pointer;
  }
</style>
