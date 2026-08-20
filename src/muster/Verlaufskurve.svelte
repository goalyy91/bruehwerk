<script lang="ts">
  // Muster 14 · Verlaufskurve (Übergabe, Abschnitt 2 · K40).
  // Eine Linie im Akzent, kein Raster, drei Marken an der senkrechten
  // Achse (y = Mahlgrad, kein Umschalter). Punkte tragen die
  // Zustandszeichen, gesperrte Bereiche (Totzonen) als schraffierter
  // Streifen mit Wort darin, Ereignisse (Chargenwechsel) als gestrichelte
  // Senkrechte. Maße: 180 px hoch, Linie 1,5 px, Punkt 7 px.

  type Punkt = { x: number; y: number; zustand?: 'gut' | 'achtung' | 'kritisch' };

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

  function px(p: Punkt): { x: number; y: number } {
    return { x: p.x * BREITE, y: HOEHE - p.y * HOEHE };
  }

  const pfad = $derived(
    punkte.length > 1
      ? punkte.map((p, i) => `${i === 0 ? 'M' : 'L'} ${px(p).x} ${px(p).y}`).join(' ')
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
      {#each punkte as p (p.x)}
        <circle cx={px(p).x} cy={px(p).y} r="3.5" class="punkt" class:achtung={p.zustand === 'achtung'} class:kritisch={p.zustand === 'kritisch'} />
      {/each}
    </svg>
    {#if totzone}<div class="totzone-wort">{totzone.wort}</div>{/if}
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
    fill: var(--tinte);
  }
  .punkt.achtung {
    fill: var(--achtung);
  }
  .punkt.kritisch {
    fill: var(--kritisch);
  }
  .totzone {
    opacity: 0.5;
  }
  .schraffur-strich {
    fill: var(--spur);
  }
  .totzone-wort {
    position: absolute;
    top: var(--r2);
    right: var(--r2);
    font-size: var(--fs-meta);
    color: var(--gedaempft);
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
