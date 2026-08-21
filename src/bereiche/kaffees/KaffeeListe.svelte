<script lang="ts">
  // Bestandsliste — Paket 03. Filter- und Sortierlogik ist reines
  // TypeScript in domain/bestand.ts, getestet in bestand.test.ts. Diese
  // Komponente verdrahtet nur Eingabe -> Aufruf -> Anzeige.
  //
  // "+ Kaffee" (Teil C der Korrekturrunde): Minimalformular, der Rest ist
  // am Kaffeeblatt nachpflegbar (K64 — kein Vollformular-Zwang).

  import { bestand, schreiben } from '../bestand.svelte';
  import { filtereKaffees, sortiereKaffees, zaehlform, type KaffeeSortierung } from '../../domain/bestand';
  import Bohnen from '../../muster/Bohnen.svelte';
  import Sterne from '../../muster/Sterne.svelte';
  import Einzelauswahl from '../../muster/Einzelauswahl.svelte';
  import Schalter from '../../muster/Schalter.svelte';
  import type { Kaffee } from '../../daten/schema';

  let { onOeffnen }: { onOeffnen: (kaffeeId: string) => void } = $props();

  let suchtext = $state('');
  let nurAktive = $state(true);
  let sortierung = $state<KaffeeSortierung>('name');

  const gefiltert = $derived(
    sortiereKaffees(filtereKaffees(bestand.kaffees, { suchtext, nurAktive }), sortierung),
  );

  let neuOffen = $state(false);
  let neuName = $state('');
  let neuRoester = $state('');
  let neuArt = $state<'single' | 'blend'>('single');
  let neuEntkoffeiniert = $state(false);
  let anlegenFehler = $state<string | undefined>(undefined);

  async function kaffeeAnlegen() {
    if (neuName.trim() === '' || neuRoester.trim() === '') return;
    anlegenFehler = undefined;
    const neu: Kaffee = {
      id: crypto.randomUUID(),
      name: neuName.trim(),
      roester: neuRoester.trim(),
      aktiv: true,
      art: neuArt,
      herkunft: [],
      entkoffeiniert: neuEntkoffeiniert,
      geeignetFuer: [],
      chargeIds: [],
      erkenntnisse: [],
    };
    try {
      await schreiben('kaffee', neu);
      neuOffen = false;
      neuName = '';
      neuRoester = '';
      neuArt = 'single';
      neuEntkoffeiniert = false;
      onOeffnen(neu.id);
    } catch (fehler) {
      anlegenFehler = fehler instanceof Error ? fehler.message : String(fehler);
    }
  }
</script>

<h1>Kaffees</h1>
<p class="zaehlung">{zaehlform(gefiltert.length, bestand.kaffees.length, 'Kaffee')}</p>

<div class="werkzeuge">
  <input class="suche" type="text" placeholder="Suchen …" bind:value={suchtext} />
  <Schalter label="nur aktive" an={nurAktive} onWahl={(a) => (nurAktive = a)} />
  <Einzelauswahl
    optionen={[
      { wert: 'name', label: 'Name' },
      { wert: 'bewertung', label: 'Bewertung' },
      { wert: 'roestgrad', label: 'Röstgrad' },
    ]}
    wert={sortierung}
    onWahl={(w) => (sortierung = w as KaffeeSortierung)}
  />
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

{#if neuOffen}
  <div class="neuer-kaffee">
    <input type="text" placeholder="Name" bind:value={neuName} />
    <input type="text" placeholder="Röster" bind:value={neuRoester} />
    <Einzelauswahl
      optionen={[
        { wert: 'single', label: 'Single Origin' },
        { wert: 'blend', label: 'Blend' },
      ]}
      wert={neuArt}
      onWahl={(w) => (neuArt = w as 'single' | 'blend')}
    />
    <Schalter label="entkoffeiniert" an={neuEntkoffeiniert} onWahl={(a) => (neuEntkoffeiniert = a)} />
    <div class="knopfreihe">
      <button type="button" class="primaer" onclick={kaffeeAnlegen} disabled={neuName.trim() === '' || neuRoester.trim() === ''}>
        anlegen
      </button>
      <button type="button" class="sekundaer" onclick={() => (neuOffen = false)}>abbrechen</button>
    </div>
    {#if anlegenFehler}
      <p class="fehler">Nicht gespeichert: {anlegenFehler} — nochmal versuchen.</p>
    {/if}
  </div>
{:else}
  <button type="button" class="fusszeile" onclick={() => (neuOffen = true)}>+ Kaffee</button>
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
  .suche {
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    background: var(--feld);
    border: 1px solid var(--feld-rahmen);
    color: var(--tinte);
    padding: var(--r2);
    min-height: var(--treffer);
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
  .fusszeile {
    display: block;
    width: 100%;
    min-height: var(--fusszeile);
    margin-top: var(--r3);
    background: none;
    border: none;
    border-top: 1px solid var(--linie);
    color: var(--akzent);
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    text-align: left;
    cursor: pointer;
  }
  .neuer-kaffee {
    display: flex;
    flex-direction: column;
    gap: var(--r3);
    margin-top: var(--r3);
    padding-top: var(--r3);
    border-top: 1px solid var(--linie);
  }
  .neuer-kaffee input[type='text'] {
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    background: var(--feld);
    border: 1px solid var(--feld-rahmen);
    color: var(--tinte);
    padding: var(--r2);
    min-height: var(--treffer);
  }
  .knopfreihe {
    display: flex;
    gap: var(--r3);
  }
  .knopfreihe button {
    min-height: var(--treffer);
    padding: 0 var(--r4);
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    cursor: pointer;
    border: 1px solid var(--linie);
    background: var(--feld);
    color: var(--tinte);
  }
  .knopfreihe .primaer {
    background: var(--akzent);
    color: var(--h-papier);
    border: none;
  }
  .knopfreihe .primaer:disabled {
    opacity: 0.5;
    cursor: default;
  }
  .knopfreihe .sekundaer {
    background: transparent;
    color: var(--gedaempft);
    border: none;
  }
  .fehler {
    color: var(--kritisch);
    font-size: var(--fs-satz);
  }
</style>
