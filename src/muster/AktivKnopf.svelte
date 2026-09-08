<script lang="ts">
  // AktivKnopf — Rückmeldung 2026-09-08. Ersetzt den "ausblenden"/"wieder
  // einblenden"-Eintrag im Kontextmenü (Kaffeeblatt.svelte,
  // Getraenkeblatt.svelte) durch ein direktes Icon, plus denselben Umschalter
  // klein auf der Kaffee-Karte (Kaffeekarte.svelte/KaffeeListe.svelte) — ein
  // Tap dort spart den Umweg über den Detailbildschirm.
  //
  // Kein Wischen (ux-regeln.md: "Wischaktionen... werden nicht automatisch
  // übernommen", K44) — deine Entscheidung 2026-09-08: ein stilles, immer
  // sichtbares Auge-Symbol statt einer Geste.
  //
  // Zeichenstil wie Parameterkachel.svelte: Linie, viewBox 0 0 20 20,
  // stroke="currentColor", keine Füllung — kein neues Icon-System.
  //
  // Rundes 38-px-Badge wie der Rückweg-Knopf in Kopfzeile.svelte
  // (--r-knopf-rund) — dieselbe Größe passt sowohl im Kopf-aktion-Slot als
  // auch als Ecke auf einer Karte, kein zweiter Größen-Token nötig.

  let {
    aktiv,
    onKlick,
  }: {
    aktiv: boolean;
    onKlick: () => void;
  } = $props();
</script>

<button
  type="button"
  class="knopf"
  onclick={onKlick}
  aria-label={aktiv ? 'ausblenden' : 'wieder einblenden'}
  aria-pressed={!aktiv}
>
  <svg class="symbol" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
    <path d="M2 10c2-3.6 5.6-5.8 8-5.8s6 2.2 8 5.8c-2 3.6-5.6 5.8-8 5.8s-6-2.2-8-5.8z" />
    <circle cx="10" cy="10" r="2.1" />
    {#if !aktiv}<path d="M3.3 3.3l13.4 13.4" />{/if}
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
