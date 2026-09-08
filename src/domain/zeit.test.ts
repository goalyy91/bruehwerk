import { describe, it, expect } from 'vitest';
import { alsMinutenSekunden, ausMinutenSekunden } from './zeit';

describe('alsMinutenSekunden', () => {
  it('rechnet Sekunden in m:ss um', () => {
    expect(alsMinutenSekunden(165)).toBe('2:45');
    expect(alsMinutenSekunden(60)).toBe('1:00');
    expect(alsMinutenSekunden(5)).toBe('0:05');
  });
  it('rundet und faengt ungueltige Eingaben ab', () => {
    expect(alsMinutenSekunden(165.6)).toBe('2:46');
    expect(alsMinutenSekunden(0)).toBe('0:00');
    expect(alsMinutenSekunden(-5)).toBe('0:00');
    expect(alsMinutenSekunden(NaN)).toBe('0:00');
  });
});

describe('ausMinutenSekunden', () => {
  it('liest m:ss', () => {
    expect(ausMinutenSekunden('2:45')).toBe(165);
    expect(ausMinutenSekunden('1:00')).toBe(60);
    expect(ausMinutenSekunden('0:05')).toBe(5);
  });
  it('liest reine Sekundenzahlen ohne Doppelpunkt', () => {
    expect(ausMinutenSekunden('185')).toBe(185);
    expect(ausMinutenSekunden('185,5')).toBe(185.5);
  });
  it('faengt ungueltige Eingaben ohne Exception ab', () => {
    expect(ausMinutenSekunden('')).toBe(0);
    expect(ausMinutenSekunden('abc')).toBe(0);
    expect(ausMinutenSekunden(':')).toBe(0);
    expect(ausMinutenSekunden('-1:00')).toBe(0);
  });
  it('ist die Umkehrung von alsMinutenSekunden', () => {
    for (const s of [0, 5, 45, 60, 165, 300, 725]) {
      expect(ausMinutenSekunden(alsMinutenSekunden(s))).toBe(s);
    }
  });
});
