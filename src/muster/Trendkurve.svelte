<script lang="ts">
  // Trendkurve — neu im Lern-Nachzug (Etappe 7, Nachschärfung 08.11.2026).
  // Eine Größe über Wochen, für die Entwicklung in der Aromaschule-Statistik.
  //
  // Warum nicht Verlaufskurve.svelte (Muster 14): die trägt Mahlgrad-
  // Eigenheiten — Zustandszeichen je Punkt, Totzonen, Chargen- und
  // Temperaturwechsel — und zeigt bewusst jeden Punkt. Hier geht es um
  // einen Trend: eine weiche Linie, eine zarte Fläche, nur der letzte Wert
  // beschriftet, die übrigen auf Antippen. Beides in ein Muster zu zwingen
  // hätte den Mahlgrad-Verlauf verändert, ohne dass jemand danach fragte.
  //
  // Maße nach der Datenvisualisierungs-Regel: Linie 2 px, runde Enden;
  // Fläche in der Linienfarbe als Hauch (oben ~18 %, unten 0); Endpunkt
  // r 4,5 mit 2-px-Ring in der Kartenfläche; Grundlinie als Haarlinie,
  // keine weiteren Gitterlinien; Text nie in der Datenfarbe. Die Kurve ist
  // monoton geglättet (Fritsch–Carlson) — eine gewöhnliche Glättung schwänge
  // über die Messpunkte hinaus und zeigte Werte, die es nie gab.
  //
  // Antippen oder Wischen setzt ein Fadenkreuz auf die nächste Woche und
  // nennt deren Wert. Für Vorlesehilfen steht dieselbe Reihe als Liste da.
  // Pixelgenau gerechnet (bind:clientWidth) statt eines gestreckten SVG,
  // damit Punkte rund bleiben.

  export type TrendPunkt = {
    /** 0 = linker Rand (älteste Woche), 1 = rechter Rand (jetzt). */
    readonly x: number;
    readonly wert: number;
    /** Der Wert als Text, z. B. "62 %". */
    readonly beschriftung: string;
    /** Wann, als Text, z. B. "vor 3 Wochen". */
    readonly zeit: string;
  };

  let {
    punkte,
    minWert,
    maxWert,
    titel,
    xLinks,
    xRechts = 'jetzt',
  }: {
    punkte: readonly TrendPunkt[];
    minWert: number;
    maxWert: number;
    /** Wofür die Kurve steht — für Vorlesehilfen. */
    titel: string;
    xLinks: string;
    xRechts?: string;
  } = $props();

  const HOEHE = 140;
  const OBEN = 30; // Platz für die Wertangabe über dem Endpunkt
  const UNTEN = 10;
  const RAND = 10;

  let breite = $state(0);
  let aktivIndex = $state<number | undefined>(undefined);
  const verlaufId = `trend-${Math.random().toString(36).slice(2, 9)}`;

  const spanne = $derived(maxWert - minWert || 1);
  const koordinaten = $derived(
    [...punkte]
      .sort((a, b) => a.x - b.x)
      .map((p) => ({
        ...p,
        px: RAND + p.x * Math.max(0, breite - 2 * RAND),
        py: OBEN + (1 - (p.wert - minWert) / spanne) * (HOEHE - OBEN - UNTEN),
      })),
  );
  const grundY = HOEHE - UNTEN;

  /** Monotone kubische Glättung (Fritsch–Carlson): keine Überschwinger zwischen den Punkten. */
  function glatterPfad(ps: readonly { px: number; py: number }[]): string {
    if (ps.length === 0) return '';
    if (ps.length === 1) return `M ${ps[0]!.px} ${ps[0]!.py}`;
    const n = ps.length;
    const dx: number[] = [];
    const steigung: number[] = [];
    for (let i = 0; i < n - 1; i++) {
      dx.push(ps[i + 1]!.px - ps[i]!.px);
      steigung.push((ps[i + 1]!.py - ps[i]!.py) / (dx[i] || 1));
    }
    const t: number[] = [steigung[0]!];
    for (let i = 1; i < n - 1; i++) {
      const a = steigung[i - 1]!;
      const b = steigung[i]!;
      t.push(a * b <= 0 ? 0 : (3 * (dx[i - 1]! + dx[i]!)) / ((2 * dx[i]! + dx[i - 1]!) / a + (dx[i]! + 2 * dx[i - 1]!) / b));
    }
    t.push(steigung[n - 2]!);
    let d = `M ${ps[0]!.px} ${ps[0]!.py}`;
    for (let i = 0; i < n - 1; i++) {
      const p0 = ps[i]!;
      const p1 = ps[i + 1]!;
      const h = dx[i]! / 3;
      d += ` C ${p0.px + h} ${p0.py + h * t[i]!} ${p1.px - h} ${p1.py - h * t[i + 1]!} ${p1.px} ${p1.py}`;
    }
    return d;
  }

  const linie = $derived(glatterPfad(koordinaten));
  const flaeche = $derived(
    koordinaten.length > 1 ? `${linie} L ${koordinaten.at(-1)!.px} ${grundY} L ${koordinaten[0]!.px} ${grundY} Z` : '',
  );
  const letzter = $derived(koordinaten.at(-1));
  const aktiv = $derived(aktivIndex !== undefined ? koordinaten[aktivIndex] : undefined);

  function zeigen(ereignis: PointerEvent) {
    if (koordinaten.length === 0) return;
    const rahmen = (ereignis.currentTarget as HTMLElement).getBoundingClientRect();
    const x = ereignis.clientX - rahmen.left;
    let bester = 0;
    for (let i = 1; i < koordinaten.length; i++) {
      if (Math.abs(koordinaten[i]!.px - x) < Math.abs(koordinaten[bester]!.px - x)) bester = i;
    }
    aktivIndex = bester;
  }
