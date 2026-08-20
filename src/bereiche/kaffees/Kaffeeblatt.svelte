<script lang="ts">
  // Das Kaffeeblatt — K51, K61. Eigenschaften stehen direkt unter dem
  // Titel, der Untertitel traegt nur den Roester. Die Charge wird am
  // selben Blatt angelegt, nicht in einem eigenen Bereich.

  import { bestand, schreiben } from '../bestand.svelte';
  import Bohnen from '../../muster/Bohnen.svelte';
  import Sterne from '../../muster/Sterne.svelte';
  import type { Kaffee, Charge } from '../../daten/schema';

  let { kaffeeId, onZurueck }: { kaffeeId: string; onZurueck: () => void } = $props();

  const kaffee = $derived(bestand.kaffees.find((k) => k.id === kaffeeId));
  const chargen = $derived(bestand.chargenVon(kaffeeId));

  const FORMAT_HOEHE = new Intl.NumberFormat('de-DE');

  let speicherFehler = $state<string | undefined>(undefined);
  let neueChargeNummer = $state('');
  let vorherigeLeer = $state(true);

  async function feldSpeichern<K extends keyof Kaffee>(feld: K, wert: Kaffee[K]) {
    if (!kaffee) return;
    speicherFehler = undefined;
    try {
      await schreiben('kaffee', { ...kaffee, [feld]: wert });
    } catch (fehler) {
      speicherFehler = fehler instanceof Error ? fehler.message : String(fehler);
    }
  }

  async function chargeAnlegen() {
    if (!kaffee || neueChargeNummer.trim() === '') return;
    speicherFehler = undefined;
    const neue: Charge = {
      id: crypto.randomUUID(),
      kaffeeId,
      nummer: neueChargeNummer.trim(),
      roestdatum: Date.now(),
      leer: false,
    };
    try {
      await schreiben('charge', neue);
      if (vorherigeLeer && kaffee.aktuelleChargeId) {
        const vorherige = bestand.chargen.find((c) => c.id === kaffee.aktuelleChargeId);
        if (vorherige) await schreiben('charge', { ...vorherige, leer: true });
      }
      await schreiben('kaffee', {
        ...kaffee,
        chargeIds: [...kaffee.chargeIds, neue.id],
        aktuelleChargeId: neue.id,
      });
      neueChargeNummer = '';
    } catch (fehler) {
      speicherFehler = fehler instanceof Error ? fehler.message : String(fehler);
    }
  }
</script>

<button type="button" class="zurueck" onclick={onZurueck}>‹ Kaffees</button>

