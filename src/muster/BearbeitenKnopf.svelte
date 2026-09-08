<script lang="ts">
  // BearbeitenKnopf — Rückmeldung 2026-09-08. Direktes Stift-Icon statt
  // "bearbeiten" als Kontextmenü-Eintrag — ux-regeln.md Regel 4 sieht das für
  // genau eine Sekundäraktion ohnehin vor ("bleibt es beim vorhandenen
  // Stift-Symbol"), nur gab es das Symbol bisher nirgends wirklich, weil
  // Kaffeeblatt/Getraenkeblatt schon bei zwei Aktionen (bearbeiten + aktiv)
  // gleich zum Kontextmenü gegriffen haben. Zusammen mit AktivKnopf.svelte
  // deckt das jetzt beide Fälle direkt ab.
  //
  // Gleicher Rahmen wie AktivKnopf.svelte (--r-knopf-rund, Blattfläche,
  // Akzentfarbe) — beide sitzen nebeneinander im Kopfzeile-aktion-Slot.

  let { onKlick }: { onKlick: () => void } = $props();
</script>

<button type="button" class="knopf" onclick={onKlick} aria-label="bearbeiten">
  <svg class="symbol" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
    <path d="M13.2 3.3a1.6 1.6 0 0 1 2.3 0l1.2 1.2a1.6 1.6 0 0 1 0 2.3L7 16.5l-3.5.7.7-3.5 8.9-8.9z" stroke-linejoin="round" />
    <path d="M11.7 4.8l3.5 3.5" />
  </svg>
</button>

<style>
  .knopf {
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
    cursor: pointer;
  }
  .symbol {
    width: 17px;
    height: 17px;
  }
</style>
