/**
 * Die eigentliche Migration — nimmt SeedSeite[] entgegen und liefert
 * schreibfertige Datensaetze. `notion.ts` parst, `pruefung.ts` klassifiziert
 * und zaehlt; diese Datei ist der dritte, bisher fehlende Schritt: sie
 * setzt Setup-Bindung (Paket-03-Scope, siehe pruefung.ts-Kommentar) und
 * erzeugt Kaffee/Charge/Profil/Shot/Gussplan zum Schreiben.
 *
 * Grundregel, identisch zu pruefung.ts: **nicht eindeutig zuordenbar wird
 * uebersprungen und im Bericht genannt, nie geraten.** Diese Datei fuegt
 * dem Bericht aus pruefeSeiten() zusaetzliche offene Punkte hinzu, statt
 * ihn zu ersetzen.
 */
import { parseKaffeeSeite, type ProfilEntwurf, type ShotEntwurf, type GussBausteinEntwurf } from './notion';
import { pruefeSeiten, ersteZahl, erkenneDecaf, sterneOderZahl, type SeedSeite, type OffenerPunkt } from './pruefung';
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
  const bericht = pruefeSeiten(seiten);
  const offenZusaetzlich: OffenerPunkt[] = [];

  const kaffees: Kaffee[] = [];
  const chargen: Charge[] = [];
  const profile: Profil[] = [];
  const shots: Shot[] = [];
  const gussplaene: Gussplan[] = [];

  for (let si = 0; si < seiten.length; si++) {
    const seite = seiten[si]!;
    const kaffeeBefund = bericht.kaffees[si];
    if (!kaffeeBefund || !kaffeeBefund.roester) continue; // kein Roester -> schon in bericht.offen, kein gueltiger Kaffee schreibbar

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
    offenZusaetzlich.push({
      quelle: seite.titel,
      was: 'Charge ist ein Platzhalter',
      warum: 'Notion hat keine Chargen/Röstdaten strukturiert geführt — am Kaffeeblatt nachtragen',
    });

    kaffees.push({
      id: kaffeeId,
      name: seite.titel,
      roester: kaffeeBefund.roester,
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
      const befund = kaffeeBefund.profile[pi];
      if (!befund || befund.muehle === null) return; // schon in bericht.offen (Muehle nicht erkennbar)

      const ziel = bauZielWerte(p.parameter);
      if ('fehlt' in ziel) {
        offenZusaetzlich.push({
          quelle: `${seite.titel} / Variante "${p.varianteName}"`,
          was: `fehlende Parameter: ${ziel.fehlt.join(', ')}`,
          warum: 'ohne Dose/MG/Yield/Zeit gibt es keine gueltige Rezeptur',
        });
        return;
      }

      const setupId = befund.muehle === 'sculptor' ? SETUP_ESPRESSO.id : SETUP_MOKA_1.id;
      if (befund.muehle === 'k6') {
        offenZusaetzlich.push({
          quelle: `${seite.titel} / Variante "${p.varianteName}"`,
          was: 'Setup angenommen: Moka 1 Tasse',
          warum: 'MG-Bereich 60–70 ist eindeutig K6, aber nicht zwischen Moka 1er/3er unterscheidbar — am Profilblatt korrigierbar',
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
        offenZusaetzlich.push({
          quelle: seite.titel,
          was: `Gussplan mit ${entwurf.gussbausteine.length} Bausteinen ohne eindeutiges Profil`,
          warum: migrierteProfilIds.length === 0 ? 'kein Profil dieses Kaffees wurde migriert' : 'mehrere Profile — nicht eindeutig, welchem der Gussplan gehört',
        });
      }
    }

    // Shots — Zuordnung zum Profil ueber die Gruppen-Ueberschrift, sonst
    // (bei genau einem migrierten Profil) auf dieses. Sonst: melden, nicht raten.
    let letzterIndex = 0;
    const shotsDieserSeite = entwurf.shots.filter((_: ShotEntwurf, si2: number) => kaffeeBefund.shots[si2]?.muehle !== null);
    entwurf.shots.forEach((s: ShotEntwurf, shi: number) => {
      const befund = kaffeeBefund.shots[shi];
      if (!befund || befund.muehle === null) return; // schon in bericht.offen

      const ziel = bauZielWerte(s.parameter);
      if ('fehlt' in ziel) {
        offenZusaetzlich.push({
          quelle: `${seite.titel} / ${s.gruppe || '(ohne Gruppe)'} Shot ${s.nummer}`,
          was: `fehlende Parameter: ${ziel.fehlt.join(', ')}`,
          warum: 'ohne Dose/MG/Yield/Zeit gibt es keinen gueltigen Shot',
        });
        return;
      }

      const passendesProfil = profilIdVon.get(s.gruppe.toLowerCase());
      const profilId = passendesProfil ?? (migrierteProfilIds.length === 1 ? migrierteProfilIds[0] : undefined);
      if (!profilId) {
        offenZusaetzlich.push({
          quelle: `${seite.titel} / ${s.gruppe || '(ohne Gruppe)'} Shot ${s.nummer}`,
          was: 'kein eindeutiges Profil zuordenbar',
          warum: 'Gruppe passt zu keiner migrierten Variante, und es gibt mehr als ein Profil',
        });
        return;
      }
      const setupId = befund.muehle === 'sculptor' ? SETUP_ESPRESSO.id : SETUP_MOKA_1.id;

      // Synthetische, aufsteigende Zeitstempel — Notion hat keine echten
      // Datumsangaben je Shot gefuehrt (nur gelegentlich in Freitext). Sie
      // erhalten die Reihenfolge, sind aber KEINE echten Zeitpunkte.
      const ts = gezogenAmMs - (shotsDieserSeite.length - 1 - letzterIndex) * EINE_MINUTE_MS;
      letzterIndex++;

      const freitext = [s.aenderung, s.ergebnis].filter((t) => t && t !== '–').join(' · ') || undefined;

      shots.push({
        id: `${kaffeeId}-shot-${shi}`,
        ts,
        kaffeeId,
        chargeId,
        profilId,
        setupId,
        ist: ziel,
        istHerkunft: {},
        portionen: 1,
        // Notion kennt keine Urteil-Stufen — bewusst neutral, nachtraeglich
        // in der Historie (Paket 05) korrigierbar.
        urteil: 'okay',
        befunde: [],
        freitext,
      });
    });
  }

  return {
    kaffees,
    chargen,
    profile,
    shots,
    gussplaene,
    bericht: {
      kaffees: kaffees.length,
      profile: profile.length,
      shots: shots.length,
      gussplaene: gussplaene.length,
      offen: [...bericht.offen, ...offenZusaetzlich],
    },
  };
}
