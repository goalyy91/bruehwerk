<script lang="ts">
  // Kaffee bearbeiten — eigene Route (UX-2), abgetrennt vom Kaffeeblatt
  // (das ist jetzt reine Leseansicht). Folgt dem Entwurfs-Muster, das die
  // Geraete-Blaetter schon verwenden (Muehleblatt.svelte): ein lokaler
  // Entwurf per untrack()+structuredClone, ein Knopf "speichern", ein
  // echtes "abbrechen" — kein Autosave je Tastenanschlag mehr wie vorher im
  // eingebetteten Kaffeeblatt-Formular.
  //
  // Visueller Redesign-Reset, Paket 4: Formularzeilen/Textfeld ueber die
  // globalen Utilities aus tokens.css (.formularzeile, .eingabefeld-text),
  // Roestgrad/Bewertung als Blattzeile mit senkrechter Haarlinie wie in
  // der Leseansicht (Kaffeeblatt.svelte ".blick", Paket 2) statt der
  // vorherigen randlosen Zeile.

  import { untrack } from 'svelte';
  import { bestand, schreiben } from '../bestand.svelte';
  import Bohnen from '../../muster/Bohnen.svelte';
  import Sterne from '../../muster/Sterne.svelte';
  import Segment from '../../muster/Segment.svelte';
  import AuswahlListe from '../../muster/AuswahlListe.svelte';
  import Schalter from '../../muster/Schalter.svelte';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import Knopf from '../../muster/Knopf.svelte';
  import type { Kaffee, Aufbereitung } from '../../daten/schema';

  let { kaffeeId, onZurueck }: { kaffeeId: string; onZurueck: () => void } = $props();

  const bestehend = $derived(bestand.kaffees.find((k) => k.id === kaffeeId));

  // $state.snapshot() statt structuredClone(): bestehend ist ein Svelte-
  // reaktives Objekt (bestand.kaffees ist $state) — structuredClone
  // scheitert daran, sobald ein Array-Feld drin ist (hier z. B. herkunft),
  // mit "could not be cloned". snapshot() ist Sveltes eigene Antwort genau
  // darauf: ein echter, flacher Klon aus reinen Werten, sicher fuer diesen Zweck.
  let entwurf = $state<Kaffee | undefined>(untrack(() => (bestehend ? $state.snapshot(bestehend) : undefined)));
  let fehler = $state<string | undefined>(undefined);

  function herkunftAendern(text: string) {
    if (!entwurf) return;
    entwurf.herkunft = text
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  function botanikAendern(feld: 'arabicaProzent' | 'robustaProzent', wert: number) {
    if (!entwurf) return;
    const basis = entwurf.botanik ?? { arabicaProzent: 100, robustaProzent: 0 };
    entwurf.botanik = { ...basis, [feld]: wert };
  }

  /**
   * Redesign v2, Rückmeldung 2026-09-04 — "geeignet für" hatte bisher gar
   * keine Bedienung: KaffeeNeu.svelte setzte hart [], nichts konnte es
   * danach aendern. Folge: bohnenSchnittmenge() (domain/getraenk.ts) fand
   * fuer jeden selbst angelegten Kaffee nie eine Bohne — "keine passende
   * Bohne aktiv" in der Bestellung, unabhaengig vom Aufnahme-Modus.
   * Optionen kommen aus den tatsaechlich vorhandenen Getraenken statt aus
   * einer festen Liste, die mit neuen Zubereitungsarten veralten wuerde.
   */
  const ZUBEREITUNG_LABEL: Readonly<Record<string, string>> = {
    espresso: 'Espresso',
    moka: 'Moka',
    pourover: 'Pour Over',
    coldbrew: 'Cold Brew',
  };
  const zubereitungOptionen = $derived(
    [...new Set(bestand.getraenke.map((g) => g.zubereitung))].map((z) => ({
      wert: z,
      label: ZUBEREITUNG_LABEL[z] ?? z,
    })),
  );

  function geeignetFuerUmschalten(zubereitung: string, an: boolean) {
    if (!entwurf) return;
    entwurf.geeignetFuer = an
      ? [...entwurf.geeignetFuer, zubereitung]
      : entwurf.geeignetFuer.filter((z) => z !== zubereitung);
  }

  function zahl(e: Event): number {
    return Number((e.currentTarget as HTMLInputElement).value.replace(',', '.'));
  }

  async function speichern() {
    if (!entwurf) return;
    fehler = undefined;
    try {
      await schreiben('kaffee', entwurf);
      onZurueck();
    } catch (e) {
      fehler = e instanceof Error ? e.message : String(e);
    }
  }

  const AUFBEREITUNG_OPTIONEN: { wert: Aufbereitung; label: string }[] = [
    { wert: 'washed', label: 'Washed' },
    { wert: 'honey', label: 'Honey' },
    { wert: 'natural', label: 'Natural' },
    { wert: 'anaerob', label: 'Anaerob' },
    { wert: 'wet-hulled', label: 'Wet-hulled' },
    { wert: 'sonstige', label: 'Sonstige' },
  ];
</script>

{#if !entwurf}
  <Kopfzeile titel="Kaffee bearbeiten" {onZurueck} />
  <p class="hinweis">Kaffee nicht gefunden.</p>
{:else}
  <Kopfzeile titel="Kaffee bearbeiten" {onZurueck} />

  <section class="gruppe">
    <h2>Grunddaten</h2>
    <div class="formularzeile">
      <span class="formularzeile-label">Name</span>
      <input class="eingabefeld-text" type="text" bind:value={entwurf.name} />
    </div>
    <div class="formularzeile">
      <span class="formularzeile-label">Röster</span>
      <input class="eingabefeld-text" type="text" bind:value={entwurf.roester} />
    </div>
    <div class="formularzeile spalte">
      <span class="formularzeile-label">Art</span>
      <Segment
        optionen={[
          { wert: 'single', label: 'Single Origin' },
          { wert: 'blend', label: 'Blend' },
        ]}
        wert={entwurf.art}
        onWahl={(w) => (entwurf!.art = w as Kaffee['art'])}
      />
    </div>
    <div class="formularzeile">
      <Schalter label="entkoffeiniert" an={entwurf.entkoffeiniert} onWahl={(a) => (entwurf!.entkoffeiniert = a)} />
    </div>
    <!-- "aktiv" ist ab Etappe 8, Block B keine Formularzeile mehr — die
         Verwaltungsaktion sitzt jetzt im ⋯-Kontextmenü des Kaffeeblatts
         (Kaffeeblatt.svelte), außerhalb des Editiermodus. `entwurf.aktiv`
         bleibt im Schema/Snapshot unverändert und wird beim Speichern hier
         nur unangetastet mitgeschrieben. -->
    <div class="formularzeile spalte">
      <span class="formularzeile-label">Geeignet für</span>
      <div class="geeignet-liste">
        {#each zubereitungOptionen as opt (opt.wert)}
          <Schalter label={opt.label} an={entwurf.geeignetFuer.includes(opt.wert)} onWahl={(a) => geeignetFuerUmschalten(opt.wert, a)} />
        {/each}
      </div>
      {#if zubereitungOptionen.length === 0}
        <p class="hinweis">Noch keine Getränke angelegt.</p>
      {/if}
    </div>
  </section>

  <section class="gruppe">
    <h2>Röstung &amp; Bewertung</h2>
    <div class="blick-zeile">
      <div class="blick-eintrag">
        <span class="blick-label">Röstgrad</span>
        <Bohnen stufe={entwurf.roestgrad} onWahl={(s) => (entwurf!.roestgrad = s)} />
      </div>
      <div class="blick-trenner" aria-hidden="true"></div>
      <div class="blick-eintrag">
        <span class="blick-label">Bewertung</span>
        <Sterne wert={entwurf.bewertung} onWahl={(w) => (entwurf!.bewertung = w)} />
      </div>
    </div>
    <!-- Rückmeldung 2026-09-04: "Röstgrad (Röster)" entfernt — ein
         Röstgrad-Zeichen (oben) reicht. Schema-Feld bleibt (unbenutzt),
         damit alte Werte gültig bleiben. -->
  </section>

  <section class="gruppe">
    <h2>Herkunft &amp; Botanik</h2>
    <div class="formularzeile">
      <span class="formularzeile-label">Herkunft</span>
      <input class="eingabefeld-text" type="text" placeholder="Land, Land …"
        value={entwurf.herkunft.join(', ')} onchange={(e) => herkunftAendern((e.currentTarget as HTMLInputElement).value)} />
    </div>
    <div class="formularzeile">
      <span class="formularzeile-label">Varietät</span>
      <input class="eingabefeld-text" type="text" value={entwurf.varietaet ?? ''}
        onchange={(e) => (entwurf!.varietaet = (e.currentTarget as HTMLInputElement).value || undefined)} />
    </div>
    <div class="formularzeile">
      <span class="formularzeile-label">Anbauhöhe</span>
      <input class="eingabefeld-text zahl" type="text" inputmode="numeric" value={entwurf.anbauhoehe ?? ''}
        onchange={(e) => (entwurf!.anbauhoehe = Number((e.currentTarget as HTMLInputElement).value) || undefined)} /> m
    </div>
    <div class="formularzeile spalte">
      <span class="formularzeile-label">Aufbereitung</span>
      <AuswahlListe
        optionen={AUFBEREITUNG_OPTIONEN}
        wert={entwurf.aufbereitung ?? ''}
        onWahl={(w) => (entwurf!.aufbereitung = w as Aufbereitung)}
      />
    </div>
    <div class="formularzeile">
      <span class="formularzeile-label">Botanik</span>
      <div class="botanik">
        <input class="eingabefeld-text zahl schmal" type="text" inputmode="numeric"
          value={entwurf.botanik?.arabicaProzent ?? ''}
          onchange={(e) => botanikAendern('arabicaProzent', zahl(e))} />
        % Arabica ·
        <input class="eingabefeld-text zahl schmal" type="text" inputmode="numeric"
          value={entwurf.botanik?.robustaProzent ?? ''}
          onchange={(e) => botanikAendern('robustaProzent', zahl(e))} />
        % Robusta
      </div>
    </div>
  </section>

  <div class="knopfreihe">
    <Knopf stufe="primaer" onKlick={speichern} deaktiviert={entwurf.name.trim() === '' || entwurf.roester.trim() === ''}>
      speichern
    </Knopf>
    <Knopf stufe="still" onKlick={onZurueck}>abbrechen</Knopf>
  </div>

  {#if fehler}
    <p class="fehler">Nicht gespeichert: {fehler} — nochmal versuchen.</p>
  {/if}
{/if}

<style>
  h2 {
    margin: 0 0 var(--r-kachelabstand);
  }
  .gruppe {
    margin-bottom: var(--r5);
  }
  .formularzeile.spalte .formularzeile-label {
    width: auto;
  }
  /* Roestgrad + Bewertung als Blattzeile mit senkrechter Haarlinie, wie in
     der Leseansicht (Kaffeeblatt.svelte ".blick", Paket 2) — dieselbe
     Komposition in Lese- und Bearbeiten-Ansicht. */
  .blick-zeile {
    display: flex;
    align-items: center;
    gap: var(--seitenrand);
    padding: var(--r4);
    margin-bottom: var(--r3);
    background: var(--blatt);
    border-radius: var(--r-blatt);
  }
  .blick-eintrag {
    display: flex;
    flex-direction: column;
    gap: var(--r-kachelabstand);
  }
  .blick-label {
    font-family: var(--schrift-sans);
    font-size: var(--fs-gruppenkopf);
    letter-spacing: var(--label-spacing);
    text-transform: uppercase;
    color: var(--gedaempft);
  }
  .blick-trenner {
    align-self: stretch;
    width: 1px;
    background: var(--linie);
  }
  .eingabefeld-text.zahl {
    font-variant-numeric: var(--zahl-features);
    text-align: right;
    flex: 0 0 auto;
    width: 80px;
  }
  .eingabefeld-text.schmal {
    width: 48px;
  }
  .botanik {
    display: flex;
    align-items: center;
    gap: var(--r1);
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--satz);
  }
  .knopfreihe {
    display: flex;
    gap: var(--r3);
    margin-top: var(--r4);
  }
  .hinweis {
    color: var(--gedaempft);
    font-size: var(--fs-satz);
  }
  /* Mehrfachauswahl "Geeignet für" — eine Reihe Schalter statt einer neuen
     Auswahlkomponente, passend zur kleinen, festen Anzahl Zubereitungsarten. */
  .geeignet-liste {
    display: flex;
    flex-wrap: wrap;
    column-gap: var(--r5);
    row-gap: var(--r2);
  }
  .fehler {
    color: var(--kritisch);
    font-size: var(--fs-satz);
    margin-top: var(--r3);
  }
</style>
