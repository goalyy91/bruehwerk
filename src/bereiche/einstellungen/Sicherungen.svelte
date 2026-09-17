<script lang="ts">
  // Sicherungen — eigener Screen (Rückmeldung 2026-09-17), vorher inline
  // unter "Daten" in Backup.svelte. Zeigt die Restore-Punkte, die die App
  // selbst vor jeder Aktualisierung anlegt (daten/schnappschuss.ts) — der
  // Weg zurück, falls eine neue Fassung etwas zerschossen hat.

  import {
    schnappschuesse,
    schnappschussZurueckspielen,
    type Schnappschuss,
  } from '../../daten/schnappschuss';
  import { ImportFehler } from '../../daten/export';
  import { bestand } from '../bestand.svelte';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import Blattliste from '../../muster/Blattliste.svelte';

  let { onZurueck }: { onZurueck: () => void } = $props();

  // Liegen bewusst nicht im reaktiven Bestand: sie tragen jeweils eine
  // vollstaendige Kopie und haben auf jedem anderen Bildschirm nichts
  // verloren. Deshalb einmal beim Oeffnen gelesen.
  let sicherungen = $state<Schnappschuss[]>([]);
  let zurueckBestaetigen = $state<string | undefined>(undefined);
  let zurueckFehler = $state<string | undefined>(undefined);
  let zurueckErfolg = $state(false);

  $effect(() => {
    void schnappschuesse().then((liste) => (sicherungen = liste));
  });

  function wann(ts: number): string {
    const d = new Date(ts);
    return `${d.toLocaleDateString('de-DE')} ${d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}`;
  }

  /** Zweiter Tap bestaetigt — dasselbe Muster wie in Kontextmenue.svelte. */
  async function zurueckspielen(eintrag: Schnappschuss) {
    if (zurueckBestaetigen !== eintrag.id) {
      zurueckBestaetigen = eintrag.id;
      return;
    }
    zurueckBestaetigen = undefined;
    zurueckFehler = undefined;
    zurueckErfolg = false;
    try {
      await schnappschussZurueckspielen(eintrag.id);
      await bestand.laden();
      zurueckErfolg = true;
    } catch (fehler) {
      if (fehler instanceof ImportFehler) {
        zurueckFehler = fehler.einzelfehler
          .map((e) => `${e.sammlung}[${e.index}]`)
          .join(', ');
      } else {
        zurueckFehler = fehler instanceof Error ? fehler.message : String(fehler);
      }
    }
  }
</script>

<Kopfzeile titel="Sicherungen" {onZurueck} />

{#if sicherungen.length === 0}
  <p class="hinweis">
    Noch keine Sicherung — die App legt automatisch eine an, bevor eine neue
    Version geladen wird.
  </p>
{:else}
  <Blattliste>
    {#each sicherungen as eintrag (eintrag.id)}
      <button type="button" class="sicherung" onclick={() => void zurueckspielen(eintrag)}>
        <span class="haupt">
          <span class="wann">{wann(eintrag.erzeugtAm)}</span>
          <span class="umfang">
            {eintrag.anlass} · {eintrag.umfang.shots} Shots · {eintrag.umfang.kaffees} Kaffees
          </span>
        </span>
        <span class="tat" class:scharf={zurueckBestaetigen === eintrag.id}>
          {zurueckBestaetigen === eintrag.id ? 'wirklich?' : 'zurückspielen'}
        </span>
      </button>
    {/each}
  </Blattliste>
  <p class="hinweis nachsatz">
    Ersetzt danach den gesamten Datenbestand durch diesen Stand — was
    seitdem dazugekommen ist, geht verloren. Im Zweifel vorher eine Datei
    exportieren.
  </p>
  {#if zurueckErfolg}<p class="hinweis">Sicherung zurückgespielt.</p>{/if}
  {#if zurueckFehler}<p class="fehler">Zurückspielen abgelehnt — kein Datensatz wurde geschrieben: {zurueckFehler}</p>{/if}
{/if}

<style>
  .hinweis {
    font-family: var(--schrift-sans);
    color: var(--gedaempft);
    font-size: var(--fs-meta);
    margin: 0 0 var(--r3);
  }
  .nachsatz {
    margin-top: var(--r2);
  }
  .sicherung {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--r3);
    min-height: var(--blattzeile);
    padding: 0;
    border: none;
    background: transparent;
    text-align: left;
    cursor: pointer;
  }
  .haupt {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .wann {
    font-family: var(--schrift-sans);
    font-size: var(--fs-bedienwort);
    color: var(--tinte);
  }
  .umfang {
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  .tat {
    flex: none;
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--akzent);
  }
  .tat.scharf {
    color: var(--kritisch);
  }
  .fehler {
    color: var(--kritisch);
    font-size: var(--fs-satz);
    margin-top: var(--r3);
  }
</style>
