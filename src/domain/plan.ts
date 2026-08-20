/**
 * Bezugsbuendelung und Verschnitt — K20, K21, K42, K59.
 *
 * Die Regel ist bewusst so knapp, dass der Planer nie fragen muss:
 * je zwei Halb-Bezug-Getraenke mit derselben Bohne und demselben Profil
 * ergeben einen Bezug, ein uebrig bleibendes ergibt ebenfalls einen —
 * mit Verschnitt. Drei Cappuccino sind zwei Bezuege und ein halber Shot
 * in den Ausguss. Das ist keine Panne, sondern die getroffene Entscheidung:
 * die App warnt nicht, sie rechnet mit.
 *
 * Ein Extra Shot macht aus einem halben Bezug einen ganzen. Er loest den
 * Verschnitt deshalb nur bei ungerader Anzahl auf — bei gerader erzeugt er
 * ihn sogar. Die App redet ihn niemandem ein.
 */

export type Bezugsanteil = 'ganz' | 'halb';

export interface Position {
  readonly id: string;
  readonly getraenkId: string;
  readonly kaffeeId: string;
  readonly profilId: string;
  readonly anteilBezug: Bezugsanteil;
  /** Heute nur 'extra-shot'. Bewusst Liste, damit spaeteres ein Datensatz ist. */
  readonly modifikatoren: readonly string[];
}

export interface Durchgang {
  /** Bohne und Profil sind je Durchgang identisch — das ist die Buendelungsregel. */
  readonly kaffeeId: string;
  readonly profilId: string;
  readonly positionIds: readonly string[];
  /** Anteil des Bezugs, der in kein Getraenk geht. 0 oder 0.5. */
  readonly ungenutzterAnteil: number;
}

export interface Bezugsplan {
  readonly durchgaenge: readonly Durchgang[];
  /** Ungenutzter Kaffee in Gramm, aus dem Input der beteiligten Profile. */
  readonly verschnittGramm: number;
}

/** Ein Extra Shot hebt eine halbe Position auf einen ganzen Bezug. */
export function effektiverAnteil(position: Position): Bezugsanteil {
  if (position.anteilBezug === 'ganz') return 'ganz';
  return position.modifikatoren.includes('extra-shot') ? 'ganz' : 'halb';
}

/**
 * Trenner fuer den Buendelungs-Schluessel.
 *
 * NUL, weil er in keiner Id vorkommen kann: mit einem gewoehnlichen Trenner
 * ergaeben ('a', 'b|c') und ('a|b', 'c') denselben Schluessel und wuerden
 * faelschlich in einen Durchgang gebuendelt — also zwei verschiedene Bohnen
 * in einem Bezug.
 *
 * Ueber fromCharCode statt als Zeichen im Quelltext: ein literales NUL waere
 * im Editor unsichtbar und liesse git die ganze Datei fuer binaer halten,
 * womit es zu ihr keine Diffs mehr gaebe.
 */
const TRENNER = String.fromCharCode(0);

function schluessel(p: Position): string {
  // Bohnenwechsel ist definitionsgemaess ein neuer Durchgang, deshalb steckt
  // die Bohne im Schluessel und die Frage "darf gebuendelt werden" entfaellt.
  return `${p.kaffeeId}${TRENNER}${p.profilId}`;
}

/**
 * Bildet Durchgaenge aus Positionen.
 *
 * @param inputProProfil Input in Gramm je Profil-Id — der Verschnitt eines
 *   halben Bezugs ist die Haelfte davon. Fehlt ein Profil, zaehlt sein
 *   Verschnitt als 0 statt geraten zu werden.
 */
export function planeBezuege(
  positionen: readonly Position[],
  inputProProfil: ReadonlyMap<string, number>,
): Bezugsplan {
  const gruppen = new Map<string, Position[]>();
  for (const p of positionen) {
    const k = schluessel(p);
    const vorhanden = gruppen.get(k);
    if (vorhanden) vorhanden.push(p);
    else gruppen.set(k, [p]);
  }

  const durchgaenge: Durchgang[] = [];
  let verschnittGramm = 0;

  for (const gruppe of gruppen.values()) {
    const erste = gruppe[0];
    if (!erste) continue;
    const { kaffeeId, profilId } = erste;
    const input = inputProProfil.get(profilId) ?? 0;

    const ganze = gruppe.filter((p) => effektiverAnteil(p) === 'ganz');
    const halbe = gruppe.filter((p) => effektiverAnteil(p) === 'halb');

    for (const p of ganze) {
      durchgaenge.push({ kaffeeId, profilId, positionIds: [p.id], ungenutzterAnteil: 0 });
    }

    for (let i = 0; i < halbe.length; i += 2) {
      const paar = halbe.slice(i, i + 2);
      const alleinstehend = paar.length === 1;
      durchgaenge.push({
        kaffeeId,
        profilId,
        positionIds: paar.map((p) => p.id),
        ungenutzterAnteil: alleinstehend ? 0.5 : 0,
      });
      if (alleinstehend) verschnittGramm += input / 2;
    }
  }

  return { durchgaenge, verschnittGramm: runde(verschnittGramm) };
}

/** Steht am Fuss des Plans, solange etwas zu holen ist — sonst gar nicht. */
export function verschnittAngebotSichtbar(plan: Bezugsplan): boolean {
  return plan.durchgaenge.some((d) => d.ungenutzterAnteil > 0);
}

function runde(g: number): number {
  return Math.round(g * 100) / 100;
}
