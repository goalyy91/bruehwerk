import { describe, it, expect } from 'vitest';
import {
  restGramm,
  durchschnittlicherInput,
  benoetigtProBezug,
  geschaetzteBezuege,
  altersTage,
  brauchtAufmerksamkeit,
  chargeAusgeschieden,
  naechsteAktiveCharge,
} from './vorrat';

const TAG_MS = 24 * 60 * 60 * 1000;

describe('restGramm', () => {
  it('zieht alle Shots der Charge von der Einwaage ab', () => {
    const charge = { einwaage: 250 };
    const shots = [
      { chargeId: 'c1', ts: 10, inputGramm: 18 },
      { chargeId: 'c1', ts: 20, inputGramm: 18 },
      { chargeId: 'andere-charge', ts: 15, inputGramm: 100 },
    ];
    expect(restGramm(charge, 'c1', shots)).toBe(214);
  });

  it('ohne Einwaage und ohne Korrektur gibt es keine Rechengrundlage', () => {
    expect(restGramm({}, 'c1', [])).toBeUndefined();
  });

  it('eine Korrektur ersetzt die Basis vollstaendig — nur Shots danach zaehlen', () => {
    const charge = { einwaage: 250, korrektur: { gramm: 80, ts: 100 } };
    const shots = [
      { chargeId: 'c1', ts: 50, inputGramm: 18 }, // vor der Korrektur, zaehlt nicht mehr
      { chargeId: 'c1', ts: 150, inputGramm: 18 }, // nach der Korrektur
    ];
    expect(restGramm(charge, 'c1', shots)).toBe(62);
  });
});

describe('durchschnittlicherInput', () => {
  it('mittelt die eigenen Shots der Charge', () => {
    const shots = [
      { chargeId: 'c1', ts: 1, inputGramm: 18 },
      { chargeId: 'c1', ts: 2, inputGramm: 20 },
    ];
    expect(durchschnittlicherInput(shots, 'c1')).toBe(19);
  });

  it('ohne eigene Shots zaehlt der Fallback', () => {
    expect(durchschnittlicherInput([], 'c1', 18)).toBe(18);
  });

  it('ohne eigene Shots und ohne Fallback gibt es keine Schaetzung', () => {
    expect(durchschnittlicherInput([], 'c1')).toBeUndefined();
  });
});

describe('benoetigtProBezug — Rückmeldung 2026-09-04, Portionsgröße als Referenz', () => {
  it('eigene Shots gewinnen immer, auch gegen eine hinterlegte Portionsgröße', () => {
    const charge = { eingefroren: true, portionsgroesse: 25 };
    const shots = [{ chargeId: 'c1', ts: 1, inputGramm: 18 }];
    expect(benoetigtProBezug(charge, 'c1', shots, 20)).toBe(18);
  });

  it('ohne eigene Shots zaehlt die Portionsgröße, wenn eingefroren', () => {
    const charge = { eingefroren: true, portionsgroesse: 25 };
    expect(benoetigtProBezug(charge, 'c1', [], 20)).toBe(25);
  });

  it('Portionsgröße zaehlt NICHT, wenn die Charge nicht eingefroren ist', () => {
    const charge = { eingefroren: false, portionsgroesse: 25 };
    expect(benoetigtProBezug(charge, 'c1', [], 20)).toBe(20);
  });

  it('ohne eigene Shots und ohne Portionsgröße zaehlt der Profil-Fallback', () => {
    const charge = { eingefroren: true };
    expect(benoetigtProBezug(charge, 'c1', [], 20)).toBe(20);
  });

  it('ganz ohne Grundlage bleibt es undefined', () => {
    const charge = { eingefroren: false };
    expect(benoetigtProBezug(charge, 'c1', [], undefined)).toBeUndefined();
  });
});

describe('geschaetzteBezuege', () => {
  it('rundet auf ganze Bezuege', () => {
    expect(geschaetzteBezuege(100, 18)).toBe(6); // 5.56 -> 6
  });

  it('ohne bekannten Input je Bezug keine Schaetzung', () => {
    expect(geschaetzteBezuege(100, undefined)).toBeUndefined();
  });
});

describe('altersTage', () => {
  it('rechnet die Differenz in ganzen Tagen', () => {
    const roestdatum = Date.UTC(2026, 0, 1);
    const jetzt = Date.UTC(2026, 0, 15);
    expect(altersTage(roestdatum, jetzt)).toBe(14);
  });
});

