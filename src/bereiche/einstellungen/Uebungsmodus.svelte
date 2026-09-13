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
  //
  // Aromapaket, Etappe 7: zwei weitere Durchgangsarten, eigene Phasen
  // ('kontrast'/'reverse'), beide von der Übersicht aus gestartet, `art` am
  // Durchgang entscheidet in `bereitgelegt()`, wohin es weitergeht.
  //
  // Kontrastdurchgang — die eine bewusste Ausnahme von "nie Namen vor der
  // Antwort": die App nennt vor dem Riechen beide Namen des Paares. Ohne das
  // wäre es nur ein zufällig auf zwei Fläschchen verengter freier Abruf, und
  // die eigentliche Leistung — zwei ähnliche Gerüche direkt gegeneinander
  // abwägen — fände nicht statt (CLAUDE.md, "Was nie sichtbar wird" im Plan-
  // Dokument dieses Umbaus). Eine einzige Zuordnungsfrage danach, nicht zwei
  // Einzelfragen — die zweite wäre nach der ersten durch Ausschluss geschenkt.
  //
  // Reverse — ungescort, ohne jede Wirkung auf Box/Fälligkeit: kein Aufruf
  // von `schreiben('uebung', …)` in reverseAufloesen(). Nicht blind: du
  // suchst das Fläschchen gezielt (Name + Nummer stehen offen), das ist der
  // Witz der Übung.
  //
  // Bekannte Lücke: die harte Obergrenze von 10 Riechvorgängen (Lastenheft
  // Abschnitt 2) gilt hier nur je einzelnem Durchgang (8 normal, 2 Kontrast,
  // 1 Reverse) — nicht kumulativ über mehrere hintereinander gestartete
  // Durchgänge einer Sitzung. Eine sitzungsweite Zählung bräuchte einen
  // eigenen Zustand über Durchgänge hinweg, den es bewusst noch nicht gibt.
  import { untrack } from 'svelte';
  import { bestand, schreiben } from '../bestand.svelte';
  import { navigation } from '../navigation.svelte';
  import { neueId } from '../../daten/id';
  import { flaeschchenId } from '../../daten/aromen';
  import type { SammlungWert } from '../../daten/ablage';
  import {
    planeDurchgang,
    effektiverZustand,
    werteAntwortAus,
    verwechslungspaare,
    werteKontrastAus,
    DURCHGANG_GROESSE,
    type AromaOption,
    type GesamtStand,
  } from '../../domain/uebung';
  import { einfuehrungErlaubt } from '../../domain/leitner';
  import { uebungsKennzahlenPool } from '../../domain/uebungsauswertung';
  import { waehleKennzahlen, type Kennzahl } from '../../domain/hinweise';
  import { datenblattZu, type AromaDatenblatt } from '../../daten/aroma-datenblaetter';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import AuswahlListe from '../../muster/AuswahlListe.svelte';
  import Segment from '../../muster/Segment.svelte';
  import Knopf from '../../muster/Knopf.svelte';
  import Werteliste from '../../muster/Werteliste.svelte';
  import Blattliste from '../../muster/Blattliste.svelte';
  import Blattzeile from '../../muster/Blattzeile.svelte';
  import Aromadatenblatt from '../aromen/Aromadatenblatt.svelte';

  let {
    aktiv,
    onZurueck,
    onOeffnenStatistik,
  }: {
    /** true = eine Aktivität läuft gerade (Route 'uebungLaufend'), false = Übersicht (Route 'uebung'). */
    aktiv: boolean;
    onZurueck: () => void;
    onOeffnenStatistik: () => void;
  } = $props();

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

  // ---- Übersicht: Kennzahl-Kacheln statt roher Boxenliste --------------
  // (Livebetrieb-Rückmeldung: "Boxen ohne Namen" sagen niemandem etwas, der
  // die interne Leitner-Mechanik nicht kennt — und die Zahl, die die
  // "durchgang starten"-Entscheidung tragen würde, stand dort ohnehin nicht;
  // die App mischt beim Start automatisch aus fälligen, neuen und nötigenfalls
  // auch nicht-fälligen Aromen, die genaue Verteilung ändert daran nichts.)
  // Die volle Fünf-Boxen-Aufschlüsselung steht jetzt auf der Statistik-Seite
  // (UebungsAuswertung.svelte) — "wichtig manchmal", nicht auf den ersten
  // Blick. Hier stattdessen dasselbe Muster wie die Bar-Kennzahl-Kacheln
  // (domain/hinweise.ts::Kennzahl + waehleKennzahlen): zwei zufällig aus
  // einem Pool ehrlicher Fakten gezogen, einmal je Aufruf der Übersicht.

  let uebersichtJetzt = $state(Date.now());
  $effect(() => {
    if (!aktiv) uebersichtJetzt = Date.now();
  });

  const zustaende = $derived(alleAromen.map((a) => effektiverZustand(staende.get(a.id), uebersichtJetzt)));
  const eingefuehrteZustaende = $derived(zustaende.filter((z) => z.eingefuehrt));
  const sperreAktiv = $derived(!einfuehrungErlaubt(eingefuehrteZustaende.map((z) => z.box)));

  /** kategorieId -> Familienname, fuer domain/uebungsauswertung.ts::uebungsKennzahlenPool — die Domäne kennt das Aromaset selbst nicht. */
  const familienLabels = $derived(new Map(familien.map((f) => [f.wert, f.label] as const)));

  let kennzahlenAuswahl = $state<readonly Kennzahl[]>([]);
  $effect(() => {
    if (aktiv || !set) return;
    untrack(() => {
      const pool = uebungsKennzahlenPool({
        eingefuehrteZustaende,
        antworten: bestand.uebungsantworten.filter((a) => a.setId === set.id),
        durchgaengeBegonnenAm: bestand.uebungsdurchgaenge.filter((d) => d.setId === set.id).map((d) => d.begonnenAm),
        aromen: alleAromen,
        familienLabels,
        gesamtAnzahlAromen: alleAromen.length,
        jetzt: Date.now(),
      });
      kennzahlenAuswahl = waehleKennzahlen(pool, 2);
    });
  });

  // Das am staerksten dokumentierte Verwechslungspaar, wenn eins die Schwelle
  // erreicht — die Grundlage fuer das Kontrastdurchgang-Angebot auf der
  // Uebersicht (Lastenheft Abschnitt 8).
  const kontrastKandidat = $derived(verwechslungspaare(bekannteStaende)[0]);
  const kontrastKandidatLabelA = $derived(alleAromen.find((a) => a.id === kontrastKandidat?.aId)?.label ?? '');
  const kontrastKandidatLabelB = $derived(alleAromen.find((a) => a.id === kontrastKandidat?.bId)?.label ?? '');

  // ---- Phasen: Übersicht → Bereitlegen → Item (×8) / Kontrast / Reverse → Ende

  // 'uebersicht' gehört nicht mehr dazu — das ist jetzt `!aktiv` (Route
  // 'uebung'), keine Phase mehr. Startwert ohne Bedeutung: gerendert wird
  // er erst, sobald `aktiv` wahr ist, und dann setzt genau der Weg dorthin
  // (Start-Funktion oder versucheWiederaufnahme()) ihn ohnehin neu.
  type Phase = 'bereitlegen' | 'item' | 'kontrast' | 'reverse' | 'ende';
  let phase = $state<Phase>('bereitlegen');
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
      navigation.gehe({ name: 'uebungLaufend' });
    } catch (e) {
      fehler = e instanceof Error ? e.message : String(e);
    }
  }

  async function kontrastdurchgangStarten() {
    if (!set || !kontrastKandidat) return;
    const jetzt = Date.now();
    const neu: SammlungWert['uebungsdurchgang'] = {
      id: neueId(),
      setId: set.id,
      art: 'kontrast',
      status: 'bereitlegen',
      verdeckt: [kontrastKandidat.aId, kontrastKandidat.bId],
      abgefragt: [kontrastKandidat.aId, kontrastKandidat.bId],
      zusatz: [],
      beantwortet: [],
      begonnenAm: jetzt,
    };
    try {
      await schreiben('uebungsdurchgang', neu);
      durchgang = neu;
      phase = 'bereitlegen';
      navigation.gehe({ name: 'uebungLaufend' });
    } catch (e) {
      fehler = e instanceof Error ? e.message : String(e);
    }
  }

  // Nummern der Verdeckten, aufsteigend — reine Anzeige fürs Bereitlegen, nie
  // Namen (die verrieten mehr, als das Lastenheft für diesen Schritt als
  // unproblematisch nennt: "die Zuordnung Reihenfolge → Nummer unbekannt"
  // reicht, eine Namensliste wäre etwas anderes). Gilt fuer "normal" (zwoelf)
  // und "kontrast" (zwei) gleichermassen — der Kontrastdurchgang nennt die
  // NAMEN separat als Ansage, siehe Vorlage weiter unten.
  const bereitlegenNummern = $derived(
    (durchgang?.verdeckt ?? [])
      .map((id) => alleAromen.find((a) => a.id === id)?.nummer)
      .filter((n): n is number => n !== undefined)
      .sort((a, b) => a - b),
  );

  /** Die zwei Aromen eines Kontrastdurchgangs, in der beim Start festgelegten (beliebigen, aber stabilen) Reihenfolge. */
  const kontrastOptionen = $derived(
    durchgang?.art === 'kontrast'
      ? durchgang.verdeckt.map((id) => alleAromen.find((a) => a.id === id)).filter((a): a is AromaOption => a !== undefined)
      : [],
  );

  async function bereitgelegt() {
    if (!durchgang) return;
    const aktualisiert: SammlungWert['uebungsdurchgang'] = { ...durchgang, status: 'laufend' };
    try {
      await schreiben('uebungsdurchgang', aktualisiert);
      durchgang = aktualisiert;
      if (aktualisiert.art === 'kontrast') {
        kontrastSchritt = 'erstesRiechen';
        kontrastReihenfolge = '';
        kontrastErsteNummer = '';
        kontrastAuswertung = undefined;
        kontrastUnerwartet = false;
        phase = 'kontrast';
      } else {
        index = 0;
        naechstesItemVorbereiten();
        phase = 'item';
      }
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
    /** Nur gesetzt, wenn ein Familientipp danebenlag (Stufe A/B, ergebnis "falsch") — welche Familie es gewesen wäre. */
    readonly korrekteFamilie?: string;
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

  /**
   * Eingefrorene Zusammenfassung des Tipp-Schritts, sobald `itemPhase` weiter
   * ist als 'raten' — der Block selbst bleibt stehen statt zu verschwinden
   * (Livebetrieb-Rückmeldung: "baut sich über einen Screen hinweg auf" statt
   * sich bei jedem Schritt zu ersetzen, siehe Template weiter unten).
   */
  const tippZusammenfassung = $derived(
    !item
      ? ''
      : item.formStufe === 'a'
        ? `Deine Familie: ${familieVon(tipFamilie)}`
        : item.formStufe === 'b'
          ? `Deine Familie: ${familieVon(tipFamilie)} · dein Aroma: ${aromenDerGewaehltenFamilie.find((a) => a.wert === tipAroma)?.label ?? ''}`
          : `Dein Tipp: ${namenOptionen.find((a) => a.wert === tipAroma)?.label ?? ''}`,
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
        getipptFamilieId: tipFamilie || undefined,
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

    // Bei Stufe A/B mit falscher Familie: die richtige nennen — bei
    // "teilweise" war die Familie schon richtig (nur das Aroma nicht), bei
    // Stufe C gab es gar keinen Familientipp.
    const korrekteFamilie =
      auswertung.ergebnis === 'falsch' && item.formStufe !== 'c' && tatsaechlicheOption.kategorieId
        ? familieVon(tatsaechlicheOption.kategorieId)
        : undefined;

    letzteAuswertung = { ergebnis: auswertung.ergebnis, tatsaechlicheOption, unerwarteteNummer, korrekteFamilie };
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

  // ---- Kontrastdurchgang: zwei Fläschchen, eine Zuordnungsfrage -----------
  // (Aromapaket, Etappe 7) — Ablauf laut Lastenheft Abschnitt 6: erstes
  // Fläschchen riechen, NICHT auflösen; Riechpause (hier am wichtigsten: zwei
  // ähnliche Gerüche direkt hintereinander sind genau der Fall, für den
  // Geruchsadaptation gemacht ist); zweites riechen; eine Zuordnungsfrage;
  // Nummer des zuerst gezogenen eintragen, das zweite folgt aus den zwei
  // verdeckten Ids.

  let kontrastSchritt = $state<'erstesRiechen' | 'zweitesRiechen' | 'frage' | 'nummer' | 'aufgeloest'>('erstesRiechen');
  let kontrastReihenfolge = $state('');
  let kontrastErsteNummer = $state('');
  let kontrastUnerwartet = $state(false);
  let kontrastAuswertung = $state<
    { readonly ergebnis: 'richtig' | 'falsch'; readonly ersteOption: AromaOption; readonly zweiteOption: AromaOption } | undefined
  >(undefined);

  const kontrastFrageOptionen = $derived(
    kontrastOptionen.length === 2
      ? [
          { wert: 'a-zuerst', label: `erst ${kontrastOptionen[0]!.label}, dann ${kontrastOptionen[1]!.label}` },
          { wert: 'b-zuerst', label: `erst ${kontrastOptionen[1]!.label}, dann ${kontrastOptionen[0]!.label}` },
        ]
      : [],
  );

  function kontrastErstesGerochen() {
    kontrastSchritt = 'zweitesRiechen';
    starteRiechpause();
  }

  async function kontrastAufloesen() {
    if (!durchgang || !set || !kontrastErsteNummer || kontrastOptionen.length !== 2) return;
    const [optA, optB] = kontrastOptionen as [AromaOption, AromaOption];
    const ersteId = kontrastErsteNummer;
    const jetzt = Date.now();

    if (!durchgang.verdeckt.includes(ersteId)) {
      // Seltener echter Bereitlegen-Fehler (siehe Kopfkommentar zu
      // unerwarteteNummer weiter oben): bei nur zwei Verdeckten trägt "das
      // jeweils andere" als Grundlage für die zweite Identität nicht mehr.
      // Kein Absturz, keine erfundene zweite Identität — der Durchgang endet
      // hier unbewertet, ehrlich benannt.
      try {
        const durchgangAktualisiert: SammlungWert['uebungsdurchgang'] = {
          ...durchgang,
          beantwortet: [ersteId],
          status: 'abgeschlossen',
          abgeschlossenAm: jetzt,
        };
        await schreiben('uebungsdurchgang', durchgangAktualisiert);
        durchgang = durchgangAktualisiert;
        await schreiben('uebungsantwort', {
          id: neueId(),
          durchgangId: durchgang.id,
          setId: set.id,
          aromaId: ersteId,
          form: 'kontrast',
          zeitstempel: jetzt,
          unerwarteteNummer: true,
        });
      } catch (e) {
        fehler = e instanceof Error ? e.message : String(e);
        return;
      }
      kontrastUnerwartet = true;
      kontrastSchritt = 'aufgeloest';
      return;
    }

    const ersteOption = ersteId === optA.id ? optA : optB;
    const zweiteOption = ersteId === optA.id ? optB : optA;
    const gewaehlteAWarErste = kontrastReihenfolge === 'a-zuerst';
    const tatsaechlichAWarErste = ersteId === optA.id;
    const richtigeReihenfolge = gewaehlteAWarErste === tatsaechlichAWarErste;

    const aStand = staende.get(optA.id);
    const bStand = staende.get(optB.id);
    const auswertung = werteKontrastAus(richtigeReihenfolge, aStand, bStand, jetzt);

    try {
      const bisherigeA = bestand.uebungen.find((u) => u.setId === set!.id && u.aromaId === optA.id);
      await schreiben('uebung', {
        id: bisherigeA?.id ?? neueId(),
        setId: set.id,
        aromaId: optA.id,
        benennen: bisherigeA?.benennen ?? { versuche: 0, treffer: 0 },
        unterscheiden: bisherigeA?.unterscheiden ?? { versuche: 0, treffer: 0 },
        verwechslungen: bisherigeA?.verwechslungen ?? {},
        letzterVersuch: jetzt,
        box: auswertung.aBox,
        faellig: auswertung.aFaellig,
        stufe: bisherigeA?.stufe,
        familienSerie: bisherigeA?.familienSerie ?? 0,
      });
      const bisherigeB = bestand.uebungen.find((u) => u.setId === set!.id && u.aromaId === optB.id);
      await schreiben('uebung', {
        id: bisherigeB?.id ?? neueId(),
        setId: set.id,
        aromaId: optB.id,
        benennen: bisherigeB?.benennen ?? { versuche: 0, treffer: 0 },
        unterscheiden: bisherigeB?.unterscheiden ?? { versuche: 0, treffer: 0 },
        verwechslungen: bisherigeB?.verwechslungen ?? {},
        letzterVersuch: jetzt,
        box: auswertung.bBox,
        faellig: auswertung.bFaellig,
        stufe: bisherigeB?.stufe,
        familienSerie: bisherigeB?.familienSerie ?? 0,
      });

      for (const option of [optA, optB]) {
        await schreiben('uebungsantwort', {
          id: neueId(),
          durchgangId: durchgang.id,
          setId: set.id,
          aromaId: option.id,
          form: 'kontrast',
          ergebnis: auswertung.ergebnis,
          zeitstempel: jetzt,
          unerwarteteNummer: false,
        });
      }

      const durchgangAktualisiert: SammlungWert['uebungsdurchgang'] = {
        ...durchgang,
        beantwortet: [optA.id, optB.id],
        status: 'abgeschlossen',
        abgeschlossenAm: jetzt,
      };
      await schreiben('uebungsdurchgang', durchgangAktualisiert);
      durchgang = durchgangAktualisiert;
    } catch (e) {
      fehler = e instanceof Error ? e.message : String(e);
      return;
    }

    kontrastAuswertung = { ergebnis: auswertung.ergebnis, ersteOption, zweiteOption };
    kontrastSchritt = 'aufgeloest';
  }

  // ---- Reverse: Name zuerst, dann gezielt suchen — ungescort -------------
  // (Aromapaket, Etappe 7). Kein Bereitlegen (nicht blind), keine Wirkung
  // auf Box/Fälligkeit (siehe Kopfkommentar).

  let reverseSchritt = $state<'wahl' | 'riechen' | 'einschaetzung' | 'fertig'>('wahl');
  let reverseAromaId = $state('');
  let reverseBegonnenAm = $state(0);
  let reverseEinschaetzung = $state('');

  const reverseOption = $derived(alleAromen.find((a) => a.id === reverseAromaId));

  async function reverseDurchgangStarten() {
    if (!set || !reverseAromaId) return;
    const jetzt = Date.now();
    const neu: SammlungWert['uebungsdurchgang'] = {
      id: neueId(),
      setId: set.id,
      art: 'reverse',
      status: 'laufend',
      verdeckt: [reverseAromaId],
      abgefragt: [reverseAromaId],
      zusatz: [],
      beantwortet: [],
      begonnenAm: jetzt,
    };
    try {
      await schreiben('uebungsdurchgang', neu);
      durchgang = neu;
      reverseBegonnenAm = jetzt;
      reverseSchritt = 'riechen';
    } catch (e) {
      fehler = e instanceof Error ? e.message : String(e);
    }
  }

  async function reverseAufloesen() {
    if (!durchgang || !set || !reverseAromaId || !reverseEinschaetzung) return;
    const jetzt = Date.now();
    try {
      await schreiben('uebungsantwort', {
        id: neueId(),
        durchgangId: durchgang.id,
        setId: set.id,
        aromaId: reverseAromaId,
        form: 'reverse',
        ergebnis: reverseEinschaetzung === 'getroffen' ? 'richtig' : 'falsch',
        zeitstempel: jetzt,
        antwortdauerMs: Math.max(0, jetzt - reverseBegonnenAm),
        unerwarteteNummer: false,
      });
      const durchgangAktualisiert: SammlungWert['uebungsdurchgang'] = {
        ...durchgang,
        beantwortet: [reverseAromaId],
        status: 'abgeschlossen',
        abgeschlossenAm: jetzt,
      };
      await schreiben('uebungsdurchgang', durchgangAktualisiert);
      durchgang = durchgangAktualisiert;
    } catch (e) {
      fehler = e instanceof Error ? e.message : String(e);
      return;
    }
    reverseSchritt = 'fertig';
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
      // Nur bei Stufe A/B (Familientipp) — Stufe C (freier Abruf) hat keine
      // Familie getippt, bleibt ohne Hinweiszeile.
      const hinweis =
        antwort && (antwort.form === 'familie' || antwort.form === 'aromaInFamilie') && antwort.getipptFamilieId
          ? `getippt: ${familieVon(antwort.getipptFamilieId)} · richtig: ${familieVon(option?.kategorieId)}`
          : undefined;
      return { label: option?.label ?? '?', wert: antwort?.ergebnis ? ERGEBNIS_TEXT[antwort.ergebnis] : '', hinweis };
    }),
  );

  /**
   * Verlässt die laufende Aktivität — dieselbe Bewegung wie der
   * Kopfzeile-Pfeil (`onZurueck` = `navigation.zurueck()`), nicht ein
   * zweiter Weg zum selben Ziel: von der Route 'uebungLaufend' aus landet
   * das zuverlässig auf 'uebung', egal ob per echtem Verlauf-Zurück oder
   * (ohne eigene Tiefe) über elternVon.
   */
  function zurueckZurUebersicht() {
    durchgang = undefined;
    item = undefined;
    kontrastSchritt = 'erstesRiechen';
    kontrastReihenfolge = '';
    kontrastErsteNummer = '';
    kontrastUnerwartet = false;
    kontrastAuswertung = undefined;
    reverseSchritt = 'wahl';
    reverseAromaId = '';
    reverseEinschaetzung = '';
    onZurueck();
  }

  /** Übersicht → Reverse: Aromawahl zurücksetzen, kein Durchgang bis zur Bestätigung. */
  function reverseUeben() {
    reverseSchritt = 'wahl';
    reverseAromaId = '';
    reverseEinschaetzung = '';
    phase = 'reverse';
    navigation.gehe({ name: 'uebungLaufend' });
  }

  // ---- Wiederaufnehmen nach einem Neu-Mount --------------------------------
  // Rahmen.svelte baut bei jedem Routenwechsel per {#key zuPfad(route)} neu
  // auf, auch zwischen 'uebung' und 'uebungLaufend' — ein Wechsel dorthin ist
  // also immer ein frischer Componenten-Start, nicht die Fortsetzung des
  // Zustands von eben. Ohne dieses Nachziehen stünde hier bei jedem
  // Rücksprung aus einer Unteransicht (z. B. dem Datenblatt) oder jeder
  // Bildschirmsperre-Rückkehr ein leerer Bereitlegen-Bildschirm ohne
  // `durchgang`. Bewusst *grob*: der laufende Durchgang selbst kommt aus der
  // Datenbank zurück, aber ein noch nicht abgeschickter Einzeltipp (gewählte
  // Familie, angefangene Kontrastdurchgang-Eingabe) nicht — man landet am
  // Anfang des aktuellen Items/Schritts, nicht mitten in der Eingabe.
  function versucheWiederaufnahme() {
    if (!set) return;
    const laufender = bestand.uebungsdurchgaenge.find((d) => d.setId === set.id && d.status !== 'abgeschlossen');
    if (!laufender) {
      // Kein Treffer — z. B. ein wiederhergestellter Verlaufseintrag nach
      // echtem Prozess-Neustart, fuer den auch die IndexedDB nichts
      // Laufendes mehr kennt. Sauber zurueck statt eines leeren Bildschirms.
      onZurueck();
      return;
    }
    durchgang = laufender;
    if (laufender.status === 'bereitlegen') {
      phase = 'bereitlegen';
      return;
    }
    if (laufender.art === 'kontrast') {
      kontrastSchritt = 'erstesRiechen';
      kontrastReihenfolge = '';
      kontrastErsteNummer = '';
      kontrastAuswertung = undefined;
      kontrastUnerwartet = false;
      phase = 'kontrast';
    } else if (laufender.art === 'reverse') {
      reverseAromaId = laufender.verdeckt[0] ?? '';
      reverseBegonnenAm = Date.now();
      reverseEinschaetzung = '';
      reverseSchritt = 'riechen';
      phase = 'reverse';
    } else {
      index = laufender.beantwortet.length;
      naechstesItemVorbereiten();
      phase = 'item';
    }
  }

  $effect(() => {
    if (aktiv && !durchgang) versucheWiederaufnahme();
  });
</script>

{#if datenblatt}
  <Aromadatenblatt blatt={datenblatt} onZurueck={() => (datenblatt = undefined)} onVerweis={(nummer) => (datenblatt = datenblattZu(nummer) ?? datenblatt)} />
{:else}
  <Kopfzeile titel="Übungsmodus" {onZurueck} />

  {#if !set}
    <p class="hinweis">Noch keine Aromen mit Fläschchennummern erfasst.</p>
  {:else if alleAromen.length === 0}
    <p class="hinweis">Noch keine Fläschchen erfasst.</p>
  {:else if !aktiv}
    {#if kennzahlenAuswahl.length > 0}
      <div class="kennzahl-raster" class:einzeln={kennzahlenAuswahl.length === 1}>
        {#each kennzahlenAuswahl as fakt (fakt.label)}
          <div class="kennzahl-kachel">
            <span class="kennzahl-label">{fakt.label}</span>
            <span class="zahl kennzahl-zahl">{fakt.wert}</span>
          </div>
        {/each}
      </div>
    {/if}
    {#if sperreAktiv}
      <p class="hinweis">Erst festigen, dann Neues.</p>
    {/if}
    <div class="knopfreihe">
      <Knopf stufe="primaer" onKlick={durchgangStarten}>durchgang starten</Knopf>
      {#if kontrastKandidat}
        <Knopf onKlick={kontrastdurchgangStarten}>kontrastdurchgang: {kontrastKandidatLabelA} oder {kontrastKandidatLabelB}</Knopf>
      {/if}
      <Knopf onKlick={reverseUeben}>reverse üben</Knopf>
    </div>
    <div class="block">
      <Blattliste>
        <Blattzeile label="Statistik" akzent onKlick={onOeffnenStatistik} />
      </Blattliste>
    </div>
    {#if fehler}<p class="fehler">{fehler}</p>{/if}
  {:else if phase === 'bereitlegen'}
    <div class="block">
      {#if durchgang?.art === 'kontrast' && kontrastOptionen.length === 2}
        <p class="frage-satz">Dieser Durchgang: {kontrastOptionen[0]!.label} oder {kontrastOptionen[1]!.label}.</p>
        <p class="frage-satz">
          Lege diese zwei Fläschchen verdeckt bereit — so, dass du hinterher nicht weißt, welches du zuerst gezogen hast.
        </p>
      {:else}
        <p class="frage-satz">
          Lege diese {bereitlegenNummern.length} Fläschchen verdeckt bereit — so, dass du beim Greifen nicht erkennen kannst, welches du
          gerade in der Hand hältst.
        </p>
      {/if}
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

    <div class="frage-block">
      {#if itemPhase === 'raten'}
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
      {:else}
        <p class="hinweis">{tippZusammenfassung}</p>
      {/if}
    </div>

    {#if itemPhase === 'nummer' || itemPhase === 'aufgeloest'}
      <div class="frage-block">
        {#if itemPhase === 'nummer'}
          <p class="frage-satz">Jetzt die Augen auf — welche Nummer stand auf dem Fläschchen?</p>
          <AuswahlListe optionen={nummernOptionen} wert={tipNummer} onWahl={(w) => (tipNummer = w)} platzhalter="Nummer suchen …" suchbar />
          <div class="knopfreihe">
            <Knopf stufe="primaer" onKlick={aufloesen} deaktiviert={!tipNummer}>auflösen</Knopf>
          </div>
        {:else}
          <p class="hinweis">Gelesene Nummer: {nummernOptionen.find((n) => n.wert === tipNummer)?.label ?? ''}</p>
        {/if}
      </div>
    {/if}

    {#if itemPhase === 'aufgeloest' && letzteAuswertung}
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
        {#if letzteAuswertung.korrekteFamilie}
          <p class="hinweis">Richtige Familie wäre gewesen: {letzteAuswertung.korrekteFamilie}.</p>
        {/if}
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
  {:else if phase === 'kontrast' && kontrastOptionen.length === 2}
    <div class="frage-block">
      {#if kontrastSchritt === 'erstesRiechen'}
        <p class="frage-satz">Zieh das erste der beiden, ohne hinzusehen — riech daran. Noch nicht auflösen.</p>
        <div class="knopfreihe">
          <Knopf stufe="primaer" onKlick={kontrastErstesGerochen}>gerochen</Knopf>
        </div>
      {:else if kontrastSchritt === 'zweitesRiechen'}
        <p class="frage-satz">Zieh das zweite, ohne hinzusehen — riech daran.</p>
        <div class="knopfreihe">
          <Knopf stufe="primaer" onKlick={() => (kontrastSchritt = 'frage')} deaktiviert={pauseRest > 0}>
            {pauseRest > 0 ? `weiter (${pauseRest})` : 'weiter'}
          </Knopf>
        </div>
      {:else if kontrastSchritt === 'frage'}
        <p class="frage-titel">Welches war welches?</p>
        <Segment optionen={kontrastFrageOptionen} wert={kontrastReihenfolge} onWahl={(w) => (kontrastReihenfolge = w)} />
        <div class="knopfreihe">
          <Knopf stufe="primaer" onKlick={() => (kontrastSchritt = 'nummer')} deaktiviert={!kontrastReihenfolge}>weiter</Knopf>
        </div>
      {:else if kontrastSchritt === 'nummer'}
        <p class="frage-satz">Jetzt die Augen auf — welche Nummer hattest du zuerst gezogen?</p>
        <AuswahlListe optionen={nummernOptionen} wert={kontrastErsteNummer} onWahl={(w) => (kontrastErsteNummer = w)} platzhalter="Nummer suchen …" suchbar />
        <div class="knopfreihe">
          <Knopf stufe="primaer" onKlick={kontrastAufloesen} deaktiviert={!kontrastErsteNummer}>auflösen</Knopf>
        </div>
      {:else if kontrastSchritt === 'aufgeloest'}
        {#if kontrastUnerwartet}
          <p class="hinweis">Diese Nummer gehörte zu keinem der beiden angekündigten Fläschchen — dieser Durchgang bleibt unbewertet.</p>
        {:else if kontrastAuswertung}
          <p class="ergebnis" class:richtig={kontrastAuswertung.ergebnis === 'richtig'}>
            {#if kontrastAuswertung.ergebnis === 'richtig'}
              Richtig — erst „{kontrastAuswertung.ersteOption.label}“, dann „{kontrastAuswertung.zweiteOption.label}“.
            {:else}
              Daneben — es war erst „{kontrastAuswertung.ersteOption.label}“, dann „{kontrastAuswertung.zweiteOption.label}“.
            {/if}
          </p>
        {/if}
        <div class="knopfreihe">
          <Knopf stufe="primaer" onKlick={zurueckZurUebersicht}>zur Übersicht</Knopf>
        </div>
      {/if}
    </div>
    {#if fehler}<p class="fehler">{fehler}</p>{/if}
  {:else if phase === 'reverse'}
    <div class="frage-block">
      {#if reverseSchritt === 'wahl'}
        <p class="frage-satz">Welches Aroma willst du reverse üben?</p>
        <AuswahlListe
          optionen={nummernOptionen}
          wert={reverseAromaId}
          onWahl={(w) => (reverseAromaId = w)}
          platzhalter="Aroma oder Nummer suchen …"
          suchbar
        />
        <div class="knopfreihe">
          <Knopf stufe="primaer" onKlick={reverseDurchgangStarten} deaktiviert={!reverseAromaId}>weiter</Knopf>
        </div>
      {:else if reverseSchritt === 'riechen' && reverseOption}
        <p class="frage-titel">{reverseOption.label}</p>
        <p class="frage-satz">
          Stell dir vor, wie es riecht. Dann öffne Nr. {reverseOption.nummer} und riech.
        </p>
        <div class="knopfreihe">
          <Knopf stufe="primaer" onKlick={() => (reverseSchritt = 'einschaetzung')}>gerochen</Knopf>
        </div>
      {:else if reverseSchritt === 'einschaetzung'}
        <p class="frage-titel">Getroffen?</p>
        <Segment
          optionen={[
            { wert: 'getroffen', label: 'getroffen' },
            { wert: 'daneben', label: 'daneben' },
          ]}
          wert={reverseEinschaetzung}
          onWahl={(w) => (reverseEinschaetzung = w)}
        />
        <div class="knopfreihe">
          <Knopf stufe="primaer" onKlick={reverseAufloesen} deaktiviert={!reverseEinschaetzung}>fertig</Knopf>
        </div>
      {:else if reverseSchritt === 'fertig'}
        <p class="frage-satz">Selbsteinschätzung gespeichert — ohne Wirkung auf die Boxen, reine Übung.</p>
        <div class="knopfreihe">
          <Knopf stufe="primaer" onKlick={zurueckZurUebersicht}>zur Übersicht</Knopf>
        </div>
      {/if}
    </div>
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
  /* Kennzahl-Kacheln — 1:1 aus Bar.svelte übernommen (dort ausführlich
     begründet: Zeilenklammerung, Mindestbreite gegen horizontales Scrollen
     auf dem S25, kurze statt umgebrochener Labels). Zwei rotierende Fakten
     aus domain/uebungsauswertung.ts::uebungsKennzahlenPool statt der
     rohen Fünf-Boxen-Liste, die vorher hier stand (die volle Aufschlüsselung
     lebt jetzt auf der Statistik-Seite). */
  .kennzahl-raster {
    margin-bottom: var(--r4);
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--r-kachelabstand);
  }
  .kennzahl-raster.einzeln {
    grid-template-columns: 1fr;
  }
  .kennzahl-kachel {
    background: var(--blatt);
    border-radius: var(--r-kachel);
    padding: 12px 16px 11px;
    min-height: 100px;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .kennzahl-label {
    font-family: var(--schrift-sans);
    font-size: var(--fs-kachel-label);
    letter-spacing: var(--label-spacing-kachel);
    text-transform: uppercase;
    color: var(--gedaempft);
    line-height: 1.35;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .kennzahl-zahl {
    font-size: var(--fs-wert);
    line-height: 1.15;
    color: var(--tinte);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    overflow-wrap: break-word;
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
