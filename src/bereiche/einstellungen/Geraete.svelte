<script lang="ts">
  // Geraete — Teil G der Korrekturrunde: Mühlen, Brühgeräte und Setups
  // selbst anlegen/bearbeiten, ohne dass jede Änderung eine Code-Änderung
  // braucht. Kein Löschen vorerst — der seltenere Fall, kommt bei Bedarf.

  import { bestand } from '../bestand.svelte';
  import Muehleblatt from './Muehleblatt.svelte';
  import Bruehgeraetblatt from './Bruehgeraetblatt.svelte';
  import Setupblatt from './Setupblatt.svelte';

  type Blatt = { typ: 'muehle' | 'bruehgeraet' | 'setup'; id?: string };
  let blatt = $state<Blatt | undefined>(undefined);
</script>

{#if blatt?.typ === 'muehle'}
  <Muehleblatt muehleId={blatt.id} onZurueck={() => (blatt = undefined)} />
{:else if blatt?.typ === 'bruehgeraet'}
  <Bruehgeraetblatt bruehgeraetId={blatt.id} onZurueck={() => (blatt = undefined)} />
{:else if blatt?.typ === 'setup'}
  <Setupblatt setupId={blatt.id} onZurueck={() => (blatt = undefined)} />
{:else}
  <h2>Mühlen</h2>
  <ul class="liste">
    {#each bestand.muehlen as m (m.id)}
      <li><button type="button" class="zeile" onclick={() => (blatt = { typ: 'muehle', id: m.id })}>{m.name}</button></li>
    {/each}
  </ul>
  <button type="button" class="fusszeile" onclick={() => (blatt = { typ: 'muehle' })}>+ Mühle</button>

  <h2>Brühgeräte</h2>
  <ul class="liste">
    {#each bestand.bruehgeraete as b (b.id)}
      <li><button type="button" class="zeile" onclick={() => (blatt = { typ: 'bruehgeraet', id: b.id })}>{b.name}</button></li>
    {/each}
  </ul>
  <button type="button" class="fusszeile" onclick={() => (blatt = { typ: 'bruehgeraet' })}>+ Brühgerät</button>

  <h2>Setups</h2>
  <ul class="liste">
    {#each bestand.setups as s (s.id)}
      <li><button type="button" class="zeile" onclick={() => (blatt = { typ: 'setup', id: s.id })}>{s.name}</button></li>
    {/each}
  </ul>
  <button type="button" class="fusszeile" onclick={() => (blatt = { typ: 'setup' })}>+ Setup</button>
{/if}

<style>
  h2 {
    font-size: var(--fs-label);
    letter-spacing: var(--label-spacing);
    text-transform: uppercase;
    color: var(--gedaempft);
    font-weight: var(--gw-text);
    margin: var(--r5) 0 var(--r2);
  }
  .liste {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .zeile {
    width: 100%;
    display: block;
    min-height: var(--treffer);
    padding: var(--r2) 0;
    border: none;
    border-bottom: 1px solid var(--linie-zart);
    background: transparent;
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    color: var(--tinte);
    text-align: left;
    cursor: pointer;
  }
  .fusszeile {
    display: block;
    width: 100%;
    min-height: 40px;
    margin-top: var(--r2);
    background: none;
    border: none;
    color: var(--akzent);
    font-family: var(--schrift);
    font-size: var(--fs-meta);
    text-align: left;
    cursor: pointer;
  }
</style>
