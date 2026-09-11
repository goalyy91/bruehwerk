<script lang="ts">
  // Shotblatt — Paket 05, K32/K57: der einzige Ort, an dem ein Urteil
  // nachtraeglich entsteht oder sich aendert, ohne Zeitdruck. Deshalb ist
  // "Wie war er?" (Urteil.svelte mit `start`) die dominante Primaeraktion
  // dieses Bildschirms (ux-regeln.md Regel 3) — alles andere ist Kontext
  // dafuer oder fuehrt zum vollen Verkostungsbogen.
  //
  // Ist-Werte als Parameterkachel-Raster (eingestellt) + Werteliste
  // (gemessen) — dieselbe Aufteilung wie ShotErfassung.svelte, nur lesend.

  import { untrack } from 'svelte';
  import { bestand, schreiben } from '../bestand.svelte';
  import { berechneGesamt, zusammenfassung } from '../../domain/tasting';
  import { bildeMessreihe, messreiheSatz } from '../../domain/messreihe';
  import { ermittleDiagnose, berechneNeuenWert, type Befund, type RegelParameter } from '../../domain/diagnose';
  import Blattliste from '../../muster/Blattliste.svelte';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import Parameterkachel from '../../muster/Parameterkachel.svelte';
  import Werteliste from '../../muster/Werteliste.svelte';
  import Urteil from '../../muster/Urteil.svelte';
  import Chips from '../../muster/Chips.svelte';
  import Vorschlag from '../../muster/Vorschlag.svelte';

  let { shotId, onZurueck, onOeffnenVerkostung }: { shotId: string; onZurueck: () => void; onOeffnenVerkostung: () => void } = $props();

  const shot = $derived(bestand.shots.find((s) => s.id === shotId));
  const kaffee = $derived(shot ? bestand.kaffees.find((k) => k.id === shot.kaffeeId) : undefined);
  const profil = $derived(shot ? bestand.profile.find((p) => p.id === shot.profilId) : undefined);
  const bruehgeraet = $derived(profil ? bestand.bruehgeraetVon(profil.setupId) : undefined);
  const muehle = $derived(profil ? bestand.muehleVon(profil.setupId) : undefined);
  const tasting = $derived(bestand.tastingVon(shotId));
  const tastingZusammenfassung = $derived(
    tasting
      ? zusammenfassung(
          { saeure: tasting.groessen.saeure, koerper: tasting.groessen.koerper, bitterkeit: tasting.groessen.bitterkeit },
          tasting.aromen.length,
          tasting.auffaelligkeiten.length,
        )
      : '',
  );
  const tastingAromen = $derived((tasting?.aromen ?? []).map((a) => a.pfad[a.pfad.length - 1]).join(' · '));

  function befundLabel(symptomId: string): string {
    return bestand.symptome.find((s) => s.id === symptomId)?.label ?? symptomId;
  }

  let fehler = $state('');

  async function urteilGeaendert(urteil: 'daneben' | 'okay' | 'sehr gut') {
    if (!shot) return;
    try {
      await schreiben('shot', { ...shot, urteil });
    } catch (e) {
      fehler = e instanceof Error ? e.message : String(e);
    }
  }

  // Aromapaket-Rueckmeldung 2026-09-11: "in Historie bei daneben auch
  // naeher beurteilen und dadurch ggf. anpassen". Dieselbe Chips ->
  // domain/diagnose.ts -> Vorschlag-Kette wie im Alltagspfad
  // (ShotErfassung.svelte), nur nachtraeglich und ohne Zeitdruck aufrufbar.
  // Nur bei "daneben" — bei einem guten Shot ergaebe eine Diagnose selten
  // einen sinnvollen Vorschlag (Regelwerk ist auf "etwas war auffaellig"
  // ausgelegt).
  const CHIP_GRUPPEN: { titel: string; gruppe: 'geschmack' | 'lauf' }[] = [
    { titel: 'Geschmack', gruppe: 'geschmack' },
    { titel: 'Lauf', gruppe: 'lauf' },
  ];
  const chipGruppen = $derived(
    CHIP_GRUPPEN.map((g) => ({
      titel: g.titel,
      chips: bestand.symptome.filter((s) => s.gruppe === g.gruppe).map((s) => ({ id: s.id, label: s.label })),
    })),
  );

  let diagnoseBefunde = $state<Befund[]>(untrack(() => shot?.befunde ?? []));
  let diagnoseFreitext = $state(untrack(() => shot?.freitext ?? ''));

  const vorherigeProfilShots = $derived(
    shot
      ? bestand.shots
          .filter((s) => s.profilId === shot.profilId && s.id !== shot.id)
          .map((s) => ({ ts: s.ts, vorschlagRegelId: s.vorschlag?.regelId, vorschlagZustand: s.vorschlag?.zustand }))
      : [],
  );
  const diagnoseAuswertung = $derived(
    shot ? ermittleDiagnose(diagnoseBefunde, bestand.symptome, shot.ts, vorherigeProfilShots) : { ergebnis: undefined, unterdrueckt: false },
  );

  // K67/K75 — derselbe Messreihen-Check wie im Alltagspfad: liegt der
  // Ist-Wert des betroffenen Parameters ausserhalb der bisherigen Messreihe
  // dieses Profils, entfaellt der Vorschlag mit Begruendung.
  const EINHEIT_PARAMETER: Record<RegelParameter, string> = { mg: '', kt: '°C', output: 'g', input: 'g' };
  const ausserhalbMessreihe = $derived.by(() => {
    const aenderung = diagnoseAuswertung.ergebnis?.aenderung;
    if (!aenderung || !shot) return undefined;
    const werte = bestand.shots
      .filter((s) => s.profilId === shot.profilId && s.id !== shot.id)
      .map((s) => s.ist[aenderung.parameter])
      .filter((w): w is number => w !== undefined);
    const reihe = bildeMessreihe(werte);
    if (!reihe) return undefined;
    const istWert = shot.ist[aenderung.parameter];
    if (istWert === undefined || (istWert >= reihe.min && istWert <= reihe.max)) return undefined;
    const einheit = aenderung.parameter === 'mg' && muehle?.skala.typ === 'klicks' ? 'Klicks' : EINHEIT_PARAMETER[aenderung.parameter];
    return `${messreiheSatz(reihe, einheit)} bisher · Vorschlag entfällt`;
  });

  // Ein bereits an diesem Shot haengender Vorschlag bleibt sichtbar und
  // bedienbar, unabhaengig von einer frischen K76-Pruefung — die gilt fuer
  // "einen neuen Vorschlag nicht ungefragt nachreichen", nicht dafuer, einen
  // schon bestehenden beim erneuten Ansehen zu verstecken.
  const zeigeVorschlag = $derived(
    !!diagnoseAuswertung.ergebnis &&
      ((shot?.vorschlag && shot.vorschlag.regelId === diagnoseAuswertung.ergebnis.regelId) || !diagnoseAuswertung.unterdrueckt),
  );
  const vorschlagStart = $derived.by((): 'offen' | 'uebernommen' | 'abgelehnt' | 'fehlt' => {
    if (ausserhalbMessreihe) return 'fehlt';
    if (shot?.vorschlag && diagnoseAuswertung.ergebnis && shot.vorschlag.regelId === diagnoseAuswertung.ergebnis.regelId) {
      return shot.vorschlag.zustand;
    }
    return 'offen';
  });

  function mgSchrittgroesse(parameter: RegelParameter): number {
    return parameter === 'mg' && muehle ? muehle.skala.schritt : 1;
  }

  // Anders als "Später" im Alltagspfad (bleibt "offen", K10 — man wird beim
  // naechsten Shot erneut gefragt) ist eine Ablehnung hier eine bewusste,
  // nachtraegliche Entscheidung: sie speichert "abgelehnt" und macht damit
  // "doch übernehmen" (Vorschlag.svelte) zum echten Rueckweg.
  async function diagnoseAbschliessen(uebernommen: boolean) {
    if (!shot || !profil) return;
    const ergebnis = diagnoseAuswertung.ergebnis;
    let aktualisiert = { ...shot, befunde: diagnoseBefunde, freitext: diagnoseFreitext.trim() || undefined };
    if (ergebnis && !ausserhalbMessreihe) {
      aktualisiert = {
        ...aktualisiert,
        vorschlag: {
          regelId: ergebnis.regelId,
          diagnose: ergebnis.diagnose,
          empfehlungstext: ergebnis.empfehlungstext,
          parameter: ergebnis.aenderung?.parameter,
          richtung: ergebnis.aenderung?.richtung,
          alt: ergebnis.aenderung ? profil.ziel[ergebnis.aenderung.parameter] : undefined,
          neu:
            ergebnis.aenderung && uebernommen
              ? berechneNeuenWert(ergebnis.aenderung, profil.ziel[ergebnis.aenderung.parameter] ?? 0, mgSchrittgroesse(ergebnis.aenderung.parameter))
              : undefined,
          zustand: uebernommen ? 'uebernommen' : 'abgelehnt',
          ts: Date.now(),
        },
      };
    }
    try {
      await schreiben('shot', aktualisiert);
      if (uebernommen && ergebnis?.aenderung && aktualisiert.vorschlag?.neu !== undefined) {
        await schreiben('profil', { ...profil, ziel: { ...profil.ziel, [ergebnis.aenderung.parameter]: aktualisiert.vorschlag.neu } });
      }
    } catch (e) {
      fehler = e instanceof Error ? e.message : String(e);
    }
  }
