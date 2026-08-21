<script lang="ts">
  // BruehgeraetAnsicht — reine Leseansicht (offene-punkte-ux.md Punkt 2),
  // analog zu Kaffeeblatt.svelte. Formular bleibt Bruehgeraetblatt.svelte.

  import { bestand } from '../bestand.svelte';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';

  let {
    bruehgeraetId,
    onZurueck,
    onBearbeiten,
  }: {
    bruehgeraetId: string;
    onZurueck: () => void;
    onBearbeiten: () => void;
  } = $props();

  const geraet = $derived(bestand.bruehgeraete.find((b) => b.id === bruehgeraetId));

  const TYP_LABEL: Record<string, string> = {
    espresso: 'Espresso',
    moka: 'Moka',
    pourover: 'Pour Over',
    coldbrew: 'Cold Brew',
  };
</script>

{#if !geraet}
  <Kopfzeile titel="Brühgerät" {onZurueck} />
  <p class="hinweis">Brühgerät nicht gefunden.</p>
{:else}
  <Kopfzeile titel={geraet.name} {onZurueck}>
    {#snippet aktion()}
      <button type="button" class="stift" onclick={onBearbeiten} aria-label="Brühgerät bearbeiten">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 20l1-4L16 5l3 3L8 19l-4 1Z" /></svg>
      </button>
    {/snippet}
  </Kopfzeile>

  <section class="gruppe">
    <h2>Grunddaten</h2>
    <div class="wertzeile">
      <span class="label">Typ</span>
      <span class="wert">{TYP_LABEL[geraet.typ]}</span>
    </div>
    <div class="wertzeile">
      <span class="label">Gruppen</span>
      <span class="wert">{geraet.gruppen}</span>
    </div>
    {#if geraet.fuehrungswert}
      <div class="wertzeile">
        <span class="label">Führungswert</span>
        <span class="wert">{geraet.fuehrungswert === 'output' ? 'Output' : 'Durchlaufzeit'}</span>
      </div>
    {/if}
  </section>

  {#if geraet.typ === 'espresso'}
    <section class="gruppe">
      <h2>Espresso</h2>
      <div class="wertzeile">
        <span class="label">Dampflanze</span>
        <span class="wert">{geraet.dampflanze ? 'Ja' : 'Nein'}</span>
      </div>
      <div class="wertzeile">
        <span class="label">Cooling Flush</span>
        <span class="wert">{geraet.flushDauer !== undefined ? `${geraet.flushDauer} s` : 'Nein'}</span>
      </div>
      {#if geraet.sieb}
        <div class="wertzeile">
          <span class="label">Sieb</span>
          <span class="wert">{geraet.sieb.art === 'doppel' ? 'doppel' : 'einzel'}</span>
        </div>
      {/if}
    </section>
  {:else}
    <section class="gruppe">
      <h2>Mengen</h2>
      <div class="wertzeile">
        <span class="label">Angeboten</span>
        <span class="wert">{geraet.mengen.map((m) => `${m}×`).join(', ')}</span>
      </div>
    </section>
  {/if}

  <section class="gruppe">
    <h2>Temperatur</h2>
    <div class="wertzeile">
      <span class="label">PID</span>
      <span class="wert">{geraet.ktEinstellbar ? 'Ja' : 'Nein'}</span>
    </div>
    {#if geraet.ktEinstellbar}
      <div class="wertzeile">
        <span class="label">Referenztabelle</span>
        <span class="wert">{geraet.tempReferenz.length} {geraet.tempReferenz.length === 1 ? 'Zeile' : 'Zeilen'}</span>
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
    min-height: 40px;
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
