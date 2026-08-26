<script lang="ts">
  // Uebungsmodus — Paket 05, konzept.md:810-812. Ein Zyklus, kein
  // Formular: Nummer sehen -> tippen -> aufdecken -> naechste. Der Tipp
  // laeuft ueber eine Auswahl aus dem Set (AuswahlListe), nicht ueber
  // Freitext — sonst waere die Trefferquote Selbstauskunft statt Messung.
  //
  // Keine Gamification (ux-regeln.md Regel 10): kein Streak, kein
  // Abzeichen, kein Konfetti — nur die Trefferquote als ehrliche Auskunft.

  import { bestand, schreiben } from '../bestand.svelte';
  import { naechstesAroma, trefferquote, type AromaOption, type TrefferStand } from '../../domain/uebung';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import AuswahlListe from '../../muster/AuswahlListe.svelte';
  import Rangliste from '../../muster/Rangliste.svelte';
  import Knopf from '../../muster/Knopf.svelte';

  let { onZurueck }: { onZurueck: () => void } = $props();

  // Der Uebungsmodus fragt Flaeschchennummern ab — das ergibt nur bei einem
  // Set mit vialNummern einen Sinn (konzept.md: "Die App kennt die
  // Flaeschchennummern"). Bei mehreren traegt das erste den Vortritt; heute
  // ist das ohnehin nur AROMASET_LENEZ (daten/aromen.ts).
  const set = $derived(bestand.aromasets.find((a) => a.vialNummern));

  const alleAromen = $derived<AromaOption[]>(
    (set?.kategorien ?? []).flatMap((k) => k.gruppen.flatMap((g) => g.aromen.map((a) => ({ id: a.id, label: a.label, nummer: a.nummer })))),
  );

  function standVon(aromaId: string): TrefferStand | undefined {
    const uebung = bestand.uebungen.find((u) => u.setId === set?.id && u.aromaId === aromaId);
    return uebung ? { versuche: uebung.versuche, treffer: uebung.treffer } : undefined;
  }
  const staende = $derived(new Map(alleAromen.map((a) => [a.id, standVon(a.id)] as const)));

  let frage = $state<AromaOption | undefined>(undefined);
  let tipp = $state('');
  let aufgedeckt = $state(false);
  let letztesRichtig = $state(false);
  let fehler = $state('');

  function neueFrage() {
    const bekannteStaende = new Map<string, TrefferStand>();
    for (const [id, stand] of staende) {
      if (stand) bekannteStaende.set(id, stand);
    }
    frage = naechstesAroma(alleAromen, bekannteStaende);
    tipp = '';
    aufgedeckt = false;
  }

  // Erste Frage, sobald das Set geladen ist — nur einmal, ein zweiter
  // bestand-Ladevorgang (z. B. nach einem Schreibfehler) soll die laufende
  // Frage nicht unter dem Tipp wegziehen.
  let ersteFrageGestellt = false;
  $effect(() => {
    if (!ersteFrageGestellt && alleAromen.length > 0) {
      ersteFrageGestellt = true;
      neueFrage();
    }
  });

  async function aufdecken() {
    if (!frage || !set) return;
    letztesRichtig = tipp === frage.id;
    aufgedeckt = true;
    const bisher = bestand.uebungen.find((u) => u.setId === set.id && u.aromaId === frage!.id);
    try {
      await schreiben('uebung', {
        id: bisher?.id ?? crypto.randomUUID(),
        setId: set.id,
        aromaId: frage.id,
        versuche: (bisher?.versuche ?? 0) + 1,
        treffer: (bisher?.treffer ?? 0) + (letztesRichtig ? 1 : 0),
        letzterVersuch: Date.now(),
      });
    } catch (e) {
      fehler = e instanceof Error ? e.message : String(e);
    }
  }

  const rangliste = $derived(
    alleAromen
      .map((a) => ({ id: a.id, name: a.label, wert: Math.round(trefferquote(staende.get(a.id)) * 100) }))
      .sort((a, b) => b.wert - a.wert),
  );
</script>

<Kopfzeile titel="Übungsmodus" {onZurueck} />

{#if !set}
  <p class="hinweis">Kein Aromenset mit Fläschchennummern hinterlegt.</p>
{:else}
  {#if set.platzhalter}
    <p class="quelle">{set.quelle}</p>
  {/if}

  {#if frage}
    <div class="frage-block">
      <p class="frage-titel">
        {frage.nummer !== undefined ? `Fläschchen ${frage.nummer}` : frage.label}
      </p>
      {#if !aufgedeckt}
        {#key frage.id}
          <AuswahlListe optionen={alleAromen.map((a) => ({ wert: a.id, label: a.label }))} wert={tipp} onWahl={(w) => (tipp = w)} platzhalter="dein Tipp …" />
        {/key}
        <div class="knopfreihe">
          <Knopf stufe="primaer" onKlick={aufdecken} deaktiviert={!tipp}>aufdecken</Knopf>
        </div>
      {:else}
        <p class="ergebnis" class:richtig={letztesRichtig}>
          {letztesRichtig ? 'Richtig.' : `Das war „${frage.label}“.`}
        </p>
        <div class="knopfreihe">
          <Knopf stufe="primaer" onKlick={neueFrage}>nächstes Fläschchen</Knopf>
        </div>
      {/if}
      {#if fehler}<p class="fehler">{fehler}</p>{/if}
    </div>
  {/if}

  <section class="trefferquote">
    <Rangliste person="Trefferquote" eintraege={rangliste} mitBalken />
  </section>
{/if}

<style>
  .quelle {
    font-size: var(--fs-meta);
    color: var(--gedaempft);
    margin: 0 0 var(--r4);
  }
  .frage-block {
    margin-bottom: var(--r5);
  }
  .frage-titel {
    font-size: var(--fs-urteil);
    color: var(--tinte);
    margin: 0 0 var(--r3);
  }
  .ergebnis {
    font-size: var(--fs-satz);
    color: var(--kritisch);
    margin: 0 0 var(--r3);
  }
  .ergebnis.richtig {
    color: var(--satz);
  }
  .knopfreihe {
    margin-top: var(--r3);
  }
  .hinweis {
    color: var(--gedaempft);
    font-size: var(--fs-satz);
  }
  .fehler {
    color: var(--kritisch);
    font-size: var(--fs-satz);
    margin-top: var(--r2);
  }
</style>
