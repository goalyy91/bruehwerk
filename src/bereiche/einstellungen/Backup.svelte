<script lang="ts">
  // Backup — Teil F der Korrekturrunde. daten/export.ts (exportiere/
  // importiere) war fertig und getestet, aber an keiner Stelle verdrahtet.
  // CLAUDE.md nennt den manuellen Datei-Export ausdruecklich als zweiten,
  // anbieterfreien Backup-Weg neben dem noch nicht gewaehlten Cloud-Backend.
  //
  // Visueller Redesign-Reset, Paket 4: Sekundaer-Knoepfe (Vertiefung/
  // Radius-Pille) statt eckig umrandeter Flaeche.
  //
  // Rueckmeldung (2026-08-24): als freistehende Knoepfe ohne Blattflaeche
  // war nicht erkennbar, dass "Datei exportieren"/"Datei importieren"
  // antippbar sind — jetzt dieselbe Blattzeile wie ueberall sonst auf der
  // Einstellungen-Seite (Geraete verwalten, Beobachtungen, …), nur ohne
  // Chevron: eine Blattzeile mit "›" verspricht einen Bildschirmwechsel,
  // hier passiert die Aktion aber sofort an Ort und Stelle.
  //
  // Etappe 8, Block E (2026-09-06): die eigene "Backup"-Ueberschrift entfaellt
  // — Einstellungen.svelte traegt jetzt "Daten" als gemeinsame Ueberschrift
  // fuer Migration und Backup (vier Gruppen statt sieben).

  import { exportiere, importiere, ImportFehler } from '../../daten/export';
  import { bestand } from '../bestand.svelte';
  import Blattliste from '../../muster/Blattliste.svelte';
  import Blattzeile from '../../muster/Blattzeile.svelte';

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

<p class="hinweis">Alles, was in der App steht, als Datei zum Mitnehmen.</p>

<div class="aktionen">
  <Blattliste>
    <Blattzeile label="Datei exportieren" akzent chevron={false} onKlick={datenExportieren} />
    <Blattzeile label="Datei importieren" akzent chevron={false} onKlick={() => dateiEingabe?.click()} />
  </Blattliste>
</div>
<input bind:this={dateiEingabe} type="file" accept="application/json" onchange={dateiAusgewaehlt} hidden />

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
  .hinweis {
    font-family: var(--schrift-sans);
    color: var(--gedaempft);
    font-size: var(--fs-meta);
    margin: 0 0 var(--r3);
  }
  /* Blattliste.svelte traegt die Flaeche selbst, hier nur der Abstand zu den
     Melde-Zeilen darunter (frueher .panel.schmal { margin-bottom }). Der
     Wrapper ".aktionen" ist noetig, damit der :global()-Teil ausschliesslich
     die Blattliste dieser Datei trifft, nicht jede andere auf der Seite. */
  .aktionen :global(.blattliste) {
    margin-bottom: var(--r3);
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
