<script lang="ts">
  // Profilblatt — K7 (Fuehrungswert je Geraet), Setup-Bindung (Befund 2:
  // "MG 65" ist nur mit Muehle eindeutig), K54 (Kessel/Gruppe als doppelte
  // Einheit), Spielraum je Groesse. Gussplan-Editor folgt in Etappe C.

  import { bestand, schreiben } from '../bestand.svelte';
  import { kesselZuGruppe } from '../../domain/temperatur';
  import { EINHEIT, type GemesseneGroesse } from '../../domain/spielraum';
  import Einzelauswahl from '../../muster/Einzelauswahl.svelte';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import Werteliste, { type WertelisteZeile } from '../../muster/Werteliste.svelte';
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

  function zahl(e: Event): number {
    return Number((e.currentTarget as HTMLInputElement).value.replace(',', '.'));
  }

  async function setupWechseln(neueSetupId: string) {
    if (!profil) return;
    speicherFehler = undefined;
    try {
      await schreiben('profil', { ...profil, setupId: neueSetupId });
    } catch (fehler) {
      speicherFehler = fehler instanceof Error ? fehler.message : String(fehler);
    }
  }

  // Punkt 6 der Korrekturrunde: Werteliste statt handgebautem Grid — alle
  // Werte gleich gross, kein Herkunftszeichen (hier wird nichts gemessen,
  // nur das Rezept gepflegt).
  const zielZeilen = $derived.by((): WertelisteZeile[] => {
    if (!profil) return [];
    const zeilen: WertelisteZeile[] = [
      { label: 'Input', wert: profil.ziel.input, einheit: 'g', onAendern: (w) => zielSpeichern('input', w) },
      {
        label: 'Mahlgrad',
        wert: profil.ziel.mg,
        einheit: muehle?.skala.typ === 'klicks' ? 'Klicks' : undefined,
        onAendern: (w) => zielSpeichern('mg', w),
      },
    ];
    if (muehle?.rpmEinstellbar) {
      zeilen.push({ label: 'Drehzahl', wert: profil.ziel.rpm ?? '', einheit: 'rpm', onAendern: (w) => zielSpeichern('rpm', w) });
    }
    if (bruehgeraet?.ktEinstellbar) {
      zeilen.push({
        label: 'Kesseltemperatur',
        wert: profil.ziel.kt ?? '',
        einheit: '°C',
        onAendern: (w) => zielSpeichern('kt', w),
        hinweis: ktHinweis,
      });
    }
    zeilen.push(
      { label: 'Output', wert: profil.ziel.output, einheit: 'g', onAendern: (w) => zielSpeichern('output', w) },
      { label: 'Preinfusion', wert: profil.ziel.pre ?? '', einheit: 's', onAendern: (w) => zielSpeichern('pre', w) },
      {
        label: bruehgeraet?.fuehrungswert === 'durchlaufzeit' ? 'Durchlaufzeit' : 'Zeit',
        wert: profil.ziel.zeit,
        einheit: 's',
        onAendern: (w) => zielSpeichern('zeit', w),
      },
    );
    return zeilen;
  });
</script>

{#if !profil}
  <Kopfzeile titel="Profil" onZurueck={onZurueck} />
  <p class="hinweis">Profil nicht gefunden.</p>
{:else}
  <Kopfzeile titel={profil.name} {onZurueck} />
  <button type="button" class="shot-loggen" onclick={onOeffnenShot}>Shot loggen</button>

  <p class="setup">{setup?.name ?? 'Setup unbekannt'} · {profil.modus === 'dialin' ? 'Dial-in' : 'eingefahren'}</p>

  <section class="setup-wahl">
    <h2>Setup</h2>
    <!-- Teil D der Korrekturrunde: die Migration muss bei "k6" zwischen
         Moka-1 und Moka-3 raten (siehe migrieren.ts) — das muss hier
         korrigierbar sein, ohne den Kaffee neu anzulegen. -->
    <Einzelauswahl
      optionen={bestand.setups.map((s) => ({ wert: s.id, label: s.name }))}
      wert={profil.setupId}
      onWahl={setupWechseln}
    />
  </section>

  <section class="ziel">
    <h2>Ziel</h2>
    <!-- Punkt 6 der Korrekturrunde: geteiltes Muster statt handgebautem
         Grid (muster/Werteliste.svelte) — kein Herkunftszeichen (hier wird
         nichts gemessen, nur das Rezept gepflegt) und keine
         Führungswert-Emphase: das Rezept zeigt alle Werte gleich groß, die
         Größenbetonung gehört ausschließlich in den Live-Kontext
         (ShotErfassung.svelte, dort über IstGegenZiel bereits vorhanden). -->
    <Werteliste zeilen={zielZeilen} />
  </section>

  <section class="spielraum">
    <h2>Spielraum</h2>
    <p class="hinweis-klein">Input und Mahlgrad haben keinen — dort ist jede Änderung Absicht.</p>
    {#each ['zeit', 'output', 'durchlaufzeit'] as const as groesse (groesse)}
      <div class="zeile">
        <span class="label">± {groesse}</span>
        <input class="wert-eingabe" type="text" inputmode="decimal" value={profil.spielraum[groesse]}
          onchange={(e) => spielraumSpeichern(groesse, zahl(e))} /> {EINHEIT[groesse]}
      </div>
    {/each}
  </section>

  {#if bruehgeraet?.typ === 'pourover'}
    <GussplanEditor {profilId} />
  {/if}

  {#if speicherFehler}
    <p class="fehler">Nicht gespeichert: {speicherFehler} — nochmal versuchen.</p>
  {/if}
{/if}

<style>
  .shot-loggen {
    display: block;
    min-height: var(--treffer);
    padding: 0 var(--r4);
    margin-bottom: var(--r4);
    background: var(--akzent);
    color: var(--h-papier);
    border: none;
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    cursor: pointer;
  }
  .setup {
    font-size: var(--fs-meta);
    color: var(--gedaempft);
    margin: 0 0 var(--r4);
  }
  h2 {
    font-size: var(--fs-label);
    letter-spacing: var(--label-spacing);
    text-transform: uppercase;
    color: var(--gedaempft);
    font-weight: var(--gw-text);
    margin: var(--r5) 0 var(--r2);
  }
  .zeile {
    display: flex;
    align-items: center;
    gap: var(--r2);
    min-height: var(--treffer);
    border-bottom: 1px solid var(--linie);
  }
  .label {
    width: var(--eigenschaftslabel);
    flex-shrink: 0;
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  .wert-eingabe {
    width: 80px;
    font-family: var(--schrift);
    font-variant-numeric: var(--zahl-features);
    font-size: var(--fs-satz);
    background: var(--feld);
    border: 1px solid var(--feld-rahmen);
    color: var(--tinte);
    padding: var(--r1) var(--r2);
  }
  .hinweis,
  .hinweis-klein {
    color: var(--gedaempft);
    font-size: var(--fs-meta);
  }
  .fehler {
    color: var(--kritisch);
    font-size: var(--fs-satz);
    margin-top: var(--r3);
  }
</style>
