<script lang="ts">
  // Muster 11 · Rangliste (Übergabe, Abschnitt 2 · K25 K71).
  // Im Alltag ohne Score, in der Auswertung dasselbe Muster mit Balken und
  // Zahl. Erster Eintrag in 600. Die Reihenfolge gehört immer einer
  // Person, und die Person steht im Gruppenkopf (K71 — kein Possessiv).

  type Eintrag = { id: string; name: string; wert?: number };

  let {
    person,
    eintraege,
    mitBalken = false,
  }: {
    person: string;
    eintraege: Eintrag[];
    mitBalken?: boolean;
  } = $props();

  const maxWert = $derived(Math.max(1, ...eintraege.map((e) => e.wert ?? 0)));
</script>

<div class="rangliste">
  <div class="gruppenkopf">{person}</div>
  {#if eintraege.length === 0}
    <div class="leer">Reihenfolge unbekannt · alphabetisch</div>
  {:else}
    {#each eintraege as eintrag, i (eintrag.id)}
      <div class="zeile">
        <span class="name" class:erste={i === 0}>{eintrag.name}</span>
        {#if mitBalken && eintrag.wert !== undefined}
          <span class="balkenspur">
            <span class="balken" style:width={`${(eintrag.wert / maxWert) * 100}%`}></span>
          </span>
          <span class="zahl zahlspalte">{eintrag.wert}</span>
        {/if}
      </div>
    {/each}
  {/if}
</div>

<style>
  .rangliste {
    display: flex;
    flex-direction: column;
  }
  .gruppenkopf {
    font-size: var(--fs-label);
    letter-spacing: var(--label-spacing);
    text-transform: uppercase;
    color: var(--gedaempft);
    padding-bottom: var(--r2);
  }
  .zeile {
    display: flex;
    align-items: center;
    gap: var(--r3);
    min-height: 44px;
  }
  .name {
    flex: none;
    width: var(--rangname);
    font-size: var(--fs-satz);
    color: var(--satz);
  }
  .name.erste {
    font-weight: var(--gw-titel);
    color: var(--tinte);
  }
  .balkenspur {
    flex: 1;
    height: 10px;
    background: var(--spur);
  }
  .balken {
    display: block;
    height: 100%;
    background: var(--akzent);
  }
  .zahlspalte {
    flex: none;
    width: var(--rangzahl);
    text-align: right;
    font-size: var(--fs-satz);
    color: var(--gedaempft);
  }
  .leer {
    font-size: var(--fs-satz);
    color: var(--gedaempft);
  }
</style>
