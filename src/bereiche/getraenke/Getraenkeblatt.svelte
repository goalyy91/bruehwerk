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
    return { ...$state.snapshot(v), id: crypto.randomUUID(), name: `${v.name} Kopie` };
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
  <Kopfzeile titel={bestehend ? entwurf.name : 'Neues Getränk'} {onZurueck}>
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

  <div class="formularzeile">
    <span class="formularzeile-label">Name</span>
    <input class="eingabefeld-text" type="text" bind:value={entwurf.name} />
  </div>

  <div class="formularzeile spalte">
    <span class="formularzeile-label">Zubereitung</span>
    <AuswahlListe optionen={ZUBEREITUNG_OPTIONEN} wert={entwurf.zubereitung} onWahl={(w) => (entwurf!.zubereitung = w)} />
  </div>
  <p class="erklaerung">Bestimmt, welche Bohnen in der Bestellung dafür infrage kommen (K46).</p>

  <div class="formularzeile">
    <span class="formularzeile-label">Kategorie</span>
    <input class="eingabefeld-text" type="text" bind:value={entwurf.kategorie} />
  </div>

  <div class="formularzeile spalte">
    <span class="formularzeile-label">Bezugsanteil</span>
    <Segment
      optionen={[{ wert: 'halb', label: 'halber Bezug' }, { wert: 'ganz', label: 'ganzer Bezug' }]}
      wert={entwurf.basis.anteilBezug}
      onWahl={(w) => (entwurf!.basis.anteilBezug = w as 'ganz' | 'halb')}
    />
  </div>
  <p class="erklaerung">Zwei Getränke mit halbem Bezug, derselben Bohne und demselben Profil teilen sich einen Bezug.</p>

  <div class="formularzeile">
    <span class="formularzeile-label">Brühgerät</span>
    <AuswahlListe
      optionen={bestand.bruehgeraete.map((b) => ({ wert: b.id, label: b.name }))}
      wert={entwurf.basis.bruehgeraetId}
      onWahl={(w) => (entwurf!.basis.bruehgeraetId = w)}
    />
  </div>

  <div class="formularzeile spalte">
    <span class="formularzeile-label">Ausgleichszutat</span>
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
  <p class="erklaerung">Wie voll das fertige Getränk ist — die Ausgleichszutat füllt auf, was der Kaffee übrig lässt.</p>

  {#if entwurf.ausgleich !== null}
    <div class="formularzeile">
      <span class="formularzeile-label">Mindestmenge</span>
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
    <p class="erklaerung">Darunter wird ein Extra Shot hier gar nicht erst angeboten — leer lassen für "immer erlaubt".</p>
  {/if}

  {#if entwurf.ausgleich === 'milch' && entwurf.milch}
    <div class="formularzeile">
      <span class="formularzeile-label">Milch-Textur</span>
      <input class="eingabefeld-text" type="text" bind:value={entwurf.milch.textur} />
    </div>
    <div class="formularzeile">
      <span class="formularzeile-label">Milch-Temperatur</span>
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
      <span class="formularzeile-label">Wasser-Temperatur</span>
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
  <p class="erklaerung">Trägt z. B. den Unterschied zwischen Long Black (Wasser zuerst) und Americano.</p>

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
  <p class="erklaerung">0 = verfällt kaum (Cold Brew), 10 = verfällt sofort (Espresso pur). Wirkt nur auf die Planer-Reihenfolge, erscheint nirgends im Bild (K48).</p>

  <div class="formularzeile">
    <Schalter label="aus dem Vorrat (Cold Brew)" an={entwurf.basis.ausVorrat} onWahl={(a) => (entwurf!.basis.ausVorrat = a)} />
  </div>

  {#if fehler}
    <p class="fehler">Nicht gespeichert: {fehler}.</p>
  {/if}

  <div class="knopfreihe">
    <Knopf stufe="primaer" onKlick={speichern}>speichern</Knopf>
  </div>
{/if}

<style>
  .erklaerung {
    font-family: var(--schrift-sans);
    font-size: 14.5px;
    color: var(--gedaempft);
    margin: var(--r1) 0 var(--r3);
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
