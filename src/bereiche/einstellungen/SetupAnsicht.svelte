<script lang="ts">
  // SetupAnsicht — reine Leseansicht (offene-punkte-ux.md Punkt 2), analog
  // zu Kaffeeblatt.svelte. Formular bleibt Setupblatt.svelte.

  import { bestand } from '../bestand.svelte';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';

  let {
    setupId,
    onZurueck,
    onBearbeiten,
  }: {
    setupId: string;
    onZurueck: () => void;
    onBearbeiten: () => void;
  } = $props();

  const setup = $derived(bestand.setups.find((s) => s.id === setupId));
  const muehle = $derived(setup ? bestand.muehleVon(setup.id) : undefined);
  const bruehgeraet = $derived(setup ? bestand.bruehgeraetVon(setup.id) : undefined);
  const zubehoer = $derived(
    setup ? setup.zubehoerIds.map((id) => bestand.zubehoer.find((z) => z.id === id)?.name ?? '?') : [],
  );
</script>

{#if !setup}
  <Kopfzeile titel="Setup" {onZurueck} />
  <p class="hinweis">Setup nicht gefunden.</p>
{:else}
  <Kopfzeile titel={setup.name} {onZurueck}>
    {#snippet aktion()}
      <button type="button" class="stift" onclick={onBearbeiten} aria-label="Setup bearbeiten">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 20l1-4L16 5l3 3L8 19l-4 1Z" /></svg>
      </button>
    {/snippet}
  </Kopfzeile>

  <section class="gruppe">
    <h2>Geräte</h2>
    <div class="wertzeile">
      <span class="label">Mühle</span>
      <span class="wert">{muehle?.name ?? '—'}</span>
    </div>
    <div class="wertzeile">
      <span class="label">Brühgerät</span>
      <span class="wert">{bruehgeraet?.name ?? '—'}</span>
    </div>
    {#if zubehoer.length > 0}
      <div class="wertzeile">
        <span class="label">Zubehör</span>
        <span class="wert">{zubehoer.join(', ')}</span>
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
