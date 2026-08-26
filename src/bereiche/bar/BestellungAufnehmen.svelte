<script lang="ts">
  // Bestellung aufnehmen — Paket 06, Etappe E. Reihenfolge Person -> Getraenk
  // -> Koffein -> Bohne ist der Punkt (konzept.md:681) — jeder Schritt
  // erscheint erst, wenn der vorherige beantwortet ist. Aufgenommene
  // Positionen liegen in einer Falte oben und bleiben aenderbar
  // (entfernen), K60.
  //
  // Koffein vor der Bohne (K45): erst entscheidet sich koffeinhaltig oder
  // nicht, dann zeigt die Bohnenliste nur noch die Schnittmenge.

  import { bestand, schreiben, loeschen } from '../bestand.svelte';
  import { score } from '../../domain/ranking';
  import { vorbelegung, begruendung } from '../../domain/ranking';
  import { bohnenSchnittmenge, milchAusFuellmenge, extraShotErlaubt } from '../../domain/getraenk';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import Einzelauswahl from '../../muster/Einzelauswahl.svelte';
  import VorbelegteFrage from '../../muster/VorbelegteFrage.svelte';
  import Schalter from '../../muster/Schalter.svelte';
  import Suchfeld from '../../muster/Suchfeld.svelte';
  import Knopf from '../../muster/Knopf.svelte';
  import type { Position } from '../../daten/schema';

  let { onZurueck, onWeiterZumPlan }: { onZurueck: () => void; onWeiterZumPlan: () => void } = $props();

  const bestellung = $derived(bestand.offeneBestellung());
  const positionen = $derived(bestand.positionen.filter((p) => bestellung?.positionIds.includes(p.id)));

  function personName(id: string): string {
    const p = bestand.personen.find((x) => x.id === id);
    return p ? `${p.vorname}${p.nachname ? ` ${p.nachname}` : ''}` : 'unbekannt';
  }
  function getraenkName(id: string): string {
    return bestand.getraenke.find((g) => g.id === id)?.name ?? 'unbekannt';
  }
  function kaffeeName(id: string): string {
    return bestand.kaffees.find((k) => k.id === id)?.name ?? 'unbekannt';
  }

  async function positionEntfernen(pos: Position) {
    if (!bestellung) return;
    fehler = '';
    try {
      await loeschen('position', pos.id);
      await schreiben('bestellung', { ...bestellung, positionIds: bestellung.positionIds.filter((id) => id !== pos.id) });
    } catch (e) {
      fehler = e instanceof Error ? e.message : String(e);
    }
  }

  // Person — Standard vorbelegt, "wechseln" zeigt bis zu vier + Suchzeile
  // (konzept.md:683, :1042). Bleibt ueber mehrere hinzugefuegte Positionen
  // hinweg stehen, damit mehrere Getraenke fuer dieselbe Person schnell
  // hintereinander gehen.
  let personId = $state(bestand.personen.find((p) => p.standard)?.id ?? bestand.personen[0]?.id ?? '');
  let personWechselnOffen = $state(false);
  let personSuchtext = $state('');
  const personenKurzliste = $derived(bestand.personen.filter((p) => p.aktiv).slice(0, 4));
  const personGefiltert = $derived(
    bestand.personen.filter((p) => `${p.vorname} ${p.nachname ?? ''}`.toLowerCase().includes(personSuchtext.trim().toLowerCase())),
  );

  async function personAnlegenUndWaehlen() {
    const vorname = personSuchtext.trim();
    if (!vorname) return;
    const neu = {
      id: crypto.randomUUID(),
      vorname,
      aktiv: true,
      standard: bestand.personen.length === 0,
      favoriten: [],
      koffeinAnteil: 0,
      extraShotAnteil: 0,
    };
    await schreiben('person', neu);
    personId = neu.id;
    personWechselnOffen = false;
    personSuchtext = '';
  }

  // Getraenk — Rangliste ohne Score im Bild (konzept.md:684), Reihenfolge
  // aus dem Decay-Zaehler ueber die Positionen dieser Person, geraetuebergreifend.
  let getraenkId = $state('');
  const getraenkeSortiert = $derived.by(() => {
    const eigenePositionen = bestand.positionen.filter((p) => p.personId === personId);
    const zeitenJeGetraenk = new Map<string, number[]>();
    for (const p of eigenePositionen) {
      const liste = zeitenJeGetraenk.get(p.getraenkId) ?? [];
      liste.push(p.ts);
      zeitenJeGetraenk.set(p.getraenkId, liste);
    }
    const jetzt = Date.now();
    return bestand.getraenke
      .filter((g) => g.aktiv)
      .map((g) => ({ getraenk: g, score: score(zeitenJeGetraenk.get(g.id) ?? [], jetzt) }))
      .sort((a, b) => b.score - a.score)
      .map((e) => e.getraenk);
  });
  const getraenkGewaehlt = $derived(bestand.getraenke.find((g) => g.id === getraenkId));

  // Koffein vor der Bohne (K45 K56) — 20-Positionen-Fenster dieser Person.
  let koffein = $state<'normal' | 'entkoffeiniert' | undefined>(undefined);
  const eigenePositionenChronologisch = $derived(
    bestand.positionen.filter((p) => p.personId === personId).sort((a, b) => a.ts - b.ts),
  );
  const koffeinVorbelegung = $derived(vorbelegung(eigenePositionenChronologisch.map((p) => p.koffein === 'entkoffeiniert')));

  $effect(() => {
    if (getraenkId && koffein === undefined && !koffeinVorbelegung.frage) {
      koffein = 'normal';
    }
  });

  // Bohne — Schnittmenge geeignetFuer x Koffein x aktiv (K45 K46).
  let kaffeeId = $state('');
  const bohnenOptionen = $derived(
    getraenkGewaehlt && koffein ? bohnenSchnittmenge(bestand.kaffees, getraenkGewaehlt.zubereitung, koffein) : [],
  );
  const bohnenGesamt = $derived(bestand.kaffees.filter((k) => k.aktiv).length);

  // Extra Shot — nur anbieten, wenn die Ausgleichszutat nicht unter ihre
  // Mindestmenge faellt (konzept.md:923).
  let extraShot = $state(false);
  const profilFuerPosition = $derived(
    kaffeeId && getraenkGewaehlt ? bestand.profilFuerZubereitung(kaffeeId, getraenkGewaehlt.zubereitung) : undefined,
  );
  const extraShotMoeglich = $derived.by(() => {
    if (!getraenkGewaehlt) return false;
    if (getraenkGewaehlt.ausgleich === null) return true;
    if (!profilFuerPosition) return false;
    const ausgleichOhneExtra = milchAusFuellmenge(getraenkGewaehlt.fuellmenge, profilFuerPosition.ziel.output);
    return extraShotErlaubt(ausgleichOhneExtra, getraenkGewaehlt.mindestAusgleich);
  });

  function zuruecksetzenFuerNaechste() {
    getraenkId = '';
    koffein = undefined;
    kaffeeId = '';
    extraShot = false;
  }

  let fehler = $state('');

  async function positionHinzufuegen() {
    if (!bestellung || !getraenkId || !koffein || !kaffeeId) return;
    fehler = '';
    const neu: Position = {
      id: crypto.randomUUID(),
      personId,
      getraenkId,
      kaffeeId,
      koffein,
      modifikatoren: extraShot ? ['extra-shot'] : [],
      ts: Date.now(),
    };
    try {
      await schreiben('position', neu);
      await schreiben('bestellung', { ...bestellung, positionIds: [...bestellung.positionIds, neu.id] });
      zuruecksetzenFuerNaechste();
    } catch (e) {
      fehler = e instanceof Error ? e.message : String(e);
    }
  }
