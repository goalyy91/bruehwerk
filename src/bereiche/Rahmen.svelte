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
  import { tabVon, type Bereich } from './route';
  import Kopfzeile from '../muster/Kopfzeile.svelte';
  import Bar from './bar/Bar.svelte';
  import KaffeeListe from './kaffees/KaffeeListe.svelte';
  import KaffeeNeu from './kaffees/KaffeeNeu.svelte';
  import Kaffeeblatt from './kaffees/Kaffeeblatt.svelte';
  import Profilblatt from './kaffees/Profilblatt.svelte';
  import ShotErfassung from './shot/ShotErfassung.svelte';
  import Einstellungen from './einstellungen/Einstellungen.svelte';
  import Geraete from './einstellungen/Geraete.svelte';
  import Muehleblatt from './einstellungen/Muehleblatt.svelte';
  import Bruehgeraetblatt from './einstellungen/Bruehgeraetblatt.svelte';
  import Setupblatt from './einstellungen/Setupblatt.svelte';
  import Musterblatt from './Musterblatt.svelte';

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
        onOeffnenProfil={(profilId) => navigation.gehe({ name: 'profil', kaffeeId: route.kaffeeId, profilId })}
      />
    {:else if route.name === 'profil'}
      <Profilblatt
        profilId={route.profilId}
        onZurueck={() => navigation.zurueck()}
        onOeffnenShot={() => navigation.gehe({ name: 'shot', kaffeeId: route.kaffeeId, profilId: route.profilId })}
      />
    {:else if route.name === 'shot'}
      <Kopfzeile titel="Shot loggen" onZurueck={() => navigation.zurueck()} />
      <ShotErfassung profilId={route.profilId} onFertig={() => navigation.zurueck()} />
    {:else if route.name === 'historie'}
      <Kopfzeile titel="Historie" />
      <p class="offen">Historie · kommt in Paket 05</p>
    {:else if route.name === 'getraenke'}
      <Kopfzeile titel="Getränke" />
      <p class="offen">Getränke · kommt in Paket 06</p>
    {:else if route.name === 'einstellungen'}
      <Einstellungen
        onOeffnenGeraete={() => navigation.gehe({ name: 'geraete' })}
        onOeffnenMusterblatt={() => navigation.gehe({ name: 'musterblatt' })}
      />
    {:else if route.name === 'geraete'}
      <Kopfzeile titel="Geräte" onZurueck={() => navigation.zurueck()} />
      <Geraete
        onOeffnenMuehle={(id) => navigation.gehe({ name: 'muehle', id })}
        onOeffnenBruehgeraet={(id) => navigation.gehe({ name: 'bruehgeraet', id })}
        onOeffnenSetup={(id) => navigation.gehe({ name: 'setup', id })}
      />
    {:else if route.name === 'musterblatt'}
      <Kopfzeile titel="Musterblatt" onZurueck={() => navigation.zurueck()} />
      <Musterblatt />
    {:else if route.name === 'muehle'}
      <Muehleblatt muehleId={route.id} onZurueck={() => navigation.zurueck()} />
    {:else if route.name === 'bruehgeraet'}
      <Bruehgeraetblatt bruehgeraetId={route.id} onZurueck={() => navigation.zurueck()} />
    {:else if route.name === 'setup'}
      <Setupblatt setupId={route.id} onZurueck={() => navigation.zurueck()} />
    {/if}
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 8h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Z" /><path d="M17 9h1.5a2.5 2.5 0 0 1 0 5H17" /><path d="M8 3.5c0 1-1 1-1 2s1 1 1 2M12 3.5c0 1-1 1-1 2s1 1 1 2" /></svg>
          {:else if bereich.id === 'kaffees'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3c-3 2-2 3-4 5s-2 4 0 6 5 1 6-1-1-3 1-5 1-4-3-5Z" /><path d="M12 12.5c-.6.6-.4 1.2 0 1.6" /></svg>
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
    border-top: 1px solid var(--linie);
    background: var(--ruhig);
    box-shadow: 0 -1px 6px rgba(0, 0, 0, 0.06);
    padding-bottom: var(--safe-unten);
  }
  .eintrag {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    min-height: var(--fusszeile);
    border: none;
    background: transparent;
    font-family: var(--schrift);
    font-size: var(--fs-label);
    color: var(--gedaempft);
    cursor: pointer;
  }
  .symbol {
    width: 22px;
    height: 22px;
    display: block;
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
</style>
