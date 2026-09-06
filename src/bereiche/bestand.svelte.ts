/**
 * Der reaktive Bestand — Bindeglied zwischen daten/ablage.ts (IndexedDB als
 * Wahrheit) und den Bildschirmen. Lebt bewusst in bereiche/, nicht in
 * daten/: daten/ darf kein Svelte importieren, das erzwingt
 * tests/schichten.test.ts.
 *
 * Schreiben ist sofort und offline (siehe CLAUDE.md "Datenquelle") — ein
 * schreiben() aktualisiert den Speicher direkt aus dem Rueckgabewert von
 * ablage.schreiben(), es folgt kein Neuladen der ganzen Sammlung.
 */
import { alle, schreiben as ablageSchreiben, loeschen as ablageLoeschen, type SammlungWert } from '../daten/ablage';
import { seedFallsLeer } from '../daten/seed';
import type { Sammlung } from '../daten/db';
import { chargeAusgeschieden, naechsteAktiveCharge, benoetigtProBezug } from '../domain/vorrat';

class Bestand {
  kaffees = $state<SammlungWert['kaffee'][]>([]);
  chargen = $state<SammlungWert['charge'][]>([]);
  profile = $state<SammlungWert['profil'][]>([]);
  gusslpaene = $state<SammlungWert['gussplan'][]>([]);
  shots = $state<SammlungWert['shot'][]>([]);
  symptome = $state<SammlungWert['symptom'][]>([]);
  tastings = $state<SammlungWert['tasting'][]>([]);
  aromasets = $state<SammlungWert['aromaset'][]>([]);
  uebungen = $state<SammlungWert['uebung'][]>([]);
  beobachtungen = $state<SammlungWert['beobachtung'][]>([]);
  getraenke = $state<SammlungWert['getraenk'][]>([]);
  personen = $state<SammlungWert['person'][]>([]);
  ansaetze = $state<SammlungWert['ansatz'][]>([]);
  muehlen = $state<SammlungWert['muehle'][]>([]);
  bruehgeraete = $state<SammlungWert['bruehgeraet'][]>([]);
  zubehoer = $state<SammlungWert['zubehoer'][]>([]);
  setups = $state<SammlungWert['setup'][]>([]);
  ablaeufe = $state<SammlungWert['ablauf'][]>([]);
  durchgaenge = $state<SammlungWert['durchgang'][]>([]);
  positionen = $state<SammlungWert['position'][]>([]);
  bestellungen = $state<SammlungWert['bestellung'][]>([]);
  /** Singleton, keine Liste — daher eigenes Feld statt eines Arrays. */
  einstellungen = $state<SammlungWert['einstellungen'] | undefined>(undefined);

  geladen = $state(false);
  ladeFehler = $state<Error | undefined>(undefined);

  async laden(): Promise<void> {
    this.ladeFehler = undefined;
    try {
      // Beim allerersten Start ist die DB leer — dann traegt seedFallsLeer
      // den Geraetepark aus stammdaten.ts ein, bevor gelesen wird.
      await seedFallsLeer();
      const [
        kaffees,
        chargen,
        profile,
        gusslpaene,
        shots,
        symptome,
        tastings,
        aromasets,
        uebungen,
        beobachtungen,
        muehlen,
        bruehgeraete,
        zubehoer,
        setups,
        ablaeufe,
        einstellungen,
        getraenke,
        personen,
        ansaetze,
        durchgaenge,
        positionen,
        bestellungen,
      ] = await Promise.all([
        alle('kaffee'),
        alle('charge'),
        alle('profil'),
        alle('gussplan'),
        alle('shot'),
        alle('symptom'),
        alle('tasting'),
        alle('aromaset'),
        alle('uebung'),
        alle('beobachtung'),
        alle('muehle'),
        alle('bruehgeraet'),
        alle('zubehoer'),
        alle('setup'),
        alle('ablauf'),
        alle('einstellungen'),
        alle('getraenk'),
        alle('person'),
        alle('ansatz'),
        alle('durchgang'),
        alle('position'),
        alle('bestellung'),
      ]);
      this.kaffees = kaffees;
      this.chargen = chargen;
      this.profile = profile;
      this.gusslpaene = gusslpaene;
      this.shots = shots;
      this.symptome = symptome;
      this.tastings = tastings;
      this.aromasets = aromasets;
      this.uebungen = uebungen;
      this.beobachtungen = beobachtungen;
      this.muehlen = muehlen;
      this.bruehgeraete = bruehgeraete;
      this.zubehoer = zubehoer;
      this.setups = setups;
      this.ablaeufe = ablaeufe;
      this.getraenke = getraenke;
      this.personen = personen;
      this.ansaetze = ansaetze;
      this.durchgaenge = durchgaenge;
      this.positionen = positionen;
      this.bestellungen = bestellungen;
      this.einstellungen = einstellungen[0];
      this.geladen = true;
    } catch (fehler) {
      this.ladeFehler = fehler instanceof Error ? fehler : new Error(String(fehler));
    }
  }

