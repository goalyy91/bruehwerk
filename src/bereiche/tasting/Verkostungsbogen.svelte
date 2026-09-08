<script lang="ts">
  // Der Verkostungsbogen — Paket 05, "Die Verkostung" in docs/konzept.md.
  // Haengt am Shot, ist im Alltagspfad unsichtbar (konzept.md:745) und wird
  // ausschliesslich ueber das Shotblatt in der Historie erreicht. Reihenfolge
  // exakt konzept.md:798-804: sechs Treppen, Auffaelligkeiten, Aromen,
  // Gerechnetes, speichern.
  //
  // Zwei Tiefen, ein Datensatz (konzept.md:806-808): dieser Bildschirm
  // FUELLT ein Tasting, er ERZEUGT keinen zweiten Weg neben dem
  // Alltagsurteil aus ShotErfassung.svelte — beide landen in derselben
  // Auswertung.

  import { untrack } from 'svelte';
  import { bestand, schreiben } from '../bestand.svelte';
  import { neueId } from '../../daten/id';
  import { GROESSEN, zusammenfassung } from '../../domain/tasting';
  import Blattliste from '../../muster/Blattliste.svelte';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import Treppe from '../../muster/Treppe.svelte';
  import Chips from '../../muster/Chips.svelte';
  import DrillDown from '../../muster/DrillDown.svelte';
  import LesartUmschalter from '../../muster/LesartUmschalter.svelte';
  import Knopf from '../../muster/Knopf.svelte';
  import type { Tasting, Groessen as GroessenTyp, Staerke } from '../../daten/schema';

  let { shotId, onZurueck, onFertig }: { shotId: string; onZurueck: () => void; onFertig: () => void } = $props();

  const shot = $derived(bestand.shots.find((s) => s.id === shotId));
  const kaffee = $derived(shot ? bestand.kaffees.find((k) => k.id === shot.kaffeeId) : undefined);
  const profil = $derived(shot ? bestand.profile.find((p) => p.id === shot.profilId) : undefined);

  // Nur beim ersten Aufbau gelesen (kein $derived) — die Route wird pro
  // shotId frisch aufgebaut (Rahmen.svelte {#key zuPfad(route)}), ein
  // zweiter Aufruf laedt also ohnehin eine neue Instanz dieses Bausteins.
  const bestehend = untrack(() => bestand.tastingVon(shotId));

  let groessenWerte = $state<GroessenTyp>({
    saeure: bestehend?.groessen.saeure ?? 2,
    koerper: bestehend?.groessen.koerper ?? 2,
    bitterkeit: bestehend?.groessen.bitterkeit ?? 2,
    aroma: bestehend?.groessen.aroma ?? 0,
    suesse: bestehend?.groessen.suesse ?? 0,
    nachklang: bestehend?.groessen.nachklang ?? 0,
  });

  const auffaelligkeitenKatalog = $derived(bestand.symptome.filter((s) => s.gruppe === 'auffaelligkeit'));
  const chipGruppen = $derived([{ titel: 'Auffälligkeiten', chips: auffaelligkeitenKatalog.map((s) => ({ id: s.id, label: s.label })) }]);
  let auffaelligkeiten = $state<{ symptomId: string; staerke: Staerke }[]>(
    bestehend?.auffaelligkeiten.map((a) => ({ symptomId: a.id, staerke: a.staerke })) ?? [],
  );

  const aromasets = $derived(bestand.aromasets);
  let aromasetId = $state(bestehend?.aromen[0]?.set ?? bestand.aromasets[0]?.id ?? '');
  const aktivesSet = $derived(aromasets.find((a) => a.id === aromasetId));
  const ebenen = $derived(
    (aktivesSet?.kategorien ?? []).map((k) => ({
      id: k.id,
      label: k.label,
      kinder: k.gruppen.map((g) => ({
        id: g.id,
        label: g.label,
        kinder: g.aromen.map((a) => ({ id: a.id, label: a.label, nummer: a.nummer })),
      })),
    })),
  );

  type GewaehltesAroma = { set: string; id: string; label: string; pfad: string[]; nummer?: number };
  let aromenAlle = $state<GewaehltesAroma[]>(
    (bestehend?.aromen ?? []).map((a) => ({
      set: a.set,
      id: a.pfad.join('|'),
      label: a.pfad[a.pfad.length - 1]!,
      pfad: a.pfad,
      nummer: a.nummer,
    })),
  );
  const aromenFuerAktivesSet = $derived(aromenAlle.filter((a) => a.set === aromasetId));

  function aromenGeaendert(neu: { id: string; label: string; pfad: string[]; nummer?: number }[]) {
    aromenAlle = [...aromenAlle.filter((a) => a.set !== aromasetId), ...neu.map((n) => ({ ...n, set: aromasetId }))];
  }

  let freitext = $state(bestehend?.freitext ?? '');

  const zusammenfassungssatz = $derived(
    zusammenfassung(
      { saeure: groessenWerte.saeure, koerper: groessenWerte.koerper, bitterkeit: groessenWerte.bitterkeit },
      aromenAlle.length,
      auffaelligkeiten.length,
    ),
  );

  let speicherFehler = $state('');

  async function speichern() {
    if (!shot) return;
    const tasting: Tasting = {
      id: bestehend?.id ?? neueId(),
      shotId: shot.id,
      groessen: groessenWerte,
      auffaelligkeiten: auffaelligkeiten.map((a) => ({ id: a.symptomId, staerke: a.staerke })),
      aromen: aromenAlle.map((a) => ({ set: a.set, pfad: a.pfad, nummer: a.nummer })),
      freitext: freitext.trim() || undefined,
    };
    try {
      await schreiben('tasting', tasting);
      if (shot.tastingId !== tasting.id) {
        await schreiben('shot', { ...shot, tastingId: tasting.id });
      }
    } catch (fehler) {
      speicherFehler = fehler instanceof Error ? fehler.message : String(fehler);
      return;
    }
    onFertig();
  }
