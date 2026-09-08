import { describe, it, expect } from 'vitest';
import { vorschlag } from './vorschlag';

/**
 * Die Naht aus konzept.md:1078-1088. Heute liegt dahinter nur das
 * Regelwerk — dieser Test haelt fest, dass quelle immer 'regel' ist, solange
 * kein API-Aufbau existiert.
 */
describe('vorschlag() — die LLM-Naht, heute nur Regel-Seite', () => {
  it('liefert quelle "regel" und den Diagnosetext', () => {
    const v = vorschlag({ befunde: [{ symptomId: 'flach', staerke: 'deutlich' }] });
    expect(v?.quelle).toBe('regel');
    expect(v?.begruendung).toBe('Extraktion ok, Konzentration zu niedrig');
    expect(v?.text).toBe('Output −2 g oder Input +0,5 g');
  });

  it('liefert undefined ohne passende Regel', () => {
    expect(vorschlag({ befunde: [] })).toBeUndefined();
  });
});
