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
    familienTrefferquote,
    langsameRichtigeAntworten,
    zielfrequenzAbgleich,
    antwortzeitVerlauf,
    trefferquoteVerlauf,
    abdeckungVerlauf,
    volumenVerlauf,
    schwaechsteAromen,
    uebungsartBilanz,
    wochenSatz,
    lernstandSatz,
    verwechseltePaare,
    trendSatz,
    type VerlaufsPunkt,
  } from '../../domain/uebungsauswertung';
  import { merkhilfeZu } from '../../daten/aroma-merkhilfen';
  import { datenblattZu, type AromaDatenblatt } from '../../daten/aroma-datenblaetter';
  import Aromadatenblatt from '../aromen/Aromadatenblatt.svelte';
  import Blattzeile from '../../muster/Blattzeile.svelte';
  import Trendkurve, { type TrendPunkt } from '../../muster/Trendkurve.svelte';
  import { achsMarken } from '../../domain/auswertung';
  import { effektiverZustand, type AromaOption } from '../../domain/uebung';
  import type { Uebungsform } from '../../daten/schema/uebungsantwort';
  import { EINSTELLUNGEN_ID, type AppEinstellungen } from '../../daten/schema';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import Werteliste from '../../muster/Werteliste.svelte';
  import Segment from '../../muster/Segment.svelte';
  import Blattliste from '../../muster/Blattliste.svelte';
  import Schalter from '../../muster/Schalter.svelte';
  import Kontextmenue from '../../muster/Kontextmenue.svelte';
  import Knopf from '../../muster/Knopf.svelte';

  let {
    onZurueck,
    onKontrastUeben,
  }: {
    onZurueck: () => void;
    /** Startet auf der Übersicht einen Kontrastdurchgang (Rahmen.svelte reicht den Wunsch weiter). */
    onKontrastUeben?: () => void;
  } = $props();

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
        g.aromen.filter((a) => a.nummer !== undefined).map((a) => ({ id: a.id, label: a.label, kategorieId: k.id, nummer: a.nummer })),
      ),
    ),
  );
  function familieLabelVon(kategorieId: string): string {
    return set?.kategorien.find((k) => k.id === kategorieId)?.label ?? kategorieId;
  }

  const antworten = $derived(bestand.uebungsantworten.filter((a) => a.setId === set?.id));




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
  // Etappe 7 (Gestaltung der Statistik): wichtigstes zuerst, Seltenes hinter
  // "Mehr Zahlen" — die alten Schlüssel bleiben, wo der Inhalt derselbe ist,
  // damit gespeicherte Ausblendungen weiter gelten.
  const ABSCHNITTE: readonly { schluessel: string; titel: string }[] = [
    { schluessel: 'was-haengt', titel: 'Woran du gerade arbeitest' },
    { schluessel: 'verwechslungen', titel: 'Was du verwechselst' },
    { schluessel: 'familien', titel: 'Deine Familien' },
    { schluessel: 'lernstufen', titel: 'Wie weit du bist' },
    { schluessel: 'entwicklung', titel: 'Entwicklung' },
    { schluessel: 'mehr', titel: 'Mehr Zahlen' },
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
    { wert: 'aromaInFamilie', label: 'im Familienkreis' },
    { wert: 'freierAbruf', label: 'frei' },
  ];
  let entwicklungForm = $state<Uebungsform>('freierAbruf');

  function formatSekunden(ms: number): string {
    return `${(ms / 1000).toFixed(ms < 10_000 ? 1 : 0).replace('.', ',')}s`;
  }
  function formatProzent(anteil: number): string {
    return `${Math.round(anteil * 100)}%`;
  }



  // ---- Abdeckung: kumulativ, wie viel vom Koffer schon mal richtig sass ----
  const abdeckungPunkte = $derived(abdeckungVerlauf(antworten, jetzt, WOCHEN_VERLAUF));
  const abdeckungAktuell = $derived(abdeckungPunkte.at(-1)?.wert ?? 0);

  // ---- Lernstufen: reine Umsortierung der effektiven Zustaende ------------

  // ---- Was haengt: schwaechste Aromen ab einer Mindestzahl Versuche -------
  const WAS_HAENGT_MINDESTVERSUCHE = 2;

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

  // ---- Etappe 7: Statistik als Erzählung ------------------------------------
  function optionVon(id: string) {
    return alleAromen.find((a) => a.id === id);
  }
  function familienFarbe(kategorieId: string | undefined): string {
    return kategorieId ? `var(--kat-${kategorieId})` : 'var(--spur)';
  }

  const familienQuoten = $derived(familienTrefferquote(antworten, alleAromen));
  const satzOben = $derived(wochenSatz({ antworten, durchgaengeBegonnenAm, familienQuoten, familienLabel: familieLabelVon, jetzt }));

  /** Woran du gerade arbeitest: die zähesten vier, mit Merkhilfe statt Prozent. */
  const arbeitZeilen = $derived(
    schwaechsteAromen(antworten, WAS_HAENGT_MINDESTVERSUCHE)
      .slice(0, 4)
      .map((e) => ({ option: optionVon(e.aromaId), richtig: e.richtig, versuche: e.versuche }))
      .filter((z) => z.option !== undefined),
  );

  const paarZeilen = $derived(
    verwechseltePaare(antworten)
      .slice(0, 4)
      .map((p) => ({ a: optionVon(p.aId), b: optionVon(p.bId), anzahl: p.anzahl }))
      .filter((p) => p.a !== undefined && p.b !== undefined),
  );

  const familienListe = $derived(
    [...familienQuoten]
      .sort((x, y) => y.richtig / y.versuche - x.richtig / x.versuche)
      .map((q) => ({ kategorieId: q.kategorieId, label: familieLabelVon(q.kategorieId), wert: `${q.richtig} von ${q.versuche}` })),
  );

  const alleZustaende = $derived(
    alleAromen.map((a) => ({
      option: a,
      zustand: effektiverZustand(bestand.uebungen.find((u) => u.setId === set?.id && u.aromaId === a.id), zustaendeJetzt),
    })),
  );
  const lernsatz = $derived(lernstandSatz(alleZustaende.map((z) => z.zustand)));

  /** Das Raster aller Fläschchen — nur auf Anfrage (ausklappbar), siehe docs/ux-regeln.md Regel 10, Ausnahme. */
  type RasterStufe = 'neu' | 'a' | 'b' | 'c' | 'frei';
  const raster = $derived(
    [...alleZustaende]
      .sort((x, y) => (x.option.nummer ?? 0) - (y.option.nummer ?? 0))
      .map(({ option, zustand }) => ({
        option,
        stufe: (!zustand.eingefuehrt
          ? 'neu'
          : zustand.stufe === 'c' && zustand.box >= 4
            ? 'frei'
            : zustand.stufe) as RasterStufe,
      })),
  );

  let rasterOffen = $state(false);
  let mehrOffen = $state(false);
  let datenblatt = $state<AromaDatenblatt | undefined>(undefined);
  function datenblattOeffnen(nummer: number | undefined) {
    const blatt = nummer !== undefined ? datenblattZu(nummer) : undefined;
    if (blatt) datenblatt = blatt;
  }

  // ---- Trendkurven (Nachschärfung Etappe 7): Satz zuerst, dann die Kurve ----
  function wocheText(wocheIndex: number): string {
    const vor = WOCHEN_VERLAUF - 1 - wocheIndex;
    return vor === 0 ? 'diese Woche' : `vor ${vor} Woche${vor === 1 ? '' : 'n'}`;
  }
  function zuTrend(punkte: readonly VerlaufsPunkt[], formatiere: (w: number) => string): TrendPunkt[] {
    return punkte.map((p) => ({
      x: WOCHEN_VERLAUF > 1 ? p.wocheIndex / (WOCHEN_VERLAUF - 1) : 1,
      wert: p.wert,
      beschriftung: formatiere(p.wert),
      zeit: wocheText(p.wocheIndex),
    }));
  }
  /** Spanne für Kurven ohne feste Skala: etwas Luft, damit die Linie nicht am Rand klebt. */
  function spanneVon(punkte: readonly VerlaufsPunkt[]): { min: number; max: number } {
    const werte = punkte.map((p) => p.wert);
    const min = Math.min(...werte);
    const max = Math.max(...werte);
    const luft = (max - min || max || 1) * 0.15;
    return { min: Math.max(0, min - luft), max: max + luft };
  }
  const WOCHEN_LINKS = `vor ${WOCHEN_VERLAUF - 1} Wochen`;

  const quotePunkte = $derived(trefferquoteVerlauf(antworten, entwicklungForm, jetzt, WOCHEN_VERLAUF));
  const zeitPunkte = $derived(antwortzeitVerlauf(antworten, entwicklungForm, jetzt, WOCHEN_VERLAUF));
  const quoteSatz = $derived(trendSatz(quotePunkte, 'quote', WOCHEN_VERLAUF));
  const zeitSatz = $derived(trendSatz(zeitPunkte, 'zeit', WOCHEN_VERLAUF));
  const zeitSpanne = $derived(zeitPunkte.length > 0 ? spanneVon(zeitPunkte) : { min: 0, max: 1 });
  const volumenSpanne = $derived({ min: 0, max: Math.max(1, ...volumenPunkteRoh.map((p) => p.wert)) * 1.15 });
