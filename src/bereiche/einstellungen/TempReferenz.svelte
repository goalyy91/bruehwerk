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

  import { bestand, schreiben } from '../bestand.svelte';
  import Einzelauswahl from '../../muster/Einzelauswahl.svelte';
  import type { Bruehgeraet, TempReferenzPunkt } from '../../daten/schema';

  let { bruehgeraetId }: { bruehgeraetId: string } = $props();

  const geraet = $derived(bestand.bruehgeraete.find((b) => b.id === bruehgeraetId));
  const reihe = $derived(
    geraet ? [...geraet.tempReferenz].sort((a, b) => a.kt - b.kt) : ([] as TempReferenzPunkt[]),
  );

  let neuKt = $state('');
  let neuFlush = $state('3');
  let neuGruppe = $state('');
  let neuHerkunft = $state<TempReferenzPunkt['herkunft']>('uebernommen');
  let speicherFehler = $state<string | undefined>(undefined);

  const HERKUNFT_OPTIONEN: { wert: TempReferenzPunkt['herkunft']; label: string; symbol: 'punkt' | 'ring' | 'gestrichelt' }[] = [
    { wert: 'gemessen', label: 'gemessen', symbol: 'punkt' },
    { wert: 'uebernommen', label: 'übernommen', symbol: 'ring' },
    { wert: 'geschaetzt', label: 'geschätzt', symbol: 'gestrichelt' },
  ];

  async function zeileHinzufuegen() {
    if (!geraet || neuKt === '' || neuGruppe === '') return;
    speicherFehler = undefined;
    const punkt: TempReferenzPunkt = {
      kt: Number(neuKt.replace(',', '.')),
      flush: Number(neuFlush.replace(',', '.')),
      gruppe: Number(neuGruppe.replace(',', '.')),
      herkunft: neuHerkunft,
    };
    const aktualisiert: Bruehgeraet = { ...geraet, tempReferenz: [...geraet.tempReferenz, punkt] };
    try {
      await schreiben('bruehgeraet', aktualisiert);
      neuKt = '';
      neuGruppe = '';
    } catch (fehler) {
      speicherFehler = fehler instanceof Error ? fehler.message : String(fehler);
    }
  }

  async function zeileEntfernen(index: number) {
    if (!geraet) return;
    speicherFehler = undefined;
    const rest = reihe.filter((_, i) => i !== index);
    try {
      await schreiben('bruehgeraet', { ...geraet, tempReferenz: rest });
    } catch (fehler) {
      speicherFehler = fehler instanceof Error ? fehler.message : String(fehler);
    }
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
  <Einzelauswahl optionen={HERKUNFT_OPTIONEN} wert={neuHerkunft} onWahl={(w) => (neuHerkunft = w as TempReferenzPunkt['herkunft'])} />
  <button type="button" class="hinzufuegen" onclick={zeileHinzufuegen} disabled={neuKt === '' || neuGruppe === ''}>Zeile hinzufügen</button>
</div>

{#if speicherFehler}
  <p class="fehler">Nicht gespeichert: {speicherFehler} — nochmal versuchen.</p>
{/if}

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
  .fehler {
    color: var(--kritisch);
    font-size: var(--fs-satz);
    margin-top: var(--r3);
  }
</style>
