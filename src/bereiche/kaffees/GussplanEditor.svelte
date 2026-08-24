<script lang="ts">
  // Gussplan-Editor — "Pour Over: der Gussplan" in docs/konzept.md.
  // Die Summenzeile und die Lesart-Umrechnung sind reines TypeScript in
  // domain/gussplan.ts (getestet dort). Diese Komponente verdrahtet nur.
  //
  // Vereinfachung gegenueber der Konzept-Skizze: echtes Ziehen zum
  // Umsortieren ist hier noch nicht gebaut (nur Auf/Ab-Knoepfe) — das
  // Muster 9 selbst nennt das echte Ziehen ausdruecklich als offenen
  // Punkt fuer "den ersten Bildschirm, der dieses Muster traegt". Bearbeiten
  // und Loeschen sitzen bewusst nicht hinter einer Wischgeste (K44):
  // ein Tap auf die Zeile oeffnet ihr Formular direkt darunter.
  //
  // Visueller Redesign-Reset, Paket 4: Bausteinliste als Blatt mit
  // Haarlinien statt eckig umrandeter Zeilen, aufgeklapptes Formular in
  // Vertiefung (offener Zustand), Textfelder ueber .eingabefeld-text.

  import { bestand, schreiben } from '../bestand.svelte';
  import { gesamtwasser, verhaeltnis, umrechnen, type Lesart } from '../../domain/gussplan';
  import LesartUmschalter from '../../muster/LesartUmschalter.svelte';
  import Einzelauswahl from '../../muster/Einzelauswahl.svelte';
  import AuswahlListe from '../../muster/AuswahlListe.svelte';
  import Schalter from '../../muster/Schalter.svelte';
  import type { Gussplan, GussBaustein } from '../../daten/schema';

  let { profilId }: { profilId: string } = $props();

  const profil = $derived(bestand.profile.find((p) => p.id === profilId));
  const gussplan = $derived(bestand.gusslpaene.find((g) => g.id === profil?.gussplanId));

  let speicherFehler = $state<string | undefined>(undefined);
  let offeneZeile = $state<number | undefined>(undefined);
  let loeschenBestaetigen = $state<number | undefined>(undefined);
  let neuOffen = $state(false);

  // Regel 8/Sprache: lesbare Labels statt der rohen Enum-Werte im Zeilenkopf.
  const TYP_LABEL: Record<GussBaustein['typ'], string> = {
    vorbereiten: 'Vorbereiten',
    bloom: 'Bloom',
    guss: 'Guss',
    agitation: 'Agitation',
    warten: 'Warten',
    bypass: 'Bypass',
    frei: 'Frei (Migration)',
  };

  const NEU_OPTIONEN: { wert: GussBaustein['typ']; label: string }[] = [
    { wert: 'bloom', label: 'Bloom' },
    { wert: 'guss', label: 'Guss' },
    { wert: 'agitation', label: 'Agitation' },
    { wert: 'warten', label: 'Warten' },
    { wert: 'bypass', label: 'Bypass' },
  ];

  const summe = $derived(
    gussplan ? gesamtwasser(alsDomainBausteine(gussplan.bausteine), gussplan.lesart) : 0,
  );
  const verhaeltnisText = $derived(profil && gussplan ? verhaeltnis(profil.ziel.input, summe) : '—');

  /** Reduziert die Zod-Union auf die Felder, die domain/gussplan.ts braucht. */
  function alsDomainBausteine(bausteine: readonly GussBaustein[]) {
    return bausteine.map((b): { typ: string; menge?: number; zielmenge?: number } => {
      if (b.typ === 'bloom' || b.typ === 'bypass' || b.typ === 'frei') return { typ: b.typ, menge: b.menge };
      if (b.typ === 'guss') return { typ: 'guss', zielmenge: b.zielmenge };
      return { typ: b.typ };
    }) as never;
  }

  async function gussplanAnlegen() {
    if (!profil) return;
    speicherFehler = undefined;
    const neu: Gussplan = {
      id: crypto.randomUUID(),
      name: profil.name,
      gesamtwasser: profil.ziel.output || 1,
      lesart: 'kumulativ',
      bausteine: [
        { typ: 'bloom', menge: Math.round(profil.ziel.input * 2), dauer: 30 },
        { typ: 'guss', zielmenge: Math.round(profil.ziel.output * 0.5) },
        { typ: 'guss', zielmenge: profil.ziel.output },
        { typ: 'warten', modus: 'bis-durchgelaufen' },
      ],
    };
    try {
      await schreiben('gussplan', neu);
      await schreiben('profil', { ...profil, gussplanId: neu.id });
    } catch (fehler) {
      speicherFehler = fehler instanceof Error ? fehler.message : String(fehler);
    }
  }

  async function planSpeichern(bausteine: GussBaustein[]) {
    if (!gussplan) return;
    speicherFehler = undefined;
    const wasser = gesamtwasser(alsDomainBausteine(bausteine), gussplan.lesart);
    try {
      await schreiben('gussplan', { ...gussplan, bausteine, gesamtwasser: wasser > 0 ? wasser : gussplan.gesamtwasser });
    } catch (fehler) {
      speicherFehler = fehler instanceof Error ? fehler.message : String(fehler);
    }
  }

  async function lesartWechseln(neu: 'a' | 'b') {
    if (!gussplan) return;
    const zielLesart: Lesart = neu === 'a' ? 'kumulativ' : 'inkrementell';
    if (zielLesart === gussplan.lesart) return;
    const umgerechnet = umrechnen(gussplan.bausteine as never[], gussplan.lesart, zielLesart) as GussBaustein[];
    speicherFehler = undefined;
    try {
      await schreiben('gussplan', { ...gussplan, lesart: zielLesart, bausteine: umgerechnet });
    } catch (fehler) {
      speicherFehler = fehler instanceof Error ? fehler.message : String(fehler);
    }
  }

  function bausteinHinzufuegen(typ: GussBaustein['typ']) {
    if (!gussplan) return;
    neuOffen = false;
    const neu: GussBaustein =
      typ === 'vorbereiten'
        ? { typ, filterSpuelen: true, gefaessVorwaermen: false }
        : typ === 'bloom'
          ? { typ, menge: 50, dauer: 30 }
          : typ === 'guss'
            ? { typ, zielmenge: 0 }
            : typ === 'agitation'
              ? { typ, art: 'schwenken' }
              : typ === 'warten'
                ? { typ, modus: 'bis-durchgelaufen' }
                : typ === 'bypass'
                  ? { typ, menge: 20 }
                  : { typ: 'frei', menge: 0, rolle: 'Baustein' };
    void planSpeichern([...gussplan.bausteine, neu]);
  }

  function bausteinAendern(index: number, geaendert: GussBaustein) {
    if (!gussplan) return;
    const bausteine = gussplan.bausteine.map((b, i) => (i === index ? geaendert : b));
    void planSpeichern(bausteine);
  }

  // Zweiter Tap bestaetigt (dieselbe Mechanik wie Kontextmenue.svelte fuer
  // kritische Aktionen) — kein OS-confirm(), kein stilles Sofort-Loeschen.
  function bausteinLoeschen(index: number) {
    if (loeschenBestaetigen !== index) {
      loeschenBestaetigen = index;
      return;
    }
    if (!gussplan) return;
    void planSpeichern(gussplan.bausteine.filter((_, i) => i !== index));
    offeneZeile = undefined;
    loeschenBestaetigen = undefined;
  }

  function bausteinVerschieben(index: number, richtung: -1 | 1) {
    if (!gussplan) return;
    const ziel = index + richtung;
    if (ziel < 0 || ziel >= gussplan.bausteine.length) return;
    const bausteine = [...gussplan.bausteine];
    [bausteine[index], bausteine[ziel]] = [bausteine[ziel]!, bausteine[index]!];
    void planSpeichern(bausteine);
  }

  function kopfzeile(b: GussBaustein): string {
    switch (b.typ) {
      case 'vorbereiten':
        return [b.filterSpuelen && 'Filter spülen', b.gefaessVorwaermen && 'Gefäß vorwärmen'].filter(Boolean).join(' · ') || '—';
      case 'bloom':
        return `${b.menge} g · ${b.dauer} s`;
      case 'guss':
        return `${gussplan?.lesart === 'kumulativ' ? 'auf' : '+'} ${b.zielmenge} g${b.dauer ? ` · ${b.dauer} s` : ''}${b.muster ? ` · ${b.muster}` : ''}`;
      case 'agitation':
        return b.art;
      case 'warten':
        return b.modus === 'bis-durchgelaufen' ? 'bis durchgelaufen' : `${b.dauer ?? 0} s`;
      case 'bypass':
        return `${b.menge} g${b.temperatur ? ` · ${b.temperatur} °C` : ''}`;
      case 'frei':
        return `${b.rolle}${b.menge ? ` · ${b.menge} g` : ''}${b.dauer ? ` · ${b.dauer} s` : ''}`;
    }
  }
