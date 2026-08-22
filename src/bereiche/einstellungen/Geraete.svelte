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
<ul class="liste">
  {#each bestand.setups as s (s.id)}
    <li><button type="button" class="zeile" onclick={() => onOeffnenSetup(s.id)}>{s.name}</button></li>
  {/each}
</ul>
<button type="button" class="fusszeile betont" onclick={() => onOeffnenSetup()}>+ Setup</button>

<h2>Mühlen</h2>
<ul class="liste">
  {#each bestand.muehlen as m (m.id)}
    <li><button type="button" class="zeile" onclick={() => onOeffnenMuehle(m.id)}>{m.name}</button></li>
  {/each}
</ul>
<button type="button" class="fusszeile" onclick={() => onOeffnenMuehle()}>+ Mühle</button>

<h2>Brühgeräte</h2>
<ul class="liste">
  {#each bestand.bruehgeraete as b (b.id)}
    <li><button type="button" class="zeile" onclick={() => onOeffnenBruehgeraet(b.id)}>{b.name}</button></li>
  {/each}
</ul>
<button type="button" class="fusszeile" onclick={() => onOeffnenBruehgeraet()}>+ Brühgerät</button>

<style>
  h2 {
    font-size: var(--fs-label);
    letter-spacing: var(--label-spacing);
    text-transform: uppercase;
    color: var(--gedaempft);
    font-weight: var(--gw-text);
    margin: var(--r5) 0 var(--r2);
  }
  .liste {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .zeile {
    width: 100%;
    display: block;
    min-height: var(--treffer);
    padding: var(--r2) 0;
    border: none;
    border-bottom: 1px solid var(--linie-zart);
    background: transparent;
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    color: var(--tinte);
    text-align: left;
    cursor: pointer;
    transition: background var(--t-auswahl) var(--e-rein);
  }
  .zeile:active {
    background: var(--feld);
  }
  .fusszeile {
    display: block;
    width: 100%;
    min-height: var(--treffer);
    margin-top: var(--r2);
    background: none;
    border: none;
    color: var(--akzent);
    font-family: var(--schrift);
    font-size: var(--fs-meta);
    text-align: left;
    cursor: pointer;
  }
  /* Setups sind die eigentliche Alltagseinheit (siehe Kopfkommentar) — eine
     einzige, etwas staerker gesetzte Anlege-Zeile statt drei gleichrangiger
     "+ X" (Regel 3). Immer noch kein gefuellter Akzentknopf (Regel 6). */
  .fusszeile.betont {
    color: var(--tinte);
    font-size: var(--fs-satz);
    font-weight: var(--gw-titel);
  }
</style>
