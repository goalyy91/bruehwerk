<script lang="ts">
  // Abarbeiten — Paket 06, Etappe F. Eine Flaeche je Durchgang, in
  // derselben Form wie der Alltagspfad (konzept.md:719-723): Ziel im
  // Gruppenkopf, Fuehrungswert gross, Einstellwerte darunter. Kein Urteil
  // (K57 K58) — der Shot bekommt 'okay' als Platzhalter und wird
  // nachtraeglich in der Historie korrigiert, genau der Mechanismus, den
  // Paket 05 dafuer gebaut hat (Shotblatt.svelte).
  //
  // Abgehakt wird nur auf Durchgangsebene (K2 K37). "danach" ist eine
  // ruhige Liste, "erledigt" eine Falte — kein eigenes Muster dafuer noetig,
  // Ablaufliste.svelte passt strukturell nicht (ihr Abhaken ist rein lokal,
  // ohne Rueckmeldung nach aussen, siehe Kommentar dort).

  import { bestand, schreiben } from '../bestand.svelte';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import Parameterkachel from '../../muster/Parameterkachel.svelte';
  import Werteliste from '../../muster/Werteliste.svelte';
  import Knopf from '../../muster/Knopf.svelte';
  import type { Shot } from '../../daten/schema';

  let { onZurueck, onAbgeschlossen }: { onZurueck: () => void; onAbgeschlossen: () => void } = $props();

  const bestellung = $derived(bestand.offeneBestellung());
  const geordnet = $derived(
    bestellung
      ? bestellung.durchgangIds.map((id) => bestand.durchgaenge.find((d) => d.id === id)).filter((d): d is NonNullable<typeof d> => !!d)
      : [],
  );
  const offene = $derived(geordnet.filter((d) => !d.erledigt));
  const erledigte = $derived(geordnet.filter((d) => d.erledigt));
  const aktiv = $derived(offene[0]);

  function kaffeeName(id: string): string {
    return bestand.kaffees.find((k) => k.id === id)?.name ?? 'unbekannt';
  }
  function getraenkNamen(positionIds: readonly string[]): string {
    return positionIds
      .map((id) => bestand.positionen.find((p) => p.id === id))
      .filter((p): p is NonNullable<typeof p> => !!p)
      .map((p) => bestand.getraenke.find((g) => g.id === p.getraenkId)?.name ?? '?')
      .join(' + ');
  }

  const profil = $derived(aktiv ? bestand.profile.find((p) => p.id === aktiv.profilId) : undefined);
  const bruehgeraet = $derived(profil ? bestand.bruehgeraetVon(profil.setupId) : undefined);
  const muehle = $derived(profil ? bestand.muehleVon(profil.setupId) : undefined);

  let input = $state(0);
  let mg = $state(0);
  let rpm = $state<number | undefined>(undefined);
  let kt = $state<number | undefined>(undefined);
  let output = $state(0);
  let pre = $state<number | undefined>(undefined);
  let zeit = $state(0);

  let vorherigerDurchgangId: string | undefined;
  $effect(() => {
    if (!aktiv || aktiv.id === vorherigerDurchgangId || !profil) return;
    vorherigerDurchgangId = aktiv.id;
    input = profil.ziel.input;
    mg = profil.ziel.mg;
    rpm = profil.ziel.rpm;
    kt = profil.ziel.kt;
    output = profil.ziel.output;
    pre = profil.ziel.pre;
    zeit = profil.ziel.zeit;
  });

  let erledigtFalteOffen = $state(false);
  let fehler = $state('');

  async function weiter() {
    if (!aktiv || !profil) return;
    fehler = '';
    const portionen = Math.min(3, Math.max(1, aktiv.positionIds.length)) as 1 | 2 | 3;
    const shot: Shot = {
      id: crypto.randomUUID(),
      ts: Date.now(),
      kaffeeId: aktiv.kaffeeId,
      chargeId: aktiv.chargeId,
      profilId: aktiv.profilId,
      setupId: profil.setupId,
      ist: { input, mg, rpm, kt, output, pre, zeit },
      istHerkunft: {},
      portionen,
      // K57/K58 — kein Urteil in der Bestellung. 'okay' ist ein Platzhalter,
      // keine Behauptung; die Historie (Paket 05) ist der Ort, an dem er
      // nachtraeglich korrigiert wird.
      urteil: 'okay',
      befunde: [],
    };
    try {
      await schreiben('shot', shot);
      await schreiben('durchgang', { ...aktiv, shotId: shot.id, erledigt: true });
    } catch (e) {
      fehler = e instanceof Error ? e.message : String(e);
    }
  }

  async function bestellungAbschliessen() {
    if (!bestellung) return;
    fehler = '';
    try {
      await schreiben('bestellung', { ...bestellung, status: 'abgeschlossen' });
      onAbgeschlossen();
    } catch (e) {
      fehler = e instanceof Error ? e.message : String(e);
    }
  }
