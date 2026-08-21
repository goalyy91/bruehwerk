/**
 * Der Geraetepark als Startbelegung — docs/konzept.md "Dein Geraetepark".
 *
 * Nur das, was das Konzept tatsaechlich beziffert. Keine Platzhalter, die
 * spaeter wie eine Messung aussehen (siehe CLAUDE.md "Offen — noch nicht
 * geliefert"): die Temperatur-Referenztabelle traegt deshalb nur die
 * Startbelegung Kessel-27K, nicht erfundene Zwischenwerte.
 *
 * Setups (Muehle+Bruehgeraet+Ablauf gebunden) stehen ab Paket 03 — der
 * Ablauf dahinter ist bewusst leer (K48), die echten Ruestzeiten-Buendel
 * spezifiziert erst der Planer in Paket 06.
 */
import type { Muehle, Bruehgeraet, Zubehoer, Ablauf, Setup } from './schema';

export const MUEHLE_SCULPTOR: Muehle = {
  id: 'muehle-sculptor',
  name: 'Timemore Sculptor 076S',
  // Nur der Espresso-Bereich ist im Konzept beziffert. Der Pour-Over-Bereich
  // ist offen und wird nachgetragen, sobald er feststeht.
  skala: { typ: 'numerisch', min: 3.6, max: 4.0, schritt: 0.05 },
  rpmEinstellbar: true,
};

export const MUEHLE_K6: Muehle = {
  id: 'muehle-k6',
  name: 'KINGrinder K6',
  skala: { typ: 'klicks', min: 10, max: 240, schritt: 1 },
  rpmEinstellbar: false,
};

export const BRUEHGERAET_MOZZAFIATO: Bruehgeraet = {
  id: 'bruehgeraet-mozzafiato',
  name: 'Rocket Mozzafiato R',
  typ: 'espresso',
  gruppen: 1,
  dampflanze: true,
  ktEinstellbar: true,
  sieb: { art: 'doppel', portionen: 2 },
  fuehrungswert: 'output',
  mengen: [1, 2],
  flushDauer: 3,
  // Startbelegung Kessel - 27K, Herkunft geschaetzt (Waermetauscher-
  // Gattungsregel, keine Messung an dieser Maschine). Deckt den genutzten
  // KT-Bereich 119-121 ab; die echte Messreihe ersetzt das spaeter.
  tempReferenz: [
    { kt: 119, flush: 3, gruppe: 92, herkunft: 'geschaetzt' },
    { kt: 120, flush: 3, gruppe: 93, herkunft: 'geschaetzt' },
    { kt: 121, flush: 3, gruppe: 94, herkunft: 'geschaetzt' },
  ],
};

export const BRUEHGERAET_BIALETTI_1: Bruehgeraet = {
  id: 'bruehgeraet-bialetti-1',
  name: 'Bialetti 1 Tasse',
  typ: 'moka',
  gruppen: 1,
  dampflanze: false,
  ktEinstellbar: false,
  fuehrungswert: null, // K7 — beim Moka gibt es nichts zu fuehren
  mengen: [1],
  tempReferenz: [],
};

export const BRUEHGERAET_BIALETTI_3: Bruehgeraet = {
  id: 'bruehgeraet-bialetti-3',
  name: 'Bialetti 3 Tassen',
  typ: 'moka',
  gruppen: 1,
  dampflanze: false,
  ktEinstellbar: false,
  fuehrungswert: null, // K7
  mengen: [3],
  tempReferenz: [],
};

export const BRUEHGERAET_HARIO_V60: Bruehgeraet = {
  id: 'bruehgeraet-hario-v60',
  name: 'Hario V60 02',
  typ: 'pourover',
  gruppen: 1,
  dampflanze: false,
  ktEinstellbar: false, // Temperatur kommt von der Schwanenhalskanne, nicht vom Geraet selbst
  fuehrungswert: 'durchlaufzeit',
  mengen: [1, 2], // K8 — Pour Over bis 2
  tempReferenz: [],
};

export const ZUBEHOER_KAENNCHEN_350: Zubehoer = {
  id: 'zubehoer-kaennchen-350',
  name: 'Milchkaennchen 350 ml',
  art: 'milchkanne',
  volumen: 350,
  fuellfaktor: 0.6, // 210 ml nutzbar — eine Cappuccino-Portion
};

