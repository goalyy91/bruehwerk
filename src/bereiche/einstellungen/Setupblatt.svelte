<script lang="ts">
  // Setupblatt — Teil G der Korrekturrunde. ablaufId bleibt fest auf
  // ABLAUF_LEER: Ablauf ist reines, oberflaechenloses Rechenmodell (K48),
  // die echten Ruestzeiten-Buendel spezifiziert erst der Planer (Paket 06).

  import { untrack } from 'svelte';
  import { bestand, schreiben } from '../bestand.svelte';
  import { ABLAUF_LEER } from '../../daten/stammdaten';
  import Einzelauswahl from '../../muster/Einzelauswahl.svelte';
  import Schalter from '../../muster/Schalter.svelte';
  import type { Setup } from '../../daten/schema';

  let { setupId, onZurueck }: { setupId?: string; onZurueck: () => void } = $props();

  const bestehend = $derived(setupId ? bestand.setups.find((s) => s.id === setupId) : undefined);

  function leererEntwurf(): Setup {
    return {
      id: crypto.randomUUID(),
      name: '',
      muehleId: bestand.muehlen[0]?.id ?? '',
      bruehgeraetId: bestand.bruehgeraete[0]?.id ?? '',
      zubehoerIds: [],
      parallelSchaeumen: false,
      sammelSchaeumen: 'nie',
      begruendungKoffein: true,
      begruendungBohne: true,
      ablaufId: ABLAUF_LEER.id,
    };
  }

  let entwurf = $state<Setup>(untrack(() => (bestehend ? structuredClone(bestehend) : leererEntwurf())));
  let fehler = $state<string | undefined>(undefined);

  async function speichern() {
    fehler = undefined;
    try {
      await schreiben('setup', entwurf);
      onZurueck();
    } catch (e) {
      fehler = e instanceof Error ? e.message : String(e);
    }
  }
</script>

<button type="button" class="zurueck" onclick={onZurueck}>‹ Geräte</button>
<h1>{bestehend ? 'Setup bearbeiten' : 'Neues Setup'}</h1>

{#if bestand.muehlen.length === 0 || bestand.bruehgeraete.length === 0}
  <p class="hinweis">Erst eine Mühle und ein Brühgerät anlegen.</p>
{:else}
  <div class="feld-zeile">
    <span class="label">Name</span>
    <input class="text-eingabe" type="text" bind:value={entwurf.name} />
  </div>
  <div class="feld-zeile">
    <span class="label">Mühle</span>
    <Einzelauswahl
      optionen={bestand.muehlen.map((m) => ({ wert: m.id, label: m.name }))}
      wert={entwurf.muehleId}
      onWahl={(w) => (entwurf.muehleId = w)}
    />
  </div>
  <div class="feld-zeile">
    <span class="label">Brühgerät</span>
    <Einzelauswahl
      optionen={bestand.bruehgeraete.map((b) => ({ wert: b.id, label: b.name }))}
      wert={entwurf.bruehgeraetId}
      onWahl={(w) => (entwurf.bruehgeraetId = w)}
    />
  </div>
  <div class="feld-zeile">
    <Schalter label="paralleles Schäumen möglich" an={entwurf.parallelSchaeumen} onWahl={(a) => (entwurf.parallelSchaeumen = a)} />
  </div>
  <div class="feld-zeile">
    <span class="label">Sammel-Schäumen</span>
    <Einzelauswahl
      optionen={[
        { wert: 'nie', label: 'nie' },
        { wert: 'geteilterBezug', label: 'geteilter Bezug' },
        { wert: 'immer', label: 'immer' },
      ]}
      wert={entwurf.sammelSchaeumen}
      onWahl={(w) => (entwurf.sammelSchaeumen = w as Setup['sammelSchaeumen'])}
    />
  </div>
  <div class="feld-zeile">
    <Schalter label="Begründung bei Koffein-Vorbelegung" an={entwurf.begruendungKoffein} onWahl={(a) => (entwurf.begruendungKoffein = a)} />
  </div>
  <div class="feld-zeile">
    <Schalter label="Begründung bei Bohnen-Vorschlag" an={entwurf.begruendungBohne} onWahl={(a) => (entwurf.begruendungBohne = a)} />
  </div>

  <button type="button" class="primaer" onclick={speichern} disabled={entwurf.name.trim() === ''}>
    {bestehend ? 'speichern' : 'anlegen'}
  </button>
{/if}

{#if fehler}
  <p class="fehler">Nicht gespeichert: {fehler}</p>
{/if}

<style>
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
  h1 {
    font-size: var(--fs-titel);
    font-weight: var(--gw-titel);
    margin: 0 0 var(--r4);
  }
  .hinweis {
    color: var(--gedaempft);
    font-size: var(--fs-satz);
  }
  .feld-zeile {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--r3);
    min-height: var(--treffer);
    border-bottom: 1px solid var(--linie);
    padding: var(--r1) 0;
  }
  .label {
    width: var(--eigenschaftslabel);
    flex-shrink: 0;
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  .text-eingabe {
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    background: var(--feld);
    border: 1px solid var(--feld-rahmen);
    color: var(--tinte);
    padding: var(--r1) var(--r2);
    min-height: 40px;
    flex: 1;
    min-width: 100px;
  }
  .primaer {
    min-height: var(--treffer);
    padding: 0 var(--r4);
    margin-top: var(--r4);
    background: var(--akzent);
    color: var(--h-papier);
    border: none;
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    cursor: pointer;
  }
  .primaer:disabled {
    opacity: 0.5;
    cursor: default;
  }
  .fehler {
    color: var(--kritisch);
    font-size: var(--fs-satz);
    margin-top: var(--r3);
  }
</style>
