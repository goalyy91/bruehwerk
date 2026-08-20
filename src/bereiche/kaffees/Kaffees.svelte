<script lang="ts">
  // Bereich Kaffees — schaltet zwischen Bestandsliste und Kaffeeblatt um.
  // Der Rueckweg (K78) ist die Zurueck-Zeile im Blatt selbst.

  import KaffeeListe from './KaffeeListe.svelte';
  import Kaffeeblatt from './Kaffeeblatt.svelte';
  import Profilblatt from './Profilblatt.svelte';

  let kaffeeId = $state<string | undefined>(undefined);
  let profilId = $state<string | undefined>(undefined);
</script>

{#if profilId}
  <Profilblatt {profilId} onZurueck={() => (profilId = undefined)} />
{:else if kaffeeId}
  <Kaffeeblatt
    kaffeeId={kaffeeId}
    onZurueck={() => (kaffeeId = undefined)}
    onOeffnenProfil={(id) => (profilId = id)}
  />
{:else}
  <KaffeeListe onOeffnen={(id) => (kaffeeId = id)} />
{/if}
