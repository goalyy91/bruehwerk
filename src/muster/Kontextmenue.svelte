<script lang="ts">
  // Kontextmenue — UX-Korrekturrunde (docs/ux-regeln.md Regel 4). Die Regel
  // ist pro Aktion, nicht pro Bildschirm: haeufig gebrauchte Aktionen (z. B.
  // bearbeiten) bleiben als eigenes Icon im `aktion`-Slot von Kopfzeile.svelte
  // sichtbar (BearbeitenKnopf.svelte, AktivKnopf.svelte), nur seltene,
  // typischerweise destruktive Aktionen (loeschen) wandern hierher. Zwei
  // Aktionen auf einem Bildschirm heisst also nicht automatisch "beide ins
  // Menue" — Kaffeeblatt/Getraenkeblatt und seit 2026-09-11 auch Setup-/
  // Muehle-/Bruehgeraet-Ansicht zeigen bearbeiten direkt und nur loeschen
  // hier drin.
  //
  // Kein Bottom Sheet: dieselbe Aufklapp-Mechanik wie AuswahlListe.svelte,
  // im Seitenfluss statt als modaler Dialog (Regel 4 schliesst ein zweites
  // Bauteil fuer denselben Zweck ausdruecklich aus).
  //
  // Ein Eintrag mit `kritisch: true` (z. B. loeschen) fragt vor dem
  // Ausfuehren im selben Fluss nach — kein natives confirm()/alert(), das
  // faellt aus dem Laborbuch-Look (K44-Nachbarregel: keine Wischgeste, hier:
  // kein OS-Dialog). Ein zweiter Tap auf denselben Eintrag bestaetigt.
  //
  // Visueller Redesign-Reset, Paket 4: aufgeklapptes Menue als Blatt mit
  // Radius/Haarlinien statt eckig umrandeter Box.

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
    /* Etappe 9, Block D: keine Mindestbreite mehr — das Menü ist so breit wie
       sein längster Eintrag. 180 px zwangen kurze Menüs ("Löschen") in eine
       Fläche, die zur Hälfte leer war. */
    width: max-content;
    border-radius: var(--r-kachel);
    overflow: hidden;
    background: var(--blatt);
    /* Das Menue liegt *ueber* der Seite — das erzaehlt man mit Hoehe, nicht
       mit Farbe. Blatt auf Grund sind 1,14:1, es klebte deshalb als flacher
       Block auf dem Bildschirm. Genau der Fall, den der Token-Kopfkommentar
       fuer Schatten vorsieht: angehobene Flaeche, nicht generelle Elevation. */
    box-shadow:
      0 14px 30px -16px var(--schatten),
      0 2px 6px -2px var(--schatten);
  }
  .zeile {
    min-height: var(--treffer);
    padding: 0 var(--r3);
    border: none;
    border-top: 1px solid var(--linie);
    background: transparent;
    color: var(--satz);
    /* Etappe 9, Block D — der groesste einzelne Hebel der Etappe: Sans statt
       Serif. Ein Aktionsmenue ist Apparat, kein Inhalt; die Projektregel
       "Serif traegt den Inhalt, Sans nur den Apparat" gilt laengst und wurde
       hier nie befolgt. Native Kontextmenues sind ausnahmslos Systemschrift,
       nie eine Buchschrift — genau daran erkennt man an dieser Stelle, dass
       die App keine App ist. Zeilenhoehe bleibt bei --treffer. */
    font-family: var(--schrift-sans);
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
