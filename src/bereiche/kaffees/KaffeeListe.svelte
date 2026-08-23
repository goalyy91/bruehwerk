<script lang="ts">
  // Bestandsliste — Paket 03. Filter- und Sortierlogik ist reines
  // TypeScript in domain/bestand.ts, getestet in bestand.test.ts. Diese
  // Komponente verdrahtet nur Eingabe -> Aufruf -> Anzeige.
  //
  // "+ Kaffee" ist seit dem Navigations-Umbau (UX-1) eine eigene Route
  // (KaffeeNeu.svelte) statt eines eingebetteten Formulars — ein halb
  // ausgefuelltes Formular soll auf Zurueck schliessen, nicht die App
  // verlassen.
  //
  // Visueller Redesign-Reset, Paket 2 (Handoff Abschnitt 6 "Kaffeeliste"):
  // Kaffeekarte statt Zeile mit Haarlinie — gleiche Daten, gleiche
  // Reihenfolge, gleiche Bedienung (onclick bleibt onOeffnen), nur die
  // Trägerform wechselt. Der schwebende Anlege-Knopf wird rund und
  // fuellflaechig statt der bisherigen eckigen Tinte-Flaeche (Handoff
  // verbietet schwarze/weisse Vollflaechen als Knopf).

  import { bestand } from '../bestand.svelte';
  import { filtereKaffees, sortiereKaffees, zaehlform, type KaffeeSortierung } from '../../domain/bestand';
  import Segment from '../../muster/Segment.svelte';
  import Schalter from '../../muster/Schalter.svelte';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import Suchfeld from '../../muster/Suchfeld.svelte';
  import Kaffeekarte from '../../muster/Kaffeekarte.svelte';

  let { onOeffnen, onNeu }: { onOeffnen: (kaffeeId: string) => void; onNeu: () => void } = $props();

  let suchtext = $state('');
  let nurAktive = $state(true);
  let sortierung = $state<KaffeeSortierung>('name');

  const gefiltert = $derived(
    sortiereKaffees(filtereKaffees(bestand.kaffees, { suchtext, nurAktive }), sortierung),
  );
</script>

<Kopfzeile titel="Kaffees" />

<div class="suchzeile">
  <Suchfeld wert={suchtext} onWert={(w) => (suchtext = w)} />
</div>

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
        <Kaffeekarte
          name={kaffee.name}
          roester={kaffee.roester}
          roestgrad={kaffee.roestgrad}
          bewertung={kaffee.bewertung}
          onOeffnen={() => onOeffnen(kaffee.id)}
        />
      </li>
    {/each}
  </ul>
{/if}

<button type="button" class="schwebend" onclick={onNeu} aria-label="Kaffee hinzufügen">+</button>

<style>
  .suchzeile {
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
  /* Kartenrichtung (Handoff Abschnitt 6): Abstand zwischen den Karten ist
     groesser als das Polster darin, damit kein Stapel entsteht
     (Designprinzip 5) — deshalb Gap auf der Liste, nicht auf der Karte. */
  .liste {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: var(--r-kartenabstand);
    margin: 0;
    padding: 0;
  }
  /* Schwebender Button statt Link am Listenende — immer erreichbar, ohne
     dass man dafuer runterscrollen muss (UX-1). Feste Position ueber der
     unteren Leiste. Rund und fuellflaechig statt der frueheren eckigen
     Tinte-Flaeche (Handoff: keine schwarzen/weissen Vollflaechen als
     Knopf, Radius 999 fuer Bedienelemente). */
  .schwebend {
    position: fixed;
    right: var(--seitenrand);
    bottom: calc(var(--fusszeile) + var(--safe-unten) + var(--r4));
    width: var(--fusszeile);
    height: var(--fusszeile);
    border-radius: 50%;
    border: none;
    background: var(--fuellung);
    color: var(--auf-fuellung);
    font-size: var(--fs-titel);
    line-height: 1;
    cursor: pointer;
  }
</style>
