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
  import Einzelauswahl from '../../muster/Einzelauswahl.svelte';
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

<button type="button" class="schwebend" onclick={onNeu} aria-label="Kaffee hinzufügen">+</button>

<style>
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
  /* Schwebender Rund-Button statt Link am Listenende — immer erreichbar,
     ohne dass man dafuer runterscrollen muss (UX-1). Feste Position ueber
     der unteren Leiste, gleiche Form ueberall, wo eine Sammlung eine
     Anlege-Handlung braucht. */
  .schwebend {
    position: fixed;
    right: var(--seitenrand);
    bottom: calc(var(--fusszeile) + var(--safe-unten) + var(--r4));
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: none;
    background: var(--akzent);
    color: var(--h-papier);
    font-size: 28px;
    line-height: 1;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
    cursor: pointer;
  }
</style>
