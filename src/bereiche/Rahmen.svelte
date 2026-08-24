<script lang="ts">
  // Der Rahmen — Navigations-Umbau UX-1. Einziger Navigations-Eigentuemer
  // der gesamten App: jede Route aus route.ts wird hier gerendert, jeder
  // Bildschirmwechsel laeuft ueber navigation.svelte.ts und damit ueber
  // echte Browser-Verlaufseintraege. Zurueck-Pfeil, Android-Geste und
  // System-Zurueck-Knopf loesen dieselbe navigation.zurueck() aus.
  //
  // Vorher hatten Kaffees.svelte, Einstellungen.svelte und Profilblatt.svelte
  // je eine eigene Navigations-Ebene nur im Speicher — Neuladen sprang immer
  // auf "Bar" zurueck, und die Geste tat nichts. Diese Datei ist jetzt die
  // einzige Stelle, die $state fuer "wo bin ich" haelt (in navigation), das
  // hier ist nur noch Verdrahtung.
  //
  // Fuenf Bereiche (Navigation, docs/konzept.md), Trefferflaeche 48 px,
  // Safe-Area unten. Zwei Bereiche zeigen eine ehrliche "kommt in Paket
  // X"-Zeile statt einer Attrappe.

  import { onMount } from 'svelte';
  import { bestand } from './bestand.svelte';
  import { navigation } from './navigation.svelte';
  import { tabVon, zuPfad, type Bereich } from './route';
  import Kopfzeile from '../muster/Kopfzeile.svelte';
  import Bar from './bar/Bar.svelte';
  import KaffeeListe from './kaffees/KaffeeListe.svelte';
  import KaffeeNeu from './kaffees/KaffeeNeu.svelte';
  import Kaffeeblatt from './kaffees/Kaffeeblatt.svelte';
  import KaffeeBearbeiten from './kaffees/KaffeeBearbeiten.svelte';
  import Profilblatt from './kaffees/Profilblatt.svelte';
  import ShotErfassung from './shot/ShotErfassung.svelte';
  import Einstellungen from './einstellungen/Einstellungen.svelte';
  import Geraete from './einstellungen/Geraete.svelte';
  import MuehleAnsicht from './einstellungen/MuehleAnsicht.svelte';
  import Muehleblatt from './einstellungen/Muehleblatt.svelte';
  import BruehgeraetAnsicht from './einstellungen/BruehgeraetAnsicht.svelte';
  import Bruehgeraetblatt from './einstellungen/Bruehgeraetblatt.svelte';
  import TempReferenzScreen from './einstellungen/TempReferenzScreen.svelte';
  import { bruehgeraetEntwurf } from './einstellungen/bruehgeraetEntwurf.svelte';
  import SetupAnsicht from './einstellungen/SetupAnsicht.svelte';
  import Setupblatt from './einstellungen/Setupblatt.svelte';
  import Musterblatt from './Musterblatt.svelte';
  import Beobachtungen from './einstellungen/Beobachtungen.svelte';

  const BEREICHE: { id: Bereich; label: string; gebaut: boolean }[] = [
    { id: 'bar', label: 'Bar', gebaut: true },
    { id: 'kaffees', label: 'Kaffees', gebaut: true },
    { id: 'historie', label: 'Historie', gebaut: false },
    { id: 'getraenke', label: 'Getränke', gebaut: false },
    { id: 'einstellungen', label: 'Einstellungen', gebaut: true },
  ];

  let inhaltElement = $state<HTMLElement | undefined>();

  onMount(() => {
    void bestand.laden();
    const stopNavigation = navigation.starten();
    return stopNavigation;
  });

  $effect(() => {
    navigation.scrollContainer = inhaltElement;
  });

  const route = $derived(navigation.aktuell);
</script>