</script>

<!-- Der Kopf traegt den Kaffeenamen, nicht die Gattung (Rueckmeldung
     2026-09-08) — wie im Kaffeeblatt. -->
<Kopfzeile titel={kaffee?.name ?? 'Shot'} {onZurueck} gross />

{#if !shot}
  <p class="hinweis">Shot nicht gefunden.</p>
{:else}
  <p class="meta">{profil?.name} · {new Date(shot.ts).toLocaleDateString('de-DE')} {new Date(shot.ts).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</p>

  <div class="urteil-block">
    <p class="frage-objekt">Wie war er?</p>
    <Urteil start={berechneGesamt(shot.urteil) as 'daneben' | 'okay' | 'sehr gut'} onWahl={(s) => void urteilGeaendert(s)} />
    {#if fehler}<p class="fehler">{fehler}</p>{/if}
  </div>

  <div class="block">
    <h2>Parameter</h2>
    <div class="parameter-raster">
      <Parameterkachel symbol="input" label="Input" wert={shot.ist.input} einheit="g" />
      <Parameterkachel symbol="mahlgrad" label="Mahlgrad" wert={shot.ist.mg} einheit={muehle?.skala.typ === 'klicks' ? 'Klicks' : undefined} />
      {#if shot.ist.rpm !== undefined}
        <Parameterkachel symbol="drehzahl" label="Drehzahl" wert={shot.ist.rpm} einheit="rpm" />
      {/if}
      {#if shot.ist.kt !== undefined}
        <Parameterkachel symbol="kessel" label="Kessel" wert={shot.ist.kt} einheit="°C" />
      {/if}
    </div>
  </div>

  <div class="block">
    <h2>Ergebnis</h2>
    <Werteliste
      zeilen={[
        { label: 'Output', wert: shot.ist.output, einheit: 'g' },
        { label: 'Preinfusion', wert: shot.ist.pre ?? '—', einheit: 's' },
        { label: bruehgeraet?.fuehrungswert === 'durchlaufzeit' ? 'Durchlaufzeit' : 'Zeit', wert: shot.ist.zeit, einheit: 's' },
      ]}
    />
  </div>

  {#if shot.urteil === 'daneben'}
    <div class="block">
      <h2>Diagnose</h2>
      <p class="hinweis">Was störte? Bleibt am Shot stehen, auch ohne Auswahl.</p>
      <Chips
        gruppen={chipGruppen}
        start={diagnoseBefunde}
        freitextStart={diagnoseFreitext}
        onAenderung={(b) => (diagnoseBefunde = b)}
        onFreitext={(t) => (diagnoseFreitext = t)}
      />
      {#if zeigeVorschlag && diagnoseAuswertung.ergebnis}
        <div class="diagnose-vorschlag">
          <Vorschlag
            diagnose={diagnoseAuswertung.ergebnis.diagnose}
            empfehlung={diagnoseAuswertung.ergebnis.empfehlungstext}
            herkunft={diagnoseAuswertung.ergebnis.geschaetzt ? 'geschätzt aus Einzelbefund' : undefined}
            start={vorschlagStart}
            begruendungFehlt={ausserhalbMessreihe}
            datum={shot.vorschlag?.ts ? new Date(shot.vorschlag.ts).toLocaleDateString('de-DE') : undefined}
            onUebernehmen={() => void diagnoseAbschliessen(true)}
            onSpaeter={() => void diagnoseAbschliessen(false)}
            onDochUebernehmen={() => void diagnoseAbschliessen(true)}
          />
        </div>
      {/if}
      {#if fehler}<p class="fehler">{fehler}</p>{/if}
    </div>
  {:else if shot.befunde.length > 0 || shot.vorschlag}
    <div class="block gedaempft-block">
      <h2>Dial-in</h2>
      {#if shot.befunde.length > 0}
        <p class="befunde">{shot.befunde.map((b) => `${b.staerke} ${befundLabel(b.symptomId)}`).join(' · ')}</p>
      {/if}
      {#if shot.vorschlag}
        <p class="vorschlag">
          {shot.vorschlag.diagnose}{#if shot.vorschlag.empfehlungstext} — {shot.vorschlag.empfehlungstext}{/if}
          <span class="vorschlag-zustand">· {shot.vorschlag.zustand}</span>
        </p>
      {/if}
    </div>
  {/if}

  <div class="block">
    <h2>Verkostung</h2>
    {#if tasting}
      <!-- Rueckmeldung 2026-08-26: Ergebnis und erkannte Aromen stehen
           direkt hier, ohne dass man dafuer erst in den vollen Bogen
           wechseln muesste — der bleibt fuer alle, die tiefer wollen,
           einen Tap entfernt. -->
      <p class="tasting-satz">{tastingZusammenfassung}</p>
      {#if tastingAromen}
        <p class="tasting-aromen">{tastingAromen}</p>
      {/if}
      <Blattliste>
        <button type="button" class="verkostung-zeile" onclick={onOeffnenVerkostung}>
        <span>Bogen ansehen</span>
          <span class="chevron" aria-hidden="true">›</span>
        </button>
      </Blattliste>
    {:else}
      <Blattliste>
        <button type="button" class="verkostung-zeile" onclick={onOeffnenVerkostung}>
        <span>Verkostungsbogen ausfüllen</span>
          <span class="chevron" aria-hidden="true">›</span>
        </button>
      </Blattliste>
    {/if}
  </div>

  {#if shot.freitext}
    <p class="freitext">„{shot.freitext}“</p>
  {/if}
{/if}

<style>
  .meta {
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--gedaempft);
    margin: 0 0 var(--r5);
  }
  .urteil-block {
    margin-bottom: var(--r5);
  }
  .frage-objekt {
    font-size: var(--fs-objekt);
    letter-spacing: -0.01em;
    color: var(--tinte);
    margin: 0 0 var(--r3);
  }
  .block {
    margin-bottom: var(--r5);
  }
  /* Einzige erlaubte Abweichung vom globalen h2 (tokens.css): kein
     Abstand nach oben, weil der Kopf direkt an seinem Block klebt.
     Die uebrigen Eigenschaften waren eine wortgleiche Kopie. */
  h2 {
    margin-top: 0;
  }
  .parameter-raster {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--r2);
  }
  .gedaempft-block .befunde,
  .gedaempft-block .vorschlag {
    font-size: var(--fs-satz);
    color: var(--gedaempft);
    margin: 0 0 var(--r2);
  }
  .diagnose-vorschlag {
    margin-top: var(--r5);
  }
  .vorschlag-zustand {
    font-size: var(--fs-meta);
  }
  .tasting-satz {
    font-size: var(--fs-satz);
    color: var(--satz);
    margin: 0 0 var(--r2);
  }
  .tasting-aromen {
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--gedaempft);
    margin: 0 0 var(--r3);
  }
  /* Rückmeldung 2026-09-08: „das Grau gehört da nicht hin". Stimmt — und es
     kam von mir: beim Umbau auf Blattliste (Runde 4) habe ich die
     Kartenfläche aus dieser Regel genommen, ohne `background: transparent`
     zu setzen. Ein <button> ohne eigene Fläche bekommt die des Browsers
     (ButtonFace, hellgrau).
     Das Polster ist ebenfalls raus: die Karte bringt ihr eigenes mit, die
     Zeile war doppelt eingerückt. */
  .verkostung-zeile {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--r3);
    min-height: 56px;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--akzent);
    font-family: var(--schrift-sans);
    font-size: var(--fs-bedienwort);
    text-align: left;
    cursor: pointer;
  }
  .chevron {
    color: var(--spur);
    font-size: var(--fs-bedienwort);
  }
  .freitext {
    font-size: var(--fs-satz);
    color: var(--satz);
    font-style: italic;
  }
  .hinweis {
    color: var(--gedaempft);
    font-size: var(--fs-satz);
  }
  .fehler {
    color: var(--kritisch);
    font-size: var(--fs-satz);
  }
</style>
