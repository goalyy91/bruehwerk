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
  // Die zweite Titelgröße für Objektseiten (30-32/600 zweizeilig, z. B.
  // Kaffeeblatt) ist bewusst noch nicht Teil dieser Komponente — sie kommt
  // mit dem Screen, der sie zuerst braucht (Paket 2), statt hier auf
  // Vorrat eine Prop-Form zu erfinden, die noch keinen Aufrufer hat.
  import type { Snippet } from 'svelte';

  let {
    titel,
    onZurueck,
    aktion,
  }: {
    titel: string;
    onZurueck?: () => void;
    aktion?: Snippet;
  } = $props();
</script>

<header class="kopfzeile">
  {#if onZurueck}
    <button type="button" class="zurueck" onclick={onZurueck} aria-label="zurück">‹</button>
  {/if}
  <h1>{titel}</h1>
  {#if aktion}<span class="aktion">{@render aktion()}</span>{/if}
</header>

<style>
  .kopfzeile {
    display: flex;
    align-items: center;
    gap: var(--r2);
    min-height: var(--treffer);
    margin-bottom: var(--r4);
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
