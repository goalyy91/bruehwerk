<script lang="ts">
  // Kaffee anlegen — eigene Route (Navigations-Umbau UX-1), vorher ein
  // eingebettetes Formular am Ende der Liste. Ein halb ausgefuelltes
  // Formular muss auf Zurueck schliessen, nicht die App verlassen — das
  // geht nur, wenn es ein eigener Verlaufseintrag ist.
  //
  // Minimalformular, der Rest ist am Kaffeeblatt nachpflegbar (K64 — kein
  // Vollformular-Zwang).

  import { schreiben } from '../bestand.svelte';
  import Einzelauswahl from '../../muster/Einzelauswahl.svelte';
  import Schalter from '../../muster/Schalter.svelte';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import type { Kaffee } from '../../daten/schema';

  let { onZurueck, onAngelegt }: { onZurueck: () => void; onAngelegt: (kaffeeId: string) => void } = $props();

  let name = $state('');
  let roester = $state('');
  let art = $state<'single' | 'blend'>('single');
  let entkoffeiniert = $state(false);
  let fehler = $state<string | undefined>(undefined);

  async function anlegen() {
    if (name.trim() === '' || roester.trim() === '') return;
    fehler = undefined;
    const neu: Kaffee = {
      id: crypto.randomUUID(),
      name: name.trim(),
      roester: roester.trim(),
      aktiv: true,
      art,
      herkunft: [],
      entkoffeiniert,
      geeignetFuer: [],
      chargeIds: [],
      erkenntnisse: [],
    };
    try {
      await schreiben('kaffee', neu);
      onAngelegt(neu.id);
    } catch (e) {
      fehler = e instanceof Error ? e.message : String(e);
    }
  }
</script>

<Kopfzeile titel="Neuer Kaffee" {onZurueck} />

<div class="formular">
  <input class="text-eingabe" type="text" placeholder="Name" bind:value={name} />
  <input class="text-eingabe" type="text" placeholder="Röster" bind:value={roester} />
  <Einzelauswahl
    optionen={[
      { wert: 'single', label: 'Single Origin' },
      { wert: 'blend', label: 'Blend' },
    ]}
    wert={art}
    onWahl={(w) => (art = w as 'single' | 'blend')}
  />
  <Schalter label="entkoffeiniert" an={entkoffeiniert} onWahl={(a) => (entkoffeiniert = a)} />
</div>

<button type="button" class="primaer" onclick={anlegen} disabled={name.trim() === '' || roester.trim() === ''}>
  anlegen
</button>

{#if fehler}
  <p class="fehler">Nicht gespeichert: {fehler} — nochmal versuchen.</p>
{/if}

<style>
  .formular {
    display: flex;
    flex-direction: column;
    gap: var(--r3);
    margin-bottom: var(--r4);
  }
  .text-eingabe {
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    background: var(--feld);
    border: 1px solid var(--feld-rahmen);
    color: var(--tinte);
    padding: var(--r2);
    min-height: var(--treffer);
  }
  .primaer {
    min-height: var(--treffer);
    padding: 0 var(--r4);
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
