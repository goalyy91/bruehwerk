<script lang="ts">
  // Gussplanansicht — reine Anzeige des Gussplans beim Shot-Loggen (K7,
  // "Was je Gerät gilt": "Der Gussplan ist im Zubereitungsweg erreichbar,
  // aber nur ansehbar — tippbar ist allein 'Plan ändern'."). Bearbeitet wird
  // er ausschliesslich in GussplanEditor.svelte (Profilblatt) — dort ist
  // Ruhe dafuer, mitten im Aufguss nicht.
  //
  // Teilt sich die Formatierung mit dem Editor ueber
  // domain/gussplan.ts::bausteinZeile()/BAUSTEIN_LABEL, statt sie ein
  // zweites Mal nachzubauen (ux-regeln.md Regel 6/12).
  //
  // Absichtlich kompakter als die Editor-Zeile (kein 48-px-Trefferziel,
  // keine Werkzeuge): eine Zeile ist hier kein Bedienelement.

  import { bausteinZeile, BAUSTEIN_LABEL, type GussplanBaustein, type Lesart } from '../domain/gussplan';
  import Blattliste from './Blattliste.svelte';

  let { bausteine, lesart }: { bausteine: readonly GussplanBaustein[]; lesart: Lesart } = $props();
</script>

<div class="gussplanansicht">
  <div class="gruppenkopf">Gussplan</div>
  <Blattliste>
    {#each bausteine as baustein, i (i)}
      <div class="zeile">
        <div class="kopf">
          <span class="typ">{BAUSTEIN_LABEL[baustein.typ]}</span>
          <span class="wert zahl">{bausteinZeile(baustein, lesart)}</span>
        </div>
        <!-- Bei "warten" ist die Notiz schon der Wert oben (bausteinZeile) —
             sie hier nochmal zu zeigen waere dieselbe Information doppelt.
             "frei" (Migrations-Altbestand) hat gar kein Notiz-Feld. -->
        {#if baustein.typ !== 'warten' && baustein.typ !== 'frei' && baustein.notiz}
          <p class="notiz">{baustein.notiz}</p>
        {/if}
      </div>
    {/each}
  </Blattliste>
</div>

<style>
  .gruppenkopf {
    font-family: var(--schrift-sans);
    font-size: var(--fs-label);
    letter-spacing: var(--label-spacing);
    text-transform: uppercase;
    color: var(--gedaempft);
    margin: 0 0 var(--r-kachelabstand);
  }
  .zeile {
    padding: 7px 0;
  }
  .kopf {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--r2);
  }
  .typ {
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  /* Serif bewusst: die Zahl ist Inhalt, dieselbe Regel wie im Editor
     (GussplanEditor.svelte). */
  .wert {
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    color: var(--tinte);
    text-align: right;
  }
  .notiz {
    margin: 2px 0 0;
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
</style>
