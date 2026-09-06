import { describe, it, expect } from 'vitest';
import { begruessung, tageszeitVon } from './begruessung';

describe('Tageszeit-Fenster', () => {
  it('ordnet jede Grenzstunde ihrem Fenster zu', () => {
    expect(tageszeitVon(5).key).toBe('frueh');
    expect(tageszeitVon(8).key).toBe('frueh');
    expect(tageszeitVon(9).key).toBe('vormittag');
    expect(tageszeitVon(10).key).toBe('vormittag');
    expect(tageszeitVon(11).key).toBe('mittag');
    expect(tageszeitVon(13).key).toBe('mittag');
    expect(tageszeitVon(14).key).toBe('nachmittag');
    expect(tageszeitVon(16).key).toBe('nachmittag');
    expect(tageszeitVon(17).key).toBe('abend');
    expect(tageszeitVon(20).key).toBe('abend');
    expect(tageszeitVon(21).key).toBe('nacht');
    expect(tageszeitVon(23).key).toBe('nacht');
  });

  it('rechnet die Nacht ueber Mitternacht hinweg (0–4 Uhr gehoert noch dazu)', () => {
    expect(tageszeitVon(0).key).toBe('nacht');
    expect(tageszeitVon(4).key).toBe('nacht');
  });
});

describe('Begrüßung', () => {
  it('nennt ein Tageszeit-Label und einen Satz aus dem Pool', () => {
    const jetzt = new Date(2026, 7, 30, 15, 0);
    const ergebnis = begruessung(jetzt, { offeneBestellung: false }, () => 0);
    expect(ergebnis.label).toBe('Nachmittag');
    expect(ergebnis.satz).toBe('Der Nachmittag hat noch Platz für einen Cappuccino.');
  });

  it('waehlt den zweiten Satz des Fensters, wenn der Zufall darueber liegt', () => {
    const jetzt = new Date(2026, 7, 30, 15, 0);
    const ergebnis = begruessung(jetzt, { offeneBestellung: false }, () => 0.9);
    expect(ergebnis.satz).toBe('Ein Nachmittagskaffee hat sich verdient.');
  });

  it('eine offene Bestellung sticht die Tageszeit und traegt kein Label', () => {
    const jetzt = new Date(2026, 7, 30, 15, 0);
    const ergebnis = begruessung(jetzt, { offeneBestellung: true }, () => 0);
    expect(ergebnis.label).toBeUndefined();
    expect(ergebnis.satz).toBe('Die Bestellung von vorhin wartet noch.');
  });
});
