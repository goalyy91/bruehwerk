<script lang="ts">
  // Migration — Teil A der Korrekturrunde. Paket 02 hat nur geparst und
  // geprueft (notion.ts, pruefung.ts); der Schreibschritt war laut deren
  // eigenem Kommentar ausdruecklich auf Paket 03 verschoben (Setup-Bindung).
  // Diese Komponente zeigt zuerst den Pruefbericht, dann den Import-Knopf —
  // "Bei acht Kaffees kannst du das Ergebnis einmal komplett durchsehen."

  import { bestand, schreiben } from '../bestand.svelte';
  import { pruefeSeiten } from '../../daten/migration/pruefung';
  import { migriereSeiten } from '../../daten/migration/migrieren';
  import seedDatei from '../../../daten/seed/notion-2026-08-20.json';
  import type { SeedSeite } from '../../daten/migration/pruefung';

  const seed = seedDatei as { seiten: SeedSeite[]; gezogenAm: string; quelle: string };
  const gezogenAmMs = Date.parse(seed.gezogenAm);

  const bericht = pruefeSeiten(seed.seiten);

  const bereitsImportiert = $derived(
    seed.seiten.some((s) => bestand.kaffees.some((k) => k.id === s.id)),
  );

  let laeuft = $state(false);
  let fehler = $state<string | undefined>(undefined);
  let ergebnisText = $state<string | undefined>(undefined);
  let offenSichtbar = $state(false);

  async function importAusfuehren() {
    laeuft = true;
    fehler = undefined;
    try {
      const ergebnis = migriereSeiten(seed.seiten, gezogenAmMs);
      for (const c of ergebnis.chargen) await schreiben('charge', c);
      for (const k of ergebnis.kaffees) await schreiben('kaffee', k);
      for (const g of ergebnis.gussplaene) await schreiben('gussplan', g);
      for (const p of ergebnis.profile) await schreiben('profil', p);
      for (const s of ergebnis.shots) await schreiben('shot', s);
      ergebnisText = `${ergebnis.kaffees.length} Kaffees, ${ergebnis.profile.length} Profile, ${ergebnis.shots.length} Shots geschrieben. ${ergebnis.bericht.offen.length} offene Punkte — unten nachlesbar.`;
    } catch (e) {
      fehler = e instanceof Error ? e.message : String(e);
    } finally {
      laeuft = false;
    }
  }
</script>

<h2>Migration aus Notion</h2>
<p class="hinweis">
  Quelle: {seed.quelle}<br />
  Stand: {new Date(gezogenAmMs).toLocaleDateString('de-DE')} ·
  {bericht.zahlen.kaffees} Kaffees · {bericht.zahlen.profile} Profile · {bericht.zahlen.shots} Dial-in-Einträge ·
  {bericht.zahlen.offen} offene Punkte
</p>

{#if bereitsImportiert}
  <p class="hinweis">Bereits importiert — mindestens ein migrierter Kaffee ist im Bestand.</p>
{:else if ergebnisText}
  <p class="hinweis">{ergebnisText}</p>
{:else}
  <p class="warnhinweis">
    Nicht jeder Datensatz lässt sich eindeutig zuordnen — nicht zuordenbare Profile/Shots werden
    <strong>nicht geraten</strong>, sondern unten im Bericht aufgeführt. Chargen sind Platzhalter,
    weil Notion nie Röstdaten strukturiert geführt hat.
  </p>
  <button type="button" class="primaer" onclick={importAusfuehren} disabled={laeuft}>
    {laeuft ? 'läuft …' : 'Import ausführen'}
  </button>
{/if}

{#if fehler}
  <p class="fehler">Nicht gespeichert: {fehler} — nochmal versuchen.</p>
{/if}

<button type="button" class="link" onclick={() => (offenSichtbar = !offenSichtbar)}>
  {offenSichtbar ? 'Bericht ausblenden' : `Bericht anzeigen (${bericht.zahlen.offen} Punkte)`}
</button>

{#if offenSichtbar}
  <ul class="berichtliste">
    {#each bericht.offen as punkt, i (i)}
      <li><span class="quelle">{punkt.quelle}</span> — {punkt.was} <span class="warum">({punkt.warum})</span></li>
    {/each}
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
  .warnhinweis {
    color: var(--satz);
    font-size: var(--fs-satz);
    margin: 0 0 var(--r3);
  }
  .primaer {
    min-height: var(--treffer);
    padding: 0 var(--r4);
    background: var(--akzent);
    color: var(--h-papier);
    border: none;
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    cursor: pointer;
  }
  .primaer:disabled {
    opacity: 0.6;
    cursor: default;
  }
  .link {
    display: block;
    background: none;
    border: none;
    color: var(--akzent);
    font-family: var(--schrift);
    font-size: var(--fs-meta);
    min-height: var(--treffer);
    padding: 0;
    margin-top: var(--r3);
    cursor: pointer;
  }
  .berichtliste {
    list-style: none;
    margin: 0;
    padding: 0;
    max-height: 320px;
    overflow-y: auto;
    border-top: 1px solid var(--linie);
  }
  .berichtliste li {
    padding: var(--r2) 0;
    border-bottom: 1px solid var(--linie-zart);
    font-size: var(--fs-meta);
    color: var(--satz);
  }
  .quelle {
    color: var(--gedaempft);
  }
  .warum {
    color: var(--gedaempft);
  }
  .fehler {
    color: var(--kritisch);
    font-size: var(--fs-satz);
    margin-top: var(--r3);
  }
</style>
