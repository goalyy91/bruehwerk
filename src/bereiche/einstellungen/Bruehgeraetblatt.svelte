<script lang="ts">
  // Bruehgeraetblatt — Teil G der Korrekturrunde. Ein Knopf "speichern"/
  // "anlegen" statt Autosave je Feld (siehe Muehleblatt.svelte) — Moka
  // erzwingt fuehrungswert:null per Refine (K7), das darf nicht bei jedem
  // Zwischenschritt SchreibFehler werfen.

  import { untrack } from 'svelte';
  import { bestand, schreiben } from '../bestand.svelte';
  import Einzelauswahl from '../../muster/Einzelauswahl.svelte';
  import Schalter from '../../muster/Schalter.svelte';
  import type { Bruehgeraet } from '../../daten/schema';

  let { bruehgeraetId, onZurueck }: { bruehgeraetId?: string; onZurueck: () => void } = $props();

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
      mengen: [1],
      tempReferenz: [],
    };
  }

  let entwurf = $state<Bruehgeraet>(untrack(() => (bestehend ? structuredClone(bestehend) : leererEntwurf())));
  let fehler = $state<string | undefined>(undefined);

  function typWechseln(typ: string) {
    entwurf.typ = typ as Bruehgeraet['typ'];
    if (typ === 'moka') entwurf.fuehrungswert = null;
    else if (entwurf.fuehrungswert === null) entwurf.fuehrungswert = 'output';
    if (typ !== 'espresso') entwurf.sieb = undefined;
    else if (!entwurf.sieb) entwurf.sieb = { art: 'doppel', portionen: 2 };
  }

  function mengeUmschalten(menge: number, an: boolean) {
    const ohne = entwurf.mengen.filter((m) => m !== menge);
    entwurf.mengen = an ? [...ohne, menge].sort((a, b) => a - b) : ohne;
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

  function zahl(e: Event): number {
    return Number((e.currentTarget as HTMLInputElement).value.replace(',', '.'));
  }
</script>

<button type="button" class="zurueck" onclick={onZurueck}>‹ Geräte</button>
<h1>{bestehend ? 'Brühgerät bearbeiten' : 'Neues Brühgerät'}</h1>

<div class="feld-zeile">
  <span class="label">Name</span>
  <input class="text-eingabe" type="text" bind:value={entwurf.name} />
</div>
<div class="feld-zeile">
  <span class="label">Typ</span>
  <Einzelauswahl
    optionen={[
      { wert: 'espresso', label: 'Espresso' },
      { wert: 'moka', label: 'Moka' },
      { wert: 'pourover', label: 'Pour Over' },
      { wert: 'coldbrew', label: 'Cold Brew' },
    ]}
    wert={entwurf.typ}
    onWahl={typWechseln}
  />
</div>
<div class="feld-zeile">
  <span class="label">Gruppen</span>
  <input class="text-eingabe zahl schmal" type="text" inputmode="numeric" value={entwurf.gruppen}
    onchange={(e) => (entwurf.gruppen = Math.max(1, Math.round(zahl(e))))} />
</div>
<div class="feld-zeile">
  <Schalter label="Dampflanze" an={entwurf.dampflanze} onWahl={(a) => (entwurf.dampflanze = a)} />
</div>
<div class="feld-zeile">
  <Schalter label="Kesseltemperatur einstellbar" an={entwurf.ktEinstellbar} onWahl={(a) => (entwurf.ktEinstellbar = a)} />
</div>
{#if entwurf.ktEinstellbar}
  <div class="feld-zeile">
    <span class="label">Cooling Flush</span>
    <input class="text-eingabe zahl schmal" type="text" inputmode="decimal" value={entwurf.flushDauer ?? ''}
      onchange={(e) => (entwurf.flushDauer = zahl(e))} /> s
  </div>
{/if}
{#if entwurf.typ !== 'moka'}
  <div class="feld-zeile">
    <span class="label">Führungswert</span>
    <Einzelauswahl
      optionen={[
        { wert: 'output', label: 'Output' },
        { wert: 'durchlaufzeit', label: 'Durchlaufzeit' },
      ]}
      wert={entwurf.fuehrungswert ?? ''}
      onWahl={(w) => (entwurf.fuehrungswert = w as Bruehgeraet['fuehrungswert'])}
    />
  </div>
{/if}
<div class="feld-zeile">
  <span class="label">Mengen</span>
  <Schalter label="1×" an={entwurf.mengen.includes(1)} onWahl={(a) => mengeUmschalten(1, a)} />
  <Schalter label="2×" an={entwurf.mengen.includes(2)} onWahl={(a) => mengeUmschalten(2, a)} />
  <Schalter label="3×" an={entwurf.mengen.includes(3)} onWahl={(a) => mengeUmschalten(3, a)} />
</div>
{#if entwurf.typ === 'espresso'}
  <div class="feld-zeile">
    <span class="label">Sieb</span>
    <Einzelauswahl
      optionen={[{ wert: 'einzel', label: 'einzel' }, { wert: 'doppel', label: 'doppel' }]}
      wert={entwurf.sieb?.art ?? 'doppel'}
      onWahl={(w) => (entwurf.sieb = { art: w as 'einzel' | 'doppel', portionen: entwurf.sieb?.portionen ?? 2 })}
    />
    <input class="text-eingabe zahl schmal" type="text" inputmode="numeric" value={entwurf.sieb?.portionen ?? 2}
      onchange={(e) => (entwurf.sieb = { art: entwurf.sieb?.art ?? 'doppel', portionen: Math.max(1, Math.round(zahl(e))) })} />
  </div>
{/if}

<button type="button" class="primaer" onclick={speichern} disabled={entwurf.name.trim() === ''}>
  {bestehend ? 'speichern' : 'anlegen'}
</button>

{#if fehler}
  <p class="fehler">Nicht gespeichert: {fehler}</p>
{/if}

<style>
  .zurueck {
    background: none;
    border: none;
    color: var(--akzent);
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    min-height: var(--treffer);
    padding: 0;
    cursor: pointer;
    display: block;
  }
  h1 {
    font-size: var(--fs-titel);
    font-weight: var(--gw-titel);
    margin: 0 0 var(--r4);
  }
  .feld-zeile {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--r3);
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
