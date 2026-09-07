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
      e.mindestAusgleich = undefined;
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

  function reihenfolgeText(e: Getraenk): string {
    return e.reihenfolge.join(', ');
  }
  function reihenfolgeAendern(e: Getraenk, text: string) {
    e.reihenfolge = text
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
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
    <h2>Menge</h2>
    <Blattliste>
      <div class="formularzeile">
        <span class="formularzeile-label">Füllmenge</span>
        <input
          class="eingabefeld-text zahl"
          type="text"
          inputmode="decimal"
          value={entwurf.fuellmenge}
          onchange={(e) => (entwurf!.fuellmenge = zahl(e))}
        />
        <span class="einheit">ml</span>
      </div>
      <div class="formularzeile">
        <span class="formularzeile-label">Gefäß</span>
        <input class="eingabefeld-text" type="text" bind:value={entwurf.gefaess.name} />
      </div>
      <div class="formularzeile">
        <span class="formularzeile-label">Volumen</span>
        <input
          class="eingabefeld-text zahl"
          type="text"
          inputmode="decimal"
          value={entwurf.gefaess.volumen}
          onchange={(e) => (entwurf!.gefaess.volumen = zahl(e))}
        />
        <span class="einheit">ml</span>
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

      {#if entwurf.ausgleich !== null}
        <div class="formularzeile">
          <span class="formularzeile-label">Mindestens</span>
          <input
            class="eingabefeld-text zahl"
            type="text"
            inputmode="decimal"
            value={entwurf.mindestAusgleich ?? ''}
            placeholder="—"
            onchange={(e) => (entwurf!.mindestAusgleich = e.currentTarget.value === '' ? undefined : zahl(e))}
          />
          <span class="einheit">ml</span>
        </div>
      {/if}
    </Blattliste>
    {#if entwurf.ausgleich !== null}
      <!-- Der einzige Erklärsatz, der bleibt: er beschreibt eine echte
           Nebenwirkung (ein Extra Shot verschwindet), die man dem Feld nicht
           ansieht. Die anderen vier sagten, was jetzt der Gruppenkopf sagt. -->
      <p class="erklaerung">Darunter wird ein Extra Shot gar nicht erst angeboten. Leer heißt: immer erlaubt.</p>
    {/if}
  </section>

  <!-- Reihenfolge und Empfindlichkeit stellt man einmal beim Anlegen ein und
       danach nie wieder. Empfindlichkeit wirkt ausschließlich auf die
       Planer-Reihenfolge und erscheint nirgends in der Bedienung (K48).
       Eingeklappt, nicht gelöscht — beide bleiben einen Tap entfernt. -->
  <section class="gruppe">
    <button type="button" class="falte" onclick={() => (feinheitenOffen = !feinheitenOffen)}>
      <span>Feinheiten · Reihenfolge, Empfindlichkeit</span>
      <span class="falte-zeichen" aria-hidden="true">{feinheitenOffen ? '−' : '+'}</span>
    </button>
    {#if feinheitenOffen}
      <Blattliste>
        <div class="formularzeile">
          <span class="formularzeile-label">Reihenfolge</span>
          <input
            class="eingabefeld-text"
            type="text"
            placeholder="z. B. wasser, shot"
            value={reihenfolgeText(entwurf)}
            onchange={(e) => reihenfolgeAendern(entwurf!, e.currentTarget.value)}
          />
        </div>
        <div class="formularzeile">
          <span class="formularzeile-label">Empfindlichkeit</span>
          <input
            class="eingabefeld-text zahl"
            type="text"
            inputmode="numeric"
            value={entwurf.empfindlichkeit}
            onchange={(e) => (entwurf!.empfindlichkeit = Math.max(0, Math.min(10, Math.round(zahl(e)))))}
          />
        </div>
      </Blattliste>
      <p class="erklaerung">
        Reihenfolge trägt z. B. den Unterschied zwischen Long Black (Wasser zuerst) und Americano.
        Empfindlichkeit: 0 = verfällt kaum (Cold Brew), 10 = verfällt sofort (Espresso pur).
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
