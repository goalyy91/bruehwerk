<script lang="ts">
  // Offene Beobachtungen — Paket 04, Etappe C, konzept.md:461-502. Drei
  // Wege, aufsteigend nach Aufwand: a) Chip anlegen (rueckwirkend an seine
  // Shots gehaengt), b) der kleine Regeleditor (genau drei Felder), c) der
  // Werkstattbericht zum Herauskopieren. "gesammelt in den Einstellungen,
  // nicht als Stoerung mitten im Shot" (Konzept) — deshalb ein eigener
  // Bildschirm statt eines Hinweises im Alltagspfad.

  import { bestand, schreiben } from '../bestand.svelte';
  import { offeneBeobachtungen, type Entscheidung } from '../../domain/beobachtungen';
  import { werkstattbericht, type BerichtShot } from '../../domain/bericht';
  import type { RegelParameter, Richtung } from '../../domain/diagnose';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import Knopf from '../../muster/Knopf.svelte';
  import Kontextmenue from '../../muster/Kontextmenue.svelte';
  import Einzelauswahl from '../../muster/Einzelauswahl.svelte';
  import type { Befund } from '../../daten/schema';

  let { onZurueck }: { onZurueck: () => void } = $props();

  const entscheidungen = $derived(
    bestand.beobachtungen.map((b): Entscheidung => ({ begriff: b.begriff, entscheidung: b.entscheidung, zielBegriff: b.zielBegriff })),
  );
  const offene = $derived(offeneBeobachtungen(bestand.shots, entscheidungen));

  function kaffeeName(kaffeeId: string): string {
    return bestand.kaffees.find((k) => k.id === kaffeeId)?.name ?? 'unbekannter Kaffee';
  }
  function shotsVon(shotIds: readonly string[]) {
    return shotIds
      .map((id) => bestand.shots.find((s) => s.id === id))
      .filter((s): s is NonNullable<typeof s> => s !== undefined);
  }
  function seitDatum(shotIds: readonly string[]): string {
    const zeiten = shotsVon(shotIds).map((s) => s.ts);
    if (zeiten.length === 0) return '';
    return new Date(Math.min(...zeiten)).toLocaleDateString('de-DE', { month: 'short', year: 'numeric' });
  }

  let fehler = $state<string | undefined>(undefined);
  let zusammenfassenOffen = $state<string | undefined>(undefined);
  let zusammenfassenWert = $state('');

  async function entscheidungSpeichern(begriff: string, entscheidung: Entscheidung['entscheidung'], zielBegriff?: string) {
    fehler = undefined;
    try {
      await schreiben('beobachtung', { id: crypto.randomUUID(), begriff, entscheidung, zielBegriff, ts: Date.now() });
    } catch (e) {
      fehler = e instanceof Error ? e.message : String(e);
    }
  }

  /** Weg a — der Chip wirkt rueckwirkend: er wird an genau die Shots gehaengt, aus denen er entstanden ist (konzept.md:480), mit Staerke "deutlich". */
  async function alsChipAnlegen(begriff: string, shotIds: readonly string[]) {
    fehler = undefined;
    const neu = { id: crypto.randomUUID(), label: begriff, gruppe: 'geschmack' as const, quelle: 'eigen' as const };
    try {
      await schreiben('symptom', neu);
      for (const shot of shotsVon(shotIds)) {
        if (shot.befunde.some((b) => b.symptomId === neu.id)) continue;
        const befund: Befund = { symptomId: neu.id, staerke: 'deutlich' };
        await schreiben('shot', { ...shot, befunde: [...shot.befunde, befund] });
      }
      await entscheidungSpeichern(begriff, 'chip');
    } catch (e) {
      fehler = e instanceof Error ? e.message : String(e);
    }
  }

  function zusammenfassenBestaetigen(begriff: string) {
    const ziel = zusammenfassenWert.trim();
    if (!ziel) return;
    void entscheidungSpeichern(begriff, 'alias', ziel.toLowerCase());
    zusammenfassenOffen = undefined;
    zusammenfassenWert = '';
  }

  // Weg b — der Regeleditor, genau drei Felder. PARAMETER_LABEL/RICHTUNG_JE_PARAMETER
  // halten die erlaubte Kombination fest: mg kennt nur feiner/groeber, alles
  // andere nur mehr/weniger.
  const eigeneChips = $derived(bestand.symptome.filter((s) => s.quelle === 'eigen'));

  const PARAMETER_OPTIONEN = [
    { wert: 'mg', label: 'Mahlgrad' },
    { wert: 'kt', label: 'Kesseltemperatur' },
    { wert: 'output', label: 'Output' },
    { wert: 'input', label: 'Input' },
  ];
  const RICHTUNG_JE_PARAMETER: Record<RegelParameter, { wert: Richtung; label: string }[]> = {
    mg: [{ wert: 'feiner', label: 'feiner' }, { wert: 'groeber', label: 'gröber' }],
    kt: [{ wert: 'mehr', label: 'mehr' }, { wert: 'weniger', label: 'weniger' }],
    output: [{ wert: 'mehr', label: 'mehr' }, { wert: 'weniger', label: 'weniger' }],
    input: [{ wert: 'mehr', label: 'mehr' }, { wert: 'weniger', label: 'weniger' }],
  };

  let regelEditorOffen = $state<string | undefined>(undefined);
  let regelParameter = $state<RegelParameter>('mg');
  let regelRichtung = $state<Richtung>('feiner');
  let regelSchritte = $state(1);

  function regelEditorOeffnen(chip: (typeof eigeneChips)[number]) {
    regelEditorOffen = chip.id;
    regelParameter = chip.regel?.parameter ?? 'mg';
    regelRichtung = chip.regel?.richtung ?? RICHTUNG_JE_PARAMETER[regelParameter][0]!.wert;
    regelSchritte = chip.regel?.schritte ?? 1;
  }

  async function regelSpeichern(chip: (typeof eigeneChips)[number]) {
    fehler = undefined;
    try {
      await schreiben('symptom', { ...chip, regel: { parameter: regelParameter, richtung: regelRichtung, schritte: regelSchritte } });
      regelEditorOffen = undefined;
    } catch (e) {
      fehler = e instanceof Error ? e.message : String(e);
    }
  }

  function regelText(chip: (typeof eigeneChips)[number]): string {
    if (!chip.regel) return 'keine Regel';
    const richtungLabel = RICHTUNG_JE_PARAMETER[chip.regel.parameter].find((r) => r.wert === chip.regel!.richtung)?.label;
    const parameterLabel = PARAMETER_OPTIONEN.find((p) => p.wert === chip.regel!.parameter)?.label;
    return `${parameterLabel}, ${richtungLabel}, ${chip.regel.schritte} Schritte`;
  }

  // Weg c — der Werkstattbericht. Derselbe Kontext-Baukasten wie die
  // LLM-Naht (domain/vorschlag.ts), hier nur textuell gefiltert.
  let berichtStatus = $state<'bereit' | 'kopiert' | 'fehler'>('bereit');

  async function berichtKopieren() {
    const alleShotIds = new Set(offene.flatMap((b) => b.shotIds));
    const berichtShots: BerichtShot[] = [...alleShotIds].map((id) => {
      const shot = bestand.shots.find((s) => s.id === id)!;
      return {
        id: shot.id,
        kaffeeName: kaffeeName(shot.kaffeeId),
        urteil: shot.urteil,
        input: shot.ist.input,
        mg: shot.ist.mg,
        output: shot.ist.output,
        zeit: shot.ist.zeit,
      };
    });
    const text = werkstattbericht({
      offeneBeobachtungen: offene,
      shots: berichtShots,
      chips: bestand.symptome.map((s) => ({ label: s.label, quelle: s.quelle })),
      regeln: bestand.symptome
        .filter((s) => s.regel)
        .map((s) => ({ chipLabel: s.label, parameter: s.regel!.parameter, richtung: s.regel!.richtung, schritte: s.regel!.schritte })),
    });
    try {
      await navigator.clipboard.writeText(text);
      berichtStatus = 'kopiert';
    } catch {
      berichtStatus = 'fehler';
    }
  }
