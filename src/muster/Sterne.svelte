<script lang="ts">
  // Bewertung als fuenf Sterne — Systemregel aus der Uebergabe (K79), immer
  // in dieser Form, keine schlichtere Ersatzform in Leer- oder
  // Fehlerzustaenden. Bewertung entsteht ausschliesslich in der Historie
  // (K57) — dieses Bauteil zeigt nur an, es waehlt hier nichts.

  const STUFEN = 5;

  let {
    wert,
  }: {
    /** 0-5, halbe Schritte erlaubt (z.B. 3.5); undefined fuer "noch keine". */
    wert?: number;
  } = $props();
</script>

<span class="sterne" role="img" aria-label={wert !== undefined ? `Bewertung ${wert} von ${STUFEN} Sternen` : 'noch keine Bewertung'}>
  {#each Array(STUFEN) as _, i (i)}
    {@const anteil = wert === undefined ? 0 : Math.min(1, Math.max(0, wert - i))}
    <span class="stern" style:--anteil={anteil}></span>
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
</style>
