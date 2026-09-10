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
  //
  // Aromapaket, Etappe 2 (K36-Aufhebung + "Fluschchennummer als Gewinn des
  // Koffers"): ein Blatt-Knoten mit `nummer` bekommt jetzt eine zweite,
  // eigene Trefferflaeche fuer die Nummer — sie waehlt nicht das Aroma,
  // sondern meldet `onNummerKlick` (Aufrufer oeffnet das Datenblatt). Fuer
  // die Fussleiste wird die Farbe *nicht* mitgespeichert, sondern bei jeder
  // Anzeige ueber `farbeVonPfad` neu aus `ebenen` gelesen — sonst haetten
  // wiedereingestiegene (start=) Eintraege aus einer frueheren Verkostung
  // keinen Punkt, weil sie ihn nie gesetzt bekamen.
  //
  // Aromapaket, Etappe 2b (Design-/UX-Nachschaerfung, K36 durchgaengig):
  // Der Kategorie-Punkt sitzt jetzt an JEDEM Knoten, den der Aufrufer damit
  // ausstattet — Verkostungsbogen.svelte reicht `farbe` inzwischen bis in
  // Gruppen und Blaetter durch, nicht mehr nur an die oberste Ebene. Die
  // Unterscheidung "Navigations-Zeile vs. Blatt-Zeile" haengt jetzt an
  // `knoten.kinder`, nicht mehr an `knoten.nummer` — ein SCA-Aroma hat nie
  // eine Nummer, ist aber trotzdem ein Blatt und keine Navigation (Befund:
  // lief vorher faelschlich durch den Navigations-Zweig, Serif/Sans waere
  // sonst falsch verteilt). Navigations-Zeilen (Kategorie und Gruppe) sind
  // Sans nach der Projektregel "Serif traegt den Inhalt, Sans nur den
  // Apparat" (siehe Kontextmenue.svelte, Blattzeile.svelte); die Kategorie
  // (oberste Ebene) eine Stufe groesser als die Gruppe darunter. Zurueck-Pfeil
  // ist der runde Knopf aus Kopfzeile.svelte, zweitverwendet statt neu
  // erfunden, jetzt in derselben Zeile wie der Brotkruemelpfad statt einer
  // eigenen Zeile mit dem (doppeldeutigen) Namen der aktuellen Ebene.

  import { untrack } from 'svelte';

  type Knoten = { id: string; label: string; kinder?: Knoten[]; nummer?: number; farbe?: string };
  type Gewaehlt = { id: string; label: string; pfad: string[]; nummer?: number };

  let {
    ebenen,
    grenze = 6,
    start = [],
    onAenderung,
    onNummerKlick,
    nummerAktiv,
  }: {
    ebenen: Knoten[];
    grenze?: number;
    start?: Gewaehlt[];
    onAenderung?: (gewaehlt: Gewaehlt[]) => void;
    onNummerKlick?: (nummer: number) => void;
    /** Ohne diese Angabe gilt jede Nummer als antippbar, sobald onNummerKlick gesetzt ist. */
    nummerAktiv?: (nummer: number) => boolean;
  } = $props();

  let pfad = $state<Knoten[]>([]);
  let gewaehlt = $state<Gewaehlt[]>(untrack(() => start));
  /** "+ N" in der Fussleiste klappt auf, statt eine Sackgasse zu sein. */
  let ausgeklappt = $state(false);

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

  /** Die Kategoriefarbe der obersten Ebene ueber einem gewaehlten Pfad, oder undefined. */
  function farbeVonPfad(gewaehlterPfad: readonly string[]): string | undefined {
    return ebenen.find((e) => e.label === gewaehlterPfad[0])?.farbe;
  }
  const gewaehltMitFarbe = $derived(gewaehlt.map((g) => ({ ...g, farbe: farbeVonPfad(g.pfad) })));
</script>

