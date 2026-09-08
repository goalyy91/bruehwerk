<script lang="ts">
  // Die Bar — Start. Paket 07: Begruessung + Zwei-Tap-Kacheln nach
  // Decay-Ranking (domain/ranking.ts::rangiereGetraenke), kein Anheften —
  // reine Reihenfolge, wie besprochen und in domain/ranking.test.ts geprueft.
  //
  // Kopfzeile "Bar" ist bewusst entfernt — Abweichung von der pauschalen
  // Root-Tab-Regel (siehe Kommentar in muster/Kopfzeile.svelte). Die
  // Begruessung uebernimmt die Headline-Rolle, die Tab-Leiste zeigt "Bar"
  // ohnehin schon aktiv an — ein dritter Hinweis waere Redundanz.
  //
  // "Getraenk waehlen" statt "Bestellung aufnehmen": der alte Text war
  // Personal-/Gastro-Sprache ("eine Bestellung entgegennehmen"), falsch fuer
  // den Fall "ich will einen dritten Kaffee, nur fuer mich". Die Technik
  // dahinter aendert sich kaum — BestellungAufnehmen.svelte waehlt die
  // Standardperson schon heute automatisch vor.

  import { untrack } from 'svelte';
  import { bestand, schreiben } from '../bestand.svelte';
  import { neueId } from '../../daten/id';
  import { rangiereGetraenke, vorbelegung } from '../../domain/ranking';
  import { begruessung } from '../../domain/begruessung';
  import { bohnenSchnittmenge } from '../../domain/getraenk';
  import { restGramm, geschaetzteBezuege, benoetigtProBezug, altersTage, brauchtAufmerksamkeit } from '../../domain/vorrat';
  import { offeneBeobachtungen } from '../../domain/beobachtungen';
  import {
    sortiereUndDeckeln,
    restmengeUnbekannt,
    dialinOffen,
    kennzahlenPool,
    waehleKennzahlen,
    meistgenutzteKaffeeId,
    type MeldungsArt,
    type Kennzahl,
  } from '../../domain/hinweise';
  import Knopf from '../../muster/Knopf.svelte';
  import VorbelegteFrage from '../../muster/VorbelegteFrage.svelte';
  import Einzelauswahl from '../../muster/Einzelauswahl.svelte';
  import type { Bestellung } from '../../daten/schema';

  let {
    onOeffnenBestellung,
    onOeffnenKaffee,
    onOeffnenProfil,
    onOeffnenBeobachtungen,
    onOeffnenShot,
  }: {
    onOeffnenBestellung: () => void;
    onOeffnenKaffee: (kaffeeId: string) => void;
    onOeffnenProfil: (kaffeeId: string, profilId: string) => void;
    onOeffnenBeobachtungen: () => void;
    /** Fastway (Etappe 9, Block A) — Kachel antippen springt direkt zum Shot. */
    onOeffnenShot: (kaffeeId: string, profilId: string) => void;
  } = $props();

  /** Rückmeldung 2026-09-06: 1-2 sichtbar, optimiert fürs Galaxy S25 — kein Scrollen auf dem Dashboard. */
  const MAX_MELDUNGEN = 2;
  const TAGE_RUHEZUSTAND = 30;

  const letzterShot = $derived(
    bestand.shots.length === 0 ? undefined : [...bestand.shots].sort((a, b) => b.ts - a.ts)[0],
  );
  const kaffeeName = $derived(bestand.kaffees.find((k) => k.id === letzterShot?.kaffeeId)?.name);
  const offeneBestellung = $derived(bestand.offeneBestellung());

  // Einmalig berechnet, nicht reaktiv auf die Uhr — "kein Timer" gilt auch
  // hier: der Satz wechselt beim naechsten Oeffnen, nicht waehrend man auf
  // dem Bildschirm ist. untrack() macht die bewusste Momentaufnahme fuer den
  // Compiler explizit (gleiches Muster wie Chips.svelte fuer `start`).
  const begruessungsText = begruessung(new Date(), { offeneBestellung: untrack(() => !!offeneBestellung) });

  /**
   * Eine liegengebliebene Bestellung abbrechen. Der Status wird auf
   * 'abgebrochen' gesetzt, nicht auf 'abgeschlossen' — sie wurde ja nicht
   * gemacht. Bereits geloggte Shots bleiben unberuehrt: die sind passiert.
   */
  /** Zweiter Tap bestaetigt — dieselbe Mechanik wie Kontextmenue.svelte. */
  let abbrechenBestaetigen = $state(false);

  async function bestellungAbbrechen() {
    const b = offeneBestellung;
    if (!b) return;
    if (!abbrechenBestaetigen) {
      abbrechenBestaetigen = true;
      return;
    }
    abbrechenBestaetigen = false;
    fehler = '';
    try {
      await schreiben('bestellung', { ...b, status: 'abgebrochen' });
    } catch (e) {
      fehler = e instanceof Error ? e.message : String(e);
    }
  }

  const standardPerson = $derived(bestand.personen.find((p) => p.standard));

  /** Bis zu zwei Kacheln — kein Karussell, kein Ranking-Wert im Bild. */
  const eigeneKacheln = $derived.by(() => {
    if (!standardPerson) return [];
    const aktive = bestand.getraenke.filter((g) => g.aktiv);
    if (aktive.length === 0) return [];
    return rangiereGetraenke(bestand.positionen, aktive, standardPerson.id, Date.now()).slice(0, 2);
  });

  /** Zuletzt verwendete Bohne fuer dieses Getraenk — reine Anzeige, keine Vorbelegung. */
  function bohneFuerGetraenk(getraenkId: string): string | undefined {
    const juengste = [...bestand.positionen]
      .filter((p) => p.getraenkId === getraenkId)
      .sort((a, b) => b.ts - a.ts)[0];
    return juengste ? bestand.kaffees.find((k) => k.id === juengste.kaffeeId)?.name : undefined;
  }

  /** Dieselbe Suche wie bohneFuerGetraenk(), aber die Id statt des Namens — fuer den Fastway (unten). */
  function juengsteBohneIdFuerGetraenk(getraenkId: string): string | undefined {
    return [...bestand.positionen].filter((p) => p.getraenkId === getraenkId).sort((a, b) => b.ts - a.ts)[0]?.kaffeeId;
  }

  const alleShotsAlsVerbrauch = $derived(
    bestand.shots.map((s) => ({ chargeId: s.chargeId, ts: s.ts, inputGramm: s.ist.input })),
  );
  const bestandSchwellen = $derived(
    bestand.einstellungen
      ? {
          knappBezuege: bestand.einstellungen.bestandKnappBezuege,
          frischWochen: bestand.einstellungen.bestandFrischWochen,
          eingefrorenMonate: bestand.einstellungen.bestandEingefrorenMonate,
        }
      : { knappBezuege: 2, frischWochen: 8, eingefrorenMonate: 8 },
  );

  interface MeldungsAnzeige {
    readonly art: MeldungsArt;
    readonly name: string;
    readonly meta: string;
    readonly wert?: number;
    readonly einheit?: string;
    readonly onKlick: () => void;
  }

  /**
   * Meldungs-Kandidaten, Etappe 8 (domain/hinweise.ts) — fünf Arten, priorisiert
   * und auf MAX_MELDUNGEN gedeckelt (sortiereUndDeckeln). Ersetzt die alte
   * "bestandHinweise", die eine Bohne ohne Einwaage stillschweigend übersprang
   * (rest === undefined -> return undefined) statt die Lücke selbst zu meckern.
   */
  const meldungsKandidaten = $derived.by((): MeldungsAnzeige[] => {
    const jetzt = Date.now();
    const kandidaten: MeldungsAnzeige[] = [];

    for (const k of bestand.kaffees.filter((k2) => k2.aktiv && k2.aktuelleChargeId)) {
      const charge = bestand.chargen.find((c) => c.id === k.aktuelleChargeId);
      if (!charge) continue;
      const rest = restGramm(charge, charge.id, alleShotsAlsVerbrauch);
      if (rest === undefined) {
        if (restmengeUnbekannt(charge)) {
          kandidaten.push({
            art: 'restUnbekannt',
            name: k.name,
            meta: 'Restmenge unbekannt — Einwaage nachtragen',
            onKlick: () => onOeffnenKaffee(k.id),
          });
        }
        continue;
      }
      const standardInput = bestand.profileVon(k.id).find((p) => p.standard)?.ziel.input;
      const bezuege = geschaetzteBezuege(rest, benoetigtProBezug(charge, charge.id, alleShotsAlsVerbrauch, standardInput));
      const status = brauchtAufmerksamkeit(bezuege, altersTage(charge.roestdatum, jetzt), charge.eingefroren, bestandSchwellen);
      if (!status) continue;
      kandidaten.push({
        art: status === 'knapp' ? 'knapp' : 'alt',
        name: k.name,
        meta: `${rest} g${status === 'alt' ? ' · sollte bald raus' : ''}`,
        wert: bezuege,
        einheit: 'Bezüge',
        onKlick: () => onOeffnenKaffee(k.id),
      });
    }

    for (const profil of bestand.profile) {
      const kaffee = bestand.kaffees.find((k) => k.id === profil.kaffeeId);
      if (!kaffee?.aktiv) continue;
      const eigeneShots = bestand.shots.filter((s) => s.profilId === profil.id).length;
      if (!dialinOffen(profil, eigeneShots)) continue;
      kandidaten.push({
        art: 'dialinOffen',
        name: profil.name,
        meta: `Dial-in offen · seit ${eigeneShots} Shots`,
        onKlick: () => onOeffnenProfil(profil.kaffeeId, profil.id),
      });
    }

    const beobachtungen = offeneBeobachtungen(bestand.shots, bestand.beobachtungen);
    if (beobachtungen.length > 0) {
      kandidaten.push({
        art: 'beobachtung',
        name: 'Offene Beobachtungen',
        meta: `${beobachtungen.length} Begriff${beobachtungen.length === 1 ? '' : 'e'} wartet auf eine Entscheidung`,
        onKlick: onOeffnenBeobachtungen,
      });
    }

    return kandidaten;
  });

  const meldungen = $derived(sortiereUndDeckeln(meldungsKandidaten, MAX_MELDUNGEN));

  /** Ruhezustand: keine Meldung offen -> die Bohne, mit der gerade gearbeitet wird, statt einer Lücke. */
  const ruhezustandBohne = $derived.by(() => {
    if (meldungen.sichtbar.length > 0) return undefined;
    const jetzt = Date.now();
    const kaffeeId = meistgenutzteKaffeeId(bestand.shots, TAGE_RUHEZUSTAND, jetzt);
    const kaffee = kaffeeId ? bestand.kaffees.find((k) => k.id === kaffeeId && k.aktiv) : undefined;
    if (!kaffee?.aktuelleChargeId) return undefined;
    const charge = bestand.chargen.find((c) => c.id === kaffee.aktuelleChargeId);
    if (!charge) return undefined;
    const rest = restGramm(charge, charge.id, alleShotsAlsVerbrauch);
    const standardInput = bestand.profileVon(kaffee.id).find((p) => p.standard)?.ziel.input;
    const bezuege = rest !== undefined ? geschaetzteBezuege(rest, benoetigtProBezug(charge, charge.id, alleShotsAlsVerbrauch, standardInput)) : undefined;
    return {
      name: kaffee.name,
      meta: `${rest !== undefined ? `${rest} g · ` : ''}${altersTage(charge.roestdatum, jetzt)} Tage`,
      bezuege,
      kaffeeId: kaffee.id,
    };
  });

  /**
   * Kennzahl-Kacheln — zwei zufällig aus dem Pool gezogen, einmal je Aufruf
   * dieses Bildschirms (nicht bei jeder Datenänderung während man drauf
   * schaut). `{#key zuPfad(route)}` in Rahmen.svelte baut Bar.svelte bei
   * jeder Rückkehr zur Bar neu auf — der Effekt greift dann erneut, sobald
   * `bestand.geladen` (wieder) wahr ist. Die eigentliche Berechnung steht in
   * untrack(): nur "geladen" soll den Effekt auslösen, nicht jede spätere
   * Shot-Änderung.
   */
  let kennzahlenAuswahl = $state<readonly Kennzahl[]>([]);
  $effect(() => {
    if (!bestand.geladen) return;
    untrack(() => {
      const zubereitungVonShot = (profilId: string): string | undefined => {
        const profil = bestand.profile.find((p) => p.id === profilId);
        return profil ? bestand.bruehgeraetVon(profil.setupId)?.typ : undefined;
      };
      const pool = kennzahlenPool(
        bestand.shots.map((s) => ({ ts: s.ts, kaffeeId: s.kaffeeId, zubereitung: zubereitungVonShot(s.profilId) })),
        bestand.kaffees.map((k) => ({ id: k.id, name: k.name, aktiv: k.aktiv, entkoffeiniert: k.entkoffeiniert })),
        Date.now(),
      );
      kennzahlenAuswahl = waehleKennzahlen(pool, 2);
    });
  });

  let fehler = $state('');

  async function bestellungSicherstellen(): Promise<void> {
    if (offeneBestellung) return;
    const neu: Bestellung = {
      id: neueId(),
      ts: Date.now(),
      positionIds: [],
      durchgangIds: [],
      dauerGeschaetzt: 0,
      verschnitt: 0,
      status: 'offen',
    };
    await schreiben('bestellung', neu);
  }

  async function getraenkWaehlen(): Promise<void> {
    fehler = '';
    try {
      await bestellungSicherstellen();
      onOeffnenBestellung();
    } catch (e) {
      fehler = e instanceof Error ? e.message : String(e);
    }
  }

  // ---------------------------------------------------------------------
  // Fastway (Etappe 9, Block A) — Kachel antippen springt direkt zu
  // ShotErfassung, ohne Bestellung/Plan/Abarbeiten. Vorher legte kachelWaehlen()
  // eine Bestellung an und oeffnete BestellungAufnehmen — das war seit dem
  // Umbau des Mengen-Modus (Etappe 7, damals "Café-Style" genannt) ein Umweg von Person/Getraenk/Koffein/Bohne/
  // hinzufuegen/Plan/Abarbeiten statt des in CLAUDE.md versprochenen
  // Zwei-Tap-Wegs. Profilblatt.svelte springt schon heute direkt zu
  // ShotErfassung (navigation.gehe({name:'shot', kaffeeId, profilId})) —
  // der Fastway macht denselben Sprung, nur mit automatisch aufgeloester
  // Bohne/Profil statt manueller Navigation ueber Kaffees -> Profil.
  //
  // Rueckfragen bleiben Ausnahme: nur wenn die Koffein-Vorbelegung selbst
  // unsicher ist (vorbelegung().frage, K12 — Vorbelegung ja, Verschweigen
  // nein) oder mehrere Bohnen gleichzeitig passen UND die zuletzt fuer
  // dieses Getraenk verwendete nicht mehr dazugehoert.
  type FastwayPhase = 'koffein' | 'bohne';
  interface FastwayZustand {
    readonly getraenkId: string;
    readonly phase: FastwayPhase;
    readonly koffeinVorbelegung?: ReturnType<typeof vorbelegung>;
    readonly bohnenOptionen?: readonly { id: string; name: string }[];
  }
  let fastway = $state<FastwayZustand | undefined>(undefined);

  async function kachelWaehlen(getraenkId: string): Promise<void> {
    fehler = '';
    fastway = undefined;
    if (!standardPerson) return; // Kacheln erscheinen nur, wenn standardPerson existiert
    const eigenePositionenChronologisch = bestand.positionen
      .filter((p) => p.personId === standardPerson.id)
      .sort((a, b) => a.ts - b.ts);
    const koffeinVorbelegung = vorbelegung(eigenePositionenChronologisch.map((p) => p.koffein === 'entkoffeiniert'));
    if (koffeinVorbelegung.frage) {
      fastway = { getraenkId, phase: 'koffein', koffeinVorbelegung };
      return;
    }
    await fastwayBohneUndWeiter(getraenkId, 'normal');
  }

  async function fastwayKoffeinBeantwortet(entkoffeiniert: boolean): Promise<void> {
    if (!fastway) return;
    const getraenkId = fastway.getraenkId;
    fastway = undefined;
    await fastwayBohneUndWeiter(getraenkId, entkoffeiniert ? 'entkoffeiniert' : 'normal');
  }

  async function fastwayBohneUndWeiter(getraenkId: string, koffein: 'normal' | 'entkoffeiniert'): Promise<void> {
    const getraenk = bestand.getraenke.find((g) => g.id === getraenkId);
    if (!getraenk) return;
    const optionen = bohnenSchnittmenge(bestand.kaffees, getraenk.zubereitung, koffein);
    if (optionen.length === 0) {
      fehler = 'Keine passende Bohne aktiv.';
      return;
    }
    const juengsteId = juengsteBohneIdFuerGetraenk(getraenkId);
    const juengsteTrifftZu = juengsteId !== undefined && optionen.some((k) => k.id === juengsteId);
    if (optionen.length === 1 || juengsteTrifftZu) {
      fastwaySpringen(getraenkId, juengsteTrifftZu ? juengsteId! : optionen[0]!.id);
      return;
    }
    fastway = { getraenkId, phase: 'bohne', bohnenOptionen: optionen.map((k) => ({ id: k.id, name: k.name })) };
  }

  function fastwayBohneBeantwortet(kaffeeId: string): void {
    if (!fastway) return;
    const getraenkId = fastway.getraenkId;
    fastway = undefined;
    fastwaySpringen(getraenkId, kaffeeId);
  }

  function fastwaySpringen(getraenkId: string, kaffeeId: string): void {
    const getraenk = bestand.getraenke.find((g) => g.id === getraenkId);
    if (!getraenk) return;
    const profil = bestand.profilFuerZubereitung(kaffeeId, getraenk.zubereitung);
    if (!profil) {
      fehler = 'Kein Profil für diese Bohne und Zubereitung.';
      return;
    }
    onOeffnenShot(kaffeeId, profil.id);
  }
