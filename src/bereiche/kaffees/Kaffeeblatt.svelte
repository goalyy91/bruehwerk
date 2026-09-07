<script lang="ts">
  // Das Kaffeeblatt — seit UX-2 die reine Leseansicht (K51, K61). Bearbeiten
  // ist eine eigene Route (KaffeeBearbeiten.svelte) hinter dem Stift-Symbol
  // in der Kopfzeile — vorher war jedes Feld hier direkt tippbar mit
  // Autosave, das liess sich nicht ansehen, ohne es auch zu aendern.
  //
  // Chargen bleiben hier: eine neue Charge anzulegen ist eine eigene
  // Handlung (ein neuer Datensatz), keine Aenderung an den Kaffee-Feldern.
  // Redesign v2 (Rueckmeldung 2026-09-04): FIFO statt Auto-Nullung — welche
  // Charge "aktuell" ist, bestimmt bestand.svelte.ts::
  // chargeStatusAktualisieren (siehe dort). Geleerte Chargen bleiben in der
  // Ablage, verschwinden aber aus dieser Liste ("wuesste nicht wozu ich die
  // noch brauche") — sichtbareChargen filtert sie aus.
  //
  // UX-Korrekturrunde (Regel 2/7/8, docs/ux-regeln.md): Profile — der
  // einzige Weg zum Shot loggen, also der Alltagspfad — stehen jetzt direkt
  // unter dem Kopf statt hinter neun Stammdaten-Zeilen. Die Bohnen-
  // Stammdaten liegen hinter einem Aufklapp-Block; entkoffeiniert/aktiv sind
  // reine Verwaltungsflags und erscheinen nur, wenn sie vom Normalfall
  // (koffeinhaltig, aktiv) abweichen. "Charge anlegen" folgt jetzt demselben
  // Anlege-Muster wie "Profil anlegen" (hinter "+ …", Regel 12). Bohne-
  // Details liefen zwischenzeitlich ueber Werteliste.svelte, seit
  // Rueckmeldung 2026-08-24 als eigene Detailzeilen im selben Panel wie die
  // "Bohne"-Falte (siehe dort) — Werteliste betont Werte staerker als ihre
  // Beschriftung, richtig fuer Messwerte, nicht fuer Textmerkmale.
  //
  // Visueller Redesign-Reset, Paket 2 (Handoff Abschnitt 6 "Kaffeeblatt"):
  // Kopfzeile im gross-Modus (30-32/600 zweizeilig), Röstgrad/Bewertung in
  // einer Blattzeile mit senkrechter Haarlinie statt zwei Feldern
  // nebeneinander, Profile/Chargen als Blattpanel mit Zeilen statt Liste
  // mit Haarlinie-Trennung. Kein Muster fuer "Blatt mit navigierbaren
  // Zeilen" existiert bisher zentral (siehe
  // docs/design/offene-punkte-redesign.md) — deshalb lokales CSS statt
  // Nachbau eines bereits vorhandenen Bausteins. Alle Felder, Reihenfolge,
  // Zustaende (aktuelle/leer bei Chargen) und Handlungen unveraendert.

  import { bestand, schreiben, chargeStatusAktualisieren } from '../bestand.svelte';
  import { neueId } from '../../daten/id';
  import { SPIELRAUM_VORGABE } from '../../domain/spielraum';
  import { verhaeltnisZahl, ertragMl, fertigAbZeitpunkt } from '../../domain/coldbrew';
  import { restGramm, geschaetzteBezuege, benoetigtProBezug } from '../../domain/vorrat';
  import Blattliste from '../../muster/Blattliste.svelte';
  import Bohnen from '../../muster/Bohnen.svelte';
  import Sterne from '../../muster/Sterne.svelte';
  import AuswahlListe from '../../muster/AuswahlListe.svelte';
  import Kopfzeile from '../../muster/Kopfzeile.svelte';
  import Knopf from '../../muster/Knopf.svelte';
  import Schalter from '../../muster/Schalter.svelte';
  import Kontextmenue from '../../muster/Kontextmenue.svelte';
  import ProfilIcon, { type ProfilIconTyp } from '../../muster/ProfilIcon.svelte';
  import type { Charge, Profil, Ansatz, Aufbereitung } from '../../daten/schema';

  /** Reihenfolge in der Auswahlzeile beim Profil-Anlegen. */
  const PROFIL_ICON_OPTIONEN: readonly ProfilIconTyp[] = [
    'siebtraeger',
    'moka',
    'pourover',
    'coldbrew',
    'ristretto',
    'espresso',
    'lungo',
  ];
  /** Geräte-Icons brauchen mehr Fläche als die Tassen-Füllstände, um in der
   *  56-px-Kachel nicht "dünn" zu wirken (Rückmeldung zur Icon-Bibliothek). */
  function profilIconGroesse(icon: ProfilIconTyp): number {
    return icon === 'ristretto' || icon === 'espresso' || icon === 'lungo' ? 26 : 30;
  }
  /** Vorbelegung aus dem Gerät — espresso heißt hier "siebtraeger" (das
   *  Icon zeigt den Portafilter, nicht die Zubereitungsart-Bezeichnung). */
  function standardIconVon(typ: 'espresso' | 'moka' | 'pourover' | 'coldbrew' | undefined): ProfilIconTyp {
    if (typ === 'espresso') return 'siebtraeger';
    return typ ?? 'siebtraeger';
  }

  let {
    kaffeeId,
    onZurueck,
    onBearbeiten,
    onOeffnenProfil,
  }: {
    kaffeeId: string;
    onZurueck: () => void;
    onBearbeiten: () => void;
    onOeffnenProfil: (profilId: string) => void;
  } = $props();

  const kaffee = $derived(bestand.kaffees.find((k) => k.id === kaffeeId));

  /**
   * Etappe 8, Block B (Rückmeldung 2026-09-06): aktiv/inaktiv ist eine
   * Verwaltungssache, keine Bearbeitung — sie gehört nicht mehr hinter
   * "speichern" (KaffeeBearbeiten.svelte). Genau der Weg, den Mühle,
   * Brühgerät und Getränk schon gehen (Kontextmenue statt Schalter im
   * Formular).
   */
  async function sichtbarkeitUmschalten() {
    if (!kaffee) return;
    await schreiben('kaffee', { ...kaffee, aktiv: !kaffee.aktiv });
  }
  const chargen = $derived(bestand.chargenVon(kaffeeId));
  // Rückmeldung 2026-09-04: geleerte Chargen verschwinden aus der Anzeige —
  // "wüsste nicht wozu ich die noch brauche". Sie bleiben in der Ablage
  // (chargeIds, kein Löschen), nur die Chargen-Liste blendet sie aus.
  const sichtbareChargen = $derived(chargen.filter((c) => !c.leer));
  const profile = $derived(bestand.profileVon(kaffeeId));

  // Bestandsrechnung (Redesign v2, Etappe 2) — domain/vorrat.ts kennt keine
  // Charge-/Shot-Typen, nur die drei Felder, die es tatsaechlich braucht.
  const alleShotsAlsVerbrauch = $derived(
    bestand.shots.map((s) => ({ chargeId: s.chargeId, ts: s.ts, inputGramm: s.ist.input })),
  );
  const aktuelleCharge = $derived(chargen.find((c) => c.id === kaffee?.aktuelleChargeId));
  const standardProfilInput = $derived((profile.find((p) => p.standard) ?? profile[0])?.ziel.input);
  const aktuellerRest = $derived(
    aktuelleCharge ? restGramm(aktuelleCharge, aktuelleCharge.id, alleShotsAlsVerbrauch) : undefined,
  );
  const aktuelleBezuege = $derived(
    aktuelleCharge && aktuellerRest !== undefined
      ? geschaetzteBezuege(aktuellerRest, benoetigtProBezug(aktuelleCharge, aktuelleCharge.id, alleShotsAlsVerbrauch, standardProfilInput))
      : undefined,
  );

  const AUFBEREITUNG_LABEL: Record<Aufbereitung, string> = {
    washed: 'Washed',
    honey: 'Honey',
    natural: 'Natural',
    anaerob: 'Anaerob',
    'wet-hulled': 'Wet-hulled',
    sonstige: 'Sonstige',
  };

  let speicherFehler = $state<string | undefined>(undefined);

  // Redesign v2 — "Bohne" ist jetzt Teil der einen Identitäts-Karte
  // (.identitaet), keine eigene Falte mehr: "bei einer Karte, die man
  // ohnehin ansieht, macht eine Falte sie unruhiger" (Rückmeldung
  // 2026-09-04). Herkunft/Anbauhöhe/Varietät/Aufbereitung als
  // Icon-Kacheln (Mockup-geprüft), Art/Botanik als Fußzeilen darunter.
  // "Röstgrad (Röster)" bleibt entfernt — ein Röstgrad-Zeichen (Bohnen
  // oben im Blick-Bereich) reicht.
  const bohneArt = $derived(kaffee ? (kaffee.art === 'blend' ? 'Blend' : 'Single Origin') : '');

  /**
   * Leere Zustaende verschwinden, statt Platz zu belegen (Rueckmeldung
   * 2026-09-07 zum Kaffeeblatt-Screenshot: vier grosse Kacheln mit Symbol,
   * Beschriftung und viermal "—" waren der halbe Bildschirm fuer nichts).
   * Ein nicht erfasstes Feld ist keine Information — es ist die Abwesenheit
   * einer, und die braucht keine Kachel.
   *
   * Der Roestgrad kommt hier dazu, obwohl Bohnen.svelte seine fuenf Stufen
   * bewusst immer zeigt (K79, Systemregel): das Bauteil bleibt unangetastet,
   * es wird nur nicht mehr aufgerufen, wenn nichts erfasst ist. Fuenf leere
   * Bohnen *und* das Wort "unbekannt" daneben waren zweimal dasselbe Nichts.
   */
  const hatHerkunft = $derived((kaffee?.herkunft.length ?? 0) > 0);
  const hatAnbauhoehe = $derived(kaffee?.anbauhoehe !== undefined);
  const hatVarietaet = $derived(!!kaffee?.varietaet);
  const hatAufbereitung = $derived(!!kaffee?.aufbereitung);
  const hatRoestgrad = $derived(kaffee?.roestgrad !== undefined);
  const hatBewertung = $derived(kaffee?.bewertung !== undefined);
  /**
   * Rückmeldung 2026-09-04: "wenn es 100% vom einen ist, muss das andere
   * nicht angezeigt werden" — bei einer reinen Sorte ist die zweite Zahl
   * (immer 0%) keine Information, nur Redundanz.
   */
  function botanikSatz(botanik: { arabicaProzent: number; robustaProzent: number }): string {
    if (botanik.arabicaProzent === 100) return '100% Arabica';
    if (botanik.robustaProzent === 100) return '100% Robusta';
    return `${botanik.arabicaProzent}% Arabica · ${botanik.robustaProzent}% Robusta`;
  }

  let neueChargeOffen = $state(false);
  // Default: heute, im Format, das <input type="date"> erwartet (YYYY-MM-DD).
  let neuesRoestdatum = $state(new Date().toISOString().slice(0, 10));
  // Redesign v2, Etappe 2 — Einwaage/eingefroren/Portionsgroesse fuers neue
  // Charge-Formular. Vorbelegung 250 g (uebliche Beutelgroesse), aber
  // absichtlich als Text statt Zahl-Input, damit ein leeres Feld moeglich
  // bleibt (Charge ohne Einwaage ist gueltig — kein Bestand wird dann
  // einfach nicht angezeigt, nicht erfunden).
  let neueEinwaage = $state('250');
  let neuEingefroren = $state(false);
  let neuePortionsgroesse = $state('');

  async function chargeAnlegen() {
    if (!kaffee || neuesRoestdatum === '') return;
    speicherFehler = undefined;
    const einwaageZahl = Number(neueEinwaage.replace(',', '.'));
    const portionsgroesseZahl = Number(neuePortionsgroesse.replace(',', '.'));
    const neue: Charge = {
      id: neueId(),
      kaffeeId,
      // Das Roestdatum ist relevant (Frischeeinschaetzung, Vergleich im
      // Verlauf) und wird deshalb mitgegeben, nicht aus "heute" geraten.
      // Es ist jetzt zugleich die einzige Chargenbezeichnung (Rückmeldung
      // 2026-09-04) — keine Nummer mehr abgefragt.
      roestdatum: new Date(`${neuesRoestdatum}T00:00:00`).getTime(),
      leer: false,
      einwaage: Number.isFinite(einwaageZahl) && einwaageZahl > 0 ? einwaageZahl : undefined,
      eingefroren: neuEingefroren,
      portionsgroesse: neuEingefroren && Number.isFinite(portionsgroesseZahl) && portionsgroesseZahl > 0 ? portionsgroesseZahl : undefined,
    };
    try {
      // FIFO statt Auto-Nullung (Rückmeldung 2026-09-04) — die bisherige
      // Charge wird NICHT mehr automatisch geleert. Sie bleibt "aktuell",
      // solange sie noch fuer einen Bezug reicht; chargeStatusAktualisieren
      // entscheidet danach, ob die neue Charge uebernehmen muss (nur wenn
      // gerade keine andere mehr gueltig ist).
      await schreiben('charge', neue);
      await schreiben('kaffee', { ...kaffee, chargeIds: [...kaffee.chargeIds, neue.id] });
      await chargeStatusAktualisieren(kaffeeId, standardProfilInput);
      neueChargeOffen = false;
      neuesRoestdatum = new Date().toISOString().slice(0, 10);
      neueEinwaage = '250';
      neuEingefroren = false;
      neuePortionsgroesse = '';
    } catch (fehler) {
      speicherFehler = fehler instanceof Error ? fehler.message : String(fehler);
    }
  }

  let korrekturOffen = $state(false);
  let korrekturWert = $state('');

  async function bestandKorrigieren() {
    if (!aktuelleCharge) return;
    const gramm = Number(korrekturWert.replace(',', '.'));
    if (!Number.isFinite(gramm) || gramm < 0) return;
    speicherFehler = undefined;
    try {
      await schreiben('charge', { ...aktuelleCharge, korrektur: { gramm, ts: Date.now() } });
      // Reicht der korrigierte Rest nicht mehr fuer einen Bezug, uebernimmt
      // hier automatisch die naechste Charge in der FIFO-Reihenfolge.
      await chargeStatusAktualisieren(kaffeeId, standardProfilInput);
      korrekturOffen = false;
      korrekturWert = '';
    } catch (fehler) {
      speicherFehler = fehler instanceof Error ? fehler.message : String(fehler);
    }
  }

  /**
   * Ausweg fuer Chargen ohne bekannte Einwaage (K64) — die koennen
   * rechnerisch nie ausscheiden (domain/vorrat.ts::chargeAusgeschieden),
   * z. B. die migrierte "unbekannt"-Charge. Schreibt "leer" direkt, dann
   * uebernimmt chargeStatusAktualisieren die FIFO-Neuvergabe.
   */
  async function alsLeerMarkieren(charge: Charge) {
    speicherFehler = undefined;
    try {
      await schreiben('charge', { ...charge, leer: true });
      await chargeStatusAktualisieren(kaffeeId, standardProfilInput);
    } catch (fehler) {
      speicherFehler = fehler instanceof Error ? fehler.message : String(fehler);
    }
  }

  let neuesProfilOffen = $state(false);
  let neuerProfilName = $state('');
  let neuesProfilSetupId = $state('');
  let neuesProfilIcon = $state<ProfilIconTyp | undefined>(undefined);
  /** Vom Nutzer aktiv gewähltes Icon — sonst folgt es weiter live dem Gerät. */
  let neuesProfilIconManuell = $state(false);

  /** Setup gewechselt -> Icon-Vorbelegung folgt, solange niemand manuell gewählt hat. */
  function neuesProfilSetupGewaehlt(setupId: string) {
    neuesProfilSetupId = setupId;
    if (!neuesProfilIconManuell) {
      neuesProfilIcon = standardIconVon(bestand.bruehgeraetVon(setupId)?.typ);
    }
  }

  // Cold Brew — konzept.md:933-955. Ein Ansatz ist ein Vorrat, kein Schritt
  // in einer Bestellung: angesetzt am, fertig ab (kein Countdown, ein
  // Zeitpunkt, K "kein Timer"), Menge, Rest.
  const coldbrewProfile = $derived(profile.filter((p) => bestand.bruehgeraetVon(p.setupId)?.typ === 'coldbrew'));
  const ansaetze = $derived(
    bestand.ansaetze.filter((a) => a.kaffeeId === kaffeeId).sort((a, b) => b.angesetzt - a.angesetzt),
  );

  let neuerAnsatzOffen = $state(false);
  let neuerAnsatzProfilId = $state('');
  let neuerAnsatzInput = $state('');

  function ansatzErtrag(profilId: string, inputGramm: number): number | undefined {
    const profil = coldbrewProfile.find((p) => p.id === profilId);
    const verhaeltnis = profil?.ansatz ? verhaeltnisZahl(profil.ansatz.verhaeltnis) : undefined;
    return verhaeltnis === undefined ? undefined : ertragMl(inputGramm, verhaeltnis);
  }

  async function ansatzAnlegen() {
    const profil = coldbrewProfile.find((p) => p.id === neuerAnsatzProfilId);
    const inputGramm = Number(neuerAnsatzInput.replace(',', '.'));
    if (!profil?.ansatz || !Number.isFinite(inputGramm) || inputGramm <= 0) return;
    const ertrag = ansatzErtrag(profil.id, inputGramm);
    if (ertrag === undefined) return;
    speicherFehler = undefined;
    const jetzt = Date.now();
    const neu: Ansatz = {
      id: neueId(),
      kaffeeId,
      profilId: profil.id,
      angesetzt: jetzt,
      fertigAb: fertigAbZeitpunkt(jetzt, profil.ansatz.ziehzeit),
      menge: ertrag,
      rest: ertrag,
      status: 'ziehend',
    };
    try {
      await schreiben('ansatz', neu);
      neuerAnsatzOffen = false;
      neuerAnsatzInput = '';
    } catch (fehler) {
      speicherFehler = fehler instanceof Error ? fehler.message : String(fehler);
    }
  }

  async function ansatzStatusSetzen(ansatz: Ansatz, status: Ansatz['status']) {
    speicherFehler = undefined;
    try {
      await schreiben('ansatz', { ...ansatz, status });
    } catch (fehler) {
      speicherFehler = fehler instanceof Error ? fehler.message : String(fehler);
    }
  }

  async function profilAnlegen() {
    if (!kaffee || neuerProfilName.trim() === '' || neuesProfilSetupId === '') return;
    speicherFehler = undefined;
    const istColdbrew = bestand.bruehgeraetVon(neuesProfilSetupId)?.typ === 'coldbrew';
    // Nur eine bewusst vom Geraet abweichende Wahl wird gespeichert — folgt
    // sie dem Geraet-Standard, bleibt "icon" undefined und die Oberflaeche
    // leitet spaeter live her (siehe daten/schema/kaffee.ts::Profil.icon).
    const geraeteIcon = standardIconVon(bestand.bruehgeraetVon(neuesProfilSetupId)?.typ);
    const neu: Profil = {
      id: neueId(),
      kaffeeId,
      setupId: neuesProfilSetupId,
      name: neuerProfilName.trim(),
      standard: profile.length === 0,
      // Startwerte sind bewusst 0/leer — kein Platzhalter, der wie eine
      // Messung aussieht. Der Dial-in traegt sie ein.
      ziel: { input: 18, mg: 0, output: 36, zeit: 30 },
      spielraum: SPIELRAUM_VORGABE,
      modus: 'dialin',
      // Startwerte aus konzept.md:944-951, jeder einzelne ausdruecklich als
      // Startwert markiert — nur beim Mahlgrad (ziel.mg oben) gibt es
      // keinen: "der einzige Wert, den ich nicht beziffern will" (konzept.md:949).
      ansatz: istColdbrew ? { verhaeltnis: '1:15', ziehzeit: 16, ort: 'Kühlschrank', filtern: true } : undefined,
      icon: neuesProfilIcon && neuesProfilIcon !== geraeteIcon ? neuesProfilIcon : undefined,
    };
    try {
      await schreiben('profil', neu);
      neuesProfilOffen = false;
      neuerProfilName = '';
      neuesProfilSetupId = '';
      neuesProfilIcon = undefined;
      neuesProfilIconManuell = false;
      onOeffnenProfil(neu.id);
    } catch (fehler) {
      speicherFehler = fehler instanceof Error ? fehler.message : String(fehler);
    }
  }
