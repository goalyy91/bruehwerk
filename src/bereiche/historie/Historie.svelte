<script lang="ts">
  // Historie — Paket 05. Seit K57 der einzige Ort, an dem bewertet wird:
  // diese Liste hat genau eine Aufgabe, einen Shot wiederfinden (Suchfeld
  // ueber den Kaffeenamen, Zeit absteigend, Tagesueberschrift) — nicht,
  // alles ueber alle Shots auf einmal zu zeigen.
  //
  // Blatt/Zeile als lokales Panel-CSS wie Geraete.svelte, Beobachtungen.svelte
  // & Co. — kein neues Muster, siehe docs/design/offene-punkte-redesign.md
  // Punkt 8 ("Bewusst nicht in diesem Paket" im Plan zu Paket 05).

  import { bestand } from '../bestand.svelte';
  import { zaehlform } from '../../domain/bestand';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import Suchfeld from '../../muster/Suchfeld.svelte';

  let { onOeffnen }: { onOeffnen: (shotId: string) => void } = $props();

  let suchtext = $state('');

  function kaffeeName(kaffeeId: string): string {
    return bestand.kaffees.find((k) => k.id === kaffeeId)?.name ?? 'unbekannter Kaffee';
  }
  function profilName(profilId: string): string {
    return bestand.profile.find((p) => p.id === profilId)?.name ?? '';
  }
  function urteilLabel(urteil: string): string {
    return urteil === 'referenz' ? 'Referenz' : urteil;
  }

  const gefiltert = $derived(
    [...bestand.shots]
      .filter((s) => kaffeeName(s.kaffeeId).toLowerCase().includes(suchtext.trim().toLowerCase()))
      .sort((a, b) => b.ts - a.ts),
  );

  type Tag = { label: string; shots: typeof gefiltert };
  const tage = $derived.by(() => {
    const gruppen: Tag[] = [];
    for (const shot of gefiltert) {
      const label = new Date(shot.ts).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' });
      const letzte = gruppen[gruppen.length - 1];
      if (letzte && letzte.label === label) letzte.shots.push(shot);
      else gruppen.push({ label, shots: [shot] });
    }
    return gruppen;
  });
</script>

<Kopfzeile titel="Historie" gross />

<div class="suchzeile">
  <Suchfeld wert={suchtext} onWert={(w) => (suchtext = w)} platzhalter="Kaffee suchen …" />
</div>

<p class="zaehlung">{zaehlform(gefiltert.length, bestand.shots.length, 'Shot')}</p>

{#if !bestand.geladen}
  <p class="hinweis">Lädt …</p>
{:else if gefiltert.length === 0}
  <p class="hinweis">
    {bestand.shots.length === 0 ? 'Noch kein Shot geloggt.' : 'Kein Shot passt zur Suche.'}
  </p>
{:else}
  {#each tage as tag (tag.label)}
    <h2>{tag.label}</h2>
    <div class="panel">
      {#each tag.shots as shot (shot.id)}
        <button type="button" class="zeile" onclick={() => onOeffnen(shot.id)}>
          <span class="haupt">
            <span class="name">{kaffeeName(shot.kaffeeId)}</span>
            <span class="meta">{profilName(shot.profilId)}</span>
          </span>
          <span class="urteil">{urteilLabel(shot.urteil)}</span>
        </button>
      {/each}
    </div>
  {/each}
{/if}

<style>
  .suchzeile {
    margin-bottom: var(--r3);
  }
  .zaehlung {
    font-size: var(--fs-label);
    letter-spacing: var(--label-spacing);
    color: var(--gedaempft);
    margin: 0 0 var(--r4);
  }
  .hinweis {
    color: var(--gedaempft);
    font-size: var(--fs-satz);
  }
  h2 {
    font-family: var(--schrift-sans);
    font-size: var(--fs-gruppenkopf);
    letter-spacing: var(--label-spacing);
    text-transform: uppercase;
    color: var(--gedaempft);
    font-weight: var(--gw-text);
    margin: var(--r5) 0 var(--r-kachelabstand);
  }
  h2:first-of-type {
    margin-top: 0;
  }
  .panel {
    background: var(--blatt);
    border-radius: var(--r-blatt);
    padding: 0 var(--r4);
    display: flex;
    flex-direction: column;
  }
  .panel > :not(:first-child) {
    border-top: 1px solid var(--linie);
  }
  .zeile {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--r3);
    min-height: 60px;
    border: none;
    background: transparent;
    font-family: var(--schrift);
    text-align: left;
    cursor: pointer;
  }
  .haupt {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .name {
    font-size: var(--fs-bedienwort);
    color: var(--tinte);
  }
  .meta {
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  .urteil {
    flex: none;
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
</style>