<div class="drilldown">
  {#if pfad.length > 0}
    <div class="kopf">
      <button type="button" class="zurueck-rund" onclick={zurueck} aria-label="zurück">‹</button>
      <div class="pfad">
        {#if pfad[0]?.farbe}<span class="kategorie-punkt" style="--punkt-farbe: {pfad[0].farbe}"></span>{/if}
        {pfad.map((p) => p.label).join(' › ')}
      </div>
    </div>
    {#if !gewaehlt.some((g) => g.id === pfad[pfad.length - 1]?.id)}
      <button type="button" class="hier-waehlen" onclick={waehleAktuelleEbene}>
        Nur „{pfad[pfad.length - 1]?.label}“ wählen
      </button>
    {/if}
  {/if}

  <div class="ebene">
    {#each aktuelleEbene as knoten (knoten.id)}
      {#if knoten.kinder && knoten.kinder.length > 0}
        <button
          type="button"
          class="eintrag eintrag-navigation"
          class:eintrag-kategorie={pfad.length === 0}
          class:gewaehlt={gewaehlt.some((g) => g.id === knoten.id)}
          onclick={() => oeffneOderWaehle(knoten)}
        >
          {#if knoten.farbe}<span class="kategorie-punkt" style="--punkt-farbe: {knoten.farbe}"></span>{/if}
          {knoten.label}
        </button>
      {:else}
        <div class="eintrag eintrag-blatt" class:gewaehlt={gewaehlt.some((g) => g.id === knoten.id)}>
          <button type="button" class="eintrag-hauptteil" onclick={() => oeffneOderWaehle(knoten)}>
            {#if knoten.farbe}<span class="kategorie-punkt" style="--punkt-farbe: {knoten.farbe}"></span>{/if}
            {knoten.label}
          </button>
          {#if knoten.nummer !== undefined}
            {#if onNummerKlick && (nummerAktiv?.(knoten.nummer) ?? true)}
              <button
                type="button"
                class="eintrag-nummer"
                onclick={() => onNummerKlick(knoten.nummer!)}
                aria-label={`Datenblatt zu Fläschchen ${knoten.nummer}`}
              >
                {knoten.nummer}
              </button>
            {:else}
              <span class="eintrag-nummer eintrag-nummer-inaktiv">{knoten.nummer}</span>
            {/if}
          {/if}
        </div>
      {/if}
    {/each}
  </div>

  {#if gewaehltMitFarbe.length > 0}
    <div class="leiste">
      <span class="zaehlung">{gewaehltMitFarbe.length}</span>
      {#each (ausgeklappt ? gewaehltMitFarbe : gewaehltMitFarbe.slice(0, grenze)) as g (g.id)}
        <button type="button" class="marke" onclick={() => entfernen(g.id)} aria-label={`${g.label} entfernen`}>
          {#if g.farbe}<span class="kategorie-punkt" style="--punkt-farbe: {g.farbe}"></span>{/if}
          {g.label}
        </button>
      {/each}
      {#if gewaehltMitFarbe.length > grenze}
        <button type="button" class="mehr" onclick={() => (ausgeklappt = !ausgeklappt)}>
          {ausgeklappt ? 'weniger' : `+ ${gewaehltMitFarbe.length - grenze}`}
        </button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .drilldown {
    display: flex;
    flex-direction: column;
  }
  /* Zurueck-Pfeil + Brotkruemelpfad in einer Zeile statt zwei — der Pfeil ist
     derselbe runde Knopf wie in Kopfzeile.svelte (K78: eine Form ueberall),
     zweitverwendet statt neu erfunden. */
  .kopf {
    display: flex;
    align-items: center;
    gap: var(--r2);
    padding: 4px 0;
  }
  .zurueck-rund {
    flex-shrink: 0;
    width: var(--r-knopf-rund);
    height: var(--r-knopf-rund);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--blatt);
    border: none;
    border-radius: 50%;
    color: var(--akzent);
    font-family: var(--schrift);
    font-size: 20px;
    line-height: 1;
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
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
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
    display: flex;
    align-items: center;
    gap: var(--r2);
  }
  .eintrag:first-child {
    border-top: none;
  }
  .eintrag.gewaehlt {
    background: var(--fuellung);
    color: var(--auf-fuellung);
    font-weight: var(--gw-titel);
  }
  /* Navigations-Zeile (hat Kinder — Kategorie oder Gruppe): Apparat, kein
     Inhalt, deshalb Sans statt Serif (Projektregel "Serif traegt den Inhalt,
     Sans nur den Apparat", siehe Kontextmenue.svelte/Blattzeile.svelte). Die
     Kategorie (oberste Ebene) eine Stufe groesser als die Gruppe darunter —
     das macht die Tiefe lesbar, ohne dass Kategorie und Gruppe verwechselt
     werden koennten. */
  .eintrag-navigation {
    font-family: var(--schrift-sans);
    font-size: var(--fs-satz);
  }
  .eintrag-navigation.eintrag-kategorie {
    font-size: var(--fs-bedienwort);
  }
  /* Blatt-Zeile mit Fläschchennummer: zwei eigene Trefferflächen statt einer
     — der Hauptteil wählt das Aroma, die Nummer öffnet das Datenblatt. */
  .eintrag-blatt {
    display: flex;
    align-items: stretch;
    padding: 0;
    gap: 0;
  }
  .eintrag-hauptteil {
    flex: 1;
    min-width: 0;
    min-height: var(--treffer);
    padding: 0 var(--r3);
    border: none;
    background: none;
    color: var(--satz);
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    text-align: left;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: var(--r2);
  }
  .eintrag.gewaehlt .eintrag-hauptteil {
    color: var(--auf-fuellung);
    font-weight: var(--gw-titel);
  }
  .eintrag-nummer {
    flex-shrink: 0;
    min-width: var(--treffer);
    min-height: var(--treffer);
    padding: 0 var(--r3);
    border: none;
    border-left: 1px solid var(--linie);
    background: none;
    color: var(--gedaempft);
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    font-variant-numeric: var(--zahl-features);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  /* Inaktiv (kein Datenblatt): kein Knopf, kein Trennstrich — reiner Text,
     schmaler als die Trefferflaeche (--flaeschchen statt --treffer), weil
     hier nichts zu treffen ist. Ein Knopf, der nichts tut, ist schlechter
     als gar kein Knopf. */
  .eintrag-nummer-inaktiv {
    min-width: var(--flaeschchen);
    border-left: none;
    cursor: default;
  }
  .eintrag.gewaehlt .eintrag-nummer {
    border-left-color: var(--auf-fuellung);
    color: var(--auf-fuellung);
    opacity: 0.75;
  }
  /* .kategorie-punkt ist zentral in tokens.css (zweiter echter Aufrufer:
     Uebungsmodus.svelte/Rangliste.svelte) — keine lokale Kopie mehr. */
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
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px var(--r2);
    border: none;
    border-radius: var(--r-pille);
    background: var(--vertiefung);
    color: var(--satz);
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    cursor: pointer;
    min-height: 32px;
  }
  /* Akzentfarbe statt --satz wie .marke: das ist ein Umschalter, kein
     entfernbarer Chip — die Farbe sagt "andere Handlung", nicht "anderes Aroma". */
  .mehr {
    padding: 4px var(--r2);
    border: none;
    border-radius: var(--r-pille);
    background: none;
    color: var(--akzent);
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    cursor: pointer;
    min-height: 32px;
  }
</style>
