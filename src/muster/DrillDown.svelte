<script lang="ts">
  // Muster 10 · Drill-down (Übergabe, Abschnitt 2).
  // Stapeln statt springen: Tap setzt und öffnet zugleich, der Pfad bleibt
  // sichtbar, eine Zurück-Zeile führt aus dem Muster heraus, Gewähltes
  // sammelt sich in der Leiste am Fuß mit Zählung und „+ N“ ab der Grenze.
  //
  // Visueller Redesign-Reset, Paket 5: Blattliste mit Haarlinien statt
  // eckig umrandeter --feld-Zeilen; "gewählt" jetzt Füllfläche statt
  // Akzentstrich — dieselbe Optik wie AuswahlListe.svelte fuer eine
  // gewaehlte Zeile, weil dieses Muster strukturell dasselbe ist (eine
  // Liste antippbarer Optionen).
  //
  // Paket 05 (Verkostungsbogen, K55): kontrollierte Fassung wie
  // Chips.svelte in Paket 04 — Innenleben unveraendert, dazu gekommen sind
  // `start`/`onAenderung` fuer Wiedereinstieg und Rueckmeldung nach aussen,
  // und die Fussleiste ist jetzt antippbar zum Entfernen (kein zweiter
  // Regler, dieselbe Zeile). `nummer` an einem Blatt-Knoten (Le Nez) wird
  // durchgereicht, ohne die Anzeige zu aendern — Verkostungsbogen.svelte
  // liest sie aus dem gemeldeten Eintrag.

  import { untrack } from 'svelte';

  type Knoten = { id: string; label: string; kinder?: Knoten[]; nummer?: number };
  type Gewaehlt = { id: string; label: string; pfad: string[]; nummer?: number };

  let {
    ebenen,
    grenze = 6,
    start = [],
    onAenderung,
  }: {
    ebenen: Knoten[];
    grenze?: number;
    start?: Gewaehlt[];
    onAenderung?: (gewaehlt: Gewaehlt[]) => void;
  } = $props();

  let pfad = $state<Knoten[]>([]);
  let gewaehlt = $state<Gewaehlt[]>(untrack(() => start));

  const aktuelleEbene = $derived(pfad.length === 0 ? ebenen : (pfad[pfad.length - 1]?.kinder ?? []));

  /**
   * Rueckmeldung 2026-08-26: waehlbar ist nicht mehr nur ein Blatt ganz
   * unten — manchmal reicht "fruchtig" oder "Beere", ohne dass man es
   * genauer benennen kann. `vorfahrenPfad` sind die Knoten OBERHALB von
   * `knoten` (nicht `knoten` selbst), damit sowohl ein Blatt (Vorfahren =
   * aktueller pfad) als auch die aktuell offene Ebene selbst (Vorfahren =
   * pfad ohne ihr letztes Element, siehe waehleAktuelleEbene) dieselbe
   * Funktion nutzen koennen.
   */
  function waehleKnoten(knoten: Knoten, vorfahrenPfad: Knoten[]) {
    if (gewaehlt.some((g) => g.id === knoten.id)) return;
    const vollpfad = [...vorfahrenPfad.map((p) => p.label), knoten.label];
    gewaehlt = [...gewaehlt, { id: knoten.id, label: knoten.label, pfad: vollpfad, nummer: knoten.nummer }];
    onAenderung?.(gewaehlt);
  }

  function oeffneOderWaehle(knoten: Knoten) {
    if (knoten.kinder && knoten.kinder.length > 0) {
      pfad = [...pfad, knoten];
    } else {
      waehleKnoten(knoten, pfad);
    }
  }

  /** Waehlt die Ebene, in der man gerade steht, selbst — ohne tiefer zu muessen. */
  function waehleAktuelleEbene() {
    const knoten = pfad[pfad.length - 1];
    if (knoten) waehleKnoten(knoten, pfad.slice(0, -1));
  }

  function entfernen(id: string) {
    gewaehlt = gewaehlt.filter((g) => g.id !== id);
    onAenderung?.(gewaehlt);
  }

  function zurueck() {
    pfad = pfad.slice(0, -1);
  }
</script>

<div class="drilldown">
  {#if pfad.length > 0}
    <button type="button" class="zurueck" onclick={zurueck}>
      ‹ {pfad[pfad.length - 1]?.label}
    </button>
    <div class="pfad">{pfad.map((p) => p.label).join(' › ')}</div>
    {#if !gewaehlt.some((g) => g.id === pfad[pfad.length - 1]?.id)}
      <button type="button" class="hier-waehlen" onclick={waehleAktuelleEbene}>
        Nur „{pfad[pfad.length - 1]?.label}“ wählen
      </button>
    {/if}
  {/if}

  <div class="ebene">
    {#each aktuelleEbene as knoten (knoten.id)}
      <button type="button" class="eintrag" class:gewaehlt={gewaehlt.some((g) => g.id === knoten.id)} onclick={() => oeffneOderWaehle(knoten)}>
        {knoten.label}
      </button>
    {/each}
  </div>

  {#if gewaehlt.length > 0}
    <div class="leiste">
      <span class="zaehlung">{gewaehlt.length}</span>
      {#each gewaehlt.slice(0, grenze) as g (g.id)}
        <button type="button" class="marke" onclick={() => entfernen(g.id)} aria-label={`${g.label} entfernen`}>
          {g.label}
        </button>
      {/each}
      {#if gewaehlt.length > grenze}
        <span class="mehr">+ {gewaehlt.length - grenze}</span>
      {/if}
    </div>
  {/if}
</div>

<style>
  .drilldown {
    display: flex;
    flex-direction: column;
  }
  .zurueck {
    min-height: 48px;
    padding: 0 var(--r3);
    border: none;
    border-radius: var(--r-wertfeld);
    background: var(--vertiefung);
    color: var(--tinte);
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    text-align: left;
    cursor: pointer;
  }
  .hier-waehlen {
    min-height: var(--treffer);
    padding: 0 var(--r3);
    border: none;
    background: none;
    color: var(--akzent);
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    text-align: left;
    cursor: pointer;
  }
  .pfad {
    padding: 4px var(--r3) 0;
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  .ebene {
    display: flex;
    flex-direction: column;
    border-radius: var(--r-blatt);
    overflow: hidden;
  }
  .eintrag {
    min-height: var(--treffer);
    padding: 0 var(--r3);
    border: none;
    border-top: 1px solid var(--linie);
    background: var(--blatt);
    color: var(--satz);
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    text-align: left;
    cursor: pointer;
  }
  .eintrag:first-child {
    border-top: none;
  }
  .eintrag.gewaehlt {
    background: var(--fuellung);
    color: var(--auf-fuellung);
    font-weight: var(--gw-titel);
  }
  .leiste {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    min-height: 76px;
    padding: var(--r3);
    border-top: 1px solid var(--linie);
  }
  .zaehlung {
    font-size: var(--fs-titel);
    color: var(--tinte);
    font-weight: var(--gw-zahl);
  }
  .marke {
    padding: 4px var(--r2);
    border: none;
    border-radius: var(--r-pille);
    background: var(--vertiefung);
    color: var(--satz);
    font-family: var(--schrift);
    font-size: var(--fs-meta);
    cursor: pointer;
    min-height: 32px;
  }
  .mehr {
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
</style>
