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
  <div class="feld-zeile">
    <span class="label">Name</span>
    <input class="text-eingabe" type="text" bind:value={entwurf.name} />
  </div>
  <div class="feld-zeile spalte">
    <span class="label">Mühle</span>
    <AuswahlListe
      optionen={bestand.muehlen.map((m) => ({ wert: m.id, label: m.name }))}
      wert={entwurf.muehleId}
      onWahl={(w) => (entwurf.muehleId = w)}
    />
  </div>
  <div class="feld-zeile spalte">
    <span class="label">Brühgerät</span>
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
  .feld-zeile {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--r3);
    min-height: var(--treffer);
    border-bottom: 1px solid var(--linie);
    padding: var(--r1) 0;
  }
  .feld-zeile.spalte {
    flex-direction: column;
    align-items: stretch;
    gap: var(--r1);
  }
  .label {
    width: var(--eigenschaftslabel);
    flex-shrink: 0;
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  .feld-zeile.spalte .label {
    width: auto;
  }
  .text-eingabe {
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    background: var(--feld);
    border: 1px solid var(--feld-rahmen);
    color: var(--tinte);
    padding: var(--r1) var(--r2);
    min-height: var(--treffer);
    flex: 1;
    min-width: var(--feld-min);
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