  chargenVon(kaffeeId: string): SammlungWert['charge'][] {
    return this.chargen.filter((c) => c.kaffeeId === kaffeeId);
  }

  profileVon(kaffeeId: string): SammlungWert['profil'][] {
    return this.profile.filter((p) => p.kaffeeId === kaffeeId);
  }

  bruehgeraetVon(setupId: string): SammlungWert['bruehgeraet'] | undefined {
    const setup = this.setups.find((s) => s.id === setupId);
    return setup ? this.bruehgeraete.find((b) => b.id === setup.bruehgeraetId) : undefined;
  }

  muehleVon(setupId: string): SammlungWert['muehle'] | undefined {
    const setup = this.setups.find((s) => s.id === setupId);
    return setup ? this.muehlen.find((m) => m.id === setup.muehleId) : undefined;
  }

  tastingVon(shotId: string): SammlungWert['tasting'] | undefined {
    return this.tastings.find((t) => t.shotId === shotId);
  }

  ablaufVon(ablaufId: string): SammlungWert['ablauf'] | undefined {
    return this.ablaeufe.find((a) => a.id === ablaufId);
  }

  /** Es gibt hoechstens eine offene Bestellung gleichzeitig (Paket 06, Etappe E). */
  offeneBestellung(): SammlungWert['bestellung'] | undefined {
    return this.bestellungen.find((b) => b.status === 'offen');
  }

  /**
   * Das Profil, das ein Kaffee fuer eine Zubereitungsart einsetzt — bevorzugt
   * das Standardprofil, sonst das erste passende. `zubereitung` nutzt
   * dieselben Woerter wie Bruehgeraet.typ (siehe daten/stammdaten-getraenke.ts).
   */
  profilFuerZubereitung(kaffeeId: string, zubereitung: string): SammlungWert['profil'] | undefined {
    const passende = this.profileVon(kaffeeId).filter((p) => this.bruehgeraetVon(p.setupId)?.typ === zubereitung);
    return passende.find((p) => p.standard) ?? passende[0];
  }
}

export const bestand = new Bestand();

/** Schreibt einen Datensatz und haelt den Speicher synchron — wirft SchreibFehler weiter (K66). */
export async function schreiben<S extends Sammlung>(sammlung: S, wert: SammlungWert[S]): Promise<void> {
  await ablageSchreiben(sammlung, wert);
  if (sammlung === 'einstellungen') {
    bestand.einstellungen = wert as SammlungWert['einstellungen'];
    return;
  }
  const liste = listeFuer(sammlung);
  if (!liste) return;
  const index = liste.findIndex((eintrag) => (eintrag as { id: string }).id === (wert as { id: string }).id);
  if (index === -1) liste.push(wert as never);
  else liste[index] = wert as never;
}

