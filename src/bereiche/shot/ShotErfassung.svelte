<script lang="ts">
  // Shot-Erfassung — das Herzstueck von Paket 03. K3 (Ziel im Gruppenkopf,
  // Ist vorbelegt), K5 (Output -> Preinfusion -> Zeit), K6 (Spielraum, K4
  // (die Quittung entsteht ueber bestand.shots in Bar.svelte, nicht hier),
  // K12 (Alltagskorrektur ohne Vorbelegung), K66 (Schreibfehler haelt die
  // Werte im Feld).
  //
  // "Wie war er?" schreibt den Shot sofort (ein Tap, K4). Bei "daneben"
  // folgt die Diagnose (Paket 04, Etappe A): Chips -> Regelwerk
  // (domain/diagnose.ts) -> Vorschlag mit Uebernehmen. Der Shot ist zu dem
  // Zeitpunkt schon geschrieben; Chips/Vorschlag aktualisieren ihn per
  // zweitem schreiben('shot', ...).

  // Visueller Redesign-Reset, Paket 3 (Handoff Abschnitt 6 "Shot-Logging"):
  // Einstellwerte (Input/Mahlgrad/Drehzahl/Kessel) stehen jetzt als
  // Parameterkachel-Raster statt Werteliste-Zeilen — gleiche Felder,
  // gleiches onAendern-Verhalten. "Ziel" (Output/Preinfusion/Zeit) bleibt
  // IstGegenZiel — das ist laut Handoff-Referenz weiterhin eine Zeilenliste
  // mit Herkunftskreisen, kein Kachel-Raster (die beiden Blöcke haben
  // unterschiedliche fachliche Bedeutung: eingestellt vs. gemessen).

  import { bestand, schreiben } from '../bestand.svelte';
  import { bildeMessreihe, messreiheSatz } from '../../domain/messreihe';
  import { diagnostiziere, diagnostiziereEigen, kehrtZurueck, berechneNeuenWert, type Befund, type RegelParameter } from '../../domain/diagnose';
  import { ermittleUebergaenge, chargenHinweis, driftHinweis } from '../../domain/drift';
  import IstGegenZiel from '../../muster/IstGegenZiel.svelte';
  import Parameterkachel from '../../muster/Parameterkachel.svelte';
  import Urteil from '../../muster/Urteil.svelte';
  import Knopf from '../../muster/Knopf.svelte';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import Chips from '../../muster/Chips.svelte';
  import Vorschlag from '../../muster/Vorschlag.svelte';
  import type { Shot, Urteil as UrteilTyp } from '../../daten/schema';

  // UX-Korrekturrunde (Regel 12): Kopfzeile setzt jeder Bildschirm selbst
  // statt Rahmen.svelte sie von aussen aufsetzt (siehe Musterblatt.svelte).
  let { profilId, onZurueck, onFertig }: { profilId: string; onZurueck: () => void; onFertig: () => void } = $props();

  const profil = $derived(bestand.profile.find((p) => p.id === profilId));
  const kaffee = $derived(profil ? bestand.kaffees.find((k) => k.id === profil.kaffeeId) : undefined);
  const bruehgeraet = $derived(profil ? bestand.bruehgeraetVon(profil.setupId) : undefined);
  const muehle = $derived(profil ? bestand.muehleVon(profil.setupId) : undefined);

  // Messreihe je Groesse, ueber alle Shots DIESES Profils (nicht des ganzen
  // Kaffees) — Espresso-Output und Pour-Over-Durchlaufzeit sind keine
  // vergleichbaren Groessen, auch bei derselben Bohne.
  const messreiheOutput = $derived(
    bildeMessreihe(bestand.shots.filter((s) => s.profilId === profilId).map((s) => s.ist.output)),
  );
  const messreiheZeit = $derived(
    bildeMessreihe(bestand.shots.filter((s) => s.profilId === profilId).map((s) => s.ist.zeit)),
  );

  // Input/Mahlgrad haben keinen Spielraum (K6) — reine Eingabefelder,
  // mit dem Ziel vorbelegt, jede Aenderung ist Absicht.
  let input = $state(0);
  let mg = $state(0);
  let rpm = $state<number | undefined>(undefined);
  let kt = $state<number | undefined>(undefined);
  let istWerte = $state<readonly number[]>([]);

  let vorherigeProfilId: string | undefined;
  $effect(() => {
    if (!profil || profil.id === vorherigeProfilId) return;
    vorherigeProfilId = profil.id;
    input = profil.ziel.input;
    mg = profil.ziel.mg;
    rpm = profil.ziel.rpm;
    kt = profil.ziel.kt;
  });

  type Phase = 'eingabe' | 'schreibfehler' | 'diagnose' | 'alltagskorrektur' | 'drift' | 'fertig';
  let phase = $state<Phase>('eingabe');
  let schreibFehlerText = $state('');
  let entwurf = $state<Shot | undefined>(undefined);
  let mgAbweichung = $state<{ alt: number; neu: number } | undefined>(undefined);
  let driftText = $state<string | undefined>(undefined);

  // Chargenwechsel-Hinweis (konzept.md:528) — proaktiv VOR dem Bezug, wenn
  // dieser Shot der erste auf der aktuellen Charge waere. Reine Anzeige,
  // keine Aktion: die App warnt, sie greift nicht ein.
  const profilShots = $derived(bestand.shots.filter((s) => s.profilId === profilId));
  const isErsterShotAufCharge = $derived(
    !!kaffee?.aktuelleChargeId && !profilShots.some((s) => s.chargeId === kaffee.aktuelleChargeId),
  );
  const chargenHinweisText = $derived.by(() => {
    if (!isErsterShotAufCharge) return undefined;
    const uebergaenge = ermittleUebergaenge(profilShots.map((s) => ({ chargeId: s.chargeId, ts: s.ts, zeit: s.ist.zeit })));
    return chargenHinweis(uebergaenge);
  });

  // Diagnose-Schritt (nur bei "daneben") — Chips melden ihre Auswahl per
  // onAenderung/onFreitext (Chips.svelte, kontrollierte Fassung).
  let diagnoseBefunde = $state<Befund[]>([]);
  let diagnoseFreitext = $state('');

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

  // Erst das System-Regelwerk, dann eigene Chips mit Regel (Weg b) —
  // ein eigener Chip triggert allein, das System-Regelwerk braucht eine
  // Kombination und ist damit die spezifischere Aussage.
  const diagnoseErgebnis = $derived(
    diagnostiziere(diagnoseBefunde) ?? diagnostiziereEigen(diagnoseBefunde, bestand.symptome),
  );

  // K76 — ein bereits diagnostizierter, nicht uebernommener Befund legt sich
  // nicht bei jedem folgenden Shot erneut vor. Er kehrt erst zurueck, wenn
  // der UNMITTELBAR vorherige Shot auf diesem Profil dieselbe Regel zeigte
  // (kehrtZurueck) — sonst bleibt er unterdrueckt, auch wenn er bei einem
  // noch frueheren Shot schon einmal auftauchte.
  const vorherigeProfilShots = $derived(
    bestand.shots.filter((s) => s.profilId === profilId && s.id !== entwurf?.id).sort((a, b) => b.ts - a.ts),
  );
  const vorherigeRegelId = $derived.by(() => {
    const v = vorherigeProfilShots[0]?.vorschlag;
    return v && v.zustand !== 'uebernommen' ? v.regelId : undefined;
  });
  const wurdeBereitsGezeigt = $derived(
    diagnoseErgebnis ? vorherigeProfilShots.some((s) => s.vorschlag?.regelId === diagnoseErgebnis.regelId && s.vorschlag?.zustand !== 'uebernommen') : false,
  );
  const diagnoseUnterdrueckt = $derived(
    diagnoseErgebnis
      ? wurdeBereitsGezeigt && !kehrtZurueck(vorherigeRegelId, diagnoseErgebnis.regelId)
      : false,
  );

  // K67/K75 — liegt der Ist-Wert des betroffenen Parameters ausserhalb der
  // bisherigen Messreihe dieses Profils, entfaellt der Vorschlag mit
  // Begruendung statt eine Diagnose zu erzwingen.
  const messreiheAenderung = $derived.by(() => {
    const aenderung = diagnoseErgebnis?.aenderung;
    if (!aenderung) return undefined;
    const werte = bestand.shots
      .filter((s) => s.profilId === profilId && s.id !== entwurf?.id)
      .map((s) => s.ist[aenderung.parameter])
      .filter((w): w is number => w !== undefined);
    return bildeMessreihe(werte);
  });
  const EINHEIT_PARAMETER: Record<RegelParameter, string> = { mg: '', kt: '°C', output: 'g', input: 'g' };
  const ausserhalbMessreihe = $derived.by(() => {
    const aenderung = diagnoseErgebnis?.aenderung;
    const reihe = messreiheAenderung;
    if (!aenderung || !reihe || !entwurf) return undefined;
    const istWert = entwurf.ist[aenderung.parameter];
    if (istWert === undefined) return undefined;
    if (istWert >= reihe.min && istWert <= reihe.max) return undefined;
    const einheit = aenderung.parameter === 'mg' && muehle?.skala.typ === 'klicks' ? 'Klicks' : EINHEIT_PARAMETER[aenderung.parameter];
    return `${messreiheSatz(reihe, einheit)} bisher · Vorschlag entfällt`;
  });

  async function diagnoseAbschliessen(uebernommen: boolean) {
    if (!entwurf || !profil) return;
    let aktualisiert: Shot = { ...entwurf, befunde: diagnoseBefunde, freitext: diagnoseFreitext.trim() || undefined };
    const ergebnis = diagnoseErgebnis;
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
          zustand: uebernommen ? 'uebernommen' : 'offen',
          ts: Date.now(),
        },
      };
    }
    try {
      await schreiben('shot', aktualisiert);
      if (uebernommen && ergebnis?.aenderung && aktualisiert.vorschlag?.neu !== undefined) {
        await schreiben('profil', { ...profil, ziel: { ...profil.ziel, [ergebnis.aenderung.parameter]: aktualisiert.vorschlag.neu } });
      }
    } catch (fehler) {
      schreibFehlerText = fehler instanceof Error ? fehler.message : String(fehler);
      phase = 'schreibfehler';
      return;
    }
    phase = 'fertig';
    onFertig();
  }

  function mgSchrittgroesse(parameter: RegelParameter): number {
    return parameter === 'mg' && muehle ? muehle.skala.schritt : 1;
  }

  async function urteilGewaehlt(stufe: 'daneben' | 'okay' | 'sehr gut' | 'Referenz') {
    if (!profil || !kaffee) return;
    if (!kaffee.aktuelleChargeId) {
      schreibFehlerText = 'keine aktuelle Charge am Kaffee hinterlegt';
      phase = 'schreibfehler';
      return;
    }

    const urteil: UrteilTyp = stufe === 'Referenz' ? 'referenz' : stufe;
    const shot: Shot = {
      id: crypto.randomUUID(),
      ts: Date.now(),
      kaffeeId: kaffee.id,
      chargeId: kaffee.aktuelleChargeId,
      profilId: profil.id,
      setupId: profil.setupId,
      ist: {
        input,
        mg,
        rpm,
        kt,
        output: istWerte[0] ?? profil.ziel.output,
        pre: profil.ziel.pre,
        zeit: istWerte[2] ?? profil.ziel.zeit,
      },
      istHerkunft: {},
      portionen: 1,
      urteil,
      befunde: [],
    };
    entwurf = shot;
    await schreibversuch(shot);
  }

  async function schreibversuch(shot: Shot) {
    try {
      await schreiben('shot', shot);
      if (shot.urteil === 'daneben') {
        // Paket 04, Etappe A — Diagnose statt direktem Abschluss.
        phase = 'diagnose';
        return;
      }

      // Siebte Regelzeile (konzept.md:514) — feuert ohne Meldung, allein aus
      // der Profil-Laufzeit. Bewusst VOR diesem Shot berechnet (die
      // vorherigen Zeiten schliessen ihn nicht ein) — "schneller als die
      // eigene Historie" darf sich nicht an sich selbst messen.
      driftText = driftHinweis(
        bestand.shots.filter((s) => s.profilId === profilId && s.id !== shot.id).map((s) => s.ist.zeit),
        shot.ist.zeit,
        true,
      );

      if ((shot.urteil === 'sehr gut' || shot.urteil === 'referenz') && profil && mg !== profil.ziel.mg) {
        // K12 — Alltagskorrektur nur bei sehr gut/Referenz UND abweichendem
        // Mahlgrad, und ausdruecklich ohne Vorbelegung. Der Drift-Hinweis
        // erscheint, falls vorhanden, im selben Zug als zusaetzliche Zeile.
        mgAbweichung = { alt: profil.ziel.mg, neu: mg };
        phase = 'alltagskorrektur';
      } else if (driftText) {
        phase = 'drift';
      } else {
        phase = 'fertig';
        onFertig();
      }
    } catch (fehler) {
      schreibFehlerText = fehler instanceof Error ? fehler.message : String(fehler);
      phase = 'schreibfehler';
    }
  }

  function nochmalSpeichern() {
    if (entwurf) void schreibversuch(entwurf);
  }

  function shotVerwerfen() {
    entwurf = undefined;
    phase = 'eingabe';
  }

  function driftAbschliessen() {
    phase = 'fertig';
    onFertig();
  }

  async function alltagskorrekturAntwort(ja: boolean) {
    if (ja && profil && mgAbweichung) {
      try {
        await schreiben('profil', { ...profil, ziel: { ...profil.ziel, mg: mgAbweichung.neu } });
      } catch {
        // Der Shot ist schon geloggt (K4) — ein Fehler hier betrifft nur
        // die Uebernahme, nicht das Logging. Kein zweiter Fehlerpfad noetig,
        // die Uebernahme laesst sich am Profilblatt nachholen.
      }
    }
    phase = 'fertig';
    onFertig();
  }
