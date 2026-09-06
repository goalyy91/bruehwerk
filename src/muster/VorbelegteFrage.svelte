<script lang="ts">
  // Muster 12 · Vorbelegte Frage (Übergabe, Abschnitt 2 · K12 K56).
  // Ja und Nein gleich groß, Begründung als eigene Zeile mit gefülltem
  // Zeichen.
  //
  // Visueller Redesign-Reset: Antwort-Felder als Pillen (Vertiefung/
  // Füllfläche wie Segment/Chip), Vorbelegung bleibt zusätzlich als Gewicht
  // 600 erkennbar — kein Akzentstrich mehr als Auswahlzeichen.
  //
  // Schwellen über die letzten 20 Positionen: ≥ 60 % vorbelegen ·
  // 40–60 % fragen ohne Vorbelegung · ≤ 40 % gar nicht fragen. Keine
  // Vorbelegung bei Rezepturänderungen (K12) — dafür gibt es kein
  // `anteil`-Prop, sondern der Aufrufer lässt `vorbelegung` einfach weg.
  //
  // Fund 2026-09-06: die "≤ 40 % gar nicht fragen"-Schwelle stand frueher
  // ALS EIGENES Sichtbarkeits-Gate hier im Bauteil (anteil > 40) — doppelt
  // zur Pruefung, die jeder echte Aufrufer schon selbst macht
  // (`{#if getraenkId && koffeinVorbelegung.frage}` in BestellungAufnehmen.svelte
  // und Bar.svelte). Bei einer brandneuen Person (0 Positionen) liefert
  // domain/ranking.ts::vorbelegung() bewusst `frage: true, anteil: 0` — "frag
  // trotzdem, beleg aber nichts vor" (siehe Test "fragt bei neuer Person,
  // belegt aber nichts vor"). Das eigene Gate hier sah nur die 0 und blendete
  // sich trotzdem aus — die Frage liess sich fuer eine neue Person nie
  // beantworten, "Position hinzufuegen" blieb dauerhaft deaktiviert. Jetzt
  // rendert dieses Bauteil immer, wenn es gemountet wird — die
  // "≤ 40 %"-Entscheidung bleibt Sache des Aufrufers (`.frage`), nicht
  // dieses Bauteils.

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
  let antwort = $state<boolean | undefined>(
    untrack(() => start ?? (anteil >= 60 ? true : undefined)),
  );

  function waehle(ja: boolean) {
    antwort = ja;
    onWahl?.(ja);
  }
</script>

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
    border: none;
    border-radius: var(--r-pille);
    background: var(--vertiefung);
    color: var(--satz);
    font-family: var(--schrift);
    font-size: var(--fs-urteil);
    cursor: pointer;
    transition: background var(--t-auswahl) var(--e-rein);
  }
  .feld.gewaehlt {
    background: var(--fuellung);
    color: var(--auf-fuellung);
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
