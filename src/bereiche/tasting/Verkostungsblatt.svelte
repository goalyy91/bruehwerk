<script lang="ts">
  // Verkostungsblatt — die Leseansicht zu einer gespeicherten Verkostung.
  // Rueckmeldung 2026-09-11: "wenn ich ihn ausgefuellt und gespeichert habe,
  // soll er mir zum lesen uebersichtlicher sein". Genau das Muster, das
  // Kaffee schon nutzt (Kaffeeblatt liest, KaffeeBearbeiten bearbeitet) —
  // Basis-Route 'verkostung' zeigt dieses Blatt, 'verkostungBearbeiten'
  // oeffnet den unveraenderten Verkostungsbogen.
  //
  // Zeigt nur, was tatsaechlich gewaehlt wurde: die sechs Treppen eng
  // beieinander (Treppe.svelte mit interaktiv=false), nur die gesetzten
  // Auffaelligkeiten statt des ganzen Chip-Katalogs, nur die gewaehlte
  // Lesart und ihre Aromen statt des Drill-downs. Kein Speichern-Knopf —
  // reine Ansicht.

  import { bestand } from '../bestand.svelte';
  import { GROESSEN, zusammenfassung } from '../../domain/tasting';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import Treppe from '../../muster/Treppe.svelte';
  import Blattliste from '../../muster/Blattliste.svelte';
  import BearbeitenKnopf from '../../muster/BearbeitenKnopf.svelte';

  let { shotId, onZurueck, onBearbeiten }: { shotId: string; onZurueck: () => void; onBearbeiten: () => void } = $props();

  const shot = $derived(bestand.shots.find((s) => s.id === shotId));
  const kaffee = $derived(shot ? bestand.kaffees.find((k) => k.id === shot.kaffeeId) : undefined);
  const profil = $derived(shot ? bestand.profile.find((p) => p.id === shot.profilId) : undefined);
  const tasting = $derived(bestand.tastingVon(shotId));

  function symptomLabel(id: string): string {
    return bestand.symptome.find((s) => s.id === id)?.label ?? id;
  }

  // Dieselbe Herleitung wie DrillDown.svelte::farbeVonPfad — ein Aroma-Pfad
  // traegt Labels, keine Ids, deshalb die oberste Ebene ueber ihr Label in
  // den Kategorien des Sets wiederfinden. K36-Aufhebung: derselbe Punkt wie
  // im Bogen selbst, nicht nur waehrend der Auswahl.
  function farbeVonPfad(setId: string, pfad: readonly string[]): string | undefined {
    const kategorieId = bestand.aromasets.find((a) => a.id === setId)?.kategorien.find((k) => k.label === pfad[0])?.id;
    return kategorieId ? `var(--kat-${kategorieId})` : undefined;
  }

  interface AromaZeile {
    readonly pfad: readonly string[];
    readonly nummer?: number;
    readonly farbe?: string;
  }

  // Normalerweise genau eine Gruppe (eine Lesart je Verkostung) — gruppiert
  // trotzdem nach Set, falls doch beide genutzt wurden.
  const aromenGruppen = $derived.by(() => {
    if (!tasting) return [] as { setId: string; setName: string; eintraege: AromaZeile[] }[];
    const nachSet = new Map<string, AromaZeile[]>();
    for (const a of tasting.aromen) {
      const liste = nachSet.get(a.set) ?? [];
      liste.push({ pfad: a.pfad, nummer: a.nummer, farbe: farbeVonPfad(a.set, a.pfad) });
      nachSet.set(a.set, liste);
    }
    return [...nachSet.entries()].map(([setId, eintraege]) => ({
      setId,
      setName: bestand.aromasets.find((s) => s.id === setId)?.name ?? setId,
      eintraege,
    }));
  });

  const zusammenfassungssatz = $derived(
    tasting
      ? zusammenfassung(
          { saeure: tasting.groessen.saeure, koerper: tasting.groessen.koerper, bitterkeit: tasting.groessen.bitterkeit },
          tasting.aromen.length,
          tasting.auffaelligkeiten.length,
        )
      : '',
  );
</script>

