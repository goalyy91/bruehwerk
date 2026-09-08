<script lang="ts">
  // Getraenkeblatt — Paket 06. Anders als bei Kaffee/Geraete gibt es hier
  // keine getrennte Ansicht+Formular-Aufteilung: ein Getraenk ist eine
  // flache Liste von Zahlen und Woertern ohne eigene Unterlisten (keine
  // Profile, keine Chargen) — Ansehen und Bearbeiten sind hier dieselbe
  // Aufgabe, deshalb ein Bildschirm.
  //
  // "Neu als Kopie" ist der einzige Anlegeweg (konzept.md:830): dieser
  // Bildschirm bekommt entweder eine bestehende getraenkId (bearbeiten)
  // oder eine vorlageId (ein neuer Entwurf, vorausgefuellt aus der Kopie).
  // Ein drittes Muster fuer "leer" gibt es bewusst nicht.

  import { untrack } from 'svelte';
  import { bestand, schreiben } from '../bestand.svelte';
  import { neueId } from '../../daten/id';
  import Blattliste from '../../muster/Blattliste.svelte';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import Kontextmenue from '../../muster/Kontextmenue.svelte';
  import AuswahlListe from '../../muster/AuswahlListe.svelte';
  import Segment from '../../muster/Segment.svelte';
  import Schalter from '../../muster/Schalter.svelte';
  import Knopf from '../../muster/Knopf.svelte';
  import type { Getraenk } from '../../daten/schema';

  let {
    getraenkId,
    vorlageId,
    onZurueck,
    onGespeichert,
    onNeuAlsKopie,
  }: {
    getraenkId?: string;
    vorlageId?: string;
    onZurueck: () => void;
    onGespeichert: (id: string) => void;
    onNeuAlsKopie: (vorlageId: string) => void;
  } = $props();

  const bestehend = $derived(getraenkId ? bestand.getraenke.find((g) => g.id === getraenkId) : undefined);
  const vorlage = $derived(vorlageId ? bestand.getraenke.find((g) => g.id === vorlageId) : undefined);

  function ausVorlage(v: Getraenk): Getraenk {
    return { ...$state.snapshot(v), id: neueId(), name: `${v.name} Kopie` };
  }

  // Nur einmal beim Aufbau gelesen (untrack) — Bearbeiten und Kopieren
  // starten je einen frischen Entwurf, kein Autosave je Tastenanschlag
  // (gleiches Muster wie KaffeeBearbeiten.svelte/Bruehgeraetblatt.svelte).
  let entwurf = $state<Getraenk | undefined>(
    untrack(() => {
      if (bestehend) return $state.snapshot(bestehend);
      if (vorlage) return ausVorlage(vorlage);
      return undefined;
    }),
  );
  let fehler = $state<string | undefined>(undefined);

  const ZUBEREITUNG_OPTIONEN = [
    { wert: 'espresso', label: 'Siebträger' },
    { wert: 'pourover', label: 'Pour Over' },
    { wert: 'moka', label: 'Moka' },
    { wert: 'coldbrew', label: 'Cold Brew' },
  ];

  function ausgleichWahl(entwurf: Getraenk): 'keiner' | 'milch' | 'heisswasser' {
    return entwurf.ausgleich ?? 'keiner';
  }
  function ausgleichAendern(e: Getraenk, wahl: string) {
    if (wahl === 'keiner') {
      e.ausgleich = null;
      e.milch = undefined;
      e.heisswasser = undefined;
    } else if (wahl === 'milch') {
      e.ausgleich = 'milch';
      e.heisswasser = undefined;
      if (!e.milch) e.milch = { textur: '', temperatur: 60 };
    } else {
      e.ausgleich = 'heisswasser';
      e.milch = undefined;
      if (!e.heisswasser) e.heisswasser = { temperatur: 90 };
    }
  }

  /**
   * Empfindlichkeit als drei benannte Stufen statt als Zahl 0-10
   * ("dafür brauchen wir ein selbsterklärenderes Wording"). Gespeichert wird
   * weiter eine Zahl — domain/ablauf.ts sortiert danach, die Sortierung
   * bleibt unveraendert.
   *
   * Gelesen wird in Baendern, nicht auf exakte Werte: die Startbelegung der
   * neun Getraenke traegt 1, 3, 4, 5, 6, 7 und 9, und keiner davon soll beim
   * Oeffnen ohne Auswahl dastehen.
   */
  const FRISCHE_WERT = { lange: 0, normal: 5, sofort: 10 } as const;
  const frischeStufe = $derived(
    entwurf === undefined ? 'normal' : entwurf.empfindlichkeit <= 3 ? 'lange' : entwurf.empfindlichkeit <= 7 ? 'normal' : 'sofort',
  );
  function frischeAendern(wahl: string) {
    if (entwurf) entwurf.empfindlichkeit = FRISCHE_WERT[wahl as keyof typeof FRISCHE_WERT];
  }

  function zahl(e: Event): number {
    return Number((e.currentTarget as HTMLInputElement).value.replace(',', '.'));
  }

  /** Überschrift der Ausgleichs-Gruppe — sie benennt, was gerade eingestellt ist. */
  const ausgleichTitel = $derived(
    entwurf?.ausgleich === 'milch' ? 'Milch' : entwurf?.ausgleich === 'heisswasser' ? 'Heißwasser' : 'Ausgleich',
  );


  let feinheitenOffen = $state(false);

  async function speichern() {
    if (!entwurf) return;
    fehler = undefined;
    try {
      await schreiben('getraenk', entwurf);
      onGespeichert(entwurf.id);
    } catch (e) {
      fehler = e instanceof Error ? e.message : String(e);
    }
  }

  async function sichtbarkeitUmschalten() {
    if (!bestehend) return;
    fehler = undefined;
    try {
      const neu = { ...bestehend, aktiv: !bestehend.aktiv };
      await schreiben('getraenk', neu);
      if (entwurf) entwurf.aktiv = neu.aktiv;
    } catch (e) {
      fehler = e instanceof Error ? e.message : String(e);
    }
  }
