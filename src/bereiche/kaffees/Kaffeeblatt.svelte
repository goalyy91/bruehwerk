<script lang="ts">
  // Das Kaffeeblatt — seit UX-2 die reine Leseansicht (K51, K61). Bearbeiten
  // ist eine eigene Route (KaffeeBearbeiten.svelte) hinter dem Stift-Symbol
  // in der Kopfzeile — vorher war jedes Feld hier direkt tippbar mit
  // Autosave, das liess sich nicht ansehen, ohne es auch zu aendern.
  //
  // Chargen bleiben hier: eine neue Charge anzulegen ist eine eigene
  // Handlung (ein neuer Datensatz), keine Aenderung an den Kaffee-Feldern —
  // die vorherige Charge wird dabei automatisch als leer markiert, ohne
  // Rueckfrage (immer genau eine offene Packung).
  //
  // UX-Korrekturrunde (Regel 2/7/8, docs/ux-regeln.md): Profile — der
  // einzige Weg zum Shot loggen, also der Alltagspfad — stehen jetzt direkt
  // unter dem Kopf statt hinter neun Stammdaten-Zeilen. Die Bohnen-
  // Stammdaten liegen hinter einem Aufklapp-Block; entkoffeiniert/aktiv sind
  // reine Verwaltungsflags und erscheinen nur, wenn sie vom Normalfall
  // (koffeinhaltig, aktiv) abweichen. Wertzeilen laufen jetzt ueber
  // Werteliste.svelte statt handgebautem CSS. "Charge anlegen" folgt jetzt
  // demselben Anlege-Muster wie "Profil anlegen" (hinter "+ …", Regel 12).

  import { bestand, schreiben } from '../bestand.svelte';
  import { SPIELRAUM_VORGABE } from '../../domain/spielraum';
  import Bohnen from '../../muster/Bohnen.svelte';
  import Sterne from '../../muster/Sterne.svelte';
  import AuswahlListe from '../../muster/AuswahlListe.svelte';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import Werteliste from '../../muster/Werteliste.svelte';
  import Knopf from '../../muster/Knopf.svelte';
  import type { Charge, Profil, Aufbereitung } from '../../daten/schema';

  let {
    kaffeeId,
    onZurueck,
    onBearbeiten,
    onOeffnenProfil,
  }: {
    kaffeeId: string;
    onZurueck: () => void;
    onBearbeiten: () => void;
    onOeffnenProfil: (profilId: string) => void;
  } = $props();

  const kaffee = $derived(bestand.kaffees.find((k) => k.id === kaffeeId));
  const chargen = $derived(bestand.chargenVon(kaffeeId));
  const profile = $derived(bestand.profileVon(kaffeeId));

  const AUFBEREITUNG_LABEL: Record<Aufbereitung, string> = {
    washed: 'Washed',
    honey: 'Honey',
    natural: 'Natural',
    anaerob: 'Anaerob',
    'wet-hulled': 'Wet-hulled',
    sonstige: 'Sonstige',
  };

  let bohneDetailsOffen = $state(false);
  let speicherFehler = $state<string | undefined>(undefined);

  let neueChargeOffen = $state(false);
  let neueChargeNummer = $state('');
  // Default: heute, im Format, das <input type="date"> erwartet (YYYY-MM-DD).
  let neuesRoestdatum = $state(new Date().toISOString().slice(0, 10));

  async function chargeAnlegen() {
    if (!kaffee || neueChargeNummer.trim() === '' || neuesRoestdatum === '') return;
    speicherFehler = undefined;
    const neue: Charge = {
      id: crypto.randomUUID(),
      kaffeeId,
      nummer: neueChargeNummer.trim(),
      // Das Roestdatum ist relevant (Frischeeinschaetzung, Vergleich im
      // Verlauf) und wird deshalb mitgegeben, nicht aus "heute" geraten.
      roestdatum: new Date(`${neuesRoestdatum}T00:00:00`).getTime(),
      leer: false,
    };
    try {
      await schreiben('charge', neue);
      if (kaffee.aktuelleChargeId) {
        const vorherige = bestand.chargen.find((c) => c.id === kaffee.aktuelleChargeId);
        if (vorherige) await schreiben('charge', { ...vorherige, leer: true });
      }
      await schreiben('kaffee', {
        ...kaffee,
        chargeIds: [...kaffee.chargeIds, neue.id],
        aktuelleChargeId: neue.id,
      });
      neueChargeOffen = false;
      neueChargeNummer = '';
      neuesRoestdatum = new Date().toISOString().slice(0, 10);
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
</script>

{#if !kaffee}
  <Kopfzeile titel="Kaffees" onZurueck={onZurueck} />
  <p class="hinweis">Kaffee nicht gefunden.</p>
{:else}
  <Kopfzeile titel={kaffee.name} onZurueck={onZurueck}>
    {#snippet aktion()}
      <button type="button" class="stift" onclick={onBearbeiten} aria-label="Kaffee bearbeiten">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 20l1-4L16 5l3 3L8 19l-4 1Z" /></svg>
      </button>
    {/snippet}
  </Kopfzeile>
  <p class="roester">
    {kaffee.roester}
    {#if kaffee.entkoffeiniert}<span class="flagge">· entkoffeiniert</span>{/if}
    {#if !kaffee.aktiv}<span class="flagge">· inaktiv</span>{/if}
  </p>

  <section class="blick">
    <div class="blick-eintrag">
      <span class="label">Röstgrad</span>
      <Bohnen stufe={kaffee.roestgrad} />
    </div>
    <div class="blick-eintrag">
      <span class="label">Bewertung</span>
      <Sterne wert={kaffee.bewertung} />
    </div>
  </section>

  <section class="gruppe">
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
        <AuswahlListe
          optionen={bestand.setups.map((s) => ({ wert: s.id, label: s.name }))}
          wert={neuesProfilSetupId}
          onWahl={(w) => (neuesProfilSetupId = w)}
        />
        <Knopf stufe="primaer" onKlick={profilAnlegen} deaktiviert={neuerProfilName.trim() === '' || neuesProfilSetupId === ''}>
          anlegen
        </Knopf>
      </div>
    {:else}
      <button type="button" class="link" onclick={() => (neuesProfilOffen = true)}>+ Profil</button>
    {/if}
  </section>

  <section class="gruppe">
    <button
      type="button"
      class="aufklappbar"
      aria-expanded={bohneDetailsOffen}
      onclick={() => (bohneDetailsOffen = !bohneDetailsOffen)}
    >
      <span>Bohne</span>
      <span class="pfeil" class:offen={bohneDetailsOffen} aria-hidden="true">▾</span>
    </button>
    {#if bohneDetailsOffen}
      <Werteliste
        zeilen={[
          { label: 'Art', wert: kaffee.art === 'blend' ? 'Blend' : 'Single Origin' },
          { label: 'Herkunft', wert: kaffee.herkunft.length > 0 ? kaffee.herkunft.join(', ') : '—' },
          { label: 'Varietät', wert: kaffee.varietaet ?? '—' },
          { label: 'Anbauhöhe', wert: kaffee.anbauhoehe !== undefined ? kaffee.anbauhoehe : '—', einheit: kaffee.anbauhoehe !== undefined ? 'm' : undefined },
          { label: 'Aufbereitung', wert: kaffee.aufbereitung ? AUFBEREITUNG_LABEL[kaffee.aufbereitung] : '—' },
          {
            label: 'Botanik',
            wert: kaffee.botanik ? `${kaffee.botanik.arabicaProzent}% Arabica · ${kaffee.botanik.robustaProzent}% Robusta` : '—',
          },
          { label: 'Röstgrad (Röster)', wert: kaffee.roestgradRoester ?? '—' },
        ]}
      />
    {/if}
  </section>

  <section class="gruppe">
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

    {#if neueChargeOffen}
      <div class="neue-charge">
        <input type="text" placeholder="Chargennummer" bind:value={neueChargeNummer} />
        <input type="date" bind:value={neuesRoestdatum} aria-label="Röstdatum" />
        <Knopf stufe="primaer" onKlick={chargeAnlegen} deaktiviert={neueChargeNummer.trim() === '' || neuesRoestdatum === ''}>
          anlegen
        </Knopf>
      </div>
    {:else}
      <button type="button" class="link" onclick={() => (neueChargeOffen = true)}>+ Charge</button>
    {/if}
  </section>

  {#if speicherFehler}
    <p class="fehler">Nicht gespeichert: {speicherFehler} — nochmal versuchen.</p>
  {/if}
{/if}

<style>
  .stift {
    width: var(--treffer);
    height: var(--treffer);
    margin-right: calc(var(--r2) * -1);
    border: none;
    background: none;
    color: var(--akzent);
    cursor: pointer;
  }
  .stift svg {
    width: var(--symbol-tab);
    height: var(--symbol-tab);
  }
  .roester {
    font-size: var(--fs-satz);
    color: var(--gedaempft);
    margin: 0 0 var(--r4);
  }
  .flagge {
    color: var(--gedaempft);
  }
  h2 {
    font-size: var(--fs-label);
    letter-spacing: var(--label-spacing);
    text-transform: uppercase;
    color: var(--gedaempft);
    font-weight: var(--gw-text);
    margin: 0 0 var(--r2);
  }
  .blick {
    display: flex;
    gap: var(--r6);
    padding: var(--r3) 0 var(--r4);
    margin-bottom: var(--r4);
    border-bottom: 1px solid var(--linie);
  }
  .blick-eintrag {
    display: flex;
    flex-direction: column;
    gap: var(--r1);
  }
  .blick-eintrag .label {
    font-size: var(--fs-label);
    letter-spacing: var(--label-spacing);
    text-transform: uppercase;
    color: var(--gedaempft);
  }
  .gruppe {
    margin-bottom: var(--r5);
  }
  .aufklappbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-height: var(--treffer);
    padding: 0;
    margin-bottom: var(--r2);
    border: none;
    background: transparent;
    color: var(--gedaempft);
    font-family: var(--schrift);
    font-size: var(--fs-label);
    letter-spacing: var(--label-spacing);
    text-transform: uppercase;
    text-align: left;
    cursor: pointer;
  }
  .aufklappbar .pfeil {
    transition: transform var(--t-auswahl) var(--e-rein);
  }
  .aufklappbar .pfeil.offen {
    transform: rotate(180deg);
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
    min-height: var(--treffer);
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
  .neue-charge input[type='text'],
  .neue-charge input[type='date'] {
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    background: var(--feld);
    border: 1px solid var(--feld-rahmen);
    color: var(--tinte);
    padding: var(--r2);
    min-height: var(--treffer);
    flex: 1;
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
    flex-direction: column;
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