export const ZUBEHOER_KAENNCHEN_500: Zubehoer = {
  id: 'zubehoer-kaennchen-500',
  name: 'Milchkaennchen 500 ml',
  art: 'milchkanne',
  volumen: 500,
  fuellfaktor: 0.6, // 300 ml nutzbar — das einzige Kaennchen fuer zwei Cappuccino-Portionen
};

export const ZUBEHOER_SCHWANENHALS: Zubehoer = {
  id: 'zubehoer-schwanenhals',
  name: 'Schwanenhalskanne 700 ml',
  art: 'wasserkocher',
  volumen: 700,
  temperaturEinstellbar: true,
};

export const MUEHLEN: readonly Muehle[] = [MUEHLE_SCULPTOR, MUEHLE_K6];

export const BRUEHGERAETE: readonly Bruehgeraet[] = [
  BRUEHGERAET_MOZZAFIATO,
  BRUEHGERAET_BIALETTI_1,
  BRUEHGERAET_BIALETTI_3,
  BRUEHGERAET_HARIO_V60,
];

export const ZUBEHOER: readonly Zubehoer[] = [
  ZUBEHOER_KAENNCHEN_350,
  ZUBEHOER_KAENNCHEN_500,
  ZUBEHOER_SCHWANENHALS,
];

/**
 * K48 — Ablauf ist reines Rechenmodell (Ressourcen, Ruestzeiten,
 * Buendel) und erscheint nirgends in der Oberflaeche. Die echten
 * Ruestzeiten-Buendel sind erst mit dem Planer (Paket 06) spezifiziert;
 * bis dahin traegt jedes Setup einen leeren Ablauf, damit die
 * Pflichtbindung Setup.ablaufId nie unerfuellt bleibt.
 */
export const ABLAUF_LEER: Ablauf = {
  id: 'ablauf-leer',
  schritte: [],
  buendel: [],
};

/**
 * Vier Setups aus "Dein Geraetepark": jedes Profil haengt an einem Setup,
 * damit ein Mahlgrad nie ohne Muehle gelesen wird (Befund 2). Sculptor und
 * K6 stehen fuer Pour Over gleichberechtigt nebeneinander — beide Muehlen
 * sind fuer den Hario V60 vorgesehen, ihre Mahlgrade sind nicht
 * ineinander umrechenbar.
 */
export const SETUP_ESPRESSO: Setup = {
  id: 'setup-espresso',
  name: 'Espresso · Sculptor · Mozzafiato',
  muehleId: MUEHLE_SCULPTOR.id,
  bruehgeraetId: BRUEHGERAET_MOZZAFIATO.id,
  zubehoerIds: [ZUBEHOER_KAENNCHEN_350.id, ZUBEHOER_KAENNCHEN_500.id],
  ablaufId: ABLAUF_LEER.id,
};

export const SETUP_POUR_OVER_SCULPTOR: Setup = {
  id: 'setup-pourover-sculptor',
  name: 'Pour Over · Sculptor · V60',
  muehleId: MUEHLE_SCULPTOR.id,
  bruehgeraetId: BRUEHGERAET_HARIO_V60.id,
  zubehoerIds: [ZUBEHOER_SCHWANENHALS.id],
  ablaufId: ABLAUF_LEER.id,
};

export const SETUP_POUR_OVER_K6: Setup = {
  id: 'setup-pourover-k6',
  name: 'Pour Over · K6 · V60',
  muehleId: MUEHLE_K6.id,
  bruehgeraetId: BRUEHGERAET_HARIO_V60.id,
  zubehoerIds: [ZUBEHOER_SCHWANENHALS.id],
  ablaufId: ABLAUF_LEER.id,
};

export const SETUP_MOKA_1: Setup = {
  id: 'setup-moka-1',
  name: 'Moka · K6 · Bialetti 1 Tasse',
  muehleId: MUEHLE_K6.id,
  bruehgeraetId: BRUEHGERAET_BIALETTI_1.id,
  zubehoerIds: [],
  ablaufId: ABLAUF_LEER.id,
};

export const SETUP_MOKA_3: Setup = {
  id: 'setup-moka-3',
  name: 'Moka · K6 · Bialetti 3 Tassen',
  muehleId: MUEHLE_K6.id,
  bruehgeraetId: BRUEHGERAET_BIALETTI_3.id,
  zubehoerIds: [],
  ablaufId: ABLAUF_LEER.id,
};

export const SETUPS: readonly Setup[] = [
  SETUP_ESPRESSO,
  SETUP_POUR_OVER_SCULPTOR,
  SETUP_POUR_OVER_K6,
  SETUP_MOKA_1,
  SETUP_MOKA_3,
];
