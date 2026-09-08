<script lang="ts">
  // Getraenke-Baukasten — Paket 06. "Ein- und ausblenden statt loeschen"
  // (konzept.md:974): ein Getraenk verschwindet aus der Auswahl, seine
  // Historie und sein Ranking-Score bleiben. Neu anlegen heisst deshalb hier
  // immer "als Kopie eines vorhandenen oeffnen" — kein Knopf fuer ein leeres
  // Formular, das gibt es in diesem Baukasten nicht (konzept.md:830).

  import { bestand } from '../bestand.svelte';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import Schalter from '../../muster/Schalter.svelte';
  import Blattliste from '../../muster/Blattliste.svelte';
  import Blattzeile from '../../muster/Blattzeile.svelte';

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
  <Blattliste>
    {#each gefiltert as getraenk (getraenk.id)}
      <Blattzeile
        label={getraenk.name}
        meta="{getraenk.kategorie}{!getraenk.aktiv ? ' · ausgeblendet' : ''}"
        gedaempft={!getraenk.aktiv}
        onKlick={() => onOeffnen(getraenk.id)}
      />
    {/each}
  </Blattliste>
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
  /* Zeilendarstellung kommt jetzt von Blattliste/Blattzeile.svelte (Etappe 8, Block D). */
</style>
