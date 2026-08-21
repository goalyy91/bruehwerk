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

  let {
    titel,
    onZurueck,
  }: {
    titel: string;
    onZurueck?: () => void;
  } = $props();
</script>

<header class="kopfzeile">
  {#if onZurueck}
    <button type="button" class="zurueck" onclick={onZurueck} aria-label="zurück">‹</button>
  {/if}
  <h1>{titel}</h1>
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
    width: var(--treffer);
    height: var(--treffer);
    margin-left: calc(var(--r2) * -1);
    background: none;
    border: none;
    color: var(--akzent);
    font-family: var(--schrift);
    font-size: 24px;
    line-height: 1;
    cursor: pointer;
  }
  h1 {
    font-size: var(--fs-titel);
    font-weight: var(--gw-titel);
    margin: 0;
  }
</style>
