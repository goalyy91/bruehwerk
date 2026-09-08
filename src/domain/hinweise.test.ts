import { describe, it, expect } from 'vitest';
import {
  prioritaetsRang,
  sortiereUndDeckeln,
  restmengeUnbekannt,
  dialinOffen,
  kennzahlenPool,
  waehleKennzahlen,
  meistgenutzteKaffeeId,
  type Meldungskandidat,
} from './hinweise';

describe('prioritaetsRang', () => {
  it('ordnet die fuenf Arten wie in der Tabelle aus dem Plan', () => {
    expect(prioritaetsRang('knapp')).toBeLessThan(prioritaetsRang('alt'));
    expect(prioritaetsRang('alt')).toBeLessThan(prioritaetsRang('restUnbekannt'));
    expect(prioritaetsRang('restUnbekannt')).toBeLessThan(prioritaetsRang('dialinOffen'));
    expect(prioritaetsRang('dialinOffen')).toBeLessThan(prioritaetsRang('beobachtung'));
  });
});

interface Testkandidat extends Meldungskandidat {
  readonly name: string;
}

describe('sortiereUndDeckeln — Rueckmeldung 2026-09-06: 1-2 sichtbar, kein Scrollen', () => {
  it('zeigt alles, wenn weniger als das Limit da ist', () => {
    const kandidaten: Testkandidat[] = [{ art: 'beobachtung', name: 'B' }];
    const ergebnis = sortiereUndDeckeln(kandidaten, 2);
    expect(ergebnis.sichtbar).toEqual(kandidaten);
    expect(ergebnis.weitere).toBe(0);
  });

  it('deckelt auf 2 und zaehlt den Rest, ohne ihn zu benennen', () => {
    const kandidaten: Testkandidat[] = [
      { art: 'beobachtung', name: 'E' },
      { art: 'knapp', name: 'A' },
      { art: 'dialinOffen', name: 'D' },
      { art: 'alt', name: 'B' },
    ];
    const ergebnis = sortiereUndDeckeln(kandidaten, 2);
    expect(ergebnis.sichtbar.map((k) => k.name)).toEqual(['A', 'B']);
    expect(ergebnis.weitere).toBe(2);
  });

  it('deckelt auf 1, wenn kein Platz fuer zwei ist (S25-Vorgabe: notfalls nur eine)', () => {
    const kandidaten: Testkandidat[] = [
      { art: 'alt', name: 'B' },
      { art: 'knapp', name: 'A' },
    ];
    const ergebnis = sortiereUndDeckeln(kandidaten, 1);
    expect(ergebnis.sichtbar.map((k) => k.name)).toEqual(['A']);
    expect(ergebnis.weitere).toBe(1);
  });

  it('behaelt bei gleichem Rang die Aufrufreihenfolge (stabile Sortierung)', () => {
    const kandidaten: Testkandidat[] = [
      { art: 'knapp', name: 'zuerst' },
      { art: 'knapp', name: 'danach' },
    ];
    const ergebnis = sortiereUndDeckeln(kandidaten, 2);
    expect(ergebnis.sichtbar.map((k) => k.name)).toEqual(['zuerst', 'danach']);
  });

  it('leere Kandidatenliste ergibt leeres Ergebnis, keinen Fehler', () => {
    const ergebnis = sortiereUndDeckeln<Testkandidat>([], 2);
    expect(ergebnis.sichtbar).toEqual([]);
    expect(ergebnis.weitere).toBe(0);
  });
});

describe('restmengeUnbekannt', () => {
  it('true ohne Einwaage und ohne Korrektur', () => {
    expect(restmengeUnbekannt({})).toBe(true);
  });
  it('false mit Einwaage', () => {
    expect(restmengeUnbekannt({ einwaage: 250 })).toBe(false);
  });
  it('false mit Korrektur, auch ohne Einwaage', () => {
    expect(restmengeUnbekannt({ korrektur: { gramm: 80, ts: 1 } })).toBe(false);
  });
  it('false ohne aktuelle Charge (kein Kaffee zum Melden)', () => {
    expect(restmengeUnbekannt(undefined)).toBe(false);
  });
});

describe('dialinOffen', () => {
  it('true ab der Schwelle', () => {
    expect(dialinOffen({ modus: 'dialin' }, 5)).toBe(true);
  });
  it('false unterhalb der Schwelle', () => {
    expect(dialinOffen({ modus: 'dialin' }, 4)).toBe(false);
  });
  it('false wenn schon eingefahren, unabhaengig von der Shot-Anzahl', () => {
    expect(dialinOffen({ modus: 'eingefahren' }, 50)).toBe(false);
  });
});

const TAG = 24 * 60 * 60 * 1000;

