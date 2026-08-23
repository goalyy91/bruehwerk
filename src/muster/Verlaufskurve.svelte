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
  //
  // Paket 04: totzone/ereignisX wurden zu totzonen[]/ereignisse[] — ein
  // Kaffee sammelt über Monate mehr als einen Chargenwechsel und ggf. mehr
  // als einen toten Bereich (K40). Rendering und Maße bleiben unveraendert.

  type Zustand = 'gut' | 'achtung' | 'kritisch';
  type Punkt = { x: number; y: number; zustand?: Zustand };
  type TotzoneBand = { vonY: number; bisY: number; wort: string };

  let {
    punkte,
    achsMarken,
    totzonen = [],
    ereignisse = [],
  }: {
    punkte: Punkt[];
    achsMarken: readonly [string, string, string];
    totzonen?: TotzoneBand[];
    ereignisse?: number[];
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
  <div class="kurve-zeile">
    <!-- Marken stehen an der senkrechten Achse (y = Mahlgrad, K40-Kommentar
         oben) — deshalb als Spalte links, hoechster Wert oben, nicht als
         Zeile unter der Kurve (das laese sich wie eine x-Achse). -->
    <div class="achse">
      {#each [...achsMarken].reverse() as marke (marke)}
        <span class="marke">{marke}</span>
      {/each}
    </div>
    <div class="kurve">
      <svg viewBox={`0 0 ${BREITE} ${HOEHE}`} preserveAspectRatio="none" role="img" aria-label="Verlaufskurve">
        <defs>
          <pattern id="schraffur" width="4" height="4" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
            <rect width="2" height="4" class="schraffur-strich" />
          </pattern>
        </defs>
        {#each totzonen as zone (zone.wort)}
          <rect
            x="0"
            y={HOEHE - zone.bisY * HOEHE}
            width={BREITE}
            height={(zone.bisY - zone.vonY) * HOEHE}
            class="totzone"
            fill="url(#schraffur)"
          />
        {/each}
        {#each ereignisse as x (x)}
          <line x1={x * BREITE} y1="0" x2={x * BREITE} y2={HOEHE} class="ereignis" />
        {/each}
        {#if pfad}
          <path d={pfad} class="linie" fill="none" />
        {/if}
      </svg>
      <div class="totzone-woerter">
        {#each totzonen as zone (zone.wort)}
          <div class="totzone-wort">
            <span class="totzone-muster" aria-hidden="true"></span>
            {zone.wort}
          </div>
        {/each}
      </div>
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
  </div>
{/if}

<style>
  .kurve-zeile {
    display: flex;
    gap: var(--r2);
  }
  .kurve {
    position: relative;
    flex: 1;
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
  .totzone-woerter {
    position: absolute;
    top: var(--r2);
    right: var(--r2);
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }
  .totzone-wort {
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
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-end;
    flex: none;
    height: 180px;
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
