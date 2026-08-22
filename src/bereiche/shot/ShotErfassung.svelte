<script lang="ts">
  // Shot-Erfassung — das Herzstueck von Paket 03. K3 (Ziel im Gruppenkopf,
  // Ist vorbelegt), K5 (Output -> Preinfusion -> Zeit), K6 (Spielraum, K4
  // (die Quittung entsteht ueber bestand.shots in Bar.svelte, nicht hier),
  // K12 (Alltagskorrektur ohne Vorbelegung), K66 (Schreibfehler haelt die
  // Werte im Feld).
  //
  // "Wie war er?" schreibt den Shot sofort (ein Tap, K4). Diagnose bei
  // "daneben" ist Paket 04 und wird hier nicht gebaut — das Urteil wird
  // geloggt, mehr nicht.

  import { bestand, schreiben } from '../bestand.svelte';
  import { bildeMessreihe } from '../../domain/messreihe';
  import IstGegenZiel from '../../muster/IstGegenZiel.svelte';
  import Werteliste, { type WertelisteZeile } from '../../muster/Werteliste.svelte';
  import Urteil from '../../muster/Urteil.svelte';
  import Knopf from '../../muster/Knopf.svelte';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
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

  // Einstellwerte als Werteliste (docs/konzept.md:721 — "Ziel im
  // Gruppenkopf, Führungswert groß, die Einstellwerte darunter"): stehen
  // deshalb unterhalb der Ziel-Karte, nicht davor. Kein hinweis-Text hier
  // (keine Gruppentemperatur-Anzeige) — anders als im Profilblatt war das
  // hier nie vorgesehen, das bleibt ein reines Eingabefeld.
  const einstellwerte = $derived.by((): WertelisteZeile[] => {
    const zeilen: WertelisteZeile[] = [
      { label: 'Input', wert: input, einheit: 'g', onAendern: (w) => (input = w) },
      { label: 'Mahlgrad', wert: mg, einheit: muehle?.skala.typ === 'klicks' ? 'Klicks' : undefined, onAendern: (w) => (mg = w) },
    ];
    if (muehle?.rpmEinstellbar) {
      zeilen.push({ label: 'Drehzahl', wert: rpm ?? '', einheit: 'rpm', onAendern: (w) => (rpm = w) });
    }
    if (bruehgeraet?.ktEinstellbar) {
      zeilen.push({ label: 'Kessel', wert: kt ?? '', einheit: '°C', onAendern: (w) => (kt = w) });
    }
    return zeilen;
  });

  type Phase = 'eingabe' | 'schreibfehler' | 'alltagskorrektur' | 'fertig';
  let phase = $state<Phase>('eingabe');
  let schreibFehlerText = $state('');
  let entwurf = $state<Shot | undefined>(undefined);
  let mgAbweichung = $state<{ alt: number; neu: number } | undefined>(undefined);

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
      // K12 — Alltagskorrektur nur bei sehr gut/Referenz UND abweichendem
      // Mahlgrad, und ausdruecklich ohne Vorbelegung.
      if ((shot.urteil === 'sehr gut' || shot.urteil === 'referenz') && profil && mg !== profil.ziel.mg) {
        mgAbweichung = { alt: profil.ziel.mg, neu: mg };
        phase = 'alltagskorrektur';
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
{:else}
  <h1>{kaffee.name}</h1>
  <p class="setup">{profil.name}</p>

  <div class="eingestellt">
    <Werteliste zeilen={einstellwerte} />
  </div>

  <!-- Spielraum-Zuordnung Zeit/Durchlaufzeit gefolgt der Profilblatt-Logik
       (Profilblatt.svelte zielZeilen): welches Spielraum-Feld gilt, haengt
       am Fuehrungswert des Bruehgeraets (K7), nicht am Wortlaut "Zeit" allein
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
    <p class="frage">Wie war er?</p>
    <Urteil onWahl={(stufe) => void urteilGewaehlt(stufe)} />
  </div>
{/if}

<style>
  h1 {
    font-size: var(--fs-titel);
    font-weight: var(--gw-titel);
    margin: 0;
  }
  .setup {
    font-size: var(--fs-meta);
    color: var(--gedaempft);
    margin: 0 0 var(--r4);
  }
  .eingestellt {
    margin-bottom: var(--r4);
  }
  .urteil-block {
    margin-top: var(--r5);
  }
  .frage {
    font-size: var(--fs-satz);
    color: var(--satz);
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
