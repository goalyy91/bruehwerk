import { describe, it, expect } from 'vitest';
import { werkstattbericht } from './bericht';

describe('werkstattbericht — konzept.md:486-488', () => {
  it('enthaelt Begriff, Haeufigkeit, Shot-Parameter und den Regelbestand', () => {
    const text = werkstattbericht({
      offeneBeobachtungen: [{ begriff: 'holzig', anzahl: 3, shotIds: ['s1'] }],
      shots: [{ id: 's1', kaffeeName: 'Espresso Entcoffeiniert', urteil: 'daneben', input: 18, mg: 3.7, output: 36, zeit: 28 }],
      chips: [{ label: 'sauer', quelle: 'system' }, { label: 'holzig', quelle: 'eigen' }],
      regeln: [{ chipLabel: 'holzig', parameter: 'kt', richtung: 'weniger', schritte: 2 }],
    });

    expect(text).toContain('holzig · 3×');
    expect(text).toContain('Espresso Entcoffeiniert');
    expect(text).toContain('MG 3.7');
    expect(text).toContain('daneben');
    expect(text).toContain('holzig (eigen)');
    expect(text).toContain('holzig -> kt, weniger, 2');
  });

  it('leere Listen brechen nicht, sondern nennen ihren Zustand', () => {
    const text = werkstattbericht({ offeneBeobachtungen: [], shots: [], chips: [], regeln: [] });
    expect(text).toContain('keine');
    expect(text).toContain('keiner');
  });
});
