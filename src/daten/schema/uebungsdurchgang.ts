/**
 * Uebungsdurchgang — Aromapaket, Etappe 6 (Neubau nach Lastenheft,
 * docs/konzept.md "Übungsmodus"). Der laufende oder abgeschlossene
 * Durchgang: welche zwoelf Fläschchen verdeckt bereitliegen, welche acht
 * davon abgefragt werden und welche vier Zusatzfläschchen nie geöffnet
 * werden.
 *
 * Warum das ueberhaupt in der IndexedDB steht statt nur im Bildschirm-State:
 * die zwoelf sind irgendwann physisch bereitgelegt, bevor der erste Riff
 * gezogen wird (CLAUDE.md "Der Speicher wird angefordert, nicht
 * angenommen" gilt sinngemaess auch hier — ein Telefon, das waehrend der
 * 25-Sekunden-Riechpause den Bildschirm abschaltet, darf den Durchgang
 * nicht verlieren).
 *
 * `verdeckt` ist bewusst kein hartes 12er-Array — der Kontrastdurchgang
 * (Lastenheft, "Kontrastpaar") legt nur zwei Fläschchen verdeckt bereit, mit
 * `art: 'kontrast'`. `abgefragt` und `zusatz` sind disjunkte Teilmengen von
 * `verdeckt`; bei `art: 'kontrast'` ist `zusatz` leer, `abgefragt` beide.
 *
 * Reihenfolge, in der tatsaechlich gezogen wurde, steht in `beantwortet` —
 * nur diese Ids duerfen in `Uebungsantwort.aromaId` als "zu diesem Durchgang
 * gehoerig" erscheinen. Die nie gezogenen Zusatzfläschchen bleiben endgueltig
 * unaufgeloest (Lastenheft Abschnitt 2) und tauchen dort nie auf.
 */
import { z } from 'zod';
import { Id, Zeitpunkt } from './common';

export const DURCHGANG_ARTEN = ['normal', 'kontrast'] as const;
export type DurchgangArt = (typeof DURCHGANG_ARTEN)[number];

export const DURCHGANG_STATUS = ['bereitlegen', 'laufend', 'abgeschlossen'] as const;
export type DurchgangStatus = (typeof DURCHGANG_STATUS)[number];

export const Uebungsdurchgang = z.object({
  id: Id,
  setId: Id,
  art: z.enum(DURCHGANG_ARTEN).default('normal'),
  status: z.enum(DURCHGANG_STATUS).default('bereitlegen'),
  /** Alle verdeckt bereitgelegten Aroma-Ids — 12 bei "normal", 2 bei "kontrast". */
  verdeckt: z.array(Id),
  /** Teilmenge von `verdeckt`, die tatsächlich abgefragt wird (8 bzw. 2). */
  abgefragt: z.array(Id),
  /** Teilmenge von `verdeckt`, die nie geöffnet wird — leer bei "kontrast". */
  zusatz: z.array(Id).default([]),
  /** Teilmenge von `abgefragt`, in Ziehreihenfolge, die schon dran war. */
  beantwortet: z.array(Id).default([]),
  begonnenAm: Zeitpunkt,
  abgeschlossenAm: Zeitpunkt.optional(),
});
export type Uebungsdurchgang = z.infer<typeof Uebungsdurchgang>;