</script>

{#if !entwurf}
  <Kopfzeile titel="Getränk" {onZurueck} />
  <p class="hinweis">Getränk nicht gefunden.</p>
{:else}
  <Kopfzeile titel={bestehend ? entwurf.name : 'Neues Getränk'} {onZurueck} gross>
    {#snippet aktion()}
      {#if bestehend}
        <Kontextmenue
          eintraege={[
            { text: 'neu als Kopie', onWahl: () => onNeuAlsKopie(bestehend.id) },
            { text: bestehend.aktiv ? 'ausblenden' : 'einblenden', onWahl: () => void sichtbarkeitUmschalten() },
          ]}
        />
      {/if}
    {/snippet}
  </Kopfzeile>

  <!-- 2026-09-07: Aus vierzehn Formularzeilen ohne einen einzigen Gruppenkopf
       werden fünf Gruppen ("wenn ich auf die Getränkeseite komm bin ich
       überfordert"). Kein Feld verschwindet, keins kommt dazu.
       Weil die Gruppe den Zusammenhang trägt, werden die Beschriftungen
       kürzer — "Textur" statt "Milch-Textur", "Anteil" statt "Bezugsanteil".
       Genau daher kam das ausgefranste Raster: "Milch-Temperatur" passte
       nicht in die 104-px-Spalte und drückte die Zeile auseinander.
       Vier der fünf Erklärsätze entfallen, weil der Gruppenkopf sie
       überflüssig macht. -->

  <section class="gruppe">
    <h2>Getränk</h2>
    <Blattliste>
      <div class="formularzeile">
        <span class="formularzeile-label">Name</span>
        <input class="eingabefeld-text" type="text" bind:value={entwurf.name} />
      </div>
      <div class="formularzeile">
        <span class="formularzeile-label">Kategorie</span>
        <input class="eingabefeld-text" type="text" bind:value={entwurf.kategorie} />
      </div>
      <div class="formularzeile spalte">
        <span class="formularzeile-label">Zubereitung</span>
        <AuswahlListe optionen={ZUBEREITUNG_OPTIONEN} wert={entwurf.zubereitung} onWahl={(w) => (entwurf!.zubereitung = w)} />
      </div>
    </Blattliste>
  </section>

  <section class="gruppe">
    <h2>Bezug</h2>
    <Blattliste>
      <div class="formularzeile">
        <span class="formularzeile-label">Brühgerät</span>
        <AuswahlListe
          optionen={bestand.bruehgeraete.map((b) => ({ wert: b.id, label: b.name }))}
          wert={entwurf.basis.bruehgeraetId}
          onWahl={(w) => (entwurf!.basis.bruehgeraetId = w)}
        />
      </div>
      <div class="formularzeile spalte">
        <span class="formularzeile-label">Anteil</span>
        <Segment
          optionen={[{ wert: 'halb', label: 'halber Bezug' }, { wert: 'ganz', label: 'ganzer Bezug' }]}
          wert={entwurf.basis.anteilBezug}
          onWahl={(w) => (entwurf!.basis.anteilBezug = w as 'ganz' | 'halb')}
        />
      </div>
      <div class="formularzeile">
        <Schalter label="aus dem Vorrat" an={entwurf.basis.ausVorrat} onWahl={(a) => (entwurf!.basis.ausVorrat = a)} />
      </div>
    </Blattliste>
  </section>

  <section class="gruppe">
    <h2>{ausgleichTitel}</h2>
    <Blattliste>
      <div class="formularzeile spalte">
        <span class="formularzeile-label">Zutat</span>
        <Segment
          optionen={[
            { wert: 'keiner', label: 'keine' },
            { wert: 'milch', label: 'Milch' },
            { wert: 'heisswasser', label: 'Heißwasser' },
          ]}
          wert={ausgleichWahl(entwurf)}
          onWahl={(w) => ausgleichAendern(entwurf!, w)}
        />
      </div>

      {#if entwurf.ausgleich === 'milch' && entwurf.milch}
        <div class="formularzeile">
          <span class="formularzeile-label">Textur</span>
          <input class="eingabefeld-text" type="text" bind:value={entwurf.milch.textur} />
        </div>
        <div class="formularzeile">
          <span class="formularzeile-label">Temperatur</span>
          <input
            class="eingabefeld-text zahl"
            type="text"
            inputmode="decimal"
            value={entwurf.milch.temperatur}
            onchange={(e) => (entwurf!.milch!.temperatur = zahl(e))}
          />
          <span class="einheit">°C</span>
        </div>
      {/if}

      {#if entwurf.ausgleich === 'heisswasser' && entwurf.heisswasser}
        <div class="formularzeile">
          <span class="formularzeile-label">Temperatur</span>
          <input
            class="eingabefeld-text zahl"
            type="text"
            inputmode="decimal"
            value={entwurf.heisswasser.temperatur}
            onchange={(e) => (entwurf!.heisswasser!.temperatur = zahl(e))}
          />
          <span class="einheit">°C</span>
        </div>
      {/if}

    </Blattliste>
  </section>

  <!-- Beides stellt man einmal beim Anlegen ein und danach nie wieder,
       deshalb eingeklappt statt im Hauptfluss. Die Beschriftungen sagen
       jetzt, was sie bewirken — "Empfindlichkeit 0-10" war eine Zahl, die
       man nicht kalibrieren kann ("dafür brauchen wir ein
       selbsterklärenderes Wording"). -->
  <section class="gruppe">
    <button type="button" class="falte" onclick={() => (feinheitenOffen = !feinheitenOffen)}>
      <span>Beim Bestellen</span>
      <span class="falte-zeichen" aria-hidden="true">{feinheitenOffen ? '−' : '+'}</span>
    </button>
    {#if feinheitenOffen}
      <Blattliste>
        <div class="formularzeile">
          <Schalter
            label="Extra Shot möglich"
            an={entwurf.extraShotMoeglich}
            onWahl={(a) => (entwurf!.extraShotMoeglich = a)}
          />
        </div>
        <div class="formularzeile spalte">
          <span class="formularzeile-label">Wie lange es steht</span>
          <Segment
            optionen={[
              { wert: 'lange', label: 'hält lange' },
              { wert: 'normal', label: 'normal' },
              { wert: 'sofort', label: 'sofort trinken' },
            ]}
            wert={frischeStufe}
            onWahl={frischeAendern}
          />
        </div>
      </Blattliste>
      <p class="erklaerung">
        „Extra Shot möglich“ entscheidet, ob beim Bestellen ein zweiter Shot angeboten wird —
        beim Espresso Macchiato wäre danach kein Macchiato mehr übrig.
        „Wie lange es steht“ bestimmt, was in einer Bestellung zuletzt gemacht wird.
      </p>
    {/if}
  </section>

  {#if fehler}
    <p class="fehler">Nicht gespeichert: {fehler}.</p>
  {/if}

  <div class="knopfreihe">
    <Knopf stufe="primaer" onKlick={speichern}>speichern</Knopf>
  </div>
{/if}

<style>
  /* Die Formularzeilen liegen jetzt in Blattliste-Karten, und die Karte zieht
     die Trennlinien zwischen ihren Kindern selbst. Die eigene Unterlinie der
     globalen .formularzeile würde sich damit verdoppeln.
     Wenn die übrigen Formularbildschirme (Brühgerät, Mühle, Setup, Kaffee
     bearbeiten) ebenfalls in Karten ziehen, gehört diese Zeile in tokens.css
     statt hierher — bis dahin bleibt sie lokal, damit jene Screens ihre
     Trennlinien behalten. */
  .gruppe :global(.formularzeile) {
    border-bottom: none;
  }
  .gruppe {
    margin-bottom: var(--r5);
  }

  /* Zug C — die Aufteilung der Füllmenge als Bild statt als drei Zahlen ohne
     erkennbare Beziehung. Gedämpft und mit Tilde, weil die Shot-Menge aus dem
     Standardprofil geschätzt ist (Herkunftsregel des Projekts). */

  .falte {
    width: 100%;
    min-height: var(--treffer);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--r3);
    padding: 0 var(--r4);
    border: none;
    border-radius: var(--r-blatt);
    background: var(--vertiefung);
    color: var(--gedaempft-tief);
    font-family: var(--schrift-sans);
    font-size: var(--fs-satz);
    text-align: left;
    cursor: pointer;
  }
  .falte-zeichen {
    font-size: var(--fs-bedienwort);
  }

  .erklaerung {
    font-family: var(--schrift-sans);
    font-size: var(--fs-erklaerung);
    color: var(--gedaempft);
    margin: var(--r2) 0 0;
  }
  .einheit {
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  .hinweis {
    color: var(--gedaempft);
    font-size: var(--fs-satz);
  }
  .fehler {
    color: var(--kritisch);
    font-size: var(--fs-satz);
    margin-top: var(--r3);
  }
  .knopfreihe {
    margin-top: var(--r5);
  }
</style>
