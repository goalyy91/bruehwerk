/**
 * Uebungsmodus — Paket 05, konzept.md:810-812. Trefferstatistik je Aroma
 * eines Sets: die App zieht bevorzugt, was zuletzt nicht getroffen wurde
 * (domain/uebung.ts::naechstesAroma), und diese Sammlung traegt dafuer den
 * Zustand.
 *
 * Ein Datensatz je (setId, aromaId) statt einer Zaehlliste am Aromaset
 * selbst — Uebungsergebnisse sind Nutzungsdaten, kein Teil des Aromaset-
 * Bestands, und sollen beim Ersetzen eines Platzhalter-Sets (siehe
 * daten/aromen.ts) einzeln loeschbar sein, ohne das Set selbst anzufassen.
 *
 * Aromapaket, Etappe 3: zwei Aufgabenarten (domain/uebung.ts, Etappe 4)
 * statt einer, deshalb ein eigener Zaehler je Art statt eines gemeinsamen
 * Paars — "1 aus 60" (benennen) und "1 aus 2" (unterscheiden) haben nicht
 * dieselbe Ratewahrscheinlichkeit. Ein gemeinsamer Zaehler wuerde
 * Fortschritt behaupten, der nur Zufall ist. Dazu die Verwechslungsliste:
 * welches Aroma wurde bei "benennen" stattdessen getippt, wie oft — der
 * Rohstoff fuer die gezielte Auswahl in domain/uebung.ts.
 *
 * Eine dritte Art ("aussenseiter") ist nach dem ersten Livetest wieder raus
 * (domain/uebung.ts, Kopfkommentar: bei Le Nez sind die Nummern strikt nach
 * Kategorie sortiert, der Aussenseiter war am Zahlenabstand erkennbar, ganz
 * ohne zu riechen). Ein alter Datensatz mit einem "aussenseiter"-Feld wird
 * beim Einlesen einfach stillschweigend fallengelassen (zod streift
 * unbekannte Felder) — das waren ohnehin nur ein paar Testrunden.
 *
 * Rueckwaertskompatibel: ein Datensatz von vor dieser Erweiterung hatte
 * genau ein Zaehlerpaar (versuche/treffer) fuer die einzige Aufgabenart, die
 * es gab. `.transform()` liest das als "benennen" ein (siehe uebung.test.ts)
 * — kein Fortschritt geht verloren, nur die Form aendert sich, und ab dem
 * naechsten Schreiben steht er auch so in der Ablage.
 *
 * Aromapaket, Etappe 6 (Neubau nach Lastenheft, docs/konzept.md
 * "Übungsmodus"): vier neue, rein strukturelle Felder fuer Leitner-Boxen und
 * Lernstufen — `box`, `faellig`, `stufe`, `familienSerie`. Bewusst *keine*
 * Geschaeftslogik in diesem Transform: welche Startbox ein Altbestand ohne
 * `box` bekommt, haengt von der bereinigten Trefferquote ab
 * (domain/uebung.ts::gesamtquote) und ist damit eine Rechnung, keine
 * Feldumbenennung — genau die Grenze, die tests/schichten.test.ts zieht
 * (`daten/` speichert, `domain/` rechnet). Diese Rechnung lebt deshalb in
 * `domain/leitner.ts::startBox` und wird von der aufrufenden Schicht
 * angewendet, sobald `box` fehlt — nicht hier. Ob ein Aroma "eingefuehrt"
 * ist, braucht dagegen kein eigenes Feld: `versuche(benennen) +
 * versuche(unterscheiden) > 0` beantwortet das bereits eindeutig.
 */
import { z } from 'zod';
import { Id, Zeitpunkt } from './common';

export const UEBUNGSARTEN = ['benennen', 'unterscheiden'] as const;
export type Uebungsart = (typeof UEBUNGSARTEN)[number];

const ArtStand = z.object({
  versuche: z.number().int().nonnegative().default(0),
  treffer: z.number().int().nonnegative().default(0),
});
export type ArtStand = z.infer<typeof ArtStand>;

/** Die drei Lernstufen aus dem Lastenheft — A: Familie, B: Aroma in der Familie, C: freier Abruf. */
export const UEBUNG_STUFEN = ['a', 'b', 'c'] as const;
export type UebungStufe = (typeof UEBUNG_STUFEN)[number];

/** Leitner-Boxnummer — dieselbe Bedeutung wie domain/leitner.ts::Box, hier ohne Import (daten/ speichert, domain/ rechnet). */
export type UebungBox = 1 | 2 | 3 | 4 | 5;

export const Uebung = z
  .object({
    id: Id,
    setId: Id,
    aromaId: Id,
    // Altfelder (vor Etappe 3) — bleiben lesbar, wandern unten nach
    // "benennen", werden aber nicht mehr neu geschrieben.
    versuche: z.number().int().nonnegative().optional(),
    treffer: z.number().int().nonnegative().optional(),
    benennen: ArtStand.optional(),
    unterscheiden: ArtStand.optional(),
    /** Id des stattdessen getippten Aromas -> wie oft. Nur bei "benennen" sinnvoll — bei
     * "unterscheiden" ist die falsche Antwort ohnehin eine der vorgegebenen. */
    verwechslungen: z.record(z.string(), z.number().int().positive()).default({}),
    letzterVersuch: Zeitpunkt.optional(),
    // Aromapaket, Etappe 6 — siehe Dateikopf. Alle optional/undefined bei
    // einem Altbestand: `box`/`stufe` fehlend heisst "noch nicht migriert",
    // nicht "Box 1"/"Stufe A" — die aufrufende Schicht unterscheidet das.
    box: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).optional(),
    faellig: Zeitpunkt.optional(),
    stufe: z.enum(UEBUNG_STUFEN).optional(),
    /** Zaehler "wie oft in Folge die Familie richtig" — ab 3 schaltet Stufe A auf B (nur Lesart, die Bewegung selbst macht domain/uebung.ts). */
    familienSerie: z.number().int().nonnegative().default(0),
  })
  .transform(
    (
      u,
    ): {
      id: string;
      setId: string;
      aromaId: string;
      benennen: ArtStand;
      unterscheiden: ArtStand;
      verwechslungen: Record<string, number>;
      letzterVersuch?: number;
      // Als optionale Eigenschaften annotiert, nicht als Pflichtfeld mit
      // `| undefined`-Wert — sonst verlangte TypeScript beim Schreiben eines
      // neuen Datensatzes (vor Etappe 3, noch ohne Box/Stufe) diese Schluessel
      // trotzdem explizit, nur mit dem Wert `undefined`.
      box?: UebungBox;
      faellig?: number;
      stufe?: UebungStufe;
      familienSerie: number;
    } => ({
      id: u.id,
      setId: u.setId,
      aromaId: u.aromaId,
      benennen: u.benennen ?? { versuche: u.versuche ?? 0, treffer: u.treffer ?? 0 },
      unterscheiden: u.unterscheiden ?? { versuche: 0, treffer: 0 },
      verwechslungen: u.verwechslungen,
      letzterVersuch: u.letzterVersuch,
      box: u.box,
      faellig: u.faellig,
      stufe: u.stufe,
      familienSerie: u.familienSerie,
    }),
  );
export type Uebung = z.infer<typeof Uebung>;
