/**
 * Minuten:Sekunden — reine Anzeigeuebersetzung fuer den Fuehrungswert
 * "Durchlaufzeit" (K7). Gespeichert wird immer in Sekunden (Schema
 * unveraendert); nur Parameterkachel.svelte und IstGegenZiel.svelte lesen
 * hierueber, wenn ihr `mmss`-Schalter an ist.
 */

/** 165 -> "2:45". Negative/NaN-Eingaben ergeben "0:00", keine Exception. */
export function alsMinutenSekunden(sekundenGesamt: number): string {
  const s = Number.isFinite(sekundenGesamt) && sekundenGesamt > 0 ? Math.round(sekundenGesamt) : 0;
  const minuten = Math.floor(s / 60);
  const sekunden = s % 60;
  return `${minuten}:${String(sekunden).padStart(2, '0')}`;
}

/**
 * "2:45" -> 165. Nimmt auch reine Sekundenzahlen ohne Doppelpunkt an
 * ("185" -> 185) — man tippt beim Erfassen nicht immer im Format, das die
 * Anzeige waehlt.
 */
export function ausMinutenSekunden(text: string): number {
  const bereinigt = text.trim();
  if (!bereinigt.includes(':')) {
    const zahl = Number(bereinigt.replace(',', '.'));
    return Number.isFinite(zahl) && zahl > 0 ? zahl : 0;
  }
  const [minutenTeil, sekundenTeil] = bereinigt.split(':');
  const minuten = Number(minutenTeil);
  const sekunden = Number(sekundenTeil);
  if (!Number.isFinite(minuten) || !Number.isFinite(sekunden)) return 0;
  return Math.max(0, minuten * 60 + sekunden);
}
