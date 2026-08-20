<script lang="ts">
  // Muster 7 · Herkunftskennzeichnung (Übergabe, Abschnitt 2 · K54 K13 K63).
  // Drei Zeichen, nie ein viertes: gefüllter Punkt = gemessen oder
  // gerechnet · Ring = übernommen · gestrichelter Ring = geschätzt.
  // Geschätzt trägt zusätzlich Tilde, Dämpfung, Gewicht 400, eine Stelle
  // weniger. Die Legende erscheint nur außerhalb des Alltagspfads (K13) —
  // deshalb hier explizit über `mitLegende` einschaltbar, nie automatisch.

  type Art = 'gemessen' | 'gerechnet' | 'uebernommen' | 'geschaetzt';

  let {
    art,
    wert,
    einheit,
    fuehrung = false,
    mitLegende = false,
  }: {
    art: Art;
    wert: string;
    einheit?: string;
    fuehrung?: boolean;
    mitLegende?: boolean;
  } = $props();

  let legendeOffen = $state(false);

  const LEGENDE: { art: Art; text: string }[] = [
    { art: 'gemessen', text: 'gemessen oder gerechnet' },
    { art: 'uebernommen', text: 'übernommen' },
    { art: 'geschaetzt', text: 'geschätzt' },
  ];
</script>

<span class="herkunft">
  <span
    class="zeichen"
    class:fuehrung
    class:voll={art === 'gemessen' || art === 'gerechnet'}
    class:ring={art === 'uebernommen'}
    class:gestrichelt={art === 'geschaetzt'}
  ></span>
  <span class="wert zahl" class:gedaempft={art === 'geschaetzt'}>
    {art === 'geschaetzt' ? `≈ ${wert}` : wert}{#if einheit} {einheit}{/if}
  </span>
  {#if mitLegende}
    <button type="button" class="i" onclick={() => (legendeOffen = !legendeOffen)} aria-label="Herkunft erklären">i</button>
    {#if legendeOffen}
      <span class="legende">
        {#each LEGENDE as e (e.art)}
          <span class="legende-zeile">
            <span class="zeichen" class:voll={e.art === 'gemessen'} class:ring={e.art === 'uebernommen'} class:gestrichelt={e.art === 'geschaetzt'}></span>
            {e.text}
          </span>
        {/each}
      </span>
    {/if}
  {/if}
</span>

<style>
  .herkunft {
    position: relative;
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
  .zeichen.fuehrung {
    width: var(--zeichen-fuehrung);
    height: var(--zeichen-fuehrung);
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
  .wert.gedaempft {
    color: var(--gedaempft);
    font-weight: var(--gw-text);
  }
  .i {
    width: var(--treffer);
    height: var(--treffer);
    border: 1px solid var(--linie);
    border-radius: 50%;
    background: none;
    color: var(--gedaempft);
    font-family: var(--schrift);
    font-style: italic;
    cursor: pointer;
  }
  .legende {
    position: absolute;
    top: calc(100% + var(--r2));
    left: 0;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: var(--r3);
    background: var(--feld-blatt);
    border: 1px solid var(--feld-rahmen);
    box-shadow: 0 4px 16px rgb(0 0 0 / 0.2);
    white-space: nowrap;
  }
  .legende-zeile {
    display: flex;
    align-items: center;
    gap: var(--r2);
    font-size: var(--fs-meta);
    color: var(--satz);
  }
</style>
