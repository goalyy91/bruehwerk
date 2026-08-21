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
  import TempReferenz from './TempReferenz.svelte';

  let { onZurueck }: { onZurueck: () => void } = $props();

  const entwurf = bruehgeraetEntwurf.aktuell;
</script>

<Kopfzeile titel="Kesseltemperatur" {onZurueck} />

{#if !entwurf}
  <p class="hinweis">Kein Brühgerät-Formular offen — von dort aus über „Kesseltemperatur-Tabelle pflegen" öffnen.</p>
{:else}
  <TempReferenz werte={entwurf.tempReferenz} onAendern={(werte) => (entwurf.tempReferenz = werte)} />
  <button type="button" class="fertig" onclick={onZurueck}>fertig</button>
{/if}

<style>
  .hinweis {
    color: var(--gedaempft);
    font-size: var(--fs-satz);
  }
  .fertig {
    display: block;
    width: 100%;
    min-height: var(--treffer);
    margin-top: var(--r5);
    background: var(--akzent);
    color: var(--h-papier);
    border: none;
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    cursor: pointer;
  }
</style>
