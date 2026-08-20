<script lang="ts">
  // Muster 14 · Verlaufskurve (Übergabe, Abschnitt 2 · K40).
  // Eine Linie im Akzent, kein Raster, drei Marken an der senkrechten
  // Achse (y = Mahlgrad, kein Umschalter). Punkte tragen die
  // Zustandszeichen (dieselben Formen wie der Tokenbeleg: gefüllt · halb ·
  // schraffiert), gesperrte Bereiche (Totzonen) als schraffierter Streifen
  // mit Wort darin, Ereignisse (Chargenwechsel) als gestrichelte
  // Senkrechte. Maße: 180 px hoch, Linie 1,5 px, Punkt 7 px.
  //
  // Die Punkte liegen als eigene, in echten Pixeln bemessene Elemente über
  // dem SVG — nicht als <circle> darin. Das SVG wird in x und y
  // unterschiedlich skaliert (freie Breite, feste Höhe), ein <circle>
  // würde darin zur Ellipse verzerrt.

  type Zustand = 'gut' | 'achtung' | 'kritisch';
  type Punkt = { x: number; y: number; zustand?: Zustand };

  let {
    punkte,
    achsMarken,
    totzone,
    ereignisX,
  }: {
    punkte: Punkt[];
    achsMarken: readonly [string, string, string];
    totzone?: { vonY: number; bisY: number; wort: string };
    ereignisX?: number;
  } = $props();

  const HOEHE = 180;
  const BREITE = 400;

  const pfad = $derived(
    punkte.length > 1
      ? punkte
          .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x * BREITE} ${HOEHE - p.y * HOEHE}`)
          .join(' ')
      : '',
  );
</script>

{#if punkte.length === 0}
  <div class="kein-punkt">kein Punkt</div>
{:else}
  <div class="kurve">
    <svg viewBox={`0 0 ${BREITE} ${HOEHE}`} preserveAspectRatio="none" role="img" aria-label="Verlaufskurve">
      <defs>
        <pattern id="schraffur" width="4" height="4" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <rect width="2" height="4" class="schraffur-strich" />
        </pattern>
      </defs>
      {#if totzone}
        <rect
          x="0"
          y={HOEHE - totzone.bisY * HOEHE}
          width={BREITE}
          height={(totzone.bisY - totzone.vonY) * HOEHE}
          class="totzone"
          fill="url(#schraffur)"
        />
      {/if}
      {#if ereignisX !== undefined}
        <line x1={ereignisX * BREITE} y1="0" x2={ereignisX * BREITE} y2={HOEHE} class="ereignis" />
      {/if}
      {#if pfad}
        <path d={pfad} class="linie" fill="none" />
      {/if}
    </svg>
    {#if totzone}
      <div class="totzone-wort">
        <span class="totzone-muster" aria-hidden="true"></span>
        {totzone.wort}
      </div>
    {/if}
    {#each punkte as p (p.x)}
      <span
        class="punkt"
        class:achtung={p.zustand === 'achtung'}
        class:kritisch={p.zustand === 'kritisch'}
        style:left={`${p.x * 100}%`}
        style:top={`${(1 - p.y) * 100}%`}
      ></span>
    {/each}
  </div>
  <div class="achse">
    {#each achsMarken as marke (marke)}
      <span class="marke">{marke}</span>
    {/each}
  </div>
{/if}

<style>
  .kurve {
    position: relative;
    height: 180px;
  }
  svg {
    width: 100%;
    height: 100%;
    display: block;
  }
  .linie {
    stroke: var(--akzent);
    stroke-width: 1.5;
  }
  .punkt {
    position: absolute;
    width: 7px;
    height: 7px;
    margin: -3.5px 0 0 -3.5px;
    border-radius: 50%;
    background: var(--tinte);
  }
  .punkt.achtung {
    background: linear-gradient(90deg, var(--achtung) 50%, transparent 50%);
    border: 1px solid var(--achtung);
  }
  .punkt.kritisch {
    background: repeating-linear-gradient(45deg, var(--kritisch) 0 2px, transparent 2px 4px);
    border: 1px solid var(--kritisch);
  }
  .schraffur-strich {
    fill: var(--spur);
  }
  .totzone {
    opacity: 0.5;
  }
  .totzone-wort {
    position: absolute;
    top: var(--r2);
    right: var(--r2);
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  .totzone-muster {
    display: inline-block;
    width: 12px;
    height: 12px;
    background: repeating-linear-gradient(45deg, var(--spur) 0 2px, transparent 2px 4px);
    border: 1px solid var(--spur);
    flex: none;
  }
  .ereignis {
    stroke: var(--gedaempft);
    stroke-width: 1;
    stroke-dasharray: 4 3;
  }
  .achse {
    display: flex;
    justify-content: space-between;
    padding-top: 4px;
  }
  .achse .marke {
    font-size: var(--fs-label);
    color: var(--gedaempft);
  }
  .kein-punkt {
    height: 180px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--gedaempft);
    font-size: var(--fs-satz);
  }
</style>
