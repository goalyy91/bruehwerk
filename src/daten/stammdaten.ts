/**
 * Der Geraetepark als Startbelegung — docs/konzept.md "Dein Geraetepark".
 *
 * Nur das, was das Konzept tatsaechlich beziffert. Keine Platzhalter, die
 * spaeter wie eine Messung aussehen (siehe CLAUDE.md "Offen — noch nicht
 * geliefert"): die Temperatur-Referenztabelle traegt deshalb nur die
 * Startbelegung Kessel-27K, nicht erfundene Zwischenwerte.
 *
 * Setups (Muehle+Bruehgeraet+Ablauf gebunden) entstehen erst in Paket 03 —
 * ein Ablauf mit Ruestzeiten ist hier noch nicht spezifiziert.
 */
import type { Muehle, Bruehgeraet, Zubehoer } from './schema';

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
