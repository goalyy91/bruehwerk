/**
 * Die eigentliche Migration — nimmt SeedSeite[] entgegen und liefert
 * schreibfertige Datensaetze. `notion.ts` parst; diese Datei ist der
 * dritte, bisher fehlende Schritt: sie setzt Setup-Bindung (Paket-03-Scope,
 * siehe pruefung.ts-Kommentar) und erzeugt Kaffee/Charge/Profil/Shot/
 * Gussplan zum Schreiben.
 *
 * Eigenstaendig von pruefung.ts: pruefeSeiten() bleibt die strenge,
 * "gueltige Mahlgradbereiche"-Voransicht (weiterhin getestet, unveraendert
 * gueltig) — aber diese Datei klassifiziert bewusst lockerer, weil die
 * engen Bereiche in der Praxis den Grossteil der echten Historie
 * ausgeschlossen haetten (nur 1 von 8 Kaffees lag im schmalen Fenster).
 * Zuordnungsregel: Zahl >= 50 -> K6 (Klicks, ganzzahlig), sonst Sculptor.
 * Falsche Zuordnungen sind billig zu korrigieren, weil Profile am
 * Profilblatt das Setup nachtraeglich wechseln koennen.
 *
 * Grundregel bleibt: **nicht eindeutig zuordenbar wird uebersprungen und
 * im Bericht genannt, nie geraten.**
 */
import { parseKaffeeSeite, type ProfilEntwurf, type ShotEntwurf, type GussBausteinEntwurf } from './notion';
import { ersteZahl, erkenneDecaf, sterneOderZahl, type SeedSeite, type OffenerPunkt } from './pruefung';
import { SETUP_ESPRESSO, SETUP_MOKA_1 } from '../stammdaten';
import { SPIELRAUM_VORGABE } from '../../domain/spielraum';
import type { Kaffee, Charge, Profil, Shot, Gussplan, GussBaustein, ZielWerte } from '../schema';

export interface MigrationsBericht {
  readonly kaffees: number;
  readonly profile: number;
  readonly shots: number;
  readonly gussplaene: number;
  readonly offen: readonly OffenerPunkt[];
}

export interface MigrationsErgebnis {
  readonly kaffees: readonly Kaffee[];
  readonly chargen: readonly Charge[];
  readonly profile: readonly Profil[];
  readonly shots: readonly Shot[];
  readonly gussplaene: readonly Gussplan[];
  readonly bericht: MigrationsBericht;
}

const EINE_MINUTE_MS = 60_000;
/** Schwelle statt schmaler Fenster: >= 50 ist K6 (Klicks), sonst Sculptor. */
const K6_SCHWELLE = 50;

type MuehlenKandidat = 'sculptor' | 'k6';

/** Einzige Zahl -> Muehle. null nur, wenn ueberhaupt keine Zahl lesbar ist ("unbekannt/sehr fein" o.ae.). */
function erkenneMuehle(mgRoh: string | undefined): MuehlenKandidat | null {
  if (mgRoh === undefined) return null;
  const zahl = ersteZahl(mgRoh);
  if (zahl === null) return null;
  return zahl >= K6_SCHWELLE ? 'k6' : 'sculptor';
}