</script>

<Kopfzeile titel="Bestellung" {onZurueck} />

{#if !bestellung}
  <p class="hinweis">Keine offene Bestellung.</p>
{:else}
  {#if positionen.length > 0}
    <div class="panel">
      {#each positionen as pos (pos.id)}
        <div class="position-zeile">
          <span class="haupt">
            <span class="name">{personName(pos.personId)} · {getraenkName(pos.getraenkId)}</span>
            <span class="meta">
              {kaffeeName(pos.kaffeeId)}
              {pos.koffein === 'entkoffeiniert' ? '· entkoffeiniert' : ''}
              {pos.modifikatoren.includes('extra-shot') ? '· Extra Shot' : ''}
            </span>
          </span>
          <button type="button" class="entfernen" onclick={() => positionEntfernen(pos)}>entfernen</button>
        </div>
      {/each}
    </div>
  {/if}

  <div class="block">
    <p class="gruppenkopf">Person</p>
    <p class="person-zeile">
      <span class="name">{personName(personId) || 'wählen …'}</span>
      <button type="button" class="wechseln" onclick={() => (personWechselnOffen = !personWechselnOffen)}>wechseln</button>
    </p>
    {#if personWechselnOffen}
      <Einzelauswahl
        optionen={personenKurzliste.map((p) => ({ wert: p.id, label: p.vorname }))}
        wert={personId}
        onWahl={(w) => {
          personId = w;
          personWechselnOffen = false;
        }}
      />
      <div class="suchzeile">
        <Suchfeld wert={personSuchtext} onWert={(w) => (personSuchtext = w)} platzhalter="jemand anders …" />
      </div>
      {#if personSuchtext.trim()}
        {#each personGefiltert as p (p.id)}
          <button
            type="button"
            class="anlegen-zeile"
            onclick={() => {
              personId = p.id;
              personWechselnOffen = false;
              personSuchtext = '';
            }}
          >
            {p.vorname}
          </button>
        {/each}
        {#if !personGefiltert.some((p) => p.vorname.toLowerCase() === personSuchtext.trim().toLowerCase())}
          <button type="button" class="anlegen-zeile" onclick={personAnlegenUndWaehlen}>+ „{personSuchtext.trim()}“ anlegen</button>
        {/if}
      {/if}
    {/if}
  </div>

  {#if personId}
    <div class="block">
      <p class="gruppenkopf">Getränk</p>
      <Einzelauswahl optionen={getraenkeSortiert.map((g) => ({ wert: g.id, label: g.name }))} wert={getraenkId} onWahl={(w) => (getraenkId = w)} />
    </div>
  {/if}

  {#if getraenkId && koffeinVorbelegung.frage}
    <div class="block">
      <VorbelegteFrage
        frage="Entkoffeiniert?"
        anteil={koffeinVorbelegung.anteil * 100}
        begruendung={begruendung(koffeinVorbelegung) ?? undefined}
        start={koffeinVorbelegung.vorbelegt ? true : undefined}
        onWahl={(ja) => (koffein = ja ? 'entkoffeiniert' : 'normal')}
      />
    </div>
  {/if}

  {#if getraenkId && koffein}
    <div class="block">
      <p class="gruppenkopf">Bohne · {bohnenOptionen.length} von {bohnenGesamt}</p>
      {#if bohnenOptionen.length === 0}
        <p class="hinweis">Keine passende Bohne aktiv.</p>
      {:else}
        <Einzelauswahl optionen={bohnenOptionen.map((k) => ({ wert: k.id, label: k.name }))} wert={kaffeeId} onWahl={(w) => (kaffeeId = w)} />
      {/if}
    </div>
  {/if}

  {#if kaffeeId && extraShotMoeglich}
    <div class="block">
      <Schalter label="Extra Shot" an={extraShot} onWahl={(a) => (extraShot = a)} />
    </div>
  {/if}

  {#if fehler}<p class="fehler">{fehler}</p>{/if}

  <div class="knopfreihe">
    <Knopf stufe="primaer" onKlick={positionHinzufuegen} deaktiviert={!getraenkId || !koffein || !kaffeeId}>Position hinzufügen</Knopf>
  </div>

  {#if positionen.length > 0}
    <div class="knopfreihe">
      <Knopf stufe="sekundaer" onKlick={onWeiterZumPlan}>weiter zum Plan</Knopf>
    </div>
  {/if}
{/if}

<style>
  .panel {
    background: var(--blatt);
    border-radius: var(--r-blatt);
    padding: 0 var(--r4);
    margin-bottom: var(--r5);
    display: flex;
    flex-direction: column;
  }
  .panel > :not(:first-child) {
    border-top: 1px solid var(--linie);
  }
  .position-zeile {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--r3);
    min-height: 60px;
  }
  .haupt {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .name {
    font-size: var(--fs-bedienwort);
    color: var(--tinte);
  }
  .meta {
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  .entfernen {
    flex: none;
    border: none;
    background: none;
    color: var(--kritisch);
    font-family: var(--schrift);
    font-size: var(--fs-meta);
    cursor: pointer;
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
  .person-zeile {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0 0 var(--r3);
  }
  .person-zeile .name {
    font-size: var(--fs-objekt);
    color: var(--tinte);
  }
  .wechseln {
    border: none;
    background: none;
    color: var(--akzent);
    font-family: var(--schrift);
    font-size: var(--fs-meta);
    cursor: pointer;
  }
  .suchzeile {
    margin: var(--r3) 0;
  }
  .anlegen-zeile {
    display: flex;
    width: 100%;
    min-height: 48px;
    border: none;
    background: transparent;
    color: var(--akzent);
    font-family: var(--schrift);
    font-size: var(--fs-satz);
    text-align: left;
    cursor: pointer;
  }
  .hinweis {
    color: var(--gedaempft);
    font-size: var(--fs-satz);
  }
  .fehler {
    color: var(--kritisch);
    font-size: var(--fs-satz);
    margin-bottom: var(--r3);
  }
  .knopfreihe {
    margin-top: var(--r4);
  }
</style>
