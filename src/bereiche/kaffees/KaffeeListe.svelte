<script lang="ts">
  // Bestandsliste — Paket 03. Filter- und Sortierlogik ist reines
  // TypeScript in domain/bestand.ts, getestet in bestand.test.ts. Diese
  // Komponente verdrahtet nur Eingabe -> Aufruf -> Anzeige.

  import { bestand } from '../bestand.svelte';
  import { filtereKaffees, sortiereKaffees, zaehlform, type KaffeeSortierung } from '../../domain/bestand';
  import Bohnen from '../../muster/Bohnen.svelte';
  import Sterne from '../../muster/Sterne.svelte';

  let { onOeffnen }: { onOeffnen: (kaffeeId: string) => void } = $props();

  let suchtext = $state('');
  let nurAktive = $state(true);
  let sortierung = $state<KaffeeSortierung>('name');

  const gefiltert = $derived(
    sortiereKaffees(filtereKaffees(bestand.kaffees, { suchtext, nurAktive }), sortierung),
  );
</script>

<h1>Kaffees</h1>
<p class="zaehlung">{zaehlform(gefiltert.length, bestand.kaffees.length, 'Kaffee')}</p>

<div class="werkzeuge">
  <input class="suche" type="text" placeholder="Suchen …" bind:value={suchtext} />
  <label class="schalter">
    <input type="checkbox" bind:checked={nurAktive} />
    nur aktive
  </label>
  <select bind:value={sortierung}>
    <option value="name">Name</option>
    <option value="bewertung">Bewertung</option>
    <option value="roestgrad">Röstgrad</option>
  </select>
</div>

{#if !bestand.geladen}
  <p class="hinweis">Lädt …</p>
{:else if gefiltert.length === 0}
  <p class="hinweis">Kein Kaffee passt zur Auswahl.</p>
{:else}
  <ul class="liste">
    {#each gefiltert as kaffee (kaffee.id)}
      <li>
        <button type="button" class="zeile" onclick={() => onOeffnen(kaffee.id)}>
          <span class="kopf">
            <span class="name">{kaffee.name}</span>
            <span class="roester">{kaffee.roester}</span>
          </span>
          <span class="meta">
            <Bohnen stufe={kaffee.roestgrad} mitWort={false} />
            <Sterne wert={kaffee.bewertung} />
          </span>
        </button>
      </li>
    {/each}
  </ul>
{/if}

<style>
  h1 {
    font-size: var(--fs-titel);
    font-weight: var(--gw-titel);
    margin: 0 0 var(--r2);
  }
  .zaehlung {
    font-size: var(--fs-label);
    letter-spacing: var(--label-spacing);
    color: var(--gedaempft);
    margin: 0 0 var(--r4);
  }
  .werkzeuge {
    display: flex;
    flex-wrap: wrap;
    gap: var(--r3);
    align-items: center;
    margin-bottom: var(--r4);
  }
  .suche,
  select {
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    background: var(--feld);
    border: 1px solid var(--feld-rahmen);
    color: var(--tinte);
    padding: var(--r2);
    min-height: var(--treffer);
  }
  .schalter {
    display: flex;
    align-items: center;
    gap: var(--r1);
    font-size: var(--fs-meta);
    color: var(--satz);
  }
  .hinweis {
    color: var(--gedaempft);
    font-size: var(--fs-satz);
  }
  .liste {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .zeile {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--r3);
    min-height: var(--treffer);
    padding: var(--r3) 0;
    border: none;
    border-bottom: 1px solid var(--linie);
    background: transparent;
    font-family: var(--schrift);
    text-align: left;
    cursor: pointer;
  }
  .kopf {
    display: flex;
    flex-direction: column;
  }
  .name {
    font-size: var(--fs-urteil);
    color: var(--tinte);
  }
  .roester {
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  .meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: var(--r1);
  }
</style>
