<script lang="ts">
  // Die Bar — Start. K4: hoechstens eine Quittungszeile, die stehen
  // bleibt, bis der naechste Shot laeuft oder die App neu geoeffnet wird.
  // Der Zwei-Tap-Schnellpfad (Decay-Ranking) ist Paket 07, die Bestellung
  // Paket 06 — bis dahin ist die Bar der Ort, an dem die letzte Quittung
  // steht, mehr nicht.

  import { bestand } from '../bestand.svelte';

  const letzterShot = $derived(
    bestand.shots.length === 0 ? undefined : [...bestand.shots].sort((a, b) => b.ts - a.ts)[0],
  );
  const kaffeeName = $derived(bestand.kaffees.find((k) => k.id === letzterShot?.kaffeeId)?.name);
</script>

<h1>Bar</h1>

{#if letzterShot && kaffeeName}
  <p class="quittung">{kaffeeName} · {letzterShot.urteil}</p>
{:else}
  <p class="hinweis">Noch kein Shot geloggt. Loggen geht ab einem Kaffee mit Profil — unter „Kaffees".</p>
{/if}

<p class="hinweis">Bestellung mit Durchgängen und Schnellpfad kommt in Paket 06/07.</p>

<style>
  h1 {
    font-size: var(--fs-titel);
    font-weight: var(--gw-titel);
    margin: 0 0 var(--r4);
  }
  .quittung {
    font-size: var(--fs-satz);
    color: var(--satz);
  }
  .hinweis {
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
</style>
