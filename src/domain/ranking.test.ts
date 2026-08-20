import { describe, it, expect } from 'vitest';
import {
  score,
  scoreFortschreiben,
  vorbelegung,
  begruendung,
  HALBWERTSZEIT_TAGE,
  FENSTER_POSITIONEN,
} from './ranking';

const TAG = 24 * 60 * 60 * 1000;
const JETZT = Date.UTC(2026, 7, 20);
const vorTagen = (n: number) => JETZT - n * TAG;

describe('Decay-Score', () => {
  it('nutzt 60 Tage Halbwertszeit', () => {
    expect(HALBWERTSZEIT_TAGE).toBe(60);
  });

  it('halbiert nach genau einer Halbwertszeit', () => {
    expect(score([vorTagen(60)], JETZT)).toBeCloseTo(0.5, 10);
  });

  it('zaehlt ein Log von jetzt voll', () => {
    expect(score([JETZT], JETZT)).toBeCloseTo(1, 10);
  });

  // Aus der Konzepttabelle: 10 Logs vor drei Monaten ergeben 3,54.
  it('ergibt 3,54 fuer 10 Logs vor 90 Tagen', () => {
    const logs = Array.from({ length: 10 }, () => vorTagen(90));
    expect(score(logs, JETZT)).toBeCloseTo(3.54, 2);
  });

  // Aus der Konzepttabelle: drei frische Logs liegen unter dieser Zeile ...
  it('haelt 10 alte Logs vor 3 frischen', () => {
    const alt = score(Array.from({ length: 10 }, () => vorTagen(90)), JETZT);
    const frisch = score([vorTagen(1), vorTagen(3), vorTagen(5)], JETZT);
    expect(frisch).toBeCloseTo(2.9, 1);
    expect(alt).toBeGreaterThan(frisch);
  });

  // ... und erst fuenf frische drehen es.
  it('laesst 5 frische Logs an 10 alten vorbeiziehen', () => {
    const alt = score(Array.from({ length: 10 }, () => vorTagen(90)), JETZT);
    const frisch = score([1, 2, 3, 4, 5].map(vorTagen), JETZT);
    expect(frisch).toBeGreaterThan(alt);
  });

  it('faellt bei 30 Tagen Halbwertszeit deutlich schneller', () => {
    const logs = Array.from({ length: 10 }, () => vorTagen(90));
    expect(score(logs, JETZT, 30)).toBeCloseTo(1.25, 2);
  });

  it('ist ohne Logs null', () => {
    expect(score([], JETZT)).toBe(0);
  });
});

describe('inkrementelle Fortschreibung', () => {
  it('liefert dieselbe Zahl wie der Neuaufbau aus der Historie', () => {
    const logs = [vorTagen(120), vorTagen(45), vorTagen(10), vorTagen(2)];

    let stand = 0;
    let standTs = logs[0]!;
    stand = 1; // erstes Log
    for (const ts of logs.slice(1)) {
      stand = scoreFortschreiben(stand, standTs, ts);
      standTs = ts;
    }
    // Auf den Betrachtungszeitpunkt abklingen lassen, ohne neues Log.
    const abgeklungen = stand * Math.pow(2, -((JETZT - standTs) / TAG) / HALBWERTSZEIT_TAGE);

    expect(abgeklungen).toBeCloseTo(score(logs, JETZT), 10);
  });
});

describe('Vorbelegung ueber die letzten 20 Positionen', () => {
  const von = (treffer: number, gesamt: number) =>
    Array.from({ length: gesamt }, (_, i) => i < treffer);

  it('nutzt ein Fenster von 20', () => {
    expect(FENSTER_POSITIONEN).toBe(20);
  });

  it('fragt mit Ja vorbelegt bei mindestens 60 Prozent', () => {
    const v = vorbelegung(von(12, 20));
    expect(v).toMatchObject({ frage: true, vorbelegt: true });
  });

  it('fragt ohne Vorbelegung zwischen 40 und 60 Prozent', () => {
    const v = vorbelegung(von(10, 20));
    expect(v).toMatchObject({ frage: true, vorbelegt: false });
  });

  it('fragt bei hoechstens 40 Prozent gar nicht', () => {
    expect(vorbelegung(von(8, 20)).frage).toBe(false);
    expect(vorbelegung(von(2, 20)).frage).toBe(false);
  });

  it('betrachtet nur die letzten 20, nicht die ganze Historie', () => {
    // 40 Positionen: die ersten 20 alle wahr, die letzten 20 alle falsch.
    const historie = [...von(20, 20), ...von(0, 20)];
    expect(vorbelegung(historie).frage).toBe(false);
  });

  it('fragt bei neuer Person, belegt aber nichts vor', () => {
    const v = vorbelegung([]);
    expect(v).toMatchObject({ frage: true, vorbelegt: false, von: 0 });
  });

  it('kommt mit weniger als 20 Positionen zurecht', () => {
    const v = vorbelegung(von(7, 8));
    expect(v).toMatchObject({ frage: true, vorbelegt: true, treffer: 7, von: 8 });
  });
});

describe('Begruendung', () => {
  it('nennt Treffer und Fenster, wie im Entwurf', () => {
    expect(begruendung(vorbelegung(Array.from({ length: 8 }, (_, i) => i < 7)))).toBe(
      '7 von 8 zuletzt',
    );
  });

  it('fehlt, wo gar nicht gefragt wird', () => {
    expect(begruendung(vorbelegung(Array.from({ length: 20 }, () => false)))).toBeNull();
  });

  it('fehlt ohne Historie', () => {
    expect(begruendung(vorbelegung([]))).toBeNull();
  });
});
