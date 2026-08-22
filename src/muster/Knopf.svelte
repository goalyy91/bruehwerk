<script lang="ts">
  // Knopf — UX-Korrekturrunde (docs/ux-regeln.md Regel 3/6). Buendelt das
  // .primaer/.sekundaer-Knopf-CSS, das vorher in acht Bildschirmen fast
  // wortgleich kopiert war (Kaffeeblatt, KaffeeNeu, KaffeeBearbeiten,
  // Profilblatt, ShotErfassung, KaffeeListe, Geraete-Blaetter, Migration).
  //
  // "primaer" ist bewusst NICHT akzentgefuellt — tokens.css/Regel 6: "kein
  // Primaerfarbe-Konzept mit gefuellten Buttons, der Akzent ist zurueck-
  // haltend eingesetzt". Betonung laeuft ueber eine --tinte-Flaeche statt
  // --akzent; --tinte/--grund sind je Theme als Gegenpaar definiert, die
  // Textfarbe stimmt also automatisch in hell und dunkel (kein eigenes
  // Kontrast-Token noetig, anders als das vorherige hart codierte
  // var(--h-papier), das im Dunkelmodus falsch war).
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
    font-size: var(--fs-satz);
    cursor: pointer;
    border-radius: var(--radius-feld);
    transition:
      background var(--t-auswahl) var(--e-rein),
      border-color var(--t-auswahl) var(--e-rein);
  }
  .knopf:disabled {
    opacity: 0.5;
    cursor: default;
  }
  .primaer {
    background: var(--tinte);
    color: var(--grund);
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
