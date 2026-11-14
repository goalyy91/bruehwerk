<script lang="ts">
  // Paket 03: der Rahmen mit den fuenf Bereichen ersetzt den direkten
  // Musterblatt-Aufruf aus Paket 01b. Das Musterblatt bleibt erreichbar,
  // jetzt unter Einstellungen.
  import Rahmen from './bereiche/Rahmen.svelte';
  import { automatikStarten } from './daten/cloud';
  import { bestand } from './bereiche/bestand.svelte';

  // Cloud-Sicherung (14.11.2026): sichert verzögert nach jeder Änderung und
  // beim Wechsel in den Hintergrund; holt beim Start und bei jeder Rückkehr
  // den Stand eines anderen Geräts. Tut nichts, solange keine eingerichtet ist.
  $effect(() => automatikStarten(undefined, () => void bestand.laden()));
</script>

<Rahmen />
