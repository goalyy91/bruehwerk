<script lang="ts">
  // AuswahlListe — ein zuklappbares Auswahlfeld (UX-2, Korrektur nach
  // Rueckmeldung). Fuer laengere oder unterschiedlich lange Listen, bei
  // denen Segment.svelte (immer gleich breite Felder) nicht mehr passt —
  // z. B. Aufbereitung mit sechs Optionen oder eine Setup-Auswahl mit
  // freien Namen.
  //
  // Verhalten: geschlossen zeigt ein einzelnes Feld wie ein Textfeld, leer
  // oder mit dem gewaehlten Wert. Antippen klappt die Optionen darunter
  // auf; ein Tap auf eine Option waehlt sie und klappt wieder zu. Erneutes
  // Antippen des Felds oeffnet die Liste erneut zum Aendern.
  //
  // Erste Fassung zeigte alle Optionen immer offen — das sah bei "nichts
  // gewaehlt" wie gewoehnlicher Fliesstext aus, kein erkennbares Feld.
  //
  // Kein Overlay, keine eigene Buehne: das Aufklappen bleibt im Fluss der
  // Seite (der Rest des Formulars ruckt runter), kein modaler Dialog, kein
  // neuer Verlaufseintrag — ruehrt den Verlauf aus dem Navigations-Umbau
  // (UX-1) nicht an.

  let {
    optionen,
    wert,
    onWahl,
    platzhalter = 'wählen …',
  }: {
    optionen: readonly { wert: string; label: string }[];
    wert: string;
    onWahl: (wert: string) => void;
    platzhalter?: string;
  } = $props();

  let offen = $state(false);

  const gewaehlteOption = $derived(optionen.find((o) => o.wert === wert));

  function waehlen(neu: string) {
    onWahl(neu);
    offen = false;
  }
</script>

<div class="auswahlfeld">
  <button type="button" class="feld" class:offen aria-expanded={offen} onclick={() => (offen = !offen)}>
    <span class="wert" class:platzhalter={!gewaehlteOption}>{gewaehlteOption?.label ?? platzhalter}</span>
    <span class="pfeil" class:offen aria-hidden="true">▾</span>
  </button>

  {#if offen}
    <div class="liste">
      {#each optionen as option (option.wert)}
        <button
          type="button"
          class="zeile"
          class:gewaehlt={option.wert === wert}
          aria-pressed={option.wert === wert}
          onclick={() => waehlen(option.wert)}
        >
          <span class="label">{option.label}</span>
          {#if option.wert === wert}<span class="haken" aria-hidden="true">✓</span>{/if}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .auswahlfeld {
    display: flex;
    flex-direction: column;
  }
  .feld {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-height: var(--treffer);
    padding: 0 var(--r3);
    border: 1px solid var(--feld-rahmen);
    background: var(--feld);
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    text-align: left;
    cursor: pointer;
  }
  .feld.offen {
    border-bottom: none;
  }
  .wert {
    color: var(--tinte);
  }
  .wert.platzhalter {
    color: var(--gedaempft);
  }
  .pfeil {
    flex-shrink: 0;
    color: var(--gedaempft);
    transition: transform var(--t-auswahl) var(--e-rein);
  }
  .pfeil.offen {
    transform: rotate(180deg);
  }
  .liste {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--feld-rahmen);
    border-top: none;
    background: var(--feld);
  }
  .zeile {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
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
  .zeile.gewaehlt {
    color: var(--tinte);
    font-weight: var(--gw-titel);
  }
  .haken {
    color: var(--akzent);
  }
</style>
