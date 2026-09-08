import { describe, it, expect } from 'vitest';
import { bohnenSchnittmenge } from './getraenk';

describe('Bohnen-Schnittmenge — geeignetFuer x Koffein x aktiv (K45 K46)', () => {
  const KAFFEES = [
    { id: 'a', geeignetFuer: ['espresso'], entkoffeiniert: false, aktiv: true },
    { id: 'b', geeignetFuer: ['espresso', 'pourover'], entkoffeiniert: true, aktiv: true },
    { id: 'c', geeignetFuer: ['espresso'], entkoffeiniert: false, aktiv: false }, // inaktiv
    { id: 'd', geeignetFuer: ['pourover'], entkoffeiniert: false, aktiv: true }, // andere Zubereitung
  ];

  it('filtert nach Zubereitung, Koffein und aktiv', () => {
    expect(bohnenSchnittmenge(KAFFEES, 'espresso', 'normal').map((k) => k.id)).toEqual(['a']);
    expect(bohnenSchnittmenge(KAFFEES, 'espresso', 'entkoffeiniert').map((k) => k.id)).toEqual(['b']);
  });

  it('eine leere Schnittmenge ist ein gueltiges Ergebnis, kein Fehler', () => {
    expect(bohnenSchnittmenge(KAFFEES, 'moka', 'normal')).toEqual([]);
  });
});
