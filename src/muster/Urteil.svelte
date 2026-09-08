<script lang="ts">
  // Muster 1 · Urteil (Sitzung 6 - Übergabe, Abschnitt 2).
  // 2×2-Gitter, vier gleich große Kacheln, Wort mittig, kein Rangzeichen.
  //
  // Visueller Redesign-Reset (Handoff Abschnitt 3.6/3.8): Gewählt ist jetzt
  // ausschließlich die Füllfläche des Themes — kein Akzentstrich mehr, kein
  // zusätzliches "gut"-Zeichen obendrauf. Das Zustandszeichen (gefüllt/halb/
  // schraffiert) bleibt eine eigene Sprache für Messwerte (siehe
  // Verlaufskurve.svelte, IstGegenZiel.svelte) und beschreibt dort einen
  // Shot-Befund — hier ging es um die Auswahlmarkierung einer Bedienfläche,
  // die beiden Zeichen wurden vorher unnötig vermischt.

  import { untrack } from 'svelte';

  // Rueckmeldung 2026-09-08: 'Referenz' ist raus — drei Stufen reichen.
  // Die vierte hing an keiner eigenen Funktion (nur 'daneben' loest die
  // Diagnose aus) und war damit eine Unterscheidung, die man beim Tippen
  // treffen musste, ohne dass sie etwas bewirkt haette. Im Datenmodell
  // bleibt 'referenz' erhalten (daten/schema/common.ts) — alte Shots
  // werden als 'sehr gut' angezeigt, nichts geht verloren.
  const STUFEN = ['daneben', 'okay', 'sehr gut'] as const;
  type Stufe = (typeof STUFEN)[number];

  let { start, onWahl }: { start?: Stufe; onWahl?: (stufe: Stufe) => void } = $props();

  // `start` ist nur der Anfangswert — danach führt die Komponente ihre
  // eigene Auswahl. untrack() macht dieses Nur-einmal-lesen ausdrücklich.
  let gewaehlt = $state<Stufe | undefined>(untrack(() => start));

  function waehle(stufe: Stufe) {
    gewaehlt = stufe;
    onWahl?.(stufe);
  }
</script>

<div class="urteil">
  {#each STUFEN as stufe (stufe)}
    <button
      type="button"
      class="kachel"
      class:gewaehlt={gewaehlt === stufe}
      onclick={() => waehle(stufe)}
    >
      {stufe}
    </button>
  {/each}
</div>

<style>
  /* Rückmeldung 2026-09-08 zum Mockup: „die wie war er chips aber gerne
     kleiner". Aus dem 2×2-Raster mit vier 58-px-Feldern wird eine Reihe
     Pillen, die umbricht — dieselben vier Wörter, deutlich weniger Fläche.
     Die Höhe bleibt bei --treffer (48 px): das Urteil ist der zweite Tap des
     Alltagspfads, und die Trefferfläche ist laut tokens.css nicht
     verhandelbar. Kleiner *wirken* darf es, kleiner *getroffen* werden nicht. */
  .urteil {
    display: flex;
    flex-wrap: wrap;
    gap: var(--r2);
  }
  .kachel {
    position: relative;
    min-height: var(--treffer);
    padding: 0 var(--r4);
    border: none;
    border-radius: var(--r-pille);
    background: var(--vertiefung);
    color: var(--satz);
    font-family: var(--schrift-sans);
    font-size: var(--fs-satz);
    font-weight: var(--gw-text);
    cursor: pointer;
    transition: background var(--t-auswahl) var(--e-rein);
  }
  .kachel.gewaehlt {
    background: var(--fuellung);
    color: var(--auf-fuellung);
  }
</style>
