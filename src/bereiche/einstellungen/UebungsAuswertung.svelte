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
    antwortzeitVerlauf,
    trefferquoteVerlauf,
    abdeckungVerlauf,
    volumenVerlauf,
    stufenverteilung,
    schwaechsteAromen,
    uebungsartBilanz,
    type VerlaufsPunkt,
  } from '../../domain/uebungsauswertung';
  import { achsMarken } from '../../domain/auswertung';
  import { effektiverZustand, type AromaOption } from '../../domain/uebung';
  import type { Uebungsform } from '../../daten/schema/uebungsantwort';
  import { EINSTELLUNGEN_ID, type AppEinstellungen } from '../../daten/schema';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import Werteliste from '../../muster/Werteliste.svelte';
  import Verlaufskurve from '../../muster/Verlaufskurve.svelte';
  import Segment from '../../muster/Segment.svelte';
  import Blattliste from '../../muster/Blattliste.svelte';
  import Schalter from '../../muster/Schalter.svelte';
  import Kontextmenue from '../../muster/Kontextmenue.svelte';
  import Knopf from '../../muster/Knopf.svelte';

  let { onZurueck }: { onZurueck: () => void } = $props();

  /** Gemeinsamer Default, wenn noch keine Einstellungen existieren — dieselbe Basis, die zielAendern() bisher inline hatte, jetzt einmal fuer beide Schreib-Funktionen unten. */
  function basisEinstellungen(): AppEinstellungen {
    return (
      bestand.einstellungen ?? {
        id: EINSTELLUNGEN_ID,
        begruendungKoffein: true,
        begruendungBohne: true,
        sammelSchaeumen: 'einzeln',
        bestandKnappBezuege: 2,
        bestandFrischWochen: 8,
        bestandEingefrorenMonate: 8,
        thema: 'system',
      }
    );
  }

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
    await schreiben('einstellungen', { ...basisEinstellungen(), uebungZielProWoche: wert > 0 ? wert : undefined });
  }

  // ---- Editiermodus: einzelne Abschnitte ein-/ausblenden -------------------
  // (Livebetrieb-Rueckmeldung 2026-09-18: "Vollprogramm, aber mit einem
  // Editiermodus, in dem ich einzelne Teile ein- und ausblenden kann" — die
  // Statistik ist mit den neuen Abschnitten unten lang geworden, das
  // Interesse schwankt.) Gespeichert werden die AUSGEBLENDETEN Schluessel
  // (daten/schema/einstellungen.ts::uebungStatistikAus), nicht die
  // sichtbaren: "Feld nicht gesetzt" heisst dann "alles sichtbar", und ein
  // spaeter ergaenzter Abschnitt erscheint von selbst statt zu fehlen.
  const ABSCHNITTE: readonly { schluessel: string; titel: string }[] = [
    { schluessel: 'entwicklung', titel: 'Entwicklung' },
    { schluessel: 'abdeckung', titel: 'Abdeckung' },
    { schluessel: 'lernstufen', titel: 'Lernstufen' },
    { schluessel: 'was-haengt', titel: 'Was hängt' },
    { schluessel: 'uebungsarten', titel: 'Übungsarten' },
    { schluessel: 'volumen', titel: 'Volumen' },
    { schluessel: 'verwechslungen', titel: 'Häufigste Verwechslungen' },
    { schluessel: 'familien', titel: 'Familien-Trefferquote' },
    { schluessel: 'boxen', titel: 'Boxenverteilung' },
    { schluessel: 'zielfrequenz', titel: 'Zielfrequenz' },
  ];

  let bearbeiten = $state(false);
  const ausgeblendet = $derived(new Set(bestand.einstellungen?.uebungStatistikAus ?? []));
  function sichtbar(schluessel: string): boolean {
    return !ausgeblendet.has(schluessel);
  }
  async function abschnittUmschalten(schluessel: string) {
    const neu = ausgeblendet.has(schluessel)
      ? [...ausgeblendet].filter((s) => s !== schluessel)
      : [...ausgeblendet, schluessel];
    await schreiben('einstellungen', { ...basisEinstellungen(), uebungStatistikAus: neu.length > 0 ? neu : undefined });
  }

  // ---- Entwicklung: Antwortzeit + Trefferquote, je Aufgabenform getrennt ---
  // Getrennt gehalten (nie gemischt): die App erhoeht die Schwierigkeit,
  // sobald ein Aroma sicherer sitzt (Stufe A -> B -> C), eine gemischte Kurve
  // zeigte echten Fortschritt als Stillstand — dieselbe Begruendung wie bei
  // domain/uebungsauswertung.ts::persoenlicheSchwelle.
  const WOCHEN_VERLAUF = 8;
  const FORM_OPTIONEN: readonly { wert: Uebungsform; label: string }[] = [
    { wert: 'familie', label: 'Familie' },
    { wert: 'aromaInFamilie', label: 'Aroma in Familie' },
    { wert: 'freierAbruf', label: 'freier Abruf' },
  ];
  let entwicklungForm = $state<Uebungsform>('freierAbruf');

  function formatSekunden(ms: number): string {
    return `${(ms / 1000).toFixed(ms < 10_000 ? 1 : 0).replace('.', ',')}s`;
  }
  function formatProzent(anteil: number): string {
    return `${Math.round(anteil * 100)}%`;
  }

  /** Wochenpunkte -> Verlaufskurve-Koordinaten (x nach Wochenindex, y auf die eigene Wertspanne normiert). Unter zwei Wochen mit Datenbasis gibt es keine sinnvolle Kurve — undefined heisst "Satz statt Kurve zeigen" (siehe Vorlage). */
  function zuKurve(
    punkte: readonly VerlaufsPunkt[],
    formatiere: (wert: number) => string,
  ): { punkte: { x: number; y: number }[]; marken: readonly [string, string, string] } | undefined {
    if (punkte.length < 2) return undefined;
    const werte = punkte.map((p) => p.wert);
    const min = Math.min(...werte);
    const max = Math.max(...werte);
    return {
      punkte: punkte.map((p) => ({
        x: WOCHEN_VERLAUF > 1 ? p.wocheIndex / (WOCHEN_VERLAUF - 1) : 0.5,
        y: max === min ? 0.5 : (p.wert - min) / (max - min),
      })),
      marken: achsMarken(min, max, formatiere),
    };
  }

  const zeitVerlauf = $derived(zuKurve(antwortzeitVerlauf(antworten, entwicklungForm, jetzt, WOCHEN_VERLAUF), formatSekunden));
  const quoteVerlauf = $derived(zuKurve(trefferquoteVerlauf(antworten, entwicklungForm, jetzt, WOCHEN_VERLAUF), formatProzent));

  // ---- Abdeckung: kumulativ, wie viel vom Koffer schon mal richtig sass ----
  const abdeckungPunkte = $derived(abdeckungVerlauf(antworten, jetzt, WOCHEN_VERLAUF));
  const abdeckungKurve = $derived.by(() => {
    if (alleAromen.length === 0) return undefined;
    return {
      punkte: abdeckungPunkte.map((p) => ({
        x: WOCHEN_VERLAUF > 1 ? p.wocheIndex / (WOCHEN_VERLAUF - 1) : 0.5,
        y: p.wert / alleAromen.length,
      })),
      marken: achsMarken(0, alleAromen.length, (w) => String(Math.round(w))),
    };
  });
  const abdeckungAktuell = $derived(abdeckungPunkte.at(-1)?.wert ?? 0);

  // ---- Lernstufen: reine Umsortierung der effektiven Zustaende ------------
  const eingefuehrteZustaendeStatistik = $derived(
    alleAromen
      .map((a) => effektiverZustand(bestand.uebungen.find((u) => u.setId === set?.id && u.aromaId === a.id), zustaendeJetzt))
      .filter((z) => z.eingefuehrt),
  );
  const stufenZeilen = $derived.by(() => {
    const v = stufenverteilung(eingefuehrteZustaendeStatistik);
    return [
      { label: 'Familie (A)', wert: v.a },
      { label: 'Aroma in Familie (B)', wert: v.b },
      { label: 'freier Abruf (C)', wert: v.c },
    ];
  });

  // ---- Was haengt: schwaechste Aromen ab einer Mindestzahl Versuche -------
  const WAS_HAENGT_MINDESTVERSUCHE = 2;
  const schwaechsteZeilen = $derived(
    schwaechsteAromen(antworten, WAS_HAENGT_MINDESTVERSUCHE)
      .slice(0, ANZEIGE_GRENZE)
      .map((e) => ({ label: labelVon(e.aromaId), wert: formatProzent(e.richtig / e.versuche) })),
  );

  // ---- Uebungsarten: Kontrast/Reverse getrennt, andere Groesse als normal --
  const uebungsartZeilen = $derived.by(() => {
    const bilanz = uebungsartBilanz(antworten);
    const zeilen: { label: string; wert: string }[] = [];
    if (bilanz.kontrast.versuche > 0) zeilen.push({ label: 'Kontrast', wert: `${bilanz.kontrast.richtig} von ${bilanz.kontrast.versuche}` });
    if (bilanz.reverse.versuche > 0) zeilen.push({ label: 'Reverse (Selbsteinschätzung)', wert: `${bilanz.reverse.richtig} von ${bilanz.reverse.versuche}` });
    return zeilen;
  });

  // ---- Volumen: Durchgaenge je rollierender Woche --------------------------
  const volumenPunkteRoh = $derived(volumenVerlauf(durchgaengeBegonnenAm, jetzt, WOCHEN_VERLAUF));
  const volumenKurve = $derived.by(() => {
    const max = Math.max(...volumenPunkteRoh.map((p) => p.wert), 0);
    if (max === 0) return undefined;
    return {
      punkte: volumenPunkteRoh.map((p) => ({
        x: WOCHEN_VERLAUF > 1 ? p.wocheIndex / (WOCHEN_VERLAUF - 1) : 0.5,
        y: p.wert / max,
      })),
      marken: achsMarken(0, max, (w) => String(Math.round(w))),
    };
  });
