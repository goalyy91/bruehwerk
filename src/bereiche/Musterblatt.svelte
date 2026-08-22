<script lang="ts">
  // Paket 01b · Das Musterblatt.
  // Die vierzehn gebauten Muster als Bauteile, alle auf einer Seite, hell
  // und dunkel direkt untereinander (kein Umschalter — beide Fassungen in
  // einem Blick, ohne waagerechtes Scrollen). Quelle: Sitzung 6 -
  // Übergabe.dc.html, Abschnitt 2 (K74 gültige Musterquelle).
  //
  // Muster 13 (Jetzt-Zeile) ist absichtlich nicht gebaut — K41, Beschluss 7
  // der Übergabe: es steht im Inventar, damit niemand es neu erfindet.

  import Urteil from '../muster/Urteil.svelte';
  import Treppe from '../muster/Treppe.svelte';
  import Chips from '../muster/Chips.svelte';
  import Vorschlag from '../muster/Vorschlag.svelte';
  import IstGegenZiel from '../muster/IstGegenZiel.svelte';
  import DoppelteEinheit from '../muster/DoppelteEinheit.svelte';
  import Herkunft from '../muster/Herkunft.svelte';
  import Ablaufliste from '../muster/Ablaufliste.svelte';
  import BausteinListe from '../muster/BausteinListe.svelte';
  import DrillDown from '../muster/DrillDown.svelte';
  import Rangliste from '../muster/Rangliste.svelte';
  import VorbelegteFrage from '../muster/VorbelegteFrage.svelte';
  import Verlaufskurve from '../muster/Verlaufskurve.svelte';
  import LesartUmschalter from '../muster/LesartUmschalter.svelte';
  import Bohnen from '../muster/Bohnen.svelte';
  import Sterne from '../muster/Sterne.svelte';
  import Einzelauswahl from '../muster/Einzelauswahl.svelte';
  import Schalter from '../muster/Schalter.svelte';
  import Kopfzeile from '../muster/Kopfzeile.svelte';
  import Knopf from '../muster/Knopf.svelte';
  import Kontextmenue from '../muster/Kontextmenue.svelte';

  let einzelauswahlDemo = $state('b');
  let schalterDemo = $state(true);

  const ZEICHEN_LEGENDE = [
    { klasse: 'gut', wort: 'gut' },
    { klasse: 'achtung', wort: 'Achtung' },
    { klasse: 'kritisch', wort: 'kritisch' },
    { klasse: 'ring', wort: 'übernommen' },
    { klasse: 'gestrichelt', wort: 'geschätzt' },
  ] as const;
</script>

