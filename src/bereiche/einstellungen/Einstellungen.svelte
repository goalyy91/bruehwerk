<script lang="ts">
  // Einstellungen — einziger Navigations-Eigentuemer fuer den gesamten
  // Geraete-Teilbaum (Korrekturrunde Teil 5 — vorher fuehrten Einstellungen
  // und Geraete je eine eigene Ebene, daher der gemeldete doppelte
  // Zurueck-Button). Dazu globale App-Einstellungen (Teil 1), Migration
  // (Teil A), Backup (Teil F), Geraetepark (Teil G) und der Weg zum
  // Musterblatt.

  import { bestand, schreiben } from '../bestand.svelte';
  import Musterblatt from '../Musterblatt.svelte';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import Schalter from '../../muster/Schalter.svelte';
  import LesartUmschalter from '../../muster/LesartUmschalter.svelte';
  import Migration from './Migration.svelte';
  import Backup from './Backup.svelte';
  import Geraete from './Geraete.svelte';
  import Muehleblatt from './Muehleblatt.svelte';
  import Bruehgeraetblatt from './Bruehgeraetblatt.svelte';
  import Setupblatt from './Setupblatt.svelte';
  import type { AppEinstellungen } from '../../daten/schema';
  import { EINSTELLUNGEN_ID } from '../../daten/schema';

  type Ansicht =
    | { typ: 'start' }
    | { typ: 'musterblatt' }
    | { typ: 'geraete' }
    | { typ: 'muehle'; id?: string }
    | { typ: 'bruehgeraet'; id?: string }
    | { typ: 'setup'; id?: string };

  let ansicht = $state<Ansicht>({ typ: 'start' });

  // Der Rueckweg aus einem Geraete-Blatt fuehrt zur Geraete-Liste, aus der
  // Geraete-Liste (und dem Musterblatt) zurueck zum Start — genau eine
  // Ebene je Zustand, kein zweiter Zurueck-Button irgendwo.
  function zurueck() {
    if (ansicht.typ === 'muehle' || ansicht.typ === 'bruehgeraet' || ansicht.typ === 'setup') {
      ansicht = { typ: 'geraete' };
    } else {
      ansicht = { typ: 'start' };
    }
  }

  async function einstellungAendern<K extends keyof AppEinstellungen>(feld: K, wert: AppEinstellungen[K]) {
    const basis = bestand.einstellungen ?? { id: EINSTELLUNGEN_ID, begruendungKoffein: true, begruendungBohne: true, sammelSchaeumen: 'einzeln' as const };
    await schreiben('einstellungen', { ...basis, [feld]: wert });
  }
</script>

{#if ansicht.typ === 'musterblatt'}
  <Kopfzeile titel="Musterblatt" onZurueck={zurueck} />
  <Musterblatt />
{:else if ansicht.typ === 'geraete'}
  <Kopfzeile titel="Geräte" onZurueck={zurueck} />
  <Geraete
    onOeffnenMuehle={(id) => (ansicht = { typ: 'muehle', id })}
    onOeffnenBruehgeraet={(id) => (ansicht = { typ: 'bruehgeraet', id })}
    onOeffnenSetup={(id) => (ansicht = { typ: 'setup', id })}
  />
{:else if ansicht.typ === 'muehle'}
  <Muehleblatt muehleId={ansicht.id} onZurueck={zurueck} />
{:else if ansicht.typ === 'bruehgeraet'}
  <Bruehgeraetblatt bruehgeraetId={ansicht.id} onZurueck={zurueck} />
{:else if ansicht.typ === 'setup'}
  <Setupblatt setupId={ansicht.id} onZurueck={zurueck} />
{:else}
  <h1>Einstellungen</h1>
  <p class="hinweis">Rüstzeiten, Personen und Cloud-Backend folgen in späteren Paketen.</p>

  <button type="button" class="link" onclick={() => (ansicht = { typ: 'geraete' })}>Geräte verwalten</button>

  <Migration />

  <h2>Allgemein</h2>
  {#if bestand.einstellungen}
    <div class="einstellung-zeile">
      <Schalter
        label="Begründung: Koffein"
        an={bestand.einstellungen.begruendungKoffein}
        onWahl={(a) => einstellungAendern('begruendungKoffein', a)}
      />
      <p class="erklaerung">Zeigt, worauf sich eine automatisch vorbelegte Koffein-Frage stützt (z. B. „7 von 8 zuletzt").</p>
    </div>
    <div class="einstellung-zeile">
      <Schalter
        label="Begründung: Bohne"
        an={bestand.einstellungen.begruendungBohne}
        onWahl={(a) => einstellungAendern('begruendungBohne', a)}
      />
      <p class="erklaerung">Zeigt, worauf sich ein automatischer Bohnenvorschlag stützt.</p>
    </div>
    <div class="einstellung-zeile">
      <span class="einstellung-label">Milch schäumen</span>
      <LesartUmschalter
        optionA="pro Getränk"
        optionB="gesammelt"
        start={bestand.einstellungen.sammelSchaeumen === 'gesammelt' ? 'b' : 'a'}
        onWahl={(l) => einstellungAendern('sammelSchaeumen', l === 'b' ? 'gesammelt' : 'einzeln')}
      />
      <p class="erklaerung">Bei mehreren Milchgetränken im selben Durchgang — die App entscheidet das nicht selbst.</p>
    </div>
  {/if}

  <Backup />

  <button type="button" class="link" onclick={() => (ansicht = { typ: 'musterblatt' })}>Musterblatt ansehen</button>
{/if}

<style>
  h1 {
    font-size: var(--fs-titel);
    font-weight: var(--gw-titel);
    margin: 0 0 var(--r2);
  }
  h2 {
    font-size: var(--fs-label);
    letter-spacing: var(--label-spacing);
    text-transform: uppercase;
    color: var(--gedaempft);
    font-weight: var(--gw-text);
    margin: var(--r5) 0 var(--r2);
  }
  .hinweis {
    color: var(--gedaempft);
    font-size: var(--fs-satz);
    margin-bottom: var(--r4);
  }
  .link {
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
  .einstellung-zeile {
    margin-bottom: var(--r3);
  }
  .einstellung-label {
    display: block;
    font-size: var(--fs-satz);
    color: var(--satz);
    margin-bottom: var(--r1);
  }
  .erklaerung {
    font-size: var(--fs-meta);
    color: var(--gedaempft);
    margin: var(--r1) 0 0;
  }
</style>
