<script lang="ts">
  // Muster 12 · Vorbelegte Frage (Übergabe, Abschnitt 2 · K12 K56).
  // Ja und Nein gleich groß, Vorbelegung als Gewicht + Akzentstrich,
  // Begründung als eigene Zeile mit gefülltem Zeichen.
  //
  // Schwellen über die letzten 20 Positionen: ≥ 60 % vorbelegen ·
  // 40–60 % fragen ohne Vorbelegung · ≤ 40 % gar nicht fragen. Keine
  // Vorbelegung bei Rezepturänderungen (K12) — dafür gibt es kein
  // `anteil`-Prop, sondern der Aufrufer lässt `vorbelegung` einfach weg.

  import { untrack } from 'svelte';

  let {
    frage,
    anteil,
    begruendung,
    start,
    onWahl,
  }: {
    frage: string;
    anteil: number; // 0–100, über die letzten 20 Positionen
    begruendung?: string;
    start?: boolean;
    onWahl?: (ja: boolean) => void;
  } = $props();

  const vorbelegtJa = $derived(anteil >= 60);
  const zeigtSichUeberhaupt = $derived(anteil > 40);
  let antwort = $state<boolean | undefined>(
    untrack(() => start ?? (anteil >= 60 ? true : undefined)),
  );

  function waehle(ja: boolean) {
    antwort = ja;
    onWahl?.(ja);
  }
</script>

{#if zeigtSichUeberhaupt}
  <div class="frage">
    <div class="text">{frage}</div>
    <div class="felder">
      <button
        type="button"
        class="feld"
        class:gewaehlt={antwort === true}
        class:vorbelegt={vorbelegtJa && antwort === true}
        onclick={() => waehle(true)}
      >
        Ja
      </button>
      <button
        type="button"
        class="feld"
        class:gewaehlt={antwort === false}
        onclick={() => waehle(false)}
      >
        Nein
      </button>
    </div>
    {#if begruendung}
      <div class="begruendung">
        <span class="zeichen"></span>
        {begruendung}
      </div>
    {/if}
  </div>
{/if}

<style>
  .frage {
    display: flex;
    flex-direction: column;
    gap: var(--r2);
  }
  .text {
    font-size: var(--fs-satz);
    color: var(--tinte);
  }
  .felder {
    display: flex;
    gap: var(--r2);
  }
  .feld {
    flex: 1;
    min-height: 56px;
    border: 1px solid var(--feld-rahmen);
    border-radius: var(--radius-chip);
    background: var(--feld);
    color: var(--satz);
    font-family: var(--schrift);
    font-size: var(--fs-urteil);
    cursor: pointer;
  }
  .feld.gewaehlt {
    color: var(--tinte);
    box-shadow: inset 0 -2px 0 0 var(--akzent);
  }
  .feld.vorbelegt {
    font-weight: var(--gw-titel);
  }
  .begruendung {
    display: flex;
    align-items: center;
    gap: var(--r2);
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  .zeichen {
    display: inline-block;
    width: var(--zeichen);
    height: var(--zeichen);
    border-radius: 50%;
    background: var(--tinte);
    opacity: 0.6;
  }
</style>
