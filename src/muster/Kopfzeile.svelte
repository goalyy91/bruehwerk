<script lang="ts">
  // Kopfzeile — Ergaenzung zum Musterblatt (Korrekturrunde, Teil 5). Ein
  // Titel, ein optionaler Zurueck-Chevron, eine Instanz pro Bildschirm.
  //
  // Ersetzt die zuvor je Bildschirm wiederholten
  // <button class="zurueck">…</button><h1>…</h1>-Paare. Der gemeldete Bug
  // (zwei "‹"-Zeilen uebereinander beim Bearbeiten einer Muehle) kam nicht
  // von dieser Komponente, sondern davon, dass zwei Bildschirme gleichzeitig
  // eigene Navigations-Ebenen fuehrten — behoben durch einen einzigen
  // Navigations-Eigentuemer je Bereich (siehe Einstellungen.svelte), nicht
  // durch dieses Bauteil allein. Trotzdem: eine Kopfzeile, ein Zurueckweg,
  // konsequent dieselbe Form ueberall (K78).

  // UX-2: optionaler Aktions-Platz rechts (z. B. das Stift-Symbol zum
  // Bearbeiten) — additiv, jeder bestehende Aufruf ohne `aktion` bleibt
  // unveraendert.
  //
  // Visueller Redesign-Reset (Handoff 3.8/5): Rückweg als runder 38-px-
  // Knopf auf Blattfläche, Zeichen im Akzent, statt reinem Text-Chevron.
  //
  // Paket 2 (Kaffeeblatt der erste Aufrufer): zweite Titelgröße für
  // Objektseiten (Handoff-Komponenten-Mapping "Titel Serif 26/600, bei
  // Objektseiten 30-32 zweizeilig" — beides über dieselbe "Titelquelle"-
  // Kopfzeile, nicht zwei Bauteile). `gross` ist additiv: Icon-Reihe
  // (Rückweg + Aktion) rückt in eine eigene Zeile, der Titel steht als
  // eigener 32/600-Block darunter statt inline daneben. Jeder bestehende
  // Aufruf ohne `gross` bleibt exakt wie zuvor.
  //
  // Paket 4: `gross` traegt jetzt auch die Root-Tab-Screens (Kaffees,
  // Einstellungen, Bar — Handoff nennt fuer sie explizit "Titel 32/600",
  // ohne Rueckweg). Ohne onZurueck/aktion faellt die Icon-Reihe einfach
  // weg, statt eine leere Zeile zu rendern.
  import type { Snippet } from 'svelte';

  let {
    titel,
    onZurueck,
    aktion,
    gross = false,
  }: {
    titel: string;
    onZurueck?: () => void;
    aktion?: Snippet;
    gross?: boolean;
  } = $props();
</script>

{#if gross}
  <header class="kopfzeile-gross">
    {#if onZurueck || aktion}
      <div class="iconreihe">
        {#if onZurueck}
          <button type="button" class="zurueck" onclick={onZurueck} aria-label="zurück">‹</button>
        {/if}
        {#if aktion}<span class="aktion">{@render aktion()}</span>{/if}
      </div>
    {/if}
    <h1 class="titel-gross">{titel}</h1>
  </header>
{:else}
  <header class="kopfzeile">
    {#if onZurueck}
      <button type="button" class="zurueck" onclick={onZurueck} aria-label="zurück">‹</button>
    {/if}
    <h1>{titel}</h1>
    {#if aktion}<span class="aktion">{@render aktion()}</span>{/if}
  </header>
{/if}

<style>
  .kopfzeile {
    display: flex;
    align-items: center;
    gap: var(--r2);
    min-height: var(--treffer);
    margin-bottom: var(--r4);
  }
  .kopfzeile-gross {
    display: flex;
    flex-direction: column;
    gap: var(--seitenrand);
    margin-bottom: var(--seitenrand);
  }
  .iconreihe {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .titel-gross {
    font-size: var(--fs-blattitel);
    font-weight: var(--gw-titel);
    line-height: 1.12;
    letter-spacing: -0.02em;
    margin: 0;
  }
  .zurueck {
    flex-shrink: 0;
    width: var(--r-knopf-rund);
    height: var(--r-knopf-rund);
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--blatt);
    border: none;
    border-radius: 50%;
    color: var(--akzent);
    font-family: var(--schrift);
    font-size: 20px;
    line-height: 1;
    cursor: pointer;
  }
  h1 {
    flex: 1;
    font-size: var(--fs-titel);
    font-weight: var(--gw-titel);
    margin: 0;
  }
  .aktion {
    flex-shrink: 0;
    display: flex;
  }
</style>