/**
 * FIFO-Chargenrotation (Redesign v2, Rückmeldung 2026-09-04) — bestimmt neu,
 * welche Charge eines Kaffees "aktuell" sein sollte, und schreibt
 * `kaffee.aktuelleChargeId` nur, wenn sich das wirklich geaendert hat. Lebt
 * hier statt in domain/vorrat.ts, weil sie schreibt (domain/ kennt kein idb).
 *
 * Aufrufen nach jeder Handlung, die eine Charge zum Ausscheiden bringen
 * kann: ein neu geloggter Shot, eine Bestand-Korrektur, eine neue Charge
 * (falls die alte schon vorher ausgeschieden war), "als leer markieren".
 *
 * `benoetigtFallback` ist die Referenzmenge fuer "reicht das noch fuer
 * einen Bezug" (typischerweise `profil.ziel.input`) — greift nur, wenn eine
 * Charge noch keine eigenen Shots hat (siehe durchschnittlicherInput).
 */
export async function chargeStatusAktualisieren(kaffeeId: string, benoetigtFallback?: number): Promise<void> {
  const kaffee = bestand.kaffees.find((k) => k.id === kaffeeId);
  if (!kaffee) return;

  const shotsVerbrauch = bestand.shots.map((s) => ({ chargeId: s.chargeId, ts: s.ts, inputGramm: s.ist.input }));
  const benoetigtVon = (charge: SammlungWert['charge']) =>
    benoetigtProBezug(charge, charge.id, shotsVerbrauch, benoetigtFallback);

  // Die hinterlegte aktuelle Charge, die rechnerisch nicht mehr fuer einen
  // Bezug reicht, zusaetzlich als leer schreiben — einheitliche Anzeige mit
  // manuell geleerten Chargen ("faellt aus der View raus").
  const bisherige = bestand.chargen.find((c) => c.id === kaffee.aktuelleChargeId);
  if (bisherige && !bisherige.leer && chargeAusgeschieden(bisherige, shotsVerbrauch, benoetigtVon(bisherige))) {
    await schreiben('charge', { ...bisherige, leer: true });
  }

  const chargenDesKaffees = bestand.chargenVon(kaffeeId);
  const naechste = naechsteAktiveCharge(chargenDesKaffees, shotsVerbrauch, benoetigtVon);
  if (naechste?.id !== kaffee.aktuelleChargeId) {
    await schreiben('kaffee', { ...kaffee, aktuelleChargeId: naechste?.id });
  }
}

/** Loescht einen Datensatz und haelt den Speicher synchron. Kein Kaskadenloeschen — wer abhaengige Datensaetze schuetzen will, prueft vorher selbst (siehe Geraete.svelte). */
export async function loeschen(sammlung: Sammlung, id: string): Promise<void> {
  await ablageLoeschen(sammlung, id);
  const liste = listeFuer(sammlung);
  if (!liste) return;
  const index = liste.findIndex((eintrag) => (eintrag as { id: string }).id === id);
  if (index !== -1) liste.splice(index, 1);
}

function listeFuer(sammlung: Sammlung): unknown[] | undefined {
  switch (sammlung) {
    case 'kaffee':
      return bestand.kaffees;
    case 'charge':
      return bestand.chargen;
    case 'profil':
      return bestand.profile;
    case 'gussplan':
      return bestand.gusslpaene;
    case 'shot':
      return bestand.shots;
    case 'symptom':
      return bestand.symptome;
    case 'tasting':
      return bestand.tastings;
    case 'aromaset':
      return bestand.aromasets;
    case 'uebung':
      return bestand.uebungen;
    case 'beobachtung':
      return bestand.beobachtungen;
    case 'getraenk':
      return bestand.getraenke;
    case 'person':
      return bestand.personen;
    case 'ansatz':
      return bestand.ansaetze;
    case 'durchgang':
      return bestand.durchgaenge;
    case 'position':
      return bestand.positionen;
    case 'bestellung':
      return bestand.bestellungen;
    case 'ablauf':
      return bestand.ablaeufe;
    case 'muehle':
      return bestand.muehlen;
    case 'bruehgeraet':
      return bestand.bruehgeraete;
    case 'zubehoer':
      return bestand.zubehoer;
    case 'setup':
      return bestand.setups;
    default:
      return undefined;
  }
}