</script>

<Kopfzeile titel="Statistik" {onZurueck}>
  {#snippet aktion()}
    {#if !bearbeiten}
      <Kontextmenue eintraege={[{ text: 'Abschnitte wählen', onWahl: () => (bearbeiten = true) }]} />
    {/if}
  {/snippet}
</Kopfzeile>

{#if bearbeiten}
  <p class="hinweis">Ausgeblendete Abschnitte verschwinden nur hier — an der Berechnung ändert sich nichts.</p>
  <Blattliste>
    {#each ABSCHNITTE as abschnitt (abschnitt.schluessel)}
      <Schalter label={abschnitt.titel} an={sichtbar(abschnitt.schluessel)} onWahl={() => abschnittUmschalten(abschnitt.schluessel)} />
    {/each}
  </Blattliste>
  <div class="knopfreihe">
    <Knopf stufe="primaer" onKlick={() => (bearbeiten = false)}>fertig</Knopf>
  </div>
{:else}
  {#if antworten.length === 0}
    <p class="hinweis">Noch keine Übungsdurchgänge protokolliert.</p>
  {:else}
    {#if sichtbar('entwicklung')}
      <h2>Entwicklung</h2>
      <Segment optionen={FORM_OPTIONEN} wert={entwicklungForm} onWahl={(w) => (entwicklungForm = w as Uebungsform)} />
      <p class="kurven-titel">Antwortzeit</p>
      {#if zeitVerlauf}
        <Verlaufskurve punkte={zeitVerlauf.punkte} achsMarken={zeitVerlauf.marken} />
      {:else}
        <p class="hinweis">Noch zu wenig Geschichte für einen Verlauf.</p>
      {/if}
      <p class="kurven-titel">Trefferquote</p>
      {#if quoteVerlauf}
        <Verlaufskurve punkte={quoteVerlauf.punkte} achsMarken={quoteVerlauf.marken} />
      {:else}
        <p class="hinweis">Noch zu wenig Geschichte für einen Verlauf.</p>
      {/if}
    {/if}

    {#if sichtbar('was-haengt') && schwaechsteZeilen.length > 0}
      <h2>Was hängt</h2>
      <Werteliste zeilen={schwaechsteZeilen} />
    {/if}

    {#if sichtbar('uebungsarten') && uebungsartZeilen.length > 0}
      <h2>Übungsarten</h2>
      <Werteliste zeilen={uebungsartZeilen} />
    {/if}

    {#if sichtbar('verwechslungen') && matrixZeilen.length > 0}
      <h2>Häufigste Verwechslungen</h2>
      <Werteliste zeilen={matrixZeilen} />
    {/if}

    {#if sichtbar('familien') && familienZeilen.length > 0}
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

  {#if sichtbar('abdeckung') && abdeckungKurve}
    <h2>Abdeckung</h2>
    <p class="hinweis">{abdeckungAktuell} von {alleAromen.length} schon mal richtig benannt.</p>
    <Verlaufskurve punkte={abdeckungKurve.punkte} achsMarken={abdeckungKurve.marken} />
  {/if}

  {#if sichtbar('lernstufen') && eingefuehrteZustaendeStatistik.length > 0}
    <h2>Lernstufen</h2>
    <Werteliste zeilen={stufenZeilen} />
  {/if}

  {#if sichtbar('volumen') && volumenKurve}
    <h2>Volumen</h2>
    <Verlaufskurve punkte={volumenKurve.punkte} achsMarken={volumenKurve.marken} />
  {/if}

  {#if sichtbar('boxen') && zeigeBoxenverteilung}
    <h2>Boxenverteilung</h2>
    <Werteliste zeilen={boxenZeilen} />
  {/if}

  {#if sichtbar('zielfrequenz')}
    <h2>Zielfrequenz</h2>
    <Werteliste zeilen={zielZeilen} />
  {/if}
{/if}

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
  .kurven-titel {
    margin: var(--r3) 0 var(--r1);
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  .knopfreihe {
    display: flex;
    margin-top: var(--r3);
  }
</style>
