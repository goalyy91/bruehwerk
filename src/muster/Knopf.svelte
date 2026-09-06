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
  /* Primäraktion: Pille, Füllfläche, Schrift auf Füllfläche (Handoff 3.8).
     Redesign v2, Etappe 1 hatte hier kurzzeitig Sans probiert (Mockup-
     Rückmeldung "Serif 600 wirkt klobig"), am echten Gerät ("Import
     ausführen", Migration.svelte) war das Urteil umgekehrt: zurück auf
     Serif, dieselbe Schriftart wie Kaffeeblatt Name/Röster — .knopf
     liefert sie bereits (var(--schrift), fs-bedienwort), .primaer braucht
     keine eigene Font-Deklaration mehr. */
  .primaer {
    min-height: var(--primaeraktion-hoehe);
    background: var(--fuellung);
    color: var(--auf-fuellung);
    border: none;
    /* Einen Schritt kleiner als die Knopf-Grundschrift (17px) — die volle
       50px-Pillenfläche traegt schon genug Gewicht, 600 gleicht die
       kleinere Groesse aus (Handoff 3.2: Fett ausdruecklich auf der
       Fuellflaeche erlaubt). */
    font-size: var(--fs-satz);
    font-weight: 600;
  }
  /* Redesign v2, Rückmeldung 2026-09-04 — der 1px-Rand war auf der warmen
     Papierfarbe kaum sichtbar ("sieht nur nach Text aus"). Jetzt dieselbe
     --vertiefung-Fläche wie andere ruhige Bedienelemente (Segment,
     Mengensteller) — bleibt klar unter --fuellung, ist aber eindeutig ein
     Knopf statt eines Links. */
  .sekundaer {
    background: var(--vertiefung);
    color: var(--satz);
    border: none;
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
