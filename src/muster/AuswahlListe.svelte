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
  //
  // Optionales `farbe` je Option (Aromapaket, Rueckmeldung "Farbe gehoert in
  // die Auswahlliste, nicht auf die Frage") — der Kategorie-Punkt aus
  // tokens.css, unabhaengig vom Herkunftszeichen: beide koennen nebeneinander
  // stehen, ohne sich die Bedeutung zu teilen. Fuer den Uebungsmodus, wo eine
  // Frage nach dem Aroma-*Namen* fragt und der Punkt deshalb erst in der
  // Antwortliste stehen darf, nie in der Frage selbst — sonst wuerde die
  // Kategorie verraten, bevor geraten wurde.
  //
  // Visueller Redesign-Reset (Handoff 3.8 "Eingabefeld Text/Auswahl"):
  // geschlossenes Feld = Vertiefung, Radius 4, "▾" in Spurfarbe. Die
  // aufgeklappte Liste bleibt ein eigenes Blatt mit Haarlinien; eine
  // gewählte Zeile bekommt jetzt die Füllfläche statt Fettschrift + Haken.
  //
  // `suchbar` (Aromapaket, Uebungsmodus-Rueckmeldung): optionales Tippen-und-
  // Filtern fuer lange Listen (60 Flaeschchennamen beim "Benennen") — rein
  // additiv, ohne den Prop bleiben alle anderen Aufrufer (Aufbereitung,
  // Setup-Namen, ...) unveraendert, auch optisch. Kein eigenes Muster
  // (ux-regeln R6/R12): Erweiterung des Bausteins statt einer Kopie. Bewusst
  // kein muster/Suchfeld.svelte darin — dessen Pillenform/Hoehe ist fuer eine
  // Seiten-Suchzeile gedacht, nicht fuer ein eingebettetes Dropdown.
  type Zeichen = 'punkt' | 'ring' | 'gestrichelt';

  let {
    optionen,
    wert,
    onWahl,
    platzhalter = 'wählen …',
    suchbar = false,
  }: {
    optionen: readonly { wert: string; label: string; symbol?: Zeichen; farbe?: string }[];
    wert: string;
    onWahl: (wert: string) => void;
    platzhalter?: string;
    suchbar?: boolean;
  } = $props();

  let offen = $state(false);
  let suchtext = $state('');
  let sucheingabe = $state<HTMLInputElement | undefined>(undefined);

  const gewaehlteOption = $derived(optionen.find((o) => o.wert === wert));

  // Die gewaehlte Option steht schon im Feld-Kopf (samt Pfeil) — die
  // aufgeklappte Liste zeigt deshalb nur noch die anderen. Sie dort
  // nochmal aufzufuehren waere eine sichtbare Dopplung desselben Werts.
  const andereOptionen = $derived(optionen.filter((o) => o.wert !== wert));

  // Nur bei `suchbar` gefiltert — die kurzen Listen (2-8 Optionen) verhalten
  // sich exakt wie bisher, unabhaengig vom (dann leeren) Suchtext.
  const sichtbareOptionen = $derived(
    suchbar && suchtext.trim() !== ''
      ? andereOptionen.filter((o) => o.label.toLocaleLowerCase('de').includes(suchtext.trim().toLocaleLowerCase('de')))
      : andereOptionen,
  );

  function waehlen(neu: string) {
    onWahl(neu);
    offen = false;
    suchtext = '';
  }

  function umschalten() {
    offen = !offen;
    if (!offen) suchtext = '';
  }

  // Fokus direkt im Suchfeld, sobald die Liste aufklappt — kein Extra-Tap
  // zum Lostippen.
  $effect(() => {
    if (offen && suchbar) sucheingabe?.focus();
  });
</script>

