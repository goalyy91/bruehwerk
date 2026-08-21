<script lang="ts">
  // Einstellungen — Geraetepark (Teil G), Temperatur-Referenz, Migration
  // (Teil A), Backup (Teil F), und der Weg zum Musterblatt.

  import Musterblatt from '../Musterblatt.svelte';
  import TempReferenz from './TempReferenz.svelte';
  import Migration from './Migration.svelte';
  import Backup from './Backup.svelte';
  import Geraete from './Geraete.svelte';

  type Unterseite = 'start' | 'musterblatt' | 'geraete';
  let seite = $state<Unterseite>('start');
</script>

{#if seite === 'musterblatt'}
  <button type="button" class="zurueck" onclick={() => (seite = 'start')}>‹ Einstellungen</button>
  <Musterblatt />
{:else if seite === 'geraete'}
  <button type="button" class="zurueck" onclick={() => (seite = 'start')}>‹ Einstellungen</button>
  <h1>Geräte</h1>
  <Geraete />
{:else}
  <h1>Einstellungen</h1>
  <p class="hinweis">Rüstzeiten, Personen und Cloud-Backend folgen in späteren Paketen.</p>

  <button type="button" class="link" onclick={() => (seite = 'geraete')}>Geräte verwalten</button>

  <Migration />
  <TempReferenz />
  <Backup />

  <button type="button" class="link" onclick={() => (seite = 'musterblatt')}>Musterblatt ansehen</button>
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