</script>

<Kopfzeile titel="Verkostung" {onZurueck} />

{#if !shot}
  <p class="hinweis">Shot nicht gefunden.</p>
{:else}
  <h1>{kaffee?.name ?? 'Unbekannter Kaffee'}</h1>
  <p class="meta">{profil?.name} · {new Date(shot.ts).toLocaleDateString('de-DE')}</p>

  <p class="treppen-legende">
    <b>Säure · Körper · Bitterkeit</b> sind bipolar — die Mitte ist das Ziel, der Ausschlag zeigt die
    Richtung. <b>Aroma · Süße · Nachklang</b> sind einseitig — mehr ist mehr.
  </p>
  <div class="treppen">
    {#each GROESSEN as g (g.id)}
      <Treppe
        titel={g.titel}
        art={g.art}
        woerter={g.woerter}
        start={groessenWerte[g.id]}
        onWahl={(i) => (groessenWerte[g.id] = i)}
        mitErklaerung={false}
      />
    {/each}
  </div>

  <div class="block">
    <Chips
      gruppen={chipGruppen}
      start={auffaelligkeiten}
      freitextStart={freitext}
      onAenderung={(b) => (auffaelligkeiten = b)}
      onFreitext={(text) => (freitext = text)}
    />
  </div>

  <div class="block">
    <h2>Aromen</h2>
    {#if aromasets.length > 1}
      <LesartUmschalter
        optionA={aromasets[0]?.name ?? ''}
        optionB={aromasets[1]?.name ?? ''}
        start={aromasetId === aromasets[1]?.id ? 'b' : 'a'}
        onWahl={(l) => (aromasetId = (l === 'a' ? aromasets[0]?.id : aromasets[1]?.id) ?? aromasetId)}
      />
    {/if}
    {#if aktivesSet}
      <p class="quelle">{aktivesSet.quelle}</p>
    {/if}
    {#key aromasetId}
      <DrillDown {ebenen} start={aromenFuerAktivesSet} onAenderung={aromenGeaendert} />
    {/key}
  </div>

  <section class="block">
    <h2>Zusammenfassung</h2>
    <Blattliste>
      <div class="gerechnet">
        <p class="zusammenfassung">{zusammenfassungssatz}</p>
      </div>
    </Blattliste>
  </section>

  {#if speicherFehler}
    <p class="fehler">{speicherFehler}</p>
  {/if}

  <div class="knopfreihe">
    <Knopf stufe="primaer" onKlick={speichern}>Verkostung speichern</Knopf>
  </div>
{/if}

<style>
  h1 {
    /* Redesign v2, Etappe 1: groesser/kraeftiger — der Kaffeename ist die
       eigentliche Ueberschrift dieses Screens, "Verkostung" (Kopfzeile)
       bleibt die schmale Orientierungszeile darueber. */
    font-size: var(--fs-titel);
    font-weight: var(--gw-titel);
    letter-spacing: -0.02em;
    line-height: 1.2;
    margin: 0;
  }
  .meta {
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--gedaempft);
    margin: 0 0 var(--r5);
  }
  .treppen-legende {
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    line-height: 1.5;
    color: var(--gedaempft);
    margin: 0 0 var(--r3);
  }
  .treppen-legende b {
    color: var(--satz);
    font-weight: 600;
  }
  .treppen {
    display: flex;
    flex-direction: column;
    gap: var(--r5);
    margin-bottom: var(--r5);
  }
  .block {
    margin-bottom: var(--r5);
  }
  /* Einzige erlaubte Abweichung vom globalen h2 (tokens.css): kein
     Abstand nach oben, weil der Kopf direkt an seinem Block klebt.
     Die uebrigen Eigenschaften waren eine wortgleiche Kopie. */
  h2 {
    margin-top: 0;
  }
  .quelle {
    font-size: var(--fs-meta);
    color: var(--gedaempft);
    margin: 0 0 var(--r3);
  }
  /* Der Gruppenkopf steht jetzt über der Karte statt darin (wie überall
     sonst), deshalb braucht es hier nur noch das Innenpolster. Fläche,
     Radius und Schatten kommen aus Blattliste. */
  .gerechnet {
    display: flex;
    flex-direction: column;
    gap: var(--r3);
    padding: var(--r4) 0;
  }
  .zusammenfassung {
    font-size: var(--fs-satz);
    color: var(--satz);
    margin: 0;
  }
  .hinweis {
    color: var(--gedaempft);
    font-size: var(--fs-satz);
  }
  .fehler {
    color: var(--kritisch);
    font-size: var(--fs-satz);
    margin: 0 0 var(--r3);
  }
  .knopfreihe {
    margin-top: var(--r4);
  }
</style>
