<script lang="ts">
  // Einstellungen — seit dem Navigations-Umbau (UX-1) nur noch der
  // Startbildschirm des Bereichs. Geraete-Teilbaum und Musterblatt sind
  // eigene Routen, die Rahmen.svelte direkt rendert — hier bleiben nur
  // globale App-Einstellungen, Migration und Backup.
  //
  // Visueller Redesign-Reset, Paket 4 (Handoff Abschnitt 6 "Einstellungen"):
  // Kopfzeile im gross-Modus (Root-Tab, kein Rueckweg). "Geraete verwalten"
  // als Blattzeile im Akzent statt reinem Textlink. Gruppe "Verhalten" als
  // Blatt mit Haarlinien statt eckig umrandeter Karte.

  import { bestand, schreiben } from '../bestand.svelte';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import Schalter from '../../muster/Schalter.svelte';
  import Migration from './Migration.svelte';
  import Backup from './Backup.svelte';
  import type { AppEinstellungen } from '../../daten/schema';
  import { EINSTELLUNGEN_ID } from '../../daten/schema';

  let { onOeffnenGeraete, onOeffnenMusterblatt, onOeffnenBeobachtungen }: {
    onOeffnenGeraete: () => void;
    onOeffnenMusterblatt: () => void;
    onOeffnenBeobachtungen: () => void;
  } = $props();

  async function einstellungAendern<K extends keyof AppEinstellungen>(feld: K, wert: AppEinstellungen[K]) {
    const basis = bestand.einstellungen ?? { id: EINSTELLUNGEN_ID, begruendungKoffein: true, begruendungBohne: true, sammelSchaeumen: 'einzeln' as const };
    await schreiben('einstellungen', { ...basis, [feld]: wert });
  }
</script>

<Kopfzeile titel="Einstellungen" gross />

<div class="panel schmal">
  <button type="button" class="blattzeile" onclick={onOeffnenGeraete}>
    <span>Geräte verwalten</span>
    <span class="chevron" aria-hidden="true">›</span>
  </button>
</div>

<Migration />

<h2>Verhalten</h2>
{#if bestand.einstellungen}
  <div class="panel">
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
      <Schalter
        label="Milch gesammelt schäumen"
        an={bestand.einstellungen.sammelSchaeumen === 'gesammelt'}
        onWahl={(a) => einstellungAendern('sammelSchaeumen', a ? 'gesammelt' : 'einzeln')}
      />
      <p class="erklaerung">Bei mehreren Milchgetränken im selben Durchgang — aus statt an heißt: pro Getränk einzeln.</p>
    </div>
  </div>
{/if}

<div class="panel schmal">
  <button type="button" class="blattzeile" onclick={onOeffnenBeobachtungen}>
    <span>Offene Beobachtungen</span>
    <span class="chevron" aria-hidden="true">›</span>
  </button>
</div>

<Backup />

<div class="panel schmal">
  <button type="button" class="blattzeile" onclick={onOeffnenMusterblatt}>
    <span>Musterblatt ansehen</span>
    <span class="chevron" aria-hidden="true">›</span>
  </button>
</div>

<style>
  /* Blatt mit Zeilen (Handoff Abschnitt 6 "Einstellungen") — "schmal" fuer
     Panels mit nur einer Zeile (kein Innenpolster oben/unten ausser der
     Zeilenhoehe selbst). Kein zentrales Muster fuer diese Form vorhanden
     (siehe docs/design/offene-punkte-redesign.md, Punkt 8). */
  .panel {
    background: var(--blatt);
    border-radius: var(--r-blatt);
    padding: 0 var(--r4);
    margin-bottom: var(--r-kachelabstand);
    display: flex;
    flex-direction: column;
  }
  .panel.schmal {
    margin-bottom: var(--r5);
  }
  .blattzeile {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-height: 56px;
    border: none;
    background: transparent;
    color: var(--akzent);
    font-family: var(--schrift);
    font-size: var(--fs-bedienwort);
    text-align: left;
    cursor: pointer;
  }
  .chevron {
    color: var(--spur);
    font-size: var(--fs-bedienwort);
  }
  .einstellung-zeile {
    padding: var(--r3) 0;
  }
  .einstellung-zeile + .einstellung-zeile {
    border-top: 1px solid var(--linie);
  }
  .erklaerung {
    font-family: var(--schrift-sans);
    font-size: 14.5px;
    color: var(--gedaempft);
    margin: var(--r1) 0 0;
  }
</style>
