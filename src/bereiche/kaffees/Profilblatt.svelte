<script lang="ts">
  // Profilblatt — K7 (Fuehrungswert je Geraet), Setup-Bindung (Befund 2:
  // "MG 65" ist nur mit Muehle eindeutig), K54 (Kessel/Gruppe als doppelte
  // Einheit), Spielraum je Groesse. Gussplan-Editor folgt in Etappe C.

  import { bestand, schreiben } from '../bestand.svelte';
  import { kesselZuGruppe } from '../../domain/temperatur';
  import { EINHEIT, type GemesseneGroesse } from '../../domain/spielraum';
  import DoppelteEinheit from '../../muster/DoppelteEinheit.svelte';
  import Einzelauswahl from '../../muster/Einzelauswahl.svelte';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
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

    <!-- Punkt 6a/6b der Korrekturrunde: echtes CSS-Grid statt einzelner
         Flex-Zeilen, damit Label/Wert/Einheit sauber spaltenweise
         ausgerichtet sind — im selben visuellen Stil wie die geteilten
         Muster (IstGegenZiel.svelte). Kein Herkunftszeichen (hier wird
         nichts gemessen, nur das Rezept gepflegt) und keine
         Führungswert-Emphase: das Rezept zeigt alle Werte gleich groß,
         die Größenbetonung gehört ausschließlich in den Live-Kontext
         (ShotErfassung.svelte, dort über IstGegenZiel bereits vorhanden). -->
    <div class="ziel-grid">
      <div class="zg-zeile">
        <span class="zg-label">Input</span>
        <input class="zg-wert" type="text" inputmode="decimal" value={profil.ziel.input}
          onchange={(e) => zielSpeichern('input', zahl(e))} />
        <span class="zg-einheit">g</span>
      </div>
      <div class="zg-zeile">
        <span class="zg-label">Mahlgrad</span>
        <input class="zg-wert" type="text" inputmode="decimal" value={profil.ziel.mg}
          onchange={(e) => zielSpeichern('mg', zahl(e))} />
        <span class="zg-einheit">{muehle?.skala.typ === 'klicks' ? 'Klicks' : ''}</span>
      </div>
      {#if muehle?.rpmEinstellbar}
        <div class="zg-zeile">
          <span class="zg-label">Drehzahl</span>
          <input class="zg-wert" type="text" inputmode="decimal" value={profil.ziel.rpm ?? ''}
            onchange={(e) => zielSpeichern('rpm', zahl(e))} />
          <span class="zg-einheit">rpm</span>
        </div>
      {/if}
      {#if bruehgeraet?.ktEinstellbar}
        <div class="zg-zeile">
          <span class="zg-label">Kesseltemperatur</span>
          <div class="zg-doppel">
            <input class="zg-wert" type="text" inputmode="decimal" value={profil.ziel.kt ?? ''}
              onchange={(e) => zielSpeichern('kt', zahl(e))} />
            {#if gruppenTemperatur?.bekannt}
              <DoppelteEinheit
                fuehrendWert={String(profil.ziel.kt)}
                fuehrendEinheit="°C Kessel"
                abgeleitetWert={gruppenTemperatur.herkunft === 'geschaetzt'
                  ? Math.round(gruppenTemperatur.wert).toString()
                  : gruppenTemperatur.wert.toFixed(1)}
                abgeleitetEinheit="°C Gruppe"
              />
            {:else if profil.ziel.kt !== undefined}
              <span class="zg-hinweis">außerhalb der Messreihe</span>
            {/if}
          </div>
        </div>
      {/if}

      <div class="zg-zeile">
        <span class="zg-label">Output</span>
        <input class="zg-wert" type="text" inputmode="decimal" value={profil.ziel.output}
          onchange={(e) => zielSpeichern('output', zahl(e))} />
        <span class="zg-einheit">g</span>
      </div>
      <div class="zg-zeile">
        <span class="zg-label">Preinfusion</span>
        <input class="zg-wert" type="text" inputmode="decimal" value={profil.ziel.pre ?? ''}
          onchange={(e) => zielSpeichern('pre', zahl(e))} />
        <span class="zg-einheit">s</span>
      </div>
      <div class="zg-zeile">
        <span class="zg-label">{bruehgeraet?.fuehrungswert === 'durchlaufzeit' ? 'Durchlaufzeit' : 'Zeit'}</span>
        <input class="zg-wert" type="text" inputmode="decimal" value={profil.ziel.zeit}
          onchange={(e) => zielSpeichern('zeit', zahl(e))} />
        <span class="zg-einheit">s</span>
      </div>
    </div>
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
  /* Ziel-Sektion (Punkt 6): echtes Grid statt Flex-Zeilen, alle Werte
     gleich groß — kein Feld hier ist wichtiger als ein anderes, das
     Rezept ist reine Eingabe, kein Live-Vergleich. */
  .ziel-grid {
    display: grid;
    grid-template-columns: var(--eigenschaftslabel) 1fr auto;
    align-items: center;
    column-gap: var(--r2);
    row-gap: var(--r3);
  }
  .zg-zeile {
    display: contents;
  }
  .zg-label {
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  .zg-wert {
    justify-self: end;
    width: 80px;
    font-family: var(--schrift);
    font-variant-numeric: var(--zahl-features);
    font-size: var(--fs-satz);
    background: var(--feld);
    border: 1px solid var(--feld-rahmen);
    color: var(--tinte);
    padding: var(--r1) var(--r2);
  }
  .zg-einheit {
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  .zg-doppel {
    grid-column: 2 / 4;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: var(--r3);
  }
  .zg-doppel .zg-wert {
    justify-self: unset;
  }
  .zg-hinweis {
    font-size: var(--fs-meta);
    color: var(--gedaempft);
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
