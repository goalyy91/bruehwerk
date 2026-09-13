<script lang="ts">
  // Uebungsmodus — Aromapaket, Etappe 6 (Neubau nach Lastenheft, docs/konzept.md
  // "Übungsmodus"). Ersetzt die erste Fassung (offene Nummer vor der Antwort)
  // durch verdecktes Ziehen: die App legt zwölf Fläschchennummern fest — acht
  // abgefragt, vier Zusatzfläschchen —, du legst sie so bereit, dass du beim
  // Greifen nicht siehst, welches du erwischst, und tippst deine Antwort, bevor
  // du die Nummer abliest. Vier Phasen, ein Bildschirm: Übersicht → Bereitlegen
  // → Item (×8) → Ende. Kein neuer Screen/keine neue Route dafür — genau wie
  // die erste Fassung das Datenblatt-Overlay mit einem eigenen $state-Feld
  // gelöst hat, nicht mit einer zweiten Navigations-Ebene.
  //
  // Die Form je Item (Familie / Familie-dann-Aroma / freier Abruf) kommt aus
  // `item.formQuelleId` — dem Aroma an dieser Stelle von `durchgang.abgefragt`
  // — und dessen Stufe (`domain/uebung.ts::effektiverZustand`, zum
  // Planungszeitpunkt aufgelöst). Wichtig: **das ist keine Vorhersage, welches
  // Fläschchen gleich gezogen wird**, nur ein Mittel, überhaupt vorab eine
  // Form zeigen zu können. Bei einem echten blinden Griff aus zwölf
  // ununterscheidbaren Fläschchen ist es sogar der Regelfall, dass ein
  // *anderes* Aroma gezogen wird als das, dessen Stufe die Form geliefert hat
  // — nicht die Ausnahme. `domain/uebung.ts::werteAntwortAus` wertet deshalb
  // immer gegen das TATSÄCHLICHE, aufgedeckte Aroma aus, nie gegen die Quelle
  // der Form (siehe dort, Kopfkommentar zu `AntwortEingabe`).
  //
  // `unerwarteteNummer` ist etwas anderes als dieser Regelfall: es feuert nur,
  // wenn die abgelesene Nummer zu keinem der zwölf verdeckten Fläschchen
  // dieses Durchgangs gehört — ein echter, seltener Fehler beim Bereitlegen
  // (Lastenheft Abschnitt 10, Punkt 5), kein normales Ziehergebnis.
  //
  // Was während eines Items nie zu sehen ist: die Nummer des laufenden
  // Fläschchens (nur "3 von 8"), und die Antwort-/Nummernliste ist immer die
  // volle, unsortierte 60er-Liste — nie nur die zwölf dieses Durchgangs. Beides
  // würde den Kandidatenkreis verraten (CLAUDE.md, "Übungsmodus: verdecktes
  // Ziehen, keine offene Nummer").
  import { bestand, schreiben } from '../bestand.svelte';
  import { neueId } from '../../daten/id';
  import { flaeschchenId } from '../../daten/aromen';
  import type { SammlungWert } from '../../daten/ablage';
  import {
    planeDurchgang,
    effektiverZustand,
    werteAntwortAus,
    DURCHGANG_GROESSE,
    type AromaOption,
    type GesamtStand,
  } from '../../domain/uebung';
  import { einfuehrungErlaubt } from '../../domain/leitner';
  import { datenblattZu, type AromaDatenblatt } from '../../daten/aroma-datenblaetter';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import AuswahlListe from '../../muster/AuswahlListe.svelte';
  import Knopf from '../../muster/Knopf.svelte';
  import Werteliste from '../../muster/Werteliste.svelte';
  import Aromadatenblatt from '../aromen/Aromadatenblatt.svelte';

  let { onZurueck }: { onZurueck: () => void } = $props();

  // Der Uebungsmodus fragt Flaeschchennummern ab — das ergibt nur bei einem
  // Set mit vialNummern einen Sinn. Heute ohnehin nur AROMASET_LENEZ.
  const set = $derived(bestand.aromasets.find((a) => a.vialNummern));

  const alleAromen = $derived<AromaOption[]>(
    (set?.kategorien ?? []).flatMap((k) =>
      k.gruppen.flatMap((g) =>
        g.aromen
          .filter((a) => a.nummer !== undefined)
          .map((a) => ({
            id: a.id,
            label: a.label,
            nummer: a.nummer,
            kategorieId: k.id,
            verwandte: datenblattZu(a.nummer!)?.verwandte.map((v) => flaeschchenId(v.nummer)),
          })),
      ),
    ),
  );

  /** Die neun Familien in Kartenreihenfolge (Blumig zuerst, Süß zuletzt) — dieselbe Reihenfolge wie im Aromarad. */
  const familien = $derived((set?.kategorien ?? []).map((k) => ({ wert: k.id, label: k.label })));

  function familieVon(kategorieId: string | undefined): string {
    return familien.find((f) => f.wert === kategorieId)?.label ?? '';
  }

  function standVon(aromaId: string): GesamtStand | undefined {
    return bestand.uebungen.find((u) => u.setId === set?.id && u.aromaId === aromaId);
  }
  const staende = $derived(new Map(alleAromen.map((a) => [a.id, standVon(a.id)] as const)));
  // Ohne die (nicht vorhandenen) Eintraege — domain/uebung.ts erwartet eine
  // Map, die nur bekannte Staende traegt, und behandelt "kein Eintrag" schon
  // selbst wie "nie geuebt" (effektiverZustand). Ein Wert `undefined` UNTER
  // einem vorhandenen Schluessel waere etwas anderes als ein fehlender
  // Schluessel und muss deshalb hier herausgefiltert werden.
  const bekannteStaende = $derived(
    new Map([...staende].filter((eintrag): eintrag is [string, GesamtStand] => eintrag[1] !== undefined)),
  );

  // Alle 60, in ihrer natürlichen Nummernfolge — dieselbe Liste für Antwort
  // (Stufe C) und Nummerneingabe, nie eine auf die zwölf des Durchgangs
  // verkürzte. Nummern-Label trägt zusätzlich den Namen: nach dem Riechen und
  // Tippen ist der Name kein Geheimnis mehr, und das erleichtert das Finden
  // der richtigen Zeile beim Ablesen.
  const alleNachNummer = $derived([...alleAromen].sort((a, b) => (a.nummer ?? 0) - (b.nummer ?? 0)));
  const nummernOptionen = $derived(alleNachNummer.map((a) => ({ wert: a.id, label: `Nr. ${a.nummer} — ${a.label}` })));
  const namenOptionen = $derived(alleAromen.map((a) => ({ wert: a.id, label: a.label })));

  // ---- Übersicht: Boxenverteilung als ruhige Auskunft, keine Farbe (K69) ---

  let uebersichtJetzt = $state(Date.now());
  $effect(() => {
    if (phase === 'uebersicht') uebersichtJetzt = Date.now();
  });

  const zustaende = $derived(alleAromen.map((a) => effektiverZustand(staende.get(a.id), uebersichtJetzt)));
  const eingefuehrteZustaende = $derived(zustaende.filter((z) => z.eingefuehrt));
  const boxenZeilen = $derived(
    ([1, 2, 3, 4, 5] as const).map((box) => ({
      label: `Box ${box}`,
      wert: eingefuehrteZustaende.filter((z) => z.box === box).length,
    })),
  );
  const sperreAktiv = $derived(!einfuehrungErlaubt(eingefuehrteZustaende.map((z) => z.box)));

  // ---- Phasen: Übersicht → Bereitlegen → Item (×8) → Ende ------------------

  type Phase = 'uebersicht' | 'bereitlegen' | 'item' | 'ende';
  let phase = $state<Phase>('uebersicht');
  let durchgang = $state<SammlungWert['uebungsdurchgang'] | undefined>(undefined);
  let index = $state(0);
  let fehler = $state('');
  let datenblatt = $state<AromaDatenblatt | undefined>(undefined);

  async function durchgangStarten() {
    if (!set) return;
    const jetzt = Date.now();
    const plan = planeDurchgang(alleAromen, bekannteStaende, jetzt);
    const neu: SammlungWert['uebungsdurchgang'] = {
      id: neueId(),
      setId: set.id,
      art: 'normal',
      status: 'bereitlegen',
      verdeckt: [...plan.abgefragt, ...plan.zusatz].map((a) => a.id),
      abgefragt: plan.abgefragt.map((a) => a.id),
      zusatz: plan.zusatz.map((a) => a.id),
      beantwortet: [],
      begonnenAm: jetzt,
    };
    try {
      await schreiben('uebungsdurchgang', neu);
      durchgang = neu;
      phase = 'bereitlegen';
    } catch (e) {
      fehler = e instanceof Error ? e.message : String(e);
    }
  }

  // Nummern der zwölf Verdeckten, aufsteigend — reine Anzeige fürs
  // Bereitlegen, nie Namen (die verrieten mehr, als das Lastenheft für diesen
  // Schritt als unproblematisch nennt: "die Zuordnung Reihenfolge → Nummer
  // unbekannt" reicht, eine Namensliste wäre etwas anderes).
  const bereitlegenNummern = $derived(
    (durchgang?.verdeckt ?? [])
      .map((id) => alleAromen.find((a) => a.id === id)?.nummer)
      .filter((n): n is number => n !== undefined)
      .sort((a, b) => a - b),
  );

  async function bereitgelegt() {
    if (!durchgang) return;
    const aktualisiert: SammlungWert['uebungsdurchgang'] = { ...durchgang, status: 'laufend' };
    try {
      await schreiben('uebungsdurchgang', aktualisiert);
      durchgang = aktualisiert;
      index = 0;
      naechstesItemVorbereiten();
      phase = 'item';
    } catch (e) {
      fehler = e instanceof Error ? e.message : String(e);
    }
  }

  // ---- Ein Item: raten → nummer → aufgeloest --------------------------------

  interface AktuellesItem {
    /** Das Aroma, dessen Stufe die Form dieses Platzes bestimmt hat — keine Vorhersage, was gezogen wird (siehe Kopfkommentar). */
    readonly formQuelleId: string;
    readonly formStufe: 'a' | 'b' | 'c';
  }
  let item = $state<AktuellesItem | undefined>(undefined);
  let itemPhase = $state<'raten' | 'nummer' | 'aufgeloest'>('raten');
  let itemBegonnenAm = $state(0);

  let tipFamilie = $state('');
  let tipAroma = $state('');
  let tipNummer = $state('');

  interface LetzteAuswertung {
    readonly ergebnis: 'richtig' | 'teilweise' | 'falsch';
    readonly tatsaechlicheOption: AromaOption;
    readonly unerwarteteNummer: boolean;
  }
  let letzteAuswertung = $state<LetzteAuswertung | undefined>(undefined);

  function naechstesItemVorbereiten() {
    if (!durchgang) return;
    const id = durchgang.abgefragt[index];
    if (!id) {
      phase = 'ende';
      return;
    }
    const stufe = effektiverZustand(staende.get(id), Date.now()).stufe;
    item = { formQuelleId: id, formStufe: stufe };
    itemPhase = 'raten';
    itemBegonnenAm = Date.now();
    tipFamilie = '';
    tipAroma = '';
    tipNummer = '';
    letzteAuswertung = undefined;
  }

  const tippVollstaendig = $derived(
    item?.formStufe === 'a'
      ? tipFamilie !== ''
      : item?.formStufe === 'b'
        ? tipFamilie !== '' && tipAroma !== ''
        : tipAroma !== '',
  );

  const aromenDerGewaehltenFamilie = $derived(
    tipFamilie ? alleAromen.filter((a) => a.kategorieId === tipFamilie).map((a) => ({ wert: a.id, label: a.label })) : [],
  );

  function familieGewaehlt(wert: string) {
    tipFamilie = wert;
    tipAroma = ''; // eine neue Familie macht die vorige Aroma-Wahl ungueltig
  }

  function zurNummer() {
    itemPhase = 'nummer';
  }

  // ---- Riechpause: die eine Ausnahme von "kein Timer" (CLAUDE.md) ---------

  const PAUSE_SEKUNDEN = 25;
  let pauseRest = $state(0);
  let pauseHandle: ReturnType<typeof setInterval> | undefined;

  function starteRiechpause() {
    clearInterval(pauseHandle);
    pauseRest = PAUSE_SEKUNDEN;
    pauseHandle = setInterval(() => {
      pauseRest = Math.max(0, pauseRest - 1);
      if (pauseRest === 0 && pauseHandle) {
        clearInterval(pauseHandle);
        pauseHandle = undefined;
      }
    }, 1000);
  }

  $effect(() => {
    return () => clearInterval(pauseHandle);
  });

  async function aufloesen() {
    if (!durchgang || !item || !set || !tipNummer) return;
    const tatsaechlicheId = tipNummer;
    const tatsaechlicheOption = alleAromen.find((a) => a.id === tatsaechlicheId);
    if (!tatsaechlicheOption) return;
    const tatsaechlicherStand = staende.get(tatsaechlicheId);
    const jetzt = Date.now();

    const auswertung = werteAntwortAus(
      {
        formStufe: item.formStufe,
        tipFamilieId: tipFamilie || undefined,
        tipAromaId: tipAroma || undefined,
        tatsaechlicheAromaId: tatsaechlicheId,
        tatsaechlicheFamilieId: tatsaechlicheOption.kategorieId,
        tatsaechlicherStand,
      },
      jetzt,
    );
    // Ein echter Bereitlegen-Fehler (Lastenheft Abschnitt 10, Punkt 5) — die
    // abgelesene Nummer gehoert zu keinem der zwoelf verdeckten Flaeschchen
    // dieses Durchgangs. NICHT dasselbe wie "ein anderes als item.formQuelleId
    // gezogen" — das ist bei blindem Ziehen der Regelfall, siehe Kopfkommentar,
    // und verdient keine Meldung.
    const unerwarteteNummer = !durchgang.verdeckt.includes(tatsaechlicheId);

    // Verwechslungsliste nur, wenn wirklich ein falsches Aroma benannt wurde
    // (Stufe B/C) — bei Stufe A gibt es keinen konkreten falschen Namen,
    // nur eine falsche Familie, die keine Verwechslungs-Eintragung traegt.
    const verwechslungenBisher = tatsaechlicherStand?.verwechslungen ?? {};
    const verwechslungen =
      auswertung.ergebnis !== 'richtig' && tipAroma && tipAroma !== tatsaechlicheId
        ? { ...verwechslungenBisher, [tipAroma]: (verwechslungenBisher[tipAroma] ?? 0) + 1 }
        : verwechslungenBisher;

    try {
      const bisherigeUebung = bestand.uebungen.find((u) => u.setId === set!.id && u.aromaId === tatsaechlicheId);
      await schreiben('uebung', {
        id: bisherigeUebung?.id ?? neueId(),
        setId: set.id,
        aromaId: tatsaechlicheId,
        benennen: bisherigeUebung?.benennen ?? { versuche: 0, treffer: 0 },
        unterscheiden: bisherigeUebung?.unterscheiden ?? { versuche: 0, treffer: 0 },
        verwechslungen,
        letzterVersuch: jetzt,
        box: auswertung.box,
        faellig: auswertung.faellig,
        stufe: auswertung.stufe,
        familienSerie: auswertung.familienSerie,
      });

      await schreiben('uebungsantwort', {
        id: neueId(),
        durchgangId: durchgang.id,
        setId: set.id,
        aromaId: tatsaechlicheId,
        getipptId: item.formStufe === 'a' ? undefined : tipAroma || undefined,
        form: item.formStufe === 'a' ? 'familie' : item.formStufe === 'b' ? 'aromaInFamilie' : 'freierAbruf',
        stufe: item.formStufe,
        ergebnis: auswertung.ergebnis,
        zeitstempel: jetzt,
        antwortdauerMs: Math.max(0, jetzt - itemBegonnenAm),
        unerwarteteNummer,
      });

      const beantwortet = [...durchgang.beantwortet, tatsaechlicheId];
      const abgeschlossen = beantwortet.length >= durchgang.abgefragt.length;
      const durchgangAktualisiert: SammlungWert['uebungsdurchgang'] = {
        ...durchgang,
        beantwortet,
        status: abgeschlossen ? 'abgeschlossen' : durchgang.status,
        abgeschlossenAm: abgeschlossen ? jetzt : undefined,
      };
      await schreiben('uebungsdurchgang', durchgangAktualisiert);
      durchgang = durchgangAktualisiert;
    } catch (e) {
      fehler = e instanceof Error ? e.message : String(e);
      return;
    }

    letzteAuswertung = { ergebnis: auswertung.ergebnis, tatsaechlicheOption, unerwarteteNummer };
    itemPhase = 'aufgeloest';
    // Keine Pause nach dem letzten Item — niemand riecht danach noch etwas,
    // fuer das sich die Nase erholen muesste.
    if (index + 1 < DURCHGANG_GROESSE) starteRiechpause();
  }

  function weiterNachAufloesung() {
    if (!durchgang) return;
    if (durchgang.status === 'abgeschlossen') {
      phase = 'ende';
      return;
    }
    index += 1;
    naechstesItemVorbereiten();
  }

  // ---- Ende: was sass, was nicht — die Zusatzfläschchen bleiben unaufgeloest

  const ERGEBNIS_TEXT: Record<'richtig' | 'teilweise' | 'falsch', string> = {
    richtig: 'richtig',
    teilweise: 'teilweise — Familie richtig',
    falsch: 'daneben',
  };

  const rundenZeilen = $derived(
    (durchgang?.beantwortet ?? []).map((aromaId) => {
      const antwort = bestand.uebungsantworten.find((a) => a.durchgangId === durchgang?.id && a.aromaId === aromaId);
      const option = alleAromen.find((a) => a.id === aromaId);
      return { label: option?.label ?? '?', wert: antwort?.ergebnis ? ERGEBNIS_TEXT[antwort.ergebnis] : '' };
    }),
  );

  function zurueckZurUebersicht() {
    durchgang = undefined;
    item = undefined;
    phase = 'uebersicht';
  }
