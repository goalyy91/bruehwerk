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
  let iKnopf = $state<HTMLButtonElement | undefined>();
  let legendeOben = $state(0);

  const LEGENDE: { art: Art; text: string }[] = [
    { art: 'gemessen', text: 'gemessen oder gerechnet' },
    { art: 'uebernommen', text: 'übernommen' },
    { art: 'geschaetzt', text: 'geschätzt' },
  ];

  // Zweimal (JS-berechnete Breite, dann JS-berechnete Breite UND Position)
  // ist die Legende trotzdem über den rechten Rand gelaufen — auf dem Gerät
  // reproduzierbar, an meinem Reasoning allein nicht mehr sicher zu fixen.
  // Deshalb jetzt die Fassung, die per Konstruktion nicht überlaufen kann:
  // links UND rechts fest auf --seitenrand verankert (reines CSS, keine
  // Breite berechnet), zusätzlich als <div> statt <span> — kein
  // Blockifizierungs-Sonderfall mehr. Nur die Höhe kommt noch aus der
  // gemessenen Position des i-Knopfs.
  function oeffneOderSchliesse() {
    if (!legendeOffen && iKnopf) {
      legendeOben = iKnopf.getBoundingClientRect().bottom + 8;
    }
    legendeOffen = !legendeOffen;
  }
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
    <button bind:this={iKnopf} type="button" class="i" onclick={oeffneOderSchliesse} aria-label="Herkunft erklären">
      <span class="i-kreis">i</span>
    </button>
    {#if legendeOffen}
      <div class="legende" style:top={`${legendeOben}px`}>
        {#each LEGENDE as e (e.art)}
          <div class="legende-zeile">
            <span class="zeichen" class:voll={e.art === 'gemessen'} class:ring={e.art === 'uebernommen'} class:gestrichelt={e.art === 'geschaetzt'}></span>
            {e.text}
          </div>
        {/each}
      </div>
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
    /* Trefferfläche bleibt ≥ 32 px, das sichtbare Zeichen ist deutlich
       kleiner — die Kreisfläche allein war zu dominant. */
    min-width: 32px;
    min-height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: none;
    padding: 0;
    cursor: pointer;
  }
  .i-kreis {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border: 1px solid var(--linie);
    border-radius: 50%;
    color: var(--gedaempft);
    font-family: var(--schrift);
    font-size: var(--fs-label);
  }
  .legende {
    position: fixed;
    left: var(--seitenrand);
    right: var(--seitenrand);
    box-sizing: border-box;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: var(--r3);
    background: var(--blatt);
    border-radius: var(--r-karte);
    /* Handoff: Schatten sind global verboten, auch als subtile Elevation
       (Abschnitt 3.5). Abgrenzung gegen den Grund kommt ausschließlich aus
       der Helligkeitsdifferenz --blatt/--grund. */
  }
  .legende-zeile {
    display: flex;
    align-items: center;
    gap: var(--r2);
    font-size: var(--fs-meta);
    color: var(--satz);
  }
</style>
