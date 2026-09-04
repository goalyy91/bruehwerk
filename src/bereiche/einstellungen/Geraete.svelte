<script lang="ts">
  // Geraete — reine Anzeige, kein eigener Navigations-Zustand mehr (Teil 5
  // der Korrekturrunde). Zwei Bildschirme mit je eigenem Zurueck-Button
  // uebereinander kamen genau daher, dass diese Komponente frueher eine
  // eigene Navigations-Ebene neben Einstellungen.svelte fuehrte.
  // Einstellungen.svelte ist jetzt der einzige Navigations-Eigentuemer fuer
  // den gesamten Geraete-Teilbaum, so wie Kaffees.svelte es fuer
  // Kaffee/Profil bereits richtig macht.
  //
  // Loeschen steht nicht hier: eine Zeile in dieser Liste antippen fuehrt
  // auf eine Leseansicht (MuehleAnsicht & Co.), Loeschen sitzt dort im
  // Kontextmenue (UX-Korrekturrunde) — Loeschen ist eine Aenderung, und
  // Aenderungen leben nicht in der Liste.
  //
  // Setups stehen zuerst (Regel 3): sie sind die eigentliche
  // Alltagseinheit — ein Setup bindet Muehle+Bruehgeraet zusammen und wird
  // spaeter am Getraenk ausgewaehlt, waehrend Muehle/Bruehgeraet fuer sich
  // genommen nur Bausteine dafuer sind.
  //
  // Visueller Redesign-Reset, Paket 4 (Handoff Abschnitt 6 "Geräte"):
  // jede Gruppe als Blatt mit Zeilen 56 px, Haarlinien, "›", "+ X" als
  // letzte Zeile im Akzent statt separatem Textlink darunter.

  import { bestand } from '../bestand.svelte';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';

  let {
    onZurueck,
    onOeffnenMuehle,
    onOeffnenBruehgeraet,
    onOeffnenSetup,
  }: {
    onZurueck: () => void;
    onOeffnenMuehle: (id?: string) => void;
    onOeffnenBruehgeraet: (id?: string) => void;
    onOeffnenSetup: (id?: string) => void;
  } = $props();
</script>

<Kopfzeile titel="Geräte" {onZurueck} />

<h2>Setups</h2>
<div class="panel">
  {#each bestand.setups as s (s.id)}
    <button type="button" class="zeile" onclick={() => onOeffnenSetup(s.id)}>
      <span class="name betont">{s.name}</span>
      <span class="chevron" aria-hidden="true">›</span>
    </button>
  {/each}
  <button type="button" class="anlegen" onclick={() => onOeffnenSetup()}>+ Setup</button>
</div>

<h2>Mühlen</h2>
<div class="panel">
  {#each bestand.muehlen as m (m.id)}
    <button type="button" class="zeile" onclick={() => onOeffnenMuehle(m.id)}>
      <span class="name">{m.name}</span>
      <span class="chevron" aria-hidden="true">›</span>
    </button>
  {/each}
  <button type="button" class="anlegen" onclick={() => onOeffnenMuehle()}>+ Mühle</button>
</div>

<h2>Brühgeräte</h2>
<div class="panel">
  {#each bestand.bruehgeraete as b (b.id)}
    <button type="button" class="zeile" onclick={() => onOeffnenBruehgeraet(b.id)}>
      <span class="name">{b.name}</span>
      <span class="chevron" aria-hidden="true">›</span>
    </button>
  {/each}
  <button type="button" class="anlegen" onclick={() => onOeffnenBruehgeraet()}>+ Brühgerät</button>
</div>

<style>
  /* Blatt mit Zeilen, 56 px, Haarlinien, "›" (Handoff Abschnitt 6 "Geräte").
     Kein zentrales Muster fuer diese Form vorhanden (siehe
     docs/design/offene-punkte-redesign.md, Punkt 8). */
  .panel {
    background: var(--blatt);
    border-radius: var(--r-blatt);
    padding: 0 var(--r4);
    margin-bottom: var(--r5);
    display: flex;
    flex-direction: column;
  }
  .panel > :not(:first-child) {
    border-top: 1px solid var(--linie);
  }
  .zeile {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 56px;
    border: none;
    background: transparent;
    font-family: var(--schrift);
    text-align: left;
    cursor: pointer;
  }
  .name {
    font-size: var(--fs-bedienwort);
    color: var(--tinte);
  }
  /* Setups sind die eigentliche Alltagseinheit (siehe Kopfkommentar) —
     etwas staerker gesetzt als Muehlen/Bruehgeraete (Regel 3). */
  .name.betont {
    font-weight: var(--gw-titel);
  }
  .chevron {
    color: var(--spur);
    font-size: var(--fs-bedienwort);
  }
  .anlegen {
    display: flex;
    align-items: center;
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
</style>
