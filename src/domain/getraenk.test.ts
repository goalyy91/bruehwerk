import { describe, it, expect } from 'vitest';
import { milchAusFuellmenge, fuellmengeAusMilch, extraShotErlaubt, bohnenSchnittmenge } from './getraenk';

describe('Fuellmenge ist die Konstante, nicht die Milchmenge (konzept.md:903-913)', () => {
  it('Cappuccino: 150 ml Fuellmenge, 20 g Shot -> 130 ml Milch normal', () => {
    expect(milchAusFuellmenge(150, 20)).toBe(130);
  });

  it('mit Extra Shot (40 g statt 20 g) sinkt die Milch auf 110 ml, die Fuellmenge bleibt', () => {
    expect(milchAusFuellmenge(150, 40)).toBe(110);
  });

  it('fuellmengeAusMilch ist die Umkehrung', () => {
    expect(fuellmengeAusMilch(130, 20)).toBe(150);
    expect(fuellmengeAusMilch(milchAusFuellmenge(150, 20), 20)).toBe(150);
  });
});

describe('Extra Shot verdraengt, addiert nicht — Mindestmenge (konzept.md:923)', () => {
  it('Espresso Macchiato: 30 ml Milch minus 20 ml Extra Shot unterschreitet die Mindestmenge 20 ml', () => {
    expect(extraShotErlaubt(30, 20)).toBe(false);
  });

  it('Cappuccino: 130 ml Milch minus 20 ml bleibt weit ueber der Mindestmenge', () => {
    expect(extraShotErlaubt(130, 20)).toBe(true);
  });

  it('an der Grenze ist es noch erlaubt (>=), nicht knapp darunter', () => {
    expect(extraShotErlaubt(40, 20)).toBe(true); // 40 - 20 = 20, genau die Grenze
    expect(extraShotErlaubt(39, 20)).toBe(false);
  });

  it('ohne Mindestmenge ist der Extra Shot immer erlaubt (Espresso/Doppio)', () => {
    expect(extraShotErlaubt(0, undefined)).toBe(true);
  });
});

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
