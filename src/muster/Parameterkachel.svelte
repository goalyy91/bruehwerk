<script module lang="ts">
  export type ParameterSymbol = 'input' | 'mahlgrad' | 'drehzahl' | 'kessel' | 'output' | 'preinfusion' | 'zeit';
</script>

<script lang="ts">
  // Parameterkachel — neu im visuellen Redesign-Reset (Handoff Abschnitt 5:
  // "Parameterkachel — zweispaltiges Raster für Shot- und Zielwerte. Gleiche
  // Felder, gleiche Reihenfolge, gleiche Einheiten wie in der bisherigen
  // Werteliste."). Ersetzt Werteliste.svelte an den Stellen, wo Profilblatt
  // (Ziel) und ShotErfassung (Parameter) ihre Einstell-/Zielwerte bisher als
  // Zeilenliste zeigten (Handoff Abschnitt 6 "Profil/Espresso-Setup" +
  // "Shot-Logging"). Gleiches onchange-Verhalten wie Werteliste.svelte —
  // reine Darstellungsänderung, kein neuer Zustand.
  //
  // Fehlender Wert = "—" in Spurfarbe statt leerer Fläche (Handoff 3.9).
  // Bei editierbaren Feldern bleibt das Feld dabei ausdrücklich antippbar
  // und beschreibbar — "—" ist hier ein Platzhaltertext, keine Sperre.
  //
  // Sieben feste Symbole statt eines generischen Icon-Slots: die Parameter
  // sind ein geschlossenes, aus dem Konzept bekanntes Set (Input, Mahlgrad,
  // Drehzahl, Kessel, Output, Preinfusion, Zeit) und beide Aufrufer
  // (Profilblatt, ShotErfassung) brauchen exakt dieselben Zeichnungen —
  // ein Icon-Prop pro Aufrufer hätte dieselbe SVG-Pfadliste zweimal
  // dupliziert (ux-regeln.md Regel 6/12).

  let {
    symbol,
    label,
    wert,
    einheit,
    onAendern,
  }: {
    symbol: ParameterSymbol;
    label: string;
    /** '' oder undefined => "—" (Handoff 3.9, "Fehlender Wert"). */
    wert: number | string | undefined;
    einheit?: string;
    onAendern?: (wert: number) => void;
  } = $props();

  const leer = $derived(wert === undefined || wert === '');

  function zahl(e: Event): number {
    return Number((e.currentTarget as HTMLInputElement).value.replace(',', '.'));
  }
</script>

{#snippet symbolPfad()}
  {#if symbol === 'input'}
    <path d="M4 15.5h12" /><path d="M6.5 15.5V9h7v6.5" /><path d="M10 9V5" /><circle cx="10" cy="4" r="1.4" />
  {:else if symbol === 'mahlgrad'}
    <circle cx="10" cy="10" r="6" /><circle cx="10" cy="10" r="1.6" /><path d="M10 4v1.6M10 14.4V16M4 10h1.6M14.4 10H16" />
  {:else if symbol === 'drehzahl'}
    <circle cx="10" cy="10" r="6.2" /><path d="M10 10l3.4-2.4" />
  {:else if symbol === 'kessel'}
    <path d="M10 3.5v8.2" /><circle cx="10" cy="14" r="2.6" />
  {:else if symbol === 'output' || symbol === 'preinfusion'}
    <path d="M10 3.5c2.6 3.4 4.2 5.6 4.2 7.6a4.2 4.2 0 0 1-8.4 0c0-2 1.6-4.2 4.2-7.6z" />
  {:else if symbol === 'zeit'}
    <circle cx="10" cy="10" r="6.2" /><path d="M10 6v4l2.6 1.7" />
  {/if}
{/snippet}

<div class="kachel">
  <div class="kopf">
    <svg class="symbol" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true">
      {@render symbolPfad()}
    </svg>
    <span class="label">{label}</span>
  </div>
  <div class="wertzeile">
    {#if onAendern}
      <input
        class="wert eingabe zahl"
        type="text"
        inputmode="decimal"
        placeholder="—"
        value={leer ? '' : wert}
        onchange={(e) => onAendern(zahl(e))}
      />
    {:else}
      <span class="wert zahl" class:leer>{leer ? '—' : wert}</span>
    {/if}
    {#if einheit}<span class="einheit">{einheit}</span>{/if}
  </div>
</div>

<style>
  .kachel {
    display: flex;
    flex-direction: column;
    gap: 7px;
    background: var(--blatt);
    border-radius: var(--r-kachel);
    padding: 13px 15px;
  }
  .kopf {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--akzent);
  }
  .symbol {
    width: 15px;
    height: 15px;
    flex: none;
  }
  .label {
    font-family: var(--schrift-sans);
    font-size: var(--fs-kachel-label);
    letter-spacing: var(--label-spacing-kachel);
    text-transform: uppercase;
    color: var(--gedaempft);
  }
  .wertzeile {
    display: flex;
    align-items: baseline;
    gap: 5px;
  }
  .wert {
    color: var(--tinte);
    font-size: var(--fs-wert);
  }
  .wert.leer {
    color: var(--spur);
  }
  .eingabe {
    width: 100%;
    min-width: 0;
    border: none;
    background: none;
    padding: 0;
    font-family: var(--schrift);
  }
  .eingabe::placeholder {
    color: var(--spur);
    opacity: 1;
  }
  .einheit {
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
</style>
