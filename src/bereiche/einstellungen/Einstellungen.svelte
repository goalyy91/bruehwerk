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
  // Rueckmeldung (2026-08-24): jeder Teil der Seite bekommt jetzt eine
  // kleine Ueberschrift statt unbeschrifteter Einzeiler. Erklaertexte unter
  // "Verhalten" sind vom Schalterzustand abhaengig — sie beschreiben, was
  // der aktuell gewaehlte Zustand bedeutet, nicht mehr nur, was der
  // Schalter generell tut.
  //
  // Etappe 8, Block E (2026-09-06): sieben Ueberschriften ("Geraete",
  // "Personen", "Verhalten", "Bestand", "Beobachtungen", "Backup",
  // "Werkzeuge") wurden vier ("Verwalten", "Verhalten", "Bestand", "Daten")
  // — Reihenfolge innerhalb jeder Gruppe blieb, nur die Buendelung ist neu.
  // "Backup" verlor dabei seine eigene Ueberschrift (siehe Backup.svelte),
  // "Daten" traegt sie jetzt gemeinsam mit Migration.

  import { bestand, schreiben } from '../bestand.svelte';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import Schalter from '../../muster/Schalter.svelte';
  import Blattliste from '../../muster/Blattliste.svelte';
  import Blattzeile from '../../muster/Blattzeile.svelte';
  import Migration from './Migration.svelte';
  import Backup from './Backup.svelte';
  import type { AppEinstellungen } from '../../daten/schema';
  import { EINSTELLUNGEN_ID } from '../../daten/schema';

  let { onOeffnenGeraete, onOeffnenMusterblatt, onOeffnenBeobachtungen, onOeffnenUebung, onOeffnenPersonen }: {
    onOeffnenGeraete: () => void;
    onOeffnenMusterblatt: () => void;
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
    };
    await schreiben('einstellungen', { ...basis, [feld]: wert });
  }

  // Erklaertexte je Zustand statt einem einzigen, zustandsunabhaengigen
  // Satz — der Schalter "aus" verdient eine eigene Aussage, nicht nur das
  // Fehlen der "an"-Aussage.
  const koffeinErklaerung = $derived(
    bestand.einstellungen?.begruendungKoffein
      ? 'Zeigt, worauf sich eine automatisch vorbelegte Koffein-Frage stützt (z. B. „7 von 8 zuletzt").'
      : 'Die Koffein-Frage erscheint ohne Begründung.',
  );
  const bohneErklaerung = $derived(
    bestand.einstellungen?.begruendungBohne
      ? 'Zeigt, worauf sich ein automatischer Bohnenvorschlag stützt.'
      : 'Der Bohnenvorschlag erscheint ohne Begründung.',
  );
  const schaeumenErklaerung = $derived(
    bestand.einstellungen?.sammelSchaeumen === 'gesammelt'
      ? 'Milch für mehrere Milchgetränke im selben Durchgang wird gemeinsam aufgeschäumt.'
      : 'Milch wird für jedes Getränk einzeln aufgeschäumt.',
  );
</script>

<Kopfzeile titel="Einstellungen" gross />

<!-- Etappe 8, Block E (Rückmeldung 2026-09-06): sieben Überschriften für im
     Kern sechs Navigationszeilen liest sich wie ein Stapel Zettel — vier
     Gruppen reichen: Verwalten · Verhalten · Bestand · Daten. Reihenfolge
     innerhalb jeder Gruppe unverändert, nur die Bündelung ist neu. -->
<h2>Verwalten</h2>
<Blattliste>
  <Blattzeile label="Geräte verwalten" akzent onKlick={onOeffnenGeraete} />
  <Blattzeile label="Personen verwalten" akzent onKlick={onOeffnenPersonen} />
  <Blattzeile label="Offene Beobachtungen" akzent onKlick={onOeffnenBeobachtungen} />
  <Blattzeile label="Musterblatt ansehen" akzent onKlick={onOeffnenMusterblatt} />
  <Blattzeile label="Übungsmodus" akzent onKlick={onOeffnenUebung} />
