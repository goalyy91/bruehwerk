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
  import Urteil from '../../muster/Urteil.svelte';
  import type { Shot, Urteil as UrteilTyp } from '../../daten/schema';

  let { profilId, onFertig }: { profilId: string; onFertig: () => void } = $props();

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

{#if !profil || !kaffee}
  <p class="hinweis">Profil nicht gefunden.</p>
{:else if phase === 'schreibfehler'}
  <p class="fehler-titel">Nicht gespeichert</p>
  <p class="hinweis">{schreibFehlerText}</p>
  <div class="knopfreihe">
    <button type="button" class="primaer" onclick={nochmalSpeichern}>nochmal speichern</button>
    <button type="button" class="sekundaer" onclick={shotVerwerfen}>Shot verwerfen</button>
  </div>
{:else if phase === 'alltagskorrektur' && mgAbweichung}
  <p class="frage-titel">
    {mgAbweichung.neu} statt {mgAbweichung.alt} — und er war {entwurf?.urteil === 'referenz' ? 'Referenz' : 'sehr gut'}.
  </p>
  <p class="frage">Als neuen Ausgangswert übernehmen?</p>
  <div class="knopfreihe">
    <button type="button" onclick={() => alltagskorrekturAntwort(true)}>Ja</button>
    <button type="button" onclick={() => alltagskorrekturAntwort(false)}>Nein</button>
  </div>
{:else}
  <h1>{kaffee.name}</h1>
  <p class="setup">{profil.name}</p>

  <div class="eingestellt">
    <label>Input <input type="text" inputmode="decimal" value={input}
      onchange={(e) => (input = Number((e.currentTarget as HTMLInputElement).value.replace(',', '.')))} /> g</label>
    <label>Mahlgrad <input type="text" inputmode="decimal" value={mg}
      onchange={(e) => (mg = Number((e.currentTarget as HTMLInputElement).value.replace(',', '.')))} />
      {muehle?.skala.typ === 'klicks' ? 'Klicks' : ''}</label>
    {#if muehle?.rpmEinstellbar}
      <label>Drehzahl <input type="text" inputmode="decimal" value={rpm ?? ''}
        onchange={(e) => (rpm = Number((e.currentTarget as HTMLInputElement).value))} /> rpm</label>
    {/if}
    {#if bruehgeraet?.ktEinstellbar}
      <label>Kessel <input type="text" inputmode="decimal" value={kt ?? ''}
        onchange={(e) => (kt = Number((e.currentTarget as HTMLInputElement).value))} /> °C</label>
    {/if}
  </div>

  <IstGegenZiel
    titel="Ziel"
    zeilen={[
      { label: 'Output', einheit: 'g', ziel: profil.ziel.output, spielraum: profil.spielraum.output, messreihe: messreiheOutput },
      { label: 'Preinfusion', einheit: 's', ziel: profil.ziel.pre ?? 0, spielraum: profil.spielraum.zeit },
      { label: 'Zeit', einheit: 's', ziel: profil.ziel.zeit, spielraum: profil.spielraum.durchlaufzeit, messreihe: messreiheZeit },
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
    display: flex;
    flex-wrap: wrap;
    gap: var(--r3);
    margin-bottom: var(--r4);
  }
  .eingestellt label {
    display: flex;
    align-items: center;
    gap: var(--r1);
    font-size: var(--fs-meta);
    color: var(--satz);
  }
  .eingestellt input {
    width: 64px;
    font-family: var(--schrift);
    font-variant-numeric: var(--zahl-features);
    font-size: var(--fs-satz);
    background: var(--feld);
    border: 1px solid var(--feld-rahmen);
    color: var(--tinte);
    padding: var(--r1) var(--r2);
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
  .knopfreihe button {
    min-height: var(--treffer);
    padding: 0 var(--r4);
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    cursor: pointer;
    border: 1px solid var(--linie);
    background: var(--feld);
    color: var(--tinte);
  }
  .knopfreihe .primaer {
    background: var(--akzent);
    color: var(--h-papier);
    border: none;
  }
  .knopfreihe .sekundaer {
    background: transparent;
    color: var(--gedaempft);
    border: none;
  }
</style>
