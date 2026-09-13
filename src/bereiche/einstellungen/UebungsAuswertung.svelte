<script lang="ts">
  // UebungsAuswertung — Aromapaket, Etappe 8 (Neubau nach Lastenheft,
  // docs/konzept.md "Übungsmodus", Abschnitt 8 "Auswertung und Statistik").
  // Erreichbar von der Übungsmodus-Übersicht aus, eigene Route
  // (/einstellungen/uebung/statistik) statt eines weiteren $state-Overlays —
  // anders als das Datenblatt-Overlay im Übungsmodus selbst lohnt sich hier
  // ein echter Rückweg-Eintrag: die Statistik wird eigenständig angesehen,
  // nicht nur kurz aufgeklappt.
  //
  // Reine Anzeige: alle Zahlen kommen aus domain/uebungsauswertung.ts, diese
  // Datei sammelt nur die Aroma-Namen (aus dem Aromaset, nicht Teil der
  // Domäne) dazu und schreibt die Zielfrequenz.
  import { bestand, schreiben } from '../bestand.svelte';
  import {
    verwechslungsmatrix,
    familienTrefferquote,
    langsameRichtigeAntworten,
    zielfrequenzAbgleich,
  } from '../../domain/uebungsauswertung';
  import { effektiverZustand, type AromaOption } from '../../domain/uebung';
  import { EINSTELLUNGEN_ID, type AppEinstellungen } from '../../daten/schema';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import Werteliste from '../../muster/Werteliste.svelte';

  let { onZurueck }: { onZurueck: () => void } = $props();

  const set = $derived(bestand.aromasets.find((a) => a.vialNummern));

  const alleAromen = $derived<AromaOption[]>(
    (set?.kategorien ?? []).flatMap((k) =>
      k.gruppen.flatMap((g) =>
        g.aromen.filter((a) => a.nummer !== undefined).map((a) => ({ id: a.id, label: a.label, kategorieId: k.id })),
      ),
    ),
  );
  function labelVon(id: string): string {
    return alleAromen.find((a) => a.id === id)?.label ?? id;
  }
  function familieLabelVon(kategorieId: string): string {
    return set?.kategorien.find((k) => k.id === kategorieId)?.label ?? kategorieId;
  }

  const antworten = $derived(bestand.uebungsantworten.filter((a) => a.setId === set?.id));

  /** Auf 10 begrenzt — kein "weitere"-Zähler wie beim Dashboard, das ist hier eine bewusst tiefer gelegte Ansicht, kein Alltagspfad-Element. */
  const ANZEIGE_GRENZE = 10;

  const matrixZeilen = $derived(
    verwechslungsmatrix(antworten)
      .slice(0, ANZEIGE_GRENZE)
      .map((e) => ({ label: `${labelVon(e.tatsaechlichId)} → ${labelVon(e.getipptId)}`, wert: e.anzahl })),
  );

  const familienZeilen = $derived(
    familienTrefferquote(antworten, alleAromen)
      .map((f) => ({ label: familieLabelVon(f.kategorieId), wert: `${f.richtig} von ${f.versuche}` }))
      .sort((a, b) => a.label.localeCompare(b.label, 'de')),
  );

  const langsame = $derived(langsameRichtigeAntworten(antworten));

  // Die Fünf-Boxen-Aufschlüsselung, umgezogen von der Übungsmodus-Übersicht
  // hierher (Livebetrieb-Rückmeldung: rohe Box-Nummern sind "wichtig
  // manchmal", nicht auf den ersten Blick — die Übersicht zeigt seitdem
  // stattdessen rotierende Kennzahlen, domain/uebungsauswertung.ts::
  // uebungsKennzahlenPool). Eigenes `jetzt` statt des oben schon vorhandenen:
  // dieselbe Absicht ("einmal beim Öffnen"), nur an dieser Stelle gebraucht.
  const zustaendeJetzt = Date.now();

  // Namen statt roher Boxnummern (Livebetrieb-Rückmeldung: "Boxen heißen
  // immer noch Box 1-5" — derselbe Befund, der die Übersicht schon zu den
  // Kennzahl-Kacheln oben geführt hat, jetzt an der letzten Stelle, wo er
  // noch stand). "Sicher" für Box 4 bewusst wortgleich mit der Kennzahl
  // "Sicher gelernt" (domain/uebungsauswertung.ts::SICHER_AB_BOX = 4) —
  // dieselbe Schwelle, derselbe Begriff. Reine Anzeige: der Box-Typ (1-5)
  // in domain/leitner.ts bleibt unangetastet.
  const BOX_NAMEN: Record<1 | 2 | 3 | 4 | 5, string> = {
    1: 'Neu',
    2: 'In Übung',
    3: 'Festigt sich',
    4: 'Sicher',
    5: 'Gemeistert',
  };
  const boxenZeilen = $derived(
    ([1, 2, 3, 4, 5] as const).map((box) => ({
      label: BOX_NAMEN[box],
      wert: alleAromen
        .map((a) => effektiverZustand(bestand.uebungen.find((u) => u.setId === set?.id && u.aromaId === a.id), zustaendeJetzt))
        .filter((z) => z.eingefuehrt && z.box === box).length,
    })),
  );
  const zeigeBoxenverteilung = $derived(boxenZeilen.some((z) => z.wert > 0));

  // Einmal beim Öffnen — kein Timer, die Statistik muss nicht live mitzählen.
  const jetzt = Date.now();
  const durchgaengeBegonnenAm = $derived(
    bestand.uebungsdurchgaenge
      .filter((d) => d.setId === set?.id && d.art === 'normal' && d.status === 'abgeschlossen')
      .map((d) => d.begonnenAm),
  );
  const zielProWoche = $derived(bestand.einstellungen?.uebungZielProWoche);
  const abgleich = $derived(zielProWoche ? zielfrequenzAbgleich(zielProWoche, durchgaengeBegonnenAm, jetzt) : undefined);

  const zielZeilen = $derived([
    {
      label: 'Ziel',
      wert: zielProWoche ?? 0,
      einheit: '× pro Woche',
      onAendern: zielAendern,
      hinweis: abgleich
        ? `faktisch ${abgleich.faktischProWoche.toFixed(1)}×${abgleich.weichtAb ? ' — Ziel anpassen?' : ''}`
        : undefined,
    },
  ]);

  async function zielAendern(wert: number) {
    const basis: AppEinstellungen =
      bestand.einstellungen ?? {
        id: EINSTELLUNGEN_ID,
        begruendungKoffein: true,
        begruendungBohne: true,
        sammelSchaeumen: 'einzeln',
        bestandKnappBezuege: 2,
        bestandFrischWochen: 8,
        bestandEingefrorenMonate: 8,
        thema: 'system',
      };
    await schreiben('einstellungen', { ...basis, uebungZielProWoche: wert > 0 ? wert : undefined });
  }
