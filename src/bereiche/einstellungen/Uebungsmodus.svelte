<script lang="ts">
  // Uebungsmodus — Paket 05, konzept.md:810-812, Aromapaket Etappe 5. Ein
  // Zyklus, kein Formular: Aufgabe lesen -> riechen -> tippen -> aufdecken ->
  // naechste. Der Bildschirm kennt nur den Bauplan aus domain/uebung.ts
  // (Aufgabe), nicht die einzelnen Aufgabenarten — eine weitere Art aendert
  // hier nichts ausser der Wahl der Antwort-Eingabe (naechster Absatz). Eine
  // dritte Art ("Aussenseiter") ist nach dem ersten Livetest wieder raus —
  // Begruendung in domain/uebung.ts, Kopfkommentar.
  //
  // Die Antwort-Eingabe passt sich der Optionenzahl an: "Benennen" hat bis
  // zu 60 Optionen -> AuswahlListe (aufklappbares Suchfeld, wie bisher).
  // "Unterscheiden" (2) ist dafuer zu wenig -> Segment.svelte, schon
  // vorhanden fuer genau "2-3 kurze Optionen als durchgehende Leiste" — kein
  // neues Muster noetig. Die Segment-Beschriftung zeigt dabei die
  // Flaeschchennummer, nie den Namen: den kennst du bei "Unterscheiden"
  // noch nicht, das ist ja gerade die Aufgabe.
  //
  // Keine Gamification (ux-regeln.md Regel 10): kein Streak, kein
  // Abzeichen, kein Konfetti — nur die Trefferquote als ehrliche Auskunft.

  import { bestand, schreiben } from '../bestand.svelte';
  import { neueId } from '../../daten/id';
  import { flaeschchenId } from '../../daten/aromen';
  import { naechsteAufgabe, gesamtquote, type AromaOption, type GesamtStand, type Aufgabe } from '../../domain/uebung';
  import { datenblattZu, type AromaDatenblatt } from '../../daten/aroma-datenblaetter';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import AuswahlListe from '../../muster/AuswahlListe.svelte';
  import Segment from '../../muster/Segment.svelte';
  import Rangliste from '../../muster/Rangliste.svelte';
  import Knopf from '../../muster/Knopf.svelte';
  import Aromadatenblatt from '../aromen/Aromadatenblatt.svelte';

  let { onZurueck }: { onZurueck: () => void } = $props();

  // Der Uebungsmodus fragt Flaeschchennummern ab — das ergibt nur bei einem
  // Set mit vialNummern einen Sinn (konzept.md: "Die App kennt die
  // Flaeschchennummern"). Bei mehreren traegt das erste den Vortritt; heute
  // ist das ohnehin nur AROMASET_LENEZ (daten/aromen.ts).
  const set = $derived(bestand.aromasets.find((a) => a.vialNummern));

  // Aromapaket, Etappe 5: alle 60 Flaeschchen sind seit Etappe 1 echt
  // benannt — der fruehere Filter auf ein vorhandenes Volltext-Datenblatt
  // ist damit hinfaellig. `kategorieId` und `verwandte` kommen dazu, sonst
  // koennte naechsteAufgabe() nie "Unterscheiden" ziehen (bevorzugt echte
  // Datenblatt-Verwandte, faellt sonst auf dieselbe Kategorie zurueck).
  const alleAromen = $derived<AromaOption[]>(
    (set?.kategorien ?? []).flatMap((k) =>
      k.gruppen.flatMap((g) =>
        g.aromen
          .filter((a) => a.nummer !== undefined)
          .map((a) => ({
            id: a.id,
            label: a.label,
            nummer: a.nummer,
            kategorieId: k.id,
            verwandte: datenblattZu(a.nummer!)?.verwandte.map((v) => flaeschchenId(v.nummer)),
          })),
      ),
    ),
  );

  // K36-Aufhebung: der Kategorie-Punkt gehoert in die Antwortliste
  // (AuswahlListe) und die Trefferquote-Liste — beide zeigen ein Aroma,
  // dessen Name du schon kennst (getippt bzw. abgeschlossen). Die Frage
  // selbst darf die Kategorie nicht vorwegnehmen. `AromaOption`
  // (domain/uebung.ts) kennt keine Farbe — das bleibt reine Darstellung
  // hier, nicht Teil der Domaene.
  const farbeVonAroma = $derived(
    new Map(
      (set?.kategorien ?? []).flatMap((k) =>
        k.gruppen.flatMap((g) => g.aromen.map((a) => [a.id, `var(--kat-${k.id})`] as const)),
      ),
    ),
  );

  function standVon(aromaId: string): GesamtStand | undefined {
    return bestand.uebungen.find((u) => u.setId === set?.id && u.aromaId === aromaId);
  }
  const staende = $derived(new Map(alleAromen.map((a) => [a.id, standVon(a.id)] as const)));

  let aufgabe = $state<Aufgabe | undefined>(undefined);
  let tipp = $state('');
  let aufgedeckt = $state(false);
  let letztesRichtig = $state(false);
  let fehler = $state('');

  // Das offene Datenblatt. Eigener Zustand statt einer zweiten
  // Navigations-Ebene: die laufende Aufgabe bleibt unangetastet stehen,
  // waehrend das Blatt oben liegt, und der Rueckweg fuehrt genau dorthin
  // zurueck — kein neues Wuerfeln, kein verlorener Tipp.
  let datenblatt = $state<AromaDatenblatt | undefined>(undefined);

  function neueAufgabe() {
    const bekannteStaende = new Map<string, GesamtStand>();
    for (const [id, stand] of staende) {
      if (stand) bekannteStaende.set(id, stand);
    }
    aufgabe = naechsteAufgabe(alleAromen, bekannteStaende, Date.now());
    tipp = '';
    aufgedeckt = false;
  }

  // Erste Aufgabe, sobald das Set geladen ist — nur einmal, ein zweiter
  // bestand-Ladevorgang (z. B. nach einem Schreibfehler) soll die laufende
  // Aufgabe nicht unter dem Tipp wegziehen.
  let ersteAufgabeGestellt = false;
  $effect(() => {
    if (!ersteAufgabeGestellt && alleAromen.length > 0) {
      ersteAufgabeGestellt = true;
      neueAufgabe();
    }
  });

  /**
   * "Fläschchen 12", "Fläschchen 12 und 34" oder "Fläschchen 12, 34 und 51"
   * — reine Textformatierung fuer den Kopf ueber der Frage, gehoert nicht in
   * domain/uebung.ts (das kennt nur die Frage selbst, keine Aufzaehlungen).
   */
  function riechenKopf(riechen: readonly AromaOption[]): string {
    const nummern = riechen.map((a) => a.nummer ?? '?');
    if (nummern.length === 1) return `Fläschchen ${nummern[0]}`;
    const letzte = nummern[nummern.length - 1];
    return `Fläschchen ${nummern.slice(0, -1).join(', ')} und ${letzte}`;
  }

  const richtigeOption = $derived(aufgabe?.optionen.find((o) => o.id === aufgabe!.richtigeId));
  const getippteOption = $derived(aufgabe?.optionen.find((o) => o.id === tipp));

  async function aufdecken() {
    if (!aufgabe || !set) return;
    const aktuelleAufgabe = aufgabe;
    letztesRichtig = tipp === aktuelleAufgabe.richtigeId;
    aufgedeckt = true;
    const zielId = aktuelleAufgabe.richtigeId;
    const bisher = bestand.uebungen.find((u) => u.setId === set.id && u.aromaId === zielId);
    const artBisher = bisher?.[aktuelleAufgabe.art] ?? { versuche: 0, treffer: 0 };
    // Verwechslungsliste nur bei "benennen" — bei den anderen beiden Arten
    // ist die falsche Antwort ohnehin eine der vorgegebenen (Etappe 3).
    const verwechslungenBisher = bisher?.verwechslungen ?? {};
    const verwechslungen =
      letztesRichtig || aktuelleAufgabe.art !== 'benennen'
        ? verwechslungenBisher
        : { ...verwechslungenBisher, [tipp]: (verwechslungenBisher[tipp] ?? 0) + 1 };
    const zaehler = {
      benennen: bisher?.benennen ?? { versuche: 0, treffer: 0 },
      unterscheiden: bisher?.unterscheiden ?? { versuche: 0, treffer: 0 },
    };
    zaehler[aktuelleAufgabe.art] = { versuche: artBisher.versuche + 1, treffer: artBisher.treffer + (letztesRichtig ? 1 : 0) };
    try {
      await schreiben('uebung', {
        id: bisher?.id ?? neueId(),
        setId: set.id,
        aromaId: zielId,
        ...zaehler,
        verwechslungen,
        letzterVersuch: Date.now(),
      });
    } catch (e) {
      fehler = e instanceof Error ? e.message : String(e);
    }
  }

  const LEERER_STAND: GesamtStand = {
    benennen: { versuche: 0, treffer: 0 },
    unterscheiden: { versuche: 0, treffer: 0 },
    verwechslungen: {},
  };
  // Klickbar nur, wenn zu dieser Nummer schon ein Datenblatt erfasst ist —
  // dasselbe "nur begehbar, wenn das Ziel existiert"-Muster wie bei den
  // Querverweisen in Aromadatenblatt.svelte. Kein Spoiler-Risiko: Name und
  // Kategorie-Punkt stehen hier ohnehin schon offen, unabhaengig vom
  // Aufdecken-Status der laufenden Aufgabe.
  const rangliste = $derived(
    alleAromen
      .map((a) => {
        const ziel = a.nummer !== undefined ? datenblattZu(a.nummer) : undefined;
        return {
          id: a.id,
          name: a.label,
          wert: Math.round(gesamtquote(staende.get(a.id) ?? LEERER_STAND) * 100),
          farbe: farbeVonAroma.get(a.id),
          onKlick: ziel ? () => (datenblatt = ziel) : undefined,
        };
      })
      .sort((a, b) => b.wert - a.wert),
  );