<div class="musterblatt">
  <header class="kopf">
    <h1>Musterblatt</h1>
    <p>Paket 01b · die vierzehn gebauten Muster, hell und dunkel untereinander.</p>
  </header>

  <section class="tokenbeleg" aria-label="Tokenbeleg">
    {#each ['hell', 'dunkel'] as const as theme (theme)}
      <div class="thema" data-theme={theme}>
        <div class="tokenkarte">
          <div class="label">{theme.toUpperCase()} · FLÄCHEN, TINTEN, ZEICHEN</div>
          <div class="flaechen">
            <span class="swatch" style:background="var(--grund)">--grund</span>
            <span class="swatch" style:background="var(--ruhig)">--ruhig</span>
            <span class="swatch" style:background="var(--feld)">--feld</span>
            <span class="swatch" style:background="var(--spur)">--spur</span>
            <span class="swatch akzent" style:background="var(--akzent)">--akzent</span>
          </div>
          <div class="zeichenreihe">
            {#each ZEICHEN_LEGENDE as z (z.wort)}
              <span class="zeichen-eintrag">
                <span class="zeichen {z.klasse}"></span>
                {z.wort}
              </span>
            {/each}
          </div>
          <div class="skala">
            <span class="zahl" style:font-size="var(--fs-fuehrung)">38,4 g</span>
            <span class="zahl" style:font-size="var(--fs-urteil)" style:color="var(--gedaempft)">≈ 6:10 min</span>
          </div>
        </div>
      </div>
    {/each}
  </section>

  <!-- 1 · Urteil -->
  <section class="muster">
    <h2>1 · Urteil</h2>
    {#each ['hell', 'dunkel'] as const as theme (theme)}
      <div class="thema" data-theme={theme}><Urteil start="okay" /></div>
    {/each}
  </section>

  <!-- 2 · Treppe -->
  <section class="muster">
    <h2>2 · Fünf-Stufen-Skala als Treppe</h2>
    {#each ['hell', 'dunkel'] as const as theme (theme)}
      <div class="thema stapel" data-theme={theme}>
        <Treppe titel="Säure" art="bipolar" woerter={['flach', 'zurückhaltend', 'saftig', 'lebhaft', 'spitz']} start={2} />
        <Treppe titel="Aroma-Intensität" art="einseitig" woerter={['kaum', 'verhalten', 'klar', 'ausgeprägt', 'intensiv']} start={3} />
      </div>
    {/each}
  </section>

  <!-- 3 · Chips -->
  <section class="muster">
    <h2>3 · Chip-Auswahl mit Stärke im Chip</h2>
    {#each ['hell', 'dunkel'] as const as theme (theme)}
      <div class="thema" data-theme={theme}>
        <Chips
          gruppen={[
            {
              titel: 'Geschmack',
              chips: [
                { id: 'sauer', label: 'zu sauer' },
                { id: 'bitter', label: 'zu bitter' },
                { id: 'duenn', label: 'dünn' },
                { id: 'flach', label: 'flach' },
                { id: 'adstringent', label: 'adstringent' },
                { id: 'brandig', label: 'brandig' },
              ],
            },
            {
              titel: 'Lauf',
              chips: [
                { id: 'schnell', label: 'zu schnell' },
                { id: 'langsam', label: 'zu langsam' },
                { id: 'ungleich', label: 'ungleichmäßig' },
              ],
            },
          ]}
        />
      </div>
    {/each}
  </section>

  <!-- 4 · Vorschlag mit Übernehmen -->
  <section class="muster">
    <h2>4 · Vorschlag mit Übernehmen</h2>
    {#each ['hell', 'dunkel'] as const as theme (theme)}
      <div class="thema stapel" data-theme={theme}>
        <Vorschlag
          diagnose="Unterextraktion"
          empfehlung="Mahlgrad 3,65 → 3,60 · ein Schritt feiner, weil zu sauer + dünn"
          herkunft="aus deiner Historie"
          start="offen"
        />
        <Vorschlag diagnose="Unterextraktion" empfehlung="Mahlgrad 3,75 → 3,65" start="uebernommen" />
        <Vorschlag diagnose="KT zu hoch" empfehlung="KT −1" start="abgelehnt" datum="12.08." />
        <Vorschlag
          diagnose="außerhalb der Messreihe"
          start="fehlt"
          begruendungFehlt="30 bis 42 g bisher gemessen · Vorschlag entfällt"
        />
        <Vorschlag form="duenn" diagnose="Double Shot sinnvoll verwenden" start="offen" />
      </div>
    {/each}
  </section>

  <!-- 5 · Ist gegen Ziel -->
  <section class="muster">
    <h2>5 · Ist gegen Ziel</h2>
    {#each ['hell', 'dunkel'] as const as theme (theme)}
      <div class="thema" data-theme={theme}>
        <IstGegenZiel
          titel="Espresso Entcoffeiniert"
          zeilen={[
            { label: 'Output', einheit: 'g', ziel: 38.4, spielraum: 0.4, messreihe: { min: 30, max: 42 } },
            { label: 'Preinfusion', einheit: 's', ziel: 4, spielraum: 2 },
            { label: 'Zeit', einheit: 's', ziel: 30, spielraum: 2 },
          ]}
        />
      </div>
    {/each}
  </section>

  <!-- 6 · Doppelte Einheit -->
  <section class="muster">
    <h2>6 · Doppelte Einheit</h2>
    {#each ['hell', 'dunkel'] as const as theme (theme)}
      <div class="thema" data-theme={theme}>
        <DoppelteEinheit
          fuehrendWert="121"
          fuehrendEinheit="°C Kessel"
          abgeleitetWert="94"
          abgeleitetEinheit="°C Gruppe"
          leerzeichenVorEinheit={false}
        />
      </div>
    {/each}
  </section>

  <!-- 7 · Herkunftskennzeichnung -->
  <section class="muster">
    <h2>7 · Herkunftskennzeichnung</h2>
    {#each ['hell', 'dunkel'] as const as theme (theme)}
      <div class="thema reihe" data-theme={theme}>
        <Herkunft art="gemessen" wert="3,65" />
        <Herkunft art="gerechnet" wert="0,71" />
        <Herkunft art="uebernommen" wert="94" einheit="°C" />
        <Herkunft art="geschaetzt" wert="3,6" mitLegende />
      </div>
    {/each}
  </section>

  <!-- 8 · Abhakbare Ablaufliste -->
  <section class="muster">
    <h2>8 · Abhakbare Ablaufliste</h2>
    {#each ['hell', 'dunkel'] as const as theme (theme)}
      <div class="thema stapel" data-theme={theme}>
        <Ablaufliste
          zeilen={[
            { id: 'd1', label: 'Cappuccino · Julian', erledigt: true },
            { id: 'd2', label: 'Espresso · Max' },
            { id: 'd3', label: 'Latte Macchiato · Julian' },
          ]}
          aktivId="d2"
        />
        <Ablaufliste variant="erststart" zeilen={[{ id: 'k', label: 'Kaffee' }, { id: 'g', label: 'Getränk' }, { id: 'ge', label: 'Gerät' }]} />
        <Ablaufliste zeilen={[]} />
      </div>
    {/each}
  </section>

  <!-- 9 · Baustein-Liste -->
  <section class="muster">
    <h2>9 · Baustein-Liste</h2>
    {#each ['hell', 'dunkel'] as const as theme (theme)}
      <div class="thema stapel" data-theme={theme}>
        <BausteinListe
          zeilen={[
            { typ: 'Bloom', kopfwert: '40 g Wasser', notiz: '0:00', id: 'b1' },
            { typ: 'Guss', kopfwert: '200 g Wasser', notiz: 'Spirale', meta: '1:15', id: 'b2' },
            { typ: 'Warten', kopfwert: 'bis 2:45', id: 'b3' },
          ]}
        />
        <BausteinListe
          buendel={{
            titel: 'Bezug 1 · Espresso Entcoffeiniert',
            summe: '2 Getränke',
            zeilen: [
              { typ: 'Cappuccino', kopfwert: 'Julian', id: 'z1' },
              { typ: 'Cappuccino', kopfwert: 'Max', id: 'z2' },
            ],
          }}
        />
      </div>
    {/each}
  </section>

  <!-- 10 · Drill-down -->
  <section class="muster">
    <h2>10 · Drill-down</h2>
    {#each ['hell', 'dunkel'] as const as theme (theme)}
      <div class="thema" data-theme={theme}>
        <DrillDown
          ebenen={[
            {
              id: 'blumig',
              label: 'Blumig',
              kinder: [
                { id: 'jasmin', label: 'Jasmin' },
                { id: 'rose', label: 'Rose' },
              ],
            },
            {
              id: 'frucht',
              label: 'Frucht',
              kinder: [
                { id: 'beere', label: 'Beere', kinder: [{ id: 'himbeere', label: 'Himbeere' }, { id: 'brombeere', label: 'Brombeere' }] },
                { id: 'zitrus', label: 'Zitrus' },
              ],
            },
          ]}
        />
      </div>
    {/each}
  </section>

  <!-- 11 · Rangliste -->
  <section class="muster">
    <h2>11 · Rangliste</h2>
    {#each ['hell', 'dunkel'] as const as theme (theme)}
      <div class="thema stapel" data-theme={theme}>
        <Rangliste person="Julian" eintraege={[{ id: 'r1', name: 'Cappuccino' }, { id: 'r2', name: 'Espresso' }, { id: 'r3', name: 'Latte Macchiato' }]} />
        <Rangliste person="Auswertung · Julian" mitBalken eintraege={[{ id: 'r1', name: 'Cappuccino', wert: 42 }, { id: 'r2', name: 'Espresso', wert: 18 }]} />
      </div>
    {/each}
  </section>

  <!-- 12 · Vorbelegte Frage -->
  <section class="muster">
    <h2>12 · Vorbelegte Frage</h2>
    {#each ['hell', 'dunkel'] as const as theme (theme)}
      <div class="thema stapel" data-theme={theme}>
        <VorbelegteFrage frage="Wieder entkoffeiniert?" anteil={70} begruendung="7 von 8 zuletzt" />
        <VorbelegteFrage frage="500er Kännchen?" anteil={50} begruendung="10 von 20 zuletzt" />
        <p class="hinweis">≤ 40 % (hier nicht gezeigt): die Frage entfällt ganz.</p>
      </div>
    {/each}
  </section>

  <!-- 14 · Verlaufskurve -->
  <section class="muster">
    <h2>14 · Verlaufskurve</h2>
    {#each ['hell', 'dunkel'] as const as theme (theme)}
      <div class="thema stapel" data-theme={theme}>
        <Verlaufskurve
          punkte={[
            { x: 0.05, y: 0.3, zustand: 'kritisch' },
            { x: 0.25, y: 0.35, zustand: 'achtung' },
            { x: 0.5, y: 0.55 },
            { x: 0.75, y: 0.6 },
            { x: 0.95, y: 0.62 },
          ]}
          achsMarken={['3,60', '3,75', '3,90']}
          totzone={{ vonY: 0.25, bisY: 0.4, wort: 'toter Bereich' }}
          ereignisX={0.5}
        />
        <Verlaufskurve punkte={[]} achsMarken={['3,60', '3,75', '3,90']} />
      </div>
    {/each}
  </section>

  <!-- 15 · Lesart-Umschalter -->
  <section class="muster">
    <h2>15 · Lesart-Umschalter</h2>
    {#each ['hell', 'dunkel'] as const as theme (theme)}
      <div class="thema" data-theme={theme}>
        <LesartUmschalter optionA="auf 360 g" optionB="+ 50 g" />
      </div>
    {/each}
  </section>

  <section class="muster">
    <h2>13 · Jetzt-Zeile</h2>
    <p class="hinweis">
      Vorgemerkt und bis heute nicht gebraucht (K41) — kein Bildschirm verlangt sie. Absichtlich nicht gebaut.
    </p>
  </section>

  <!-- Röstgrad und Bewertung — Systemregel K79, kein Muster aus der Übergabe -->
  <section class="muster">
    <h2>Röstgrad & Bewertung · K79</h2>
    {#each ['hell', 'dunkel'] as const as theme (theme)}
      <div class="thema stapel" data-theme={theme}>
        <Bohnen stufe={4} />
        <Bohnen stufe={undefined} />
        <Sterne wert={3.5} />
        <Sterne wert={undefined} />
      </div>
    {/each}
  </section>

  <!-- Einzelauswahl/Schalter — Ergaenzung fuer Verwaltungsformulare, kein natives select/checkbox -->
  <section class="muster">
    <h2>Einzelauswahl & Schalter · Formulare</h2>
    {#each ['hell', 'dunkel'] as const as theme (theme)}
      <div class="thema stapel" data-theme={theme}>
        <Einzelauswahl
          optionen={[
            { wert: 'a', label: 'Single' },
            { wert: 'b', label: 'Blend' },
          ]}
          wert={einzelauswahlDemo}
          onWahl={(w) => (einzelauswahlDemo = w)}
        />
        <Schalter label="entkoffeiniert" an={schalterDemo} onWahl={(a) => (schalterDemo = a)} />
      </div>
    {/each}
  </section>

  <section class="muster">
    <h2>Kopfzeile · Formulare</h2>
    {#each ['hell', 'dunkel'] as const as theme (theme)}
      <div class="thema" data-theme={theme}>
        <Kopfzeile titel="Espresso Entcoffeiniert" onZurueck={() => {}} />
      </div>
    {/each}
  </section>

  <!-- Knopf — UX-Korrekturrunde, Regel 3/6: eine Hierarchie statt gefuellter Akzentknoepfe -->
  <section class="muster">
    <h2>Knopf · Hierarchie</h2>
    {#each ['hell', 'dunkel'] as const as theme (theme)}
      <div class="thema reihe" data-theme={theme}>
        <Knopf stufe="primaer"><span>speichern</span></Knopf>
        <Knopf stufe="sekundaer"><span>abbrechen</span></Knopf>
        <Knopf stufe="still"><span>verwerfen</span></Knopf>
        <Knopf stufe="kritisch"><span>löschen</span></Knopf>
        <Knopf stufe="primaer" deaktiviert><span>speichern</span></Knopf>
      </div>
    {/each}
  </section>

  <!-- Kontextmenue — UX-Korrekturrunde, Regel 4: ab zwei Sekundaeraktionen -->
  <section class="muster">
    <h2>Kontextmenü · Sekundäraktionen</h2>
    {#each ['hell', 'dunkel'] as const as theme (theme)}
      <div class="thema reihe" data-theme={theme}>
        <Kopfzeile titel="Timemore Sculptor" onZurueck={() => {}}>
          {#snippet aktion()}
            <Kontextmenue
              eintraege={[
                { text: 'bearbeiten', onWahl: () => {} },
                { text: 'löschen', kritisch: true, onWahl: () => {} },
              ]}
            />
          {/snippet}
        </Kopfzeile>
      </div>
    {/each}
  </section>
</div>

<style>
  .musterblatt {
    display: flex;
    flex-direction: column;
    gap: var(--r7);
    max-width: 100%;
    padding: var(--seitenrand) var(--seitenrand) calc(var(--r7) + var(--safe-unten));
  }
  .kopf h1 {
    margin: 0 0 var(--r2);
    font-size: var(--fs-titel);
    font-weight: var(--gw-titel);
  }
  .kopf p {
    margin: 0;
    color: var(--gedaempft);
    font-size: var(--fs-satz);
  }
  .muster {
    display: flex;
    flex-direction: column;
    gap: var(--r3);
  }
  .muster h2 {
    margin: 0;
    font-size: var(--fs-urteil);
    font-weight: var(--gw-titel);
  }
  .thema {
    background: var(--grund);
    color: var(--tinte);
    border: 1px solid var(--linie);
    padding: var(--r4);
  }
  .thema.stapel {
    display: flex;
    flex-direction: column;
    gap: var(--r4);
  }
  .thema.reihe {
    display: flex;
    flex-wrap: wrap;
    gap: var(--r4);
    align-items: center;
  }
  .hinweis {
    margin: 0;
    color: var(--gedaempft);
    font-size: var(--fs-meta);
  }

  .tokenbeleg {
    display: flex;
    flex-direction: column;
    gap: var(--r3);
  }
  .tokenkarte {
    display: flex;
    flex-direction: column;
    gap: var(--r3);
  }
  .label {
    font-size: var(--fs-label);
    letter-spacing: var(--label-spacing);
    color: var(--gedaempft);
  }
  .flaechen {
    display: flex;
    flex-wrap: wrap;
    gap: var(--r2);
  }
  .swatch {
    display: flex;
    align-items: center;
    padding: 0 var(--r2);
    height: 32px;
    font-size: var(--fs-meta);
    color: var(--satz);
    border: 1px solid var(--linie);
  }
  .swatch.akzent {
    color: var(--h-papier);
  }
  .zeichenreihe {
    display: flex;
    flex-wrap: wrap;
    gap: var(--r4);
  }
  .zeichen-eintrag {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: var(--fs-meta);
    color: var(--satz);
  }
  .zeichen {
    display: inline-block;
    width: var(--zeichen);
    height: var(--zeichen);
    border-radius: 50%;
  }
  .zeichen.gut {
    background: var(--marke-gut);
  }
  .zeichen.achtung {
    border: 1px solid var(--achtung);
    background: linear-gradient(90deg, var(--achtung) 50%, transparent 50%);
  }
  .zeichen.kritisch {
    border: 1px solid var(--kritisch);
    background: repeating-linear-gradient(45deg, var(--kritisch) 0 2px, transparent 2px 4px);
  }
  .zeichen.ring {
    border: 1px solid var(--gedaempft);
  }
  .zeichen.gestrichelt {
    border: 1px dashed var(--gedaempft);
  }
  .skala {
    display: flex;
    align-items: baseline;
    gap: var(--r3);
  }
</style>
