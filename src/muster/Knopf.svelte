<script lang="ts">
  // Knopf — UX-Korrekturrunde (docs/ux-regeln.md Regel 3/6). Buendelt das
  // .primaer/.sekundaer-Knopf-CSS, das vorher in acht Bildschirmen fast
  // wortgleich kopiert war (Kaffeeblatt, KaffeeNeu, KaffeeBearbeiten,
  // Profilblatt, ShotErfassung, KaffeeListe, Geraete-Blaetter, Migration).
  //
  // Visueller Redesign-Reset (docs/design/redesign-v1-handoff.md, Abschnitt
  // 3.8 "Primäraktion"): "primaer" ist jetzt die Pille mit der einen
  // Füllfläche des Themes (--fuellung/--auf-fuellung) — das Handoff kennt
  // kein zurückhaltendes Primaerkonzept mehr, sondern genau eine gefüllte
  // Fläche für Auswahl UND Primäraktion. --fuellung/--auf-fuellung sind je
  // Theme als Gegenpaar definiert, die Textfarbe stimmt automatisch in hell
  // und dunkel.
  //
  // "sekundaer"/"still"/"kritisch" sind im Handoff nicht einzeln
  // spezifiziert (dort nur "Sekundäraktion: Textzeile im Akzent, keine
  // Fläche") — sie bleiben deshalb strukturell wie bisher (Rahmen bzw. reiner
  // Text) und übernehmen nur die neue Radius-/Linienrolle, statt hier eine
  // neue, vom Handoff nicht gedeckte Fläche zu erfinden.
  //
  // "kritisch" ist fuer destruktive Aktionen (loeschen) reserviert und
  // gehoert nicht in dieselbe Zeile wie "speichern" — siehe Kontextmenue.svelte.
  import type { Snippet } from 'svelte';

  let {
    stufe = 'sekundaer',
    onKlick,
    deaktiviert = false,
    typ = 'button',
    children,
  }: {
    stufe?: 'primaer' | 'sekundaer' | 'still' | 'kritisch';
    onKlick?: () => void;
    deaktiviert?: boolean;
    typ?: 'button' | 'submit';
    children: Snippet;
  } = $props();
</script>

<button type={typ} class="knopf {stufe}" onclick={onKlick} disabled={deaktiviert}>
  {@render children()}
</button>

<style>
  .knopf {
    min-height: var(--treffer);
    padding: 0 var(--r4);
    font-family: var(--schrift);
    font-size: var(--fs-bedienwort);
    cursor: pointer;
    border-radius: var(--r-pille);
    transition:
      background var(--t-auswahl) var(--e-rein),
      border-color var(--t-auswahl) var(--e-rein);
  }
  .knopf:disabled {
    opacity: 0.5;
    cursor: default;
  }
  /* Primäraktion: Pille, Füllfläche, Schrift auf Füllfläche (Handoff 3.8). */
  .primaer {
    min-height: var(--primaeraktion-hoehe);
    background: var(--fuellung);
    color: var(--auf-fuellung);
    border: none;
  }
  .sekundaer {
    background: transparent;
    color: var(--satz);
    border: 1px solid var(--linie);
  }
  .still {
    background: transparent;
    color: var(--gedaempft);
    border: none;
  }
  .kritisch {
    background: transparent;
    color: var(--kritisch);
    border: 1px solid var(--kritisch);
  }
</style>
