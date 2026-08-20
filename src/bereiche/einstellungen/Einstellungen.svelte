<script lang="ts">
  // Einstellungen — Geraetepark, Temperatur-Referenz (Etappe B), und der
  // Weg zum Musterblatt, damit Bauteile weiter am Geraet geprueft werden
  // koennen (Paket 01b bleibt erreichbar, nicht nur historisch).

  import Musterblatt from '../Musterblatt.svelte';
  import TempReferenz from './TempReferenz.svelte';

  let musterblattOffen = $state(false);
</script>

{#if musterblattOffen}
  <button type="button" class="zurueck" onclick={() => (musterblattOffen = false)}>‹ Einstellungen</button>
  <Musterblatt />
{:else}
  <h1>Einstellungen</h1>
  <p class="hinweis">Geräte, Rüstzeiten, Personen und Backup folgen in späteren Paketen.</p>

  <TempReferenz />

  <button type="button" class="link" onclick={() => (musterblattOffen = true)}>Musterblatt ansehen</button>
{/if}

<style>
  h1 {
    font-size: var(--fs-titel);
    font-weight: var(--gw-titel);
    margin: 0 0 var(--r2);
  }
  .hinweis {
    color: var(--gedaempft);
    font-size: var(--fs-satz);
    margin-bottom: var(--r4);
  }
  .link,
  .zurueck {
    background: none;
    border: none;
    color: var(--akzent);
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    min-height: var(--treffer);
    padding: 0;
    cursor: pointer;
    display: block;
  }
</style>
