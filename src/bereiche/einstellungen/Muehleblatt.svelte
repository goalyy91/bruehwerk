<script lang="ts">
  // Muehleblatt — Teil G der Korrekturrunde: Geraete selbst pflegen, ohne
  // Code-Aenderung. Anders als Kaffeeblatt/Profilblatt speichert dieses
  // Formular NICHT pro Feld automatisch: rpmBereich und rpmEinstellbar
  // haengen ueber ein Zod-Refine zusammen (geraete.ts), ein Autosave je
  // Tastenanschlag wuerde bei jedem Zwischenzustand SchreibFehler werfen.
  // Ein Knopf "speichern"/"anlegen" schreibt den ganzen, konsistenten
  // Entwurf auf einmal.
  //
  // UX-Korrekturrunde: Loeschen ist raus (jetzt in MuehleAnsicht.svelte,
  // ueber Kontextmenue) — "speichern" ist damit die einzige Aktion auf
  // diesem Blatt (Regel 3).

  import { untrack } from 'svelte';
  import { bestand, schreiben } from '../bestand.svelte';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import Segment from '../../muster/Segment.svelte';
  import Schalter from '../../muster/Schalter.svelte';
  import Werteliste from '../../muster/Werteliste.svelte';
  import Knopf from '../../muster/Knopf.svelte';
  import type { Muehle } from '../../daten/schema';

  let {
    muehleId,
    onZurueck,
  }: {
    muehleId?: string;
    onZurueck: () => void;
  } = $props();

  const bestehend = $derived(muehleId ? bestand.muehlen.find((m) => m.id === muehleId) : undefined);

  function leererEntwurf(): Muehle {
    return { id: crypto.randomUUID(), name: '', skala: { typ: 'numerisch', min: 0, max: 10, schritt: 0.1 }, rpmEinstellbar: false };
  }

  // bestehend liefert nur die Startbelegung (Bearbeiten-Fall); danach lebt
  // der Entwurf lokal. untrack() macht das Nur-einmal-lesen explizit.
  // $state.snapshot() statt structuredClone(): bestehend ist ein Svelte-
  // reaktives Objekt (bestand.muehlen ist $state) — structuredClone
  // scheitert daran, sobald ein Array-Feld drin ist, mit "could not be
  // cloned" (gefunden beim Kaffee-Bearbeiten-Formular, dasselbe Muster).
  let entwurf = $state<Muehle>(untrack(() => (bestehend ? $state.snapshot(bestehend) : leererEntwurf())));
  let fehler = $state<string | undefined>(undefined);

  async function speichern() {
    fehler = undefined;
    const zumSchreiben: Muehle = entwurf.rpmEinstellbar ? entwurf : { ...entwurf, rpmBereich: undefined };
    try {
      await schreiben('muehle', zumSchreiben);
      onZurueck();
    } catch (e) {
      fehler = e instanceof Error ? e.message : String(e);
    }
  }
</script>

<Kopfzeile titel={bestehend ? 'Mühle bearbeiten' : 'Neue Mühle'} {onZurueck} />

<div class="feld-zeile">
  <span class="label">Name</span>
  <input class="text-eingabe" type="text" bind:value={entwurf.name} />
</div>
<div class="feld-zeile spalte">
  <span class="label">Skala</span>
  <Segment
    optionen={[{ wert: 'numerisch', label: 'numerisch' }, { wert: 'klicks', label: 'Klicks' }]}
    wert={entwurf.skala.typ}
    onWahl={(w) => (entwurf.skala = { ...entwurf.skala, typ: w as 'numerisch' | 'klicks' })}
  />
</div>
<Werteliste
  zeilen={[
    { label: 'Min', wert: entwurf.skala.min, onAendern: (w) => (entwurf.skala = { ...entwurf.skala, min: w }) },
    { label: 'Max', wert: entwurf.skala.max, onAendern: (w) => (entwurf.skala = { ...entwurf.skala, max: w }) },
    { label: 'Schritt', wert: entwurf.skala.schritt, onAendern: (w) => (entwurf.skala = { ...entwurf.skala, schritt: w }) },
  ]}
/>
<div class="feld-zeile">
  <Schalter label="Drehzahl einstellbar" an={entwurf.rpmEinstellbar} onWahl={(a) => (entwurf.rpmEinstellbar = a)} />
</div>
{#if entwurf.rpmEinstellbar}
  <Werteliste
    zeilen={[
      {
        label: 'RPM Min',
        wert: entwurf.rpmBereich?.min ?? 0,
        onAendern: (w) => (entwurf.rpmBereich = { min: w, max: entwurf.rpmBereich?.max ?? 0, schritt: entwurf.rpmBereich?.schritt ?? 1 }),
      },
      {
        label: 'RPM Max',
        wert: entwurf.rpmBereich?.max ?? 0,
        onAendern: (w) => (entwurf.rpmBereich = { min: entwurf.rpmBereich?.min ?? 0, max: w, schritt: entwurf.rpmBereich?.schritt ?? 1 }),
      },
      {
        label: 'RPM Schritt',
        wert: entwurf.rpmBereich?.schritt ?? 1,
        onAendern: (w) => (entwurf.rpmBereich = { min: entwurf.rpmBereich?.min ?? 0, max: entwurf.rpmBereich?.max ?? 0, schritt: w }),
      },
    ]}
  />
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
  .feld-zeile {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--r2);
    min-height: var(--treffer);
    border-bottom: 1px solid var(--linie);
    padding: var(--r1) 0;
  }
  .feld-zeile.spalte {
    flex-direction: column;
    align-items: stretch;
    gap: var(--r1);
  }
  .label {
    width: var(--eigenschaftslabel);
    flex-shrink: 0;
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  .feld-zeile.spalte .label {
    width: auto;
  }
  .text-eingabe {
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    background: var(--feld);
    border: 1px solid var(--feld-rahmen);
    color: var(--tinte);
    padding: var(--r1) var(--r2);
    min-height: var(--treffer);
    flex: 1;
    min-width: var(--feld-min);
  }
  .knopfreihe {
    margin-top: var(--r4);
  }
  .fehler {
    color: var(--kritisch);
    font-size: var(--fs-satz);
    margin-top: var(--r3);
  }
</style>
