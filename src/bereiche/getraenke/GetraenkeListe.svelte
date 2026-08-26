<script lang="ts">
  // Getraenke-Baukasten — Paket 06. "Ein- und ausblenden statt loeschen"
  // (konzept.md:974): ein Getraenk verschwindet aus der Auswahl, seine
  // Historie und sein Ranking-Score bleiben. Neu anlegen heisst deshalb hier
  // immer "als Kopie eines vorhandenen oeffnen" — kein Knopf fuer ein leeres
  // Formular, das gibt es in diesem Baukasten nicht (konzept.md:830).

  import { bestand } from '../bestand.svelte';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import Schalter from '../../muster/Schalter.svelte';

  let { onOeffnen }: { onOeffnen: (getraenkId: string) => void } = $props();

  let nurAktive = $state(true);

  const gefiltert = $derived(nurAktive ? bestand.getraenke.filter((g) => g.aktiv) : bestand.getraenke);
</script>

<Kopfzeile titel="Getränke" gross />

<div class="metazeile">
  <p class="zaehlung">Getränk · {gefiltert.length} von {bestand.getraenke.length}</p>
  <Schalter label="nur aktive" an={nurAktive} onWahl={(a) => (nurAktive = a)} />
</div>

{#if !bestand.geladen}
  <p class="hinweis">Lädt …</p>
{:else if gefiltert.length === 0}
  <p class="hinweis">Kein Getränk passt zur Auswahl.</p>
{:else}
  <div class="panel">
    {#each gefiltert as getraenk (getraenk.id)}
      <button type="button" class="zeile" class:ausgeblendet={!getraenk.aktiv} onclick={() => onOeffnen(getraenk.id)}>
        <span class="haupt">
          <span class="name">{getraenk.name}</span>
          <span class="meta">{getraenk.kategorie}{!getraenk.aktiv ? ' · ausgeblendet' : ''}</span>
        </span>
        <span class="chevron" aria-hidden="true">›</span>
      </button>
    {/each}
  </div>
{/if}

<style>
  .metazeile {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--r3);
    margin: 0 0 var(--r4);
  }
  .zaehlung {
    font-size: var(--fs-label);
    letter-spacing: var(--label-spacing);
    color: var(--gedaempft);
    margin: 0;
  }
  .metazeile :global(.schalter-zeile) {
    width: auto;
  }
  .hinweis {
    color: var(--gedaempft);
    font-size: var(--fs-satz);
  }
  .panel {
    background: var(--blatt);
    border-radius: var(--r-blatt);
    padding: 0 var(--r4);
    display: flex;
    flex-direction: column;
  }
  .panel > :not(:first-child) {
    border-top: 1px solid var(--linie);
  }
  .zeile {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--r3);
    min-height: 60px;
    border: none;
    background: transparent;
    font-family: var(--schrift);
    text-align: left;
    cursor: pointer;
  }
  .zeile.ausgeblendet .name {
    color: var(--gedaempft);
  }
  .haupt {
    display: flex;
    flex-direction: column;
  }
  .name {
    font-size: var(--fs-bedienwort);
    color: var(--tinte);
  }
  .meta {
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  .chevron {
    color: var(--spur);
    font-size: var(--fs-bedienwort);
  }
</style>