</script>

{#if datenblatt}
  <Aromadatenblatt blatt={datenblatt} onZurueck={() => (datenblatt = undefined)} onVerweis={(nummer) => (datenblatt = datenblattZu(nummer) ?? datenblatt)} />
{:else}
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
  {:else if antworten.length === 0}
    <p class="satz">Noch kein Übungsdurchgang — die Statistik füllt sich mit dem ersten.</p>
  {:else}
    {#if satzOben}<p class="einstieg">{satzOben}</p>{/if}

    {#if sichtbar('was-haengt') && arbeitZeilen.length > 0}
      <h2>Woran du gerade arbeitest</h2>
      <Blattliste>
        {#each arbeitZeilen as z (z.option!.id)}
          <button type="button" class="aroma-zeile" onclick={() => datenblattOeffnen(z.option!.nummer)}>
            <span class="deckel" style:--familie={familienFarbe(z.option!.kategorieId)}>{z.option!.nummer}</span>
            <span class="aroma-text">
              <span class="aroma-name">{z.option!.label}</span>
              {#if merkhilfeZu(z.option!.nummer)}<span class="aroma-merkhilfe">{merkhilfeZu(z.option!.nummer)}</span>{/if}
            </span>
            <span class="aroma-meta">{z.richtig} von {z.versuche}</span>
          </button>
        {/each}
      </Blattliste>
    {/if}

    {#if sichtbar('verwechslungen') && paarZeilen.length > 0}
      <h2>Was du verwechselst</h2>
      <Blattliste>
        {#each paarZeilen as p (p.a!.id + p.b!.id)}
          <div class="aroma-zeile statisch">
            <span class="deckel-paar">
              <span class="deckel" style:--familie={familienFarbe(p.a!.kategorieId)}>{p.a!.nummer}</span>
              <span class="deckel" style:--familie={familienFarbe(p.b!.kategorieId)}>{p.b!.nummer}</span>
            </span>
            <span class="aroma-text"><span class="aroma-name">{p.a!.label} ↔ {p.b!.label}</span></span>
            <span class="aroma-meta">{p.anzahl}-mal</span>
          </div>
        {/each}
      </Blattliste>
      {#if onKontrastUeben}
        <div class="knopfreihe">
          <Knopf onKlick={onKontrastUeben}>als Kontrast üben</Knopf>
        </div>
      {/if}
    {/if}

    {#if sichtbar('familien') && familienListe.length > 0}
      <h2>Deine Familien</h2>
      <Blattliste>
        {#each familienListe as f (f.kategorieId)}
          <div class="aroma-zeile statisch kompakt">
            <span class="familie-punkt" style:--familie={familienFarbe(f.kategorieId)}></span>
            <span class="aroma-text"><span class="aroma-name">{f.label}</span></span>
            <span class="aroma-meta">{f.wert}</span>
          </div>
        {/each}
      </Blattliste>
    {/if}

    {#if sichtbar('lernstufen') && lernsatz}
      <h2>Wie weit du bist</h2>
      <p class="satz">{lernsatz}</p>
      <Blattliste>
        <Blattzeile label={rasterOffen ? 'Fläschchen ausblenden' : 'Alle 60 Fläschchen ansehen'} onKlick={() => (rasterOffen = !rasterOffen)} />
      </Blattliste>
      {#if rasterOffen}
        <div class="raster">
          {#each raster as r (r.option.id)}
            <span class="deckel klein stufe-{r.stufe}" style:--familie={familienFarbe(r.option.kategorieId)} title={r.stufe === 'neu' ? undefined : r.option.label}>{r.option.nummer}</span>
          {/each}
        </div>
        <p class="legende">Je kräftiger der Rand, desto sicherer: Familie · im Familienkreis · frei. Blass: noch nicht kennengelernt.</p>
      {/if}
    {/if}

    {#if sichtbar('entwicklung')}
      <h2>Entwicklung</h2>
      <Segment optionen={FORM_OPTIONEN} wert={entwicklungForm} onWahl={(w) => (entwicklungForm = w as Uebungsform)} />
      {#if quotePunkte.length < 2 && zeitPunkte.length < 2}
        <p class="satz">Die Kurven zeichnen sich nach zwei Wochen mit Durchgängen.</p>
      {:else}
        {#if quotePunkte.length >= 2}
          <div class="kurven-block">
          <Blattliste>
            <div class="kurve">
              <p class="kurven-titel">Trefferquote</p>
              {#if quoteSatz}<p class="kurven-satz">{quoteSatz}</p>{/if}
              <Trendkurve
                punkte={zuTrend(quotePunkte, formatProzent)}
                minWert={0}
                maxWert={1}
                titel="Trefferquote je Woche"
                xLinks={WOCHEN_LINKS}
              />
            </div>
          </Blattliste>
          </div>
        {/if}
        {#if zeitPunkte.length >= 2}
          <div class="kurven-block">
          <Blattliste>
            <div class="kurve">
              <p class="kurven-titel">Antwortzeit</p>
              {#if zeitSatz}<p class="kurven-satz">{zeitSatz}</p>{/if}
              <Trendkurve
                punkte={zuTrend(zeitPunkte, formatSekunden)}
                minWert={zeitSpanne.min}
                maxWert={zeitSpanne.max}
                titel="Antwortzeit je Woche"
                xLinks={WOCHEN_LINKS}
              />
            </div>
          </Blattliste>
          </div>
        {/if}
      {/if}
    {/if}

    {#if sichtbar('mehr')}
      <div class="mehr">
        <Blattliste>
          <Blattzeile label={mehrOffen ? 'Weniger Zahlen' : 'Mehr Zahlen'} meta={mehrOffen ? undefined : 'Übungsarten, Abdeckung, Volumen, Boxen, Ziel'} onKlick={() => (mehrOffen = !mehrOffen)} />
        </Blattliste>
      </div>
      {#if mehrOffen}
        {#if uebungsartZeilen.length > 0}
          <h2>Übungsarten</h2>
          <Werteliste zeilen={uebungsartZeilen} />
        {/if}
        {#if abdeckungPunkte.length >= 2}
          <h2>Abdeckung</h2>
          <div class="kurven-block">
          <Blattliste>
            <div class="kurve">
              <p class="kurven-satz">{abdeckungAktuell} von {alleAromen.length} schon mal richtig benannt.</p>
              <Trendkurve
                punkte={zuTrend(abdeckungPunkte, (w) => `${Math.round(w)}`)}
                minWert={0}
                maxWert={alleAromen.length || 60}
                titel="Richtig benannte Aromen über die Wochen"
                xLinks={WOCHEN_LINKS}
              />
            </div>
          </Blattliste>
          </div>
        {/if}
        {#if volumenKurve}
          <h2>Volumen</h2>
          <Blattliste>
            <div class="kurve">
              <Trendkurve
                punkte={zuTrend(volumenPunkteRoh, (w) => `${Math.round(w)} Durchg.`)}
                minWert={0}
                maxWert={volumenSpanne.max}
                titel="Durchgänge je Woche"
                xLinks={WOCHEN_LINKS}
              />
            </div>
          </Blattliste>
        {/if}
        {#if zeigeBoxenverteilung}
          <h2>Boxen</h2>
          <Werteliste zeilen={boxenZeilen} />
        {/if}
        <h2>Zielfrequenz</h2>
        <Werteliste zeilen={zielZeilen} />
        {#if langsame.length > 0}
          <p class="hinweis">
            {langsame.length} richtige Antwort{langsame.length === 1 ? '' : 'en'} mit auffällig langer Antwortzeit — möglicherweise geraten
            statt gewusst.
          </p>
        {/if}
      {/if}
    {/if}
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
    margin: 0 0 var(--r2);
    font-family: var(--schrift-sans);
    font-size: var(--fs-kachel-label);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--gedaempft);
  }
  .kurve {
    padding: var(--r3) var(--r2);
  }
  /* Der Satz gehört zur Kurve und steht deshalb in derselben Karte, unter
     dem Titel — vorher stand er darüber, außerhalb, und las sich wie ein
     loser Absatz. */
  .kurven-satz {
    margin: 0 0 var(--r3);
    font-family: var(--schrift);
    font-size: var(--fs-bedienwort);
    line-height: 1.45;
    color: var(--satz);
  }
  .kurven-block {
    margin-top: var(--r3);
    margin-bottom: var(--r4);
  }
  .knopfreihe {
    display: flex;
    margin-top: var(--r3);
  }

  /* ---- Etappe 7: Statistik als Erzählung ---------------------------------
     Dieselbe Bildsprache wie die Aromaschule: Deckel-Kreise mit Rand in der
     Familienfarbe (K36, erweitert), Sätze in Serif, Zahlen klein daneben. */
  .einstieg {
    margin: 0 0 var(--r5);
    font-size: var(--fs-objekt);
    line-height: 1.35;
    color: var(--tinte);
  }
  .satz {
    margin: 0 0 var(--r3);
    font-size: var(--fs-bedienwort);
    line-height: 1.5;
    color: var(--satz);
  }
  .aroma-zeile {
    display: flex;
    align-items: center;
    gap: var(--r3);
    width: 100%;
    min-height: var(--blattzeile);
    padding: var(--r2) var(--r4);
    border: none;
    background: transparent;
    text-align: left;
    font-family: var(--schrift-sans);
    cursor: pointer;
  }
  .aroma-zeile.statisch {
    cursor: default;
  }
  .aroma-zeile.kompakt {
    min-height: 48px;
  }
  .aroma-text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }
  /* Aromaname und Merkhilfe sind Inhalt, nicht Apparat — Serif. Eigene Blöcke
     ohne cursor/background (tests/bildsprache.test.ts prüft je Block). */
  .aroma-name {
    font-family: var(--schrift);
    font-size: var(--fs-bedienwort);
    color: var(--tinte);
  }
  .aroma-merkhilfe {
    font-family: var(--schrift);
    font-size: var(--fs-meta);
    line-height: 1.4;
    color: var(--gedaempft);
  }
  .aroma-meta {
    flex-shrink: 0;
    font-size: var(--fs-meta);
    color: var(--gedaempft);
    font-variant-numeric: tabular-nums;
  }
  .deckel {
    flex: none;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--vertiefung);
    box-shadow: inset 0 0 0 2px var(--familie);
    font-size: var(--fs-meta);
    font-variant-numeric: tabular-nums lining-nums;
    color: var(--tinte);
  }
  .deckel-paar {
    display: flex;
    flex: none;
  }
  .deckel-paar .deckel + .deckel {
    margin-left: -8px;
  }
  .familie-punkt {
    flex: none;
    width: var(--zeichen);
    height: var(--zeichen);
    border-radius: 50%;
    background: var(--familie);
  }
  .raster {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: var(--r2);
    justify-items: center;
    margin: var(--r3) 0 var(--r2);
  }
  .deckel.klein {
    width: 36px;
    height: 36px;
  }
  /* Stufe als Randstärke — keine neue Zustandsfarbe (K69), die Farbe bleibt
     die der Familie. */
  .stufe-neu {
    opacity: 0.35;
    box-shadow: none;
  }
  .stufe-a {
    box-shadow: inset 0 0 0 1px var(--familie);
  }
  .stufe-b {
    box-shadow: inset 0 0 0 2.5px var(--familie);
  }
  .stufe-c {
    box-shadow: inset 0 0 0 4px var(--familie);
  }
  .stufe-frei {
    box-shadow: inset 0 0 0 4px var(--familie);
    background: var(--blatt);
    font-weight: 600;
  }
  .legende {
    margin: 0 0 var(--r4);
    font-family: var(--schrift);
    font-size: var(--fs-meta);
    font-style: italic;
    color: var(--gedaempft);
  }
  .mehr {
    margin-top: var(--r5);
  }
</style>