/** input/mg/output/zeit sind in ZielWerte Pflicht — fehlt eines, gibt es keine gueltige Rezeptur. */
function bauZielWerte(parameter: Record<string, string>): ZielWerte | { fehlt: string[] } {
  const input = parameter['Dose'] !== undefined ? ersteZahl(parameter['Dose']) : null;
  const mg = parameter['MG'] !== undefined ? ersteZahl(parameter['MG']) : null;
  const output = parameter['Yield'] !== undefined ? ersteZahl(parameter['Yield']) : null;
  const zeitRoh = parameter['Zeit'] ?? parameter['DLZ'];
  const zeit = zeitRoh !== undefined ? ersteZahl(zeitRoh) : null;

  const fehlt: string[] = [];
  if (input === null || input <= 0) fehlt.push('Dose');
  if (mg === null) fehlt.push('MG');
  if (output === null) fehlt.push('Yield');
  if (zeit === null) fehlt.push('Zeit');
  if (fehlt.length > 0) return { fehlt };

  const rpmRoh = parameter['RPM'];
  const ktRoh = parameter['KT'] ?? parameter['BT'];
  const preRoh = parameter['Pre'] ?? parameter['Preinfusion'];

  return {
    input: input as number,
    mg: mg as number,
    output: output as number,
    zeit: zeit as number,
    rpm: rpmRoh !== undefined ? (ersteZahl(rpmRoh) ?? undefined) : undefined,
    kt: ktRoh !== undefined ? (ersteZahl(ktRoh) ?? undefined) : undefined,
    pre: preRoh !== undefined ? (ersteZahl(preRoh) ?? undefined) : undefined,
  };
}

/** '–', 'warten' u.ae. lesen als "keine Zahl da" — nicht als 0, das waere erfunden. */
function gussBausteinAusEntwurf(e: GussBausteinEntwurf): GussBaustein {
  const menge = ersteZahl(e.menge);
  const dauer = ersteZahl(e.dauer);
  return {
    typ: 'frei',
    menge: menge ?? 0,
    dauer: dauer ?? undefined,
    rolle: e.rolle || 'Baustein',
    text: e.text || undefined,
  };
}

