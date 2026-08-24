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
  // (koffeinhaltig, aktiv) abweichen. "Charge anlegen" folgt jetzt demselben
  // Anlege-Muster wie "Profil anlegen" (hinter "+ …", Regel 12). Bohne-
  // Details liefen zwischenzeitlich ueber Werteliste.svelte, seit
  // Rueckmeldung 2026-08-24 als eigene Detailzeilen im selben Panel wie die
  // "Bohne"-Falte (siehe dort) — Werteliste betont Werte staerker als ihre
  // Beschriftung, richtig fuer Messwerte, nicht fuer Textmerkmale.
  //
  // Visueller Redesign-Reset, Paket 2 (Handoff Abschnitt 6 "Kaffeeblatt"):
  // Kopfzeile im gross-Modus (30-32/600 zweizeilig), Röstgrad/Bewertung in
  // einer Blattzeile mit senkrechter Haarlinie statt zwei Feldern
  // nebeneinander, Profile/Chargen als Blattpanel mit Zeilen statt Liste
  // mit Haarlinie-Trennung. Kein Muster fuer "Blatt mit navigierbaren
  // Zeilen" existiert bisher zentral (siehe
  // docs/design/offene-punkte-redesign.md) — deshalb lokales CSS statt
  // Nachbau eines bereits vorhandenen Bausteins. Alle Felder, Reihenfolge,
  // Zustaende (aktuelle/leer bei Chargen) und Handlungen unveraendert.

  import { bestand, schreiben } from '../bestand.svelte';
  import { SPIELRAUM_VORGABE } from '../../domain/spielraum';
  import Bohnen from '../../muster/Bohnen.svelte';
  import Sterne from '../../muster/Sterne.svelte';
  import AuswahlListe from '../../muster/AuswahlListe.svelte';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
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

  // Rueckmeldung 2026-08-24: Bohne-Details standen bisher als Werteliste da
  // (Wert 19/500 — groesser/fetter als die Beschriftung, gedacht fuer
  // gemessene Zahlen wie Spielraum/Gruppen). Hier sind es aber ueberwiegend
  // Textmerkmale (Aufbereitung, Botanik, …), keine Messwerte — deshalb jetzt
  // Zeilen im selben Panel wie die "Bohne"-Falte, Wert in derselben
  // Schriftstaerke wie die Beschriftung, kein eigenes Kachel-Set (das haette
  // fuer sieben ueberwiegend textuelle Merkmale eher aufgeblaeht als
  // geklaert).
  const bohneDetails = $derived.by(() => {
    if (!kaffee) return [];
    return [
      { label: 'Art', wert: kaffee.art === 'blend' ? 'Blend' : 'Single Origin' },
      { label: 'Herkunft', wert: kaffee.herkunft.length > 0 ? kaffee.herkunft.join(', ') : '—' },
      { label: 'Varietät', wert: kaffee.varietaet ?? '—' },
      { label: 'Anbauhöhe', wert: kaffee.anbauhoehe !== undefined ? `${kaffee.anbauhoehe} m` : '—' },
      { label: 'Aufbereitung', wert: kaffee.aufbereitung ? AUFBEREITUNG_LABEL[kaffee.aufbereitung] : '—' },
      {
        label: 'Botanik',
        wert: kaffee.botanik ? `${kaffee.botanik.arabicaProzent}% Arabica · ${kaffee.botanik.robustaProzent}% Robusta` : '—',
      },
      { label: 'Röstgrad (Röster)', wert: kaffee.roestgradRoester ?? '—' },
    ];
  });

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
  <Kopfzeile titel={kaffee.name} onZurueck={onZurueck} gross>
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
    <div class="blick-trenner" aria-hidden="true"></div>
    <div class="blick-eintrag">
      <span class="label">Bewertung</span>
      <Sterne wert={kaffee.bewertung} />
    </div>
  </section>

  <section class="gruppe">
    <h2>Profile</h2>
    <div class="panel">
      {#if profile.length === 0}
        <p class="hinweis-panel">keine</p>
      {:else}
        {#each profile as profilEintrag (profilEintrag.id)}
          <button type="button" class="listenzeile" onclick={() => onOeffnenProfil(profilEintrag.id)}>
            <span class="badge" aria-hidden="true">
              <svg viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M4 8h9v5a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z" /><path d="M13 9.5h1.8a1.8 1.8 0 0 1 0 3.6H13" /><path d="M4.5 18.5h10" /></svg>
            </span>
            <span class="name">{profilEintrag.name}</span>
            <span class="meta">{profilEintrag.modus === 'dialin' ? 'Dial-in' : 'eingefahren'}</span>
            <span class="chevron" aria-hidden="true">›</span>
          </button>
        {/each}
      {/if}

      {#if neuesProfilOffen}
        <div class="anlage">
          <input type="text" class="text-eingabe" placeholder="Profilname" bind:value={neuerProfilName} />
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
        <button type="button" class="anlegen-zeile" onclick={() => (neuesProfilOffen = true)}>+ Profil</button>
      {/if}
    </div>
  </section>

  <section class="gruppe">
    <div class="panel">
      <button
        type="button"
        class="falte"
        aria-expanded={bohneDetailsOffen}
        onclick={() => (bohneDetailsOffen = !bohneDetailsOffen)}
      >
        <span class="falte-label">Bohne</span>
        <span class="pfeil" class:offen={bohneDetailsOffen} aria-hidden="true">▾</span>
      </button>
      {#if bohneDetailsOffen}
        {#each bohneDetails as feld (feld.label)}
          <div class="detailzeile">
            <span class="detail-label">{feld.label}</span>
            <span class="detail-wert">{feld.wert}</span>
          </div>
        {/each}
      {/if}
    </div>
  </section>

  <section class="gruppe">
    <h2>Chargen</h2>
    <div class="panel">
      {#if chargen.length === 0}
        <p class="hinweis-panel">keine</p>
      {:else}
        {#each chargen as charge (charge.id)}
          <div class="chargenzeile" class:aktuelle={charge.id === kaffee.aktuelleChargeId} class:leer={charge.leer}>
            <span class="nummer">{charge.nummer}</span>
            <span class="datum zahl">{new Date(charge.roestdatum).toLocaleDateString('de-DE')}</span>
            {#if charge.leer}<span class="markiert">leer</span>{/if}
          </div>
        {/each}
      {/if}

      {#if neueChargeOffen}
        <div class="anlage">
          <input type="text" class="text-eingabe" placeholder="Chargennummer" bind:value={neueChargeNummer} />
          <input type="date" class="text-eingabe" bind:value={neuesRoestdatum} aria-label="Röstdatum" />
          <Knopf stufe="primaer" onKlick={chargeAnlegen} deaktiviert={neueChargeNummer.trim() === '' || neuesRoestdatum === ''}>
            anlegen
          </Knopf>
        </div>
      {:else}
        <button type="button" class="anlegen-zeile" onclick={() => (neueChargeOffen = true)}>+ Charge</button>
      {/if}
    </div>
  </section>

  {#if speicherFehler}
    <p class="fehler">Nicht gespeichert: {speicherFehler} — nochmal versuchen.</p>
  {/if}
{/if}

<style>
  /* Kopfzeile-Aktion (Stift): runder Knopf auf Blattflaeche, gleiche
     Sprache wie der Rueckweg-Knopf in Kopfzeile.svelte selbst — beide
     stehen im gross-Modus in derselben Zeile. */
  .stift {
    width: var(--r-knopf-rund);
    height: var(--r-knopf-rund);
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 50%;
    background: var(--blatt);
    color: var(--akzent);
    cursor: pointer;
  }
  .stift svg {
    width: 16px;
    height: 16px;
  }
  .roester {
    font-size: 15px;
    color: var(--akzent);
    margin: 0 0 var(--seitenrand);
  }
  .flagge {
    color: var(--gedaempft);
  }
  /* h2-Basistypografie kommt aus tokens.css (global) — hier nur der lokale
     margin (Regel: lokale Ueberschreibung darf nur margin setzen). Bis
     2026-08-24 dupliziert, dabei sogar mit falschem font-family (Serif
     statt Sans) — Konsistenzfund im Zuge dieser Rueckmeldungsrunde. */
  h2 {
    margin: 0 0 var(--r-kachelabstand);
  }
  /* Roestgrad | Bewertung in einer Blattzeile mit senkrechter Haarlinie
     dazwischen (Handoff 3.5: "senkrechte Haarlinie nur zwischen zwei
     Werteblöcken"). */
  .blick {
    display: flex;
    align-items: center;
    gap: var(--seitenrand);
    padding: var(--r4);
    margin-bottom: var(--seitenrand);
    background: var(--blatt);
    border-radius: var(--r-blatt);
  }
  .blick-eintrag {
    display: flex;
    flex-direction: column;
    gap: var(--r-kachelabstand);
  }
  .blick-eintrag .label {
    font-family: var(--schrift-sans);
    font-size: var(--fs-gruppenkopf);
    letter-spacing: var(--label-spacing);
    text-transform: uppercase;
    color: var(--gedaempft);
  }
  .blick-trenner {
    align-self: stretch;
    width: 1px;
    background: var(--linie);
  }
  .gruppe {
    margin-bottom: var(--seitenrand);
  }
  /* Blatt mit Zeilen — Profile, Bohne-Falte, Chargen. Radius 20 (Handoff
     3.4 "Blatt"), horizontales Innenpolster 18, Zeilenhoehe je Zeilenart;
     jede Zeile ausser der ersten bekommt eine Haarlinie darueber. Kein
     zentrales Muster fuer diese Form existiert bisher (siehe
     docs/design/offene-punkte-redesign.md, Punkt 1). */
  .panel {
    background: var(--blatt);
    border-radius: var(--r-blatt);
    padding: 0 var(--r4);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .panel > :not(:first-child) {
    border-top: 1px solid var(--linie);
  }
  .hinweis-panel {
    color: var(--gedaempft);
    font-size: var(--fs-satz);
    padding: var(--r3) 0;
    margin: 0;
  }
  .listenzeile {
    display: flex;
    align-items: center;
    gap: var(--r4);
    min-height: 66px;
    border: none;
    background: transparent;
    font-family: var(--schrift);
    text-align: left;
    cursor: pointer;
  }
  .badge {
    flex: none;
    width: var(--r-knopf-rund);
    height: var(--r-knopf-rund);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--badge);
    color: var(--akzent);
  }
  .badge svg {
    width: 18px;
    height: 18px;
  }
  .listenzeile .name {
    flex: 1;
    font-size: var(--fs-bedienwort);
    color: var(--tinte);
  }
  .listenzeile .meta {
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  .chevron {
    color: var(--spur);
    font-size: var(--fs-bedienwort);
  }
  .anlegen-zeile {
    display: flex;
    align-items: center;
    min-height: 56px;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--akzent);
    font-family: var(--schrift);
    font-size: var(--fs-bedienwort);
    text-align: left;
    cursor: pointer;
  }
  .falte {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-height: 58px;
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
  }
  .falte-label {
    font-family: var(--schrift-sans);
    font-size: var(--fs-gruppenkopf);
    letter-spacing: var(--label-spacing);
    text-transform: uppercase;
    color: var(--gedaempft);
  }
  .falte .pfeil {
    color: var(--spur);
    transition: transform var(--t-auswahl) var(--e-rein);
  }
  .falte .pfeil.offen {
    transform: rotate(180deg);
  }
  .detailzeile {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--r3);
    min-height: 52px;
  }
  .detail-label {
    font-size: var(--fs-bedienwort);
    color: var(--satz);
  }
  .detail-wert {
    font-size: var(--fs-bedienwort);
    color: var(--tinte);
    text-align: right;
  }
  .chargenzeile {
    display: flex;
    align-items: center;
    gap: var(--r3);
    min-height: 60px;
    font-size: var(--fs-bedienwort);
    color: var(--tinte);
  }
  .chargenzeile.leer {
    color: var(--gedaempft);
  }
  .chargenzeile .nummer {
    flex: 1;
  }
  .chargenzeile.aktuelle .nummer {
    /* Rueckmeldung 2026-08-24: nicht mehr fett — "aktuelle" haebt sich ueber
       die Akzentfarbe ab, nicht mehr ueber Schriftgewicht. */
    color: var(--akzent);
  }
  .chargenzeile .datum {
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  .chargenzeile .markiert {
    font-family: var(--schrift-sans);
    font-size: var(--fs-label);
    color: var(--gedaempft);
  }
  .anlage {
    display: flex;
    flex-direction: column;
    gap: var(--r3);
    padding: var(--r3) 0;
  }
  .text-eingabe {
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    background: var(--vertiefung);
    border: none;
    border-radius: var(--r-wertfeld);
    color: var(--tinte);
    padding: var(--r2) var(--r3);
    min-height: var(--treffer);
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