<div class="rahmen">
  <main class="inhalt" bind:this={inhaltElement}>
    <!-- Punkt 7 der Korrekturrunde: Ebenenwechsel leicht versetzt
         eingeblendet, Richtung aus navigation.richtung. {#key} erzwingt
         einen echten Neuaufbau je Pfad, damit die CSS-Animation bei jedem
         Bildschirmwechsel neu anspringt — auch zwischen zwei Routen mit
         demselben Komponententyp (z. B. Kaffee A -> Kaffee B). Rein
         optisch, kein Zustand haengt daran; prefers-reduced-motion greift
         automatisch ueber den globalen Block in tokens.css. -->
    {#key zuPfad(route)}
      <div class="ebene" class:vor={navigation.richtung === 'vor'} class:zurueck={navigation.richtung === 'zurueck'}>
        {#if bestand.ladeFehler}
          <p class="fehler">Bestand konnte nicht geladen werden: {bestand.ladeFehler.message}</p>
        {:else if route.name === 'bar'}
      <Bar />
    {:else if route.name === 'kaffees'}
      <KaffeeListe
        onOeffnen={(id) => navigation.gehe({ name: 'kaffee', kaffeeId: id })}
        onNeu={() => navigation.gehe({ name: 'kaffeeNeu' })}
      />
    {:else if route.name === 'kaffeeNeu'}
      <KaffeeNeu
        onZurueck={() => navigation.zurueck()}
        onAngelegt={(id) => navigation.ersetze({ name: 'kaffee', kaffeeId: id })}
      />
    {:else if route.name === 'kaffee'}
      <Kaffeeblatt
        kaffeeId={route.kaffeeId}
        onZurueck={() => navigation.zurueck()}
        onBearbeiten={() => navigation.gehe({ name: 'kaffeeBearbeiten', kaffeeId: route.kaffeeId })}
        onOeffnenProfil={(profilId) => navigation.gehe({ name: 'profil', kaffeeId: route.kaffeeId, profilId })}
      />
    {:else if route.name === 'kaffeeBearbeiten'}
      <KaffeeBearbeiten kaffeeId={route.kaffeeId} onZurueck={() => navigation.zurueck()} />
    {:else if route.name === 'profil'}
      <Profilblatt
        profilId={route.profilId}
        onZurueck={() => navigation.zurueck()}
        onOeffnenShot={() => navigation.gehe({ name: 'shot', kaffeeId: route.kaffeeId, profilId: route.profilId })}
      />
    {:else if route.name === 'shot'}
      <ShotErfassung profilId={route.profilId} onZurueck={() => navigation.zurueck()} onFertig={() => navigation.zurueck()} />
    {:else if route.name === 'historie'}
      <Kopfzeile titel="Historie" gross />
      <p class="offen">Historie · kommt in Paket 05</p>
    {:else if route.name === 'getraenke'}
      <Kopfzeile titel="Getränke" gross />
      <p class="offen">Getränke · kommt in Paket 06</p>
    {:else if route.name === 'einstellungen'}
      <Einstellungen
        onOeffnenGeraete={() => navigation.gehe({ name: 'geraete' })}
        onOeffnenMusterblatt={() => navigation.gehe({ name: 'musterblatt' })}
        onOeffnenBeobachtungen={() => navigation.gehe({ name: 'beobachtungen' })}
      />
    {:else if route.name === 'beobachtungen'}
      <Beobachtungen onZurueck={() => navigation.zurueck()} />
    {:else if route.name === 'geraete'}
      <Geraete
        onZurueck={() => navigation.zurueck()}
        onOeffnenMuehle={(id) => navigation.gehe(id ? { name: 'muehle', id } : { name: 'muehleNeu' })}
        onOeffnenBruehgeraet={(id) => navigation.gehe(id ? { name: 'bruehgeraet', id } : { name: 'bruehgeraetNeu' })}
        onOeffnenSetup={(id) => navigation.gehe(id ? { name: 'setup', id } : { name: 'setupNeu' })}
      />
    {:else if route.name === 'musterblatt'}
      <Musterblatt onZurueck={() => navigation.zurueck()} />
    {:else if route.name === 'muehle'}
      <MuehleAnsicht
        muehleId={route.id}
        onZurueck={() => navigation.zurueck()}
        onBearbeiten={() => navigation.gehe({ name: 'muehleBearbeiten', id: route.id })}
        onGeloescht={() => navigation.ersetze({ name: 'geraete' })}
      />
    {:else if route.name === 'muehleNeu'}
      <Muehleblatt onZurueck={() => navigation.zurueck()} />
    {:else if route.name === 'muehleBearbeiten'}
      <Muehleblatt muehleId={route.id} onZurueck={() => navigation.zurueck()} />
    {:else if route.name === 'bruehgeraet'}
      <BruehgeraetAnsicht
        bruehgeraetId={route.id}
        onZurueck={() => navigation.zurueck()}
        onBearbeiten={() => navigation.gehe({ name: 'bruehgeraetBearbeiten', id: route.id })}
        onGeloescht={() => navigation.ersetze({ name: 'geraete' })}
      />
    {:else if route.name === 'bruehgeraetNeu'}
      <Bruehgeraetblatt
        onZurueck={() => { bruehgeraetEntwurf.verwerfen(); navigation.zurueck(); }}
        onOeffnenTempReferenz={() => navigation.gehe({ name: 'tempReferenz' })}
      />
    {:else if route.name === 'bruehgeraetBearbeiten'}
      <Bruehgeraetblatt
        bruehgeraetId={route.id}
        onZurueck={() => { bruehgeraetEntwurf.verwerfen(); navigation.zurueck(); }}
        onOeffnenTempReferenz={() => navigation.gehe({ name: 'tempReferenz' })}
      />
    {:else if route.name === 'tempReferenz'}
      <TempReferenzScreen onZurueck={() => navigation.zurueck()} />
    {:else if route.name === 'setup'}
      <SetupAnsicht
        setupId={route.id}
        onZurueck={() => navigation.zurueck()}
        onBearbeiten={() => navigation.gehe({ name: 'setupBearbeiten', id: route.id })}
        onGeloescht={() => navigation.ersetze({ name: 'geraete' })}
      />
    {:else if route.name === 'setupNeu'}
      <Setupblatt onZurueck={() => navigation.zurueck()} />
    {:else if route.name === 'setupBearbeiten'}
      <Setupblatt setupId={route.id} onZurueck={() => navigation.zurueck()} />
        {/if}
      </div>
    {/key}
  </main>

  <nav class="leiste" aria-label="Bereiche">
    {#each BEREICHE as bereich (bereich.id)}
      <button
        type="button"
        class="eintrag"
        class:aktiv={tabVon(navigation.aktuell) === bereich.id}
        onclick={() => navigation.tabWechsel(bereich.id)}
      >
        <span class="symbol" aria-hidden="true">
          {#if bereich.id === 'bar'}
            <!-- Rueckmeldung 2026-08-24: dieselbe Tasse wie Parameterkachel.svelte
                 (Symbol "output") statt der bisherigen Milchkaenchen-Silhouette —
                 auf 24er-Raster skaliert (Quelle war 20er), gleiche Linienstaerke
                 wie die uebrigen Tab-Icons. -->
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 9.6h9.6v6a3 3 0 0 1-3 3h-3.6A3 3 0 0 1 6 15.6z" /><path d="M15.6 11.16h1.92a1.92 1.92 0 0 1 0 3.84H15.6" /><path d="M5.4 20.4h10.8" /></svg>
          {:else if bereich.id === 'kaffees'}
            <!-- Rueckmeldung 2026-08-24: dieselbe Bohnenform wie Bohnen.svelte
                 (Kontur + S-Rille), als Outline statt Fuellflaeche, damit sie zu
                 den uebrigen Strich-Icons der Leiste passt. -->
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 4.5C8.7 5.9 6.5 8.9 6.5 12S8.7 18.1 12 19.5c3.3-1.4 5.5-4.4 5.5-7.5S15.3 5.9 12 4.5Z" /><path d="M12 6.1c-1.6 1.9-1 3.8.1 5.9s1.7 4 .1 5.9" /></svg>
          {:else if bereich.id === 'historie'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 12a8 8 0 1 1 2.6 5.9" /><path d="M4 6v6h6" /><path d="M12 8v4l3 2" /></svg>
          {:else if bereich.id === 'getraenke'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 3h12l-1.5 15a2 2 0 0 1-2 1.8h-5a2 2 0 0 1-2-1.8L6 3Z" /><path d="M5.3 8h13.4" /></svg>
          {:else}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="3" /><path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.4-2-3.4-2.3.9a7.7 7.7 0 0 0-2.6-1.5L14 2.5h-4l-.5 2.6a7.7 7.7 0 0 0-2.6 1.5l-2.3-.9-2 3.4 2 1.4a7.6 7.6 0 0 0 0 3l-2 1.4 2 3.4 2.3-.9c.8.65 1.65 1.15 2.6 1.5l.5 2.6h4l.5-2.6a7.7 7.7 0 0 0 2.6-1.5l2.3.9 2-3.4-2-1.4Z" /></svg>
          {/if}
        </span>
        <span class="beschriftung">{bereich.label}</span>
      </button>
    {/each}
  </nav>
</div>

<style>
  .rahmen {
    display: flex;
    flex-direction: column;
    height: 100dvh;
    overflow: hidden;
  }
  .inhalt {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: var(--r4) var(--seitenrand);
  }
  /* Punkt 7 der Korrekturrunde: Ebenenwechsel-Uebergang. Reine
     CSS-Animation statt Sveltes JS-Transitions — nur so greift der
     bestehende globale prefers-reduced-motion-Block (tokens.css), der
     animation-duration auf 1ms erzwingt. */
  .ebene {
    animation-duration: var(--t-ebene);
    animation-timing-function: var(--e-rein);
    animation-fill-mode: both;
  }
  .ebene.vor {
    animation-name: ebene-vor-ein;
  }
  .ebene.zurueck {
    animation-name: ebene-zurueck-ein;
  }
  @keyframes ebene-vor-ein {
    from {
      opacity: 0;
      transform: translateX(12px);
    }
  }
  @keyframes ebene-zurueck-ein {
    from {
      opacity: 0;
      transform: translateX(-12px);
    }
  }
  .offen {
    color: var(--gedaempft);
    font-size: var(--fs-satz);
  }
  .fehler {
    color: var(--kritisch);
    font-size: var(--fs-satz);
  }
  .leiste {
    display: flex;
    flex-shrink: 0;
    /* Visueller Redesign-Reset (Handoff 3.8 "Tab-Leiste"): kein Rand nach
       oben mehr — die Fläche grenzt sich allein über Helligkeit ab
       (--blatt gegen --grund, drei Flächenebenen statt Linie + Schatten). */
    background: var(--blatt);
    padding-bottom: var(--safe-unten);
  }
  .eintrag {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--spalt-mikro);
    min-height: var(--fusszeile);
    border: none;
    background: transparent;
    font-family: var(--schrift);
    font-size: var(--fs-label);
    color: var(--gedaempft);
    cursor: pointer;
  }
  .symbol {
    width: var(--symbol-tab);
    height: var(--symbol-tab);
    display: block;
    border-radius: var(--r-pille);
    transition:
      background var(--t-auswahl) var(--e-rein),
      width var(--t-auswahl) var(--e-rein),
      height var(--t-auswahl) var(--e-rein);
  }
  .symbol svg {
    width: 100%;
    height: 100%;
  }
  .beschriftung {
    line-height: 1;
  }
  .eintrag.aktiv {
    color: var(--akzent);
    font-weight: var(--gw-titel);
  }
  /* Rueckmeldung 2026-08-24: "sieht klein und verloren aus" — Handoff 3.8
     nennt 64/24/11 woertlich, das bleibt die Basis (siehe Kommentar oben).
     Als erster Schritt bekommt nur das aktive Icon mehr Praesenz: eigene
     Flaeche (--badge, dieselbe Rolle wie die runden Icon-Badges in
     Kaffeeblatt.svelte) und ein paar Pixel mehr Groesse, per negativem
     Rand ohne Verschiebung der Beschriftung darunter. */
  .eintrag.aktiv .symbol {
    width: calc(var(--symbol-tab) + 8px);
    height: calc(var(--symbol-tab) + 8px);
    margin: -4px;
    background: var(--badge);
  }
</style>
