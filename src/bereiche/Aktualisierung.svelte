<script lang="ts">
  // Der Hinweis auf eine neue Fassung (Rückmeldung 2026-09-08).
  //
  // Bis hierher tauschte der Service Worker still im Hintergrund. Das ist
  // bequem und an einer Stelle falsch: es zieht den Boden unter einer halb
  // ausgefüllten Shot-Erfassung weg, und es gibt keinen Moment, in dem die
  // App weiß, dass gleich aktualisiert wird — also auch keinen, in dem sie
  // vorher sichern könnte.
  //
  // Jetzt fragt sie. "Später" ist kein Steckenbleiben: der Hinweis kommt
  // beim nächsten Start wieder, und die alte Fassung läuft in der
  // Zwischenzeit ungestört weiter.
  //
  // Vor dem Neuladen wird gesichert (daten/schnappschuss.ts) — der
  // vollständige Bestand, im Gerät, ohne Dialog. Schlägt das Sichern fehl,
  // wird NICHT aktualisiert: eine Aktualisierung ohne Rückweg ist genau der
  // Fall, für den die Sicherung da ist.

  import { registerSW } from 'virtual:pwa-register';
  import { schnappschussAnlegen } from '../daten/schnappschuss';
  import Knopf from '../muster/Knopf.svelte';
  import Blattliste from '../muster/Blattliste.svelte';

  /** Wie oft im laufenden Betrieb nach einer neuen Fassung gesehen wird. */
  const NACHSEHEN_MS = 60 * 60 * 1000;

  let neueFassung = $state(false);
  let laeuft = $state(false);
  let fehler = $state('');

  const aktualisieren = registerSW({
    onNeedRefresh() {
      neueFassung = true;
    },
    onRegisteredSW(_pfad, registrierung) {
      // Ohne das käme der Hinweis erst beim nächsten Start der App. Auf einem
      // Telefon, das die App tagelang im Hintergrund hält, wäre das nie.
      if (registrierung) setInterval(() => void registrierung.update(), NACHSEHEN_MS);
    },
  });

  async function jetzt() {
    laeuft = true;
    fehler = '';
    try {
      await schnappschussAnlegen('vor der Aktualisierung');
    } catch (e) {
      laeuft = false;
      fehler = `Sicherung fehlgeschlagen, deshalb nicht aktualisiert: ${e instanceof Error ? e.message : String(e)}`;
      return;
    }
    await aktualisieren(true);
  }
</script>

{#if neueFassung}
  <div class="hinweis" role="status">
    <Blattliste>
      <!-- Ein einziges Kind: die Blattliste zieht zwischen Geschwistern eine
           Haarlinie, und der Hinweis ist eine Aussage, keine Liste. -->
      <div class="innen">
        <p class="satz">Eine neue Fassung ist da. Vor dem Umstellen wird gesichert.</p>
        {#if fehler}<p class="fehler">{fehler}</p>{/if}
        <Knopf stufe="primaer" onKlick={() => void jetzt()} deaktiviert={laeuft}>
          {laeuft ? 'Sichere …' : 'Jetzt aktualisieren'}
        </Knopf>
        <Knopf stufe="still" onKlick={() => (neueFassung = false)} deaktiviert={laeuft}>später</Knopf>
      </div>
    </Blattliste>
  </div>
{/if}

<style>
  /* Steht als eigene Zeile im Rahmen zwischen Inhalt und Tab-Leiste, nicht
     als schwebende Flaeche darueber: kein fixed, keine gerechnete
     Leistenhoehe, nichts, was sich verschiebt, wenn die Leiste sich aendert.
     Die Karte selbst kommt von muster/Blattliste.svelte — hier nur die
     Einbettung. */
  .hinweis {
    flex-shrink: 0;
    margin: 0 var(--r4) var(--r3);
  }
  .innen {
    display: flex;
    flex-direction: column;
    gap: var(--r2);
  }
  .satz {
    font-size: var(--fs-satz);
    color: var(--satz);
    margin: 0;
  }
  .fehler {
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--kritisch);
    margin: 0;
  }
</style>
