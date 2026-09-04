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
  //
  // Visueller Redesign-Reset, Paket 4: Bericht-Liste jetzt Blatt statt
  // eckig umrandeter Liste, "Bericht anzeigen" als Blattzeile im Akzent.

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
    <div class="berichtliste">
      {#each vorschau.bericht.offen as punkt, i (i)}
        <div class="berichtzeile"><span class="quelle">{punkt.quelle}</span> — {punkt.was} <span class="warum">({punkt.warum})</span></div>
      {/each}
    </div>
  {/if}
{/if}

<style>
  .hinweis {
    font-family: var(--schrift-sans);
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
    font-size: var(--fs-bedienwort);
    min-height: var(--treffer);
    padding: 0;
    margin-top: var(--r3);
    cursor: pointer;
  }
  .berichtliste {
    display: flex;
    flex-direction: column;
    margin-top: var(--r3);
    max-height: var(--max-liste);
    overflow-y: auto;
    background: var(--blatt);
    border-radius: var(--r-blatt);
    padding: 0 var(--r4);
  }
  .berichtzeile {
    padding: var(--r2) 0;
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--satz);
  }
  .berichtzeile + .berichtzeile {
    border-top: 1px solid var(--linie);
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
