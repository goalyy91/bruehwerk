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
  //
  // Rueckmeldung 2026-09-08: die Gruppen "Verhalten" und "Bestand" liegen
  // jetzt hinter einer Navigationszeile (Verhalten.svelte). Hier bleiben die
  // Wege hinein, die Darstellung und die Daten.

  import { bestand, schreiben } from '../bestand.svelte';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import Segment from '../../muster/Segment.svelte';
  import Blattliste from '../../muster/Blattliste.svelte';
  import Blattzeile from '../../muster/Blattzeile.svelte';
  import Migration from './Migration.svelte';
  import Backup from './Backup.svelte';
  import type { AppEinstellungen } from '../../daten/schema';
  import { EINSTELLUNGEN_ID } from '../../daten/schema';

  let { onOeffnenGeraete, onOeffnenVerhalten, onOeffnenBeobachtungen, onOeffnenUebung, onOeffnenPersonen }: {
    onOeffnenGeraete: () => void;
    onOeffnenVerhalten: () => void;
    onOeffnenBeobachtungen: () => void;
    onOeffnenUebung: () => void;
    onOeffnenPersonen: () => void;
  } = $props();

  async function einstellungAendern<K extends keyof AppEinstellungen>(feld: K, wert: AppEinstellungen[K]) {
    const basis = bestand.einstellungen ?? {
      id: EINSTELLUNGEN_ID,
      begruendungKoffein: true,
      begruendungBohne: true,
      sammelSchaeumen: 'einzeln' as const,
      bestandKnappBezuege: 2,
      bestandFrischWochen: 8,
      bestandEingefrorenMonate: 8,
      thema: 'system' as const,
    };
    await schreiben('einstellungen', { ...basis, [feld]: wert });
  }

</script>

<Kopfzeile titel="Einstellungen" gross />

<!-- Etappe 8, Block E (Rückmeldung 2026-09-06): sieben Überschriften für im
     Kern sechs Navigationszeilen liest sich wie ein Stapel Zettel — Gruppen
     statt Einzelzettel.

     Rückmeldung 2026-09-08: „Verhalten" und „Bestand" standen als aufgeklappte
     Gruppen mitten auf dem Startbildschirm — sechs Schalter und Zahlenfelder,
     die man im Alltag nie anfasst, vor allem anderen. Sie liegen jetzt hinter
     einer Zeile (Verhalten.svelte), wie „Geräte verwalten". Übrig bleiben hier
     die Wege hinein, die Darstellung und die Daten. -->
<h2>Verwalten</h2>
<Blattliste>
  <Blattzeile label="Geräte verwalten" akzent onKlick={onOeffnenGeraete} />
  <Blattzeile label="Verhalten und Bestand" akzent onKlick={onOeffnenVerhalten} />
  <Blattzeile label="Personen verwalten" akzent onKlick={onOeffnenPersonen} />
  <Blattzeile label="Offene Beobachtungen" akzent onKlick={onOeffnenBeobachtungen} />
  <Blattzeile label="Übungsmodus" akzent onKlick={onOeffnenUebung} />
</Blattliste>

<h2>Darstellung</h2>
{#if bestand.einstellungen}
  <Blattliste>
    <div class="formularzeile spalte">
      <span class="formularzeile-label">Erscheinungsbild</span>
      <Segment
        optionen={[
          { wert: 'system', label: 'System' },
          { wert: 'hell', label: 'Hell' },
          { wert: 'dunkel', label: 'Dunkel' },
        ]}
        wert={bestand.einstellungen.thema}
        onWahl={(w) => einstellungAendern('thema', w as 'system' | 'hell' | 'dunkel')}
      />
    </div>
  </Blattliste>
  <p class="erklaerung ausserhalb">„System" folgt der Einstellung des Telefons und wechselt mit ihr.</p>
{/if}

<h2>Daten</h2>
<Migration />
<Backup />
<!-- Fund 2026-09-08: ohne ausdrückliche Anforderung darf der Browser die
     Datenbank bei Speicherdruck räumen. Angefragt wird beim Start
     (daten/speicher.ts); zugesagt wird sie nicht immer. Der Satz steht
     hier, weil „nicht dauerhaft" eine Nachricht ist, die man gesehen
     haben muss — solange es kein Cloud-Backup gibt, hängt dann alles am
     Datei-Export darüber. -->
<p class="erklaerung ausserhalb">
  {#if bestand.speicher === 'dauerhaft'}
    Der Browser hat zugesagt, die Daten dauerhaft zu behalten.
  {:else if bestand.speicher === 'nicht-dauerhaft'}
    Der Browser behält sich vor, die Daten bei Speichermangel zu löschen —
    exportiere regelmäßig eine Datei.
  {:else}
    Dieser Browser sagt nicht, ob er die Daten dauerhaft behält —
    exportiere regelmäßig eine Datei.
  {/if}
</p>

<style>
  .erklaerung {
    font-family: var(--schrift-sans);
    font-size: var(--fs-erklaerung);
    color: var(--gedaempft);
    margin: var(--r1) 0 0;
  }
  /* Erklaersatz unter einem ganzen Panel statt unter einer einzelnen Zeile. */
  .erklaerung.ausserhalb {
    margin: var(--r1) 0 var(--r5);
  }
</style>
