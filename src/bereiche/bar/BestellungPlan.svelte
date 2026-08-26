<script lang="ts">
  // Der Plan — Paket 06, Etappe E. Vier Dinge (konzept.md:690-698): die
  // geschaetzte Dauer, die Bezuege zugeklappt, das Verschnitt-Angebot,
  // "Abarbeiten". Keine Ansagen (K47) — kein "500er Kaennchen nehmen",
  // keine Standzeit.
  //
  // K49: nur unverplante Positionen (ohne durchgangId) werden hier
  // geplant. Bereits erledigte Durchgaenge dieser Bestellung bleiben
  // unangetastet stehen, falls waehrenddessen eine Position dazukam.

  import { bestand, schreiben } from '../bestand.svelte';
  import { planeBezuege, verschnittAngebotSichtbar, type Position as PlanPosition } from '../../domain/plan';
  import { geschaetzteDauer, reihenfolge, type ReihenfolgeDurchgang, type SetupNutzung } from '../../domain/ablauf';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import Herkunft from '../../muster/Herkunft.svelte';
  import Knopf from '../../muster/Knopf.svelte';
  import type { Durchgang, Position } from '../../daten/schema';

  let {
    onZurueck,
    onWeiterZumAbarbeiten,
    onZurueckZumAufnehmen,
  }: { onZurueck: () => void; onWeiterZumAbarbeiten: () => void; onZurueckZumAufnehmen: () => void } = $props();

  const bestellung = $derived(bestand.offeneBestellung());
  const unverplant = $derived(bestand.positionen.filter((p) => bestellung?.positionIds.includes(p.id) && !p.durchgangId));

  function kaffeeName(id: string): string {
    return bestand.kaffees.find((k) => k.id === id)?.name ?? 'unbekannt';
  }
  function getraenkName(id: string): string {
    return bestand.getraenke.find((g) => g.id === id)?.name ?? 'unbekannt';
  }
  function personName(id: string): string {
    const p = bestand.personen.find((x) => x.id === id);
    return p ? p.vorname : 'unbekannt';
  }

  // Auftrennen (konzept.md:707-715, mittlerer Weg): erzwingt fuer diese
  // Position 'ganz' statt der Getraenk-Vorgabe 'halb' — rein lokal, bis
  // "Abarbeiten" tatsaechlich Durchgaenge schreibt.
  let aufgetrennt = $state<Set<string>>(new Set());
  function auftrennen(positionId: string) {
    aufgetrennt = new Set([...aufgetrennt, positionId]);
  }

  interface Planbar {
    readonly domainPosition: PlanPosition;
    readonly position: Position;
  }

  const planbar = $derived.by((): { planbare: Planbar[]; unplanbar: { position: Position; grund: string }[] } => {
    const planbare: Planbar[] = [];
    const unplanbar: { position: Position; grund: string }[] = [];
    for (const pos of unverplant) {
      const getraenk = bestand.getraenke.find((g) => g.id === pos.getraenkId);
      if (!getraenk) {
        unplanbar.push({ position: pos, grund: 'Getränk nicht gefunden' });
        continue;
      }
      const profil = bestand.profilFuerZubereitung(pos.kaffeeId, getraenk.zubereitung);
      if (!profil) {
        unplanbar.push({ position: pos, grund: `kein Profil für ${getraenk.zubereitung} an ${kaffeeName(pos.kaffeeId)}` });
        continue;
      }
      const kaffee = bestand.kaffees.find((k) => k.id === pos.kaffeeId);
      if (!kaffee?.aktuelleChargeId) {
        unplanbar.push({ position: pos, grund: `keine aktuelle Charge an ${kaffeeName(pos.kaffeeId)}` });
        continue;
      }
      planbare.push({
        position: pos,
        domainPosition: {
          id: pos.id,
          getraenkId: pos.getraenkId,
          kaffeeId: pos.kaffeeId,
          profilId: profil.id,
          anteilBezug: aufgetrennt.has(pos.id) ? 'ganz' : getraenk.basis.anteilBezug,
          modifikatoren: pos.modifikatoren,
        },
      });
    }
    return { planbare, unplanbar };
  });

  const inputProProfil = $derived(new Map(bestand.profile.map((p) => [p.id, p.ziel.input])));
  const bezugsplan = $derived(planeBezuege(planbar.planbare.map((p) => p.domainPosition), inputProProfil));

  function positionenVon(ids: readonly string[]): Position[] {
    return ids.map((id) => planbar.planbare.find((p) => p.position.id === id)?.position).filter((p): p is Position => !!p);
  }

  // Reihenfolge + geschaetzte Dauer (domain/ablauf.ts) — je Bezug ein
  // synthetischer Schluessel, weil planeBezuege() keine eigene Id vergibt.
  const reihenfolgeEingabe = $derived(
    bezugsplan.durchgaenge.map((d, i) => {
      const profil = bestand.profile.find((p) => p.id === d.profilId);
      const bruehgeraet = profil ? bestand.bruehgeraetVon(profil.setupId) : undefined;
      const maxEmpfindlichkeit = Math.max(
        0,
        ...d.positionIds.map((id) => bestand.getraenke.find((g) => g.id === planbar.planbare.find((p) => p.position.id === id)?.position.getraenkId)?.empfindlichkeit ?? 0),
      );
      return {
        id: `${d.kaffeeId}|${d.profilId}|${i}`,
        bruehgeraetTyp: bruehgeraet?.typ ?? 'espresso',
        setupId: profil?.setupId ?? '',
        empfindlichkeit: maxEmpfindlichkeit,
        durchgang: d,
      } satisfies ReihenfolgeDurchgang & { durchgang: (typeof bezugsplan.durchgaenge)[number] };
    }),
  );
  const geordnet = $derived(reihenfolge(reihenfolgeEingabe));

  const setupNutzung = $derived.by((): SetupNutzung[] => {
    const zaehler = new Map<string, number>();
    for (const e of reihenfolgeEingabe) zaehler.set(e.setupId, (zaehler.get(e.setupId) ?? 0) + 1);
    return [...zaehler.entries()].map(([setupId, anzahlDurchgaenge]) => ({ setupId, anzahlDurchgaenge }));
  });
  const ablaufProSetup = $derived(
    new Map(bestand.setups.map((s) => [s.id, bestand.ablaufVon(s.ablaufId) ?? { schritte: [], buendel: [] }])),
  );
  const dauer = $derived(geschaetzteDauer(setupNutzung, ablaufProSetup));

  const verschnittSichtbar = $derived(verschnittAngebotSichtbar(bezugsplan));

  let fehler = $state('');

  // Die drei Wege (konzept.md:709-715) — je Durchgang mit ungenutztem
  // Anteil. "verworfen" blendet das Angebot fuer diesen Durchgang lokal
  // aus (Weg 3 ist der Ist-Zustand, dafuer gibt es nichts zu schreiben).
  let verworfen = $state<Set<string>>(new Set());
  const verschnittZeilen = $derived(geordnet.filter((e) => e.durchgang.ungenutzterAnteil > 0 && !verworfen.has(e.id)));

  async function verschnittExtraShot(eintrag: (typeof geordnet)[number]) {
    fehler = '';
    const positionId = eintrag.durchgang.positionIds[0];
    const pos = positionId ? bestand.positionen.find((p) => p.id === positionId) : undefined;
    if (!pos || pos.modifikatoren.includes('extra-shot')) return;
    try {
      await schreiben('position', { ...pos, modifikatoren: [...pos.modifikatoren, 'extra-shot'] });
    } catch (e) {
      fehler = e instanceof Error ? e.message : String(e);
    }
  }

  function verschnittVerwerfen(eintragId: string) {
    verworfen = new Set([...verworfen, eintragId]);
  }

  let aufgeklappt = $state<Set<number>>(new Set());
  function toggleAufklappen(i: number) {
    aufgeklappt = new Set(aufgeklappt.has(i) ? [...aufgeklappt].filter((x) => x !== i) : [...aufgeklappt, i]);
  }

  async function abarbeitenStarten() {
    if (!bestellung) return;
    fehler = '';
    try {
      const neueDurchgangIds: string[] = [];
      for (const eintrag of geordnet) {
        const d = eintrag.durchgang;
        const profil = bestand.profile.find((p) => p.id === d.profilId);
        const setup = profil ? bestand.setups.find((s) => s.id === profil.setupId) : undefined;
        const kaffee = bestand.kaffees.find((k) => k.id === d.kaffeeId);
        if (!profil || !setup || !kaffee?.aktuelleChargeId) continue;
        const neuerDurchgang: Durchgang = {
          id: crypto.randomUUID(),
          geraetId: setup.bruehgeraetId,
          kaffeeId: d.kaffeeId,
          chargeId: kaffee.aktuelleChargeId,
          profilId: d.profilId,
          positionIds: [...d.positionIds],
          urteilGemeinsam: true,
          erledigt: false,
        };
        await schreiben('durchgang', neuerDurchgang);
        neueDurchgangIds.push(neuerDurchgang.id);
        for (const posId of d.positionIds) {
          const pos = bestand.positionen.find((p) => p.id === posId);
          if (pos) await schreiben('position', { ...pos, durchgangId: neuerDurchgang.id });
        }
      }
      // Additiv, nicht ersetzend: kommt mitten in der Bestellung eine
      // Position dazu (K49), plant dieser Durchlauf nur die neuen
      // Durchgaenge — der bereits gezaehlte Verschnitt/die Dauer der
      // ersten Runde darf dabei nicht verloren gehen.
      await schreiben('bestellung', {
        ...bestellung,
        durchgangIds: [...bestellung.durchgangIds, ...neueDurchgangIds],
        dauerGeschaetzt: bestellung.dauerGeschaetzt + dauer,
        verschnitt: bestellung.verschnitt + bezugsplan.verschnittGramm,
      });
      onWeiterZumAbarbeiten();
    } catch (e) {
      fehler = e instanceof Error ? e.message : String(e);
    }
  }