</script>

<Kopfzeile titel="Shot loggen" {onZurueck} />

{#if !profil || !kaffee}
  <p class="hinweis">Profil nicht gefunden.</p>
{:else if phase === 'schreibfehler'}
  <p class="fehler-titel">Nicht gespeichert</p>
  <p class="hinweis">{schreibFehlerText}</p>
  <div class="knopfreihe">
    <Knopf stufe="primaer" onKlick={nochmalSpeichern}>nochmal speichern</Knopf>
    <Knopf stufe="still" onKlick={shotVerwerfen}>Shot verwerfen</Knopf>
  </div>
{:else if phase === 'diagnose'}
  <p class="frage-titel">Was stört?</p>
  <p class="hinweis">Bleibt am Shot stehen, auch ohne Auswahl — „fertig" reicht.</p>

  <Chips
    gruppen={chipGruppen}
    onAenderung={(befunde) => (diagnoseBefunde = befunde)}
    onFreitext={(text) => (diagnoseFreitext = text)}
  />

  {#if diagnoseErgebnis && !diagnoseUnterdrueckt}
    <div class="diagnose-vorschlag">
      <Vorschlag
        diagnose={diagnoseErgebnis.diagnose}
        empfehlung={diagnoseErgebnis.empfehlungstext}
        start={ausserhalbMessreihe ? 'fehlt' : 'offen'}
        begruendungFehlt={ausserhalbMessreihe}
        onUebernehmen={() => void diagnoseAbschliessen(true)}
        onSpaeter={() => void diagnoseAbschliessen(false)}
      />
    </div>
  {/if}

  {#if !diagnoseErgebnis || diagnoseUnterdrueckt || ausserhalbMessreihe}
    <div class="knopfreihe">
      <Knopf stufe="primaer" onKlick={() => void diagnoseAbschliessen(false)}>fertig</Knopf>
    </div>
  {/if}
{:else if phase === 'alltagskorrektur' && mgAbweichung}
  <p class="frage-titel">
    {mgAbweichung.neu} statt {mgAbweichung.alt} — und er war {entwurf?.urteil === 'referenz' ? 'Referenz' : 'sehr gut'}.
  </p>
  <p class="frage">Als neuen Ausgangswert übernehmen?</p>
  <!-- K12: eine Rezepturaenderung wird nie vorbelegt — deshalb kein
       VorbelegteFrage.svelte (deren "anteil" echte Ranking-Fenster-Bedeutung
       hat, die es fuer diese Einzelentscheidung nicht gibt), sondern zwei
       gleichwertig anklickbare Knoepfe, nur mit Knopf-Hierarchie (Regel 3),
       ohne Default-Auswahl. -->
  <div class="knopfreihe">
    <Knopf stufe="primaer" onKlick={() => alltagskorrekturAntwort(true)}>Ja</Knopf>
    <Knopf stufe="still" onKlick={() => alltagskorrekturAntwort(false)}>Nein</Knopf>
  </div>
  {#if driftText}
    <p class="hinweis drift-zeile">{driftText}</p>
  {/if}
{:else if phase === 'drift' && driftText}
  <p class="hinweis">{driftText}</p>
  <div class="knopfreihe">
    <Knopf stufe="primaer" onKlick={driftAbschliessen}>fertig</Knopf>
  </div>
{:else}
  <h1>{kaffee.name}</h1>
  <p class="setup">{profil.name}</p>

  {#if chargenHinweisText}
    <p class="hinweis charge-hinweis">{chargenHinweisText}</p>
  {/if}

  <div class="eingestellt">
    <p class="gruppenkopf">Parameter</p>
    <div class="parameter-raster">
      <Parameterkachel symbol="input" label="Input" wert={input} einheit="g" onAendern={(w) => (input = w)} />
      <Parameterkachel
        symbol="mahlgrad"
        label="Mahlgrad"
        wert={mg}
        einheit={muehle?.skala.typ === 'klicks' ? 'Klicks' : undefined}
        onAendern={(w) => (mg = w)}
      />
      {#if muehle?.rpmEinstellbar}
        <Parameterkachel symbol="drehzahl" label="Drehzahl" wert={rpm ?? ''} einheit="rpm" onAendern={(w) => (rpm = w)} />
      {/if}
      {#if bruehgeraet?.ktEinstellbar}
        <Parameterkachel symbol="kessel" label="Kessel" wert={kt ?? ''} einheit="°C" onAendern={(w) => (kt = w)} />
      {/if}
    </div>
  </div>

  <!-- Spielraum-Zuordnung Zeit/Durchlaufzeit gefolgt der Profilblatt-Logik
       (Profilblatt.svelte, Ziel-Parameterkacheln): welches Spielraum-Feld
       gilt, haengt am Fuehrungswert des Bruehgeraets (K7), nicht am
       Wortlaut "Zeit" allein
       — vorher waren Preinfusion und Zeit vertauscht (Preinfusion bekam
       spielraum.zeit, was als Naeherung passt, weil es keinen eigenen
       Preinfusion-Spielraum gibt; Zeit bekam faelschlich spielraum.durchlaufzeit,
       auch bei Espresso-Geraeten ohne Durchlaufzeit-Fuehrungswert). -->
  <IstGegenZiel
    titel="Ziel"
    zeilen={[
      { label: 'Output', einheit: 'g', ziel: profil.ziel.output, spielraum: profil.spielraum.output, messreihe: messreiheOutput },
      { label: 'Preinfusion', einheit: 's', ziel: profil.ziel.pre ?? 0, spielraum: profil.spielraum.zeit },
      {
        label: bruehgeraet?.fuehrungswert === 'durchlaufzeit' ? 'Durchlaufzeit' : 'Zeit',
        einheit: 's',
        ziel: profil.ziel.zeit,
        spielraum: bruehgeraet?.fuehrungswert === 'durchlaufzeit' ? profil.spielraum.durchlaufzeit : profil.spielraum.zeit,
        messreihe: messreiheZeit,
      },
    ]}
    onAenderung={(werte) => (istWerte = werte)}
  />

  <div class="urteil-block">
    <p class="frage-objekt">Wie war er?</p>
    <Urteil onWahl={(stufe) => void urteilGewaehlt(stufe)} />
  </div>
{/if}

<style>
  /* Objektname (Handoff 3.2: 20-21/400/-.01em) statt Screentitel-Groesse —
     der Kaffeename ist hier Inhalt, keine Ueberschrift mit Rueckweg
     daneben (der steht schon in der Kopfzeile darueber). */
  h1 {
    font-size: var(--fs-objekt);
    font-weight: var(--gw-text);
    letter-spacing: -0.01em;
    margin: 0;
  }
  .setup {
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--gedaempft);
    margin: 0 0 var(--r4);
  }
  .gruppenkopf {
    font-family: var(--schrift-sans);
    font-size: var(--fs-gruppenkopf);
    letter-spacing: var(--label-spacing);
    text-transform: uppercase;
    color: var(--gedaempft);
    margin: 0 0 var(--r-kachelabstand);
  }
  .eingestellt {
    margin-bottom: var(--r4);
  }
  .urteil-block {
    margin-top: var(--r5);
  }
  .diagnose-vorschlag {
    margin-top: var(--r5);
  }
  .charge-hinweis {
    margin: 0 0 var(--r4);
  }
  .drift-zeile {
    margin-top: var(--r4);
  }
  .frage {
    font-size: var(--fs-satz);
    color: var(--satz);
    margin: 0 0 var(--r3);
  }
  /* "Wie war er?" ist der Objektname-Prompt der Handoff-Referenz C3
     (20/400/-.01em), keine Meta-Rueckfrage wie die uebrigen .frage-Zeilen. */
  .frage-objekt {
    font-size: var(--fs-objekt);
    letter-spacing: -0.01em;
    color: var(--tinte);
    margin: 0 0 var(--r3);
  }
  .frage-titel {
    font-size: var(--fs-urteil);
    color: var(--tinte);
    margin: 0 0 var(--r2);
  }
  .fehler-titel {
    font-size: var(--fs-urteil);
    color: var(--kritisch);
    margin: 0 0 var(--r2);
  }
  .hinweis {
    color: var(--gedaempft);
    font-size: var(--fs-satz);
  }
  .knopfreihe {
    display: flex;
    gap: var(--r3);
    margin-top: var(--r4);
  }
</style>
