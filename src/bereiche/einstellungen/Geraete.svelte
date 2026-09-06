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
  import Blattliste from '../../muster/Blattliste.svelte';
  import Blattzeile from '../../muster/Blattzeile.svelte';

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
<Blattliste>
  {#each bestand.setups as s (s.id)}
    <Blattzeile label={s.name} betont onKlick={() => onOeffnenSetup(s.id)} />
  {/each}
  <Blattzeile label="+ Setup" akzent chevron={false} onKlick={() => onOeffnenSetup()} />
</Blattliste>

<h2>Mühlen</h2>
<Blattliste>
  {#each bestand.muehlen as m (m.id)}
    <Blattzeile label={m.name} onKlick={() => onOeffnenMuehle(m.id)} />
  {/each}
  <Blattzeile label="+ Mühle" akzent chevron={false} onKlick={() => onOeffnenMuehle()} />
</Blattliste>

<h2>Brühgeräte</h2>
<Blattliste>
  {#each bestand.bruehgeraete as b (b.id)}
    <Blattzeile label={b.name} onKlick={() => onOeffnenBruehgeraet(b.id)} />
  {/each}
  <Blattzeile label="+ Brühgerät" akzent chevron={false} onKlick={() => onOeffnenBruehgeraet()} />
</Blattliste>

<!-- Kein lokales CSS mehr — Blattliste/Blattzeile.svelte (src/muster/)
     tragen jetzt die gesamte Darstellung (Etappe 8, Block D). "Setup" bleibt
     stärker gesetzt als Mühle/Brühgerät über den `betont`-Prop, dieselbe
     Regel wie vorher (Setups sind die eigentliche Alltagseinheit). -->
