/**
 * Begrüßung auf dem Bar-Screen — Paket 07 (docs/konzept.md:1181).
 *
 * Sechs Tageszeit-Fenster, je zwei Formulierungen im Pool, damit sich der
 * Satz nicht abnutzt. Ein Kontext-Override (offene Bestellung), sonst
 * keiner — ein "seit X Tagen nichts geloggt"-Satz wurde bewusst verworfen:
 * er löst keine Handlung aus, nur ein Streak-Schuldgefühl, und widerspricht
 * damit im Ton der eigenen "keine Gamification"-Regel.
 *
 * Wichtige Grenze, die hier NICHT gilt: die Koffein-Vorbelegung
 * (domain/ranking.ts::vorbelegung) darf nicht von der Tageszeit abhängen
 * ("würde die Historie halbieren") — das betrifft eine andere Funktion und
 * bleibt davon unberührt. Diese Begrüßung ist reiner Text, kein Datenwert.
 */

export type Tageszeit = 'frueh' | 'vormittag' | 'mittag' | 'nachmittag' | 'abend' | 'nacht';

const FENSTER: { key: Tageszeit; label: string; abAb: number }[] = [
  { key: 'frueh', label: 'Früh', abAb: 5 },
  { key: 'vormittag', label: 'Vormittag', abAb: 9 },
  { key: 'mittag', label: 'Mittag', abAb: 11 },
  { key: 'nachmittag', label: 'Nachmittag', abAb: 14 },
  { key: 'abend', label: 'Abend', abAb: 17 },
  { key: 'nacht', label: 'Nacht', abAb: 21 },
];

const SAETZE: Record<Tageszeit, [string, string]> = {
  frueh: ['Der erste Espresso des Tages wartet.', 'Früh dran — der Kessel braucht noch einen Moment.'],
  vormittag: ['Guten Morgen — bereit für den ersten Bezug?', 'Ein guter Moment für den ersten Kaffee.'],
  mittag: ['Mittagspause, der Kessel ist warm.', 'Zeit für eine kurze Kaffeepause.'],
  nachmittag: ['Der Nachmittag hat noch Platz für einen Cappuccino.', 'Ein Nachmittagskaffee hat sich verdient.'],
  abend: ['Ein Espresso zum Tagesausklang?', 'Der Abend hat noch Platz für einen Kaffee.'],
  nacht: ['Spät dran — entkoffeiniert wäre auch okay.', 'Noch wach? Ein Kaffee wartet.'],
};

export function tageszeitVon(stunde: number): { key: Tageszeit; label: string } {
  // Fenster ueberlappen die Mitternacht (nacht: 21–5) — deshalb rueckwaerts
  // suchen und bei keinem Treffer auf das letzte Fenster (nacht) zurueckfallen.
  let treffer = FENSTER[0]!;
  for (const fenster of FENSTER) {
    if (stunde >= fenster.abAb) treffer = fenster;
  }
  if (stunde < FENSTER[0]!.abAb) treffer = FENSTER[FENSTER.length - 1]!;
  return { key: treffer.key, label: treffer.label };
}

export function begruessung(
  jetzt: Date,
  kontext: { offeneBestellung: boolean },
  zufall: () => number = Math.random,
): { label?: string; satz: string } {
  if (kontext.offeneBestellung) {
    return { satz: 'Die Bestellung von vorhin wartet noch.' };
  }
  const { key, label } = tageszeitVon(jetzt.getHours());
  const [a, b] = SAETZE[key];
  const satz = zufall() < 0.5 ? a : b;
  return { label, satz };
}
