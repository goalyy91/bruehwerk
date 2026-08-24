<script lang="ts">
  // Bruehgeraetblatt — Teil G + Korrekturrunde Teil 3. Ein Knopf
  // "speichern"/"anlegen" statt Autosave je Feld (siehe Muehleblatt.svelte)
  // — Moka erzwingt fuehrungswert:null per Refine (K7), das darf nicht bei
  // jedem Zwischenschritt SchreibFehler werfen.
  //
  // Korrekturrunde:
  //  - "PID" statt "Kesseltemperatur einstellbar" (derselbe Feldname
  //    ktEinstellbar im Code, nur das Label war irrefuehrend).
  //  - Cooling Flush ist ein eigener Schalter, unabhaengig von PID, immer
  //    bei typ 'espresso' anbietbar — Dauer nur wenn an.
  //  - Dampflanze nur noch bei Espresso: Moka/Pour Over/Cold Brew haben nie
  //    eine.
  //  - mengen und Sieb.portionen sagten faktisch dasselbe ("wie viele Shots
  //    auf einmal"). Bei Espresso wird mengen jetzt aus dem Sieb abgeleitet
  //    (einzel -> [1], doppel -> [1,2], K8) statt separat abgefragt — die
  //    drei 1x/2x/3x-Schalter bleiben nur noch fuer Moka/Pour Over/Cold Brew.
  //  - Temperaturtabelle zieht auf einen eigenen Bildschirm
  //    (TempReferenzScreen.svelte, offene-punkte-ux.md Punkt 3), erreichbar
  //    ueber eine Zeile sobald PID an ist — auch bei einem noch nicht
  //    gespeicherten Geraet. Der Entwurf lebt dafuer nicht mehr lokal,
  //    sondern in bruehgeraetEntwurf.svelte.ts, damit er den
  //    Bildschirmwechsel uebersteht.
  //
  // UX-Korrekturrunde: Loeschen ist raus (jetzt in BruehgeraetAnsicht.svelte,
  // ueber Kontextmenue) — "speichern" ist damit die einzige Aktion auf
  // diesem Blatt (Regel 3). Typ (vier Optionen) laeuft jetzt ueber
  // AuswahlListe statt Einzelauswahl, echte Zwei-Zustands-Felder (Sieb,
  // Fuehrungswert) ueber Segment (Regel 5).
  //
  // Visueller Redesign-Reset, Paket 4: Formularzeilen/Textfeld ueber die
  // globalen Utilities aus tokens.css (.formularzeile, .eingabefeld-text)
  // statt lokal nachgebauter --feld/--feld-rahmen-Boxen.

  import { untrack } from 'svelte';
  import { bestand, schreiben } from '../bestand.svelte';
  import { bruehgeraetEntwurf } from './bruehgeraetEntwurf.svelte';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import AuswahlListe from '../../muster/AuswahlListe.svelte';
  import Segment from '../../muster/Segment.svelte';
  import Schalter from '../../muster/Schalter.svelte';
  import Knopf from '../../muster/Knopf.svelte';
  import type { Bruehgeraet } from '../../daten/schema';

  let {
    bruehgeraetId,
    onZurueck,
    onOeffnenTempReferenz,
  }: {
    bruehgeraetId?: string;
    onZurueck: () => void;
    onOeffnenTempReferenz: () => void;
  } = $props();

  const bestehend = $derived(bruehgeraetId ? bestand.bruehgeraete.find((b) => b.id === bruehgeraetId) : undefined);

  function leererEntwurf(): Bruehgeraet {
    return {
      id: crypto.randomUUID(),
      name: '',
      typ: 'espresso',
      gruppen: 1,
      dampflanze: false,
      ktEinstellbar: false,
      fuehrungswert: 'output',
      sieb: { art: 'doppel' },
      mengen: [1, 2],
      tempReferenz: [],
    };
  }

  // Ein laufender Entwurf in bruehgeraetEntwurf ist entweder ein frischer
  // Start oder die Rueckkehr vom Temperatur-Bildschirm — Rahmen.svelte
  // verwirft ihn bei jedem anderen Ausstieg (onZurueck), sonst gaebe es hier
  // nichts mehr zu unterscheiden. $state.snapshot() statt structuredClone():
  // bestehend ist ein Svelte-reaktives Objekt — structuredClone scheitert an
  // den Array-Feldern (mengen, tempReferenz) mit "could not be cloned"
  // (gefunden beim Kaffee-Bearbeiten-Formular, dasselbe Muster).
  untrack(() => {
    if (!bruehgeraetEntwurf.aktuell) {
      bruehgeraetEntwurf.setzen(bestehend ? $state.snapshot(bestehend) : leererEntwurf());
    }
  });
  const entwurf = bruehgeraetEntwurf.aktuell!;
  let fehler = $state<string | undefined>(undefined);

  // "zurueck" verwirft sonst den kompletten Entwurf inkl. Temperaturzeilen
  // ohne Rueckfrage. Kein OS-confirm() (Regel 6) — stattdessen eine Zeile im
  // Fluss, die einen zweiten Tap verlangt, dieselbe Mechanik wie
  // Kontextmenue.svelte fuer kritische Aktionen.
  let verwerfenBestaetigen = $state(false);
  function versuchZurueck() {
    if (!bruehgeraetEntwurf.istVeraendert() || verwerfenBestaetigen) {
      onZurueck();
      return;
    }
    verwerfenBestaetigen = true;
  }

  /** K8: einzel -> [1], doppel -> [1,2] — ersetzt die separate Mengen-Abfrage bei Espresso. */
  function mengenAusSieb(sieb: NonNullable<Bruehgeraet['sieb']>): number[] {
    return sieb.art === 'doppel' ? [1, 2] : [1];
  }

  function typWechseln(typ: string) {
    entwurf.typ = typ as Bruehgeraet['typ'];
    if (typ === 'moka') entwurf.fuehrungswert = null;
    else if (entwurf.fuehrungswert === null) entwurf.fuehrungswert = 'output';

    if (typ === 'espresso') {
      if (!entwurf.sieb) entwurf.sieb = { art: 'doppel' };
      entwurf.mengen = mengenAusSieb(entwurf.sieb);
    } else {
      entwurf.sieb = undefined;
      entwurf.dampflanze = false; // nur Espresso hat eine
      entwurf.ktEinstellbar = false; // Gruppen/PID nur bei Siebtraeger (Rueckmeldung 2026-08-24)
      entwurf.flushDauer = undefined;
      if (entwurf.mengen.length === 0) entwurf.mengen = [1];
    }
  }

  function siebAendern(sieb: NonNullable<Bruehgeraet['sieb']>) {
    entwurf.sieb = sieb;
    entwurf.mengen = mengenAusSieb(sieb);
  }

  function mengeUmschalten(menge: number, an: boolean) {
    const ohne = entwurf.mengen.filter((m) => m !== menge);
    entwurf.mengen = an ? [...ohne, menge].sort((a, b) => a - b) : ohne;
  }

  function flushUmschalten(an: boolean) {
    entwurf.flushDauer = an ? 3 : undefined;
  }

  async function speichern() {
    fehler = undefined;
    if (entwurf.mengen.length === 0) {
      fehler = 'mindestens eine Menge muss angeboten werden';
      return;
    }
    try {
      await schreiben('bruehgeraet', entwurf);
      onZurueck();
    } catch (e) {
      fehler = e instanceof Error ? e.message : String(e);
    }
  }

  // "Siebträger" statt "Espresso" (Rueckmeldung 2026-08-24) — der
  // gespeicherte Wert (Bruehgeraet['typ']) bleibt 'espresso', nur das Label
  // aendert sich: "Espresso" ist das Getraenk, nicht das Geraet.
  const TYP_OPTIONEN = [
    { wert: 'espresso', label: 'Siebträger' },
    { wert: 'moka', label: 'Moka' },
    { wert: 'pourover', label: 'Pour Over' },
    { wert: 'coldbrew', label: 'Cold Brew' },
  ];