describe('kennzahlenPool — nur mit ausreichender Datenbasis, nichts geraten (K64)', () => {
  it('leerer Bestand ergibt leeren Pool', () => {
    expect(kennzahlenPool([], [], Date.now())).toEqual([]);
  });

  it('ein einzelner Shot traegt nur die unbedingten Fakten (Monat/Woche), keine Anteile', () => {
    const jetzt = Date.now();
    const pool = kennzahlenPool(
      [{ ts: jetzt, kaffeeId: 'a', zubereitung: 'espresso' }],
      [{ id: 'a', name: 'Red Honey', aktiv: true, entkoffeiniert: false }],
      jetzt,
    );
    const labels = pool.map((k) => k.label);
    expect(labels).toContain('Bezüge diesen Monat');
    expect(labels).toContain('Bezüge diese Woche');
    expect(labels).toContain('Aktive Bohnen im Bestand');
    // Unter der Mindeststichprobe (3) — kein erzwungenes "100 %".
    expect(labels).not.toContain('Koffeinhaltig, letzte 30 Tage');
    expect(labels).not.toContain('Verschiedene Bohnen, letzte 90 Tage');
  });

  it('rechnet den Koffein-Anteil erst ab drei Shots in 30 Tagen', () => {
    const jetzt = Date.now();
    const kaffees = [
      { id: 'koffeinhaltig', name: 'Red Honey', aktiv: true, entkoffeiniert: false },
      { id: 'entkoffeiniert', name: 'Decaf', aktiv: true, entkoffeiniert: true },
    ];
    const shots = [
      { ts: jetzt - 1 * TAG, kaffeeId: 'koffeinhaltig' },
      { ts: jetzt - 2 * TAG, kaffeeId: 'koffeinhaltig' },
      { ts: jetzt - 3 * TAG, kaffeeId: 'entkoffeiniert' },
    ];
    const pool = kennzahlenPool(shots, kaffees, jetzt);
    const eintrag = pool.find((k) => k.label === 'Koffeinhaltig, letzte 30 Tage');
    expect(eintrag?.wert).toBe('67 %');
  });

  it('nennt "verschiedene Bohnen" erst ab zwei, eine allein waere irrefuehrend', () => {
    const jetzt = Date.now();
    const kaffees = [{ id: 'a', name: 'Red Honey', aktiv: true, entkoffeiniert: false }];
    const einBohne = kennzahlenPool(
      [{ ts: jetzt, kaffeeId: 'a' }],
      kaffees,
      jetzt,
    );
    expect(einBohne.some((k) => k.label === 'Verschiedene Bohnen, letzte 90 Tage')).toBe(false);

    const zweiBohnen = kennzahlenPool(
      [
        { ts: jetzt, kaffeeId: 'a' },
        { ts: jetzt, kaffeeId: 'b' },
      ],
      [...kaffees, { id: 'b', name: 'Manaresi', aktiv: true, entkoffeiniert: false }],
      jetzt,
    );
    const eintrag = zweiBohnen.find((k) => k.label === 'Verschiedene Bohnen, letzte 90 Tage');
    expect(eintrag?.wert).toBe('2');
  });

  it('meldet die meistgenutzte Bohne beim Namen, nicht bei der Id', () => {
    const jetzt = Date.now();
    const kaffees = [
      { id: 'a', name: 'Red Honey', aktiv: true, entkoffeiniert: false },
      { id: 'b', name: 'Manaresi', aktiv: true, entkoffeiniert: false },
    ];
    const shots = [
      { ts: jetzt, kaffeeId: 'a' },
      { ts: jetzt, kaffeeId: 'a' },
      { ts: jetzt, kaffeeId: 'b' },
    ];
    const pool = kennzahlenPool(shots, kaffees, jetzt);
    expect(pool.find((k) => k.label === 'Meistgenutzte Bohne, letzte 30 Tage')?.wert).toBe('Red Honey');
  });

  it('ignoriert Kaffees ohne Namen (geloescht/unbekannt) still statt mit "undefined"', () => {
    const jetzt = Date.now();
    const shots = [{ ts: jetzt, kaffeeId: 'a' }, { ts: jetzt, kaffeeId: 'a' }, { ts: jetzt, kaffeeId: 'a' }];
    const pool = kennzahlenPool(shots, [], jetzt);
    expect(pool.some((k) => k.label === 'Meistgenutzte Bohne, letzte 30 Tage')).toBe(false);
  });
});

describe('meistgenutzteKaffeeId — Ruhezustand der Meldungs-Zone', () => {
  it('findet die haeufigste Bohne im Fenster', () => {
    const jetzt = Date.now();
    const shots = [
      { ts: jetzt, kaffeeId: 'a' },
      { ts: jetzt, kaffeeId: 'a' },
      { ts: jetzt, kaffeeId: 'b' },
    ];
    expect(meistgenutzteKaffeeId(shots, 30, jetzt)).toBe('a');
  });

  it('ignoriert Shots ausserhalb des Fensters', () => {
    const jetzt = Date.now();
    const shots = [{ ts: jetzt - 40 * TAG, kaffeeId: 'a' }];
    expect(meistgenutzteKaffeeId(shots, 30, jetzt)).toBeUndefined();
  });

  it('undefined ohne jeden Shot', () => {
    expect(meistgenutzteKaffeeId([], 30, Date.now())).toBeUndefined();
  });
});

describe('waehleKennzahlen', () => {
  it('liefert hoechstens max Eintraege, nie mehr als der Pool hat', () => {
    const pool = [{ label: 'A', wert: '1' }];
    expect(waehleKennzahlen(pool, 2)).toHaveLength(1);
  });

  it('liefert leeres Ergebnis bei leerem Pool', () => {
    expect(waehleKennzahlen([], 2)).toEqual([]);
  });

  it('zieht ohne Zuruecklegen — zwei verschiedene Eintraege, nicht denselben doppelt', () => {
    const pool = [
      { label: 'A', wert: '1' },
      { label: 'B', wert: '2' },
    ];
    // Fester "Zufall": immer Index 0 -> muesste trotzdem beide Eintraege liefern,
    // weil der gezogene Eintrag aus dem Rest entfernt wird.
    const ergebnis = waehleKennzahlen(pool, 2, () => 0);
    expect(ergebnis.map((k) => k.label).sort()).toEqual(['A', 'B']);
  });

  it('ist mit injiziertem Zufall deterministisch', () => {
    const pool = [
      { label: 'A', wert: '1' },
      { label: 'B', wert: '2' },
      { label: 'C', wert: '3' },
    ];
    const ergebnis = waehleKennzahlen(pool, 2, () => 0.99);
    expect(ergebnis.map((k) => k.label)).toEqual(['C', 'B']);
  });
});
