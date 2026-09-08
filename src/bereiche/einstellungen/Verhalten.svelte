<script lang="ts">
  // Verhalten — Untermenue der Einstellungen (Rueckmeldung 2026-09-08:
  // "bestand und verhalten auch in ein submenü packen wie geräte verwalten").
  //
  // Beide Gruppen zusammen auf einem Blatt statt auf zwei: es sind sechs
  // Zeilen, und sie beantworten dieselbe Frage — wann redet die App von
  // sich aus? Die drei Schalter entscheiden, ob sie beim Bestellen
  // begruendet und wie sie Milch plant; die drei Zahlen, ab wann eine Bohne
  // auf der Bar auffaellt. Zwei Bildschirme mit je drei Zeilen waeren zwei
  // Wege fuer eine Entscheidung.
  //
  // Der Startbildschirm behaelt nur "Darstellung" und "Daten" — beides
  // sieht man sofort bzw. braucht man selten, aber dann ganz.

  import { bestand, schreiben } from '../bestand.svelte';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import Schalter from '../../muster/Schalter.svelte';
  import Blattliste from '../../muster/Blattliste.svelte';
  import type { AppEinstellungen } from '../../daten/schema';
  import { EINSTELLUNGEN_ID } from '../../daten/schema';

  let { onZurueck }: { onZurueck: () => void } = $props();

  async function einstellungAendern<K extends keyof AppEinstellungen>(feld: K, wert: AppEinstellungen[K]) {
    const basis = bestand.einstellungen ?? {
      id: EINSTELLUNGEN_ID,
      begruendungKoffein: true,
      begruendungBohne: true,
      sammelSchaeumen: 'einzeln' as const,
      bestandKnappBezuege: 2,
      bestandFrischWochen: 8,
      bestandEingefrorenMonate: 8,
      thema: 'system' as const,
    };
    await schreiben('einstellungen', { ...basis, [feld]: wert });
  }

  // Erklaertexte je Zustand statt einem einzigen, zustandsunabhaengigen
  // Satz — der Schalter "aus" verdient eine eigene Aussage, nicht nur das
  // Fehlen der "an"-Aussage.
  const koffeinErklaerung = $derived(
    bestand.einstellungen?.begruendungKoffein
      ? 'Zeigt, worauf sich eine automatisch vorbelegte Koffein-Frage stützt (z. B. „7 von 8 zuletzt").'
      : 'Die Koffein-Frage erscheint ohne Begründung.',
  );
  const bohneErklaerung = $derived(
    bestand.einstellungen?.begruendungBohne
      ? 'Zeigt, worauf sich ein automatischer Bohnenvorschlag stützt.'
      : 'Der Bohnenvorschlag erscheint ohne Begründung.',
  );
  const schaeumenErklaerung = $derived(
    bestand.einstellungen?.sammelSchaeumen === 'gesammelt'
      ? 'Milch für mehrere Milchgetränke im selben Durchgang wird gemeinsam aufgeschäumt.'
      : 'Milch wird für jedes Getränk einzeln aufgeschäumt.',
  );
</script>

<Kopfzeile titel="Verhalten" {onZurueck} />

{#if bestand.einstellungen}
  <h2>Beim Bestellen</h2>
  <Blattliste>
    <div class="einstellung-zeile">
      <Schalter
        label="Begründung: Koffein"
        an={bestand.einstellungen.begruendungKoffein}
        onWahl={(a) => einstellungAendern('begruendungKoffein', a)}
      />
      <p class="erklaerung">{koffeinErklaerung}</p>
    </div>
    <div class="einstellung-zeile">
      <Schalter
        label="Begründung: Bohne"
        an={bestand.einstellungen.begruendungBohne}
        onWahl={(a) => einstellungAendern('begruendungBohne', a)}
      />
      <p class="erklaerung">{bohneErklaerung}</p>
    </div>
    <div class="einstellung-zeile">
      <Schalter
        label="Milch gesammelt schäumen"
        an={bestand.einstellungen.sammelSchaeumen === 'gesammelt'}
        onWahl={(a) => einstellungAendern('sammelSchaeumen', a ? 'gesammelt' : 'einzeln')}
      />
      <p class="erklaerung">{schaeumenErklaerung}</p>
    </div>
  </Blattliste>

  <!-- Rückmeldung 2026-09-08: die Beschriftungen hießen „Knapp" ab,
       „Alt" ab (frisch) und „Alt" ab (eingefroren) — in Anführungszeichen
       gesetzte Systemzustände mit einer Klammer dahinter. Sie beschreiben
       jetzt die Bohne selbst, und das Zahlenfeld ist so breit wie die Zahl,
       nicht wie die halbe Zeile. -->
  <h2>Bestand</h2>
  <Blattliste>
    <div class="formularzeile">
      <span class="formularzeile-label">Knapp</span>
      <input
        class="eingabefeld-text zahl schmal"
        type="text"
        inputmode="numeric"
        value={bestand.einstellungen.bestandKnappBezuege}
        onchange={(e) => einstellungAendern('bestandKnappBezuege', Math.max(0, Math.round(Number(e.currentTarget.value.replace(',', '.')))))}
      />
      <span class="einheit">Bezüge übrig</span>
    </div>
    <div class="formularzeile">
      <span class="formularzeile-label">Angebrochen</span>
      <input
        class="eingabefeld-text zahl schmal"
        type="text"
        inputmode="numeric"
        value={bestand.einstellungen.bestandFrischWochen}
        onchange={(e) => einstellungAendern('bestandFrischWochen', Math.max(1, Math.round(Number(e.currentTarget.value.replace(',', '.')))))}
      />
      <span class="einheit">Wochen</span>
    </div>
    <div class="formularzeile">
      <span class="formularzeile-label">Eingefroren</span>
      <input
        class="eingabefeld-text zahl schmal"
        type="text"
        inputmode="numeric"
        value={bestand.einstellungen.bestandEingefrorenMonate}
        onchange={(e) => einstellungAendern('bestandEingefrorenMonate', Math.max(1, Math.round(Number(e.currentTarget.value.replace(',', '.')))))}
      />
      <span class="einheit">Monate</span>
    </div>
  </Blattliste>
  <p class="erklaerung ausserhalb">
    Ab wann eine Bohne auf der Bar auffällt: „knapp“, wenn weniger Bezüge übrig sind,
    „sollte bald raus“, wenn sie länger offen oder eingefroren liegt.
  </p>
{/if}

<style>
  /* Trennlinie zwischen den Zeilen kommt von Blattliste.svelte
     (":global(* + *)"), nicht lokal von hier. */
  .einstellung-zeile {
    padding: var(--r3) 0;
  }
  .erklaerung {
    font-family: var(--schrift-sans);
    font-size: var(--fs-erklaerung);
    color: var(--gedaempft);
    margin: var(--r1) 0 0;
  }
  /* Erklaersatz unter einem ganzen Panel statt unter einer einzelnen Zeile:
     ein Satz erklaert alle drei Bestand-Felder auf einmal. */
  .erklaerung.ausserhalb {
    margin: var(--r1) 0 var(--r5);
  }
  .einheit {
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
</style>
