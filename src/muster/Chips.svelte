<script lang="ts">
  // Muster 3 · Chip-Auswahl mit Stärke im Chip (Übergabe, Abschnitt 2).
  // Gruppen, Umbruch statt Scrollen, gewählte Chips wandern nach vorn.
  // Zustände: aus · Stärke offen (leicht/deutlich) · gewählt mit Stärke im
  // Text („deutlich papierig“) · zweiter Tap öffnet die Stärke erneut.
  //
  // Vereinfachung gegenüber dem Wortlaut „dritter Tap nimmt zurück“: statt
  // eines dritten, nicht unterscheidbaren Taps auf denselben Chip trägt der
  // wieder geöffnete Chip ein eigenes „entfernen“ — eindeutiger zu bedienen,
  // gleiches Ergebnis.
  //
  // Visueller Redesign-Reset (Handoff 3.8 "Chip"): Radius 999, offen =
  // Vertiefung, gewählt = Füllfläche. Der Akzentstrich entfällt.

  type Staerke = 'leicht' | 'deutlich';
  type Phase = 'aus' | 'offen' | 'gewaehlt';

  type Chip = { id: string; label: string };
  type ChipZustand = { phase: Phase; staerke?: Staerke };

  // Paket 04: kontrollierte Fassung (ux-regeln R6, Anpassung statt neues
  // Muster) — onAenderung meldet die gewaehlten Befunde nach aussen, damit
  // ShotErfassung.svelte das Regelwerk (domain/diagnose.ts) danach fragen
  // kann. Das Innenleben (Tap-Zyklus, Sortierung) bleibt unveraendert.
  //
  // Paket 05: `start` fuer den Wiedereinstieg — ein gespeicherter
  // Verkostungsbogen (Verkostungsbogen.svelte) geht mit seinen Chips
  // wieder auf, statt leer zu starten.
  import { untrack } from 'svelte';

  let {
    gruppen,
    freitext = true,
    start = [],
    freitextStart = '',
    onAenderung,
    onFreitext,
  }: {
    gruppen: { titel: string; chips: Chip[] }[];
    freitext?: boolean;
    start?: { symptomId: string; staerke: Staerke }[];
    freitextStart?: string;
    onAenderung?: (befunde: { symptomId: string; staerke: Staerke }[]) => void;
    onFreitext?: (text: string) => void;
  } = $props();

  const zustaende = $state<Record<string, ChipZustand>>(
    Object.fromEntries(
      untrack(() => start).map((b): [string, ChipZustand] => [b.symptomId, { phase: 'gewaehlt', staerke: b.staerke }]),
    ),
  );
  let freitextWert = $state(untrack(() => freitextStart));

  function befundeMelden() {
    onAenderung?.(
      Object.entries(zustaende)
        .filter(([, z]) => z.phase === 'gewaehlt' && z.staerke)
        .map(([symptomId, z]) => ({ symptomId, staerke: z.staerke! })),
    );
  }

  function zustandVon(id: string): ChipZustand {
    return zustaende[id] ?? { phase: 'aus' };
  }

  function klick(id: string) {
    const z = zustandVon(id);
    if (z.phase === 'aus') {
      zustaende[id] = { phase: 'offen' };
    } else if (z.phase === 'offen') {
      zustaende[id] = { phase: 'aus' };
    } else {
      zustaende[id] = { phase: 'offen', staerke: z.staerke };
    }
  }

  function waehleStaerke(id: string, staerke: Staerke) {
    zustaende[id] = { phase: 'gewaehlt', staerke };
    befundeMelden();
  }

  function entfernen(id: string) {
    zustaende[id] = { phase: 'aus' };
    befundeMelden();
  }

  function label(chip: Chip, z: ChipZustand): string {
    return z.phase === 'gewaehlt' && z.staerke ? `${z.staerke} ${chip.label}` : chip.label;
  }

  function sortiert(chips: Chip[]): Chip[] {
    return [...chips].sort((a, b) => {
      const ag = zustandVon(a.id).phase === 'gewaehlt' ? 0 : 1;
      const bg = zustandVon(b.id).phase === 'gewaehlt' ? 0 : 1;
      return ag - bg;
    });
  }

  // Rueckmeldung 2026-08-26: "etwas anderes …" stand zunaechst nur als
  // Textlink da, der erst nach einem Tap zu einem echten Feld wurde — man
  // sah ihm also nicht an, dass man dort etwas eintippen kann, bevor man es
  // ausprobiert hatte. Das Feld steht jetzt von Anfang an da wie jedes
  // andere Eingabefeld auch.