<Kopfzeile titel="Verkostung" {onZurueck}>
  {#snippet aktion()}
    <BearbeitenKnopf onKlick={onBearbeiten} />
  {/snippet}
</Kopfzeile>

{#if !shot}
  <p class="hinweis">Shot nicht gefunden.</p>
{:else if !tasting}
  <p class="hinweis">Noch keine Verkostung erfasst.</p>
{:else}
  <h1>{kaffee?.name ?? 'Unbekannter Kaffee'}</h1>
  <p class="meta">{profil?.name} · {new Date(shot.ts).toLocaleDateString('de-DE')}</p>

  <div class="treppen">
    {#each GROESSEN as g (g.id)}
      <Treppe titel={g.titel} art={g.art} woerter={g.woerter} start={tasting.groessen[g.id]} interaktiv={false} mitErklaerung={false} />
    {/each}
  </div>

  {#if tasting.auffaelligkeiten.length > 0}
    <div class="block">
      <h2>Auffälligkeiten</h2>
      <div class="chipreihe">
        {#each tasting.auffaelligkeiten as a (a.id)}
          <span class="chip-lesend" class:leicht={a.staerke === 'leicht'}>{a.staerke} {symptomLabel(a.id)}</span>
        {/each}
      </div>
    </div>
  {/if}

  {#each aromenGruppen as gruppe (gruppe.setId)}
    <div class="block">
      <h2>Aromen</h2>
      <p class="quelle">{gruppe.setName}</p>
      <ul class="aromenliste">
        {#each gruppe.eintraege as a (a.pfad.join('|'))}
          <li>
            {#if a.farbe}<span class="kategorie-punkt" style="--punkt-farbe: {a.farbe}"></span>{/if}
            <span class="name">{a.pfad[a.pfad.length - 1]}</span>
            {#if a.nummer !== undefined}<span class="nummer">{a.nummer}</span>{/if}
          </li>
        {/each}
      </ul>
    </div>
  {/each}

  <section class="block">
    <h2>Zusammenfassung</h2>
    <Blattliste>
      <div class="gerechnet">
        <p class="zusammenfassung">{zusammenfassungssatz}</p>
      </div>
    </Blattliste>
  </section>

  {#if tasting.freitext}
    <p class="freitext">„{tasting.freitext}“</p>
  {/if}
{/if}

<style>
  h1 {
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
  /* Der eigentliche Punkt dieser Ansicht: enger als im Bogen (--r3 statt
     --r5) — die sechs Treppen ruecken zusammen statt Platz zu beanspruchen,
     der beim Lesen nicht mehr gebraucht wird. */
  .treppen {
    display: flex;
    flex-direction: column;
    gap: var(--r3);
    margin-bottom: var(--r5);
  }
  .block {
    margin-bottom: var(--r5);
  }
  h2 {
    margin-top: 0;
  }
  .quelle {
    font-size: var(--fs-meta);
    color: var(--gedaempft);
    margin: 0 0 var(--r3);
  }
  .chipreihe {
    display: flex;
    flex-wrap: wrap;
    gap: var(--r2);
  }
  .chip-lesend {
    padding: 7px var(--r3);
    border-radius: var(--r-pille);
    background: var(--fuellung);
    color: var(--auf-fuellung);
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
  }
  .chip-lesend.leicht {
    background: var(--fuellung-leicht);
  }
  .aromenliste {
    display: flex;
    flex-direction: column;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .aromenliste li {
    display: flex;
    align-items: center;
    gap: var(--r2);
    min-height: 40px;
    border-top: 1px solid var(--linie);
    font-size: var(--fs-satz);
    color: var(--satz);
  }
  .aromenliste li:first-child {
    border-top: none;
  }
  .aromenliste .name {
    flex: 1;
    min-width: 0;
  }
  .aromenliste .nummer {
    flex-shrink: 0;
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    font-variant-numeric: var(--zahl-features);
    color: var(--gedaempft);
  }
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
  .freitext {
    font-style: italic;
    color: var(--satz);
    font-size: var(--fs-satz);
    margin: 0 0 var(--r5);
  }
  .hinweis {
    color: var(--gedaempft);
    font-size: var(--fs-satz);
  }
</style>
