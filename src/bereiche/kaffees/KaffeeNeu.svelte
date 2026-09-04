<script lang="ts">
  // Kaffee anlegen — eigene Route (Navigations-Umbau UX-1), vorher ein
  // eingebettetes Formular am Ende der Liste. Ein halb ausgefuelltes
  // Formular muss auf Zurueck schliessen, nicht die App verlassen — das
  // geht nur, wenn es ein eigener Verlaufseintrag ist.
  //
  // Minimalformular, der Rest ist am Kaffeeblatt nachpflegbar (K64 — kein
  // Vollformular-Zwang).
  //
  // Visueller Redesign-Reset, Paket 4: Textfelder ueber die globale
  // Utility .eingabefeld-text aus tokens.css statt lokaler --feld-Box.

  import { schreiben } from '../bestand.svelte';
  import Segment from '../../muster/Segment.svelte';
  import Schalter from '../../muster/Schalter.svelte';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import Knopf from '../../muster/Knopf.svelte';
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
  <input class="eingabefeld-text" type="text" placeholder="Name" bind:value={name} />
  <input class="eingabefeld-text" type="text" placeholder="Röster" bind:value={roester} />
  <Segment
    optionen={[
      { wert: 'single', label: 'Single Origin' },
      { wert: 'blend', label: 'Blend' },
    ]}
    wert={art}
    onWahl={(w) => (art = w as 'single' | 'blend')}
  />
  <Schalter label="entkoffeiniert" an={entkoffeiniert} onWahl={(a) => (entkoffeiniert = a)} />
</div>

<Knopf stufe="primaer" onKlick={anlegen} deaktiviert={name.trim() === '' || roester.trim() === ''}>anlegen</Knopf>

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
  .fehler {
    color: var(--kritisch);
    font-size: var(--fs-satz);
    margin-top: var(--r3);
  }
</style>
