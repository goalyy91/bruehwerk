<script lang="ts">
  // Muster 6 · Doppelte Einheit (Übergabe, Abschnitt 2).
  // Gestuft: der eingestellte Wert führt (121 °C Kessel), der abgeleitete
  // folgt kleiner mit Tilde (≈ 94 °C Gruppe). Nur einer bekannt → nur er
  // steht da. Der abgeleitete Wert trägt den gefüllten Punkt — gerechnet
  // gilt wie gemessen (K54).

  let {
    fuehrendWert,
    fuehrendEinheit,
    abgeleitetWert,
    abgeleitetEinheit,
  }: {
    fuehrendWert: string;
    fuehrendEinheit: string;
    abgeleitetWert?: string;
    abgeleitetEinheit?: string;
  } = $props();
</script>

<div class="doppelt">
  <span class="fuehrend zahl">{fuehrendWert} {fuehrendEinheit}</span>
  {#if abgeleitetWert}
    <span class="abgeleitet">
      <span class="zeichen"></span>
      <span class="zahl">≈ {abgeleitetWert} {abgeleitetEinheit}</span>
    </span>
  {/if}
</div>

<style>
  .doppelt {
    display: flex;
    align-items: baseline;
    gap: var(--r2);
  }
  .fuehrend {
    font-size: var(--fs-urteil);
    color: var(--tinte);
  }
  .abgeleitet {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  .zeichen {
    display: inline-block;
    width: var(--zeichen);
    height: var(--zeichen);
    border-radius: 50%;
    background: var(--tinte);
    opacity: 0.6;
  }
</style>
