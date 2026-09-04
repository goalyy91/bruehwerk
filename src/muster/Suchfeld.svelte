<script lang="ts">
  // Suchfeld — neu im visuellen Redesign-Reset (Handoff 3.8 "Suchfeld"):
  // Höhe 60, Radius 999, Blattfläche, Lupe in Spurfarbe, Text in Spur-/
  // Platzhalterfarbe, Innenrand 22. War vorher rohes <input> mit eigenem
  // CSS in KaffeeListe.svelte (aktuell der einzige Aufrufer) — als eigener
  // Baustein, damit eine zweite Suchzeile (z. B. Historie, Paket 05) dasselbe
  // Bild bekommt, statt das CSS ein zweites Mal von Hand nachzubauen
  // (ux-regeln.md Regel 6/12: Konsistenz vor Einzellösung).
  //
  // Reiner Anzeige-/Eingabe-Baustein ohne eigene Suchlogik — Suchtext bleibt
  // wie bisher State beim Aufrufer (bind:value-Ersatz über wert/onWert).

  let {
    wert,
    onWert,
    platzhalter = 'Suchen …',
  }: {
    wert: string;
    onWert: (wert: string) => void;
    platzhalter?: string;
  } = $props();
</script>

<div class="suchfeld">
  <svg class="lupe" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
    <circle cx="9" cy="9" r="5.2" />
    <path d="M12.9 12.9L16.5 16.5" />
  </svg>
  <input
    class="eingabe"
    type="text"
    placeholder={platzhalter}
    value={wert}
    oninput={(e) => onWert(e.currentTarget.value)}
  />
</div>

<style>
  .suchfeld {
    display: flex;
    align-items: center;
    gap: var(--r3);
    height: var(--suchfeld-hoehe);
    padding: 0 var(--seitenrand);
    background: var(--blatt);
    border-radius: var(--r-pille);
  }
  .lupe {
    flex: none;
    width: 17px;
    height: 17px;
    color: var(--spur);
  }
  .eingabe {
    flex: 1;
    min-width: 0;
    border: none;
    background: none;
    font-family: var(--schrift);
    font-size: 16.5px;
    color: var(--tinte);
  }
  .eingabe::placeholder {
    color: var(--spur);
  }
</style>