</script>

<Kopfzeile titel={bestehend ? 'Brühgerät bearbeiten' : 'Neues Brühgerät'} onZurueck={versuchZurueck} />

{#if verwerfenBestaetigen}
  <p class="verwerfen-hinweis">
    Ungespeicherte Änderungen. <button type="button" class="verwerfen-link" onclick={versuchZurueck}>Wirklich verwerfen</button> ·
    <button type="button" class="verwerfen-link" onclick={() => (verwerfenBestaetigen = false)}>weiter bearbeiten</button>
  </p>
{/if}

<div class="formularzeile">
  <span class="formularzeile-label">Name</span>
  <input class="eingabefeld-text" type="text" bind:value={entwurf.name} />
</div>
<div class="formularzeile spalte">
  <span class="formularzeile-label">Typ</span>
  <AuswahlListe optionen={TYP_OPTIONEN} wert={entwurf.typ} onWahl={typWechseln} />
</div>
{#if entwurf.typ === 'espresso'}
  <div class="formularzeile">
    <span class="formularzeile-label">Gruppen</span>
    <input
      class="eingabefeld-text zahl"
      type="text"
      inputmode="numeric"
      value={entwurf.gruppen}
      onchange={(e) => (entwurf.gruppen = Math.max(1, Math.round(Number(e.currentTarget.value.replace(',', '.')))))}
    />
  </div>
  <p class="erklaerung">Anzahl Brühgruppen am Gerät — bei dir 1.</p>

  <div class="formularzeile">
    <Schalter label="Dampflanze" an={entwurf.dampflanze} onWahl={(a) => (entwurf.dampflanze = a)} />
  </div>
  <div class="formularzeile">
    <Schalter label="Cooling Flush" an={entwurf.flushDauer !== undefined} onWahl={flushUmschalten} />
  </div>
  {#if entwurf.flushDauer !== undefined}
    <div class="formularzeile">
      <span class="formularzeile-label">Flush-Dauer</span>
      <input
        class="eingabefeld-text zahl"
        type="text"
        inputmode="decimal"
        value={entwurf.flushDauer}
        onchange={(e) => (entwurf.flushDauer = Number(e.currentTarget.value.replace(',', '.')))}
      />
      <span class="einheit">s</span>
    </div>
  {/if}

  <div class="formularzeile">
    <Schalter label="PID" an={entwurf.ktEinstellbar} onWahl={(a) => (entwurf.ktEinstellbar = a)} />
  </div>
  <p class="erklaerung">Kesseltemperatur direkt einstellbar — ohne PID hast du nur den Cooling Flush als Hebel.</p>
{/if}

{#if entwurf.typ === 'espresso' && entwurf.ktEinstellbar}
  <button type="button" class="unterseite" onclick={onOeffnenTempReferenz}>
    <span>Kesseltemperatur-Tabelle pflegen</span>
    <span class="nebeninfo">{entwurf.tempReferenz.length} {entwurf.tempReferenz.length === 1 ? 'Zeile' : 'Zeilen'} ›</span>
  </button>
{/if}

{#if entwurf.typ !== 'moka'}
  <div class="formularzeile spalte">
    <span class="formularzeile-label">Führungswert</span>
    <Segment
      optionen={[{ wert: 'output', label: 'Output' }, { wert: 'durchlaufzeit', label: 'Durchlaufzeit' }]}
      wert={entwurf.fuehrungswert ?? ''}
      onWahl={(w) => (entwurf.fuehrungswert = w as Bruehgeraet['fuehrungswert'])}
    />
  </div>
{/if}

{#if entwurf.typ === 'espresso'}
  <div class="formularzeile spalte">
    <span class="formularzeile-label">Sieb</span>
    <Segment
      optionen={[{ wert: 'einzel', label: 'einzel' }, { wert: 'doppel', label: 'doppel' }]}
      wert={entwurf.sieb?.art ?? 'doppel'}
      onWahl={(w) => siebAendern({ art: w as 'einzel' | 'doppel' })}
    />
  </div>
  <p class="erklaerung">
    Art des Siebträger-Einsatzes und wie viele Shots er fasst (doppel → 2). Wie viele
    Mengen dadurch angeboten werden ({entwurf.mengen.map((m) => `${m}×`).join(', ')}) ergibt sich daraus — kein
    separates Feld mehr.
  </p>
{:else}
  <div class="formularzeile">
    <span class="formularzeile-label">Mengen</span>
  </div>
  <div class="formularzeile">
    <Schalter label="1×" an={entwurf.mengen.includes(1)} onWahl={(a) => mengeUmschalten(1, a)} />
  </div>
  <div class="formularzeile">
    <Schalter label="2×" an={entwurf.mengen.includes(2)} onWahl={(a) => mengeUmschalten(2, a)} />
  </div>
  <div class="formularzeile">
    <Schalter label="3×" an={entwurf.mengen.includes(3)} onWahl={(a) => mengeUmschalten(3, a)} />
  </div>
  <p class="erklaerung">Wie viele Portionen gleichzeitig angeboten werden.</p>
{/if}

<div class="knopfreihe">
  <Knopf stufe="primaer" onKlick={speichern} deaktiviert={entwurf.name.trim() === ''}>
    {bestehend ? 'speichern' : 'anlegen'}
  </Knopf>
</div>

{#if fehler}
  <p class="fehler">Nicht gespeichert: {fehler}</p>
{/if}

<style>
  .erklaerung {
    font-family: var(--schrift-sans);
    font-size: 12.5px;
    color: var(--gedaempft);
    margin: var(--r1) 0 var(--r2);
  }
  .einheit {
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  .unterseite {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-height: var(--treffer);
    padding: 0;
    margin-bottom: var(--r2);
    border: none;
    border-bottom: 1px solid var(--linie);
    background: transparent;
    color: var(--tinte);
    font-family: var(--schrift);
    font-size: var(--fs-bedienwort);
    text-align: left;
    cursor: pointer;
  }
  .unterseite .nebeninfo {
    font-family: var(--schrift-sans);
    color: var(--gedaempft);
    font-size: var(--fs-meta);
  }
  .knopfreihe {
    margin-top: var(--r4);
  }
  .fehler {
    color: var(--kritisch);
    font-size: var(--fs-satz);
    margin-top: var(--r3);
  }
  .verwerfen-hinweis {
    color: var(--kritisch);
    font-size: var(--fs-meta);
    margin: 0 0 var(--r4);
  }
  .verwerfen-link {
    background: none;
    border: none;
    padding: 0;
    color: inherit;
    font-family: var(--schrift);
    font-size: inherit;
    text-decoration: underline;
    cursor: pointer;
  }
</style>
