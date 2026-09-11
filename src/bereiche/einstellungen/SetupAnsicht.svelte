<script lang="ts">
  // SetupAnsicht — reine Leseansicht (offene-punkte-ux.md Punkt 2), analog
  // zu Kaffeeblatt.svelte. Formular bleibt Setupblatt.svelte.
  //
  // UX-Korrekturrunde: Loeschen sitzt jetzt hier statt im Formular (Regel 3)
  // und laeuft ueber Kontextmenue.svelte statt native alert()/confirm()
  // (Regel 6). Referenzpruefung inhaltlich unveraendert.
  //
  // Rueckmeldung 2026-09-11: "bearbeiten" stand hinter dem "⋯"-Menue
  // zusammen mit "loeschen" versteckt, obwohl es die weit haeufigere der
  // beiden Aktionen ist (Regel 4: "was regelmaessig gebraucht wird, bleibt
  // sichtbar"). Direkter Stift wie bei Kaffeeblatt/Getraenkeblatt
  // (BearbeitenKnopf.svelte), das "⋯"-Menue bleibt nur noch fuer das
  // seltene, destruktive Loeschen (samt eingebauter Zwei-Tap-Bestaetigung).
  //
  // Paket 4: h2-Typografie kommt jetzt aus tokens.css (global), hier nur
  // noch der lokale margin.
  //
  // Rueckmeldung (2026-08-24): Zubehoer-Zeile entfernt — es gibt keinen
  // Bildschirm, der Zubehoer anlegt (nur Setupblatt.svelte fuer Muehle/
  // Bruehgeraet), das Feld `zubehoerIds` bleibt im Schema, wird hier nur
  // nicht mehr angezeigt.

  import { bestand, loeschen } from '../bestand.svelte';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import Kontextmenue from '../../muster/Kontextmenue.svelte';
  import BearbeitenKnopf from '../../muster/BearbeitenKnopf.svelte';
  import Werteliste from '../../muster/Werteliste.svelte';

  let {
    setupId,
    onZurueck,
    onBearbeiten,
    onGeloescht,
  }: {
    setupId: string;
    onZurueck: () => void;
    onBearbeiten: () => void;
    onGeloescht: () => void;
  } = $props();

  const setup = $derived(bestand.setups.find((s) => s.id === setupId));
  const muehle = $derived(setup ? bestand.muehleVon(setup.id) : undefined);
  const bruehgeraet = $derived(setup ? bestand.bruehgeraetVon(setup.id) : undefined);

  let fehler = $state<string | undefined>(undefined);

  async function versuchLoeschen() {
    if (!setup) return;
    fehler = undefined;
    const anzahl = bestand.profile.filter((p) => p.setupId === setup.id).length;
    if (anzahl > 0) {
      fehler = `wird noch von ${anzahl} Profil${anzahl === 1 ? '' : 'en'} benutzt und kann nicht gelöscht werden`;
      return;
    }
    await loeschen('setup', setup.id);
    onGeloescht();
  }
</script>

{#if !setup}
  <Kopfzeile titel="Setup" {onZurueck} />
  <p class="hinweis">Setup nicht gefunden.</p>
{:else}
  <Kopfzeile titel={setup.name} {onZurueck}>
    {#snippet aktion()}
      <div class="kopf-aktionen">
        <BearbeitenKnopf onKlick={onBearbeiten} />
        <Kontextmenue eintraege={[{ text: 'löschen', kritisch: true, onWahl: versuchLoeschen }]} />
      </div>
    {/snippet}
  </Kopfzeile>

  {#if fehler}
    <p class="fehler">Nicht gelöscht: {fehler}.</p>
  {/if}

  <section class="gruppe">
    <h2>Geräte</h2>
    <Werteliste
      zeilen={[
        { label: 'Mühle', wert: muehle?.name ?? '—' },
        { label: 'Brühgerät', wert: bruehgeraet?.name ?? '—' },
      ]}
    />
  </section>
{/if}

<style>
  .kopf-aktionen {
    display: flex;
    align-items: center;
    gap: var(--r2);
  }
  h2 {
    margin: 0 0 var(--r-kachelabstand);
  }
  .gruppe {
    margin-bottom: var(--r5);
  }
  .hinweis {
    color: var(--gedaempft);
    font-size: var(--fs-satz);
  }
  .fehler {
    color: var(--kritisch);
    font-size: var(--fs-satz);
    margin: 0 0 var(--r4);
  }
</style>
