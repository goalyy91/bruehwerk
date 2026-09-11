<script lang="ts">
  // Profil bearbeiten — eigene Route (Rückmeldung 2026-09-11: "ich will
  // Profile in einem Kaffee ändern und löschen können"). Folgt demselben
  // Entwurfs-Muster wie KaffeeBearbeiten.svelte: ein lokaler Entwurf per
  // untrack()+$state.snapshot(), ein Knopf "speichern", ein echtes
  // "abbrechen". Löschen sitzt bewusst nicht hier, sondern im ⋯-Menü der
  // Leseansicht (Profilblatt.svelte) — dieselbe Aufteilung wie bei Setup/
  // Mühle/Brühgerät (Regel 3: "speichern" bleibt die einzige dominante
  // Aktion im Formular).
  //
  // Name/Setup/Symbol sind dieselben drei Felder wie im "+ Profil"-Formular
  // (Kaffeeblatt.svelte) — dieselbe Icon-Vorbelegungslogik (folgt dem Gerät,
  // bis manuell gewählt), jetzt aus ProfilIcon.svelte statt dort verdoppelt.
  //
  // Bewusst kein Standard-Schalter: "standard" wird im Code bisher nirgends
  // umgesetzt (nur beim allerersten Profil eines Kaffees automatisch
  // gesetzt, Kaffeeblatt.svelte). Eine Neuzuordnung ist eine eigene Frage
  // (was passiert mit dem bisherigen Standard-Profil?) und nicht Teil
  // dieser Rückmeldung — bleibt unangetastet, um den Umfang nicht
  // stillschweigend zu erweitern.

  import { untrack } from 'svelte';
  import { bestand, schreiben } from '../bestand.svelte';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import Blattliste from '../../muster/Blattliste.svelte';
  import AuswahlListe from '../../muster/AuswahlListe.svelte';
  import Knopf from '../../muster/Knopf.svelte';
  import ProfilIcon, { type ProfilIconTyp, PROFIL_ICON_OPTIONEN, standardIconVon } from '../../muster/ProfilIcon.svelte';
  import type { Profil } from '../../daten/schema';

  let { profilId, onZurueck }: { profilId: string; onZurueck: () => void } = $props();

  const bestehend = $derived(bestand.profile.find((p) => p.id === profilId));

  // $state.snapshot() statt structuredClone() — bestehend ist ein Svelte-
  // reaktives $state-Objekt (siehe KaffeeBearbeiten.svelte).
  let entwurf = $state<Profil | undefined>(untrack(() => (bestehend ? $state.snapshot(bestehend) : undefined)));
  let fehler = $state<string | undefined>(undefined);

  /** Icon-Vorbelegung folgt dem Setup, bis jemand manuell eins waehlt — wie
   *  beim Anlegen (neuesProfilIconManuell in Kaffeeblatt.svelte). Ein
   *  bereits gespeichertes Icon zaehlt als "schon manuell gewaehlt". */
  let iconManuell = $state(untrack(() => entwurf?.icon !== undefined));

  /** Einmal berechnet statt je Icon-Kachel neu (7x pro Render) — dieselbe
   *  Herleitung wie beim Speichern und wie Kaffeeblatt.svelte's Profil-Raster. */
  const gewaehltesIcon = $derived(
    entwurf ? (entwurf.icon ?? standardIconVon(bestand.bruehgeraetVon(entwurf.setupId)?.typ)) : undefined,
  );

  function setupGewaehlt(setupId: string) {
    if (!entwurf) return;
    entwurf.setupId = setupId;
    if (!iconManuell) {
      entwurf.icon = standardIconVon(bestand.bruehgeraetVon(setupId)?.typ);
    }
  }

  function iconGewaehlt(icon: ProfilIconTyp) {
    if (!entwurf) return;
    entwurf.icon = icon;
    iconManuell = true;
  }

  async function speichern() {
    if (!entwurf) return;
    fehler = undefined;
    try {
      // Folgt das Icon weiterhin dem Geraet (nie manuell abgewichen), bleibt
      // es undefined statt eingefroren zu werden — Kaffeeblatt.svelte leitet
      // es dann live her (daten/schema/kaffee.ts::Profil.icon).
      const geraeteIcon = standardIconVon(bestand.bruehgeraetVon(entwurf.setupId)?.typ);
      const zuSpeichern: Profil = {
        ...entwurf,
        icon: iconManuell && entwurf.icon !== geraeteIcon ? entwurf.icon : undefined,
      };
      await schreiben('profil', zuSpeichern);
      onZurueck();
    } catch (e) {
      fehler = e instanceof Error ? e.message : String(e);
    }
  }