</script>

<Kopfzeile titel="Abarbeiten" {onZurueck} />

{#if !bestellung}
  <p class="hinweis">Keine offene Bestellung.</p>
{:else}
  {#if erledigte.length > 0}
    <button type="button" class="falte" onclick={() => (erledigtFalteOffen = !erledigtFalteOffen)}>
      erledigt · {erledigte.length}
    </button>
    {#if erledigtFalteOffen}
      <div class="panel">
        {#each erledigte as d (d.id)}
          <p class="erledigt-zeile">{kaffeeName(d.kaffeeId)} · {getraenkNamen(d.positionIds)}</p>
        {/each}
      </div>
    {/if}
  {/if}

  {#if aktiv && profil}
    <h1>{kaffeeName(aktiv.kaffeeId)}</h1>
    <p class="meta">{profil.name} · {getraenkNamen(aktiv.positionIds)}</p>

    <div class="block">
      <p class="gruppenkopf">Ziel</p>
      <div class="parameter-raster">
        <Parameterkachel symbol="input" label="Input" wert={input} einheit="g" onAendern={(w) => (input = w)} />
        <Parameterkachel
          symbol="mahlgrad"
          label="Mahlgrad"
          wert={mg}
          einheit={muehle?.skala.typ === 'klicks' ? 'Klicks' : undefined}
          onAendern={(w) => (mg = w)}
        />
        {#if muehle?.rpmEinstellbar}
          <Parameterkachel symbol="drehzahl" label="Drehzahl" wert={rpm ?? ''} einheit="rpm" onAendern={(w) => (rpm = w)} />
        {/if}
        {#if bruehgeraet?.ktEinstellbar}
          <Parameterkachel symbol="kessel" label="Kessel" wert={kt ?? ''} einheit="°C" onAendern={(w) => (kt = w)} />
        {/if}
      </div>
    </div>

    <div class="block">
      <p class="gruppenkopf">Ergebnis</p>
      <Werteliste
        zeilen={[
          { label: 'Output', wert: output, einheit: 'g', onAendern: (w) => (output = w) },
          { label: 'Preinfusion', wert: pre ?? 0, einheit: 's', onAendern: (w) => (pre = w) },
          {
            label: bruehgeraet?.fuehrungswert === 'durchlaufzeit' ? 'Durchlaufzeit' : 'Zeit',
            wert: zeit,
            einheit: 's',
            onAendern: (w) => (zeit = w),
          },
        ]}
      />
    </div>

    {#if fehler}<p class="fehler">{fehler}</p>{/if}

    <div class="knopfreihe">
      <Knopf stufe="primaer" onKlick={weiter}>weiter · {offene[1] ? getraenkNamen(offene[1].positionIds) : 'fertig'}</Knopf>
    </div>

    {#if offene.length > 1}
      <div class="block danach">
        <p class="gruppenkopf">Danach</p>
        {#each offene.slice(1) as d (d.id)}
          <p class="danach-zeile">{kaffeeName(d.kaffeeId)} · {getraenkNamen(d.positionIds)}</p>
        {/each}
      </div>
    {/if}
  {:else}
    <p class="fertig-text">Alle Durchgänge erledigt.</p>
    {#if fehler}<p class="fehler">{fehler}</p>{/if}
    <div class="knopfreihe">
      <Knopf stufe="primaer" onKlick={bestellungAbschliessen}>Bestellung abschließen</Knopf>
    </div>
  {/if}
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
  .parameter-raster {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--r2);
  }
  .falte {
    width: 100%;
    min-height: 48px;
    border: none;
    background: var(--vertiefung);
    border-radius: var(--r-wertfeld);
    color: var(--gedaempft);
    font-family: var(--schrift);
    font-size: var(--fs-meta);
    text-align: left;
    padding: 0 var(--r3);
    cursor: pointer;
    margin-bottom: var(--r3);
  }
  .panel {
    background: var(--blatt);
    border-radius: var(--r-blatt);
    padding: var(--r3) var(--r4);
    margin-bottom: var(--r4);
  }
  .erledigt-zeile,
  .danach-zeile {
    font-size: var(--fs-meta);
    color: var(--gedaempft);
    margin: 4px 0;
  }
  .fertig-text {
    font-size: var(--fs-objekt);
    color: var(--tinte);
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
