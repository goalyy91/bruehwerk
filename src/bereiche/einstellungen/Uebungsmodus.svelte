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
  // Seit Etappe 3 des Lern-Nachzugs: bis zu vier Paare je Durchgang, jedes
  // Paar für sich verdeckt; "durchgang starten" wählt in etwa jedem vierten
  // Fall selbst einen Kontrastdurchgang (domain/uebung.ts::waehleDurchgangsart).
  // Ein Paar bewegt keine Box, nur den Verwechslungszähler.
  //
  // Reverse — ungescort, ohne jede Wirkung auf Box/Fälligkeit: kein Aufruf
  // von `schreiben('uebung', …)` in reverseAufloesen(). Nicht blind: du
  // suchst das Fläschchen gezielt (Name + Nummer stehen offen), das ist der
  // Witz der Übung.
  //
  // Bekannte Lücke: die harte Obergrenze von 12 Riechvorgängen
  // (domain/uebung.ts::RIECHGRENZE, inklusive Nachriechen) gilt hier nur je
  // einzelnem Durchgang (8 normal + bis zu 4 Nachriechen, 2 Kontrast,
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
    nachriechenAngebracht,
    verwechslungspaare,
    werteKontrastAus,
    kontrastpaare,
    waehleDurchgangsart,
    kontrastNachriechenAngebracht,
    type Kontrastpaar,
    reverseVorschlag,
    DURCHGANG_GROESSE,
    type AromaOption,
    type GesamtStand,
    type AntwortAuswertung,
  } from '../../domain/uebung';
  import { einfuehrungErlaubt } from '../../domain/leitner';
  import { uebungsKennzahlenPool, zielfrequenzAbgleich } from '../../domain/uebungsauswertung';
  import { meilensteinSatz } from '../../domain/meilenstein';
  import { waehleKennzahlen, type Kennzahl } from '../../domain/hinweise';
  import { uebungsBegruessung } from '../../domain/begruessung';
  import { datenblattZu, type AromaDatenblatt } from '../../daten/aroma-datenblaetter';
  import { merkhilfeZu } from '../../daten/aroma-merkhilfen';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import AuswahlListe from '../../muster/AuswahlListe.svelte';
  import Segment from '../../muster/Segment.svelte';
  import Knopf from '../../muster/Knopf.svelte';
  import Schalter from '../../muster/Schalter.svelte';
  import Blattliste from '../../muster/Blattliste.svelte';
  import Blattzeile from '../../muster/Blattzeile.svelte';
  import Kontextmenue from '../../muster/Kontextmenue.svelte';
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
  const sperreAktiv = $derived(!einfuehrungErlaubt(eingefuehrteZustaende.filter((z) => !z.zaeh).map((z) => z.box)));

  /** kategorieId -> Familienname, fuer domain/uebungsauswertung.ts::uebungsKennzahlenPool — die Domäne kennt das Aromaset selbst nicht. */
  const familienLabels = $derived(new Map(familien.map((f) => [f.wert, f.label] as const)));

  let kennzahlenAuswahl = $state<readonly Kennzahl[]>([]);

  // Begrüßung analog zur Bar (domain/begruessung.ts::uebungsBegruessung) —
  // Livebetrieb-Rückmeldung: die Übersicht hatte keinen Kopf, der Raum
  // beansprucht. Gezogen im selben Effekt wie die Kennzahlen, nicht als
  // eigener Top-Level-`const` wie bei der Bar: dort remountet die Komponente
  // bei jeder Rückkehr komplett, hier teilen sich Übersicht und laufende
  // Aktivität dieselbe Komponente über den `aktiv`-Umschalter.
  let begruessungsText = $state<{ label?: string; satz: string }>({ satz: '' });

  // Reverse-Vorschlag (Julians Idee): ein zufällig gezogenes Aroma aus der
  // niedrigsten Box unter den eingeführten — "damit tust du dich schwer".
  // Zusätzlich zum bestehenden "reverse üben"-Knopf, nicht statt ihm.
  let reverseVorschlagOption = $state<AromaOption | undefined>(undefined);

  // Zielfrequenz-Hinweis, zurückgeholt von der Statistik-Seite auf die
  // Übersicht: domain/uebungsauswertung.ts::zielfrequenzAbgleich ist laut
  // eigenem Kopfkommentar "ausschließlich für den Hinweis auf der
  // Übersicht" gedacht — er schlägt vor, das Ziel zu senken, nicht mehr zu
  // üben, und erscheint erst nach einigen Wochen Geschichte.
  let zielfrequenzHinweis = $state<string | undefined>(undefined);

  $effect(() => {
    if (aktiv || !set) return;
    untrack(() => {
      const jetzt = Date.now();
      const eigeneDurchgaenge = bestand.uebungsdurchgaenge.filter((d) => d.setId === set.id);
      // Backlog 2026-09-14: nur tatsaechlich beendete "normal"-Durchgaenge
      // zaehlen fuer Kennzahl/Zielabgleich — sonst verfaelscht ein
      // abgebrochener oder noch laufender Durchgang die Zaehlbasis. Dieselbe
      // Filterung wie UebungsAuswertung.svelte::durchgaengeBegonnenAm.
      const durchgaengeBegonnenAm = eigeneDurchgaenge
        .filter((d) => d.art === 'normal' && d.status === 'abgeschlossen')
        .map((d) => d.begonnenAm);
      const zielProWoche = bestand.einstellungen?.uebungZielProWoche;

      const pool = uebungsKennzahlenPool({
        eingefuehrteZustaende,
        antworten: bestand.uebungsantworten.filter((a) => a.setId === set.id),
        durchgaengeBegonnenAm,
        aromen: alleAromen,
        familienLabels,
        gesamtAnzahlAromen: alleAromen.length,
        jetzt,
        zielProWoche,
      });
      kennzahlenAuswahl = waehleKennzahlen(pool, 2);

      const kuerzlichAbgeschlossen = eigeneDurchgaenge.some(
        (d) => d.status === 'abgeschlossen' && d.abgeschlossenAm !== undefined && jetzt - d.abgeschlossenAm < 15 * 60_000,
      );
      begruessungsText = uebungsBegruessung(new Date(jetzt), {
        geradeAbgeschlossen: kuerzlichAbgeschlossen,
        nochNichtsEingefuehrt: eingefuehrteZustaende.length === 0,
      });

      reverseVorschlagOption = reverseVorschlag(alleAromen, bekannteStaende, jetzt);

      const abgleich = zielProWoche ? zielfrequenzAbgleich(zielProWoche, durchgaengeBegonnenAm, jetzt) : undefined;
      zielfrequenzHinweis =
        abgleich?.weichtAb && zielProWoche
          ? `Faktisch ${abgleich.faktischProWoche.toFixed(1)}× pro Woche statt ${zielProWoche}× — Ziel anpassen?`
          : undefined;
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

  /**
   * Höchstens ein laufender Durchgang je Set — ein alter, nie beendeter
   * (vor "abbrechen" weiter unten der Normalfall bei jedem Verlassen
   * mitten drin) wird beim Start eines neuen automatisch mitbeendet, statt
   * liegen zu bleiben und irgendwann zufällig statt des neuen gefunden zu
   * werden (`db.getAll` liefert nach UUID-Schlüssel, nicht nach Zeit —
   * siehe versucheWiederaufnahme() weiter unten).
   */
  async function alteLaufendeDurchgaengeAufraeumen() {
    if (!set) return;
    const alte = bestand.uebungsdurchgaenge.filter(
      (d) => d.setId === set!.id && (d.status === 'bereitlegen' || d.status === 'laufend'),
    );
    for (const alt of alte) {
      await schreiben('uebungsdurchgang', { ...alt, status: 'abgebrochen', abgeschlossenAm: Date.now() });
    }
  }

  async function durchgangStarten() {
    if (!set) return;
    // Etwa jeder vierte Durchgang wird ein Kontrastdurchgang, sobald drei
    // Paare da sind (domain/uebung.ts::waehleDurchgangsart).
    const paare = kontrastpaare(alleAromen, bekannteStaende, Date.now());
    if (waehleDurchgangsart(paare.length) === 'kontrast') {
      await kontrastdurchgangStarten(paare);
      return;
    }
    await alteLaufendeDurchgaengeAufraeumen();
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
      nachgerochen: 0,
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

  /** Startet einen Kontrastdurchgang — ohne Argument (Vorschlagskarte) mit den aktuell besten Paaren. */
  async function kontrastdurchgangStarten(paare: readonly Kontrastpaar[] = kontrastpaare(alleAromen, bekannteStaende, Date.now())) {
    if (!set || paare.length === 0) return;
    await alteLaufendeDurchgaengeAufraeumen();
    const jetzt = Date.now();
    const ids = paare.flatMap((p) => [p.aId, p.bId]);
    const neu: SammlungWert['uebungsdurchgang'] = {
      id: neueId(),
      setId: set.id,
      art: 'kontrast',
      status: 'bereitlegen',
      verdeckt: ids,
      abgefragt: ids,
      zusatz: [],
      beantwortet: [],
      nachgerochen: 0,
      paare: paare.map((p) => [p.aId, p.bId] as [string, string]),
      begonnenAm: jetzt,
    };
    try {
      await schreiben('uebungsdurchgang', neu);
      durchgang = neu;
      kontrastIndex = 0;
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

  /**
   * Die Paare eines Kontrastdurchgangs als Optionen, in Abfragereihenfolge.
   * Ein älterer Durchgang ohne `paare` hatte genau eins — aus `verdeckt`.
   */
  const kontrastPaarListe = $derived.by((): readonly (readonly [AromaOption, AromaOption])[] => {
    if (durchgang?.art !== 'kontrast') return [];
    const roh: readonly (readonly [string, string])[] =
      durchgang.paare && durchgang.paare.length > 0 ? durchgang.paare : [[durchgang.verdeckt[0] ?? '', durchgang.verdeckt[1] ?? '']];
    const zuOption = (id: string) => alleAromen.find((a) => a.id === id);
    return roh
      .map(([a, b]) => [zuOption(a), zuOption(b)] as const)
      .filter((p): p is readonly [AromaOption, AromaOption] => p[0] !== undefined && p[1] !== undefined);
  });
  /** Welches Paar gerade dran ist — beim Start 0, beim Fortsetzen aus `beantwortet`. */
  let kontrastIndex = $state(0);
  /** Die zwei Aromen des aktuellen Paars, in der beim Start festgelegten (beliebigen, aber stabilen) Reihenfolge. */
  const kontrastOptionen = $derived(kontrastPaarListe[kontrastIndex] ?? []);

  async function bereitgelegt() {
    if (!durchgang) return;
    const aktualisiert: SammlungWert['uebungsdurchgang'] = { ...durchgang, status: 'laufend' };
    try {
      await schreiben('uebungsdurchgang', aktualisiert);
      durchgang = aktualisiert;
      if (aktualisiert.art === 'kontrast') {
        kontrastIndex = 0;
        kontrastSchrittZuruecksetzen();
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
  /** "nur geraten" — ein Treffer zählt dann für die Box wie ein Teilerfolg (domain/uebung.ts::werteAntwortAus). */
  let tipGeraten = $state(false);

  interface LetzteAuswertung {
    readonly ergebnis: 'richtig' | 'teilweise' | 'falsch';
    readonly tatsaechlicheOption: AromaOption;
    readonly unerwarteteNummer: boolean;
    /** Nur gesetzt, wenn ein Familientipp danebenlag (Stufe A/B, ergebnis "falsch") — welche Familie es gewesen wäre. */
    readonly korrekteFamilie?: string;
    /** Ein Satz dazu, was die Antwort für den Lernstand des gezogenen Aromas heißt — nur, wenn es etwas zu sagen gibt. */
    readonly lernstandHinweis?: string;
    /**
     * Gesetzt, wenn zum Nachriechen aufgefordert wird (domain/uebung.ts::
     * nachriechenAngebracht): die Merkhilfe des gezogenen Aromas und — bei
     * einer echten Verwechslung — die des getippten daneben.
     */
    readonly nachriechen?: {
      readonly merkhilfe?: string;
      readonly tipp?: { readonly label: string; readonly merkhilfe?: string };
    };
  }
  /** true, sobald "nachgerochen" angetippt wurde — erst dann läuft die Riechpause. */
  let nachgerochenErledigt = $state(false);
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
    tipGeraten = false;
    nachgerochenErledigt = false;
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
        tipAromaFamilieId: tipAroma ? alleAromen.find((a) => a.id === tipAroma)?.kategorieId : undefined,
        geraten: tipGeraten,
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
        ...bisherigeUebung,
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
        abrufSerie: auswertung.abrufSerie,
        abrufSerieZuletzt: auswertung.abrufSerieZuletzt,
        familieFalschSerie: auswertung.familieFalschSerie,
        fehlerSerie: auswertung.fehlerSerie,
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
        geraten: tipGeraten || undefined,
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

    letzteAuswertung = {
      ergebnis: auswertung.ergebnis,
      tatsaechlicheOption,
      unerwarteteNummer,
      korrekteFamilie,
      lernstandHinweis: lernstandHinweis(auswertung, tatsaechlicheOption.label),
      nachriechen: nachriechenAngebracht(auswertung, durchgang.nachgerochen)
        ? {
            merkhilfe: merkhilfeZu(tatsaechlicheOption.nummer),
            tipp: verwechseltMit(tipAroma, tatsaechlicheId),
          }
        : undefined,
    };
    itemPhase = 'aufgeloest';
    // Keine Pause nach dem letzten Item — niemand riecht danach noch etwas,
    // fuer das sich die Nase erholen muesste.
    // Mit Nachriechen startet die Pause erst nach dem zweiten Riechen (siehe
    // nachgerochen()) — sonst laege zwischen ihm und dem naechsten Fläschchen
    // nur der Rest der 25 Sekunden.
    if (!letzteAuswertung.nachriechen && index + 1 < DURCHGANG_GROESSE) starteRiechpause();
  }

  /**
   * Höchstens ein Satz, und nur wenn er etwas sagt (dieselbe Haltung wie
   * domain/meilenstein.ts): ein Stufenwechsel, eine Antwort ohne Aussage
   * über den Lernstand, ein als geraten markierter Treffer.
   */
  function lernstandHinweis(a: AntwortAuswertung, name: string): string | undefined {
    if (a.stufenwechsel === 'auf') {
      return a.stufe === 'c'
        ? `„${name}“ steigt auf: ab jetzt freier Abruf aus allen 60.`
        : `„${name}“ steigt auf: ab jetzt auch das Aroma innerhalb der Familie.`;
    }
    if (a.stufenwechsel === 'ab') return `„${name}“ übt wieder mit Familienwahl — die Familie lag zweimal daneben.`;
    if (a.wertung === 'aufgefrischt') return `„${name}“ war lange nicht dran — als aufgefrischt gewertet, kommt bald wieder.`;
    if (a.wertung === 'ohneAussage') return `Zählt nicht für „${name}“: das Aroma ist schon weiter als diese Frage.`;
    if (tipGeraten && a.ergebnis === 'richtig') return 'Als geraten markiert — zählt wie ein Teilerfolg.';
    return undefined;
  }

  function verwechseltMit(getipptId: string, tatsaechlicheId: string): { label: string; merkhilfe?: string } | undefined {
    if (!getipptId || getipptId === tatsaechlicheId) return undefined;
    const getippt = alleAromen.find((a) => a.id === getipptId);
    return getippt ? { label: getippt.label, merkhilfe: merkhilfeZu(getippt.nummer) } : undefined;
  }

  async function nachgerochen() {
    if (!durchgang || nachgerochenErledigt) return;
    nachgerochenErledigt = true;
    const aktualisiert: SammlungWert['uebungsdurchgang'] = { ...durchgang, nachgerochen: durchgang.nachgerochen + 1 };
    try {
      await schreiben('uebungsdurchgang', aktualisiert);
      durchgang = aktualisiert;
    } catch (e) {
      fehler = e instanceof Error ? e.message : String(e);
    }
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
    | {
        readonly ergebnis: 'richtig' | 'falsch';
        readonly ersteOption: AromaOption;
        readonly zweiteOption: AromaOption;
        /** Gesetzt, wenn beide noch einmal gerochen werden sollen (domain/uebung.ts::kontrastNachriechenAngebracht). */
        readonly nachriechen?: { readonly ersteMerkhilfe?: string; readonly zweiteMerkhilfe?: string };
      }
    | undefined
  >(undefined);
  let kontrastNachgerochenErledigt = $state(false);

  const kontrastLetztesPaar = $derived(kontrastIndex + 1 >= kontrastPaarListe.length);

  const kontrastFrageOptionen = $derived(
    kontrastOptionen.length === 2
      ? [
          { wert: 'a-zuerst', label: `erst ${kontrastOptionen[0]!.label}, dann ${kontrastOptionen[1]!.label}` },
          { wert: 'b-zuerst', label: `erst ${kontrastOptionen[1]!.label}, dann ${kontrastOptionen[0]!.label}` },
        ]
      : [],
  );

  function kontrastSchrittZuruecksetzen() {
    kontrastSchritt = 'erstesRiechen';
    kontrastReihenfolge = '';
    kontrastErsteNummer = '';
    kontrastUnerwartet = false;
    kontrastAuswertung = undefined;
    kontrastNachgerochenErledigt = false;
  }

  function kontrastErstesGerochen() {
    kontrastSchritt = 'zweitesRiechen';
    starteRiechpause();
  }

  /** Ein Paar ist erledigt: `beantwortet` wächst um beide Ids, beim letzten Paar endet der Durchgang. */
  function kontrastDurchgangNachPaar(d: SammlungWert['uebungsdurchgang'], paarIds: readonly string[], jetzt: number): SammlungWert['uebungsdurchgang'] {
    const letztes = kontrastLetztesPaar;
    return {
      ...d,
      beantwortet: [...d.beantwortet, ...paarIds],
      status: letztes ? 'abgeschlossen' : d.status,
      abgeschlossenAm: letztes ? jetzt : undefined,
    };
  }

  /** Schreibt nur die Verwechslungsliste fort — ein Kontrastpaar bewegt keine Box (domain/uebung.ts::werteKontrastAus). */
  async function verwechslungenSchreiben(aromaId: string, verwechslungen: Readonly<Record<string, number>>, jetzt: number) {
    const bisherige = bestand.uebungen.find((u) => u.setId === set!.id && u.aromaId === aromaId);
    await schreiben('uebung', {
      ...bisherige,
      id: bisherige?.id ?? neueId(),
      setId: set!.id,
      aromaId,
      benennen: bisherige?.benennen ?? { versuche: 0, treffer: 0 },
      unterscheiden: bisherige?.unterscheiden ?? { versuche: 0, treffer: 0 },
      verwechslungen: { ...verwechslungen },
      letzterVersuch: jetzt,
      familienSerie: bisherige?.familienSerie ?? 0,
      abrufSerie: bisherige?.abrufSerie ?? 0,
      familieFalschSerie: bisherige?.familieFalschSerie ?? 0,
      fehlerSerie: bisherige?.fehlerSerie ?? 0,
    });
  }

  async function kontrastAufloesen() {
    if (!durchgang || !set || !kontrastErsteNummer || kontrastOptionen.length !== 2) return;
    const [optA, optB] = kontrastOptionen as readonly [AromaOption, AromaOption];
    const ersteId = kontrastErsteNummer;
    const jetzt = Date.now();

    if (ersteId !== optA.id && ersteId !== optB.id) {
      // Seltener echter Bereitlegen-Fehler: die Nummer gehört nicht zu diesem
      // Paar. Bei nur zwei Fläschchen trägt "das jeweils andere" als
      // Grundlage für die zweite Identität nicht mehr — dieses Paar bleibt
      // unbewertet, ehrlich benannt, und es geht mit dem nächsten weiter.
      try {
        const aktualisiert = kontrastDurchgangNachPaar(durchgang, [optA.id, optB.id], jetzt);
        await schreiben('uebungsdurchgang', aktualisiert);
        durchgang = aktualisiert;
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
      if (!kontrastLetztesPaar) starteRiechpause();
      return;
    }

    const ersteOption = ersteId === optA.id ? optA : optB;
    const zweiteOption = ersteId === optA.id ? optB : optA;
    const gewaehlteAWarErste = kontrastReihenfolge === 'a-zuerst';
    const tatsaechlichAWarErste = ersteId === optA.id;
    const auswertung = werteKontrastAus(gewaehlteAWarErste === tatsaechlichAWarErste, optA.id, optB.id, staende.get(optA.id), staende.get(optB.id));

    try {
      await verwechslungenSchreiben(optA.id, auswertung.aVerwechslungen, jetzt);
      await verwechslungenSchreiben(optB.id, auswertung.bVerwechslungen, jetzt);
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
      const aktualisiert = kontrastDurchgangNachPaar(durchgang, [optA.id, optB.id], jetzt);
      await schreiben('uebungsdurchgang', aktualisiert);
      durchgang = aktualisiert;
    } catch (e) {
      fehler = e instanceof Error ? e.message : String(e);
      return;
    }

    const nachriechen = kontrastNachriechenAngebracht(auswertung.ergebnis, kontrastPaarListe.length, durchgang.nachgerochen)
      ? { ersteMerkhilfe: merkhilfeZu(ersteOption.nummer), zweiteMerkhilfe: merkhilfeZu(zweiteOption.nummer) }
      : undefined;
    kontrastAuswertung = { ergebnis: auswertung.ergebnis, ersteOption, zweiteOption, nachriechen };
    kontrastSchritt = 'aufgeloest';
    // Mit Nachriechen startet die Pause erst danach (kontrastNachgerochen).
    if (!nachriechen && !kontrastLetztesPaar) starteRiechpause();
  }

  async function kontrastNachgerochen() {
    if (!durchgang || kontrastNachgerochenErledigt) return;
    kontrastNachgerochenErledigt = true;
    const aktualisiert: SammlungWert['uebungsdurchgang'] = { ...durchgang, nachgerochen: durchgang.nachgerochen + 2 };
    try {
      await schreiben('uebungsdurchgang', aktualisiert);
      durchgang = aktualisiert;
    } catch (e) {
      fehler = e instanceof Error ? e.message : String(e);
    }
    if (!kontrastLetztesPaar) starteRiechpause();
  }

  function kontrastWeiter() {
    if (kontrastLetztesPaar) {
      zurueckZurUebersicht();
      return;
    }
    kontrastIndex += 1;
    kontrastSchrittZuruecksetzen();
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
    await alteLaufendeDurchgaengeAufraeumen();
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
      nachgerochen: 0,
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

  /**
   * `aromaId` als Feld, NICHT als Schluessel fuer das {#each} unten: dasselbe
   * Aroma kann in `durchgang.beantwortet` zweimal stehen (wenn beim Ablesen
   * zweimal dieselbe Nummer eingetippt wird — ein Bereitlegen-Fehler, siehe
   * `unerwarteteNummer` oben, aber keiner, der die Auswertung verhindert).
   * Vorher schluesselte hier `muster/Werteliste.svelte` ueber `zeile.label` —
   * bei einem doppelten Aroma-Label ein doppelter Schluessel, und Svelte
   * bricht beim Rendern ab. Der Aufrufer unten schluesselt stattdessen ueber
   * den Index.
   */
  interface RundenZeile {
    readonly aromaId: string;
    readonly label: string;
    readonly ergebnis: 'richtig' | 'teilweise' | 'falsch' | undefined;
    readonly ergebnisText: string;
    readonly hinweis?: string;
    readonly nummer?: number;
  }

  const rundenZeilen = $derived<RundenZeile[]>(
    (durchgang?.beantwortet ?? []).map((aromaId) => {
      const antwort = bestand.uebungsantworten.find((a) => a.durchgangId === durchgang?.id && a.aromaId === aromaId);
      const option = alleAromen.find((a) => a.id === aromaId);
      // Nur bei Stufe A/B (Familientipp) — Stufe C (freier Abruf) hat keine
      // Familie getippt, bleibt ohne Hinweiszeile.
      const hinweis =
        antwort && (antwort.form === 'familie' || antwort.form === 'aromaInFamilie') && antwort.getipptFamilieId
          ? `getippt: ${familieVon(antwort.getipptFamilieId)} · richtig: ${familieVon(option?.kategorieId)}`
          : undefined;
      return {
        aromaId,
        label: option?.label ?? '?',
        ergebnis: antwort?.ergebnis,
        ergebnisText: antwort?.ergebnis ? ERGEBNIS_TEXT[antwort.ergebnis] : '',
        hinweis,
        nummer: option?.nummer,
      };
    }),
  );
  const richtigAnzahl = $derived(rundenZeilen.filter((z) => z.ergebnis === 'richtig').length);

  /**
   * Hoechstens ein Meilenstein-Satz, nur wenn er wahr ist (domain/meilenstein.ts,
   * dort ausfuehrlich begruendet: kein Zaehler, keine Serie — bei einem
   * schwachen Durchgang bleibt die Stelle leer, das ist der Punkt). Nur bei
   * abgeschlossenem "normal"-Durchgang, nicht waehrend eines Neu-Mounts, bei
   * dem `durchgang` noch nicht geladen ist.
   */
  const meilenstein = $derived.by(() => {
    const aktuellerDurchgang = durchgang;
    if (!aktuellerDurchgang || aktuellerDurchgang.status !== 'abgeschlossen') return undefined;
    const alleAntwortenDiesesSets = bestand.uebungsantworten.filter((a) => a.setId === aktuellerDurchgang.setId);
    return meilensteinSatz({
      durchgangAntworten: alleAntwortenDiesesSets.filter((a) => a.durchgangId === aktuellerDurchgang.id),
      vorherigeAntworten: alleAntwortenDiesesSets.filter((a) => a.durchgangId !== aktuellerDurchgang.id),
      labelVon: (id) => alleAromen.find((a) => a.id === id)?.label ?? id,
    });
  });

  function datenblattVorhanden(nummer: number | undefined): boolean {
    return nummer !== undefined && datenblattZu(nummer) !== undefined;
  }

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
    kontrastIndex = 0;
    kontrastSchrittZuruecksetzen();
    reverseSchritt = 'wahl';
    reverseAromaId = '';
    reverseEinschaetzung = '';
    onZurueck();
  }

  /**
   * Bricht den laufenden Durchgang absichtlich ab (Kopfzeile-Kontextmenü,
   * nur waehrend er noch offen ist) — bisher gab es dafuer keinen Weg,
   * jedes Verlassen mitten drin liess einen ewig unfertigen Datensatz
   * zurueck. Bereits beantwortete Items bleiben als echte Uebungsantwort-
   * Eintraege stehen, nur die Huelle endet.
   */
  async function durchgangAbbrechen() {
    if (!durchgang) return;
    try {
      await schreiben('uebungsdurchgang', { ...durchgang, status: 'abgebrochen', abgeschlossenAm: Date.now() });
    } catch (e) {
      fehler = e instanceof Error ? e.message : String(e);
      return;
    }
    zurueckZurUebersicht();
  }

  /** Übersicht → Reverse: Aromawahl zurücksetzen, kein Durchgang bis zur Bestätigung. */
  function reverseUeben() {
    reverseSchritt = 'wahl';
    reverseAromaId = '';
    reverseEinschaetzung = '';
    phase = 'reverse';
    navigation.gehe({ name: 'uebungLaufend' });
  }

  /**
   * Übersicht → Reverse, direkt mit dem vorgeschlagenen Aroma — überspringt
   * den Such-Schritt ('wahl'). Reihenfolge ist hier der Kniff: erst
   * schreiben (reverseDurchgangStarten legt den Durchgang an und setzt
   * reverseSchritt = 'riechen'), erst danach navigieren. Der anschließende
   * Remount (siehe versucheWiederaufnahme()) liest den frisch geschriebenen
   * Durchgang zurück und stellt genau diesen Riechen-Schritt wieder her —
   * keine eigene Zustandsmaschine nötig.
   */
  async function reverseVorschlagUeben() {
    if (!reverseVorschlagOption) return;
    reverseAromaId = reverseVorschlagOption.id;
    phase = 'reverse';
    await reverseDurchgangStarten();
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
  // Wichtig: db.getAll (daten/ablage.ts) liefert Datensaetze nach UUID-
  // Schluessel (daten/id.ts::neueId), nicht nach Zeit — bei mehr als einem
  // unfertigen Durchgang waere ein blosses .find() Gluecksspiel. Kommt seit
  // alteLaufendeDurchgaengeAufraeumen() (oben) im Normalfall nicht mehr vor,
  // aber Altbestand aus der Zeit davor kann noch mehrere unfertige
  // Durchgaenge enthalten — deshalb bewusst nach zuletzt begonnen aufgeloest,
  // nicht auf "kommt nie vor" vertraut.
  function versucheWiederaufnahme() {
    if (!set) return;
    const eigene = bestand.uebungsdurchgaenge.filter((d) => d.setId === set!.id);

    const laufende = eigene.filter((d) => d.status === 'bereitlegen' || d.status === 'laufend');
    const laufender = laufende.reduce<(typeof laufende)[number] | undefined>(
      (bisher, d) => (!bisher || d.begonnenAm > bisher.begonnenAm ? d : bisher),
      undefined,
    );
    if (!laufender) {
      // Kein laufender Durchgang mehr — evtl. gerade eben (normal) fertig
      // geworden, aber durch einen Neu-Mount (z. B. Bildschirmsperre) noch
      // nicht angesehen: die Ende-Zusammenfassung ginge sonst ersatzlos
      // verloren (Livebetrieb-Rückmeldung "Zusammenfassung kam nicht").
      // Kurzes Fenster, damit ein laengst betrachteter Abschluss nicht
      // Wochen spaeter ungefragt wieder aufploppt. Nur "normal": Kontrast/
      // Reverse loesen synchron im selben Funktionsaufruf auf (kein Remount
      // dazwischen im Normalfall), und ihre genaue Auflösungs-Formulierung
      // laesst sich aus den gespeicherten Daten nicht mehr rekonstruieren —
      // anders als rundenZeilen, das vollstaendig aus Uebungsantwort neu
      // gebaut wird.
      const ENDE_ANSICHT_FENSTER_MS = 5 * 60_000;
      const geradeFertig = eigene
        .filter((d) => d.art === 'normal' && d.status === 'abgeschlossen' && d.abgeschlossenAm !== undefined)
        .filter((d) => Date.now() - d.abgeschlossenAm! < ENDE_ANSICHT_FENSTER_MS)
        .reduce<(typeof eigene)[number] | undefined>(
          (bisher, d) => (!bisher || d.abgeschlossenAm! > bisher.abgeschlossenAm! ? d : bisher),
          undefined,
        );
      if (geradeFertig) {
        durchgang = geradeFertig;
        index = geradeFertig.beantwortet.length;
        phase = 'ende';
        return;
      }
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
      kontrastIndex = Math.floor(laufender.beantwortet.length / 2);
      kontrastSchrittZuruecksetzen();
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

  // ---- Datenblatt-Overlay: Hardware-Zurück schliesst nur das Overlay ------
  // (Livebetrieb-Rückmeldung: bisher poppte Zurueck durch die ganze
  // 'uebungLaufend'-Route, weil das Overlay keinen eigenen Verlaufs-Eintrag
  // hatte.) navigation.ueberlagerungOeffnen()/-Schliessen() (navigation.svelte.ts)
  // geben ihm genau einen.
  $effect(() => {
    if (!datenblatt) return;
    navigation.ueberlagerungOeffnen();
    let ueberHardwareZurueck = false;
    const schliessen = () => {
      ueberHardwareZurueck = true;
      datenblatt = undefined;
    };
    window.addEventListener('popstate', schliessen);
    return () => {
      window.removeEventListener('popstate', schliessen);
      // Geschlossen ueber den Pfeil im Datenblatt (datenblatt = undefined
      // direkt gesetzt), nicht ueber Hardware-Zurueck — dann steht der
      // zusaetzliche Verlaufs-Eintrag noch und muss selbst abgeraeumt werden.
      if (!ueberHardwareZurueck) navigation.ueberlagerungSchliessen();
    };
  });
</script>

{#if datenblatt}
  <Aromadatenblatt blatt={datenblatt} onZurueck={() => (datenblatt = undefined)} onVerweis={(nummer) => (datenblatt = datenblattZu(nummer) ?? datenblatt)} />
{:else}
  <!-- Aromaschule ist ein eigener Hauptbereich (Tab-Wurzel) — auf der
       Übersicht deshalb gar keine Kopfzeile, wie Bar.svelte: der Tab zeigt
       den Namen schon aktiv an, die Begrüßung darunter trägt die
       Headline-Rolle. In der laufenden Aktivität bleibt die kleine
       Kopfzeile mit Rückweg wie bisher. -->
  {#if aktiv}
    <Kopfzeile titel="Aromaschule" {onZurueck}>
      {#snippet aktion()}
        {#if durchgang && durchgang.status !== 'abgeschlossen'}
          <Kontextmenue eintraege={[{ text: 'abbrechen', kritisch: true, onWahl: durchgangAbbrechen }]} />
        {/if}
      {/snippet}
    </Kopfzeile>
  {/if}

  {#if !set}
    <p class="hinweis">Noch keine Aromen mit Fläschchennummern erfasst.</p>
  {:else if alleAromen.length === 0}
    <p class="hinweis">Noch keine Fläschchen erfasst.</p>
  {:else if !aktiv}
    <header class="begruessungsblock">
      {#if begruessungsText.label}<p class="tageszeit-label">{begruessungsText.label}</p>{/if}
      <p class="begruessung">{begruessungsText.satz}</p>
    </header>
    {#if sperreAktiv}
      <p class="hinweis">Erst festigen, dann Neues.</p>
    {/if}
    <div class="jetzt-zone">
      {#if zielfrequenzHinweis}
        <Knopf stufe="still" onKlick={onOeffnenStatistik}>{zielfrequenzHinweis}</Knopf>
      {/if}
      <Knopf stufe="primaer" onKlick={durchgangStarten}>durchgang starten</Knopf>
      <Knopf onKlick={reverseUeben}>reverse üben</Knopf>
    </div>

    {#if kontrastKandidat || reverseVorschlagOption}
      <div class="vorschlaege">
        <h2>Vorschläge</h2>
        <div class="bestandliste">
          {#if kontrastKandidat}
            <button type="button" class="bestandkarte" onclick={() => kontrastdurchgangStarten()}>
              <div class="bestandkarte-text">
                <span class="bestandkarte-name">{kontrastKandidatLabelA} · {kontrastKandidatLabelB}</span>
                <span class="bestandkarte-meta">oft verwechselt — als Kontrastdurchgang üben</span>
              </div>
            </button>
          {/if}
          {#if reverseVorschlagOption}
            <button type="button" class="bestandkarte" onclick={reverseVorschlagUeben}>
              <div class="bestandkarte-text">
                <span class="bestandkarte-name">{reverseVorschlagOption.label}</span>
                <span class="bestandkarte-meta">schwer getan — gezielt reverse üben</span>
              </div>
            </button>
            {#if reverseVorschlagOption.nummer !== undefined && datenblattZu(reverseVorschlagOption.nummer)}
              <Knopf stufe="still" onKlick={() => (datenblatt = datenblattZu(reverseVorschlagOption!.nummer!))}>Datenblatt ansehen</Knopf>
            {/if}
          {/if}
        </div>
      </div>
    {/if}

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
    <div class="block">
      <Blattliste>
        <Blattzeile label="Statistik" akzent onKlick={onOeffnenStatistik} />
      </Blattliste>
    </div>
    {#if fehler}<p class="fehler">{fehler}</p>{/if}
  {:else if phase === 'bereitlegen'}
    <div class="frage-block">
      {#if durchgang?.art === 'kontrast' && kontrastPaarListe.length > 0}
        <p class="frage-satz">
          {kontrastPaarListe.length === 1 ? 'Ein Paar' : `${kontrastPaarListe.length} Paare`} — lege jedes für sich verdeckt bereit, so dass
          du innerhalb eines Paars nicht weißt, welches welches ist.
        </p>
        {#each kontrastPaarListe as [a, b], i (a.id)}
          <p class="hinweis auftrag">Paar {i + 1}: {a.label} oder {b.label}</p>
          <div class="nummernliste">
            {#each [a.nummer, b.nummer].filter((n) => n !== undefined).sort((x, y) => x! - y!) as nummer (nummer)}
              <span class="nummer">{nummer}</span>
            {/each}
          </div>
        {/each}
      {:else}
        <p class="frage-satz">
          Lege diese {bereitlegenNummern.length} Fläschchen verdeckt bereit — so, dass du beim Greifen nicht erkennen kannst, welches du
          gerade in der Hand hältst.
        </p>
        <div class="nummernliste">
          {#each bereitlegenNummern as nummer (nummer)}
            <span class="nummer">{nummer}</span>
          {/each}
        </div>
      {/if}
      <div class="knopfreihe">
        <Knopf stufe="primaer" onKlick={bereitgelegt}>liegt bereit</Knopf>
      </div>
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
        <Schalter label="nur geraten" an={tipGeraten} onWahl={(w) => (tipGeraten = w)} />
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
        {#if letzteAuswertung.lernstandHinweis}
          <p class="hinweis">{letzteAuswertung.lernstandHinweis}</p>
        {/if}
        {#if letzteAuswertung.nachriechen}
          <p class="hinweis auftrag">Riech noch einmal daran — das ist „{letzteAuswertung.tatsaechlicheOption.label}“.</p>
          {#if letzteAuswertung.nachriechen.merkhilfe}
            <p class="hinweis">{letzteAuswertung.nachriechen.merkhilfe}</p>
          {/if}
          {#if letzteAuswertung.nachriechen.tipp?.merkhilfe}
            <p class="hinweis">Dein Tipp „{letzteAuswertung.nachriechen.tipp.label}“: {letzteAuswertung.nachriechen.tipp.merkhilfe}</p>
          {/if}
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
          {#if letzteAuswertung.nachriechen && !nachgerochenErledigt}
            <Knopf stufe="primaer" onKlick={nachgerochen}>nachgerochen</Knopf>
          {:else}
            <Knopf stufe="primaer" onKlick={weiterNachAufloesung} deaktiviert={pauseRest > 0}>
              {pauseRest > 0 ? `weiter (${pauseRest})` : 'weiter'}
            </Knopf>
          {/if}
          {#if letzteAuswertung.tatsaechlicheOption.nummer !== undefined && datenblattZu(letzteAuswertung.tatsaechlicheOption.nummer)}
            <Knopf onKlick={() => (datenblatt = datenblattZu(letzteAuswertung!.tatsaechlicheOption.nummer!))}>Datenblatt ansehen</Knopf>
          {/if}
        </div>
      </div>
    {/if}
    {#if fehler}<p class="fehler">{fehler}</p>{/if}
  {:else if phase === 'kontrast' && kontrastOptionen.length === 2}
    <p class="fortschritt">Paar {kontrastIndex + 1} von {kontrastPaarListe.length}</p>
    <div class="frage-block">
      <p class="hinweis auftrag">{kontrastOptionen[0]!.label} oder {kontrastOptionen[1]!.label}</p>
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
          <p class="hinweis">Diese Nummer gehörte zu keinem der beiden angekündigten Fläschchen — dieses Paar bleibt unbewertet.</p>
        {:else if kontrastAuswertung}
          <p class="ergebnis" class:richtig={kontrastAuswertung.ergebnis === 'richtig'}>
            {#if kontrastAuswertung.ergebnis === 'richtig'}
              Richtig — erst „{kontrastAuswertung.ersteOption.label}“, dann „{kontrastAuswertung.zweiteOption.label}“.
            {:else}
              Daneben — es war erst „{kontrastAuswertung.ersteOption.label}“, dann „{kontrastAuswertung.zweiteOption.label}“.
            {/if}
          </p>
          {#if kontrastAuswertung.nachriechen}
            <p class="hinweis auftrag">
              Riech beide noch einmal, direkt nacheinander — erst „{kontrastAuswertung.ersteOption.label}“, dann „{kontrastAuswertung.zweiteOption.label}“.
            </p>
            {#if kontrastAuswertung.nachriechen.ersteMerkhilfe}
              <p class="hinweis">{kontrastAuswertung.ersteOption.label}: {kontrastAuswertung.nachriechen.ersteMerkhilfe}</p>
            {/if}
            {#if kontrastAuswertung.nachriechen.zweiteMerkhilfe}
              <p class="hinweis">{kontrastAuswertung.zweiteOption.label}: {kontrastAuswertung.nachriechen.zweiteMerkhilfe}</p>
            {/if}
          {/if}
        {/if}
        <div class="knopfreihe">
          {#if kontrastAuswertung?.nachriechen && !kontrastNachgerochenErledigt}
            <Knopf stufe="primaer" onKlick={kontrastNachgerochen}>nachgerochen</Knopf>
          {:else if kontrastLetztesPaar}
            <Knopf stufe="primaer" onKlick={zurueckZurUebersicht}>zur Übersicht</Knopf>
          {:else}
            <Knopf stufe="primaer" onKlick={kontrastWeiter} deaktiviert={pauseRest > 0}>
              {pauseRest > 0 ? `nächstes Paar (${pauseRest})` : 'nächstes Paar'}
            </Knopf>
          {/if}
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
    {#snippet rundenInhalt(zeile: RundenZeile)}
      <span class="runden-haupt">
        <span class="runden-label">{zeile.label}</span>
        {#if zeile.hinweis}<span class="runden-hinweis">{zeile.hinweis}</span>{/if}
      </span>
      <span class="runden-ergebnis" class:richtig={zeile.ergebnis === 'richtig'}>{zeile.ergebnisText}</span>
    {/snippet}
    <div class="block">
      <p class="ende-kopf">{richtigAnzahl} von {rundenZeilen.length} richtig</p>
      {#if meilenstein}<p class="ende-meilenstein">{meilenstein}</p>{/if}
      <Blattliste>
        {#each rundenZeilen as zeile, index (index)}
          {#if datenblattVorhanden(zeile.nummer)}
            <button type="button" class="runden-zeile" onclick={() => (datenblatt = datenblattZu(zeile.nummer!))}>
              {@render rundenInhalt(zeile)}
            </button>
          {:else}
            <div class="runden-zeile runden-zeile-statisch">
              {@render rundenInhalt(zeile)}
            </div>
          {/if}
        {/each}
      </Blattliste>
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
  /* Begrüßung — 1:1 aus Bar.svelte übernommen (dort ausführlich begründet:
     Abstand/Umbruch statt groesserer Schrift fuer Praesenz). Dritter
     Aufrufer desselben Musters nach den Kennzahl-Kacheln. Fuellt zusammen
     mit der Reverse-Vorschlag-Zeile unten die Flaeche, die vorher leer
     unter den Knoepfen stand (Livebetrieb-Rueckmeldung "sieht leer aus"). */
  .begruessungsblock {
    padding: var(--r3) 0 var(--r3);
  }
  .tageszeit-label {
    font-family: var(--schrift-sans);
    font-size: var(--fs-label);
    letter-spacing: var(--label-spacing);
    text-transform: uppercase;
    color: var(--akzent);
    margin: 0 0 6px;
  }
  .begruessung {
    font-size: var(--fs-titel);
    font-weight: var(--gw-titel);
    letter-spacing: -0.02em;
    line-height: 1.15;
    text-wrap: balance;
    max-width: 22ch;
    margin: 0;
  }
  /* Kennzahl-Kacheln — 1:1 aus Bar.svelte übernommen (dort ausführlich
     begründet: Zeilenklammerung, Mindestbreite gegen horizontales Scrollen
     auf dem S25, kurze statt umgebrochener Labels). Zwei rotierende Fakten
     aus domain/uebungsauswertung.ts::uebungsKennzahlenPool statt der
     rohen Fünf-Boxen-Liste, die vorher hier stand (die volle Aufschlüsselung
     lebt jetzt auf der Statistik-Seite). */
  .kennzahl-raster {
    margin-bottom: var(--r3);
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
  /* Rückmeldung 2026-09-17: die Übersicht sollte denselben Dashboard-
     Charakter haben wie Bar.svelte — eine klare Primäraktion ohne
     Kartenrahmen (wie dort "Getränk wählen"), statt in einer Knopfreihe mit
     zwei weiteren Aktionen zu stehen. */
  .jetzt-zone {
    margin: var(--r3) 0 var(--r4);
    display: flex;
    flex-direction: column;
    gap: var(--r3);
  }
  .vorschlaege {
    margin-bottom: var(--r3);
  }
  /* Vorschlags-Karten — 1:1 aus Bar.svelte übernommen (.bestandkarte/
     .bestandliste dort, Zeilen 712-781): Blattfläche + Schatten statt Rand,
     Serif für den Namen. Kontrastdurchgang- und Reverse-Vorschlag sind
     dieselbe Art Information wie Bars Bestandskarten — "das fällt gerade
     auf", ganze Karte tippbar, keine eigene Bildsprache dafür nötig. Ohne
     die dortigen Dringlichkeits-Farbvarianten (kritisch/achtung/info): hier
     ist kein Vorschlag dringend. */
  .bestandliste {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .bestandkarte {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 12px 18px;
    border: none;
    border-radius: 18px;
    background: var(--blatt);
    box-shadow: 0 6px 16px -10px var(--schatten-weich);
    cursor: pointer;
    text-align: left;
    /* Serif bewusst: die Karte trägt einen Aroma- oder Paarnamen. */
    font-family: var(--schrift);
  }
  .bestandkarte-text {
    flex: 1;
    min-width: 0;
  }
  .bestandkarte-name {
    font-size: 15.5px;
    color: var(--tinte);
    display: block;
  }
  .bestandkarte-meta {
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--gedaempft);
    display: block;
    margin-top: 3px;
  }
  /* Weiße Fläche wie Bar.svelte (.fastway-frage, Getränke-Kacheln) statt
     freien Texts auf der Seitenfläche — Livebetrieb-Rückmeldung "sieht nicht
     sonderlich schön aus". Trägt jeden Schritt der laufenden Übung
     (Bereitlegen, jeder der drei gestapelten Item-Blöcke, Kontrast, Reverse)
     sowie auf der Übersicht die Knopfreihe und den Reverse-Vorschlag. */
  .frage-block {
    margin-bottom: var(--r5);
    background: var(--blatt);
    border-radius: var(--r-karte);
    padding: var(--r4);
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
  /* Die Aufforderung zum Nachriechen ist eine Handlung, kein Nebenbei — sie
     steht in Textfarbe über der gedämpften Merkhilfe. */
  .hinweis.auftrag {
    color: var(--satz);
  }
  /* Ende-Screen (Rueckmeldung 2026-09-18: vorher ueber muster/Werteliste.svelte
     gebaut — ein Muster fuer Label+Zahl+Einheit, falsch fuer eine Ergebnis-
     liste. Der Aromaname ist hier der Inhalt, nicht das Label. */
  .ende-kopf {
    font-size: var(--fs-urteil);
    color: var(--tinte);
    margin: 0 0 4px;
  }
  .ende-meilenstein {
    font-family: var(--schrift-sans);
    font-size: var(--fs-satz);
    color: var(--gedaempft);
    margin: 0 0 var(--r3);
  }
  .runden-zeile {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--r3);
    width: 100%;
    min-height: var(--blattzeile);
    border: none;
    background: transparent;
    font-family: var(--schrift-sans);
    text-align: left;
    cursor: pointer;
  }
  .runden-zeile-statisch {
    cursor: default;
  }
  .runden-haupt {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  /* Aromaname ist Inhalt, nicht Apparat — Serif nach der Projektregel
     "Serif traegt den Inhalt, Sans nur den Apparat". Eigener Block ohne
     cursor/background, deshalb ohne "Serif bewusst"-Vermerk noetig
     (tests/bildsprache.test.ts prueft pro Block, nicht pro Zeile). */
  .runden-label {
    font-family: var(--schrift);
    font-size: var(--fs-bedienwort);
    color: var(--tinte);
  }
  .runden-hinweis {
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  .runden-ergebnis {
    flex-shrink: 0;
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--kritisch);
  }
  .runden-ergebnis.richtig {
    color: var(--satz);
  }
  .fehler {
    color: var(--kritisch);
    font-size: var(--fs-satz);
    margin-top: var(--r2);
  }
</style>