</script>

{#if datenblatt}
  <Aromadatenblatt blatt={datenblatt} onZurueck={() => (datenblatt = undefined)} onVerweis={(nummer) => (datenblatt = datenblattZu(nummer) ?? datenblatt)} />
{:else}
  <Kopfzeile titel="Übungsmodus" {onZurueck} />

  {#if !set}
    <p class="hinweis">Noch keine Aromen mit Fläschchennummern erfasst.</p>
  {:else if alleAromen.length === 0}
    <p class="hinweis">Noch keine Fläschchen erfasst.</p>
  {:else if phase === 'uebersicht'}
    <div class="block">
      <Werteliste zeilen={boxenZeilen} />
      {#if sperreAktiv}
        <p class="hinweis">Erst festigen, dann Neues.</p>
      {/if}
    </div>
    <div class="knopfreihe">
      <Knopf stufe="primaer" onKlick={durchgangStarten}>durchgang starten</Knopf>
    </div>
    {#if fehler}<p class="fehler">{fehler}</p>{/if}
  {:else if phase === 'bereitlegen'}
    <div class="block">
      <p class="frage-satz">
        Lege diese {bereitlegenNummern.length} Fläschchen verdeckt bereit — so, dass du beim Greifen nicht erkennen kannst, welches du
        gerade in der Hand hältst.
      </p>
      <div class="nummernliste">
        {#each bereitlegenNummern as nummer (nummer)}
          <span class="nummer">{nummer}</span>
        {/each}
      </div>
    </div>
    <div class="knopfreihe">
      <Knopf stufe="primaer" onKlick={bereitgelegt}>liegt bereit</Knopf>
    </div>
    {#if fehler}<p class="fehler">{fehler}</p>{/if}
  {:else if phase === 'item' && item}
    <p class="fortschritt">{index + 1} von {DURCHGANG_GROESSE}</p>

    {#if itemPhase === 'raten'}
      <div class="frage-block">
        <p class="frage-satz">Zieh eins, ohne hinzusehen — riech daran.</p>
        {#if item.formStufe === 'a'}
          <p class="frage-titel">Welche Familie ist das?</p>
          {#key item}
            <AuswahlListe optionen={familien} wert={tipFamilie} onWahl={(w) => (tipFamilie = w)} platzhalter="Familie wählen …" />
          {/key}
        {:else if item.formStufe === 'b'}
          <p class="frage-titel">Welche Familie ist das?</p>
          {#key item}
            <AuswahlListe optionen={familien} wert={tipFamilie} onWahl={familieGewaehlt} platzhalter="Familie wählen …" />
          {/key}
          {#if tipFamilie}
            <p class="frage-titel zweite-frage">Welches Aroma aus „{familieVon(tipFamilie)}“ ist es?</p>
            {#key tipFamilie}
              <AuswahlListe
                optionen={aromenDerGewaehltenFamilie}
                wert={tipAroma}
                onWahl={(w) => (tipAroma = w)}
                platzhalter="Aroma wählen …"
                suchbar
              />
            {/key}
          {/if}
        {:else}
          <p class="frage-titel">Welches Aroma ist das?</p>
          {#key item}
            <AuswahlListe optionen={namenOptionen} wert={tipAroma} onWahl={(w) => (tipAroma = w)} platzhalter="dein Tipp …" suchbar />
          {/key}
        {/if}
        <div class="knopfreihe">
          <Knopf stufe="primaer" onKlick={zurNummer} deaktiviert={!tippVollstaendig}>weiter</Knopf>
        </div>
      </div>
    {:else if itemPhase === 'nummer'}
      <div class="frage-block">
        <p class="frage-satz">Jetzt die Augen auf — welche Nummer stand auf dem Fläschchen?</p>
        <AuswahlListe optionen={nummernOptionen} wert={tipNummer} onWahl={(w) => (tipNummer = w)} platzhalter="Nummer suchen …" suchbar />
        <div class="knopfreihe">
          <Knopf stufe="primaer" onKlick={aufloesen} deaktiviert={!tipNummer}>auflösen</Knopf>
        </div>
      </div>
    {:else if letzteAuswertung}
      <div class="frage-block">
        <p class="ergebnis" class:richtig={letzteAuswertung.ergebnis === 'richtig'}>
          {#if letzteAuswertung.ergebnis === 'richtig'}
            Richtig — das war „{letzteAuswertung.tatsaechlicheOption.label}“.
          {:else if letzteAuswertung.ergebnis === 'teilweise'}
            Familie richtig, Aroma daneben — das war „{letzteAuswertung.tatsaechlicheOption.label}“.
          {:else}
            Das war „{letzteAuswertung.tatsaechlicheOption.label}“.
          {/if}
        </p>
        {#if letzteAuswertung.unerwarteteNummer}
          <p class="hinweis">Dieses Fläschchen gehörte nicht zu den zwölf, die für diesen Durchgang bereitlagen — trotzdem gewertet.</p>
        {/if}
        {#if letzteAuswertung.tatsaechlicheOption.verwandte && letzteAuswertung.tatsaechlicheOption.verwandte.length > 0}
          <p class="verwandte">
            Verwandt: {letzteAuswertung.tatsaechlicheOption.verwandte
              .map((id) => alleAromen.find((a) => a.id === id)?.label)
              .filter(Boolean)
              .join(', ')}
          </p>
        {/if}
        <div class="knopfreihe">
          <Knopf stufe="primaer" onKlick={weiterNachAufloesung} deaktiviert={pauseRest > 0}>
            {pauseRest > 0 ? `weiter (${pauseRest})` : 'weiter'}
          </Knopf>
          {#if letzteAuswertung.tatsaechlicheOption.nummer !== undefined && datenblattZu(letzteAuswertung.tatsaechlicheOption.nummer)}
            <Knopf onKlick={() => (datenblatt = datenblattZu(letzteAuswertung!.tatsaechlicheOption.nummer!))}>Datenblatt ansehen</Knopf>
          {/if}
        </div>
      </div>
    {/if}
    {#if fehler}<p class="fehler">{fehler}</p>{/if}
  {:else if phase === 'ende'}
    <div class="block">
      <Werteliste zeilen={rundenZeilen} />
      <p class="hinweis">Die Zusatzfläschchen bleiben unaufgelöst.</p>
    </div>
    <div class="knopfreihe">
      <Knopf stufe="primaer" onKlick={zurueckZurUebersicht}>zur Übersicht</Knopf>
    </div>
  {/if}
{/if}

<style>
  .block {
    margin-bottom: var(--r4);
  }
  .frage-block {
    margin-bottom: var(--r5);
  }
  .fortschritt {
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--gedaempft);
    margin: 0 0 var(--r3);
  }
  .frage-titel {
    font-size: var(--fs-urteil);
    color: var(--tinte);
    margin: 0 0 var(--r1);
  }
  .frage-titel.zweite-frage {
    margin-top: var(--r4);
  }
  .frage-satz {
    font-family: var(--schrift-sans);
    font-size: var(--fs-erklaerung);
    color: var(--gedaempft);
    margin: 0 0 var(--r3);
  }
  .ergebnis {
    font-size: var(--fs-satz);
    color: var(--kritisch);
    margin: 0 0 var(--r2);
  }
  .ergebnis.richtig {
    color: var(--satz);
  }
  .verwandte {
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--gedaempft);
    margin: 0 0 var(--r3);
  }
  .nummernliste {
    display: flex;
    flex-wrap: wrap;
    gap: var(--r2);
  }
  .nummer {
    min-width: var(--treffer);
    min-height: var(--treffer);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 var(--r2);
    background: var(--vertiefung);
    border-radius: var(--r-pille);
    font-family: var(--schrift-sans);
    font-variant-numeric: var(--zahl-features);
    color: var(--tinte);
  }
  .knopfreihe {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--r2);
    margin-top: var(--r3);
  }
  .hinweis {
    color: var(--gedaempft);
    font-family: var(--schrift-sans);
    font-size: var(--fs-satz);
  }
  .fehler {
    color: var(--kritisch);
    font-size: var(--fs-satz);
    margin-top: var(--r2);
  }
</style>
