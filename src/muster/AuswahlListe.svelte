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
  //
  // Optionales `symbol` je Option — dieselben drei Herkunftszeichen aus K54
  // (gefuellter Punkt · Ring · gestrichelter Ring, siehe Herkunft.svelte /
  // Einzelauswahl.svelte), fuer Auswahlen wie die Herkunft-Zeile der
  // Temperaturtabelle. Rein additiv: wer es weglaesst (z. B. Aufbereitung
  // beim Kaffee), sieht nur den Text wie bisher.
  type Zeichen = 'punkt' | 'ring' | 'gestrichelt';

  let {
    optionen,
    wert,
    onWahl,
    platzhalter = 'wählen …',
  }: {
    optionen: readonly { wert: string; label: string; symbol?: Zeichen }[];
    wert: string;
    onWahl: (wert: string) => void;
    platzhalter?: string;
  } = $props();

  let offen = $state(false);

  const gewaehlteOption = $derived(optionen.find((o) => o.wert === wert));

  // Die gewaehlte Option steht beim Aufklappen ganz oben (mit Haken) statt
  // an ihrer normalen Position in der Liste — man muss nicht erst suchen,
  // was gerade gilt, bevor man etwas anderes waehlt.
  const geordneteOptionen = $derived(
    gewaehlteOption ? [gewaehlteOption, ...optionen.filter((o) => o.wert !== wert)] : optionen,
  );

  function waehlen(neu: string) {
    onWahl(neu);
    offen = false;
  }
</script>

<div class="auswahlfeld">
  <button type="button" class="feld" class:offen aria-expanded={offen} onclick={() => (offen = !offen)}>
    <span class="wert" class:platzhalter={!gewaehlteOption}>
      {#if gewaehlteOption?.symbol}
        <span class="zeichen" class:voll={gewaehlteOption.symbol === 'punkt'} class:ring={gewaehlteOption.symbol === 'ring'} class:gestrichelt={gewaehlteOption.symbol === 'gestrichelt'}></span>
      {/if}
      {gewaehlteOption?.label ?? platzhalter}
    </span>
    <span class="pfeil" class:offen aria-hidden="true">▾</span>
  </button>

  {#if offen}
    <div class="liste">
      {#each geordneteOptionen as option (option.wert)}
        <button
          type="button"
          class="zeile"
          class:gewaehlt={option.wert === wert}
          aria-pressed={option.wert === wert}
          onclick={() => waehlen(option.wert)}
        >
          <span class="label">
            {#if option.symbol}
              <span class="zeichen" class:voll={option.symbol === 'punkt'} class:ring={option.symbol === 'ring'} class:gestrichelt={option.symbol === 'gestrichelt'}></span>
            {/if}
            {option.label}
          </span>
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
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--tinte);
  }
  .wert.platzhalter {
    color: var(--gedaempft);
  }
  .label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .zeichen {
    display: inline-block;
    width: var(--zeichen);
    height: var(--zeichen);
    border-radius: 50%;
    flex: none;
  }
  .zeichen.voll {
    background: var(--tinte);
  }
  .zeichen.ring {
    border: 1px solid var(--gedaempft);
  }
  .zeichen.gestrichelt {
    border: 1px dashed var(--gedaempft);
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
