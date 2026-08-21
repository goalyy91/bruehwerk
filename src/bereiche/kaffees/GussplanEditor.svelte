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

  import { bestand, schreiben } from '../bestand.svelte';
  import { gesamtwasser, verhaeltnis, umrechnen, type Lesart } from '../../domain/gussplan';
  import LesartUmschalter from '../../muster/LesartUmschalter.svelte';
  import Einzelauswahl from '../../muster/Einzelauswahl.svelte';
  import Schalter from '../../muster/Schalter.svelte';
  import type { Gussplan, GussBaustein } from '../../daten/schema';

  let { profilId }: { profilId: string } = $props();

  const profil = $derived(bestand.profile.find((p) => p.id === profilId));
  const gussplan = $derived(bestand.gusslpaene.find((g) => g.id === profil?.gussplanId));

  let speicherFehler = $state<string | undefined>(undefined);
  let offeneZeile = $state<number | undefined>(undefined);

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

  function bausteinLoeschen(index: number) {
    if (!gussplan) return;
    void planSpeichern(gussplan.bausteine.filter((_, i) => i !== index));
    offeneZeile = undefined;
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

  <ul class="liste">
    {#each gussplan.bausteine as baustein, i (i)}
      <li>
        <button type="button" class="zeile" onclick={() => (offeneZeile = offeneZeile === i ? undefined : i)}>
          <span class="typ">{baustein.typ}</span>
          <span class="kopfwert zahl">{kopfzeile(baustein)}</span>
        </button>
        {#if offeneZeile === i}
          <div class="formular">
            {#if baustein.typ === 'bloom'}
              <label>Menge <input type="text" inputmode="decimal" value={baustein.menge}
                onchange={(e) => bausteinAendern(i, { ...baustein, menge: Number((e.currentTarget as HTMLInputElement).value) })} /> g</label>
              <label>Dauer <input type="text" inputmode="decimal" value={baustein.dauer}
                onchange={(e) => bausteinAendern(i, { ...baustein, dauer: Number((e.currentTarget as HTMLInputElement).value) })} /> s</label>
            {:else if baustein.typ === 'guss'}
              <label>Zielmenge <input type="text" inputmode="decimal" value={baustein.zielmenge}
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
              <label>Menge <input type="text" inputmode="decimal" value={baustein.menge}
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
              <label class="notiz">Notiz <input type="text" value={baustein.notiz ?? ''}
                onchange={(e) => bausteinAendern(i, { ...baustein, notiz: (e.currentTarget as HTMLInputElement).value || undefined })} /></label>
            {/if}

            <div class="werkzeuge">
              <button type="button" onclick={() => bausteinVerschieben(i, -1)} disabled={i === 0}>↑</button>
              <button type="button" onclick={() => bausteinVerschieben(i, 1)} disabled={i === gussplan.bausteine.length - 1}>↓</button>
              <button type="button" class="loeschen" onclick={() => bausteinLoeschen(i)}>löschen</button>
            </div>
          </div>
        {/if}
      </li>
    {/each}
  </ul>

  <div class="hinzufuegen">
    <button type="button" onclick={() => bausteinHinzufuegen('bloom')}>+ Bloom</button>
    <button type="button" onclick={() => bausteinHinzufuegen('guss')}>+ Guss</button>
    <button type="button" onclick={() => bausteinHinzufuegen('agitation')}>+ Agitation</button>
    <button type="button" onclick={() => bausteinHinzufuegen('warten')}>+ Warten</button>
    <button type="button" onclick={() => bausteinHinzufuegen('bypass')}>+ Bypass</button>
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
    font-size: var(--fs-satz);
    color: var(--tinte);
  }
  .summe {
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  .liste {
    list-style: none;
    margin: var(--r3) 0 0;
    padding: 0;
  }
  .zeile {
    width: 100%;
    display: flex;
    justify-content: space-between;
    min-height: var(--treffer);
    padding: 0 var(--r2);
    border: none;
    border-bottom: 1px solid var(--linie-zart);
    background: var(--feld);
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    color: var(--tinte);
    text-align: left;
    cursor: pointer;
  }
  .zeile .typ {
    width: var(--typspalte);
    flex-shrink: 0;
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
    padding: var(--r3) var(--r2);
    background: var(--ruhig);
    border-bottom: 1px solid var(--linie);
  }
  .formular label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: var(--fs-meta);
    color: var(--satz);
    gap: var(--r2);
  }
  .formular input[type='text'] {
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    background: var(--feld);
    border: 1px solid var(--feld-rahmen);
    color: var(--tinte);
    padding: var(--r1) var(--r2);
    min-height: 36px;
  }
  .notiz input {
    flex: 1;
  }
  .auswahlzeile {
    display: flex;
    flex-direction: column;
    gap: var(--r1);
  }
  .auswahllabel {
    font-size: var(--fs-meta);
    color: var(--satz);
  }
  .werkzeuge {
    display: flex;
    gap: var(--r2);
    justify-content: flex-end;
  }
  .werkzeuge button {
    min-height: var(--treffer);
    min-width: var(--treffer);
    background: var(--feld);
    border: 1px solid var(--feld-rahmen);
    color: var(--tinte);
    font-family: var(--schrift);
    cursor: pointer;
  }
  .werkzeuge button:disabled {
    opacity: 0.4;
    cursor: default;
  }
  .werkzeuge .loeschen {
    color: var(--kritisch);
  }
  .hinzufuegen {
    display: flex;
    flex-wrap: wrap;
    gap: var(--r2);
    margin-top: var(--r3);
  }
  .hinzufuegen button {
    min-height: var(--treffer);
    padding: 0 var(--r3);
    background: transparent;
    border: 1px solid var(--linie);
    color: var(--satz);
    font-family: var(--schrift);
    font-size: var(--fs-meta);
    cursor: pointer;
  }
  .fehler {
    color: var(--kritisch);
    font-size: var(--fs-satz);
    margin-top: var(--r3);
  }
</style>