</script>

{#if datenblatt}
  <Aromadatenblatt
    blatt={datenblatt}
    onZurueck={() => (datenblatt = undefined)}
    onVerweis={(nummer) => (datenblatt = datenblattZu(nummer) ?? datenblatt)}
  />
{:else}
  <Kopfzeile titel="Übungsmodus" {onZurueck} />

  {#if !set}
    <p class="hinweis">Noch keine Aromen mit Fläschchennummern erfasst.</p>
  {:else}
    <p class="quelle">{set.quelle}</p>

    {#if alleAromen.length === 0}
      <p class="hinweis">Noch keine Fläschchen erfasst.</p>
    {:else}
      {#if aufgabe}
        <div class="frage-block">
          <p class="frage-titel">{riechenKopf(aufgabe.riechen)}</p>
          <p class="frage-satz">{aufgabe.frage}</p>
          {#if !aufgedeckt}
            {#key aufgabe}
              {#if aufgabe.art === 'benennen'}
                <AuswahlListe
                  optionen={aufgabe.optionen.map((a) => ({ wert: a.id, label: a.label, farbe: farbeVonAroma.get(a.id) }))}
                  wert={tipp}
                  onWahl={(w) => (tipp = w)}
                  platzhalter="dein Tipp …"
                  suchbar
                />
              {:else}
                <Segment optionen={aufgabe.optionen.map((a) => ({ wert: a.id, label: String(a.nummer) }))} wert={tipp} onWahl={(w) => (tipp = w)} />
              {/if}
            {/key}
            <div class="knopfreihe">
              <Knopf stufe="primaer" onKlick={aufdecken} deaktiviert={!tipp}>aufdecken</Knopf>
            </div>
          {:else}
            <p class="ergebnis" class:richtig={letztesRichtig}>
              {#if letztesRichtig}
                Richtig — das war „{richtigeOption?.label}“.
              {:else}
                Das war „{richtigeOption?.label}“ — du hast „{getippteOption?.label}“ gewählt.
              {/if}
            </p>
            <!-- Erst hier, nie vorher: auf dem Datenblatt steht der Name in
                 der Ueberschrift — vor dem Aufdecken erreichbar waere es die
                 Loesung auf Knopfdruck. -->
            <div class="knopfreihe">
              <Knopf stufe="primaer" onKlick={neueAufgabe}>nächstes Fläschchen</Knopf>
              {#if richtigeOption?.nummer !== undefined && datenblattZu(richtigeOption.nummer)}
                <Knopf onKlick={() => (datenblatt = datenblattZu(richtigeOption!.nummer!))}>Datenblatt ansehen</Knopf>
              {/if}
            </div>
          {/if}
          {#if fehler}<p class="fehler">{fehler}</p>{/if}
        </div>
      {/if}

      <section class="trefferquote">
        <Rangliste person="Trefferquote" eintraege={rangliste} mitBalken grenze={12} />
      </section>
    {/if}
  {/if}
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
    margin: 0 0 var(--r1);
  }
  .frage-satz {
    font-family: var(--schrift-sans);
    font-size: var(--fs-erklaerung);
    color: var(--gedaempft);
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
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--r2);
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
