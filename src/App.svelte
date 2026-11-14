<script lang="ts">
  // Paket 03: der Rahmen mit den fuenf Bereichen ersetzt den direkten
  // Musterblatt-Aufruf aus Paket 01b. Das Musterblatt bleibt erreichbar,
  // jetzt unter Einstellungen.
  import Rahmen from './bereiche/Rahmen.svelte';
  import { automatikStarten } from './daten/cloud';

  // Cloud-Sicherung (14.11.2026): verzögert nach jeder Änderung, sofort beim
  // Wechsel in den Hintergrund. Tut nichts, solange keine eingerichtet ist.
  $effect(() => automatikStarten());
</script>

<Rahmen />
