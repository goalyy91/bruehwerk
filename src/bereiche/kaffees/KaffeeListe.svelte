<script lang="ts">
  // Bestandsliste — Paket 03. Filter- und Sortierlogik ist reines
  // TypeScript in domain/bestand.ts, getestet in bestand.test.ts. Diese
  // Komponente verdrahtet nur Eingabe -> Aufruf -> Anzeige.
  //
  // "+ Kaffee" ist seit dem Navigations-Umbau (UX-1) eine eigene Route
  // (KaffeeNeu.svelte) statt eines eingebetteten Formulars — ein halb
  // ausgefuelltes Formular soll auf Zurueck schliessen, nicht die App
  // verlassen.

  import { bestand } from '../bestand.svelte';
  import { filtereKaffees, sortiereKaffees, zaehlform, type KaffeeSortierung } from '../../domain/bestand';
  import Bohnen from '../../muster/Bohnen.svelte';
  import Sterne from '../../muster/Sterne.svelte';
  import Segment from '../../muster/Segment.svelte';
  import Schalter from '../../muster/Schalter.svelte';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';

  let { onOeffnen, onNeu }: { onOeffnen: (kaffeeId: string) => void; onNeu: () => void } = $props();

  let suchtext = $state('');
  let nurAktive = $state(true);
  let sortierung = $state<KaffeeSortierung>('name');

  const gefiltert = $derived(
    sortiereKaffees(filtereKaffees(bestand.kaffees, { suchtext, nurAktive }), sortierung),
  );
</script>

<Kopfzeile titel="Kaffees" />

<input class="suche" type="text" placeholder="Suchen …" bind:value={suchtext} />

<Segment
  optionen={[
    { wert: 'name', label: 'Name' },
    { wert: 'bewertung', label: 'Bewertung' },
    { wert: 'roestgrad', label: 'Röstgrad' },
  ]}
  wert={sortierung}
  onWahl={(w) => (sortierung = w as KaffeeSortierung)}
/>

<div class="metazeile">
  <p class="zaehlung">{zaehlform(gefiltert.length, bestand.kaffees.length, 'Kaffee')}</p>
  <Schalter label="nur aktive" an={nurAktive} onWahl={(a) => (nurAktive = a)} />
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

<button type="button" class="schwebend" onclick={onNeu} aria-label="Kaffee hinzufügen">+</button>

<style>
  .suche {
    display: block;
    width: 100%;
    box-sizing: border-box;
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    background: var(--feld);
    border: 1px solid var(--feld-rahmen);
    color: var(--tinte);
    padding: var(--r2);
    min-height: var(--treffer);
    margin-bottom: var(--r3);
  }
  .metazeile {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--r3);
    margin: var(--r3) 0 var(--r4);
  }
  .zaehlung {
    font-size: var(--fs-label);
    letter-spacing: var(--label-spacing);
    color: var(--gedaempft);
    margin: 0;
  }
  /* Schalter.svelte ist als volle-Breite-Zeile gebaut — hier steht er neben
     der Zaehlform, deshalb die Breite auf den eigenen Inhalt zurueckstutzen. */
  .metazeile :global(.schalter-zeile) {
    width: auto;
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
  /* Schwebender Button statt Link am Listenende — immer erreichbar, ohne
     dass man dafuer runterscrollen muss (UX-1). Feste Position ueber der
     unteren Leiste. Flaechenhierarchie ueber Farbe statt Schatten (Regel 6),
     eckige Kante statt Kreis (--radius-feld: 0, K79) — gleiche Sprache wie
     Knopf.svelte "primaer" (--tinte-Flaeche, --grund-Text als Themen-Gegenpaar). */
  .schwebend {
    position: fixed;
    right: var(--seitenrand);
    bottom: calc(var(--fusszeile) + var(--safe-unten) + var(--r4));
    width: var(--fusszeile);
    height: var(--fusszeile);
    border-radius: var(--radius-feld);
    border: none;
    background: var(--tinte);
    color: var(--grund);
    font-size: var(--fs-titel);
    line-height: 1;
    cursor: pointer;
  }
</style>
