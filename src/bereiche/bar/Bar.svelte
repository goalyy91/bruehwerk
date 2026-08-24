<script lang="ts">
  // Die Bar — Start. K4: hoechstens eine Quittungszeile, die stehen
  // bleibt, bis der naechste Shot laeuft oder die App neu geoeffnet wird.
  // Der Zwei-Tap-Schnellpfad (Decay-Ranking) ist Paket 07, die Bestellung
  // Paket 06 — bis dahin ist die Bar der Ort, an dem die letzte Quittung
  // steht, mehr nicht.
  //
  // Paket 4: Kopfzeile im gross-Modus, wie alle Root-Tab-Screens ohne
  // Rueckweg (Handoff: "Titel 32/600").

  import { bestand } from '../bestand.svelte';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';

  const letzterShot = $derived(
    bestand.shots.length === 0 ? undefined : [...bestand.shots].sort((a, b) => b.ts - a.ts)[0],
  );
  const kaffeeName = $derived(bestand.kaffees.find((k) => k.id === letzterShot?.kaffeeId)?.name);
</script>

<Kopfzeile titel="Bar" gross />

{#if letzterShot && kaffeeName}
  <p class="quittung">{kaffeeName} · {letzterShot.urteil}</p>
{:else}
  <p class="hinweis">Noch kein Shot geloggt. Loggen geht ab einem Kaffee mit Profil — unter „Kaffees".</p>
{/if}

<style>
  .quittung {
    font-size: var(--fs-satz);
    color: var(--satz);
  }
  .hinweis {
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
</style>
