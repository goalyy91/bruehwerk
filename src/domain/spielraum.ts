/**
 * Spielraum — K6, K34, K56.
 *
 * Nicht jeder Unterschied zwischen Ziel und Ist ist eine Abweichung: zwei
 * Sekunden und vier Zehntel Gramm sind Streuung. Gemeldet wird erst
 * ausserhalb des Spielraums, und dann als Satz, nicht als Zahl.
 *
 * Input und Mahlgrad haben bewusst keinen Spielraum: die stellst du ein,
 * statt sie zu messen — dort ist jede Aenderung Absicht und nie ein Befund.
 */

/** Groessen, die gemessen werden und deshalb streuen duerfen. */
export type GemesseneGroesse = 'zeit' | 'output' | 'durchlaufzeit';

/** Groessen, die eingestellt werden. Jede Aenderung ist Absicht, kein Befund. */
export type EingestellteGroesse = 'input' | 'mg';

export type Spielraum = Record<GemesseneGroesse, number>;

/** Vorgabe aus dem Konzept. Je Groesse am Profil pflegbar. */
export const SPIELRAUM_VORGABE: Spielraum = {
  zeit: 2, // Sekunden
  output: 0.4, // Gramm
  durchlaufzeit: 5, // Sekunden
};

export const EINHEIT: Record<GemesseneGroesse, string> = {
  zeit: 's',
  output: 'g',
  durchlaufzeit: 's',
};

const BENENNUNG: Record<GemesseneGroesse, { zuViel: string; zuWenig: string }> = {
  zeit: { zuViel: 'lief laenger als geplant', zuWenig: 'lief schneller als geplant' },
  output: { zuViel: 'mehr in der Tasse als geplant', zuWenig: 'weniger in der Tasse als geplant' },
  durchlaufzeit: { zuViel: 'lief laenger durch als geplant', zuWenig: 'lief schneller durch als geplant' },
};

export type Befund =
  | { innerhalb: true }
  | { innerhalb: false; richtung: 'ueber' | 'unter'; satz: string };

/**
 * Prueft eine gemessene Groesse gegen ihr Ziel.
 *
 * Die Grenze gehoert zum Spielraum: bei Ziel 30 s und Spielraum 2 s ist 32 s
 * noch innerhalb, 32,1 s ist es nicht. Sonst haette der Spielraum an seinem
 * eigenen Rand keine Wirkung.
 */
export function pruefeSpielraum(
  groesse: GemesseneGroesse,
  ziel: number,
  ist: number,
  spielraum: Spielraum = SPIELRAUM_VORGABE,
): Befund {
  const toleranz = spielraum[groesse];
  const delta = ist - ziel;

  // Fliesskomma: 0.4 ist binaer nicht exakt, ein Vergleich auf blankes <=
  // wuerde bei Output 40,0 -> 40,4 zufaellig mal so und mal so ausfallen.
  const EPSILON = 1e-9;
  if (Math.abs(delta) <= toleranz + EPSILON) return { innerhalb: true };

  const richtung = delta > 0 ? 'ueber' : 'unter';
  const satz = delta > 0 ? BENENNUNG[groesse].zuViel : BENENNUNG[groesse].zuWenig;
  return { innerhalb: false, richtung, satz };
}

/**
 * Eingestellte Groessen erzeugen nie einen Befund — auch dann nicht, wenn Ist
 * und Ziel weit auseinanderliegen. Was mit einer Abweichung dort passiert,
 * entscheidet die Uebernahme-Frage im Alltagspfad, nicht diese Funktion.
 */
export function istEingestellt(groesse: string): groesse is EingestellteGroesse {
  return groesse === 'input' || groesse === 'mg';
}
