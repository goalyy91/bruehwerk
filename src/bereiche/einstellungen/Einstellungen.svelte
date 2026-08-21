<script lang="ts">
  // Einstellungen — seit dem Navigations-Umbau (UX-1) nur noch der
  // Startbildschirm des Bereichs. Geraete-Teilbaum und Musterblatt sind
  // eigene Routen, die Rahmen.svelte direkt rendert — hier bleiben nur
  // globale App-Einstellungen, Migration und Backup.

  import { bestand, schreiben } from '../bestand.svelte';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import Schalter from '../../muster/Schalter.svelte';
  import LesartUmschalter from '../../muster/LesartUmschalter.svelte';
  import Migration from './Migration.svelte';
  import Backup from './Backup.svelte';
  import type { AppEinstellungen } from '../../daten/schema';
  import { EINSTELLUNGEN_ID } from '../../daten/schema';

  let { onOeffnenGeraete, onOeffnenMusterblatt }: {
    onOeffnenGeraete: () => void;
    onOeffnenMusterblatt: () => void;
  } = $props();

  async function einstellungAendern<K extends keyof AppEinstellungen>(feld: K, wert: AppEinstellungen[K]) {
    const basis = bestand.einstellungen ?? { id: EINSTELLUNGEN_ID, begruendungKoffein: true, begruendungBohne: true, sammelSchaeumen: 'einzeln' as const };
    await schreiben('einstellungen', { ...basis, [feld]: wert });
  }
</script>

<Kopfzeile titel="Einstellungen" />
<p class="hinweis">Rüstzeiten, Personen und Cloud-Backend folgen in späteren Paketen.</p>

<button type="button" class="link" onclick={onOeffnenGeraete}>Geräte verwalten</button>

<Migration />

<h2>Verhalten</h2>
{#if bestand.einstellungen}
  <section class="karte">
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
    <div class="einstellung-zeile letzte">
      <span class="einstellung-label">Milch schäumen</span>
      <LesartUmschalter
        optionA="pro Getränk"
        optionB="gesammelt"
        start={bestand.einstellungen.sammelSchaeumen === 'gesammelt' ? 'b' : 'a'}
        onWahl={(l) => einstellungAendern('sammelSchaeumen', l === 'b' ? 'gesammelt' : 'einzeln')}
      />
      <p class="erklaerung">Bei mehreren Milchgetränken im selben Durchgang — die App entscheidet das nicht selbst.</p>
    </div>
  </section>
{/if}

<Backup />

<button type="button" class="link" onclick={onOeffnenMusterblatt}>Musterblatt ansehen</button>

<style>
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
  .karte {
    background: var(--feld-blatt);
    border: 1px solid var(--linie);
    border-radius: var(--radius-feld);
    padding: var(--r4);
  }
  .einstellung-zeile {
    margin-bottom: var(--r3);
  }
  .einstellung-zeile.letzte {
    margin-bottom: 0;
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
