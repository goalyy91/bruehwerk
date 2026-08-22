<script lang="ts">
  // BruehgeraetAnsicht — reine Leseansicht (offene-punkte-ux.md Punkt 2),
  // analog zu Kaffeeblatt.svelte. Formular bleibt Bruehgeraetblatt.svelte.
  //
  // UX-Korrekturrunde: Loeschen sitzt jetzt hier statt im Formular (Regel 3)
  // und laeuft ueber Kontextmenue.svelte statt native alert()/confirm()
  // (Regel 6). Referenzpruefung inhaltlich unveraendert.

  import { bestand, loeschen } from '../bestand.svelte';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import Kontextmenue from '../../muster/Kontextmenue.svelte';
  import Werteliste from '../../muster/Werteliste.svelte';

  let {
    bruehgeraetId,
    onZurueck,
    onBearbeiten,
    onGeloescht,
  }: {
    bruehgeraetId: string;
    onZurueck: () => void;
    onBearbeiten: () => void;
    onGeloescht: () => void;
  } = $props();

  const geraet = $derived(bestand.bruehgeraete.find((b) => b.id === bruehgeraetId));

  const TYP_LABEL: Record<string, string> = {
    espresso: 'Espresso',
    moka: 'Moka',
    pourover: 'Pour Over',
    coldbrew: 'Cold Brew',
  };

  let fehler = $state<string | undefined>(undefined);

  async function versuchLoeschen() {
    if (!geraet) return;
    fehler = undefined;
    const anzahl = bestand.setups.filter((s) => s.bruehgeraetId === geraet.id).length;
    if (anzahl > 0) {
      fehler = `wird noch von ${anzahl} Setup${anzahl === 1 ? '' : 's'} benutzt und kann nicht gelöscht werden`;
      return;
    }
    await loeschen('bruehgeraet', geraet.id);
    onGeloescht();
  }
</script>

{#if !geraet}
  <Kopfzeile titel="Brühgerät" {onZurueck} />
  <p class="hinweis">Brühgerät nicht gefunden.</p>
{:else}
  <Kopfzeile titel={geraet.name} {onZurueck}>
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
    <h2>Grunddaten</h2>
    <Werteliste
      zeilen={[
        { label: 'Typ', wert: TYP_LABEL[geraet.typ] ?? geraet.typ },
        { label: 'Gruppen', wert: geraet.gruppen },
        ...(geraet.fuehrungswert
          ? [{ label: 'Führungswert', wert: geraet.fuehrungswert === 'output' ? 'Output' : 'Durchlaufzeit' }]
          : []),
      ]}
    />
  </section>

  {#if geraet.typ === 'espresso'}
    <section class="gruppe">
      <h2>Espresso</h2>
      <Werteliste
        zeilen={[
          { label: 'Dampflanze', wert: geraet.dampflanze ? 'Ja' : 'Nein' },
          { label: 'Cooling Flush', wert: geraet.flushDauer !== undefined ? geraet.flushDauer : 'Nein', einheit: geraet.flushDauer !== undefined ? 's' : undefined },
          ...(geraet.sieb ? [{ label: 'Sieb', wert: geraet.sieb.art === 'doppel' ? 'doppel' : 'einzel' }] : []),
        ]}
      />
    </section>
  {:else}
    <section class="gruppe">
      <h2>Mengen</h2>
      <Werteliste zeilen={[{ label: 'Angeboten', wert: geraet.mengen.map((m) => `${m}×`).join(', ') }]} />
    </section>
  {/if}

  <section class="gruppe">
    <h2>Temperatur</h2>
    <Werteliste
      zeilen={[
        { label: 'PID', wert: geraet.ktEinstellbar ? 'Ja' : 'Nein' },
        ...(geraet.ktEinstellbar
          ? [{ label: 'Referenztabelle', wert: geraet.tempReferenz.length, einheit: geraet.tempReferenz.length === 1 ? 'Zeile' : 'Zeilen' }]
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