<div class="auswahlfeld">
  <button type="button" class="feld" class:offen aria-expanded={offen} onclick={umschalten}>
    <span class="wert" class:platzhalter={!gewaehlteOption}>
      {#if gewaehlteOption?.farbe}<span class="kategorie-punkt" style="--punkt-farbe: {gewaehlteOption.farbe}"></span>{/if}
      {#if gewaehlteOption?.symbol}
        <span class="zeichen" class:voll={gewaehlteOption.symbol === 'punkt'} class:ring={gewaehlteOption.symbol === 'ring'} class:gestrichelt={gewaehlteOption.symbol === 'gestrichelt'}></span>
      {/if}
      {gewaehlteOption?.label ?? platzhalter}
    </span>
    <span class="pfeil" class:offen aria-hidden="true">▾</span>
  </button>

  {#if offen}
    <div class="liste" class:suchbar>
      {#if suchbar}
        <input
          bind:this={sucheingabe}
          class="sucheingabe"
          type="text"
          placeholder="suchen …"
          value={suchtext}
          oninput={(e) => (suchtext = e.currentTarget.value)}
        />
      {/if}
      <div class="optionen" class:hoehenbegrenzt={suchbar}>
        {#each sichtbareOptionen as option (option.wert)}
          <button
            type="button"
            class="zeile"
            class:gewaehlt={option.wert === wert}
            aria-pressed={option.wert === wert}
            onclick={() => waehlen(option.wert)}
          >
            <span class="label">
              {#if option.farbe}<span class="kategorie-punkt" style="--punkt-farbe: {option.farbe}"></span>{/if}
              {#if option.symbol}
                <span class="zeichen" class:voll={option.symbol === 'punkt'} class:ring={option.symbol === 'ring'} class:gestrichelt={option.symbol === 'gestrichelt'}></span>
              {/if}
              {option.label}
            </span>
            {#if option.wert === wert}<span class="haken" aria-hidden="true">✓</span>{/if}
          </button>
        {:else}
          <p class="keine-treffer">Kein Aroma passt zu „{suchtext}".</p>
        {/each}
      </div>
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
    min-height: 38px;
    padding: 0 var(--r3);
    border: none;
    border-radius: var(--r-wertfeld);
    background: var(--vertiefung);
    font-family: var(--schrift-sans);
    font-size: var(--fs-satz);
    text-align: left;
    cursor: pointer;
  }
  .feld.offen {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
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
    border-radius: 0 0 var(--r-wertfeld) var(--r-wertfeld);
    overflow: hidden;
    background: var(--blatt);
  }
  .sucheingabe {
    width: 100%;
    min-height: var(--treffer);
    padding: 0 var(--r3);
    border: none;
    border-bottom: 1px solid var(--linie);
    background: transparent;
    color: var(--tinte);
    font-family: var(--schrift-sans);
    font-size: var(--fs-satz);
  }
  .sucheingabe::placeholder {
    color: var(--gedaempft);
  }
  .optionen {
    display: flex;
    flex-direction: column;
  }
  /* Nur bei `suchbar`: sonst blieben 60 Optionen eine ellenlange Seite,
     Suchfeld hin oder her — mit Begrenzung scrollt nur die Liste selbst. */
  .optionen.hoehenbegrenzt {
    max-height: calc(var(--treffer) * 5.5);
    overflow-y: auto;
  }
  .keine-treffer {
    margin: 0;
    padding: var(--r3);
    color: var(--gedaempft);
    font-family: var(--schrift-sans);
    font-size: var(--fs-satz);
  }
  .zeile {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-height: var(--treffer);
    padding: 0 var(--r3);
    border: none;
    border-top: 1px solid var(--linie);
    background: transparent;
    color: var(--satz);
    font-family: var(--schrift-sans);
    font-size: var(--fs-satz);
    text-align: left;
    cursor: pointer;
  }
  .zeile.gewaehlt {
    background: var(--fuellung);
    color: var(--auf-fuellung);
  }
  .haken {
    color: inherit;
  }
</style>