{#if !kaffee}
  <p class="hinweis">Kaffee nicht gefunden.</p>
{:else}
  <h1>{kaffee.name}</h1>
  <p class="roester">{kaffee.roester}</p>

  <section class="eigenschaften">
    <div class="zeile"><span class="label">Röstgrad</span><Bohnen stufe={kaffee.roestgrad} /></div>
    <div class="zeile"><span class="label">Bewertung</span><Sterne wert={kaffee.bewertung} /></div>
    <div class="zeile">
      <span class="label">Art</span>
      <span class="wert">{kaffee.art === 'blend' ? 'Blend' : 'Single Origin'}</span>
    </div>
    <div class="zeile">
      <span class="label">Herkunft</span>
      <span class="wert">{kaffee.herkunft.length > 0 ? kaffee.herkunft.join(', ') : '—'}</span>
    </div>
    {#if kaffee.varietaet}
      <div class="zeile"><span class="label">Varietät</span><span class="wert">{kaffee.varietaet}</span></div>
    {/if}
    {#if kaffee.anbauhoehe}
      <div class="zeile">
        <span class="label">Anbauhöhe</span>
        <span class="wert zahl">{FORMAT_HOEHE.format(kaffee.anbauhoehe)} m</span>
      </div>
    {/if}
    {#if kaffee.aufbereitung}
      <div class="zeile"><span class="label">Aufbereitung</span><span class="wert">{kaffee.aufbereitung}</span></div>
    {/if}
    <div class="zeile">
      <span class="label">Koffein</span>
      <label class="schalter">
        <input
          type="checkbox"
          checked={kaffee.entkoffeiniert}
          onchange={(e) => feldSpeichern('entkoffeiniert', e.currentTarget.checked)}
        />
        entkoffeiniert
      </label>
    </div>
    <div class="zeile">
      <span class="label">Status</span>
      <select value={kaffee.status ?? ''} onchange={(e) => feldSpeichern('status', e.currentTarget.value as Kaffee['status'])}>
        <option value="">—</option>
        <option value="offen">offen</option>
        <option value="angebrochen">angebrochen</option>
        <option value="leer">leer</option>
      </select>
    </div>
  </section>

  <section class="chargen">
    <h2>Chargen</h2>
    {#if chargen.length === 0}
      <p class="hinweis">keine</p>
    {:else}
      <ul class="chargenliste">
        {#each chargen as charge (charge.id)}
          <li class:aktuelle={charge.id === kaffee.aktuelleChargeId} class:leer={charge.leer}>
            <span class="nummer">{charge.nummer}</span>
            <span class="datum">{new Date(charge.roestdatum).toLocaleDateString('de-DE')}</span>
            {#if charge.leer}<span class="markiert">leer</span>{/if}
          </li>
        {/each}
      </ul>
    {/if}

    <div class="neue-charge">
      <input type="text" placeholder="Chargennummer" bind:value={neueChargeNummer} />
      <label class="schalter">
        <input type="checkbox" bind:checked={vorherigeLeer} />
        vorherige als leer markieren
      </label>
      <button type="button" onclick={chargeAnlegen} disabled={neueChargeNummer.trim() === ''}>anlegen</button>
    </div>
  </section>

  {#if speicherFehler}
    <p class="fehler">Nicht gespeichert: {speicherFehler} — nochmal versuchen.</p>
  {/if}
{/if}

<style>
  .zurueck {
    background: none;
    border: none;
    color: var(--akzent);
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    padding: var(--r2) 0;
    min-height: var(--treffer);
    cursor: pointer;
  }
  h1 {
    font-size: var(--fs-titel);
    font-weight: var(--gw-titel);
    margin: 0;
  }
  .roester {
    font-size: var(--fs-satz);
    color: var(--gedaempft);
    margin: 0 0 var(--r4);
  }
  h2 {
    font-size: var(--fs-label);
    letter-spacing: var(--label-spacing);
    text-transform: uppercase;
    color: var(--gedaempft);
    font-weight: var(--gw-text);
    margin: var(--r5) 0 var(--r2);
  }
  .eigenschaften {
    display: flex;
    flex-direction: column;
  }
  .zeile {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: var(--treffer);
    border-bottom: 1px solid var(--linie);
    gap: var(--r3);
  }
  .label {
    width: var(--eigenschaftslabel);
    flex-shrink: 0;
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  .wert {
    font-size: var(--fs-satz);
    color: var(--satz);
    text-align: right;
  }
  .schalter {
    display: flex;
    align-items: center;
    gap: var(--r1);
    font-size: var(--fs-meta);
    color: var(--satz);
  }
  select {
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    background: var(--feld);
    border: 1px solid var(--feld-rahmen);
    color: var(--tinte);
    padding: var(--r1) var(--r2);
  }
  .chargenliste {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .chargenliste li {
    display: flex;
    gap: var(--r3);
    align-items: center;
    min-height: 40px;
    border-bottom: 1px solid var(--linie-zart);
    font-size: var(--fs-satz);
    color: var(--satz);
  }
  .chargenliste li.leer {
    color: var(--gedaempft);
  }
  .chargenliste li.aktuelle .nummer {
    font-weight: var(--gw-titel);
    color: var(--tinte);
  }
  .datum {
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  .markiert {
    font-size: var(--fs-label);
    color: var(--gedaempft);
  }
  .neue-charge {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--r3);
    margin-top: var(--r3);
  }
  .neue-charge input[type='text'] {
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    background: var(--feld);
    border: 1px solid var(--feld-rahmen);
    color: var(--tinte);
    padding: var(--r2);
    min-height: var(--treffer);
    flex: 1;
  }
  button {
    min-height: var(--treffer);
    padding: 0 var(--r4);
    background: var(--akzent);
    color: var(--h-papier);
    border: none;
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    cursor: pointer;
  }
  button:disabled {
    opacity: 0.5;
    cursor: default;
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
