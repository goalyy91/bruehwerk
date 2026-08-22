<script lang="ts">
  // Migration — Teil A der Korrekturrunde. Paket 02 hat nur geparst und
  // geprueft (notion.ts, pruefung.ts); der Schreibschritt war laut deren
  // eigenem Kommentar ausdruecklich auf Paket 03 verschoben (Setup-Bindung).
  //
  // Zahlen und Zuordnung kommen jetzt aus migrieren.ts selbst (lockere
  // Regel, siehe dort) statt aus pruefeSeiten() — die strenge Bereichs-
  // pruefung dort haette nur 1 von 8 Kaffees erfasst.
  //
  // "Nur einmal relevant" (Rueckmeldung): die ganze Komponente verschwindet
  // vollstaendig, sobald mindestens ein migrierter Kaffee im Bestand ist.

  import { bestand, schreiben } from '../bestand.svelte';
  import Knopf from '../../muster/Knopf.svelte';
  import { migriereSeiten } from '../../daten/migration/migrieren';
  import seedDatei from '../../../daten/seed/notion-2026-08-20.json';
  import type { SeedSeite } from '../../daten/migration/pruefung';

  const seed = seedDatei as { seiten: SeedSeite[]; gezogenAm: string; quelle: string };
  const gezogenAmMs = Date.parse(seed.gezogenAm);

  const bereitsImportiert = $derived(
    seed.seiten.some((s) => bestand.kaffees.some((k) => k.id === s.id)),
  );

  const vorschau = migriereSeiten(seed.seiten, gezogenAmMs);

  let laeuft = $state(false);
  let fehler = $state<string | undefined>(undefined);
  let offenSichtbar = $state(false);

  async function importAusfuehren() {
    laeuft = true;
    fehler = undefined;
    try {
      for (const c of vorschau.chargen) await schreiben('charge', c);
      for (const k of vorschau.kaffees) await schreiben('kaffee', k);
      for (const g of vorschau.gussplaene) await schreiben('gussplan', g);
      for (const p of vorschau.profile) await schreiben('profil', p);
      for (const s of vorschau.shots) await schreiben('shot', s);
    } catch (e) {
      fehler = e instanceof Error ? e.message : String(e);
    } finally {
      laeuft = false;
    }
  }
</script>

{#if !bereitsImportiert}
  <h2>Migration aus Notion</h2>
  <p class="hinweis">
    Quelle: {seed.quelle}<br />
    Stand: {new Date(gezogenAmMs).toLocaleDateString('de-DE')} ·
    {vorschau.bericht.kaffees} Kaffees · {vorschau.bericht.profile} Profile · {vorschau.bericht.shots} Shots ·
    {vorschau.bericht.offen.length} offene Punkte
  </p>

  <p class="warnhinweis">
    Nicht jeder Datensatz lässt sich eindeutig zuordnen — nicht zuordenbare Profile/Shots werden
    <strong>nicht geraten</strong>, sondern unten im Bericht aufgeführt. Chargen sind Platzhalter,
    weil Notion nie Röstdaten strukturiert geführt hat.
  </p>
  <div class="knopfreihe">
    <Knopf stufe="primaer" onKlick={importAusfuehren} deaktiviert={laeuft}>
      {laeuft ? 'läuft …' : 'Import ausführen'}
    </Knopf>
  </div>

  {#if fehler}
    <p class="fehler">Nicht gespeichert: {fehler} — nochmal versuchen.</p>
  {/if}

  <button type="button" class="link" onclick={() => (offenSichtbar = !offenSichtbar)}>
    {offenSichtbar ? 'Bericht ausblenden' : `Bericht anzeigen (${vorschau.bericht.offen.length} Punkte)`}
  </button>

  {#if offenSichtbar}
    <ul class="berichtliste">
      {#each vorschau.bericht.offen as punkt, i (i)}
        <li><span class="quelle">{punkt.quelle}</span> — {punkt.was} <span class="warum">({punkt.warum})</span></li>
      {/each}
    </ul>
  {/if}
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
  .knopfreihe {
    margin-top: var(--r2);
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
    max-height: var(--max-liste);
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
