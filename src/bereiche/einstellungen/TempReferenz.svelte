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
  //
  // UX-Korrekturrunde: der Erfassungsblock stand vorher dauerhaft offen,
  // auch beim reinen Ansehen einer bestehenden Tabelle (Regel 2/8) — jetzt
  // hinter "+ Messpunkt". Bleibt nach dem Hinzufuegen offen, weil eine
  // Messreihe meist aus mehreren Zeilen hintereinander besteht.
  //
  // Visueller Redesign-Reset, Paket 4: Zeilenliste als Blatt statt eckig
  // umrandet, Eingabefelder ueber die globale Utility .eingabefeld-text.

  import AuswahlListe from '../../muster/AuswahlListe.svelte';
  import Knopf from '../../muster/Knopf.svelte';
  import type { TempReferenzPunkt } from '../../daten/schema';

  let { werte, onAendern }: { werte: TempReferenzPunkt[]; onAendern: (werte: TempReferenzPunkt[]) => void } = $props();

  const reihe = $derived([...werte].sort((a, b) => a.kt - b.kt));

  let formularOffen = $state(false);
  let neuKt = $state('');
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
  <div class="panel">
    {#each reihe as punkt, i (i)}
      <div class="zeile">
        <span class="zeichen" class:voll={punkt.herkunft === 'gemessen'} class:ring={punkt.herkunft === 'uebernommen'} class:gestrichelt={punkt.herkunft === 'geschaetzt'}></span>
        <span class="werte">
          <span class="zahl">{punkt.kt} °C Kessel</span>
          <span class="abgeleitet zahl" class:gedaempft={punkt.herkunft === 'geschaetzt'}>
            {punkt.herkunft === 'geschaetzt' ? `≈ ${Math.round(punkt.gruppe)}` : punkt.gruppe} °C Gruppe
          </span>
        </span>
        <button type="button" class="entfernen" onclick={() => zeileEntfernen(i)}>entfernen</button>
      </div>
    {/each}
  </div>
{/if}

{#if formularOffen}
  <div class="neue-zeile">
    <label>Kessel <input class="eingabefeld-text zahl" type="text" inputmode="decimal" placeholder="°C" bind:value={neuKt} /></label>
    <label>Gruppe <input class="eingabefeld-text zahl" type="text" inputmode="decimal" placeholder="°C" bind:value={neuGruppe} /></label>
    <div class="herkunft-feld">
      <span class="feld-label">Herkunft</span>
      <AuswahlListe optionen={HERKUNFT_OPTIONEN} wert={neuHerkunft} onWahl={(w) => (neuHerkunft = w as TempReferenzPunkt['herkunft'])} />
    </div>
    <Knopf stufe="primaer" onKlick={zeileHinzufuegen} deaktiviert={neuKt === '' || neuGruppe === ''}>Zeile hinzufügen</Knopf>
  </div>
{:else}
  <button type="button" class="messpunkt-oeffnen" onclick={() => (formularOffen = true)}>+ Messpunkt</button>
{/if}

<style>
  h3 {
    font-family: var(--schrift-sans);
    font-size: var(--fs-gruppenkopf);
    letter-spacing: var(--label-spacing);
    text-transform: uppercase;
    color: var(--gedaempft);
    font-weight: var(--gw-text);
    margin: var(--r5) 0 var(--r-kachelabstand);
  }
  .hinweis {
    color: var(--gedaempft);
    font-size: var(--fs-satz);
  }
  .panel {
    background: var(--blatt);
    border-radius: var(--r-blatt);
    padding: 0 var(--r4);
    display: flex;
    flex-direction: column;
  }
  .panel > :not(:first-child) {
    border-top: 1px solid var(--linie);
  }
  .zeile {
    display: flex;
    align-items: center;
    gap: var(--r3);
    min-height: var(--treffer);
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
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--satz);
  }
  .abgeleitet.gedaempft {
    color: var(--gedaempft);
  }
  .entfernen {
    flex: none;
    min-height: var(--treffer);
    padding: 0 var(--r2);
    background: none;
    border: none;
    color: var(--gedaempft);
    font-family: var(--schrift);
    font-size: var(--fs-meta);
    cursor: pointer;
  }
  .messpunkt-oeffnen {
    display: block;
    width: 100%;
    min-height: var(--treffer);
    margin-top: var(--r3);
    border: none;
    background: transparent;
    color: var(--akzent);
    font-family: var(--schrift);
    font-size: var(--fs-bedienwort);
    text-align: left;
    cursor: pointer;
  }
  .neue-zeile {
    display: flex;
    flex-direction: column;
    gap: var(--r2);
    margin-top: var(--r3);
  }
  .neue-zeile label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--r2);
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--satz);
  }
  .neue-zeile .eingabefeld-text {
    flex: 0 0 var(--feld-min);
    text-align: right;
  }
  .herkunft-feld {
    display: flex;
    flex-direction: column;
    gap: var(--r1);
    align-items: stretch;
  }
  .feld-label {
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--satz);
  }
</style>
