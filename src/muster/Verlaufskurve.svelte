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
  //
  // Zweiter Ereignistyp (Rueckmeldung 2026-09-17): ein Temperaturwechsel im
  // Dial-in macht einen Mahlgrad-Sprung erklaerbar, der sonst wie Rauschen
  // aussieht. Unterschieden wird ueber das Strichmuster, nicht ueber Farbe
  // (K69 - keine neuen Zustandsfarben). Punkte vor dem letzten Wechsel
  // kommen gedaempft (frueher), damit der Blick automatisch beim Teil landet,
  // der gerade gilt — die Bedeutung selbst steht als Satz im Aufrufer
  // (Profilblatt.svelte), nicht hier im Muster.

  type Zustand = 'gut' | 'achtung' | 'kritisch';
  type Punkt = { x: number; y: number; zustand?: Zustand; frueher?: boolean };
  type TotzoneBand = { vonY: number; bisY: number; wort: string };
  type Ereignis = { x: number; art?: 'charge' | 'temperatur' };

  let {
    punkte,
    achsMarken,
    totzonen = [],
    ereignisse = [],
  }: {
    punkte: Punkt[];
    achsMarken: readonly [string, string, string];
    totzonen?: TotzoneBand[];
    ereignisse?: Ereignis[];
  } = $props();

  const HOEHE = 180;
  const BREITE = 400;

  function pfadAus(teilpunkte: readonly Punkt[]): string {
    return teilpunkte
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x * BREITE} ${HOEHE - p.y * HOEHE}`)
      .join(' ');
  }

  // Der letzte gedaempfte Punkt gehoert auch zum aktuellen Pfad, sonst
  // entstuende eine Luecke zwischen den beiden Liniensegmenten. Kein
  // findLastIndex (ES2023) — das Projekt zielt auf ES2022.
  const trennindex = $derived.by(() => {
    for (let i = punkte.length - 1; i >= 0; i--) {
      if (punkte[i]!.frueher) return i;
    }
    return -1;
  });
  const pfadFrueher = $derived(
    trennindex >= 0 ? pfadAus(punkte.slice(0, trennindex + 1)) : '',
  );
  const pfadAktuell = $derived(
    punkte.length > 1 ? pfadAus(punkte.slice(Math.max(trennindex, 0))) : '',
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
      <!-- Kein Schluessel: die drei Marken sind eine Position (oben/Mitte/
           unten), kein Gegenstand mit Identitaet. Zwei gleiche Zahlen sind an
           einer Achse ein zulaessiger Zustand (z. B. ein einzelner Shot, oder
           zwei Mahlgrade, die auf dieselbe Muehlen-Schrittweite runden) — mit
           `(marke)` als Schluessel brach Svelte dabei ab, genau wie es die
           `punkte`-Schleife unten schon einmal tat (siehe Kommentar dort). -->
      {#each [...achsMarken].reverse() as marke}
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
        {#each totzonen as zone}
          <rect
            x="0"
            y={HOEHE - zone.bisY * HOEHE}
            width={BREITE}
            height={(zone.bisY - zone.vonY) * HOEHE}
            class="totzone"
            fill="url(#schraffur)"
          />
        {/each}
        {#each ereignisse as e}
          <line
            x1={e.x * BREITE}
            y1="0"
            x2={e.x * BREITE}
            y2={HOEHE}
            class="ereignis"
            class:temperatur={e.art === 'temperatur'}
          />
        {/each}
        {#if pfadFrueher}
          <path d={pfadFrueher} class="linie frueher" fill="none" />
        {/if}
        {#if pfadAktuell}
          <path d={pfadAktuell} class="linie" fill="none" />
        {/if}
      </svg>
      <div class="totzone-woerter">
        {#each totzonen as zone}
          <div class="totzone-wort">
            <span class="totzone-muster" aria-hidden="true"></span>
            {zone.wort}
          </div>
        {/each}
      </div>
      <!-- Ohne Schluessel: die Listen sind rein positionell, und ein
           Schluessel auf einer berechneten Fliesskommazahl liess Svelte bei
           zwei gleich weit zusammengeruckten Punkten mit "duplicate keys"
           abbrechen. -->
      {#each punkte as p}
        <span
          class="punkt"
          class:achtung={p.zustand === 'achtung'}
          class:kritisch={p.zustand === 'kritisch'}
          class:frueher={p.frueher}
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
  .linie.frueher {
    opacity: 0.4;
  }
  .punkt {
    position: absolute;
    width: 7px;
    height: 7px;
    margin: -3.5px 0 0 -3.5px;
    border-radius: 50%;
    background: var(--tinte);
  }
  .punkt.frueher {
    opacity: 0.4;
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
  .ereignis.temperatur {
    stroke-dasharray: 1 3;
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
