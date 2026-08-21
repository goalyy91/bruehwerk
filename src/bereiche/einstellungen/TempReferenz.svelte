<script lang="ts">
  // Temperatur-Referenz-Editor — "Dein Gerätepark" in docs/konzept.md.
  // Die Startbelegung (Kessel − 27 K, Herkunft geschätzt) steht schon in
  // stammdaten.ts. Diese Tabelle wird Zeile für Zeile ersetzt, sobald die
  // echte Messreihe da ist — als Herkunft übernommen, nicht geschätzt.

  import { bestand, schreiben } from '../bestand.svelte';
  import Einzelauswahl from '../../muster/Einzelauswahl.svelte';
  import type { Bruehgeraet, TempReferenzPunkt } from '../../daten/schema';

  const geraete = $derived(bestand.bruehgeraete.filter((b) => b.ktEinstellbar));
  let ausgewaehlteId = $state<string | undefined>(undefined);

  $effect(() => {
    if (!ausgewaehlteId && geraete.length > 0) ausgewaehlteId = geraete[0]!.id;
  });

  const geraet = $derived(geraete.find((g) => g.id === ausgewaehlteId));
  const reihe = $derived(
    geraet ? [...geraet.tempReferenz].sort((a, b) => a.kt - b.kt) : ([] as TempReferenzPunkt[]),
  );

  let neuKt = $state('');
  let neuFlush = $state('3');
  let neuGruppe = $state('');
  let neuHerkunft = $state<TempReferenzPunkt['herkunft']>('uebernommen');
  let speicherFehler = $state<string | undefined>(undefined);

  async function zeileHinzufuegen() {
    if (!geraet || neuKt === '' || neuGruppe === '') return;
    speicherFehler = undefined;
    const punkt: TempReferenzPunkt = {
      kt: Number(neuKt.replace(',', '.')),
      flush: Number(neuFlush.replace(',', '.')),
      gruppe: Number(neuGruppe.replace(',', '.')),
      herkunft: neuHerkunft,
    };
    const aktualisiert: Bruehgeraet = { ...geraet, tempReferenz: [...geraet.tempReferenz, punkt] };
    try {
      await schreiben('bruehgeraet', aktualisiert);
      neuKt = '';
      neuGruppe = '';
    } catch (fehler) {
      speicherFehler = fehler instanceof Error ? fehler.message : String(fehler);
    }
  }

  async function zeileEntfernen(index: number) {
    if (!geraet) return;
    speicherFehler = undefined;
    const rest = reihe.filter((_, i) => i !== index);
    try {
      await schreiben('bruehgeraet', { ...geraet, tempReferenz: rest });
    } catch (fehler) {
      speicherFehler = fehler instanceof Error ? fehler.message : String(fehler);
    }
  }
</script>

<h2>Temperatur-Referenz</h2>

{#if geraete.length === 0}
  <p class="hinweis">Kein Wärmetauscher-Gerät im Bestand.</p>
{:else}
  {#if geraete.length > 1}
    <Einzelauswahl
      optionen={geraete.map((g) => ({ wert: g.id, label: g.name }))}
      wert={ausgewaehlteId ?? ''}
      onWahl={(w) => (ausgewaehlteId = w)}
    />
  {/if}

  {#if reihe.length === 0}
    <p class="hinweis">keine Messreihe</p>
  {:else}
    <table>
      <thead>
        <tr><th>Kessel</th><th>Flush</th><th>Gruppe</th><th>Herkunft</th><th></th></tr>
      </thead>
      <tbody>
        {#each reihe as punkt, i (i)}
          <tr>
            <td class="zahl">{punkt.kt} °C</td>
            <td class="zahl">{punkt.flush} s</td>
            <td class="zahl" class:gedaempft={punkt.herkunft === 'geschaetzt'}>
              {punkt.herkunft === 'geschaetzt' ? `≈ ${Math.round(punkt.gruppe)}` : punkt.gruppe} °C
            </td>
            <td>{punkt.herkunft}</td>
            <td><button type="button" class="entfernen" onclick={() => zeileEntfernen(i)}>entfernen</button></td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}

  <div class="neue-zeile">
    <input type="text" inputmode="decimal" placeholder="Kessel °C" bind:value={neuKt} />
    <input type="text" inputmode="decimal" placeholder="Flush s" bind:value={neuFlush} />
    <input type="text" inputmode="decimal" placeholder="Gruppe °C" bind:value={neuGruppe} />
    <Einzelauswahl
      optionen={[
        { wert: 'uebernommen', label: 'übernommen' },
        { wert: 'gemessen', label: 'gemessen' },
        { wert: 'geschaetzt', label: 'geschätzt' },
      ]}
      wert={neuHerkunft}
      onWahl={(w) => (neuHerkunft = w as TempReferenzPunkt['herkunft'])}
    />
    <button type="button" onclick={zeileHinzufuegen} disabled={neuKt === '' || neuGruppe === ''}>hinzufügen</button>
  </div>

  {#if speicherFehler}
    <p class="fehler">Nicht gespeichert: {speicherFehler} — nochmal versuchen.</p>
  {/if}
{/if}

<style>
  h2 {
    font-size: var(--fs-label);
    letter-spacing: var(--label-spacing);
    text-transform: uppercase;
    color: var(--gedaempft);
    font-weight: var(--gw-text);
    margin: var(--r5) 0 var(--r2);
  }
  .hinweis {
    color: var(--gedaempft);
    font-size: var(--fs-satz);
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--fs-satz);
  }
  th {
    text-align: left;
    font-size: var(--fs-label);
    color: var(--gedaempft);
    font-weight: var(--gw-text);
    padding: var(--r1) var(--r2);
  }
  td {
    padding: var(--r1) var(--r2);
    border-bottom: 1px solid var(--linie-zart);
    color: var(--satz);
  }
  td.zahl {
    font-variant-numeric: var(--zahl-features);
    font-weight: var(--gw-zahl);
  }
  td.gedaempft {
    color: var(--gedaempft);
    font-weight: var(--gw-text);
  }
  .entfernen {
    background: none;
    border: none;
    color: var(--gedaempft);
    font-family: var(--schrift);
    font-size: var(--fs-meta);
    cursor: pointer;
  }
  input {
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    background: var(--feld);
    border: 1px solid var(--feld-rahmen);
    color: var(--tinte);
    padding: var(--r2);
    min-height: var(--treffer);
  }
  .neue-zeile {
    display: flex;
    flex-wrap: wrap;
    gap: var(--r2);
    margin-top: var(--r3);
  }
  .neue-zeile input {
    width: 96px;
  }
  .fehler {
    color: var(--kritisch);
    font-size: var(--fs-satz);
    margin-top: var(--r3);
  }
</style>
