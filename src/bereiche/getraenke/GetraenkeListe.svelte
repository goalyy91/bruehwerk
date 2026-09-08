<script lang="ts">
  // Getraenke-Baukasten — Paket 06. "Ein- und ausblenden statt loeschen"
  // (konzept.md:974): ein Getraenk verschwindet aus der Auswahl, seine
  // Historie und sein Ranking-Score bleiben. Neu anlegen heisst deshalb hier
  // immer "als Kopie eines vorhandenen oeffnen" — kein Knopf fuer ein leeres
  // Formular, das gibt es in diesem Baukasten nicht (konzept.md:830).

  import { bestand, schreiben } from '../bestand.svelte';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import Schalter from '../../muster/Schalter.svelte';
  import Blattliste from '../../muster/Blattliste.svelte';
  import AktivKnopf from '../../muster/AktivKnopf.svelte';

  let { onOeffnen }: { onOeffnen: (getraenkId: string) => void } = $props();

  let nurAktive = $state(true);

  const gefiltert = $derived(nurAktive ? bestand.getraenke.filter((g) => g.aktiv) : bestand.getraenke);

  /** Dieselbe Umschalt-Logik wie Getraenkeblatt.svelte::sichtbarkeitUmschalten(). */
  async function aktivWechseln(getraenkId: string) {
    const getraenk = bestand.getraenke.find((g) => g.id === getraenkId);
    if (!getraenk) return;
    await schreiben('getraenk', { ...getraenk, aktiv: !getraenk.aktiv });
  }
</script>

<Kopfzeile titel="Getränke" gross />

<div class="metazeile">
  <p class="zaehlung">Getränk · {gefiltert.length} von {bestand.getraenke.length}</p>
  <Schalter label="nur aktive" an={nurAktive} onWahl={(a) => (nurAktive = a)} />
</div>

{#if !bestand.geladen}
  <p class="hinweis">Lädt …</p>
{:else if gefiltert.length === 0}
  <p class="hinweis">Kein Getränk passt zur Auswahl.</p>
{:else}
  <!-- Rückmeldung 2026-09-08: eigenes Zeileninnenleben statt Blattzeile.svelte
       (das Muster ist laut eigenem Kommentar bewusst nur für den einfachen
       Name+Chevron-Fall gedacht) — das Auge-Symbol braucht sein eigenes
       Tap-Ziel neben dem Navigieren, wie schon bei Personen/Beobachtungen/
       Temperatur-Referenz. Bewusst kein Wischen (ux-regeln.md, K44). -->
  <Blattliste>
    {#each gefiltert as getraenk (getraenk.id)}
      <div class="zeile">
        <AktivKnopf aktiv={getraenk.aktiv} onKlick={() => void aktivWechseln(getraenk.id)} />
        <button type="button" class="inhalt" onclick={() => onOeffnen(getraenk.id)}>
          <span class="haupt">
            <span class="label" class:gedaempft={!getraenk.aktiv}>{getraenk.name}</span>
            <span class="meta">{getraenk.kategorie}{!getraenk.aktiv ? ' · ausgeblendet' : ''}</span>
          </span>
          <span class="chevron" aria-hidden="true">›</span>
        </button>
      </div>
    {/each}
  </Blattliste>
{/if}

<style>
  .metazeile {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--r3);
    margin: 0 0 var(--r4);
  }
  .zaehlung {
    font-size: var(--fs-label);
    letter-spacing: var(--label-spacing);
    color: var(--gedaempft);
    margin: 0;
  }
  .metazeile :global(.schalter-zeile) {
    width: auto;
  }
  .hinweis {
    color: var(--gedaempft);
    font-size: var(--fs-satz);
  }
  /* Rahmen kommt von Blattliste.svelte; das Zeileninnenleben (Auge +
     Name/Meta/Chevron) baut hier lokal, wie Blattzeile.svelte selbst es
     für Zeilen mit eigenem Innenleben vorsieht. */
  .zeile {
    display: flex;
    align-items: center;
    gap: var(--r3);
    min-height: var(--blattzeile);
  }
  .inhalt {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--r3);
    padding: 0;
    border: none;
    background: transparent;
    text-align: left;
    /* Serif bewusst: die Zeile trägt einen Getränkenamen. */
    font-family: var(--schrift);
    cursor: pointer;
  }
  .haupt {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .label {
    font-size: var(--fs-bedienwort);
    color: var(--tinte);
  }
  .label.gedaempft {
    color: var(--gedaempft);
  }
  .meta {
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  .chevron {
    flex: none;
    color: var(--spur);
    font-size: var(--fs-bedienwort);
  }
</style>