</script>

<figure class="trend">
  <div
    class="zeichenflaeche"
    style:height={`${HOEHE}px`}
    bind:clientWidth={breite}
    onpointerdown={zeigen}
    onpointermove={zeigen}
    onpointerleave={() => (aktivIndex = undefined)}
    role="img"
    aria-label={titel}
  >
    {#if breite > 0 && koordinaten.length > 0}
      <svg width={breite} height={HOEHE} aria-hidden="true">
        <defs>
          <linearGradient id={verlaufId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--akzent)" stop-opacity="0.18" />
            <stop offset="100%" stop-color="var(--akzent)" stop-opacity="0" />
          </linearGradient>
        </defs>
        <line class="grundlinie" x1="0" x2={breite} y1={grundY + 0.5} y2={grundY + 0.5} />
        {#if flaeche}<path d={flaeche} fill={`url(#${verlaufId})`} />{/if}
        <path class="linie" d={linie} />
        {#if aktiv}
          <line class="fadenkreuz" x1={aktiv.px} x2={aktiv.px} y1={0} y2={grundY} />
          <circle class="punkt" cx={aktiv.px} cy={aktiv.py} r="4.5" />
        {/if}
        {#if letzter && (!aktiv || aktiv !== letzter)}
          <circle class="punkt" cx={letzter.px} cy={letzter.py} r="4.5" />
        {/if}
      </svg>
      {#if aktiv}
        <span class="wert" style:left={`${Math.min(Math.max(aktiv.px, 48), breite - 48)}px`} style:top="0px">
          {aktiv.zeit} · <strong>{aktiv.beschriftung}</strong>
        </span>
      {:else if letzter}
        <span class="wert ende" style:right={`${Math.max(0, breite - letzter.px - 12)}px`} style:top={`${Math.max(0, letzter.py - 36)}px`}>
          <strong>{letzter.beschriftung}</strong>
        </span>
      {/if}
    {/if}
  </div>
  <div class="x-achse" aria-hidden="true"><span>{xLinks}</span><span>{xRechts}</span></div>
  <ul class="vorlesen">
    {#each koordinaten as p (p.x)}<li>{p.zeit}: {p.beschriftung}</li>{/each}
  </ul>
</figure>

<style>
  .trend {
    margin: 0;
  }
  .zeichenflaeche {
    position: relative;
    touch-action: pan-y;
    cursor: crosshair;
  }
  svg {
    display: block;
    overflow: visible;
  }
  .grundlinie {
    stroke: var(--linie);
    stroke-width: 1;
  }
  .linie {
    fill: none;
    stroke: var(--akzent);
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .fadenkreuz {
    stroke: var(--spur);
    stroke-width: 1;
  }
  .punkt {
    fill: var(--akzent);
    stroke: var(--blatt);
    stroke-width: 2;
  }
  .wert {
    position: absolute;
    white-space: nowrap;
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--gedaempft);
    pointer-events: none;
  }
  /* Beide Beschriftungen tragen die Kartenfläche als Grund — so überdeckt
     der Wert die Linie, statt auf ihr zu liegen. */
  .wert {
    padding: 2px 8px;
    border-radius: var(--r-pille);
    background: var(--blatt);
  }
  .wert:not(.ende) {
    transform: translateX(-50%);
  }
  .wert strong {
    font-weight: 600;
    color: var(--tinte);
  }
  .wert.ende strong {
    font-size: var(--fs-bedienwort);
  }
  .x-achse {
    display: flex;
    justify-content: space-between;
    margin-top: 6px;
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  .vorlesen {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0 0 0 0);
    border: 0;
  }
</style>