</script>

<Kopfzeile titel="Offene Beobachtungen" {onZurueck} />

<section class="gruppe">
  <h2>Offene Beobachtungen</h2>
  {#if offene.length === 0}
    <p class="hinweis">keine</p>
  {:else}
    <ul class="liste">
      {#each offene as b (b.begriff)}
        <li class="eintrag">
          <div class="kopf">
            <span class="begriff">„{b.begriff}" · {b.anzahl}× seit {seitDatum(b.shotIds)}</span>
            <Kontextmenue
              eintraege={[
                { text: 'Zusammenfassen mit …', onWahl: () => (zusammenfassenOffen = b.begriff) },
                { text: 'ignorieren', onWahl: () => void entscheidungSpeichern(b.begriff, 'ignoriert') },
              ]}
            />
          </div>
          <p class="shots">
            Shots {shotsVon(b.shotIds).map((s) => kaffeeName(s.kaffeeId)).join(', ')}
          </p>
          {#if zusammenfassenOffen === b.begriff}
            <div class="zusammenfassen">
              <input type="text" placeholder="mit welchem Begriff?" bind:value={zusammenfassenWert} />
              <Knopf stufe="sekundaer" onKlick={() => zusammenfassenBestaetigen(b.begriff)}>übernehmen</Knopf>
            </div>
          {:else}
            <Knopf stufe="primaer" onKlick={() => void alsChipAnlegen(b.begriff, b.shotIds)}>Als Chip anlegen</Knopf>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</section>

<section class="gruppe">
  <h2>Eigene Chips</h2>
  {#if eigeneChips.length === 0}
    <p class="hinweis">keine</p>
  {:else}
    <ul class="liste">
      {#each eigeneChips as chip (chip.id)}
        <li class="eintrag">
          <div class="kopf">
            <span class="begriff">{chip.label}</span>
            <button type="button" class="link" onclick={() => (regelEditorOffen === chip.id ? (regelEditorOffen = undefined) : regelEditorOeffnen(chip))}>
              {regelEditorOffen === chip.id ? 'schließen' : 'bearbeiten'}
            </button>
          </div>
          <p class="shots">{regelText(chip)}</p>
          {#if regelEditorOffen === chip.id}
            <div class="regeleditor">
              <Einzelauswahl
                optionen={PARAMETER_OPTIONEN}
                wert={regelParameter}
                onWahl={(w) => {
                  regelParameter = w as RegelParameter;
                  regelRichtung = RICHTUNG_JE_PARAMETER[regelParameter][0]!.wert;
                }}
              />
              <Einzelauswahl optionen={RICHTUNG_JE_PARAMETER[regelParameter]} wert={regelRichtung} onWahl={(w) => (regelRichtung = w as Richtung)} />
              <input type="number" min="1" bind:value={regelSchritte} aria-label="Schritte" />
              <Knopf stufe="primaer" onKlick={() => void regelSpeichern(chip)}>Regel speichern</Knopf>
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
</section>

<section class="gruppe">
  <h2>Werkstattbericht</h2>
  <p class="hinweis">Offene Begriffe, ihre Shots und der Chip-/Regelbestand — als Text, zum Weitergeben.</p>
  <Knopf stufe="sekundaer" onKlick={() => void berichtKopieren()}>Bericht in die Zwischenablage</Knopf>
  {#if berichtStatus === 'kopiert'}
    <p class="quittung">kopiert</p>
  {:else if berichtStatus === 'fehler'}
    <p class="fehler">Kopieren nicht möglich — Text manuell markieren.</p>
  {/if}
</section>

{#if fehler}
  <p class="fehler">Nicht gespeichert: {fehler} — nochmal versuchen.</p>
{/if}

<style>
  h2 {
    font-size: var(--fs-label);
    letter-spacing: var(--label-spacing);
    text-transform: uppercase;
    color: var(--gedaempft);
    font-weight: var(--gw-text);
    margin: 0 0 var(--r2);
  }
  .gruppe {
    margin-bottom: var(--r6);
  }
  .liste {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .eintrag {
    padding: var(--r3) 0;
    border-bottom: 1px solid var(--linie-zart);
  }
  .kopf {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--r2);
  }
  .begriff {
    font-size: var(--fs-satz);
    color: var(--tinte);
    font-weight: var(--gw-titel);
  }
  .shots {
    font-size: var(--fs-meta);
    color: var(--gedaempft);
    margin: var(--r1) 0 var(--r3);
  }
  .zusammenfassen,
  .regeleditor {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--r3);
    margin-top: var(--r2);
  }
  .zusammenfassen input,
  .regeleditor input {
    min-height: var(--treffer);
    padding: 0 var(--r3);
    border: 1px solid var(--feld-rahmen);
    background: var(--feld);
    color: var(--tinte);
    font-family: var(--schrift);
    font-size: var(--fs-satz);
  }
  .regeleditor input[type='number'] {
    width: 72px;
  }
  .link {
    background: none;
    border: none;
    color: var(--akzent);
    font-family: var(--schrift);
    font-size: var(--fs-meta);
    min-height: var(--treffer);
    padding: 0;
    cursor: pointer;
  }
  .hinweis {
    color: var(--gedaempft);
    font-size: var(--fs-satz);
  }
  .quittung {
    color: var(--gedaempft);
    font-size: var(--fs-meta);
    margin-top: var(--r2);
  }
  .fehler {
    color: var(--kritisch);
    font-size: var(--fs-satz);
    margin-top: var(--r3);
  }
</style>