</script>

<header class="begruessungsblock">
  {#if begruessungsText.label}<p class="tageszeit-label">{begruessungsText.label}</p>{/if}
  <p class="begruessung">{begruessungsText.satz}</p>
</header>

{#if letzterShot && kaffeeName}
  <p class="quittung">{kaffeeName} · {letzterShot.urteil}</p>
{:else}
  <p class="hinweis">Noch kein Shot geloggt. Loggen geht ab einem Kaffee mit Profil — unter „Kaffees".</p>
{/if}

<!-- Zone "Jetzt" — Kacheln + Primäraktion als ein zusammenhängender Block,
     enger Abstand statt eines Kartenrahmens (eine vierte Flächenebene wäre
     dafür nötig gewesen — siehe Mockup-Anmerkung, Etappe 8 Block A). -->
<div class="jetzt-zone">
  {#if eigeneKacheln.length > 0}
    <h2>Dein Espresso</h2>
    <div class="kachelreihe">
      {#each eigeneKacheln as getraenk, i (getraenk.id)}
        <button type="button" class="kachel" class:primaer={i === 0} onclick={() => kachelWaehlen(getraenk.id)}>
          <span class="kachel-name">{getraenk.name}</span>
          {#if bohneFuerGetraenk(getraenk.id)}<span class="kachel-meta">{bohneFuerGetraenk(getraenk.id)}</span>{/if}
        </button>
      {/each}
    </div>
  {/if}

  <!-- Fastway-Rückfrage (Etappe 9, Block A) — Ausnahme, keine Regel: nur
       wenn die Koffein-Vorbelegung selbst unsicher ist oder mehrere Bohnen
       gleichzeitig passen und die zuletzt verwendete nicht mehr dazugehört. -->
  {#if fastway?.phase === 'koffein' && fastway.koffeinVorbelegung?.frage}
    <div class="fastway-frage">
      <VorbelegteFrage
        frage="Entkoffeiniert?"
        anteil={fastway.koffeinVorbelegung.anteil * 100}
        start={fastway.koffeinVorbelegung.vorbelegt ? true : undefined}
        onWahl={(ja) => fastwayKoffeinBeantwortet(ja)}
      />
    </div>
  {:else if fastway?.phase === 'bohne' && fastway.bohnenOptionen}
    <div class="fastway-frage">
      <h2>Bohne</h2>
      <Einzelauswahl
        optionen={fastway.bohnenOptionen.map((k) => ({ wert: k.id, label: k.name }))}
        wert=""
        onWahl={(w) => fastwayBohneBeantwortet(w)}
      />
    </div>
  {/if}

  {#if fehler}<p class="fehler">{fehler}</p>{/if}

  <!-- Rückmeldung 2026-09-08: eine liegengebliebene Bestellung war nur
       loszuwerden, indem man sie abschloss — was behauptet hätte, sie sei
       gemacht worden. Das Abbrechen steht hier klein neben „Fortsetzen“,
       weil hier auffällt, dass etwas liegen geblieben ist. Als Zeichen statt
       als Wort, damit es die Primäraktion nicht bedrängt. -->
  <div class="bestellzeile" class:geteilt={!!offeneBestellung}>
    <div class="hauptknopf">
      <Knopf stufe="primaer" onKlick={getraenkWaehlen}>
        {offeneBestellung ? 'Fortsetzen' : 'Getränk wählen'}
      </Knopf>
    </div>
    {#if offeneBestellung}
      <div class="abbrechen-feld">
        <button
          type="button"
          class="abbrechen"
          class:bestaetigen={abbrechenBestaetigen}
          onclick={() => void bestellungAbbrechen()}
          aria-label={abbrechenBestaetigen ? 'Bestellung wirklich verwerfen' : 'Bestellung verwerfen'}
        >
          {abbrechenBestaetigen ? 'wirklich?' : '×'}
        </button>
      </div>
    {/if}
  </div>
</div>

<!-- Zone "Bestand" — feste Zone statt Alles-oder-nichts (Etappe 8 Block A):
     1-2 Meldungen wenn vorhanden, sonst die Bohne, mit der gerade gearbeitet
     wird. Ganz ohne Daten (frische Installation) bleibt die Zone weg. -->
{#if meldungen.sichtbar.length > 0 || ruhezustandBohne}
  <div class="abschnitt">
    <h2>Bestand</h2>
    <div class="bestandliste">
      {#if meldungen.sichtbar.length > 0}
        {#each meldungen.sichtbar as eintrag (eintrag.art + eintrag.name)}
          <button
            type="button"
            class="bestandkarte"
            class:kritisch={eintrag.art === 'knapp'}
            class:achtung={eintrag.art === 'alt'}
            class:info={eintrag.art === 'restUnbekannt' || eintrag.art === 'dialinOffen' || eintrag.art === 'beobachtung'}
            onclick={eintrag.onKlick}
          >
            <div class="bestandkarte-text">
              <span class="bestandkarte-name">{eintrag.name}</span>
              <span class="bestandkarte-meta">{eintrag.meta}</span>
            </div>
            {#if eintrag.wert !== undefined}
              <div class="bestandkarte-wert">
                <span class="zahl zahl-buehne">{eintrag.wert}</span><span class="bestandkarte-einheit">{eintrag.einheit}</span>
              </div>
            {/if}
          </button>
        {/each}
        {#if meldungen.weitere > 0}
          <p class="weitere-zeile">und {meldungen.weitere} weitere</p>
        {/if}
      {:else if ruhezustandBohne}
        <button type="button" class="bestandkarte" onclick={() => onOeffnenKaffee(ruhezustandBohne.kaffeeId)}>
          <div class="bestandkarte-text">
            <span class="bestandkarte-name">{ruhezustandBohne.name}</span>
            <span class="bestandkarte-meta">{ruhezustandBohne.meta}</span>
          </div>
          {#if ruhezustandBohne.bezuege !== undefined}
            <div class="bestandkarte-wert">
              <span class="zahl zahl-buehne">{ruhezustandBohne.bezuege}</span><span class="bestandkarte-einheit">Bezüge</span>
            </div>
          {/if}
        </button>
      {/if}
    </div>
  </div>
{/if}

<!-- Fuß: zwei Kennzahl-Kacheln aus dem Fakten-Pool (Rückmeldung 2026-09-06),
     Bauform 1:1 aus Parameterkachel.svelte — Label oben, große Zahl darunter. -->
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

<style>
  /* Luft nach oben, damit der Satz auf der Fläche steht statt an ihr zu
     hängen — der eigentliche Grund für "sieht oben hängend aus". */
  .bestellzeile {
    display: flex;
    align-items: center;
  }
  /* Spalte statt Zeile: darin streckt sich der Knopf von selbst auf die
     volle Breite des Felds — genau das, was er vorher als direktes Kind der
     Spalte .jetzt-zone tat. Ohne das schrumpft er auf die Wortbreite. */
  .hauptknopf {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  /* Rueckmeldung 2026-09-08: ohne Abbrechen bleibt der Knopf so breit wie
     vorher — volle Blattbreite. Erst wenn abgebrochen werden kann, teilt sich
     die Zeile, und zwar in genau demselben Verhaeltnis wie die zwei
     Getraenkekacheln darueber (1.7 : 1, gleicher Abstand): der Hauptknopf
     steht unter der ersten Kachel, das Abbrechen mittig unter der zweiten.
     Zwei Kanten uebereinander statt vier. */
  .bestellzeile.geteilt {
    gap: var(--r-kachelabstand);
  }
  .bestellzeile.geteilt .hauptknopf {
    flex: 1.7;
  }
  .abbrechen-feld {
    flex: 1;
    display: flex;
    justify-content: center;
  }
  /* Nahezu quadratisch, nur ein Zeichen — die Primaeraktion daneben soll die
     Zeile fuehren, nicht der Rueckzug. Trefferflaeche trotzdem 48 px. */
  .abbrechen {
    width: var(--treffer);
    height: var(--treffer);
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: var(--r-kachel);
    background: var(--vertiefung);
    color: var(--gedaempft-tief);
    font-family: var(--schrift-sans);
    font-size: 20px;
    line-height: 1;
    cursor: pointer;
  }
  /* Der zweite Tap braucht ein Wort — ein Zeichen allein sagt nicht, dass
     jetzt scharf geschaltet ist. Nur dafuer wird der Knopf breiter. */
  .abbrechen.bestaetigen {
    width: auto;
    padding: 0 var(--r3);
    color: var(--kritisch);
    font-size: var(--fs-meta);
  }
  /* Rueckmeldung 2026-09-08 aus dem Livebetrieb: das Dashboard passte nicht
     mehr aufs Bild. Gespart wird an den Abstaenden zwischen den Zonen, nicht
     an den Zonen selbst — vier Gruppenabstaende von 24 auf 18 und der Kopf
     dichter an die Oberkante ("den Kopf bisschen hoeher nehmen") ergeben
     zusammen rund 50 px, und genau so viel fehlte bei zwei Bestandsmeldungen.
     Schriftgroessen und Trefferflaechen bleiben unangetastet. */
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
  /* Rückmeldung 2026-09-08: "sieht bisschen oben hängend aus … etwas
     präsenter gestalten ohne größer zu machen". Der Satz klebte ohne Luft am
     oberen Rand und lief auf 26 px ins Nichts.
     Präsenz kommt hier aus Raum und Umbruch, nicht aus Punkten: Abstand
     darüber, damit er auf der Fläche steht statt an ihr zu hängen; engere
     Zeilen, damit er als ein Block liest; `text-wrap: balance`, damit zwei
     Zeilen etwa gleich lang brechen statt als lange Zeile plus Rest. Die
     Schriftgröße bleibt unverändert. */
  .begruessung {
    font-size: var(--fs-titel);
    font-weight: var(--gw-titel);
    letter-spacing: -0.02em;
    line-height: 1.15;
    text-wrap: balance;
    max-width: 22ch;
    margin: 0;
  }
  .quittung {
    font-size: var(--fs-satz);
    color: var(--satz);
    margin: var(--r3) 0 0;
  }
  .hinweis {
    font-size: var(--fs-meta);
    color: var(--gedaempft);
    margin: var(--r3) 0 0;
  }
  .fehler {
    color: var(--kritisch);
    font-size: var(--fs-satz);
  }
  .abschnitt {
    margin-top: var(--r4);
  }
  /* Einzige erlaubte Abweichung vom globalen h2 (tokens.css): dieser
     Gruppenkopf steht direkt unter der Kopfzeile und braucht deshalb
     keinen Abstand nach oben. Die uebrigen sechs Eigenschaften waren
     eine wortgleiche Kopie und sind entfallen. */
  h2 {
    margin-top: 0;
  }
  .kachelreihe {
    display: flex;
    gap: var(--r-kachelabstand);
    align-items: stretch;
  }
  .kachel {
    flex: 1;
    min-height: 72px;
    padding: var(--r3) var(--r4);
    border: none;
    border-radius: var(--r-karte);
    background: var(--vertiefung);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    text-align: left;
    cursor: pointer;
    /* Serif bewusst: die Kachel traegt einen Getraenkenamen, keinen
       Bedienbegriff — Namen bleiben in der Anzeigenschrift. */
    font-family: var(--schrift);
  }
  .kachel.primaer {
    flex: 1.7;
    background: var(--blatt);
  }
  .kachel-name {
    font-size: var(--fs-bedienwort);
    color: var(--tinte);
  }
  .kachel.primaer .kachel-name {
    font-size: var(--fs-objekt);
  }
  .kachel-meta {
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--gedaempft);
    margin-top: 3px;
  }
  .jetzt-zone {
    margin-top: var(--r4);
    display: flex;
    flex-direction: column;
    gap: var(--r3);
  }
  .fastway-frage {
    background: var(--blatt);
    border-radius: var(--r-karte);
    padding: var(--r4);
  }
  .bestandliste {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .bestandkarte {
    display: flex;
    align-items: center;
    gap: 14px;
    width: 100%;
    padding: 12px 18px;
    border: none;
    border-radius: 18px;
    background: var(--blatt);
    box-shadow: 0 6px 16px -10px var(--schatten-weich);
    border-left: 3px solid transparent;
    cursor: pointer;
    text-align: left;
    /* Serif bewusst: die Karte traegt einen Kaffeenamen und eine Menge. */
    font-family: var(--schrift);
  }
  .bestandkarte.achtung {
    border-left-color: var(--achtung);
  }
  .bestandkarte.kritisch {
    border-left-color: var(--kritisch);
  }
  /* Restmenge unbekannt / Dial-in offen / offene Beobachtungen — keine
     Dringlichkeit, nur eine Wissenslücke bzw. Erinnerung, deshalb Spurfarbe
     statt Kritisch-/Achtung-Ton (Mockup-Rückfrage, unwidersprochen). */
  .bestandkarte.info {
    border-left-color: var(--spur);
  }
  .weitere-zeile {
    font-family: var(--schrift-sans);
    font-size: var(--fs-meta);
    color: var(--gedaempft);
    text-align: center;
    margin: 2px 0 0;
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
  .bestandkarte-wert {
    flex: none;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 2px;
  }
  .bestandkarte-einheit {
    font-family: var(--schrift-sans);
    font-size: 10.5px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--gedaempft);
  }
  /* Kennzahl-Kacheln — Bauform 1:1 aus Parameterkachel.svelte (Label oben,
     Wert darunter), nur ohne Symbol-Kopf (kein festes Icon-Set für beliebige
     Fakten) und mit der größeren Bühnen-Zahl (26px, wie in der Bestandkarte)
     statt der normalen 19px-Wertgröße — Rückmeldung 2026-09-06: "höher,
     dafür nicht so breit" statt einer einzelnen breiten Zeile. */
  .kennzahl-raster {
    margin-top: var(--r4);
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
    min-height: 68px;
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
  }
  /* Rückmeldung 2026-09-08: „finde die KPIs noch arg plakativ". 26 px war
     größer als jede andere Zahl der App (--fs-wert ist 19). Die zwei Kacheln
     sind Beiwerk am Fuß des Bildschirms, nicht seine Aussage — sie stehen
     jetzt auf derselben Zahlengröße wie überall sonst. */
  .kennzahl-zahl {
    font-size: var(--fs-wert);
    line-height: 1;
    color: var(--tinte);
  }
</style>
