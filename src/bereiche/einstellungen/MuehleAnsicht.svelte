<script lang="ts">
  // MuehleAnsicht — reine Leseansicht (offene-punkte-ux.md Punkt 2), analog
  // zu Kaffeeblatt.svelte. Formular bleibt Muehleblatt.svelte.
  //
  // UX-Korrekturrunde: Loeschen sitzt jetzt hier statt im Formular (Regel 3 —
  // "speichern" im Blatt soll die einzige dominante Aktion sein) und laeuft
  // ueber Kontextmenue.svelte statt native alert()/confirm() (Regel 6). Die
  // Referenzpruefung (kein stilles Kaskadenloeschen, offene-punkte-ux.md
  // Punkt 1) bleibt inhaltlich unveraendert.

  import { bestand, loeschen } from '../bestand.svelte';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import Kontextmenue from '../../muster/Kontextmenue.svelte';
  import Werteliste from '../../muster/Werteliste.svelte';

  let {
    muehleId,
    onZurueck,
    onBearbeiten,
    onGeloescht,
  }: {
    muehleId: string;
    onZurueck: () => void;
    onBearbeiten: () => void;
    onGeloescht: () => void;
  } = $props();

  const muehle = $derived(bestand.muehlen.find((m) => m.id === muehleId));

  let fehler = $state<string | undefined>(undefined);

  async function versuchLoeschen() {
    if (!muehle) return;
    fehler = undefined;
    const anzahl = bestand.setups.filter((s) => s.muehleId === muehle.id).length;
    if (anzahl > 0) {
      fehler = `wird noch von ${anzahl} Setup${anzahl === 1 ? '' : 's'} benutzt und kann nicht gelöscht werden`;
      return;
    }
    await loeschen('muehle', muehle.id);
    onGeloescht();
  }
</script>

{#if !muehle}
  <Kopfzeile titel="Mühle" {onZurueck} />
  <p class="hinweis">Mühle nicht gefunden.</p>
{:else}
  <Kopfzeile titel={muehle.name} {onZurueck}>
    {#snippet aktion()}
      <Kontextmenue
        eintraege={[
          { text: 'bearbeiten', onWahl: onBearbeiten },
          { text: 'löschen', kritisch: true, onWahl: versuchLoeschen },
        ]}
      />
    {/snippet}
  </Kopfzeile>

  {#if fehler}
    <p class="fehler">Nicht gelöscht: {fehler}.</p>
  {/if}

  <section class="gruppe">
    <h2>Skala</h2>
    <Werteliste
      zeilen={[
        { label: 'Typ', wert: muehle.skala.typ === 'numerisch' ? 'Numerisch' : 'Klicks' },
        { label: 'Min', wert: muehle.skala.min },
        { label: 'Max', wert: muehle.skala.max },
        { label: 'Schritt', wert: muehle.skala.schritt },
      ]}
    />
  </section>

  <section class="gruppe">
    <h2>Drehzahl</h2>
    <Werteliste
      zeilen={[
        { label: 'Einstellbar', wert: muehle.rpmEinstellbar ? 'Ja' : 'Nein' },
        ...(muehle.rpmEinstellbar && muehle.rpmBereich
          ? [
              { label: 'RPM Min', wert: muehle.rpmBereich.min },
              { label: 'RPM Max', wert: muehle.rpmBereich.max },
              { label: 'RPM Schritt', wert: muehle.rpmBereich.schritt },
            ]
          : []),
      ]}
    />
  </section>
{/if}

<style>
  h2 {
    font-size: var(--fs-label);
    letter-spacing: var(--label-spacing);
    text-transform: uppercase;
    color: var(--gedaempft);
    font-weight: var(--gw-text);
    margin: 0 0 var(--r2);
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
