<script lang="ts">
  // Kaffee anlegen — eigene Route (Navigations-Umbau UX-1), vorher ein
  // eingebettetes Formular am Ende der Liste. Ein halb ausgefuelltes
  // Formular muss auf Zurueck schliessen, nicht die App verlassen — das
  // geht nur, wenn es ein eigener Verlaufseintrag ist.
  //
  // Minimalformular, der Rest ist am Kaffeeblatt nachpflegbar (K64 — kein
  // Vollformular-Zwang). Ausnahme: "geeignet für" — anders als Herkunft,
  // Varietaet etc. ist das kein beschreibendes Detail, sondern schaltet
  // frei, ob der Kaffee in der Bestellung ueberhaupt waehlbar ist
  // (domain/getraenk.ts::bohnenSchnittmenge). Ohne diese Frage hier war ein
  // frisch angelegter Kaffee bis zum naechsten Bearbeiten unsichtbar fuer
  // jede Zubereitungsart — Rueckmeldung 2026-09-04, siehe
  // docs/design/offene-punkte-redesign.md.
  //
  // Visueller Redesign-Reset, Paket 4: Textfelder ueber die globale
  // Utility .eingabefeld-text aus tokens.css statt lokaler --feld-Box.

  import { bestand, schreiben } from '../bestand.svelte';
  import { neueId } from '../../daten/id';
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
  let geeignetFuer = $state<string[]>([]);
  let fehler = $state<string | undefined>(undefined);

  const ZUBEREITUNG_LABEL: Readonly<Record<string, string>> = {
    espresso: 'Espresso',
    moka: 'Moka',
    pourover: 'Pour Over',
    coldbrew: 'Cold Brew',
  };
  const zubereitungOptionen = $derived(
    [...new Set(bestand.getraenke.map((g) => g.zubereitung))].map((z) => ({
      wert: z,
      label: ZUBEREITUNG_LABEL[z] ?? z,
    })),
  );

  function geeignetFuerUmschalten(zubereitung: string, an: boolean) {
    geeignetFuer = an ? [...geeignetFuer, zubereitung] : geeignetFuer.filter((z) => z !== zubereitung);
  }

  async function anlegen() {
    if (name.trim() === '' || roester.trim() === '') return;
    fehler = undefined;
    const neu: Kaffee = {
      id: neueId(),
      name: name.trim(),
      roester: roester.trim(),
      aktiv: true,
      art,
      herkunft: [],
      entkoffeiniert,
      geeignetFuer,
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

{#if zubereitungOptionen.length > 0}
  <div class="formular geeignet-block">
    <span class="geeignet-label">Geeignet für</span>
    <div class="geeignet-liste">
      {#each zubereitungOptionen as opt (opt.wert)}
        <Schalter label={opt.label} an={geeignetFuer.includes(opt.wert)} onWahl={(a) => geeignetFuerUmschalten(opt.wert, a)} />
      {/each}
    </div>
  </div>
{/if}

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
  .geeignet-block {
    gap: var(--r2);
  }
  .geeignet-label {
    font-family: var(--schrift-sans);
    font-size: var(--fs-gruppenkopf);
    letter-spacing: var(--label-spacing);
    text-transform: uppercase;
    color: var(--gedaempft);
  }
  .geeignet-liste {
    display: flex;
    flex-wrap: wrap;
    column-gap: var(--r5);
    row-gap: var(--r2);
  }
  .fehler {
    color: var(--kritisch);
    font-size: var(--fs-satz);
    margin-top: var(--r3);
  }
</style>
