<script lang="ts">
  // Kaffee bearbeiten — eigene Route (UX-2), abgetrennt vom Kaffeeblatt
  // (das ist jetzt reine Leseansicht). Folgt dem Entwurfs-Muster, das die
  // Geraete-Blaetter schon verwenden (Muehleblatt.svelte): ein lokaler
  // Entwurf per untrack()+structuredClone, ein Knopf "speichern", ein
  // echtes "abbrechen" — kein Autosave je Tastenanschlag mehr wie vorher im
  // eingebetteten Kaffeeblatt-Formular.

  import { untrack } from 'svelte';
  import { bestand, schreiben } from '../bestand.svelte';
  import Bohnen from '../../muster/Bohnen.svelte';
  import Sterne from '../../muster/Sterne.svelte';
  import Segment from '../../muster/Segment.svelte';
  import AuswahlListe from '../../muster/AuswahlListe.svelte';
  import Schalter from '../../muster/Schalter.svelte';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import type { Kaffee, Aufbereitung } from '../../daten/schema';

  let { kaffeeId, onZurueck }: { kaffeeId: string; onZurueck: () => void } = $props();

  const bestehend = $derived(bestand.kaffees.find((k) => k.id === kaffeeId));

  let entwurf = $state<Kaffee | undefined>(untrack(() => (bestehend ? structuredClone(bestehend) : undefined)));
  let fehler = $state<string | undefined>(undefined);

  function herkunftAendern(text: string) {
    if (!entwurf) return;
    entwurf.herkunft = text
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  function botanikAendern(feld: 'arabicaProzent' | 'robustaProzent', wert: number) {
    if (!entwurf) return;
    const basis = entwurf.botanik ?? { arabicaProzent: 100, robustaProzent: 0 };
    entwurf.botanik = { ...basis, [feld]: wert };
  }

  function zahl(e: Event): number {
    return Number((e.currentTarget as HTMLInputElement).value.replace(',', '.'));
  }

  async function speichern() {
    if (!entwurf) return;
    fehler = undefined;
    try {
      await schreiben('kaffee', entwurf);
      onZurueck();
    } catch (e) {
      fehler = e instanceof Error ? e.message : String(e);
    }
  }

  const AUFBEREITUNG_OPTIONEN: { wert: Aufbereitung; label: string }[] = [
    { wert: 'washed', label: 'Washed' },
    { wert: 'honey', label: 'Honey' },
    { wert: 'natural', label: 'Natural' },
    { wert: 'anaerob', label: 'Anaerob' },
    { wert: 'wet-hulled', label: 'Wet-hulled' },
    { wert: 'sonstige', label: 'Sonstige' },
  ];
</script>

{#if !entwurf}
  <Kopfzeile titel="Kaffee bearbeiten" {onZurueck} />
  <p class="hinweis">Kaffee nicht gefunden.</p>
{:else}
  <Kopfzeile titel="Kaffee bearbeiten" {onZurueck} />

  <section class="gruppe">
    <h2>Grunddaten</h2>
    <div class="zeile">
      <span class="label">Name</span>
      <input class="text-eingabe" type="text" bind:value={entwurf.name} />
    </div>
    <div class="zeile">
      <span class="label">Röster</span>
      <input class="text-eingabe" type="text" bind:value={entwurf.roester} />
    </div>
    <div class="zeile spalte">
      <span class="label">Art</span>
      <Segment
        optionen={[
          { wert: 'single', label: 'Single Origin' },
          { wert: 'blend', label: 'Blend' },
        ]}
        wert={entwurf.art}
        onWahl={(w) => (entwurf!.art = w as Kaffee['art'])}
      />
    </div>
    <div class="zeile">
      <Schalter label="entkoffeiniert" an={entwurf.entkoffeiniert} onWahl={(a) => (entwurf!.entkoffeiniert = a)} />
    </div>
    <div class="zeile">
      <Schalter label="aktiv" an={entwurf.aktiv} onWahl={(a) => (entwurf!.aktiv = a)} />
    </div>
  </section>

  <section class="gruppe">
    <h2>Röstung &amp; Bewertung</h2>
    <div class="zeile spalte">
      <span class="label">Röstgrad</span>
      <Bohnen stufe={entwurf.roestgrad} onWahl={(s) => (entwurf!.roestgrad = s)} />
    </div>
    <div class="zeile spalte">
      <span class="label">Bewertung</span>
      <Sterne wert={entwurf.bewertung} onWahl={(w) => (entwurf!.bewertung = w)} />
    </div>
    <div class="zeile">
      <span class="label">Röstgrad (Röster)</span>
      <input class="text-eingabe" type="text" value={entwurf.roestgradRoester ?? ''}
        onchange={(e) => (entwurf!.roestgradRoester = (e.currentTarget as HTMLInputElement).value || undefined)} />
    </div>
  </section>

  <section class="gruppe">
    <h2>Herkunft &amp; Botanik</h2>
    <div class="zeile">
      <span class="label">Herkunft</span>
      <input class="text-eingabe" type="text" placeholder="Land, Land …"
        value={entwurf.herkunft.join(', ')} onchange={(e) => herkunftAendern((e.currentTarget as HTMLInputElement).value)} />
    </div>
    <div class="zeile">
      <span class="label">Varietät</span>
      <input class="text-eingabe" type="text" value={entwurf.varietaet ?? ''}
        onchange={(e) => (entwurf!.varietaet = (e.currentTarget as HTMLInputElement).value || undefined)} />
    </div>
    <div class="zeile">
      <span class="label">Anbauhöhe</span>
      <input class="text-eingabe zahl" type="text" inputmode="numeric" value={entwurf.anbauhoehe ?? ''}
        onchange={(e) => (entwurf!.anbauhoehe = Number((e.currentTarget as HTMLInputElement).value) || undefined)} /> m
    </div>
    <div class="zeile spalte">
      <span class="label">Aufbereitung</span>
      <AuswahlListe
        optionen={AUFBEREITUNG_OPTIONEN}
        wert={entwurf.aufbereitung ?? ''}
        onWahl={(w) => (entwurf!.aufbereitung = w as Aufbereitung)}
      />
    </div>
    <div class="zeile">
      <span class="label">Botanik</span>
      <div class="botanik">
        <input class="text-eingabe zahl schmal" type="text" inputmode="numeric"
          value={entwurf.botanik?.arabicaProzent ?? ''}
          onchange={(e) => botanikAendern('arabicaProzent', zahl(e))} />
        % Arabica ·
        <input class="text-eingabe zahl schmal" type="text" inputmode="numeric"
          value={entwurf.botanik?.robustaProzent ?? ''}
          onchange={(e) => botanikAendern('robustaProzent', zahl(e))} />
        % Robusta
      </div>
    </div>
  </section>

  <div class="knopfreihe">
    <button type="button" class="primaer" onclick={speichern} disabled={entwurf.name.trim() === '' || entwurf.roester.trim() === ''}>
      speichern
    </button>
    <button type="button" class="sekundaer" onclick={onZurueck}>abbrechen</button>
  </div>

  {#if fehler}
    <p class="fehler">Nicht gespeichert: {fehler} — nochmal versuchen.</p>
  {/if}
{/if}

<style>
  h2 {
    font-size: var(--fs-label);
    letter-spacing: var(--label-spacing);
    text-transform: uppercase;
    color: var(--gedaempft);
    font-weight: var(--gw-text);
    margin: 0 0 var(--r3);
  }
  .gruppe {
    margin-bottom: var(--r5);
    padding-bottom: var(--r4);
    border-bottom: 1px solid var(--linie);
  }
  .gruppe:last-of-type {
    border-bottom: none;
  }
  .zeile {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: var(--treffer);
    gap: var(--r3);
    flex-wrap: wrap;
    padding: var(--r1) 0;
  }
  .zeile.spalte {
    flex-direction: column;
    align-items: stretch;
    gap: var(--r1);
  }
  .zeile.spalte .label {
    width: auto;
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
    width: 80px;
  }
  .text-eingabe.schmal {
    width: 48px;
  }
  .botanik {
    display: flex;
    align-items: center;
    gap: var(--r1);
    font-size: var(--fs-meta);
    color: var(--satz);
  }
  .knopfreihe {
    display: flex;
    gap: var(--r3);
    margin-top: var(--r4);
  }
  .knopfreihe button {
    min-height: var(--treffer);
    padding: 0 var(--r4);
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    cursor: pointer;
    border: 1px solid var(--linie);
    background: var(--feld);
    color: var(--tinte);
  }
  .knopfreihe .primaer {
    background: var(--akzent);
    color: var(--h-papier);
    border: none;
  }
  .knopfreihe .primaer:disabled {
    opacity: 0.5;
    cursor: default;
  }
  .knopfreihe .sekundaer {
    background: transparent;
    color: var(--gedaempft);
    border: none;
  }
  .hinweis {
    color: var(--gedaempft);
    font-size: var(--fs-satz);
  }
  .fehler {
    color: var(--kritisch);
    font-size: var(--fs-satz);
    margin-top: var(--r3);
  }
</style>
