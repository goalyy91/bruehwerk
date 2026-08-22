<script lang="ts">
  // MuehleAnsicht — reine Leseansicht (offene-punkte-ux.md Punkt 2), analog
  // zu Kaffeeblatt.svelte: Antippen einer Zeile in Geraete.svelte zeigt an,
  // erst das Stift-Symbol fuehrt zum Formular (Muehleblatt.svelte).

  import { bestand } from '../bestand.svelte';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';

  let {
    muehleId,
    onZurueck,
    onBearbeiten,
  }: {
    muehleId: string;
    onZurueck: () => void;
    onBearbeiten: () => void;
  } = $props();

  const muehle = $derived(bestand.muehlen.find((m) => m.id === muehleId));
</script>

{#if !muehle}
  <Kopfzeile titel="Mühle" {onZurueck} />
  <p class="hinweis">Mühle nicht gefunden.</p>
{:else}
  <Kopfzeile titel={muehle.name} {onZurueck}>
    {#snippet aktion()}
      <button type="button" class="stift" onclick={onBearbeiten} aria-label="Mühle bearbeiten">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 20l1-4L16 5l3 3L8 19l-4 1Z" /></svg>
      </button>
    {/snippet}
  </Kopfzeile>

  <section class="gruppe">
    <h2>Skala</h2>
    <div class="wertzeile">
      <span class="label">Typ</span>
      <span class="wert">{muehle.skala.typ === 'numerisch' ? 'Numerisch' : 'Klicks'}</span>
    </div>
    <div class="wertzeile">
      <span class="label">Min · Max · Schritt</span>
      <span class="wert">{muehle.skala.min} · {muehle.skala.max} · {muehle.skala.schritt}</span>
    </div>
  </section>

  <section class="gruppe">
    <h2>Drehzahl</h2>
    <div class="wertzeile">
      <span class="label">Einstellbar</span>
      <span class="wert">{muehle.rpmEinstellbar ? 'Ja' : 'Nein'}</span>
    </div>
    {#if muehle.rpmEinstellbar && muehle.rpmBereich}
      <div class="wertzeile">
        <span class="label">RPM Min · Max · Schritt</span>
        <span class="wert">{muehle.rpmBereich.min} · {muehle.rpmBereich.max} · {muehle.rpmBereich.schritt}</span>
      </div>
    {/if}
  </section>
{/if}

<style>
  .stift {
    width: var(--treffer);
    height: var(--treffer);
    margin-right: calc(var(--r2) * -1);
    border: none;
    background: none;
    color: var(--akzent);
    cursor: pointer;
  }
  .stift svg {
    width: 22px;
    height: 22px;
  }
  h2 {
    font-size: var(--fs-label);
    letter-spacing: var(--label-spacing);
    text-transform: uppercase;
    color: var(--gedaempft);
    font-weight: var(--gw-text);
    margin: 0 0 var(--r2);
  }
  .gruppe {
    margin-bottom: var(--r5);
  }
  .wertzeile {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--r3);
    min-height: var(--treffer);
    border-bottom: 1px solid var(--linie-zart);
    padding: var(--r1) 0;
  }
  .wertzeile .label {
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  .wertzeile .wert {
    font-size: var(--fs-satz);
    color: var(--satz);
    text-align: right;
  }
  .hinweis {
    color: var(--gedaempft);
    font-size: var(--fs-satz);
  }
</style>