</script>

{#if !profil}
  <!-- Kaffeeblatt/Profilblatt haben schon geprueft, dass es ein Profil gibt -->
{:else if !gussplan}
  <p class="hinweis">Kein Gussplan. <button type="button" class="link" onclick={gussplanAnlegen}>anlegen</button></p>
{:else}
  <div class="kopf">
    <span class="titel">Gussplan · {gussplan.name}</span>
    <span class="summe zahl">{profil.ziel.input} g · {summe} g · {verhaeltnisText}</span>
  </div>

  <LesartUmschalter
    optionA="auf X g"
    optionB="+ X g"
    start={gussplan.lesart === 'kumulativ' ? 'a' : 'b'}
    onWahl={lesartWechseln}
  />

  <div class="panel">
    {#each gussplan.bausteine as baustein, i (i)}
      <button type="button" class="zeile" onclick={() => (offeneZeile = offeneZeile === i ? undefined : i)}>
        <span class="typ">{TYP_LABEL[baustein.typ]}</span>
        <span class="kopfwert zahl">{kopfzeile(baustein)}</span>
      </button>
      {#if offeneZeile === i}
        <div class="formular">
          {#if baustein.typ === 'bloom'}
            <label>Menge <input class="eingabefeld-text zahl" type="text" inputmode="decimal" value={baustein.menge}
              onchange={(e) => bausteinAendern(i, { ...baustein, menge: Number((e.currentTarget as HTMLInputElement).value) })} /> g</label>
            <label>Dauer <input class="eingabefeld-text zahl" type="text" inputmode="decimal" value={baustein.dauer}
              onchange={(e) => bausteinAendern(i, { ...baustein, dauer: Number((e.currentTarget as HTMLInputElement).value) })} /> s</label>
          {:else if baustein.typ === 'guss'}
            <label>Zielmenge <input class="eingabefeld-text zahl" type="text" inputmode="decimal" value={baustein.zielmenge}
              onchange={(e) => bausteinAendern(i, { ...baustein, zielmenge: Number((e.currentTarget as HTMLInputElement).value) })} /> g</label>
            <div class="auswahlzeile">
              <span class="auswahllabel">Muster</span>
              <Einzelauswahl
                optionen={[
                  { wert: 'zentrum', label: 'Zentrum' },
                  { wert: 'spirale', label: 'Spirale' },
                  { wert: 'aussen', label: 'außen halten' },
                ]}
                wert={baustein.muster ?? ''}
                onWahl={(w) => bausteinAendern(i, { ...baustein, muster: w as never })}
              />
            </div>
          {:else if baustein.typ === 'agitation'}
            <div class="auswahlzeile">
              <span class="auswahllabel">Art</span>
              <Einzelauswahl
                optionen={[
                  { wert: 'schwenken', label: 'Schwenken' },
                  { wert: 'rao-spin', label: 'Rao Spin' },
                  { wert: 'ruehren', label: 'Rühren' },
                  { wert: 'klopfen', label: 'Klopfen' },
                ]}
                wert={baustein.art}
                onWahl={(w) => bausteinAendern(i, { ...baustein, art: w as never })}
              />
            </div>
          {:else if baustein.typ === 'warten'}
            <div class="auswahlzeile">
              <span class="auswahllabel">Modus</span>
              <Einzelauswahl
                optionen={[
                  { wert: 'bis-durchgelaufen', label: 'bis durchgelaufen' },
                  { wert: 'feste-dauer', label: 'feste Dauer' },
                ]}
                wert={baustein.modus}
                onWahl={(w) => bausteinAendern(i, { ...baustein, modus: w as never })}
              />
            </div>
          {:else if baustein.typ === 'bypass'}
            <label>Menge <input class="eingabefeld-text zahl" type="text" inputmode="decimal" value={baustein.menge}
              onchange={(e) => bausteinAendern(i, { ...baustein, menge: Number((e.currentTarget as HTMLInputElement).value) })} /> g</label>
          {:else if baustein.typ === 'vorbereiten'}
            <Schalter label="Filter spülen" an={baustein.filterSpuelen}
              onWahl={(a) => bausteinAendern(i, { ...baustein, filterSpuelen: a })} />
            <Schalter label="Gefäß vorwärmen" an={baustein.gefaessVorwaermen}
              onWahl={(a) => bausteinAendern(i, { ...baustein, gefaessVorwaermen: a })} />
          {:else if baustein.typ === 'frei'}
            <p class="hinweis-klein">Altbestand aus der Notion-Migration — nur ansehbar.</p>
          {/if}
          {#if baustein.typ !== 'frei'}
            <label class="notiz">Notiz <input class="eingabefeld-text" type="text" value={baustein.notiz ?? ''}
              onchange={(e) => bausteinAendern(i, { ...baustein, notiz: (e.currentTarget as HTMLInputElement).value || undefined })} /></label>
          {/if}

          <div class="werkzeuge">
            <button type="button" class="werkzeug" onclick={() => bausteinVerschieben(i, -1)} disabled={i === 0}>↑</button>
            <button type="button" class="werkzeug" onclick={() => bausteinVerschieben(i, 1)} disabled={i === gussplan.bausteine.length - 1}>↓</button>
            <button type="button" class="werkzeug loeschen" onclick={() => bausteinLoeschen(i)}>
              {loeschenBestaetigen === i ? 'wirklich?' : 'löschen'}
            </button>
          </div>
        </div>
      {/if}
    {/each}
  </div>

  <!-- Regel 3/5: eine Auswahl statt eines Knopfteppichs aus fuenf
       gleichrangigen "+ Typ"-Aktionen. -->
  <div class="hinzufuegen">
    {#if neuOffen}
      <AuswahlListe optionen={NEU_OPTIONEN} wert="" onWahl={(w) => bausteinHinzufuegen(w as GussBaustein['typ'])} platzhalter="Baustein wählen …" />
    {:else}
      <button type="button" class="neu-oeffnen" onclick={() => (neuOffen = true)}>+ Baustein</button>
    {/if}
  </div>

  {#if speicherFehler}
    <p class="fehler">Nicht gespeichert: {speicherFehler} — nochmal versuchen.</p>
  {/if}
{/if}

<style>
  .hinweis {
    color: var(--gedaempft);
    font-size: var(--fs-satz);
  }
  .hinweis-klein {
    color: var(--gedaempft);
    font-size: var(--fs-meta);
    margin: 0;
  }
  .link {
    background: none;
    border: none;
    color: var(--akzent);
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    cursor: pointer;
    padding: 0;
  }
  .kopf {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin: var(--r4) 0 var(--r2);
  }
  .titel {
    font-size: var(--fs-bedienwort);
    color: var(--tinte);
  }
  .summe {
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  /* Blatt mit Zeilen (Bausteine) + aufgeklapptem Formular in Vertiefung
     (offener Zustand) — kein zentrales Muster fuer diese Form vorhanden
     (siehe docs/design/offene-punkte-redesign.md, Punkt 8). */
  .panel {
    margin-top: var(--r3);
    background: var(--blatt);
    border-radius: var(--r-blatt);
    padding: 0 var(--r4);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .panel > :not(:first-child) {
    border-top: 1px solid var(--linie);
  }
  .zeile {
    width: 100%;
    display: flex;
    justify-content: space-between;
    min-height: var(--treffer);
    border: none;
    background: transparent;
    font-family: var(--schrift);
    font-size: var(--fs-bedienwort);
    color: var(--tinte);
    text-align: left;
    cursor: pointer;
  }
  .zeile .typ {
    width: var(--typspalte);
    flex-shrink: 0;
    font-family: var(--schrift-sans);
    color: var(--gedaempft);
    font-size: var(--fs-meta);
    display: flex;
    align-items: center;
  }
  .zeile .kopfwert {
    display: flex;
    align-items: center;
    flex: 1;
    justify-content: flex-end;
  }
  .formular {
    display: flex;
    flex-direction: column;
    gap: var(--r2);
    padding: var(--r3) 0 var(--r4);
  }
  .formular label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--satz);
    gap: var(--r2);
  }
  .notiz .eingabefeld-text {
    flex: 1;
  }
  .auswahlzeile {
    display: flex;
    flex-direction: column;
    gap: var(--r1);
  }
  .auswahllabel {
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--satz);
  }
  .werkzeuge {
    display: flex;
    gap: var(--r2);
    justify-content: flex-end;
  }
  .werkzeug {
    min-height: var(--treffer);
    min-width: var(--treffer);
    background: none;
    border: none;
    color: var(--satz);
    font-family: var(--schrift);
    font-size: var(--fs-bedienwort);
    cursor: pointer;
  }
  .werkzeug:disabled {
    opacity: 0.4;
    cursor: default;
  }
  .werkzeug.loeschen {
    color: var(--kritisch);
    font-size: var(--fs-meta);
    font-family: var(--schrift-sans);
  }
  .hinzufuegen {
    margin-top: var(--r3);
  }
  .neu-oeffnen {
    display: block;
    width: 100%;
    min-height: var(--treffer);
    padding: 0;
    background: transparent;
    border: none;
    color: var(--akzent);
    font-family: var(--schrift);
    font-size: var(--fs-bedienwort);
    text-align: left;
    cursor: pointer;
  }
  .fehler {
    color: var(--kritisch);
    font-size: var(--fs-satz);
    margin-top: var(--r3);
  }
</style>
