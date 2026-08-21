<script lang="ts">
  // Backup — Teil F der Korrekturrunde. daten/export.ts (exportiere/
  // importiere) war fertig und getestet, aber an keiner Stelle verdrahtet.
  // CLAUDE.md nennt den manuellen Datei-Export ausdruecklich als zweiten,
  // anbieterfreien Backup-Weg neben dem noch nicht gewaehlten Cloud-Backend.

  import { exportiere, importiere, ImportFehler } from '../../daten/export';
  import { bestand } from '../bestand.svelte';

  let exportFehler = $state<string | undefined>(undefined);
  let importFehler = $state<string[] | undefined>(undefined);
  let importErfolg = $state(false);
  let dateiEingabe = $state<HTMLInputElement | undefined>();

  async function datenExportieren() {
    exportFehler = undefined;
    try {
      const datei = await exportiere();
      const blob = new Blob([JSON.stringify(datei, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const datum = new Date(datei.erzeugtAm).toISOString().slice(0, 10);
      link.download = `bruehwerk-export-${datum}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (fehler) {
      exportFehler = fehler instanceof Error ? fehler.message : String(fehler);
    }
  }

  async function dateiAusgewaehlt(e: Event) {
    const datei = (e.currentTarget as HTMLInputElement).files?.[0];
    if (!datei) return;
    importFehler = undefined;
    importErfolg = false;
    try {
      const text = await datei.text();
      await importiere(JSON.parse(text));
      importErfolg = true;
      await bestand.laden();
    } catch (fehler) {
      if (fehler instanceof ImportFehler) {
        importFehler = fehler.einzelfehler.map((e2) => `${e2.sammlung}[${e2.index}]: ${e2.ursache.issues.map((i) => i.message).join('; ')}`);
      } else {
        importFehler = [fehler instanceof Error ? fehler.message : String(fehler)];
      }
    } finally {
      if (dateiEingabe) dateiEingabe.value = '';
    }
  }
</script>

<h2>Backup</h2>
<p class="hinweis">Vollständiger Bestand, kein Backend beteiligt — funktioniert auch, wenn ein späterer Cloud-Dienst ausfällt.</p>

<div class="knopfreihe">
  <button type="button" onclick={datenExportieren}>Datei exportieren</button>
  <button type="button" onclick={() => dateiEingabe?.click()}>Datei importieren</button>
  <input bind:this={dateiEingabe} type="file" accept="application/json" onchange={dateiAusgewaehlt} hidden />
</div>

{#if exportFehler}
  <p class="fehler">Export fehlgeschlagen: {exportFehler}</p>
{/if}
{#if importErfolg}
  <p class="hinweis">Import abgeschlossen.</p>
{/if}
{#if importFehler}
  <p class="fehler">Import abgelehnt — kein Datensatz wurde geschrieben:</p>
  <ul class="fehlerliste">
    {#each importFehler as f (f)}<li>{f}</li>{/each}
  </ul>
{/if}

<style>
  h2 {
    font-size: var(--fs-label);
    letter-spacing: var(--label-spacing);
    text-transform: uppercase;
    color: var(--gedaempft);
    font-weight: var(--gw-text);
    margin: var(--r5) 0 var(--r2);
  }
  .hinweis {
    color: var(--gedaempft);
    font-size: var(--fs-meta);
    margin: 0 0 var(--r3);
  }
  .knopfreihe {
    display: flex;
    flex-wrap: wrap;
    gap: var(--r3);
  }
  button {
    min-height: var(--treffer);
    padding: 0 var(--r4);
    background: var(--feld);
    border: 1px solid var(--linie);
    color: var(--tinte);
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    cursor: pointer;
  }
  .fehler {
    color: var(--kritisch);
    font-size: var(--fs-satz);
    margin-top: var(--r3);
  }
  .fehlerliste {
    margin: var(--r2) 0 0;
    padding-left: var(--r4);
    font-size: var(--fs-meta);
    color: var(--kritisch);
  }
</style>
