<script lang="ts">
  // Profilblatt — K7 (Fuehrungswert je Geraet), Setup-Bindung (Befund 2:
  // "MG 65" ist nur mit Muehle eindeutig), K54 (Kessel/Gruppe als doppelte
  // Einheit), Spielraum je Groesse. Gussplan-Editor folgt in Etappe C.

  import { bestand, schreiben } from '../bestand.svelte';
  import { kesselZuGruppe } from '../../domain/temperatur';
  import { EINHEIT, type GemesseneGroesse } from '../../domain/spielraum';
  import DoppelteEinheit from '../../muster/DoppelteEinheit.svelte';
  import type { Profil } from '../../daten/schema';

  let { profilId, onZurueck }: { profilId: string; onZurueck: () => void } = $props();

  const profil = $derived(bestand.profile.find((p) => p.id === profilId));
  const bruehgeraet = $derived(profil ? bestand.bruehgeraetVon(profil.setupId) : undefined);
  const muehle = $derived(profil ? bestand.muehleVon(profil.setupId) : undefined);
  const setup = $derived(profil ? bestand.setups.find((s) => s.id === profil.setupId) : undefined);

  // ZielWerte kennt nur 'zeit', nicht getrennt 'durchlaufzeit' — beim
  // Pour Over traegt dasselbe Feld die Durchlaufzeit, K7 nennt es nur
  // anders. fuehrungsFeld bildet den Konzept-Namen auf das Schema-Feld ab.
  const fuehrungsFeld = $derived<'output' | 'zeit' | null>(
    bruehgeraet?.fuehrungswert === 'durchlaufzeit' ? 'zeit' : (bruehgeraet?.fuehrungswert ?? null),
  );

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
</script>

<button type="button" class="zurueck" onclick={onZurueck}>‹ zurück</button>

{#if !profil}
  <p class="hinweis">Profil nicht gefunden.</p>
{:else}
  <h1>{profil.name}</h1>
  <p class="setup">{setup?.name ?? 'Setup unbekannt'} · {profil.modus === 'dialin' ? 'Dial-in' : 'eingefahren'}</p>

  <section class="ziel">
    <h2>Ziel</h2>

    <div class="zeile">
      <span class="label">Input</span>
      <input class="wert-eingabe" type="text" inputmode="decimal" value={profil.ziel.input}
        onchange={(e) => zielSpeichern('input', zahl(e))} /> g
    </div>
    <div class="zeile">
      <span class="label">Mahlgrad</span>
      <input class="wert-eingabe" type="text" inputmode="decimal" value={profil.ziel.mg}
        onchange={(e) => zielSpeichern('mg', zahl(e))} />
      {muehle?.skala.typ === 'klicks' ? 'Klicks' : ''}
    </div>
    {#if muehle?.rpmEinstellbar}
      <div class="zeile">
        <span class="label">Drehzahl</span>
        <input class="wert-eingabe" type="text" inputmode="decimal" value={profil.ziel.rpm ?? ''}
          onchange={(e) => zielSpeichern('rpm', zahl(e))} /> rpm
      </div>
    {/if}
    {#if bruehgeraet?.ktEinstellbar}
      <div class="zeile">
        <span class="label">Kesseltemperatur</span>
        <div class="doppel-halter">
          <input class="wert-eingabe" type="text" inputmode="decimal" value={profil.ziel.kt ?? ''}
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
            <span class="hinweis-klein">außerhalb der Messreihe</span>
          {/if}
        </div>
      </div>
    {/if}

    <div class="zeile" class:fuehrung={fuehrungsFeld === 'output'}>
      <span class="label">Output</span>
      <input class="wert-eingabe" class:gross={fuehrungsFeld === 'output'} type="text" inputmode="decimal"
        value={profil.ziel.output} onchange={(e) => zielSpeichern('output', zahl(e))} /> g
    </div>
    <div class="zeile">
      <span class="label">Preinfusion</span>
      <input class="wert-eingabe" type="text" inputmode="decimal" value={profil.ziel.pre ?? ''}
        onchange={(e) => zielSpeichern('pre', zahl(e))} /> s
    </div>
    <div class="zeile" class:fuehrung={fuehrungsFeld === 'zeit'}>
      <span class="label">{bruehgeraet?.fuehrungswert === 'durchlaufzeit' ? 'Durchlaufzeit' : 'Zeit'}</span>
      <input class="wert-eingabe" class:gross={fuehrungsFeld === 'zeit'} type="text" inputmode="decimal"
        value={profil.ziel.zeit} onchange={(e) => zielSpeichern('zeit', zahl(e))} /> s
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
    <p class="hinweis">Gussplan-Editor kommt in Paket 03 Etappe C.</p>
  {/if}

  {#if speicherFehler}
    <p class="fehler">Nicht gespeichert: {speicherFehler} — nochmal versuchen.</p>
  {/if}
{/if}

<style>
  .zurueck {
    background: none;
    border: none;
    color: var(--akzent);
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    min-height: var(--treffer);
    padding: 0;
    cursor: pointer;
    display: block;
  }
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
  .zeile.fuehrung {
    border-bottom-color: var(--akzent);
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
  .wert-eingabe.gross {
    font-size: var(--fs-fuehrung);
    font-weight: var(--gw-zahl);
    width: 100px;
  }
  .doppel-halter {
    display: flex;
    align-items: center;
    gap: var(--r3);
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