</script>

<div class="chips">
  {#each gruppen as gruppe (gruppe.titel)}
    <div class="gruppe">
      <div class="gruppentitel">{gruppe.titel}</div>
      <div class="reihe">
        {#each sortiert(gruppe.chips) as chip (chip.id)}
          {@const z = zustandVon(chip.id)}
          <div class="chip-huelle">
            <div class="offen-gruppe" class:sichtbar={z.phase === 'offen'}>
              <button
                type="button"
                class="chip"
                class:gewaehlt={z.phase === 'gewaehlt'}
                class:offen={z.phase === 'offen'}
                onclick={() => klick(chip.id)}
              >
                {label(chip, z)}
              </button>
              {#if z.phase === 'offen'}
                <div class="staerke-wahl">
                  <button type="button" onclick={() => waehleStaerke(chip.id, 'leicht')}>leicht</button>
                  <button type="button" onclick={() => waehleStaerke(chip.id, 'deutlich')}>deutlich</button>
                  {#if z.staerke}
                    <button type="button" class="entfernen" onclick={() => entfernen(chip.id)}>entfernen</button>
                  {/if}
                </div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/each}

  {#if freitext}
    <div class="freitext">
      <input
        type="text"
        class="feld"
        placeholder="etwas anderes …"
        bind:value={freitextWert}
        oninput={() => onFreitext?.(freitextWert)}
      />
    </div>
  {/if}
</div>

<style>
  .chips {
    display: flex;
    flex-direction: column;
    gap: var(--r4);
  }
  .gruppe {
    display: flex;
    flex-direction: column;
    gap: var(--r2);
  }
  .gruppentitel {
    font-size: var(--fs-label);
    letter-spacing: var(--label-spacing);
    text-transform: uppercase;
    color: var(--gedaempft);
  }
  .reihe {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .chip-huelle {
    display: flex;
    flex-direction: column;
  }
  .offen-gruppe {
    display: flex;
    flex-direction: column;
    gap: 4px;
    border-radius: var(--r-kachel);
  }
  .offen-gruppe.sichtbar {
    padding: 6px;
    background: var(--vertiefung);
  }
  .chip {
    height: 44px;
    padding: 0 var(--r3);
    border: none;
    border-radius: var(--r-pille);
    background: var(--vertiefung);
    color: var(--satz);
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    cursor: pointer;
    transition: background var(--t-auswahl) var(--e-rein);
  }
  .chip.gewaehlt {
    background: var(--fuellung);
    color: var(--auf-fuellung);
  }
  .staerke-wahl {
    display: flex;
    gap: 4px;
  }
  .staerke-wahl button {
    height: var(--treffer);
    padding: 0 var(--r2);
    border: none;
    border-radius: var(--r-pille);
    background: var(--blatt);
    color: var(--satz);
    font-family: var(--schrift);
    font-size: var(--fs-meta);
    cursor: pointer;
  }
  .staerke-wahl .entfernen {
    color: var(--kritisch);
  }
  .freitext .feld {
    height: var(--treffer);
    width: 100%;
    box-sizing: border-box;
    padding: 0 var(--r3);
    border: none;
    border-radius: var(--r-wertfeld);
    background: var(--vertiefung);
    color: var(--tinte);
    font-family: var(--schrift);
    font-size: var(--fs-satz);
  }
</style>
