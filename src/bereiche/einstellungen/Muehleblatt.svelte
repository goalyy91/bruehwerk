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
  //
  // Visueller Redesign-Reset, Paket 4: Formularzeilen/Textfeld jetzt ueber
  // die globalen Utilities aus tokens.css (.formularzeile, .eingabefeld-
  // text) statt lokal nachgebauter --feld/--feld-rahmen-Boxen — dieselbe
  // Form wie Bruehgeraetblatt.svelte/Setupblatt.svelte (ux-regeln.md
  // Regel 6/12).

  import { untrack } from 'svelte';
  import { bestand, schreiben } from '../bestand.svelte';
  import { neueId } from '../../daten/id';
  import Blattliste from '../../muster/Blattliste.svelte';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import Segment from '../../muster/Segment.svelte';
  import Schalter from '../../muster/Schalter.svelte';
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
    return { id: neueId(), name: '', skala: { typ: 'numerisch', min: 0, max: 10, schritt: 0.1 }, rpmEinstellbar: false };
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

  function zahl(e: Event): number {
    return Number((e.currentTarget as HTMLInputElement).value.replace(',', '.'));
  }
</script>

<Kopfzeile titel={bestehend ? 'Mühle bearbeiten' : 'Neue Mühle'} {onZurueck} />

<Blattliste>
<div class="formularzeile">
  <span class="formularzeile-label">Name</span>
  <input class="eingabefeld-text" type="text" bind:value={entwurf.name} />
</div>
<div class="formularzeile spalte">
  <span class="formularzeile-label">Skala</span>
  <Segment
    optionen={[{ wert: 'numerisch', label: 'numerisch' }, { wert: 'klicks', label: 'Klicks' }]}
    wert={entwurf.skala.typ}
    onWahl={(w) => (entwurf.skala = { ...entwurf.skala, typ: w as 'numerisch' | 'klicks' })}
  />
</div>
<!-- Rueckmeldung 2026-09-07 ("Kaesten in Kaesten"): Werteliste bringt ihre
     eigene Karte mit und steckte deshalb als Karte *in* der Karte — genau der
     weisse Kasten um Min/Max/Schritt aus Julians Screenshot. Dieselben Werte
     jetzt als normale Formularzeilen in derselben einen Karte. -->
<div class="formularzeile">
  <span class="formularzeile-label">Min</span>
  <input class="eingabefeld-text zahl schmal" type="text" inputmode="decimal"
    value={entwurf.skala.min} onchange={(e) => (entwurf.skala = { ...entwurf.skala, min: zahl(e) })} />
</div>
<div class="formularzeile">
  <span class="formularzeile-label">Max</span>
  <input class="eingabefeld-text zahl schmal" type="text" inputmode="decimal"
    value={entwurf.skala.max} onchange={(e) => (entwurf.skala = { ...entwurf.skala, max: zahl(e) })} />
</div>
<div class="formularzeile">
  <span class="formularzeile-label">Schritt</span>
  <input class="eingabefeld-text zahl schmal" type="text" inputmode="decimal"
    value={entwurf.skala.schritt} onchange={(e) => (entwurf.skala = { ...entwurf.skala, schritt: zahl(e) })} />
</div>
<div class="formularzeile">
  <Schalter label="Drehzahl einstellbar" an={entwurf.rpmEinstellbar} onWahl={(a) => (entwurf.rpmEinstellbar = a)} />
</div>
{#if entwurf.rpmEinstellbar}
  <div class="formularzeile">
    <span class="formularzeile-label">Drehzahl Min</span>
    <input class="eingabefeld-text zahl schmal" type="text" inputmode="decimal" value={entwurf.rpmBereich?.min ?? 0}
      onchange={(e) => (entwurf.rpmBereich = { min: zahl(e), max: entwurf.rpmBereich?.max ?? 0, schritt: entwurf.rpmBereich?.schritt ?? 1 })} />
  </div>
  <div class="formularzeile">
    <span class="formularzeile-label">Drehzahl Max</span>
    <input class="eingabefeld-text zahl schmal" type="text" inputmode="decimal" value={entwurf.rpmBereich?.max ?? 0}
      onchange={(e) => (entwurf.rpmBereich = { min: entwurf.rpmBereich?.min ?? 0, max: zahl(e), schritt: entwurf.rpmBereich?.schritt ?? 1 })} />
  </div>
  <div class="formularzeile">
    <span class="formularzeile-label">Drehzahl Schritt</span>
    <input class="eingabefeld-text zahl schmal" type="text" inputmode="decimal" value={entwurf.rpmBereich?.schritt ?? 1}
      onchange={(e) => (entwurf.rpmBereich = { min: entwurf.rpmBereich?.min ?? 0, max: entwurf.rpmBereich?.max ?? 0, schritt: zahl(e) })} />
  </div>
{/if}
</Blattliste>

<div class="knopfreihe">
  <Knopf stufe="primaer" onKlick={speichern} deaktiviert={entwurf.name.trim() === ''}>
    {bestehend ? 'speichern' : 'anlegen'}
  </Knopf>
</div>

{#if fehler}
  <p class="fehler">Nicht gespeichert: {fehler}</p>
{/if}

<style>
  /* Die Karte (Blattliste) zieht die Trennlinien zwischen ihren Kindern
     selbst — die eigene Unterlinie der globalen .formularzeile wuerde sich
     sonst verdoppeln. */
  :global(.formularzeile) {
    border-bottom: none;
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
