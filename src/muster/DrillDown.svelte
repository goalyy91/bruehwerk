<script lang="ts">
  // Muster 10 · Drill-down (Übergabe, Abschnitt 2).
  // Stapeln statt springen: Tap setzt und öffnet zugleich, der Pfad bleibt
  // sichtbar, eine Zurück-Zeile führt aus dem Muster heraus, Gewähltes
  // sammelt sich in der Leiste am Fuß mit Zählung und „+ N“ ab der Grenze.

  type Knoten = { id: string; label: string; kinder?: Knoten[] };

  let {
    ebenen,
    grenze = 6,
  }: {
    ebenen: Knoten[];
    grenze?: number;
  } = $props();

  let pfad = $state<Knoten[]>([]);
  let gewaehlt = $state<Knoten[]>([]);

  const aktuelleEbene = $derived(pfad.length === 0 ? ebenen : (pfad[pfad.length - 1]?.kinder ?? []));

  function oeffneOderWaehle(knoten: Knoten) {
    if (knoten.kinder && knoten.kinder.length > 0) {
      pfad = [...pfad, knoten];
    } else if (!gewaehlt.some((g) => g.id === knoten.id)) {
      gewaehlt = [...gewaehlt, knoten];
    }
  }

  function zurueck() {
    pfad = pfad.slice(0, -1);
  }
</script>

<div class="drilldown">
  {#if pfad.length > 0}
    <button type="button" class="zurueck" onclick={zurueck}>
      ‹ {pfad[pfad.length - 1]?.label}
    </button>
    <div class="pfad">{pfad.map((p) => p.label).join(' › ')}</div>
  {/if}

  <div class="ebene">
    {#each aktuelleEbene as knoten (knoten.id)}
      <button type="button" class="eintrag" class:gewaehlt={gewaehlt.some((g) => g.id === knoten.id)} onclick={() => oeffneOderWaehle(knoten)}>
        {knoten.label}
      </button>
    {/each}
  </div>

  {#if gewaehlt.length > 0}
    <div class="leiste">
      <span class="zaehlung">{gewaehlt.length}</span>
      {#each gewaehlt.slice(0, grenze) as g (g.id)}
        <span class="marke">{g.label}</span>
      {/each}
      {#if gewaehlt.length > grenze}
        <span class="mehr">+ {gewaehlt.length - grenze}</span>
      {/if}
    </div>
  {/if}
</div>

<style>
  .drilldown {
    display: flex;
    flex-direction: column;
  }
  .zurueck {
    min-height: 48px;
    padding: 0 var(--r3);
    border: none;
    background: var(--ruhig);
    color: var(--tinte);
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    text-align: left;
    cursor: pointer;
  }
  .pfad {
    padding: 4px var(--r3) 0;
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  .ebene {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .eintrag {
    min-height: var(--treffer);
    padding: 0 var(--r3);
    border: 1px solid var(--feld-rahmen);
    background: var(--feld);
    color: var(--satz);
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    text-align: left;
    cursor: pointer;
  }
  .eintrag.gewaehlt {
    color: var(--tinte);
    font-weight: var(--gw-titel);
    box-shadow: inset 0 -2px 0 0 var(--akzent);
  }
  .leiste {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    min-height: 76px;
    padding: var(--r3);
    border-top: 1px solid var(--linie);
  }
  .zaehlung {
    font-size: var(--fs-titel);
    color: var(--tinte);
    font-weight: var(--gw-zahl);
  }
  .marke {
    padding: 4px var(--r2);
    background: var(--ruhig);
    color: var(--satz);
    font-size: var(--fs-meta);
  }
  .mehr {
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
</style>
