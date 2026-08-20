<script lang="ts">
  // Der Rahmen — Paket 03. Fuenf Bereiche (Navigation, docs/konzept.md),
  // Trefferflaeche 48 px, Safe-Area unten. Zwei Bereiche zeigen heute eine
  // ehrliche "kommt in Paket X"-Zeile statt einer Attrappe — ein leerer
  // Bereich, der sagt warum er leer ist, wird nicht fuer kaputt gehalten.
  //
  // Jeder Bereich traegt einen sichtbaren Rueckweg (K78) ausser dem
  // Erststart, den es hier noch nicht gibt — die App hat schon Bestand.

  import { onMount } from 'svelte';
  import { bestand } from './bestand.svelte';
  import Bar from './bar/Bar.svelte';
  import Kaffees from './kaffees/Kaffees.svelte';
  import Einstellungen from './einstellungen/Einstellungen.svelte';

  type Bereich = 'bar' | 'kaffees' | 'historie' | 'getraenke' | 'einstellungen';

  const BEREICHE: { id: Bereich; label: string; gebaut: boolean }[] = [
    { id: 'bar', label: 'Bar', gebaut: true },
    { id: 'kaffees', label: 'Kaffees', gebaut: true },
    { id: 'historie', label: 'Historie', gebaut: false },
    { id: 'getraenke', label: 'Getränke', gebaut: false },
    { id: 'einstellungen', label: 'Einstellungen', gebaut: true },
  ];

  let aktiv = $state<Bereich>('bar');

  onMount(() => {
    void bestand.laden();
  });
</script>

<div class="rahmen">
  <main class="inhalt">
    {#if bestand.ladeFehler}
      <p class="fehler">Bestand konnte nicht geladen werden: {bestand.ladeFehler.message}</p>
    {:else if aktiv === 'bar'}
      <Bar />
    {:else if aktiv === 'kaffees'}
      <Kaffees />
    {:else if aktiv === 'historie'}
      <p class="offen">Historie · kommt in Paket 05</p>
    {:else if aktiv === 'getraenke'}
      <p class="offen">Getränke · kommt in Paket 06</p>
    {:else if aktiv === 'einstellungen'}
      <Einstellungen />
    {/if}
  </main>

  <nav class="leiste" aria-label="Bereiche">
    {#each BEREICHE as bereich (bereich.id)}
      <button
        type="button"
        class="eintrag"
        class:aktiv={aktiv === bereich.id}
        onclick={() => (aktiv = bereich.id)}
      >
        {bereich.label}
      </button>
    {/each}
  </nav>
</div>

<style>
  .rahmen {
    display: flex;
    flex-direction: column;
    min-height: 100dvh;
  }
  .inhalt {
    flex: 1;
    overflow-y: auto;
    padding: var(--r4) var(--seitenrand);
    padding-bottom: calc(var(--fusszeile) + var(--r4));
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
    border-top: 1px solid var(--linie);
    background: var(--ruhig);
    padding-bottom: var(--safe-unten);
  }
  .eintrag {
    flex: 1;
    min-height: var(--fusszeile);
    border: none;
    background: transparent;
    font-family: var(--schrift);
    font-size: var(--fs-meta);
    color: var(--gedaempft);
    cursor: pointer;
  }
  .eintrag.aktiv {
    color: var(--tinte);
    font-weight: var(--gw-titel);
    box-shadow: inset 0 2px 0 var(--akzent);
  }
</style>
