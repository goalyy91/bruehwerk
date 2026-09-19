<script lang="ts">
  // ChatKnopf — Rückmeldung 2026-09-19. Öffnet den Claude-Chat, in dem ein
  // Profil besprochen wird (Profil.chatLink, daten/schema/kaffee.ts). Nur
  // sichtbar, wenn ein Link hinterlegt ist — ein toter Knopf wäre eine offene
  // Frage (Aufrufer prüft das, nicht dieses Bauteil).
  //
  // Bauform 1:1 von AktivKnopf.svelte/BearbeitenKnopf.svelte übernommen
  // (rundes 38-px-Badge, Blattfläche, Akzentfarbe) — dieselbe Reihe im
  // Kopfzeile-aktion-Slot. Ein <a> statt <button>: das Telefon soll den Link
  // im Browser öffnen, nicht innerhalb der PWA-Hülle.

  let { href }: { href: string } = $props();
</script>

<a {href} target="_blank" rel="noopener noreferrer" class="knopf" aria-label="Chat öffnen">
  <svg class="symbol" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
    <path
      d="M3 4.5h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H8.5L4.5 18v-3.5H3a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1z"
      stroke-linejoin="round"
    />
  </svg>
</a>

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
