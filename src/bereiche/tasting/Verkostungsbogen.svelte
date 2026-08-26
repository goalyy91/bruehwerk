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
  import { GROESSEN, berechneBalance, berechneKomplexitaet, berechneGesamt } from '../../domain/tasting';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import Treppe from '../../muster/Treppe.svelte';
  import Chips from '../../muster/Chips.svelte';
  import DrillDown from '../../muster/DrillDown.svelte';
  import LesartUmschalter from '../../muster/LesartUmschalter.svelte';
  import Herkunft from '../../muster/Herkunft.svelte';
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

  const balance = $derived(berechneBalance({ saeure: groessenWerte.saeure, koerper: groessenWerte.koerper, bitterkeit: groessenWerte.bitterkeit }));
  const komplexitaet = $derived(berechneKomplexitaet(aromenAlle.length));
  const gesamt = $derived(shot ? berechneGesamt(shot.urteil) : '');

  let speicherFehler = $state('');

  async function speichern() {
    if (!shot) return;
    const tasting: Tasting = {
      id: bestehend?.id ?? crypto.randomUUID(),
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

  <div class="treppen">
    {#each GROESSEN as g (g.id)}
      <Treppe titel={g.titel} art={g.art} woerter={g.woerter} start={groessenWerte[g.id]} onWahl={(i) => (groessenWerte[g.id] = i)} />
    {/each}
  </div>

  <div class="block">
    <p class="gruppenkopf">Auffälligkeiten</p>
    <Chips
      gruppen={chipGruppen}
      start={auffaelligkeiten}
      freitextStart={freitext}
      onAenderung={(b) => (auffaelligkeiten = b)}
      onFreitext={(text) => (freitext = text)}
    />
  </div>

  <div class="block">
    <p class="gruppenkopf">Aromen</p>
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

  <div class="block gerechnet">
    <p class="gruppenkopf">Gerechnet</p>
    <div class="gerechnet-zeile">
      <span class="label">Balance</span>
      <Herkunft art="gerechnet" wert={balance} />
    </div>
    <div class="gerechnet-zeile">
      <span class="label">Komplexität</span>
      <Herkunft art="gerechnet" wert={komplexitaet} />
    </div>
    <div class="gerechnet-zeile">
      <span class="label">Gesamt</span>
      <Herkunft art="gerechnet" wert={gesamt} mitLegende />
    </div>
  </div>

  {#if speicherFehler}
    <p class="fehler">{speicherFehler}</p>
  {/if}

  <div class="knopfreihe">
    <Knopf stufe="primaer" onKlick={speichern}>Verkostung speichern</Knopf>
  </div>
{/if}

<style>
  h1 {
    font-size: var(--fs-objekt);
    font-weight: var(--gw-text);
    letter-spacing: -0.01em;
    margin: 0;
  }
  .meta {
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--gedaempft);
    margin: 0 0 var(--r5);
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
  .gruppenkopf {
    font-family: var(--schrift-sans);
    font-size: var(--fs-gruppenkopf);
    letter-spacing: var(--label-spacing);
    text-transform: uppercase;
    color: var(--gedaempft);
    margin: 0 0 var(--r-kachelabstand);
  }
  .quelle {
    font-size: var(--fs-meta);
    color: var(--gedaempft);
    margin: 0 0 var(--r3);
  }
  .gerechnet {
    display: flex;
    flex-direction: column;
    gap: var(--r3);
    padding: var(--r4);
    background: var(--blatt);
    border-radius: var(--r-blatt);
  }
  .gerechnet .gruppenkopf {
    margin: 0;
  }
  .gerechnet-zeile {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .label {
    font-size: var(--fs-satz);
    color: var(--satz);
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