</script>

{#if !entwurf}
  <Kopfzeile titel="Profil bearbeiten" {onZurueck} />
  <p class="hinweis">Profil nicht gefunden.</p>
{:else}
  <Kopfzeile titel="Profil bearbeiten" {onZurueck} />

  <section class="gruppe">
    <h2>Grunddaten</h2>
    <Blattliste>
      <div class="formularzeile">
        <span class="formularzeile-label">Name</span>
        <input class="eingabefeld-text" type="text" bind:value={entwurf.name} />
      </div>
      <div class="formularzeile spalte">
        <span class="formularzeile-label">Setup</span>
        <AuswahlListe
          optionen={bestand.setups.map((s) => ({ wert: s.id, label: s.name }))}
          wert={entwurf.setupId}
          onWahl={setupGewaehlt}
        />
      </div>
    </Blattliste>
  </section>

  <section class="gruppe">
    <h2>Symbol</h2>
    <div class="icon-auswahl">
      {#each PROFIL_ICON_OPTIONEN as option (option)}
        <button
          type="button"
          class="icon-option"
          class:gewaehlt={gewaehltesIcon === option}
          aria-label={option}
          onclick={() => iconGewaehlt(option)}
        >
          <ProfilIcon icon={option} groesse={20} />
        </button>
      {/each}
    </div>
  </section>

  <div class="knopfreihe">
    <Knopf stufe="primaer" onKlick={speichern} deaktiviert={entwurf.name.trim() === '' || entwurf.setupId === ''}>
      speichern
    </Knopf>
    <Knopf stufe="still" onKlick={onZurueck}>abbrechen</Knopf>
  </div>

  {#if fehler}
    <p class="fehler">Nicht gespeichert: {fehler} — nochmal versuchen.</p>
  {/if}
{/if}

<style>
  h2 {
    margin: 0 0 var(--r-kachelabstand);
  }
  .gruppe {
    margin-bottom: var(--r5);
  }
  .gruppe :global(.formularzeile) {
    border-bottom: none;
  }
  .formularzeile.spalte .formularzeile-label {
    width: auto;
  }
  /* Identisch zur Icon-Auswahlzeile im "+ Profil"-Formular
     (Kaffeeblatt.svelte) — dieselben Werte, damit Anlegen und Bearbeiten
     sich nicht wie zwei verschiedene Bauteile anfuehlen. */
  .icon-auswahl {
    display: flex;
    flex-wrap: wrap;
    gap: var(--r2);
  }
  .icon-option {
    width: 42px;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 50%;
    background: var(--vertiefung);
    color: var(--gedaempft-tief);
    cursor: pointer;
  }
  .icon-option.gewaehlt {
    background: var(--fuellung);
    color: var(--auf-fuellung);
  }
  .knopfreihe {
    display: flex;
    gap: var(--r3);
    margin-top: var(--r4);
  }
  .hinweis {
    color: var(--gedaempft);
    font-size: var(--fs-satz);
  }
  .fehler {
    color: var(--kritisch);
    font-size: var(--fs-satz);
    margin-top: var(--r3);
  }
</style>
