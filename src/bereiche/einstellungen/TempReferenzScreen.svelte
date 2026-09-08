<script lang="ts">
  // TempReferenzScreen — eigener Bildschirm fuer die Kesseltemperatur-Tabelle
  // (offene-punkte-ux.md Punkt 3). Arbeitet auf dem laufenden
  // Bruehgeraet-Entwurf aus bruehgeraetEntwurf.svelte.ts, nicht auf einer
  // gespeicherten bruehgeraetId — nur so funktioniert das auch fuer ein noch
  // nicht angelegtes Geraet. Nur ueber die Zeile in Bruehgeraetblatt.svelte
  // erreichbar; ohne offenen Entwurf (z. B. Direktlink) gibt es nichts zu
  // zeigen.

  import { bruehgeraetEntwurf } from './bruehgeraetEntwurf.svelte';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import Knopf from '../../muster/Knopf.svelte';
  import TempReferenz from './TempReferenz.svelte';

  let { onZurueck }: { onZurueck: () => void } = $props();

  const entwurf = bruehgeraetEntwurf.aktuell;
</script>

<Kopfzeile titel="Kesseltemperatur" {onZurueck} />

{#if !entwurf}
  <p class="hinweis">Kein Brühgerät-Formular offen — von dort aus über „Kesseltemperatur-Tabelle pflegen" öffnen.</p>
{:else}
  <TempReferenz werte={entwurf.tempReferenz} onAendern={(werte) => (entwurf.tempReferenz = werte)} />
  <div class="knopfreihe">
    <Knopf stufe="primaer" onKlick={onZurueck}>fertig</Knopf>
  </div>
{/if}

<style>
  .hinweis {
    color: var(--gedaempft);
    font-size: var(--fs-satz);
  }
  .knopfreihe {
    margin-top: var(--r5);
  }
</style>
