/**
 * Bestandsrechnung — Redesign v2, Etappe 2
 * (docs/design/offene-punkte-redesign.md, Abschnitt 21).
 *
 * Reine Rechnerei, kein idb, kein Svelte (tests/schichten.test.ts erzwingt
 * das). Wichtiger Fund beim Entwurf: `Shot.chargeId` ist Pflichtfeld und
 * `Shot.ist.input` der echte gemessene Input in Gramm — bei einem geteilten
 * Bezug wird trotzdem ein voller Bezug gezogen und geloggt (K18-K20), der
 * Verschnitt aus domain/plan.ts (reine Vorab-Planung einer Bestellung)
 * steckt also schon automatisch im gemessenen Input mit drin. Restrechnung
 * braucht deshalb keinen zweiten Verschnitt-Abzug — nur Σ Input je
 * `chargeId`.
 *
 * `korrektur` (auf der Charge, daten/schema/kaffee.ts) ist eine
 * Restatement-Korrektur, kein additives Delta: "ich hab nachgewogen, es
 * sind jetzt X Gramm" ersetzt die Rechenbasis vollstaendig — intuitiver
 * fuers manuelle Nachtragen als ein Plus/Minus-Betrag, und
 * selbstkorrigierend (jede neue Korrektur ersetzt die alte Basis).
 */

export interface ChargeVorrat {
  readonly einwaage?: number;
  readonly korrektur?: { readonly gramm: number; readonly ts: number };
}

export interface ShotVerbrauch {
  readonly chargeId: string;
  readonly ts: number;
  readonly inputGramm: number;
}

/**
 * Basis = Korrektur, falls vorhanden, sonst die urspruengliche Einwaage
 * (Zeitpunkt 0, damit ALLE Shots der Charge zaehlen). Fehlt beides, gibt es
 * keine Rechengrundlage — undefined statt eines geratenen Werts (K64).
 */
export function restGramm(charge: ChargeVorrat, chargeId: string, shots: readonly ShotVerbrauch[]): number | undefined {
  const basis = charge.korrektur ?? (charge.einwaage !== undefined ? { gramm: charge.einwaage, ts: 0 } : undefined);
  if (!basis) return undefined;
  const verbrauch = shots
    .filter((s) => s.chargeId === chargeId && s.ts > basis.ts)
    .reduce((summe, s) => summe + s.inputGramm, 0);
  return runde(basis.gramm - verbrauch);
}

/**
 * Durchschnittlicher Input je Bezug aus den eigenen Shots dieser Charge —
 * am genauesten, weil er den tatsaechlichen Verbrauch dieser Bohne/dieses
 * Profils widerspiegelt. Ohne eigene Shots (frisch angelegte Charge) zaehlt
 * der uebergebene Fallback (typischerweise ziel.input des Standardprofils).
 */
export function durchschnittlicherInput(
  shots: readonly ShotVerbrauch[],
  chargeId: string,
  fallback?: number,
): number | undefined {
  const eigene = shots.filter((s) => s.chargeId === chargeId);
  if (eigene.length === 0) return fallback;
  return eigene.reduce((summe, s) => summe + s.inputGramm, 0) / eigene.length;
}

/**
 * Referenzmenge fuer "reicht das noch fuer einen Bezug" — Rückmeldung
 * 2026-09-04. Prioritaet: (1) Durchschnitt der eigenen Shots dieser Charge
 * (echter Verbrauch, am genauesten). (2) Portionsgroesse, wenn die Charge
 * eingefroren ist UND eine Portionsgroesse hinterlegt ist — eine aufgetaute
 * Portion IST eine Verwendung, unabhaengig davon, ob schon ein Shot geloggt
 * wurde. (3) Profil-Zielwert als letzter Fallback.
 */
export function benoetigtProBezug(
  charge: { readonly eingefroren: boolean; readonly portionsgroesse?: number },
  chargeId: string,
  shots: readonly ShotVerbrauch[],
  profilInputFallback: number | undefined,
): number | undefined {
  const eigene = durchschnittlicherInput(shots, chargeId);
  if (eigene !== undefined) return eigene;
  if (charge.eingefroren && charge.portionsgroesse !== undefined) return charge.portionsgroesse;
  return profilInputFallback;
}