</script>

{#if !kaffee}
  <Kopfzeile titel="Kaffees" onZurueck={onZurueck} />
  <p class="hinweis">Kaffee nicht gefunden.</p>
{:else}
  <Kopfzeile titel={kaffee.name} onZurueck={onZurueck} gross>
    {#snippet aktion()}
      <Kontextmenue
        eintraege={[
          { text: 'bearbeiten', onWahl: onBearbeiten },
          { text: kaffee.aktiv ? 'ausblenden' : 'wieder einblenden', onWahl: () => void sichtbarkeitUmschalten() },
        ]}
      />
    {/snippet}
  </Kopfzeile>
  <!-- Zug B (2026-09-07): Der Kopfbereich steht frei auf dem Grund, ohne
       Karte. Karten sind fuer Listen; die Identitaet eines Gegenstands ist
       keine Liste. Vorher lag alles in einer .identitaet-Karte — dadurch war
       der Kaffeename optisch gleichrangig mit "Profile" und "Chargen", und
       es gab keinen Ort, an dem das Auge landet.
       Die zwei Kennzahlen sind hierhergezogen: sie standen bisher ganz unten
       in der Chargenliste, hinter Profilen und Cold Brew. Wie viel noch da
       ist, ist die haeufigste Frage an dieses Blatt und gehoert nach oben. -->
  <div class="kopfbereich">
    <p class="roester">
      {kaffee.roester}
      {#if kaffee.entkoffeiniert}<span class="flagge">· entkoffeiniert</span>{/if}
      {#if !kaffee.aktiv}<span class="flagge">· inaktiv</span>{/if}
    </p>

    {#if aktuellerRest !== undefined}
      <div class="kennzahlen">
        <div class="kennzahl">
          <span class="kennzahl-wert">{aktuellerRest}<span class="kennzahl-einheit">g</span></span>
          <span class="kennzahl-label">Bestand</span>
        </div>
        {#if aktuelleBezuege !== undefined}
          <div class="kennzahl">
            <span class="kennzahl-wert">{aktuelleBezuege}</span>
            <span class="kennzahl-label">Bezüge</span>
          </div>
        {/if}
      </div>
    {/if}

    {#if hatRoestgrad || hatBewertung}
      <div class="blick">
        {#if hatRoestgrad}
          <div class="blick-eintrag">
            <span class="label">Röstgrad</span>
            <Bohnen stufe={kaffee.roestgrad} />
          </div>
        {/if}
        {#if hatRoestgrad && hatBewertung}
          <div class="blick-trenner" aria-hidden="true"></div>
        {/if}
        {#if hatBewertung}
          <div class="blick-eintrag">
            <span class="label">Bewertung</span>
            <Sterne wert={kaffee.bewertung} />
          </div>
        {/if}
      </div>
    {/if}

  </div>

  <!-- Zug B/E (2026-09-07): Die vier Icon-Kacheln und die Fusszeilen sind zu
       Zeilen in einer Karte geworden — dieselbe Form wie ueberall sonst
       (Muehle, Geraete). Sie waren ein fuenftes Layout-Idiom auf demselben
       Blatt und der Hauptgrund, warum es unruhig wirkte. Blattliste statt
       lokalem .panel, damit die Karte denselben Schatten traegt wie der Rest.
       Art steht immer (Single Origin/Blend ist nie leer), alles andere nur
       wenn erfasst — Leerzustaende verschwinden weiterhin (fdd3f34). -->
  <section class="gruppe">
    <h2>Bohne</h2>
    <Blattliste>
      <div class="wertzeile">
        <span class="wz-label">Art</span>
        <span class="wz-wert">{bohneArt}</span>
      </div>
      {#if hatHerkunft}
        <div class="wertzeile">
          <span class="wz-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 21s7-7.2 7-12a7 7 0 1 0-14 0c0 4.8 7 12 7 12z" /><circle cx="12" cy="9" r="2.2" />
            </svg>
          </span>
          <span class="wz-label">Herkunft</span>
          <span class="wz-wert">{kaffee.herkunft.join(', ')}</span>
        </div>
      {/if}
      {#if hatVarietaet}
        <div class="wertzeile">
          <span class="wz-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M6 20.5C4 12 9 5 18 4c1 8-4 15-12 16.5z" /><path d="M7.5 19c3-4 6-7 9.5-9.5" stroke-width="1.1" />
            </svg>
          </span>
          <span class="wz-label">Varietät</span>
          <span class="wz-wert">{kaffee.varietaet}</span>
        </div>
      {/if}
      {#if hatAnbauhoehe}
        <div class="wertzeile">
          <span class="wz-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M3 18.5l6-9.5 4 5 2-3 6 7.5z" />
            </svg>
          </span>
          <span class="wz-label">Anbauhöhe</span>
          <span class="wz-wert">{kaffee.anbauhoehe} m</span>
        </div>
      {/if}
      {#if hatAufbereitung && kaffee.aufbereitung}
        <div class="wertzeile">
          <span class="wz-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M12 3s6 7.4 6 11.7A6 6 0 0 1 6 14.7C6 10.4 12 3 12 3z" />
            </svg>
          </span>
          <span class="wz-label">Aufbereitung</span>
          <span class="wz-wert">{AUFBEREITUNG_LABEL[kaffee.aufbereitung]}</span>
        </div>
      {/if}
      {#if kaffee.botanik}
        <div class="wertzeile">
          <span class="wz-label">Botanik</span>
          <span class="wz-wert">{botanikSatz(kaffee.botanik)}</span>
        </div>
      {/if}
    </Blattliste>
  </section>

  <section class="gruppe">
    <h2>Profile</h2>
    <div class="profil-raster">
      {#each profile as profilEintrag (profilEintrag.id)}
        {@const icon = profilEintrag.icon ?? standardIconVon(bestand.bruehgeraetVon(profilEintrag.setupId)?.typ)}
        <button type="button" class="profil-kachel" onclick={() => onOeffnenProfil(profilEintrag.id)}>
          <span class="profil-icon-kreis" aria-hidden="true">
            <ProfilIcon {icon} groesse={profilIconGroesse(icon)} />
          </span>
          <span class="profil-name">{profilEintrag.name}</span>
        </button>
      {/each}
      <button type="button" class="profil-kachel profil-plus" onclick={() => (neuesProfilOffen = true)}>
        <span class="profil-icon-kreis" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 5v14M5 12h14" /></svg>
        </span>
        <span class="profil-name">Profil</span>
      </button>
    </div>

    {#if neuesProfilOffen}
      <Blattliste>
        <div class="anlage">
          <input type="text" class="eingabefeld-text" placeholder="Profilname" bind:value={neuerProfilName} />
          <AuswahlListe
            optionen={bestand.setups.map((s) => ({ wert: s.id, label: s.name }))}
            wert={neuesProfilSetupId}
            onWahl={neuesProfilSetupGewaehlt}
          />
          <p class="icon-auswahl-label">Symbol</p>
          <div class="icon-auswahl">
            {#each PROFIL_ICON_OPTIONEN as option (option)}
              <button
                type="button"
                class="icon-option"
                class:gewaehlt={neuesProfilIcon === option}
                aria-label={option}
                onclick={() => {
                  neuesProfilIcon = option;
                  neuesProfilIconManuell = true;
                }}
              >
                <ProfilIcon icon={option} groesse={20} />
              </button>
            {/each}
          </div>
          <Knopf stufe="primaer" onKlick={profilAnlegen} deaktiviert={neuerProfilName.trim() === '' || neuesProfilSetupId === ''}>
            anlegen
          </Knopf>
        </div>
      </Blattliste>
    {/if}
  </section>

  {#if coldbrewProfile.length > 0}
    <section class="gruppe">
      <h2>Cold Brew</h2>
      <Blattliste>
        {#if ansaetze.length === 0}
          <p class="hinweis-panel">kein Ansatz</p>
        {:else}
          {#each ansaetze as ansatz (ansatz.id)}
            <div class="ansatz-zeile">
              <div class="ansatz-kopf">
                <span class="name">
                  {ansatz.status === 'ziehend' ? 'zieht' : ansatz.status === 'fertig' ? 'fertig' : 'aufgebraucht'}
                </span>
                <span class="meta">
                  {ansatz.status === 'ziehend' ? 'fertig ab' : 'fertig war'}
                  {new Date(ansatz.fertigAb).toLocaleDateString('de-DE')}
                  {new Date(ansatz.fertigAb).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <span class="meta">Rest {Math.round(ansatz.rest)} von {Math.round(ansatz.menge)} ml</span>
              {#if ansatz.status === 'ziehend'}
                <button type="button" class="anlegen-zeile schmal" onclick={() => ansatzStatusSetzen(ansatz, 'fertig')}>als fertig markieren</button>
              {:else if ansatz.status === 'fertig' && ansatz.rest <= 0}
                <button type="button" class="anlegen-zeile schmal" onclick={() => ansatzStatusSetzen(ansatz, 'aufgebraucht')}>als aufgebraucht markieren</button>
              {/if}
            </div>
          {/each}
        {/if}

        {#if neuerAnsatzOffen}
          <div class="anlage">
            {#if coldbrewProfile.length > 1}
              <AuswahlListe
                optionen={coldbrewProfile.map((p) => ({ wert: p.id, label: p.name }))}
                wert={neuerAnsatzProfilId}
                onWahl={(w) => (neuerAnsatzProfilId = w)}
              />
            {/if}
            <input type="text" inputmode="decimal" class="eingabefeld-text" placeholder="Input in g" bind:value={neuerAnsatzInput} />
            {#if neuerAnsatzProfilId && Number(neuerAnsatzInput.replace(',', '.')) > 0}
              <p class="hinweis-panel">
                ≈ {Math.round(ansatzErtrag(neuerAnsatzProfilId, Number(neuerAnsatzInput.replace(',', '.'))) ?? 0)} ml Ertrag
              </p>
            {/if}
            <Knopf stufe="primaer" onKlick={ansatzAnlegen} deaktiviert={!neuerAnsatzProfilId || Number(neuerAnsatzInput.replace(',', '.')) <= 0}>
              ansetzen
            </Knopf>
          </div>
        {:else}
          <button
            type="button"
            class="anlegen-zeile"
            onclick={() => {
              neuerAnsatzOffen = true;
              neuerAnsatzProfilId = coldbrewProfile[0]?.id ?? '';
            }}
          >
            + Ansatz
          </button>
        {/if}
      </Blattliste>
    </section>
  {/if}

  <section class="gruppe">
    <h2>Chargen</h2>
    <Blattliste>
      {#if sichtbareChargen.length === 0}
        <p class="hinweis-panel">keine</p>
      {:else}
        {#each sichtbareChargen as charge (charge.id)}
          <div class="chargenzeile" class:aktuelle={charge.id === kaffee.aktuelleChargeId}>
            <div class="chargenzeile-kopf">
              <!-- Rückmeldung 2026-09-04: keine Chargennummer mehr —
                   Röstdatum ist die einzige Chargenbezeichnung, deshalb
                   jetzt im Haupttext statt als kleines Meta daneben. -->
              <span class="chargen-titel">{new Date(charge.roestdatum).toLocaleDateString('de-DE')}</span>
            </div>

            {#if charge.id === kaffee.aktuelleChargeId}
              <!-- Die grosse Bestandszahl stand bis 2026-09-07 hier — ganz
                   unten, hinter Profilen und Cold Brew. Sie ist in den
                   Kopfbereich gezogen (Zug B), weil "wie viel ist noch da"
                   die haeufigste Frage an dieses Blatt ist. Hier bleiben nur
                   die Handlungen; die Zahl zweimal gross zu zeigen waere
                   schlechter als sie einmal richtig zu platzieren. -->
              <div class="bestand-info">
                {#if aktuellerRest === undefined}
                  <span class="bestand-unbekannt">Bestand unbekannt</span>
                {/if}
                {#if !korrekturOffen}
                  <span class="bestand-aktionen">
                    <button type="button" class="korrigieren-link" onclick={() => (korrekturOffen = true)}>Korrigieren</button>
                    <button type="button" class="korrigieren-link" onclick={() => alsLeerMarkieren(charge)}>Als leer markieren</button>
                  </span>
                {/if}
              </div>

              {#if korrekturOffen}
                <div class="anlage">
                  <div class="mengenfeld">
                    <input type="text" inputmode="decimal" class="eingabefeld-text" placeholder="Gramm jetzt" bind:value={korrekturWert} />
                    <span class="einheit">g</span>
                  </div>
                  <Knopf stufe="primaer" onKlick={bestandKorrigieren} deaktiviert={korrekturWert.trim() === ''}>
                    Bestand speichern
                  </Knopf>
                </div>
              {/if}
            {/if}
          </div>
        {/each}
      {/if}

      {#if neueChargeOffen}
        <div class="anlage">
          <input type="date" class="eingabefeld-text" bind:value={neuesRoestdatum} aria-label="Röstdatum" />
          <div class="mengenfeld">
            <input type="text" inputmode="decimal" class="eingabefeld-text" placeholder="Einwaage (optional)" bind:value={neueEinwaage} />
            <span class="einheit">g</span>
          </div>
          <Schalter label="Eingefroren" an={neuEingefroren} onWahl={(a) => (neuEingefroren = a)} />
          {#if neuEingefroren}
            <div class="mengenfeld">
              <input type="text" inputmode="decimal" class="eingabefeld-text" placeholder="Portionsgröße (optional)" bind:value={neuePortionsgroesse} />
              <span class="einheit">g</span>
            </div>
          {/if}
          <Knopf stufe="primaer" onKlick={chargeAnlegen} deaktiviert={neuesRoestdatum === ''}>
            anlegen
          </Knopf>
        </div>
      {:else}
        <button type="button" class="anlegen-zeile" onclick={() => (neueChargeOffen = true)}>+ Charge</button>
      {/if}
    </Blattliste>
  </section>

  {#if speicherFehler}
    <p class="fehler">Nicht gespeichert: {speicherFehler} — nochmal versuchen.</p>
  {/if}
{/if}

<style>
  /* Redesign v2 — jetzt die erste Zeile der Identitaets-Karte statt eigene
     Zeile ueber dem Panel, daher kleinerer Abstand nach unten (der grosse
     --seitenrand-Abstand kommt jetzt von der Karte selbst). */
  /* Zug B: der Kopfbereich steht frei auf dem Grund, ohne Karte. */
  .kopfbereich {
    margin-bottom: var(--r6);
  }
  .roester {
    font-size: var(--fs-satz);
    /* Zug D: war --akzent. Ein Rösternamen ist nichts, was man antippen kann;
       der Akzent gehört den Dingen, die etwas tun. Wenn eine Farbe alles
       markiert, markiert sie nichts. */
    color: var(--gedaempft);
    margin: 0 0 var(--r5);
  }

  /* Zug B: die zwei Zahlen, die man dieses Blatt am häufigsten fragt.
     Groß gesetzt, damit das Auge einen Ort hat — der Rest der Seite ist
     bewusst leiser. Serif, weil Zahlen (wie Namen und Titel) das sind,
     wofür die Buchschrift in dieser App zuständig bleibt. */
  .kennzahlen {
    display: flex;
    gap: var(--r6);
    margin-bottom: var(--r5);
  }
  .kennzahl {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .kennzahl-wert {
    font-size: 34px;
    font-weight: var(--gw-zahl);
    line-height: 1;
    letter-spacing: -0.02em;
    color: var(--tinte);
    font-variant-numeric: var(--zahl-features);
  }
  .kennzahl-einheit {
    font-size: 17px;
    font-weight: var(--gw-text);
    color: var(--gedaempft);
    margin-left: 3px;
  }
  .kennzahl-label {
    font-family: var(--schrift-sans);
    font-size: var(--fs-kachel-label);
    letter-spacing: var(--label-spacing-kachel);
    text-transform: uppercase;
    color: var(--gedaempft);
  }

  /* Zug E: eine Wertzeile, wie sie die Mühle und die Geräte längst zeigen —
     Beschriftung links in Sans, Wert rechts in Serif. Ersetzt die vier
     Icon-Kacheln und die zwei Fußzeilen des alten Steckbriefs. */
  .wertzeile {
    display: flex;
    align-items: center;
    gap: var(--r3);
    min-height: var(--treffer);
    padding: var(--r2) 0;
  }
  /* Rückmeldung 2026-09-07: "bin ein klein wenig enttäuscht, dass die
     Grafikanzeigen nicht mehr da sind". Die Symbole kommen zurück — aber als
     ruhiges Zeichen am Zeilenanfang statt als eigene Kachel mit Kreisfläche.
     Damit bleibt der Zeilenrhythmus der App erhalten und das Blatt bekommt
     seine Bildlichkeit zurück. Gedämpft, weil das Symbol die Zeile begleitet
     und nicht die Hauptsache ist. */
  .wz-icon {
    flex: none;
    width: 20px;
    height: 20px;
    display: block;
    color: var(--gedaempft);
  }
  .wz-icon svg {
    width: 100%;
    height: 100%;
    display: block;
  }
  .wz-label {
    font-family: var(--schrift-sans);
    font-size: var(--fs-satz);
    color: var(--satz);
    flex-shrink: 0;
  }
  /* Der Wert schiebt sich nach rechts, egal ob ein Symbol davor steht. */
  .wz-wert {
    margin-left: auto;
  }
  .wz-wert {
    font-size: var(--fs-bedienwort);
    color: var(--tinte);
    text-align: right;
  }
  .flagge {
    color: var(--gedaempft);
  }
  /* Identitaets-Karte (Redesign v2, "Quartett-Karte") — ersetzt vier
     ehemals separate Bloecke (Blick-Panel, Bohne-Falte, freischwebendes
     Steckbrief-Grid, Botanik-Panel) durch eine zusammenhaengende Flaeche.
  /* h2-Basistypografie kommt aus tokens.css (global) — hier nur der lokale
     margin (Regel: lokale Ueberschreibung darf nur margin setzen). Bis
     2026-08-24 dupliziert, dabei sogar mit falschem font-family (Serif
     statt Sans) — Konsistenzfund im Zuge dieser Rueckmeldungsrunde. */
  h2 {
    margin: 0 0 var(--r-kachelabstand);
  }
  /* Roestgrad | Bewertung, senkrechte Haarlinie dazwischen (Handoff 3.5:
     "senkrechte Haarlinie nur zwischen zwei Werteblöcken"). Redesign v2:
     kein eigenes Blatt mehr — .blick sitzt jetzt selbst in der
     Identitaets-Karte (.identitaet) und markiert sich nur noch als
     interner Abschnitt per Trennlinie darunter. */
  /* Rückmeldung 2026-09-07: "sieht so aus als sei es weiter links als der
     Rest". Ursache war die Trennlinie: sie lief über die volle Breite,
     während die Karte darunter 18 px innen eingerückt ist — dadurch wirkte
     die Zeile breiter und damit weiter links. Die Linie entfällt ersatzlos;
     der Gruppenkopf darunter trennt bereits. */
  .blick {
    display: flex;
    align-items: center;
    gap: var(--r6);
  }
  .blick-eintrag {
    display: flex;
    flex-direction: column;
    gap: var(--r-kachelabstand);
  }
  .blick-eintrag .label {
    font-family: var(--schrift-sans);
    font-size: var(--fs-gruppenkopf);
    letter-spacing: var(--label-spacing);
    text-transform: uppercase;
    color: var(--gedaempft);
  }
  .blick-trenner {
    align-self: stretch;
    width: 1px;
    background: var(--linie);
  }
  .gruppe {
    margin-bottom: var(--seitenrand);
  }
  /* Blatt mit Zeilen — Chargen, Cold-Brew-Ansaetze. Radius 20 (Handoff 3.4
     "Blatt"), horizontales Innenpolster 18; jede Zeile ausser der ersten
     bekommt eine Haarlinie darueber. Profile und die Bohnen-Stammdaten
     nutzen seit Redesign v2 eigene Formen (.profil-raster, .identitaet)
     statt dieses Blatts — siehe docs/design/offene-punkte-redesign.md,
  .hinweis-panel {
    color: var(--gedaempft);
    font-size: var(--fs-satz);
    padding: var(--r3) 0;
    margin: 0;
  }
  .anlegen-zeile {
    display: flex;
    align-items: center;
    min-height: 56px;
    padding: 0;
    border: none;
    background: transparent;
    color: var(--akzent);
    font-family: var(--schrift-sans);
    font-size: var(--fs-bedienwort);
    text-align: left;
    cursor: pointer;
  }
  .anlegen-zeile.schmal {
    min-height: 40px;
    font-size: var(--fs-meta);
  }
  .ansatz-zeile {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: var(--r3) 0;
  }
  .ansatz-kopf {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--r3);
  }
  .ansatz-kopf .name {
    font-size: var(--fs-bedienwort);
    color: var(--tinte);
  }
  .ansatz-zeile .meta {
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  /* Steckbrief — Redesign v2, Etappe 3 (Bildsprache-Mockup): Herkunft,
     Anbauhöhe, Varietät, Aufbereitung als Icon-Kacheln statt Textzeilen —
     das sind die "Geschichte" der Bohne, kein reiner Messwert. Warm
     getönter Kachelgrund statt Vertiefung, damit es zum erzählenden Text
  /* Art | Botanik — letzter Abschnitt der Identitaets-Karte, gleiche
     Zeilen-Trenner-Sprache wie .blick oben, nur umgedreht (Trennlinie
  /* Profil-Raster (Redesign v2) — ersetzt die Zeilenliste (Badge · Name ·
     Modus · Chevron) durch Icon-Kacheln, Alltagspfad-tauglich: ein Blick
     zeigt sofort, welche Zubereitungsart welches Profil ist, statt erst
     den Namen lesen zu muessen. Groessen-Lehre aus der Icon-Bibliothek
     (Artifact "profil-icons.html"): siehe profilIconGroesse() im Script. */
  .profil-raster {
    display: flex;
    flex-wrap: wrap;
    gap: var(--r4);
  }
  .profil-kachel {
    flex: none;
    width: 74px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    border: none;
    background: transparent;
    font-family: var(--schrift-sans);
    cursor: pointer;
  }
  .profil-icon-kreis {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--blatt);
    color: var(--akzent);
    box-shadow: 0 6px 16px -10px var(--schatten-weich);
  }
  .profil-plus .profil-icon-kreis {
    background: transparent;
    border: 1px dashed var(--linie);
    color: var(--gedaempft);
    box-shadow: none;
  }
  .profil-plus .profil-icon-kreis svg {
    width: 18px;
    height: 18px;
  }
  .profil-name {
    font-size: 12.5px;
    color: var(--tinte);
    text-align: center;
    line-height: 1.25;
  }
  .profil-plus .profil-name {
    color: var(--gedaempft);
  }
  /* Icon-Auswahlzeile im "+ Profil"-Formular — kleine Kreise wie eine
     Farbpalette (Plan-Vorgabe), vorbelegt mit dem aus dem Setup
     hergeleiteten Geraete-Icon, frei ueberschreibbar. */
  .icon-auswahl-label {
    font-family: var(--schrift-sans);
    font-size: var(--fs-gruppenkopf);
    letter-spacing: var(--label-spacing);
    text-transform: uppercase;
    color: var(--gedaempft);
    margin: 0;
  }
  .icon-auswahl {
    display: flex;
    flex-wrap: wrap;
    gap: var(--r2);
  }
  .icon-option {
    width: 42px;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 50%;
    background: var(--vertiefung);
    /* Rundes Bedienzeichen auf der tieferen Vertiefung — siehe tokens.css. */
    color: var(--gedaempft-tief);
    cursor: pointer;
  }
  .icon-option.gewaehlt {
    background: var(--fuellung);
    color: var(--auf-fuellung);
  }
  .chargenzeile {
    display: flex;
    flex-direction: column;
    gap: var(--r2);
    padding: var(--r3) 0;
    font-size: var(--fs-bedienwort);
    color: var(--tinte);
  }
  .chargenzeile-kopf {
    display: flex;
    align-items: center;
    gap: var(--r3);
    min-height: 34px;
  }
  .chargenzeile .chargen-titel {
    flex: 1;
  }
  .chargenzeile.aktuelle .chargen-titel {
    /* Rueckmeldung 2026-08-24: nicht mehr fett — "aktuelle" haebt sich ueber
       die Akzentfarbe ab, nicht mehr ueber Schriftgewicht. */
    color: var(--akzent);
  }
  /* Redesign v2, Etappe 2 (Rueckmeldung 2026-09-04) — Bestand-Info und
     Korrektur gehoeren sichtbar zur aktuellen Charge, nicht als lose,
     durch Haarlinien getrennte Einzelzeilen danach (das wirkte
     "unuebersichtlich" — jede Zeile bekam ueber .panel > * eine eigene
     Trennlinie, obwohl sie inhaltlich zusammengehoerten). Jetzt Teil
     derselben .chargenzeile, die Trennlinie faellt pro Charge, nicht pro
     Info-Schnipsel. */
  .bestand-info {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  /* Die Bühnen-Zahl ist in den Kopfbereich gezogen (Zug B) — hier bleibt nur
     der Fall "Bestand unbekannt", der keine Zahl hat. */
  .bestand-unbekannt {
    font-family: var(--schrift-sans);
    color: var(--gedaempft);
  }
  .bestand-unbekannt {
    font-size: 13px;
  }
  .bestand-aktionen {
    flex: none;
    display: flex;
    align-items: center;
    gap: var(--r3);
  }
  .korrigieren-link {
    flex: none;
    padding: 4px 0;
    border: none;
    background: transparent;
    color: var(--akzent);
    font-family: var(--schrift-sans);
    font-size: 13px;
    cursor: pointer;
  }
  .anlage {
    display: flex;
    flex-direction: column;
    gap: var(--r3);
    padding: var(--r3) 0;
  }
  /* Zahlenfeld mit sichtbarer Einheit daneben, statt nur im Platzhalter
     ("Einwaage in g") — der verschwindet beim Tippen, die Einheit bleibt. */
  .mengenfeld {
    display: flex;
    align-items: center;
    gap: var(--r2);
  }
  .mengenfeld :global(.eingabefeld-text) {
    flex: 1;
  }
  .einheit {
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--gedaempft);
  }
  .hinweis {
    color: var(--gedaempft);
    font-size: var(--fs-satz);
  }
  .fehler {
    color: var(--kritisch);
    font-size: var(--fs-satz);
    margin-top: var(--r3);
  }
</style>
