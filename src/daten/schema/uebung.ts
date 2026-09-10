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
  })
  .transform((u) => ({
    id: u.id,
    setId: u.setId,
    aromaId: u.aromaId,
    benennen: u.benennen ?? { versuche: u.versuche ?? 0, treffer: u.treffer ?? 0 },
    unterscheiden: u.unterscheiden ?? { versuche: 0, treffer: 0 },
    verwechslungen: u.verwechslungen,
    letzterVersuch: u.letzterVersuch,
  }));
export type Uebung = z.infer<typeof Uebung>;