export function geschaetzteBezuege(restGrammWert: number, inputProBezug: number | undefined): number | undefined {
  if (inputProBezug === undefined || inputProBezug <= 0) return undefined;
  return Math.max(0, Math.round(restGrammWert / inputProBezug));
}

export function altersTage(roestdatum: number, jetzt: number): number {
  const TAG_MS = 24 * 60 * 60 * 1000;
  return Math.max(0, Math.round((jetzt - roestdatum) / TAG_MS));
}

export type Aufmerksamkeit = 'knapp' | 'alt';

export interface BestandSchwellen {
  readonly knappBezuege: number;
  readonly frischWochen: number;
  readonly eingefrorenMonate: number;
}

/**
 * "knapp" hat Vorrang vor "alt", wenn beides zutrifft — dringlicher (das
 * Gefaess ist leerer als es alt ist). Schwellen kommen als Parameter herein
 * (aus AppEinstellungen) statt als Konstante hier zu stehen — domain/ kennt
 * den Einstellungen-Typ nicht, nimmt nur die drei Zahlen entgegen.
 */
export function brauchtAufmerksamkeit(
  restBezuege: number | undefined,
  altersTageWert: number,
  eingefroren: boolean,
  schwellen: BestandSchwellen,
): Aufmerksamkeit | undefined {
  if (restBezuege !== undefined && restBezuege < schwellen.knappBezuege) return 'knapp';
  const schwelleTage = (eingefroren ? schwellen.eingefrorenMonate * 30 : schwellen.frischWochen * 7);
  if (altersTageWert > schwelleTage) return 'alt';
  return undefined;
}

function runde(g: number): number {
  return Math.round(g * 100) / 100;
}

/**
 * FIFO-Chargenrotation — Rückmeldung 2026-09-04. Erster Entwurf ging davon
 * aus, dass eine neue Charge die alte immer sofort abloest (so stand es
 * auch im alten Code-Kommentar bei Kaffee.aktuelleChargeId: "in der Praxis
 * nie zwei offene Chargen gleichzeitig"). Julian friert Kaffees
 * portionsweise vor und legt die neue Charge an, BEVOR die alte
 * aufgebraucht ist — die alte muss "aktuell" bleiben duerfen.
 */

export interface ChargeKandidat {
  readonly id: string;
  readonly leer: boolean;
  readonly roestdatum: number;
  readonly einwaage?: number;
  readonly korrektur?: { readonly gramm: number; readonly ts: number };
}

/**
 * Eine Charge scheidet aus, wenn sie manuell als leer markiert ist, ODER
 * wenn ihre Restmenge nicht mehr fuer einen weiteren Bezug reicht — nicht
 * erst bei genau 0. `benoetigtProBezug` fehlt (keine Referenzmenge
 * bekannt) -> Schwelle faellt auf "<= 0" zurueck. `restGramm` fehlt (keine
 * Einwaage bekannt) -> die Charge scheidet rechnerisch nie aus (K64, kein
 * Wert ohne Grundlage) — dafuer bleibt die manuelle Markierung der Ausweg.
 */
export function chargeAusgeschieden(
  charge: ChargeKandidat,
  shots: readonly ShotVerbrauch[],
  benoetigtProBezug: number | undefined,
): boolean {
  if (charge.leer) return true;
  const rest = restGramm(charge, charge.id, shots);
  if (rest === undefined) return false;
  return benoetigtProBezug === undefined ? rest <= 0 : rest < benoetigtProBezug;
}

/**
 * FIFO: die aelteste (Roestdatum, aufsteigend) Charge, die nicht
 * ausgeschieden ist. `benoetigtProBezugVon` wird je Charge aufgerufen, weil
 * die Referenzmenge (durchschnittlicherInput) je Charge unterschiedlich
 * ausfallen kann.
 */
export function naechsteAktiveCharge<C extends ChargeKandidat>(
  chargen: readonly C[],
  shots: readonly ShotVerbrauch[],
  benoetigtProBezugVon: (charge: C) => number | undefined,
): C | undefined {
  const offen = chargen.filter((c) => !chargeAusgeschieden(c, shots, benoetigtProBezugVon(c)));
  return [...offen].sort((a, b) => a.roestdatum - b.roestdatum)[0];
}
