<script lang="ts">
  // Bereich Kaffees — schaltet zwischen Bestandsliste und Kaffeeblatt um.
  // Der Rueckweg (K78) ist die Zurueck-Zeile im Blatt selbst.

  import KaffeeListe from './KaffeeListe.svelte';
  import Kaffeeblatt from './Kaffeeblatt.svelte';

  let geoeffnetId = $state<string | undefined>(undefined);
</script>

{#if geoeffnetId}
  <Kaffeeblatt kaffeeId={geoeffnetId} onZurueck={() => (geoeffnetId = undefined)} />
{:else}
  <KaffeeListe onOeffnen={(id) => (geoeffnetId = id)} />
{/if}
