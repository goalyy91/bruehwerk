<script lang="ts">
  // Setupblatt — Teil G der Korrekturrunde. ablaufId bleibt fest auf
  // ABLAUF_LEER: Ablauf ist reines, oberflaechenloses Rechenmodell (K48),
  // die echten Ruestzeiten-Buendel spezifiziert erst der Planer (Paket 06).
  //
  // parallelSchaeumen/sammelSchaeumen/Begruendungsschalter sind hier raus —
  // "Setup" meinte an diesen Konzeptstellen allgemeine Einstellungen, nicht
  // diese Geraete-Kombination. Stehen jetzt global in Einstellungen.svelte.
  //
  // UX-Korrekturrunde: Loeschen ist raus (jetzt in SetupAnsicht.svelte, ueber
  // Kontextmenue) — "speichern" ist damit die einzige Aktion auf diesem
  // Blatt (Regel 3). Mühle/Brühgerät laufen jetzt über AuswahlListe statt
  // Einzelauswahl — freie Geräte-Namen, keine feste kurze Optionsmenge
  // (Regel 5, AuswahlListe.svelte nennt "Setup-Auswahl mit freien Namen"
  // wörtlich als ihren Fall).
  //
  // Visueller Redesign-Reset, Paket 4: Formularzeilen/Textfeld ueber die
  // globalen Utilities aus tokens.css (.formularzeile, .eingabefeld-text).

  import { untrack } from 'svelte';
  import { bestand, schreiben } from '../bestand.svelte';
  import { ABLAUF_LEER } from '../../daten/stammdaten';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import AuswahlListe from '../../muster/AuswahlListe.svelte';
  import Knopf from '../../muster/Knopf.svelte';
  import type { Setup } from '../../daten/schema';

  let {
    setupId,
    onZurueck,
  }: {
    setupId?: string;
    onZurueck: () => void;
  } = $props();

  const bestehend = $derived(setupId ? bestand.setups.find((s) => s.id === setupId) : undefined);

  function leererEntwurf(): Setup {
    return {
      id: crypto.randomUUID(),
      name: '',
      muehleId: bestand.muehlen[0]?.id ?? '',
      bruehgeraetId: bestand.bruehgeraete[0]?.id ?? '',
      zubehoerIds: [],
      ablaufId: ABLAUF_LEER.id,
    };
  }

  // $state.snapshot() statt structuredClone(): bestehend ist ein Svelte-
  // reaktives Objekt — structuredClone scheitert am Array-Feld
  // (zubehoerIds) mit "could not be cloned" (gefunden beim
  // Kaffee-Bearbeiten-Formular, dasselbe Muster).
  let entwurf = $state<Setup>(untrack(() => (bestehend ? $state.snapshot(bestehend) : leererEntwurf())));
  let fehler = $state<string | undefined>(undefined);

  async function speichern() {
    fehler = undefined;
    try {
      await schreiben('setup', entwurf);
      onZurueck();
    } catch (e) {
      fehler = e instanceof Error ? e.message : String(e);
    }
  }
</script>

<Kopfzeile titel={bestehend ? 'Setup bearbeiten' : 'Neues Setup'} {onZurueck} />

{#if bestand.muehlen.length === 0 || bestand.bruehgeraete.length === 0}
  <p class="hinweis">Erst eine Mühle und ein Brühgerät anlegen.</p>
{:else}
  <div class="formularzeile">
    <span class="formularzeile-label">Name</span>
    <input class="eingabefeld-text" type="text" bind:value={entwurf.name} />
  </div>
  <div class="formularzeile spalte">
    <span class="formularzeile-label">Mühle</span>
    <AuswahlListe
      optionen={bestand.muehlen.map((m) => ({ wert: m.id, label: m.name }))}
      wert={entwurf.muehleId}
      onWahl={(w) => (entwurf.muehleId = w)}
    />
  </div>
  <div class="formularzeile spalte">
    <span class="formularzeile-label">Brühgerät</span>
    <AuswahlListe
      optionen={bestand.bruehgeraete.map((b) => ({ wert: b.id, label: b.name }))}
      wert={entwurf.bruehgeraetId}
      onWahl={(w) => (entwurf.bruehgeraetId = w)}
    />
  </div>

  <div class="knopfreihe">
    <Knopf stufe="primaer" onKlick={speichern} deaktiviert={entwurf.name.trim() === ''}>
      {bestehend ? 'speichern' : 'anlegen'}
    </Knopf>
  </div>
{/if}

{#if fehler}
  <p class="fehler">Nicht gespeichert: {fehler}</p>
{/if}

<style>
  .hinweis {
    color: var(--gedaempft);
    font-size: var(--fs-satz);
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