</script>

<Kopfzeile titel="Plan" {onZurueck} />

{#if !bestellung}
  <p class="hinweis">Keine offene Bestellung.</p>
{:else}
  <div class="dauer-block">
    {#if dauer > 0}
      <Herkunft art="geschaetzt" wert={`${Math.round(dauer / 60)}`} einheit="min" fuehrung />
    {:else}
      <p class="hinweis">keine Rüstzeiten hinterlegt</p>
    {/if}
  </div>

  {#if planbar.unplanbar.length > 0}
    <p class="fehler">
      {#each planbar.unplanbar as u (u.position.id)}
        {personName(u.position.personId)} · {getraenkName(u.position.getraenkId)} — {u.grund}<br />
      {/each}
    </p>
  {/if}

  <div class="panel">
    {#each geordnet as eintrag, i (eintrag.id)}
      {@const d = eintrag.durchgang}
      {@const beteiligtePositionen = positionenVon(d.positionIds)}
      <div class="bezug-zeile">
        <button type="button" class="bezug-kopf" onclick={() => toggleAufklappen(i)}>
          <span class="name">{kaffeeName(d.kaffeeId)}</span>
          <span class="meta">
            {beteiligtePositionen.length} {beteiligtePositionen.length === 1 ? 'Portion' : 'Portionen'}
            {d.ungenutzterAnteil > 0 ? '· Verschnitt' : ''}
          </span>
        </button>
        {#if aufgeklappt.has(i)}
          <div class="bezug-details">
            {#each beteiligtePositionen as pos (pos.id)}
              <p class="detail-zeile">
                {personName(pos.personId)} · {getraenkName(pos.getraenkId)}
                {pos.modifikatoren.includes('extra-shot') ? '· Extra Shot' : ''}
              </p>
            {/each}
            {#if beteiligtePositionen.length === 2 && !beteiligtePositionen.some((p) => p.modifikatoren.includes('extra-shot'))}
              <button type="button" class="auftrennen" onclick={() => auftrennen(beteiligtePositionen[0]!.id)}>auftrennen</button>
            {/if}
          </div>
        {/if}
      </div>
    {/each}
  </div>

  {#if verschnittSichtbar}
    {#each verschnittZeilen as eintrag (eintrag.id)}
      <div class="verschnitt-block">
        <p class="verschnitt-text">Double Shot sinnvoll verwenden</p>
        <div class="verschnitt-wege">
          <button type="button" class="verschnitt-weg" onclick={() => verschnittExtraShot(eintrag)}>Extra Shot</button>
          <button type="button" class="verschnitt-weg" onclick={onZurueckZumAufnehmen}>eigene Position</button>
          <button type="button" class="verschnitt-weg" onclick={() => verschnittVerwerfen(eintrag.id)}>verwerfen</button>
        </div>
      </div>
    {/each}
  {/if}

  {#if fehler}<p class="fehler">{fehler}</p>{/if}

  <div class="knopfreihe">
    <Knopf stufe="primaer" onKlick={abarbeitenStarten} deaktiviert={geordnet.length === 0}>Abarbeiten</Knopf>
  </div>
{/if}

<style>
  .dauer-block {
    margin-bottom: var(--r5);
  }
  .panel {
    background: var(--blatt);
    border-radius: var(--r-blatt);
    padding: 0 var(--r4);
    margin-bottom: var(--r4);
    display: flex;
    flex-direction: column;
  }
  .panel > :not(:first-child) {
    border-top: 1px solid var(--linie);
  }
  .bezug-zeile {
    display: flex;
    flex-direction: column;
  }
  .bezug-kopf {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--r3);
    min-height: 60px;
    border: none;
    background: transparent;
    font-family: var(--schrift);
    text-align: left;
    cursor: pointer;
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
  .bezug-details {
    padding: 0 0 var(--r3);
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .detail-zeile {
    font-size: var(--fs-meta);
    color: var(--satz);
    margin: 0;
  }
  .auftrennen {
    align-self: flex-start;
    border: none;
    background: none;
    color: var(--akzent);
    font-family: var(--schrift);
    font-size: var(--fs-meta);
    cursor: pointer;
    padding: var(--r1) 0;
  }
  .verschnitt-block {
    min-height: var(--treffer);
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: var(--r2);
    color: var(--gedaempft);
    font-size: var(--fs-meta);
    margin: 0 0 var(--r4);
  }
  .verschnitt-text {
    margin: 0;
  }
  .verschnitt-wege {
    display: flex;
    gap: var(--r3);
  }
  .verschnitt-weg {
    border: none;
    background: none;
    color: var(--akzent);
    font-family: var(--schrift);
    font-size: var(--fs-meta);
    cursor: pointer;
    padding: 0;
  }
  .hinweis {
    color: var(--gedaempft);
    font-size: var(--fs-satz);
  }
  .fehler {
    color: var(--kritisch);
    font-size: var(--fs-meta);
    margin-bottom: var(--r3);
  }
  .knopfreihe {
    margin-top: var(--r4);
  }
</style>
