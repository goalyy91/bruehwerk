import { describe, it, expect } from 'vitest';
import { Kaffee, Bruehgeraet, Muehle, Shot, Profil, Gussplan, GussBaustein } from './index';
import { MUEHLE_K6, BRUEHGERAET_MOZZAFIATO, BRUEHGERAET_BIALETTI_1 } from '../stammdaten';

const KAFFEE_BASIS = {
  id: 'k1',
  name: 'Testkaffee',
  roester: 'Testroester',
  aktiv: true,
  art: 'single' as const,
  entkoffeiniert: false,
};

describe('Kaffee — Grenzfaelle', () => {
  it('Roestgrad 0 faellt durch', () => {
    expect(Kaffee.safeParse({ ...KAFFEE_BASIS, roestgrad: 0 }).success).toBe(false);
  });

  it('Roestgrad 6 faellt durch', () => {
    expect(Kaffee.safeParse({ ...KAFFEE_BASIS, roestgrad: 6 }).success).toBe(false);
  });

  it('Roestgrad 1 und 5 sind gueltig', () => {
    expect(Kaffee.safeParse({ ...KAFFEE_BASIS, roestgrad: 1 }).success).toBe(true);
    expect(Kaffee.safeParse({ ...KAFFEE_BASIS, roestgrad: 5 }).success).toBe(true);
  });

  it('Ohne roestgrad/aufbereitung/botanik ist ein Kaffee trotzdem gueltig — die Notion-Migration liefert sie nicht', () => {
    expect(Kaffee.safeParse(KAFFEE_BASIS).success).toBe(true);
  });

  it('botanik muss auf 100 summieren', () => {
    expect(Kaffee.safeParse({ ...KAFFEE_BASIS, botanik: { arabicaProzent: 70, robustaProzent: 40 } }).success).toBe(false);
    expect(Kaffee.safeParse({ ...KAFFEE_BASIS, botanik: { arabicaProzent: 70, robustaProzent: 30 } }).success).toBe(true);
  });

  it('ein altes status-Feld (offen/angebrochen/leer) laesst sich weiterhin lesen — es faellt dabei weg (UX-2)', () => {
    const ergebnis = Kaffee.safeParse({ ...KAFFEE_BASIS, status: 'angebrochen' });
    expect(ergebnis.success).toBe(true);
    if (ergebnis.success) expect(ergebnis.data).not.toHaveProperty('status');
  });
});

describe('Bruehgeraet — K7 (Moka fuehrt nichts)', () => {
  it('Moka mit fuehrungswert schlaegt fehl', () => {
    const kaputt = { ...BRUEHGERAET_BIALETTI_1, fuehrungswert: 'output' as const };
    expect(Bruehgeraet.safeParse(kaputt).success).toBe(false);
  });

  it('Moka mit fuehrungswert null ist gueltig (Stammdaten)', () => {
    expect(Bruehgeraet.safeParse(BRUEHGERAET_BIALETTI_1).success).toBe(true);
  });

  it('Espresso mit fuehrungswert ist gueltig (Stammdaten)', () => {
    expect(Bruehgeraet.safeParse(BRUEHGERAET_MOZZAFIATO).success).toBe(true);
  });
});

describe('Muehle — rpmBereich nur mit rpmEinstellbar', () => {
  it('rpmBereich ohne rpmEinstellbar schlaegt fehl', () => {
    const kaputt = { ...MUEHLE_K6, rpmBereich: { min: 0, max: 100, schritt: 1 } };
    expect(Muehle.safeParse(kaputt).success).toBe(false);
  });

  it('K6 aus den Stammdaten ist gueltig', () => {
    expect(Muehle.safeParse(MUEHLE_K6).success).toBe(true);
  });
});

describe('Shot und Profil — Grundform', () => {
  const ZIEL = { input: 18, mg: 65, output: 36, zeit: 25 };

  it('ein minimaler, gueltiger Shot laesst sich parsen', () => {
    const shot = {
      id: 's1',
      ts: Date.now(),
      kaffeeId: 'k1',
      chargeId: 'c1',
      profilId: 'p1',
      setupId: 'su1',
      ist: ZIEL,
      istHerkunft: {},
      portionen: 1,
      urteil: 'okay',
    };
    expect(Shot.safeParse(shot).success).toBe(true);
  });

  it('portionen ausserhalb {1,2} schlaegt fehl', () => {
    const shot = {
      id: 's1',
      ts: Date.now(),
      kaffeeId: 'k1',
      chargeId: 'c1',
      profilId: 'p1',
      setupId: 'su1',
      ist: ZIEL,
      istHerkunft: {},
      portionen: 3,
      urteil: 'okay',
    };
    expect(Shot.safeParse(shot).success).toBe(false);
  });

  it('ein minimales, gueltiges Profil laesst sich parsen', () => {
    const profil = {
      id: 'p1',
      kaffeeId: 'k1',
      setupId: 'su1',
      name: 'Espresso',
      standard: true,
      ziel: ZIEL,
      spielraum: { zeit: 2, output: 0.4, durchlaufzeit: 5 },
      modus: 'dialin',
    };
    expect(Profil.safeParse(profil).success).toBe(true);
  });
});

describe('GussBaustein — sechs typisierte Bausteine plus Altbestand', () => {
  it('jeder Konzept-Baustein ist gueltig', () => {
    const bausteine: unknown[] = [
      { typ: 'vorbereiten', filterSpuelen: true, gefaessVorwaermen: false },
      { typ: 'bloom', menge: 50, dauer: 30 },
      { typ: 'guss', zielmenge: 150, dauer: 30, muster: 'spirale' },
      { typ: 'agitation', art: 'rao-spin' },
      { typ: 'warten', modus: 'bis-durchgelaufen' },
      { typ: 'bypass', menge: 20, temperatur: 90 },
    ];
    for (const b of bausteine) expect(GussBaustein.safeParse(b).success).toBe(true);
  });

  it('die alte generische Form (Notion-Migration) bleibt gueltig', () => {
    const alt = { typ: 'frei', menge: 50, dauer: 30, rolle: 'Bloom', text: 'gleichmaessig durchfeuchten' };
    expect(GussBaustein.safeParse(alt).success).toBe(true);
  });

  it('ein unbekannter typ faellt durch', () => {
    expect(GussBaustein.safeParse({ typ: 'unbekannt', menge: 1 }).success).toBe(false);
  });

  it('guss ohne Muster ist gueltig — Muster ist optional', () => {
    expect(GussBaustein.safeParse({ typ: 'guss', zielmenge: 300 }).success).toBe(true);
  });

  it('ein Gussplan mit gemischten Bausteintypen ist gueltig', () => {
    const plan = {
      id: 'g1',
      name: 'V60 Standard',
      gesamtwasser: 300,
      lesart: 'kumulativ',
      bausteine: [
        { typ: 'bloom', menge: 50, dauer: 30 },
        { typ: 'guss', zielmenge: 300, muster: 'zentrum' },
        { typ: 'frei', menge: 0, rolle: 'Warten', text: 'bis durchgelaufen' },
      ],
    };
    expect(Gussplan.safeParse(plan).success).toBe(true);
  });
});