</Blattliste>

<h2>Verhalten</h2>
{#if bestand.einstellungen}
  <Blattliste>
    <div class="einstellung-zeile">
      <Schalter
        label="Begründung: Koffein"
        an={bestand.einstellungen.begruendungKoffein}
        onWahl={(a) => einstellungAendern('begruendungKoffein', a)}
      />
      <p class="erklaerung">{koffeinErklaerung}</p>
    </div>
    <div class="einstellung-zeile">
      <Schalter
        label="Begründung: Bohne"
        an={bestand.einstellungen.begruendungBohne}
        onWahl={(a) => einstellungAendern('begruendungBohne', a)}
      />
      <p class="erklaerung">{bohneErklaerung}</p>
    </div>
    <div class="einstellung-zeile">
      <Schalter
        label="Milch gesammelt schäumen"
        an={bestand.einstellungen.sammelSchaeumen === 'gesammelt'}
        onWahl={(a) => einstellungAendern('sammelSchaeumen', a ? 'gesammelt' : 'einzeln')}
      />
      <p class="erklaerung">{schaeumenErklaerung}</p>
    </div>
  </Blattliste>
{/if}

{#if bestand.einstellungen}
  <h2>Bestand</h2>
  <Blattliste>
    <div class="formularzeile">
      <span class="formularzeile-label">„Knapp" ab</span>
      <input
        class="eingabefeld-text zahl"
        type="text"
        inputmode="numeric"
        value={bestand.einstellungen.bestandKnappBezuege}
        onchange={(e) => einstellungAendern('bestandKnappBezuege', Math.max(0, Math.round(Number(e.currentTarget.value.replace(',', '.')))))}
      />
      <span class="einheit">Bezüge übrig</span>
    </div>
    <div class="formularzeile">
      <span class="formularzeile-label">„Alt" ab (frisch)</span>
      <input
        class="eingabefeld-text zahl"
        type="text"
        inputmode="numeric"
        value={bestand.einstellungen.bestandFrischWochen}
        onchange={(e) => einstellungAendern('bestandFrischWochen', Math.max(1, Math.round(Number(e.currentTarget.value.replace(',', '.')))))}
      />
      <span class="einheit">Wochen</span>
    </div>
    <div class="formularzeile">
      <span class="formularzeile-label">„Alt" ab (eingefroren)</span>
      <input
        class="eingabefeld-text zahl"
        type="text"
        inputmode="numeric"
        value={bestand.einstellungen.bestandEingefrorenMonate}
        onchange={(e) => einstellungAendern('bestandEingefrorenMonate', Math.max(1, Math.round(Number(e.currentTarget.value.replace(',', '.')))))}
      />
      <span class="einheit">Monate</span>
    </div>
  </Blattliste>
  <p class="erklaerung ausserhalb">Steuert, wann eine Bohne im Dashboard als „knapp" oder „sollte bald raus" markiert wird.</p>
{/if}

<h2>Daten</h2>
<Migration />
<Backup />

<style>
  /* Trennlinie zwischen den Zeilen kommt jetzt von Blattliste.svelte
     (":global(* + *)"), nicht mehr lokal von hier. */
  .einstellung-zeile {
    padding: var(--r3) 0;
  }
  .erklaerung {
    font-family: var(--schrift-sans);
    font-size: var(--fs-erklaerung);
    color: var(--gedaempft);
    margin: var(--r1) 0 0;
  }
  /* Erklaersatz unter einem ganzen Panel statt unter einer einzelnen Zeile
     (Bestand-Gruppe: ein Satz erklaert alle drei Felder auf einmal). */
  .erklaerung.ausserhalb {
    margin: var(--r1) 0 var(--r5);
  }
  .einheit {
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
</style>