</script>

<Kopfzeile titel="Statistik" {onZurueck} />

{#if antworten.length === 0}
  <p class="hinweis">Noch keine Übungsdurchgänge protokolliert.</p>
{:else}
  {#if matrixZeilen.length > 0}
    <h2>Häufigste Verwechslungen</h2>
    <Werteliste zeilen={matrixZeilen} />
  {/if}

  {#if familienZeilen.length > 0}
    <h2>Familien-Trefferquote</h2>
    <Werteliste zeilen={familienZeilen} />
  {/if}

  {#if langsame.length > 0}
    <p class="hinweis">
      {langsame.length} richtige Antwort{langsame.length === 1 ? '' : 'en'} mit auffällig langer Antwortzeit — möglicherweise geraten
      statt gewusst.
    </p>
  {/if}
{/if}

{#if zeigeBoxenverteilung}
  <h2>Boxenverteilung</h2>
  <Werteliste zeilen={boxenZeilen} />
{/if}

<h2>Zielfrequenz</h2>
<Werteliste zeilen={zielZeilen} />

<style>
  h2 {
    margin: var(--r5) 0 var(--r2);
  }
  h2:first-of-type {
    margin-top: 0;
  }
  .hinweis {
    color: var(--gedaempft);
    font-family: var(--schrift-sans);
    font-size: var(--fs-satz);
  }
</style>
