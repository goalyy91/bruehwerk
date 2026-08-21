<script lang="ts">
  // Das Kaffeeblatt — K51, K61. Eigenschaften stehen direkt unter dem
  // Titel, der Untertitel traegt nur den Roester. Die Charge wird am
  // selben Blatt angelegt, nicht in einem eigenen Bereich.
  //
  // Korrekturrunde (Teil B): alle strukturierten Eigenschaften aus dem
  // Datenmodell sind jetzt eingebbar, nicht nur anzeigbar — CLAUDE.md
  // sagt ausdruecklich "Das Kaffeeblatt (Paket 03, K51) traegt sie nach",
  // weil die Migration sie nicht liefert. Auswahlfelder ueber
  // Einzelauswahl/Schalter statt nativer Elemente (Teil E).

  import { bestand, schreiben } from '../bestand.svelte';
  import { SPIELRAUM_VORGABE } from '../../domain/spielraum';
  import Bohnen from '../../muster/Bohnen.svelte';
  import Sterne from '../../muster/Sterne.svelte';
  import Einzelauswahl from '../../muster/Einzelauswahl.svelte';
  import Schalter from '../../muster/Schalter.svelte';
  import type { Kaffee, Charge, Profil, Aufbereitung } from '../../daten/schema';

  let {
    kaffeeId,
    onZurueck,
    onOeffnenProfil,
  }: { kaffeeId: string; onZurueck: () => void; onOeffnenProfil: (profilId: string) => void } = $props();

  const kaffee = $derived(bestand.kaffees.find((k) => k.id === kaffeeId));
  const chargen = $derived(bestand.chargenVon(kaffeeId));
  const profile = $derived(bestand.profileVon(kaffeeId));

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

  function herkunftAendern(text: string) {
    const laender = text
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    void feldSpeichern('herkunft', laender);
  }

  async function botanikAendern(feld: 'arabicaProzent' | 'robustaProzent', wert: number) {
    if (!kaffee) return;
    const basis = kaffee.botanik ?? { arabicaProzent: 100, robustaProzent: 0 };
    await feldSpeichern('botanik', { ...basis, [feld]: wert });
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

  let neuesProfilOffen = $state(false);
  let neuerProfilName = $state('');
  let neuesProfilSetupId = $state('');

  async function profilAnlegen() {
    if (!kaffee || neuerProfilName.trim() === '' || neuesProfilSetupId === '') return;
    speicherFehler = undefined;
    const neu: Profil = {
      id: crypto.randomUUID(),
      kaffeeId,
      setupId: neuesProfilSetupId,
      name: neuerProfilName.trim(),
      standard: profile.length === 0,
      // Startwerte sind bewusst 0/leer — kein Platzhalter, der wie eine
      // Messung aussieht. Der Dial-in traegt sie ein.
      ziel: { input: 18, mg: 0, output: 36, zeit: 30 },
      spielraum: SPIELRAUM_VORGABE,
      modus: 'dialin',
    };
    try {
      await schreiben('profil', neu);
      neuesProfilOffen = false;
      neuerProfilName = '';
      neuesProfilSetupId = '';
      onOeffnenProfil(neu.id);
    } catch (fehler) {
      speicherFehler = fehler instanceof Error ? fehler.message : String(fehler);
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

<button type="button" class="zurueck" onclick={onZurueck}>‹ Kaffees</button>

{#if !kaffee}
  <p class="hinweis">Kaffee nicht gefunden.</p>
{:else}
  <h1>{kaffee.name}</h1>
  <p class="roester">{kaffee.roester}</p>

  <section class="eigenschaften">
    <div class="zeile">
      <span class="label">Röstgrad</span>
      <Bohnen stufe={kaffee.roestgrad} onWahl={(s) => feldSpeichern('roestgrad', s)} />
    </div>
    <div class="zeile">
      <span class="label">Bewertung</span>
      <Sterne wert={kaffee.bewertung} onWahl={(w) => feldSpeichern('bewertung', w)} />
    </div>
    <div class="zeile">
      <span class="label">Art</span>
      <Einzelauswahl
        optionen={[
          { wert: 'single', label: 'Single Origin' },
          { wert: 'blend', label: 'Blend' },
        ]}
        wert={kaffee.art}
        onWahl={(w) => feldSpeichern('art', w as Kaffee['art'])}
      />
    </div>
    <div class="zeile">
      <span class="label">Herkunft</span>
      <input class="text-eingabe" type="text" placeholder="Land, Land …"
        value={kaffee.herkunft.join(', ')} onchange={(e) => herkunftAendern((e.currentTarget as HTMLInputElement).value)} />
    </div>
    <div class="zeile">
      <span class="label">Varietät</span>
      <input class="text-eingabe" type="text" value={kaffee.varietaet ?? ''}
        onchange={(e) => feldSpeichern('varietaet', (e.currentTarget as HTMLInputElement).value || undefined)} />
    </div>
    <div class="zeile">
      <span class="label">Anbauhöhe</span>
      <input class="text-eingabe zahl" type="text" inputmode="numeric" value={kaffee.anbauhoehe ?? ''}
        onchange={(e) => feldSpeichern('anbauhoehe', Number((e.currentTarget as HTMLInputElement).value) || undefined)} /> m
    </div>
    <div class="zeile">
      <span class="label">Aufbereitung</span>
      <Einzelauswahl
        optionen={AUFBEREITUNG_OPTIONEN}
        wert={kaffee.aufbereitung ?? ''}
        onWahl={(w) => feldSpeichern('aufbereitung', w as Aufbereitung)}
      />
    </div>
    <div class="zeile">
      <span class="label">Botanik</span>
      <div class="botanik">
        <input class="text-eingabe zahl schmal" type="text" inputmode="numeric"
          value={kaffee.botanik?.arabicaProzent ?? ''}
          onchange={(e) => botanikAendern('arabicaProzent', Number((e.currentTarget as HTMLInputElement).value))} />
        % Arabica ·
        <input class="text-eingabe zahl schmal" type="text" inputmode="numeric"
          value={kaffee.botanik?.robustaProzent ?? ''}
          onchange={(e) => botanikAendern('robustaProzent', Number((e.currentTarget as HTMLInputElement).value))} />
        % Robusta
      </div>
    </div>
    <div class="zeile">
      <span class="label">Röstgrad (Röster)</span>
      <input class="text-eingabe" type="text" value={kaffee.roestgradRoester ?? ''}
        onchange={(e) => feldSpeichern('roestgradRoester', (e.currentTarget as HTMLInputElement).value || undefined)} />
    </div>
    <div class="zeile">
      <Schalter label="entkoffeiniert" an={kaffee.entkoffeiniert} onWahl={(a) => feldSpeichern('entkoffeiniert', a)} />
    </div>
    <div class="zeile">
      <span class="label">Status</span>
      <Einzelauswahl
        optionen={[
          { wert: 'offen', label: 'offen' },
          { wert: 'angebrochen', label: 'angebrochen' },
          { wert: 'leer', label: 'leer' },
        ]}
        wert={kaffee.status ?? ''}
        onWahl={(w) => feldSpeichern('status', w as Kaffee['status'])}
      />
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
      <Schalter label="vorherige als leer markieren" an={vorherigeLeer} onWahl={(a) => (vorherigeLeer = a)} />
      <button type="button" onclick={chargeAnlegen} disabled={neueChargeNummer.trim() === ''}>anlegen</button>
    </div>
  </section>

  <section class="profile">
    <h2>Profile</h2>
    {#if profile.length === 0}
      <p class="hinweis">keine</p>
    {:else}
      <ul class="profilliste">
        {#each profile as profilEintrag (profilEintrag.id)}
          <li>
            <button type="button" class="profilzeile" onclick={() => onOeffnenProfil(profilEintrag.id)}>
              <span class="name">{profilEintrag.name}</span>
              <span class="meta">{profilEintrag.modus === 'dialin' ? 'Dial-in' : 'eingefahren'}</span>
            </button>
          </li>
        {/each}
      </ul>
    {/if}

    {#if neuesProfilOffen}
      <div class="neues-profil">
        <input type="text" placeholder="Profilname" bind:value={neuerProfilName} />
        <Einzelauswahl
          optionen={bestand.setups.map((s) => ({ wert: s.id, label: s.name }))}
          wert={neuesProfilSetupId}
          onWahl={(w) => (neuesProfilSetupId = w)}
        />
        <button type="button" onclick={profilAnlegen} disabled={neuerProfilName.trim() === '' || neuesProfilSetupId === ''}>
          anlegen
        </button>
      </div>
    {:else}
      <button type="button" class="link" onclick={() => (neuesProfilOffen = true)}>+ Profil</button>
    {/if}
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
    flex-wrap: wrap;
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
  .profilliste {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .profilzeile {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-height: var(--treffer);
    border: none;
    border-bottom: 1px solid var(--linie-zart);
    background: transparent;
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    color: var(--tinte);
    text-align: left;
    cursor: pointer;
  }
  .profilzeile .meta {
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  .neues-profil {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--r3);
    margin-top: var(--r3);
  }
  .neues-profil input[type='text'] {
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    background: var(--feld);
    border: 1px solid var(--feld-rahmen);
    color: var(--tinte);
    padding: var(--r2);
    min-height: var(--treffer);
  }
  .link {
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
  .fehler {
    color: var(--kritisch);
    font-size: var(--fs-satz);
    margin-top: var(--r3);
  }
</style>
