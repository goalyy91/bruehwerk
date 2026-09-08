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
  import { cloudVerfuegbar } from '../../daten/cloud';
  import {
    schnappschuesse,
    schnappschussZurueckspielen,
    type Schnappschuss,
  } from '../../daten/schnappschuss';
  import { bestand } from '../bestand.svelte';
  import Blattliste from '../../muster/Blattliste.svelte';
  import Blattzeile from '../../muster/Blattzeile.svelte';

  let exportFehler = $state<string | undefined>(undefined);
  let importFehler = $state<string[] | undefined>(undefined);
  let importErfolg = $state(false);
  let dateiEingabe = $state<HTMLInputElement | undefined>();

  // Cloud-Backup (2026-09-08) — die eigentliche Logik (an-/abmelden, hoch-/
  // herunterladen, der Debounce nach jedem Schreiben) sitzt im reaktiven
  // Bestand (bereiche/bestand.svelte.ts), hier nur die Bedienung.
  // cloudVerfuegbar() ist false, solange kein Firebase-Projekt eingerichtet
  // ist — der ganze Abschnitt bleibt dann weg, keine halbe Funktion im Bild.
  let cloudWiederherstellenBestaetigen = $state(false);
  let cloudWiederherstellenFehler = $state<string | undefined>(undefined);
  let cloudWiederherstellenErfolg = $state(false);

  /** Zweiter Tap bestaetigt — dasselbe Muster wie bei den lokalen Sicherungen unten. */
  async function cloudWiederherstellen() {
    if (!cloudWiederherstellenBestaetigen) {
      cloudWiederherstellenBestaetigen = true;
      return;
    }
    cloudWiederherstellenBestaetigen = false;
    cloudWiederherstellenFehler = undefined;
    cloudWiederherstellenErfolg = false;
    try {
      await bestand.cloudWiederherstellen();
      cloudWiederherstellenErfolg = true;
    } catch (fehler) {
      if (fehler instanceof ImportFehler) {
        cloudWiederherstellenFehler = fehler.einzelfehler.map((e) => `${e.sammlung}[${e.index}]`).join(', ');
      } else {
        cloudWiederherstellenFehler = fehler instanceof Error ? fehler.message : String(fehler);
      }
    }
  }

  // Die Sicherungen, die die App vor einer Aktualisierung selbst anlegt
  // (daten/schnappschuss.ts). Sie liegen bewusst nicht im reaktiven Bestand:
  // sie tragen jeweils eine vollstaendige Kopie und haben auf jedem anderen
  // Bildschirm nichts verloren. Deshalb einmal beim Oeffnen gelesen.
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
      // Der lokale Bestand hat sich gerade komplett geaendert — der
      // Cloud-Spiegel soll das nachziehen, nicht erst beim naechsten
      // regulaeren Schreiben (still im Hintergrund, kein await: ein
      // Cloud-Fehlschlag darf das lokale Zurueckspielen nicht trueben).
      void bestand.cloudJetztSichern();
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
      // Wie beim Zurueckspielen einer lokalen Sicherung: der Cloud-Spiegel
      // zieht den neuen Stand nach, still im Hintergrund.
      void bestand.cloudJetztSichern();
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

<!-- Rückmeldung 2026-09-08: der Satz "Alles, was in der App steht, als
     Datei zum Mitnehmen." erklärte nichts, was "Datei exportieren"/"Datei
     importieren" nicht schon selbst sagen — ersatzlos entfernt. -->
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

<!-- Cloud-Backup (2026-09-08) — nur sichtbar, wenn ein Firebase-Projekt
     eingerichtet ist. Abgemeldet: ein Knopf. Angemeldet: Konto, Status,
     zwei Handlungen. Kein automatisches Wiederherstellen beim Anmelden —
     immer ein bewusster, zweifach bestätigter Tap, aus demselben Grund wie
     beim lokalen Zurückspielen unten: es ersetzt den gesamten Bestand. -->
{#if cloudVerfuegbar()}
  <h2>Cloud</h2>
  {#if !bestand.cloudNutzer}
    <div class="aktionen">
      <Blattliste>
        <Blattzeile label="Mit Google anmelden" akzent chevron={false} onKlick={() => void bestand.cloudAnmelden()} />
      </Blattliste>
    </div>
  {:else}
    <Blattliste>
      <div class="cloud-status">
        <span class="cloud-konto">{bestand.cloudNutzer.email ?? 'Angemeldet'}</span>
        <span class="cloud-zeile hinweis">
          {#if bestand.cloudSichertGerade}Sichert …
          {:else if bestand.cloudLetzteSicherung}zuletzt gesichert: {wann(bestand.cloudLetzteSicherung)}
          {:else}noch nicht gesichert
          {/if}
        </span>
      </div>
      <button type="button" class="sicherung" onclick={() => void cloudWiederherstellen()}>
        <span class="haupt">
          <span class="wann">Cloud-Sicherung</span>
        </span>
        <span class="tat" class:scharf={cloudWiederherstellenBestaetigen}>
          {cloudWiederherstellenBestaetigen ? 'wirklich?' : 'laden'}
        </span>
      </button>
      <button type="button" class="sicherung" onclick={() => void bestand.cloudAbmelden()}>
        <span class="haupt"><span class="wann">Konto</span></span>
        <span class="tat">abmelden</span>
      </button>
    </Blattliste>
    <p class="hinweis nachsatz">
      Aus der Cloud laden ersetzt den gesamten Bestand durch die Cloud-Sicherung — exportiere im Zweifel vorher eine Datei.
    </p>
    {#if cloudWiederherstellenErfolg}<p class="hinweis">Cloud-Sicherung geladen.</p>{/if}
    {#if cloudWiederherstellenFehler}<p class="fehler">Nicht geladen: {cloudWiederherstellenFehler}</p>{/if}
    {#if bestand.cloudFehler}<p class="fehler">Cloud-Sicherung: {bestand.cloudFehler}</p>{/if}
  {/if}
{/if}

<!-- Rückmeldung 2026-09-08: vor jeder Aktualisierung sichert die App selbst.
     Hier steht, was dabei herauskam — und der Weg zurück, falls eine neue
     Fassung etwas zerschossen hat. Die Liste erscheint erst, wenn es etwas
     zu zeigen gibt: eine leere Überschrift „Sicherungen" auf einem frisch
     eingerichteten Gerät wäre eine Frage ohne Antwort. -->
{#if sicherungen.length > 0}
  <h2>Sicherungen</h2>
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
    Zurückspielen ersetzt den gesamten Bestand durch den Stand von damals. Was
    seitdem dazugekommen ist, ist danach weg — exportiere im Zweifel vorher eine Datei.
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
  /* Blattliste.svelte traegt die Flaeche selbst, hier nur der Abstand zu den
     Melde-Zeilen darunter (frueher .panel.schmal { margin-bottom }). Der
     Wrapper ".aktionen" ist noetig, damit der :global()-Teil ausschliesslich
     die Blattliste dieser Datei trifft, nicht jede andere auf der Seite. */
  .aktionen :global(.blattliste) {
    margin-bottom: var(--r3);
  }
  .nachsatz {
    margin-top: var(--r2);
  }
  .cloud-status {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-height: var(--blattzeile);
    justify-content: center;
  }
  .cloud-konto {
    font-family: var(--schrift-sans);
    font-size: var(--fs-bedienwort);
    color: var(--tinte);
  }
  .cloud-zeile {
    margin: 0;
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
  .fehlerliste {
    margin: var(--r2) 0 0;
    padding-left: var(--r4);
    font-size: var(--fs-meta);
    color: var(--kritisch);
  }
</style>
