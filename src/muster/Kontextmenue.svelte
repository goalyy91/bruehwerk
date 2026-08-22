<script lang="ts">
  // Kontextmenue — UX-Korrekturrunde (docs/ux-regeln.md Regel 4). Faellig,
  // sobald ein Bildschirm mehr als eine Sekundaeraktion hat (bearbeiten +
  // loeschen). Solange es nur eine gibt, bleibt es beim Stift-Symbol im
  // `aktion`-Slot von Kopfzeile.svelte — das aendert dieses Muster nicht.
  //
  // Kein Bottom Sheet: dieselbe Aufklapp-Mechanik wie AuswahlListe.svelte,
  // im Seitenfluss statt als modaler Dialog (Regel 4 schliesst ein zweites
  // Bauteil fuer denselben Zweck ausdruecklich aus).
  //
  // Ein Eintrag mit `kritisch: true` (z. B. loeschen) fragt vor dem
  // Ausfuehren im selben Fluss nach — kein natives confirm()/alert(), das
  // faellt aus dem Laborbuch-Look (K44-Nachbarregel: keine Wischgeste, hier:
  // kein OS-Dialog). Ein zweiter Tap auf denselben Eintrag bestaetigt.

  type Eintrag = {
    text: string;
    kritisch?: boolean;
    onWahl: () => void;
  };

  let { eintraege }: { eintraege: Eintrag[] } = $props();

  let offen = $state(false);
  let bestaetigen = $state<number | undefined>(undefined);

  function tippen(index: number, eintrag: Eintrag) {
    if (eintrag.kritisch && bestaetigen !== index) {
      bestaetigen = index;
      return;
    }
    eintrag.onWahl();
    offen = false;
    bestaetigen = undefined;
  }

  function schliessen() {
    offen = false;
    bestaetigen = undefined;
  }
</script>

<div class="kontextmenue">
  <button type="button" class="ausloeser" aria-label="weitere Aktionen" aria-expanded={offen} onclick={() => (offen ? schliessen() : (offen = true))}>
    ⋯
  </button>

  {#if offen}
    <!-- Klick daneben schliesst wieder zu, wie bei AuswahlListe.svelte. -->
    <button type="button" class="hintergrund" aria-label="schließen" onclick={schliessen}></button>
    <div class="liste">
      {#each eintraege as eintrag, index (eintrag.text)}
        <button type="button" class="zeile" class:kritisch={eintrag.kritisch} onclick={() => tippen(index, eintrag)}>
          {bestaetigen === index ? `„${eintrag.text}“ wirklich?` : eintrag.text}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .kontextmenue {
    position: relative;
  }
  .ausloeser {
    width: var(--treffer);
    height: var(--treffer);
    background: none;
    border: none;
    color: var(--gedaempft);
    font-size: var(--fs-titel);
    line-height: 1;
    cursor: pointer;
  }
  .hintergrund {
    position: fixed;
    inset: 0;
    background: transparent;
    border: none;
    padding: 0;
    z-index: 1;
  }
  .liste {
    position: absolute;
    top: 100%;
    right: 0;
    z-index: 2;
    display: flex;
    flex-direction: column;
    min-width: 180px;
    border: 1px solid var(--feld-rahmen);
    background: var(--feld-blatt);
  }
  .zeile {
    min-height: var(--treffer);
    padding: 0 var(--r3);
    border: none;
    border-top: 1px solid var(--linie-zart);
    background: transparent;
    color: var(--satz);
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    text-align: left;
    cursor: pointer;
  }
  .zeile:first-child {
    border-top: none;
  }
  .zeile.kritisch {
    color: var(--kritisch);
  }
</style>
