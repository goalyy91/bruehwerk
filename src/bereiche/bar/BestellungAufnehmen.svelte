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
  import { neueId } from '../../daten/id';
  import { rangiereGetraenke, vorbelegung, begruendung, vorbelegteAntwort } from '../../domain/ranking';
  import { bohnenSchnittmenge } from '../../domain/getraenk';
  import { insBildRuecken } from '../../muster/insBildRuecken';
  import Blattliste from '../../muster/Blattliste.svelte';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import Einzelauswahl from '../../muster/Einzelauswahl.svelte';
  import VorbelegteFrage from '../../muster/VorbelegteFrage.svelte';
  import Schalter from '../../muster/Schalter.svelte';
  import Segment from '../../muster/Segment.svelte';
  import Suchfeld from '../../muster/Suchfeld.svelte';
  import Knopf from '../../muster/Knopf.svelte';
  import type { Position } from '../../daten/schema';

  let { onZurueck, onWeiterZumPlan }: { onZurueck: () => void; onWeiterZumPlan: () => void } = $props();

  // Redesign v2, Etappe 7 — zwei Aufnahme-Wege fuer dieselbe Bestellung.
  // Rueckmeldung 2026-09-06 (Etappe 9): seit der Fastway (Bar.svelte springt
  // bei einer Kachel jetzt direkt zu ShotErfassung, ohne Bestellung) ist
  // dieser Screen nur noch ueber den allgemeinen "Getraenk waehlen"-Knopf
  // erreichbar — eine Getraenk-Vorwahl gibt es dafuer nicht mehr.
  // bestellungEntwurf.svelte.ts ist seitdem verwaist (kein Aufrufer schreibt
  // noch hinein) — bewusst nicht geloescht, das ist eine eigene Entscheidung.
  // Default "person": Rueckmeldung — "für mich/andere" ist der haeufigere
  // Fall, nicht "Mengen".
  let modus = $state<'person' | 'mengen'>('person');

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
  // Fund 2026-09-06: bei komplett leerer Personenliste kollabierten beide
  // Seiten des Vergleichs auf '' und "istStandardPerson" wurde faelschlich
  // wahr — der Picker blieb dauerhaft verborgen, "Position hinzufuegen" liess
  // sich nie aktivieren. personId muss selbst existieren, nicht nur zufaellig
  // mit dem (nicht vorhandenen) Standard uebereinstimmen.
  const istStandardPerson = $derived(personId !== '' && bestand.personen.some((p) => p.standard && p.id === personId));
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
      id: neueId(),
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
  // aus dem Decay-Zaehler ueber die Positionen dieser Person,
  // geraetuebergreifend. Rechnung jetzt in domain/ranking.ts::rangiereGetraenke
  // (Paket 07) — dieselbe Quelle, die auch die Zwei-Tap-Kacheln auf dem
  // Bar-Screen nutzen, statt einer zweiten Kopie (ux-regeln.md Regel 6/12).
  //
  let getraenkId = $state('');
  const getraenkeSortiert = $derived(rangiereGetraenke(bestand.positionen, bestand.getraenke.filter((g) => g.aktiv), personId, Date.now()));
  const getraenkGewaehlt = $derived(bestand.getraenke.find((g) => g.id === getraenkId));

  // Koffein vor der Bohne (K45 K56) — 20-Positionen-Fenster dieser Person.
  let koffein = $state<'normal' | 'entkoffeiniert' | undefined>(undefined);
  const eigenePositionenChronologisch = $derived(
    bestand.positionen.filter((p) => p.personId === personId).sort((a, b) => a.ts - b.ts),
  );
  const koffeinVorbelegung = $derived(vorbelegung(eigenePositionenChronologisch.map((p) => p.koffein === 'entkoffeiniert')));

  // Rueckmeldung: eine Vorbelegung, die nur optisch markiert ist, aber einen
  // Tap braucht, um wirklich zu gelten, ist keine Vorbelegung. Deckt jetzt
  // alle drei Faelle der Tabelle ab (vorher nur den <=40%-Fall) — bei >=60%
  // ist "koffein" von hier an sofort gesetzt, VorbelegteFrage.svelte zeigt
  // die Frage trotzdem (mit "Ja" markiert), ein Tap aendert sie nur noch.
  $effect(() => {
    if (getraenkId && koffein === undefined) {
      const antwort = vorbelegteAntwort(koffeinVorbelegung);
      if (antwort !== undefined) koffein = antwort ? 'entkoffeiniert' : 'normal';
    }
  });

  // Bohne — Schnittmenge geeignetFuer x Koffein x aktiv (K45 K46).
  let kaffeeId = $state('');
  const bohnenOptionen = $derived(
    getraenkGewaehlt && koffein ? bohnenSchnittmenge(bestand.kaffees, getraenkGewaehlt.zubereitung, koffein) : [],
  );
  const bohnenGesamt = $derived(bestand.kaffees.filter((k) => k.aktiv).length);

  // Bei genau einer passenden Bohne direkt vorbelegen — bisher nur im Modus
  // "Mengen" (Zeile weiter unten), obwohl es hier genauso keine echte Wahl
  // gibt: eine Option ist keine Entscheidung, die einen Tap verdient.
  $effect(() => {
    if (bohnenOptionen.length === 1 && !kaffeeId) {
      kaffeeId = bohnenOptionen[0]!.id;
    }
  });

  // Extra Shot — nur anbieten, wenn das Getraenk ihn zulaesst.
  let extraShot = $state(false);
  /**
   * Das Getraenk sagt es jetzt selbst (2026-09-07). Vorher wurde es aus
   * Fuellmenge, Profil-Output und Mindestmenge gerechnet — drei Felder, deren
   * Zweck man der Beschriftung nicht ansah, fuer eine Entscheidung, die man
   * am Getraenk direkt setzen kann. Siehe daten/schema/getraenk.ts.
   */
  const extraShotMoeglich = $derived(getraenkGewaehlt?.extraShotMoeglich ?? false);

  // Rueckmeldung 2026-09-11: der Reset liess die Zwischenfelder schlagartig
  // verschwinden — der Scroll-Container schrumpft dabei mit, der Browser
  // klemmt die Position auf die neue (kuerzere) Hoehe, und das sieht aus wie
  // ein Sprung nach oben. Der Rueckweg zum Getraenke-Feld war schon immer
  // richtig, er geschah nur unabsichtlich hart statt sanft.
  let getraenkFeldPersonen: HTMLElement | undefined = $state();

  function zuruecksetzenFuerNaechste() {
    getraenkId = '';
    koffein = undefined;
    kaffeeId = '';
    extraShot = false;
    requestAnimationFrame(() => getraenkFeldPersonen?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
  }

  let fehler = $state('');

  async function positionHinzufuegen() {
    if (!bestellung || !getraenkId || !koffein || !kaffeeId) return;
    fehler = '';
    const neu: Position = {
      id: neueId(),
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

  // Modus "Mengen" (Etappe 7, urspruenglich "Café-Style" genannt — Rueckmeldung
  // 2026-09-06: die Bezeichnung wirkte schraeg, umbenannt): Getraenk + Menge +
  // Koffein + Bohne, keine Person. Getraenke-Rangliste ungefiltert
  // (rangiereGetraenke mit personId=undefined, siehe domain/ranking.ts) statt
  // personenbezogen.
  let mengenGetraenkId = $state('');
  let mengenAnzahl = $state(1);
  let mengenKoffein = $state<'normal' | 'entkoffeiniert'>('normal');
  let mengenKaffeeId = $state('');

  const mengenGetraenkeSortiert = $derived(rangiereGetraenke(bestand.positionen, bestand.getraenke.filter((g) => g.aktiv), undefined, Date.now()));
  const mengenGetraenkGewaehlt = $derived(bestand.getraenke.find((g) => g.id === mengenGetraenkId));
  const mengenBohnenOptionen = $derived(
    mengenGetraenkGewaehlt ? bohnenSchnittmenge(bestand.kaffees, mengenGetraenkGewaehlt.zubereitung, mengenKoffein) : [],
  );
  const mengenBohnenGesamt = $derived(bestand.kaffees.filter((k) => k.aktiv).length);

  // Bei genau einer passenden Bohne direkt vorbelegen — Modus "Mengen" soll
  // schneller sein als der personenbezogene Weg, nicht nur anders.
  $effect(() => {
    if (mengenBohnenOptionen.length === 1 && !mengenKaffeeId) {
      mengenKaffeeId = mengenBohnenOptionen[0]!.id;
    }
  });

  let getraenkFeldMengen: HTMLElement | undefined = $state();

  function mengenZuruecksetzenFuerNaechste() {
    mengenGetraenkId = '';
    mengenAnzahl = 1;
    mengenKoffein = 'normal';
    mengenKaffeeId = '';
    requestAnimationFrame(() => getraenkFeldMengen?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
  }

  async function mengenPositionenHinzufuegen() {
    if (!bestellung || !mengenGetraenkId || !mengenKaffeeId) return;
    fehler = '';
    const neueIds: string[] = [];
    try {
      for (let i = 0; i < mengenAnzahl; i++) {
        const neu: Position = {
          id: neueId(),
          getraenkId: mengenGetraenkId,
          kaffeeId: mengenKaffeeId,
          koffein: mengenKoffein,
          modifikatoren: [],
          ts: Date.now(),
        };
        await schreiben('position', neu);
        neueIds.push(neu.id);
      }
      // Ein abschliessender Schreibvorgang statt einer pro Position —
      // derselbe Zuschnitt wie BestellungPlan.svelte::abarbeitenStarten().
      await schreiben('bestellung', { ...bestellung, positionIds: [...bestellung.positionIds, ...neueIds] });
      mengenZuruecksetzenFuerNaechste();
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
    <div class="kartenblock">
      <Blattliste>
      {#each positionen as pos (pos.id)}
        <div class="position-zeile">
          <span class="haupt">
            <!-- Redesign v2, Etappe 7 — Positionen aus dem Mengen-Modus tragen
                 keine personId (keine Personenzuordnung): dann faellt die
                 Namens-Vorsilbe weg statt "unbekannt" zu zeigen. -->
            <span class="name">{pos.personId ? `${personName(pos.personId)} · ` : ''}{getraenkName(pos.getraenkId)}</span>
            <span class="meta">
              {kaffeeName(pos.kaffeeId)}
              {pos.koffein === 'entkoffeiniert' ? '· entkoffeiniert' : ''}
              {pos.modifikatoren.includes('extra-shot') ? '· Extra Shot' : ''}
            </span>
          </span>
          <button type="button" class="entfernen" onclick={() => positionEntfernen(pos)}>entfernen</button>
        </div>
      {/each}
    </Blattliste>
    </div>
  {/if}

  <div class="block">
    <!-- Redesign v2, Etappe 7 — zwei Aufnahme-Wege fuer dieselbe Bestellung
         (docs/konzept.md "Die Bestellung"). "person" bleibt Default, damit
         sich am bestehenden Zwei-Tap-Alltagspfad nichts aendert. -->
    <Segment
      optionen={[{ wert: 'person', label: 'Personen' }, { wert: 'mengen', label: 'Mengen' }]}
      wert={modus}
      onWahl={(w) => (modus = w === 'mengen' ? 'mengen' : 'person')}
    />
  </div>

  {#if modus === 'mengen'}
    <div class="block" bind:this={getraenkFeldMengen}>
      <h2>Getränk</h2>
      <Einzelauswahl
        optionen={mengenGetraenkeSortiert.map((g) => ({ wert: g.id, label: g.name }))}
        wert={mengenGetraenkId}
        onWahl={(w) => (mengenGetraenkId = w)}
      />
    </div>

    {#if mengenGetraenkId}
      <div class="block" use:insBildRuecken>
        <h2>Menge</h2>
        <div class="mengensteller">
          <button type="button" class="mengenknopf" onclick={() => (mengenAnzahl = Math.max(1, mengenAnzahl - 1))} aria-label="weniger" disabled={mengenAnzahl <= 1}>−</button>
          <span class="mengenwert">{mengenAnzahl}</span>
          <button type="button" class="mengenknopf" onclick={() => (mengenAnzahl = Math.min(20, mengenAnzahl + 1))} aria-label="mehr" disabled={mengenAnzahl >= 20}>+</button>
        </div>
      </div>

      <div class="block">
        <h2>Koffein</h2>
        <Segment
          optionen={[{ wert: 'normal', label: 'normal' }, { wert: 'entkoffeiniert', label: 'entkoffeiniert' }]}
          wert={mengenKoffein}
          onWahl={(w) => {
            mengenKoffein = w === 'entkoffeiniert' ? 'entkoffeiniert' : 'normal';
            mengenKaffeeId = '';
          }}
        />
      </div>

      <div class="block" use:insBildRuecken>
        <h2>Bohne · {mengenBohnenOptionen.length} von {mengenBohnenGesamt}</h2>
        {#if mengenBohnenOptionen.length === 0}
          <p class="hinweis">Keine passende Bohne aktiv — bei einem Kaffee unter „bearbeiten" fehlt „Geeignet für" für diese Zubereitung, oder Koffein passt nicht.</p>
        {:else}
          <Einzelauswahl optionen={mengenBohnenOptionen.map((k) => ({ wert: k.id, label: k.name }))} wert={mengenKaffeeId} onWahl={(w) => (mengenKaffeeId = w)} />
        {/if}
      </div>
    {/if}

    {#if fehler}<p class="fehler">{fehler}</p>{/if}

    <div class="knopfreihe">
      <Knopf stufe="primaer" onKlick={mengenPositionenHinzufuegen} deaktiviert={!mengenGetraenkId || !mengenKaffeeId}>
        {mengenAnzahl}× hinzufügen
      </Knopf>
    </div>

    {#if positionen.length > 0}
      <div class="knopfreihe">
        <Knopf stufe="sekundaer" onKlick={onWeiterZumPlan}>weiter zum Plan</Knopf>
      </div>
    {/if}
  {:else}
    <div class="block">
    <!-- De-emphasiert fuer den Alltagsfall "nur fuer mich" (Paket 07): die
         volle Person-Zeile erscheint nur, wenn tatsaechlich gewechselt wird
         oder schon fuer jemand anderen gilt — sonst nur ein kleiner Link,
         statt bei jedem eigenen Kaffee erneut den eigenen Namen zu zeigen. -->
    {#if personWechselnOffen || !istStandardPerson}
      <h2>Person</h2>
      <p class="person-zeile">
        <!-- personName() liefert bei unbekannter Id "unbekannt" (truthy) zurueck,
             nicht leer — die ||-Alternative griff deshalb nie. Explizit auf
             personId pruefen statt auf den Rueckgabewert der Funktion. -->
        <span class="name">{personId ? personName(personId) : 'wählen …'}</span>
        <button type="button" class="wechseln" onclick={() => (personWechselnOffen = !personWechselnOffen)}>wechseln</button>
      </p>
    {:else}
      <!-- Rueckmeldung 2026-09-08: der stille Link allein liess offen, fuer wen
           die Bestellung eigentlich laeuft — man sah nur den Ausweg, nicht den
           Zustand. Jetzt steht der Zustand da und der Ausweg daneben. Bewusst
           "mich" statt des eigenen Namens: kuerzer, und den eigenen Namen bei
           jedem Kaffee vorgesetzt zu bekommen war genau der Grund, aus dem die
           Zeile damals verschwunden ist. -->
      <p class="fuer-mich">
        <span class="wer">Für mich</span>
        <button type="button" class="fuer-andere" onclick={() => (personWechselnOffen = true)}>für jemand anderen</button>
      </p>
    {/if}
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
    <div class="block" bind:this={getraenkFeldPersonen}>
      <h2>Getränk</h2>
      <Einzelauswahl optionen={getraenkeSortiert.map((g) => ({ wert: g.id, label: g.name }))} wert={getraenkId} onWahl={(w) => (getraenkId = w)} />
    </div>
  {/if}

  {#if getraenkId && koffeinVorbelegung.frage}
    <div class="block" use:insBildRuecken>
      <VorbelegteFrage
        frage="Entkoffeiniert?"
        anteil={koffeinVorbelegung.anteil * 100}
        begruendung={begruendung(koffeinVorbelegung) ?? undefined}
        start={koffeinVorbelegung.vorbelegt ? true : undefined}
        onWahl={(ja) => (koffein = ja ? 'entkoffeiniert' : 'normal')}
      />
    </div>
  {:else if getraenkId && koffein !== undefined}
    <!-- Rückmeldung 2026-09-06: bei ≤ 40 % fragt die App laut K56 bewusst gar
         nicht erst (kein Alarmsignal ohne Inhalt) — koffein wird oben still
         auf 'normal' gesetzt. Ohne diese Zeile gab es aber keinen Weg mehr,
         es für eine einzelne Position doch zu ändern, sobald einmal eine
         Historie besteht. Derselbe leise Ausnahme-Link wie "für jemand
         anderen" oben — die stille Vorbelegung bleibt Regelfall, ein Tap
         genügt für die Ausnahme. -->
    <button type="button" class="fuer-andere koffein-umschalten" use:insBildRuecken onclick={() => (koffein = koffein === 'entkoffeiniert' ? 'normal' : 'entkoffeiniert')}>
      {koffein === 'entkoffeiniert' ? 'stattdessen normal' : 'stattdessen entkoffeiniert'}
    </button>
  {/if}

  {#if getraenkId && koffein}
    <div class="block" use:insBildRuecken>
      <h2>Bohne · {bohnenOptionen.length} von {bohnenGesamt}</h2>
      {#if bohnenOptionen.length === 0}
        <p class="hinweis">Keine passende Bohne aktiv.</p>
      {:else}
        <Einzelauswahl optionen={bohnenOptionen.map((k) => ({ wert: k.id, label: k.name }))} wert={kaffeeId} onWahl={(w) => (kaffeeId = w)} />
      {/if}
    </div>
  {/if}

  {#if kaffeeId && extraShotMoeglich}
    <div class="block" use:insBildRuecken>
      <Schalter label="Extra Shot" an={extraShot} onWahl={(a) => (extraShot = a)} />
    </div>
  {/if}

  {#if fehler}<p class="fehler">{fehler}</p>{/if}

  <div class="knopfreihe">
    <Knopf stufe="primaer" onKlick={positionHinzufuegen} deaktiviert={!getraenkId || !koffein || !kaffeeId}>Getränk hinzufügen</Knopf>
  </div>

  {#if positionen.length > 0}
    <div class="knopfreihe">
      <Knopf stufe="sekundaer" onKlick={onWeiterZumPlan}>weiter zum Plan</Knopf>
    </div>
  {/if}
  {/if}
{/if}

<style>
  /* Nur noch der Abstand — Fläche, Radius, Schatten und die Haarlinien
     zwischen den Zeilen kommen aus muster/Blattliste.svelte. Die lokale
     .panel-Kopie ist entfallen (tests/bildsprache.test.ts). */
  .kartenblock {
    margin-bottom: var(--r5);
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
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    cursor: pointer;
  }
  .block {
    margin-bottom: var(--r5);
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
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    cursor: pointer;
  }
  .fuer-mich {
    display: flex;
    align-items: baseline;
    gap: var(--r3);
    margin: 0;
  }
  .fuer-mich .wer {
    font-family: var(--schrift-sans);
    font-size: var(--fs-satz);
    color: var(--tinte);
  }
  .fuer-andere {
    border: none;
    background: none;
    padding: 0;
    color: var(--akzent);
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    cursor: pointer;
  }
  .koffein-umschalten {
    display: block;
    margin-bottom: var(--r5);
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
    font-family: var(--schrift-sans);
    font-size: var(--fs-satz);
    text-align: left;
    cursor: pointer;
  }
  /* Menge-Steller (Redesign v2, Etappe 7, Modus "Mengen") — kein eigenes
     Muster fuer einen einzigen Aufrufer, gleiche Kreisgroesse wie andere
     runde Tapflaechen im Redesign (--r-knopf-rund). */
  .mengensteller {
    display: flex;
    align-items: center;
    gap: var(--r4);
  }
  .mengenknopf {
    width: var(--r-knopf-rund);
    height: var(--r-knopf-rund);
    flex: none;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 50%;
    background: var(--vertiefung);
    color: var(--tinte);
    font-size: 20px;
    line-height: 1;
    cursor: pointer;
  }
  .mengenknopf:disabled {
    color: var(--gedaempft);
    cursor: default;
  }
  .mengenwert {
    min-width: 2ch;
    text-align: center;
    font-size: var(--fs-wert);
    font-weight: var(--gw-zahl);
    font-variant-numeric: tabular-nums;
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
