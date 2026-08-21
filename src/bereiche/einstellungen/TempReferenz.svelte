<script lang="ts">
  // Temperatur-Referenz-Editor — "Dein Gerätepark" in docs/konzept.md.
  // Die Startbelegung (Kessel − 27 K, Herkunft geschätzt) steht schon in
  // stammdaten.ts. Diese Tabelle wird Zeile für Zeile ersetzt, sobald die
  // echte Messreihe da ist — als Herkunft übernommen, nicht geschätzt.
  //
  // Korrekturrunde (Teil 3+4): haengt jetzt fest an einem Geraet (Prop
  // statt eigener Geraete-Auswahl — sie hing schon in Bruehgeraetblatt, wo
  // PID an ist) und zeigt eine vertikale Zeilenliste statt einer breiten
  // <table>, die seitlich ueber den Bildschirmrand lief.
  //
  // offene-punkte-ux.md Punkt 3: arbeitet jetzt auf reinen Werten statt
  // direkt auf der Ablage (werte/onAendern statt bruehgeraetId + schreiben)
  // — dasselbe Muster wie GussplanEditor.svelte fuer Profile. Damit
  // funktioniert diese Komponente auch fuer ein noch nicht gespeichertes
  // Geraet: der Aufrufer (TempReferenzScreen.svelte) haelt den Entwurf.
  //
  // Herkunft-Auswahl ist jetzt eine AuswahlListe statt Einzelauswahl-Chips
  // — dieselbe Form wie die Aufbereitungsart beim Kaffee, nur mit den
  // Herkunftszeichen (K54) neben dem Text.

  import AuswahlListe from '../../muster/AuswahlListe.svelte';
  import type { TempReferenzPunkt } from '../../daten/schema';

  let { werte, onAendern }: { werte: TempReferenzPunkt[]; onAendern: (werte: TempReferenzPunkt[]) => void } = $props();

  const reihe = $derived([...werte].sort((a, b) => a.kt - b.kt));

  let neuKt = $state('');
  let neuFlush = $state('3');
  let neuGruppe = $state('');
  let neuHerkunft = $state<TempReferenzPunkt['herkunft']>('uebernommen');

  const HERKUNFT_OPTIONEN: { wert: TempReferenzPunkt['herkunft']; label: string; symbol: 'punkt' | 'ring' | 'gestrichelt' }[] = [
    { wert: 'gemessen', label: 'gemessen', symbol: 'punkt' },
    { wert: 'uebernommen', label: 'übernommen', symbol: 'ring' },
    { wert: 'geschaetzt', label: 'geschätzt', symbol: 'gestrichelt' },
  ];

  function zeileHinzufuegen() {
    if (neuKt === '' || neuGruppe === '') return;
    const punkt: TempReferenzPunkt = {
      kt: Number(neuKt.replace(',', '.')),
      flush: Number(neuFlush.replace(',', '.')),
      gruppe: Number(neuGruppe.replace(',', '.')),
      herkunft: neuHerkunft,
    };
    onAendern([...werte, punkt]);
    neuKt = '';
    neuGruppe = '';
  }

  function zeileEntfernen(index: number) {
    onAendern(reihe.filter((_, i) => i !== index));
  }
</script>

<h3>Temperatur-Referenz</h3>

{#if reihe.length === 0}
  <p class="hinweis">keine Messreihe</p>
{:else}
  <ul class="liste">
    {#each reihe as punkt, i (i)}
      <li class="zeile">
        <span class="zeichen" class:voll={punkt.herkunft === 'gemessen'} class:ring={punkt.herkunft === 'uebernommen'} class:gestrichelt={punkt.herkunft === 'geschaetzt'}></span>
        <span class="werte">
          <span class="zahl">{punkt.kt} °C Kessel</span>
          <span class="abgeleitet zahl" class:gedaempft={punkt.herkunft === 'geschaetzt'}>
            {punkt.herkunft === 'geschaetzt' ? `≈ ${Math.round(punkt.gruppe)}` : punkt.gruppe} °C Gruppe · {punkt.flush} s Flush
          </span>
        </span>
        <button type="button" class="entfernen" onclick={() => zeileEntfernen(i)}>entfernen</button>
      </li>
    {/each}
  </ul>
{/if}

<div class="neue-zeile">
  <label>Kessel <input type="text" inputmode="decimal" placeholder="°C" bind:value={neuKt} /></label>
  <label>Flush <input type="text" inputmode="decimal" placeholder="s" bind:value={neuFlush} /></label>
  <label>Gruppe <input type="text" inputmode="decimal" placeholder="°C" bind:value={neuGruppe} /></label>
  <div class="herkunft-feld">
    <span class="feld-label">Herkunft</span>
    <AuswahlListe optionen={HERKUNFT_OPTIONEN} wert={neuHerkunft} onWahl={(w) => (neuHerkunft = w as TempReferenzPunkt['herkunft'])} />
  </div>
  <button type="button" class="hinzufuegen" onclick={zeileHinzufuegen} disabled={neuKt === '' || neuGruppe === ''}>Zeile hinzufügen</button>
</div>

<style>
  h3 {
    font-size: var(--fs-label);
    letter-spacing: var(--label-spacing);
    text-transform: uppercase;
    color: var(--gedaempft);
    font-weight: var(--gw-text);
    margin: var(--r4) 0 var(--r2);
  }
  .hinweis {
    color: var(--gedaempft);
    font-size: var(--fs-satz);
  }
  .liste {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .zeile {
    display: flex;
    align-items: center;
    gap: var(--r3);
    min-height: var(--treffer);
    border-bottom: 1px solid var(--linie-zart);
  }
  .zeichen {
    flex: none;
    width: var(--zeichen);
    height: var(--zeichen);
    border-radius: 50%;
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
  .werte {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }
  .zahl {
    font-variant-numeric: var(--zahl-features);
  }
  .werte .zahl:first-child {
    font-size: var(--fs-satz);
    color: var(--tinte);
  }
  .abgeleitet {
    font-size: var(--fs-meta);
    color: var(--satz);
  }
  .abgeleitet.gedaempft {
    color: var(--gedaempft);
  }
  .entfernen {
    flex: none;
    background: none;
    border: none;
    color: var(--gedaempft);
    font-family: var(--schrift);
    font-size: var(--fs-meta);
    cursor: pointer;
  }
  .neue-zeile {
    display: flex;
    flex-direction: column;
    gap: var(--r2);
    margin-top: var(--r3);
    padding-top: var(--r3);
    border-top: 1px solid var(--linie);
  }
  .neue-zeile label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--r2);
    font-size: var(--fs-meta);
    color: var(--satz);
  }
  .neue-zeile input {
    width: 100px;
    font-family: var(--schrift);
    font-variant-numeric: var(--zahl-features);
    font-size: var(--fs-satz);
    background: var(--feld);
    border: 1px solid var(--feld-rahmen);
    color: var(--tinte);
    padding: var(--r1) var(--r2);
    min-height: 40px;
    text-align: right;
  }
  .herkunft-feld {
    display: flex;
    flex-direction: column;
    gap: var(--r1);
    align-items: stretch;
  }
  .feld-label {
    font-size: var(--fs-meta);
    color: var(--satz);
  }
  .hinzufuegen {
    min-height: var(--treffer);
    background: var(--feld);
    border: 1px solid var(--linie);
    color: var(--tinte);
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    cursor: pointer;
  }
  .hinzufuegen:disabled {
    opacity: 0.5;
    cursor: default;
  }
</style>
