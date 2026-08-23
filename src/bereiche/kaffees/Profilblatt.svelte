<script lang="ts">
  // Profilblatt — K7 (Fuehrungswert je Geraet), Setup-Bindung (Befund 2:
  // "MG 65" ist nur mit Muehle eindeutig), K54 (Kessel/Gruppe als doppelte
  // Einheit), Spielraum je Groesse. Gussplan-Editor folgt in Etappe C.
  //
  // Visueller Redesign-Reset, Paket 3 (Handoff Abschnitt 6 "Profil/
  // Espresso-Setup"): "Ziel" steht jetzt als Parameterkachel-Raster statt
  // Werteliste-Zeilen — gleiche Felder, gleiche Reihenfolge, gleiche
  // Einheiten, gleiches onAendern-Verhalten (zielSpeichern). Kein Wert wird
  // groesser dargestellt als ein anderer — der Fuehrungswert (K7) hat hier
  // wie ueberall sonst im Rezept keine visuelle Sonderrolle (das war schon
  // vor dem Redesign so, siehe Kommentar an der alten Werteliste unten).
  // Werteliste.svelte bleibt fuer "Spielraum" zustaendig (echte Zeilenliste,
  // kein Kachel-Raster laut Handoff).

  import { bestand, schreiben } from '../bestand.svelte';
  import { kesselZuGruppe } from '../../domain/temperatur';
  import { EINHEIT, type GemesseneGroesse } from '../../domain/spielraum';
  import { findeTotzonen } from '../../domain/totzone';
  import AuswahlListe from '../../muster/AuswahlListe.svelte';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import Werteliste, { type WertelisteZeile } from '../../muster/Werteliste.svelte';
  import Parameterkachel from '../../muster/Parameterkachel.svelte';
  import Knopf from '../../muster/Knopf.svelte';
  import Verlaufskurve from '../../muster/Verlaufskurve.svelte';
  import GussplanEditor from './GussplanEditor.svelte';
  import type { Profil } from '../../daten/schema';

  // Shot loggen ist seit dem Navigations-Umbau (UX-1) eine eigene Route
  // (Rahmen.svelte rendert dort direkt ShotErfassung) statt eines lokal
  // umgeschalteten Zustands hier — damit schliesst die Zurueck-Geste die
  // Erfassung, statt die App zu verlassen.
  let { profilId, onZurueck, onOeffnenShot }: {
    profilId: string;
    onZurueck: () => void;
    onOeffnenShot: () => void;
  } = $props();

  const profil = $derived(bestand.profile.find((p) => p.id === profilId));
  const bruehgeraet = $derived(profil ? bestand.bruehgeraetVon(profil.setupId) : undefined);
  const muehle = $derived(profil ? bestand.muehleVon(profil.setupId) : undefined);
  const setup = $derived(profil ? bestand.setups.find((s) => s.id === profil.setupId) : undefined);

  // Verlauf — K40 (Totzonen als schraffierter Streifen in der Kurve, keine
  // eigene Karte), Chargenwechsel als gestrichelte Senkrechte. Die Shots
  // dieses Profils, chronologisch — x normalisiert ueber die Zeitspanne,
  // y ueber die Mahlgrad-Spannweite. Bei einem einzigen Shot gibt es keine
  // Zeitspanne zu normalisieren; er landet mittig.
  const verlaufShots = $derived(
    bestand.shots.filter((s) => s.profilId === profilId).sort((a, b) => a.ts - b.ts),
  );
  const mgSpanne = $derived.by(() => {
    const werte = verlaufShots.map((s) => s.ist.mg);
    if (werte.length === 0) return undefined;
    const min = Math.min(...werte);
    const max = Math.max(...werte);
    return { min, max };
  });
  const zeitSpanne = $derived.by(() => {
    if (verlaufShots.length === 0) return undefined;
    return { von: verlaufShots[0]!.ts, bis: verlaufShots[verlaufShots.length - 1]!.ts };
  });

  function normiereMg(mg: number): number {
    const spanne = mgSpanne;
    if (!spanne || spanne.max === spanne.min) return 0.5;
    return (mg - spanne.min) / (spanne.max - spanne.min);
  }
  function normiereZeit(ts: number): number {
    const spanne = zeitSpanne;
    if (!spanne || spanne.bis === spanne.von) return 0.5;
    return (ts - spanne.von) / (spanne.bis - spanne.von);
  }
  // Auf die Muehlen-Schrittweite runden, statt den rohen Mittelwert zu
  // zeigen: die Beschriftung soll ein Wert sein, den man an der Muehle
  // tatsaechlich einstellen kann (K6, "MG 65" nur mit Muehle eindeutig).
  function formatMg(mg: number): string {
    const schritt = muehle?.skala.schritt ?? 1;
    const gerundet = Math.round(mg / schritt) * schritt;
    if (muehle?.skala.typ === 'klicks') return String(Math.round(gerundet));
    // Nachkommastellen aus der Schrittgroesse ableiten (0,05 -> 2 Stellen) —
    // damit steht dieselbe Genauigkeit da, mit der auch eingestellt wird.
    const nachkommastellen = Math.max(0, Math.round(-Math.log10(schritt)));
    return gerundet.toFixed(nachkommastellen);
  }

  const verlaufPunkte = $derived(
    verlaufShots.map((s) => ({
      x: normiereZeit(s.ts),
      y: normiereMg(s.ist.mg),
      zustand:
        s.urteil === 'daneben' ? ('kritisch' as const) : s.urteil === 'okay' ? ('achtung' as const) : ('gut' as const),
    })),
  );
  const verlaufAchsMarken = $derived.by((): [string, string, string] => {
    const spanne = mgSpanne;
    if (!spanne) return ['', '', ''];
    return [formatMg(spanne.min), formatMg((spanne.min + spanne.max) / 2), formatMg(spanne.max)];
  });
  // Drei Muehle-Schritte als Cluster-Toleranz — grob genug, um "3,75/3,80/3,90"
  // als ein Band zu erkennen, eng genug, um zwei echt getrennte Bereiche
  // nicht zu verschmelzen.
  const verlaufTotzonen = $derived.by(() => {
    const spanne = mgSpanne;
    if (!spanne || spanne.max === spanne.min) return [];
    const toleranz = (muehle?.skala.schritt ?? (spanne.max - spanne.min) / 10) * 3;
    return findeTotzonen(
      verlaufShots.map((s) => ({ mg: s.ist.mg, daneben: s.urteil === 'daneben' })),
      toleranz,
    ).map((z) => ({ vonY: normiereMg(z.von), bisY: normiereMg(z.bis), wort: z.satz }));
  });
  const verlaufEreignisse = $derived(
    verlaufShots
      .filter((s, i) => i > 0 && s.chargeId !== verlaufShots[i - 1]!.chargeId)
      .map((s) => normiereZeit(s.ts)),
  );

  const gruppenTemperatur = $derived(
    profil?.ziel.kt !== undefined && bruehgeraet
      ? kesselZuGruppe(bruehgeraet.tempReferenz, profil.ziel.kt)
      : undefined,
  );

  // Kesseltemperatur-Hinweis als fertiger Text statt DoppelteEinheit: die
  // Komponente zeigt ihren "fuehrendWert" selbst nochmal gross an — neben
  // einem Eingabefeld fuer denselben Wert waere das derselbe Wert doppelt
  // auf dem Bildschirm (gefundener Bug, offene-punkte-ux.md Nachzug).
  const ktHinweis = $derived.by(() => {
    if (gruppenTemperatur?.bekannt) {
      const wert = gruppenTemperatur.herkunft === 'geschaetzt'
        ? Math.round(gruppenTemperatur.wert).toString()
        : gruppenTemperatur.wert.toFixed(1);
      return `≈ ${wert} °C Gruppe`;
    }
    return profil?.ziel.kt !== undefined ? 'außerhalb der Messreihe' : undefined;
  });

  let speicherFehler = $state<string | undefined>(undefined);

  async function zielSpeichern<K extends keyof Profil['ziel']>(feld: K, wert: Profil['ziel'][K]) {
    if (!profil) return;
    speicherFehler = undefined;
    try {
      await schreiben('profil', { ...profil, ziel: { ...profil.ziel, [feld]: wert } });
    } catch (fehler) {
      speicherFehler = fehler instanceof Error ? fehler.message : String(fehler);
    }
  }

  async function spielraumSpeichern(groesse: GemesseneGroesse, wert: number) {
    if (!profil) return;
    speicherFehler = undefined;
    try {
      await schreiben('profil', { ...profil, spielraum: { ...profil.spielraum, [groesse]: wert } });
    } catch (fehler) {
      speicherFehler = fehler instanceof Error ? fehler.message : String(fehler);
    }
  }

  let setupWahlOffen = $state(false);

  async function setupWechseln(neueSetupId: string) {
    if (!profil) return;
    speicherFehler = undefined;
    try {
      await schreiben('profil', { ...profil, setupId: neueSetupId });
    } catch (fehler) {
      speicherFehler = fehler instanceof Error ? fehler.message : String(fehler);
    }
  }

  const GROESSE_LABEL: Record<GemesseneGroesse, string> = {
    zeit: 'Zeit ±',
    output: 'Output ±',
    durchlaufzeit: 'Durchlaufzeit ±',
  };

  // Regel 6/12: zweite Werteliste statt eigenem Grid-CSS (wie schon fuer
  // "Ziel" oben) — und ausgeschriebene Labels statt der rohen Enum-Schluessel
  // ("zeit", "durchlaufzeit").
  const spielraumZeilen = $derived.by((): WertelisteZeile[] => {
    if (!profil) return [];
    return (['zeit', 'output', 'durchlaufzeit'] as const).map((groesse) => ({
      label: GROESSE_LABEL[groesse],
      wert: profil.spielraum[groesse],
      einheit: EINHEIT[groesse],
      onAendern: (w: number) => spielraumSpeichern(groesse, w),
    }));
  });