describe('brauchtAufmerksamkeit — Julians abgestimmte Vorgabewerte', () => {
  const schwellen = { knappBezuege: 2, frischWochen: 8, eingefrorenMonate: 8 };

  it('unter 2 Bezuegen ist "knapp"', () => {
    expect(brauchtAufmerksamkeit(1, 0, false, schwellen)).toBe('knapp');
  });

  it('2 Bezuege sind noch nicht knapp', () => {
    expect(brauchtAufmerksamkeit(2, 0, false, schwellen)).toBeUndefined();
  });

  it('frisch, ueber 8 Wochen alt, ist "alt"', () => {
    const achtWochenUndEinTag = 8 * 7 * TAG_MS + TAG_MS;
    expect(brauchtAufmerksamkeit(10, achtWochenUndEinTag / TAG_MS, false, schwellen)).toBe('alt');
  });

  it('frisch, genau 8 Wochen, noch nicht "alt"', () => {
    expect(brauchtAufmerksamkeit(10, 8 * 7, false, schwellen)).toBeUndefined();
  });

  it('eingefroren haelt sich laenger — 9 Wochen sind noch unauffaellig', () => {
    expect(brauchtAufmerksamkeit(10, 9 * 7, true, schwellen)).toBeUndefined();
  });

  it('eingefroren, ueber 8 Monate alt, ist "alt"', () => {
    expect(brauchtAufmerksamkeit(10, 8 * 30 + 1, true, schwellen)).toBe('alt');
  });

  it('"knapp" hat Vorrang vor "alt", wenn beides zutrifft', () => {
    expect(brauchtAufmerksamkeit(1, 8 * 30 + 1, true, schwellen)).toBe('knapp');
  });

  it('nichts von beidem trifft zu -> undefined', () => {
    expect(brauchtAufmerksamkeit(10, 5, false, schwellen)).toBeUndefined();
  });

  it('Schwellen werden wirklich durchgereicht, nicht fest verdrahtet', () => {
    const grosszuegig = { knappBezuege: 0, frischWochen: 999, eingefrorenMonate: 999 };
    expect(brauchtAufmerksamkeit(1, 8 * 30 + 1, true, grosszuegig)).toBeUndefined();
  });
});

describe('chargeAusgeschieden — FIFO-Chargenrotation (Rückmeldung 2026-09-04)', () => {
  it('leer schlaegt immer durch, egal wie viel rechnerisch noch da ist', () => {
    const charge = { id: 'c1', leer: true, roestdatum: 0, einwaage: 250 };
    expect(chargeAusgeschieden(charge, [], 18)).toBe(true);
  });

  it('reicht knapp nicht mehr fuer einen Bezug (Rest < Bedarf, aber > 0) -> ausgeschieden', () => {
    const charge = { id: 'c1', leer: false, roestdatum: 0, einwaage: 20 };
    const shots = [{ chargeId: 'c1', ts: 1, inputGramm: 5 }]; // Rest 15, Bedarf 18
    expect(chargeAusgeschieden(charge, shots, 18)).toBe(true);
  });

  it('reicht genau fuer einen weiteren Bezug -> nicht ausgeschieden', () => {
    const charge = { id: 'c1', leer: false, roestdatum: 0, einwaage: 20 };
    const shots = [{ chargeId: 'c1', ts: 1, inputGramm: 2 }]; // Rest genau 18
    expect(chargeAusgeschieden(charge, shots, 18)).toBe(false);
  });

  it('ohne bekannte Einwaage scheidet eine Charge rechnerisch nie aus (K64)', () => {
    const charge = { id: 'c1', leer: false, roestdatum: 0 };
    expect(chargeAusgeschieden(charge, [], 18)).toBe(false);
  });

  it('ohne bekannten Bedarf faellt die Schwelle auf "<= 0" zurueck', () => {
    const charge = { id: 'c1', leer: false, roestdatum: 0, einwaage: 5 };
    expect(chargeAusgeschieden(charge, [], undefined)).toBe(false);
    expect(chargeAusgeschieden({ ...charge, einwaage: 0 }, [], undefined)).toBe(true);
  });
});

describe('naechsteAktiveCharge — FIFO nach Röstdatum', () => {
  it('waehlt bei mehreren offenen Chargen die aelteste', () => {
    const alt = { id: 'alt', leer: false, roestdatum: 1, einwaage: 100 };
    const neu = { id: 'neu', leer: false, roestdatum: 2, einwaage: 100 };
    expect(naechsteAktiveCharge([neu, alt], [], () => 18)?.id).toBe('alt');
  });

  it('springt auf die naechstaeltere, wenn die aelteste ausgeschieden ist', () => {
    const alt = { id: 'alt', leer: true, roestdatum: 1, einwaage: 100 };
    const neu = { id: 'neu', leer: false, roestdatum: 2, einwaage: 100 };
    expect(naechsteAktiveCharge([alt, neu], [], () => 18)?.id).toBe('neu');
  });

  it('sind alle Chargen ausgeschieden, gibt es keinen Kandidaten', () => {
    const alt = { id: 'alt', leer: true, roestdatum: 1, einwaage: 100 };
    expect(naechsteAktiveCharge([alt], [], () => 18)).toBeUndefined();
  });

  it('genau das aus Julians Beispiel: neue Charge vorab angelegt, alte bleibt aktiv', () => {
    const alt = { id: 'alt', leer: false, roestdatum: 1, einwaage: 250 };
    const eingefroren = { id: 'eingefroren', leer: false, roestdatum: 30, einwaage: 250 };
    const shots = [{ chargeId: 'alt', ts: 10, inputGramm: 100 }]; // Rest 150, reicht noch
    expect(naechsteAktiveCharge([alt, eingefroren], shots, () => 18)?.id).toBe('alt');
  });
});
