<script lang="ts">
  // Muehleblatt — Teil G der Korrekturrunde: Geraete selbst pflegen, ohne
  // Code-Aenderung. Anders als Kaffeeblatt/Profilblatt speichert dieses
  // Formular NICHT pro Feld automatisch: rpmBereich und rpmEinstellbar
  // haengen ueber ein Zod-Refine zusammen (geraete.ts), ein Autosave je
  // Tastenanschlag wuerde bei jedem Zwischenzustand SchreibFehler werfen.
  // Ein Knopf "speichern"/"anlegen" schreibt den ganzen, konsistenten
  // Entwurf auf einmal.

  import { untrack } from 'svelte';
  import { bestand, schreiben } from '../bestand.svelte';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import Einzelauswahl from '../../muster/Einzelauswahl.svelte';
  import Schalter from '../../muster/Schalter.svelte';
  import type { Muehle } from '../../daten/schema';

  let { muehleId, onZurueck }: { muehleId?: string; onZurueck: () => void } = $props();

  const bestehend = $derived(muehleId ? bestand.muehlen.find((m) => m.id === muehleId) : undefined);

  function leererEntwurf(): Muehle {
    return { id: crypto.randomUUID(), name: '', skala: { typ: 'numerisch', min: 0, max: 10, schritt: 0.1 }, rpmEinstellbar: false };
  }

  // bestehend liefert nur die Startbelegung (Bearbeiten-Fall); danach lebt
  // der Entwurf lokal. untrack() macht das Nur-einmal-lesen explizit.
  let entwurf = $state<Muehle>(untrack(() => (bestehend ? structuredClone(bestehend) : leererEntwurf())));
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

<div class="feld-zeile">
  <span class="label">Name</span>
  <input class="text-eingabe" type="text" bind:value={entwurf.name} />
</div>
<div class="feld-zeile">
  <span class="label">Skala</span>
  <Einzelauswahl
    optionen={[{ wert: 'numerisch', label: 'numerisch' }, { wert: 'klicks', label: 'Klicks' }]}
    wert={entwurf.skala.typ}
    onWahl={(w) => (entwurf.skala = { ...entwurf.skala, typ: w as 'numerisch' | 'klicks' })}
  />
</div>
<div class="feld-zeile">
  <span class="label">Min · Max · Schritt</span>
  <input class="text-eingabe zahl schmal" type="text" inputmode="decimal" value={entwurf.skala.min}
    onchange={(e) => (entwurf.skala = { ...entwurf.skala, min: zahl(e) })} />
  <input class="text-eingabe zahl schmal" type="text" inputmode="decimal" value={entwurf.skala.max}
    onchange={(e) => (entwurf.skala = { ...entwurf.skala, max: zahl(e) })} />
  <input class="text-eingabe zahl schmal" type="text" inputmode="decimal" value={entwurf.skala.schritt}
    onchange={(e) => (entwurf.skala = { ...entwurf.skala, schritt: zahl(e) })} />
</div>
<div class="feld-zeile">
  <Schalter label="Drehzahl einstellbar" an={entwurf.rpmEinstellbar} onWahl={(a) => (entwurf.rpmEinstellbar = a)} />
</div>
{#if entwurf.rpmEinstellbar}
  <div class="feld-zeile">
    <span class="label">RPM Min · Max · Schritt</span>
    <input class="text-eingabe zahl schmal" type="text" inputmode="decimal" value={entwurf.rpmBereich?.min ?? ''}
      onchange={(e) => (entwurf.rpmBereich = { min: zahl(e), max: entwurf.rpmBereich?.max ?? 0, schritt: entwurf.rpmBereich?.schritt ?? 1 })} />
    <input class="text-eingabe zahl schmal" type="text" inputmode="decimal" value={entwurf.rpmBereich?.max ?? ''}
      onchange={(e) => (entwurf.rpmBereich = { min: entwurf.rpmBereich?.min ?? 0, max: zahl(e), schritt: entwurf.rpmBereich?.schritt ?? 1 })} />
    <input class="text-eingabe zahl schmal" type="text" inputmode="decimal" value={entwurf.rpmBereich?.schritt ?? ''}
      onchange={(e) => (entwurf.rpmBereich = { min: entwurf.rpmBereich?.min ?? 0, max: entwurf.rpmBereich?.max ?? 0, schritt: zahl(e) })} />
  </div>
{/if}

<button type="button" class="primaer" onclick={speichern} disabled={entwurf.name.trim() === ''}>
  {bestehend ? 'speichern' : 'anlegen'}
</button>

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
  .label {
    width: var(--eigenschaftslabel);
    flex-shrink: 0;
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  .text-eingabe {
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    background: var(--feld);
    border: 1px solid var(--feld-rahmen);
    color: var(--tinte);
    padding: var(--r1) var(--r2);
    min-height: 40px;
    flex: 1;
    min-width: 100px;
  }
  .text-eingabe.zahl {
    font-variant-numeric: var(--zahl-features);
    text-align: right;
    flex: 0 0 auto;
  }
  .text-eingabe.schmal {
    width: 64px;
  }
  .primaer {
    min-height: var(--treffer);
    padding: 0 var(--r4);
    margin-top: var(--r4);
    background: var(--akzent);
    color: var(--h-papier);
    border: none;
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    cursor: pointer;
  }
  .primaer:disabled {
    opacity: 0.5;
    cursor: default;
  }
  .fehler {
    color: var(--kritisch);
    font-size: var(--fs-satz);
    margin-top: var(--r3);
  }
</style>