</script>

{#if !profil}
  <Kopfzeile titel="Profil" onZurueck={onZurueck} />
  <p class="hinweis">Profil nicht gefunden.</p>
{:else}
  <Kopfzeile titel={profil.name} {onZurueck} />
  <!-- Reihenfolge Titel -> Setup-Kette -> Primäraktion laut Handoff-
       Screen-Mapping ("Profil/Espresso-Setup"): vorher stand die Pille vor
       der Setup-Kette. -->
  <p class="setup">{setup?.name ?? 'Setup unbekannt'} · {profil.modus === 'dialin' ? 'Dial-in' : 'eingefahren'}</p>
  <div class="knopfreihe">
    <Knopf stufe="primaer" onKlick={onOeffnenShot}>Shot loggen</Knopf>
  </div>

  <section class="ziel">
    <h2>Ziel</h2>
    <!-- Parameterkachel-Raster statt Werteliste (Handoff Abschnitt 6) — kein
         Herkunftszeichen (hier wird nichts gemessen, nur das Rezept
         gepflegt) und keine Führungswert-Emphase: das Rezept zeigt alle
         Werte gleich groß, die Größenbetonung gehört ausschließlich in den
         Live-Kontext (ShotErfassung.svelte, dort über IstGegenZiel). Der
         Kessel-Hinweis (≈ Gruppe / außerhalb der Messreihe) steht als
         eigene, ruhige Kachel mit Halbzeichen statt als Text unter der
         Kessel-Kachel selbst (Handoff-Referenz C2). -->
    <div class="parameter-raster">
      <Parameterkachel symbol="input" label="Input" wert={profil.ziel.input} einheit="g" onAendern={(w) => zielSpeichern('input', w)} />
      <Parameterkachel
        symbol="mahlgrad"
        label="Mahlgrad"
        wert={profil.ziel.mg}
        einheit={muehle?.skala.typ === 'klicks' ? 'Klicks' : undefined}
        onAendern={(w) => zielSpeichern('mg', w)}
      />
      {#if muehle?.rpmEinstellbar}
        <Parameterkachel symbol="drehzahl" label="Drehzahl" wert={profil.ziel.rpm ?? ''} einheit="rpm" onAendern={(w) => zielSpeichern('rpm', w)} />
      {/if}
      {#if bruehgeraet?.ktEinstellbar}
        <Parameterkachel symbol="kessel" label="Kessel" wert={profil.ziel.kt ?? ''} einheit="°C" onAendern={(w) => zielSpeichern('kt', w)} />
      {/if}
      <Parameterkachel symbol="output" label="Output" wert={profil.ziel.output} einheit="g" onAendern={(w) => zielSpeichern('output', w)} />
      <Parameterkachel symbol="preinfusion" label="Preinfusion" wert={profil.ziel.pre ?? ''} einheit="s" onAendern={(w) => zielSpeichern('pre', w)} />
      <Parameterkachel
        symbol="zeit"
        label={bruehgeraet?.fuehrungswert === 'durchlaufzeit' ? 'Durchlaufzeit' : 'Zeit'}
        wert={profil.ziel.zeit}
        einheit="s"
        onAendern={(w) => zielSpeichern('zeit', w)}
      />
      {#if ktHinweis}
        <div class="hinweis-kachel">
          <span class="halbzeichen" aria-hidden="true"></span>
          <span class="hinweis-text">Kessel {ktHinweis}</span>
        </div>
      {/if}
    </div>
  </section>

  <section class="spielraum">
    <h2>Spielraum</h2>
    <p class="hinweis-klein">Input und Mahlgrad haben keinen — dort ist jede Änderung Absicht.</p>
    <Werteliste zeilen={spielraumZeilen} />
  </section>

  <section class="verlauf">
    <h2>Verlauf</h2>
    <Verlaufskurve
      punkte={verlaufPunkte}
      achsMarken={verlaufAchsMarken}
      totzonen={verlaufTotzonen}
      ereignisse={verlaufEreignisse}
    />
  </section>

  {#if bruehgeraet?.typ === 'pourover'}
    <GussplanEditor {profilId} />
  {/if}

  <!-- Tiefer gelegt (Regel 2/4): reine Korrekturfunktion fuer eine falsch
       zugeordnete Migration (Teil D), keine Alltagsaktion. -->
  <section class="setup-wahl">
    <button type="button" class="aufklappbar" aria-expanded={setupWahlOffen} onclick={() => (setupWahlOffen = !setupWahlOffen)}>
      <span>Setup ändern</span>
      <span class="pfeil" class:offen={setupWahlOffen} aria-hidden="true">▾</span>
    </button>
    {#if setupWahlOffen}
      <AuswahlListe
        optionen={bestand.setups.map((s) => ({ wert: s.id, label: s.name }))}
        wert={profil.setupId}
        onWahl={setupWechseln}
      />
    {/if}
  </section>

  {#if speicherFehler}
    <p class="fehler">Nicht gespeichert: {speicherFehler} — nochmal versuchen.</p>
  {/if}
{/if}

<style>
  .knopfreihe {
    margin-bottom: var(--r4);
  }
  .setup {
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--gedaempft);
    margin: 0 0 var(--r4);
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
  .hinweis-kachel {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--blatt);
    border-radius: var(--r-kachel);
    padding: 13px 15px;
  }
  .halbzeichen {
    flex: none;
    width: var(--zeichen-fuehrung);
    height: var(--zeichen-fuehrung);
    border-radius: 50%;
    border: 1.5px solid var(--achtung);
    background: linear-gradient(90deg, var(--achtung) 50%, transparent 50%);
  }
  .hinweis-text {
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    line-height: 1.4;
    color: var(--gedaempft);
  }
  .verlauf {
    margin-top: var(--r5);
  }
  .setup-wahl {
    margin-top: var(--r5);
  }
  .aufklappbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    min-height: var(--treffer);
    padding: 0;
    border: none;
    background: transparent;
    color: var(--gedaempft);
    font-family: var(--schrift);
    font-size: var(--fs-meta);
    text-align: left;
    cursor: pointer;
  }
  .aufklappbar .pfeil {
    transition: transform var(--t-auswahl) var(--e-rein);
  }
  .aufklappbar .pfeil.offen {
    transform: rotate(180deg);
  }
  .hinweis {
    color: var(--gedaempft);
    font-size: var(--fs-meta);
  }
  /* Erklaersatz unter der Spielraum-Ueberschrift ist Inhalt, keine Meta-
     Zeile (Handoff-Referenz C2: Serif, Satzfarbe, ~15px) — deshalb eigene
     Regel statt gemeinsam mit .hinweis. */
  .hinweis-klein {
    color: var(--satz);
    font-size: var(--fs-satz);
    line-height: 1.55;
  }
  .fehler {
    color: var(--kritisch);
    font-size: var(--fs-satz);
    margin-top: var(--r3);
  }
</style>