export function migriereSeiten(seiten: readonly SeedSeite[], gezogenAmMs: number): MigrationsErgebnis {
  const offen: OffenerPunkt[] = [];

  const kaffees: Kaffee[] = [];
  const chargen: Charge[] = [];
  const profile: Profil[] = [];
  const shots: Shot[] = [];
  const gussplaene: Gussplan[] = [];

  for (const seite of seiten) {
    const roester = seite.properties['Röster'];
    if (typeof roester !== 'string' || roester.trim() === '') {
      offen.push({ quelle: seite.titel, was: 'Kaffee ohne Röster', warum: 'Property "Röster" fehlt oder ist leer' });
      continue;
    }

    const entwurf = parseKaffeeSeite(seite.inhalt);
    const kaffeeId = seite.id;

    const erkenntnisse: Kaffee['erkenntnisse'] = [];
    const erkenntnisText = seite.properties['Erkenntnisse'];
    if (typeof erkenntnisText === 'string' && erkenntnisText.trim() !== '') {
      erkenntnisse.push({ ts: gezogenAmMs, text: erkenntnisText.trim(), herkunft: 'uebernommen' });
    }
    const tastingText = seite.properties['Tasting-Text'];
    if (typeof tastingText === 'string' && tastingText.trim() !== '') {
      erkenntnisse.push({ ts: gezogenAmMs, text: tastingText.trim(), herkunft: 'uebernommen' });
    }

    const bestFit = seite.properties['Best Fit'];
    const geeignetFuer = typeof bestFit === 'string' && bestFit.trim() !== '' ? [bestFit.trim()] : [];

    // Ein Platzhalter je Kaffee (K61-Feld "nummer" traegt das kenntlich) —
    // Notion hat nie Chargen gefuehrt, Roestdaten stehen nur unstrukturiert
    // in Freitext und werden nicht herausgeraten.
    const chargeId = `${kaffeeId}-charge-migration`;
    chargen.push({ id: chargeId, kaffeeId, nummer: 'unbekannt (Migration)', roestdatum: gezogenAmMs, leer: false });
    offen.push({
      quelle: seite.titel,
      was: 'Charge ist ein Platzhalter',
      warum: 'Notion hat keine Chargen/Röstdaten strukturiert geführt — am Kaffeeblatt nachtragen',
    });

    kaffees.push({
      id: kaffeeId,
      name: seite.titel,
      roester,
      aktiv: true,
      art: 'single',
      herkunft: [],
      entkoffeiniert: erkenneDecaf(seite.titel),
      geeignetFuer,
      chargeIds: [chargeId],
      aktuelleChargeId: chargeId,
      bewertung: sterneOderZahl(seite.properties['Bewertung']),
      erkenntnisse,
    });

    // Profile — nach varianteName auffindbar fuer die Shot-Zuordnung unten.
    const profilIdVon = new Map<string, string>();
    const migrierteProfilIds: string[] = [];

    entwurf.profile.forEach((p: ProfilEntwurf, pi: number) => {
      const muehle = erkenneMuehle(p.parameter['MG']);
      if (muehle === null) {
        offen.push({
          quelle: `${seite.titel} / Variante "${p.varianteName}"`,
          was: p.parameter['MG'] === undefined ? 'kein MG-Parameter' : `MG "${p.parameter['MG']}" nicht als Zahl lesbar`,
          warum: 'weder Sculptor noch K6 zuordenbar',
        });
        return;
      }

      const ziel = bauZielWerte(p.parameter);
      if ('fehlt' in ziel) {
        offen.push({
          quelle: `${seite.titel} / Variante "${p.varianteName}"`,
          was: `fehlende Parameter: ${ziel.fehlt.join(', ')}`,
          warum: 'ohne Dose/MG/Yield/Zeit gibt es keine gueltige Rezeptur',
        });
        return;
      }

      const setupId = muehle === 'sculptor' ? SETUP_ESPRESSO.id : SETUP_MOKA_1.id;
      if (muehle === 'k6') {
        offen.push({
          quelle: `${seite.titel} / Variante "${p.varianteName}"`,
          was: 'Setup angenommen: Moka 1 Tasse',
          warum: 'MG >= 50 ist eindeutig K6, aber nicht zwischen Moka 1er/3er/Pour-Over unterscheidbar — am Profilblatt korrigierbar',
        });
      }

      const profilId = `${kaffeeId}-profil-${pi}`;
      profilIdVon.set(p.varianteName.toLowerCase(), profilId);
      migrierteProfilIds.push(profilId);

      profile.push({
        id: profilId,
        kaffeeId,
        setupId,
        name: p.varianteName || `Profil ${pi + 1}`,
        standard: p.standard,
        ziel,
        spielraum: SPIELRAUM_VORGABE,
        modus: p.abgeschlossen ? 'eingefahren' : 'dialin',
        hinweise: p.hinweise,
      });
    });

    // Gussplan — nur schreibbar, wenn ein Profil zugeordnet werden kann.
    if (entwurf.gussbausteine.length > 0) {
      const zielProfilId = migrierteProfilIds.length === 1 ? migrierteProfilIds[0] : undefined;
      if (zielProfilId) {
        const gussplanId = `${kaffeeId}-gussplan`;
        gussplaene.push({
          id: gussplanId,
          name: `${seite.titel} · migriert`,
          gesamtwasser: 1, // Platzhalter — Bausteine tragen typ 'frei', domain/gussplan.ts rechnet ihn bei Bedarf neu
          lesart: 'kumulativ',
          bausteine: entwurf.gussbausteine.map(gussBausteinAusEntwurf),
        });
        const zielProfil = profile.find((p) => p.id === zielProfilId);
        if (zielProfil) zielProfil.gussplanId = gussplanId;
      } else {
        offen.push({
          quelle: seite.titel,
          was: `Gussplan mit ${entwurf.gussbausteine.length} Bausteinen ohne eindeutiges Profil`,
          warum: migrierteProfilIds.length === 0 ? 'kein Profil dieses Kaffees wurde migriert' : 'mehrere Profile — nicht eindeutig, welchem der Gussplan gehört',
        });
      }
    }

    // Shots — Zuordnung zum Profil ueber die Gruppen-Ueberschrift, sonst
    // (bei genau einem migrierten Profil) auf dieses. Sonst: melden, nicht raten.
    //
    // Zweistufig, weil sich erst NACH allen drei Pruefungen (Muehle, Ziel-
    // Parameter, Profil-Zuordnung) zeigt, ob ein ShotEntwurf ueberhaupt
    // geschrieben wird. Fruehere Fassung zaehlte "gueltige" Shots nur ueber
    // die Muehle-Pruefung vor und teilte spaetere Ausfaelle (z. B. fehlende
    // Zeit) nicht mehr mit — die Zeitstempel-Spreizung passte dann nicht
    // mehr zur tatsaechlichen Anzahl geschriebener Shots (Verlaufskurve
    // zeigte die letzten Shots zu dicht gedraengt statt gleichmaessig ueber
    // die Minutenfolge verteilt).
    type ShotBereit = {
      shi: number;
      profilId: string;
      setupId: string;
      ziel: ZielWerte;
      freitext: string | undefined;
    };
    const bereiteShots: ShotBereit[] = [];
    entwurf.shots.forEach((s: ShotEntwurf, shi: number) => {
      const muehle = erkenneMuehle(s.parameter['MG']);
      if (muehle === null) {
        offen.push({
          quelle: `${seite.titel} / ${s.gruppe || '(ohne Gruppe)'} Shot ${s.nummer}`,
          was: s.parameter['MG'] === undefined ? 'kein MG-Parameter' : `MG "${s.parameter['MG']}" nicht als Zahl lesbar`,
          warum: 'weder Sculptor noch K6 zuordenbar',
        });
        return;
      }

      const ziel = bauZielWerte(s.parameter);
      if ('fehlt' in ziel) {
        offen.push({
          quelle: `${seite.titel} / ${s.gruppe || '(ohne Gruppe)'} Shot ${s.nummer}`,
          was: `fehlende Parameter: ${ziel.fehlt.join(', ')}`,
          warum: 'ohne Dose/MG/Yield/Zeit gibt es keinen gueltigen Shot',
        });
        return;
      }

      const passendesProfil = profilIdVon.get(s.gruppe.toLowerCase());
      const profilId = passendesProfil ?? (migrierteProfilIds.length === 1 ? migrierteProfilIds[0] : undefined);
      if (!profilId) {
        offen.push({
          quelle: `${seite.titel} / ${s.gruppe || '(ohne Gruppe)'} Shot ${s.nummer}`,
          was: 'kein eindeutiges Profil zuordenbar',
          warum: 'Gruppe passt zu keiner migrierten Variante, und es gibt mehr als ein Profil',
        });
        return;
      }
      const setupId = muehle === 'sculptor' ? SETUP_ESPRESSO.id : SETUP_MOKA_1.id;
      const freitext = [s.aenderung, s.ergebnis].filter((t) => t && t !== '–').join(' · ') || undefined;

      bereiteShots.push({ shi, profilId, setupId, ziel, freitext });
    });

    // Synthetische, aufsteigende Zeitstempel — Notion hat keine echten
    // Datumsangaben je Shot gefuehrt (nur gelegentlich in Freitext). Sie
    // erhalten die Reihenfolge, sind aber KEINE echten Zeitpunkte. Erst hier,
    // ueber bereiteShots.length, damit die Spreizung zur tatsaechlichen
    // Anzahl passt.
    bereiteShots.forEach((s, laufindex) => {
      const ts = gezogenAmMs - (bereiteShots.length - 1 - laufindex) * EINE_MINUTE_MS;
      shots.push({
        id: `${kaffeeId}-shot-${s.shi}`,
        ts,
        kaffeeId,
        chargeId,
        profilId: s.profilId,
        setupId: s.setupId,
        ist: s.ziel,
        istHerkunft: {},
        portionen: 1,
        // Notion kennt keine Urteil-Stufen — bewusst neutral, nachtraeglich
        // in der Historie (Paket 05) korrigierbar.
        urteil: 'okay',
        befunde: [],
        freitext: s.freitext,
      });
    });
  }

  return {
    kaffees,
    chargen,
    profile,
    shots,
    gussplaene,
    bericht: { kaffees: kaffees.length, profile: profile.length, shots: shots.length, gussplaene: gussplaene.length, offen },
  };
}
