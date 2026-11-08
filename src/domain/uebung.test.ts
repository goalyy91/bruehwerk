import { describe, it, expect } from 'vitest';
import {
  bereinigteQuote,
  gesamtquote,
  effektiverZustand,
  verdeckteGesamtgroesse,
  planeDurchgang,
  DURCHGANG_GROESSE,
  werteAntwortAus,
  verwechslungspaare,
  werteKontrastAus,
  kontrastpaare,
  waehleDurchgangsart,
  kontrastNachriechenAngebracht,
  KONTRAST_PAARE_MAX,
  KONTRASTDURCHGANG_SCHWELLE,
  reverseVorschlag,
  nachriechenAngebracht,
  RIECHGRENZE,
  type AromaOption,
  type GesamtStand,
  type TrefferStand,
} from './uebung';

const LEER: TrefferStand = { versuche: 0, treffer: 0 };
const STAND = (ueber: Partial<GesamtStand> = {}): GesamtStand => ({
  benennen: LEER,
  unterscheiden: LEER,
  verwechslungen: {},
  ...ueber,
});

const TAG = 24 * 60 * 60 * 1000;
const JETZT = 1_700_000_000_000;

describe('bereinigteQuote — um die Ratewahrscheinlichkeit bereinigt', () => {
  it('ohne Versuche 0', () => {
    expect(bereinigteQuote(LEER, 'benennen')).toBe(0);
  });

  it('reines Raten bei "unterscheiden" (1 aus 2) zaehlt als 0, nicht als 0,5', () => {
    expect(bereinigteQuote({ versuche: 10, treffer: 5 }, 'unterscheiden')).toBeCloseTo(0);
  });

  it('perfekte Quote bleibt 1, unabhaengig von der Ratewahrscheinlichkeit', () => {
    expect(bereinigteQuote({ versuche: 10, treffer: 10 }, 'unterscheiden')).toBeCloseTo(1);
    expect(bereinigteQuote({ versuche: 10, treffer: 10 }, 'benennen')).toBeCloseTo(1);
  });

  it('unter dem Zufallsniveau faellt nicht ins Minus', () => {
    expect(bereinigteQuote({ versuche: 10, treffer: 2 }, 'unterscheiden')).toBe(0);
  });

  it('"benennen" (1 aus 60) korrigiert kaum, "unterscheiden" (1 aus 2) stark', () => {
    const stand: TrefferStand = { versuche: 10, treffer: 8 };
    expect(bereinigteQuote(stand, 'benennen')).toBeGreaterThan(bereinigteQuote(stand, 'unterscheiden'));
  });
});

describe('gesamtquote — gewichtet nach Versuchen je Art', () => {
  it('ohne jeden Versuch 0', () => {
    expect(gesamtquote(STAND())).toBe(0);
  });

  it('eine Art mit mehr Versuchen zaehlt staerker', () => {
    const stand = STAND({
      benennen: { versuche: 20, treffer: 20 }, // bereinigt ~1
      unterscheiden: { versuche: 2, treffer: 1 }, // bereinigt 0
    });
    expect(gesamtquote(stand)).toBeGreaterThan(0.8);
  });
});

// ============================================================================
// Aromapaket, Etappe 6 — Zusammenstellung eines Übungsdurchgangs
// ============================================================================

const TEXT_ID = (praefix: string, n: number) => `${praefix}${n}`;

/** Baut n AromaOption mit fortlaufenden Ids `praefix1..praefixn`. */
function aromen(praefix: string, n: number): AromaOption[] {
  return Array.from({ length: n }, (_, i) => ({ id: TEXT_ID(praefix, i + 1), label: TEXT_ID(praefix, i + 1) }));
}

describe('verdeckteGesamtgroesse — Beutelgroesse ≈ Rundengroesse × 1,5, mindestens +3', () => {
  it('bei 8 Abgefragten: 12', () => {
    expect(verdeckteGesamtgroesse(8)).toBe(12);
    expect(verdeckteGesamtgroesse()).toBe(12); // Default DURCHGANG_GROESSE
  });

  it('bei kleiner Rundengroesse greift die Mindestens-+3-Regel statt der ×1,5', () => {
    expect(verdeckteGesamtgroesse(4)).toBe(7); // round(4*1.5)=6 < 4+3=7
  });
});

describe('effektiverZustand — Altbestand ohne box/stufe migriert, sonst unveraendert', () => {
  it('nie geuebt: Box 1, Stufe A, nicht eingefuehrt, sofort faellig', () => {
    const z = effektiverZustand(undefined, JETZT);
    expect(z).toEqual({ box: 1, faellig: JETZT, stufe: 'a', eingefuehrt: false, zaeh: false });
  });

  it('Altbestand mit hoher bereinigter Quote, aber ohne box: wird eingefuehrt und auf Box 4 migriert', () => {
    const alt = STAND({ benennen: { versuche: 20, treffer: 20 } });
    const z = effektiverZustand(alt, JETZT);
    expect(z.eingefuehrt).toBe(true);
    expect(z.box).toBe(4);
  });

  it('ein bereits migrierter Stand behaelt seine Box unveraendert, auch bei niedriger Quote', () => {
    const migriert = STAND({ benennen: { versuche: 20, treffer: 1 }, box: 5 });
    expect(effektiverZustand(migriert, JETZT).box).toBe(5);
  });

  it('gesetzte Faelligkeit und Stufe bleiben erhalten', () => {
    const stand = STAND({ benennen: { versuche: 1, treffer: 1 }, faellig: JETZT + 5 * TAG, stufe: 'c' });
    const z = effektiverZustand(stand, JETZT);
    expect(z.faellig).toBe(JETZT + 5 * TAG);
    expect(z.stufe).toBe('c');
  });
});

describe('planeDurchgang — Groesse und Trennung', () => {
  it('bei ausreichendem Bestand: acht Abgefragte, vier Zusatzfläschchen, disjunkt', () => {
    const alle = aromen('a', 30);
    const staende = new Map<string, GesamtStand>(alle.map((a) => [a.id, STAND({ benennen: { versuche: 5, treffer: 5 }, box: 1, faellig: JETZT - TAG })]));
    const plan = planeDurchgang(alle, staende, JETZT);
    expect(plan.abgefragt).toHaveLength(DURCHGANG_GROESSE);
    expect(plan.zusatz).toHaveLength(4);
    const abgefragtIds = new Set(plan.abgefragt.map((a) => a.id));
    expect(plan.zusatz.every((z) => !abgefragtIds.has(z.id))).toBe(true);
  });
});

describe('planeDurchgang — Einfuehrungssperre (Lastenheft Abschnitt 7)', () => {
  it('bei ueber 30% in Box 1-2 werden keine neuen Aromen aufgenommen, obwohl welche verfuegbar waeren', () => {
    const eingefuehrt = aromen('alt', 20); // alle Box 1, faellig -> Sperre garantiert aktiv
    const neuKandidaten = aromen('neu', 3); // duerfen nicht gezogen werden
    const alle = [...eingefuehrt, ...neuKandidaten];
    const staende = new Map<string, GesamtStand>(
      eingefuehrt.map((a) => [a.id, STAND({ benennen: { versuche: 5, treffer: 5 }, box: 1, faellig: JETZT - TAG })]),
    );
    const plan = planeDurchgang(alle, staende, JETZT);
    expect(plan.abgefragt.some((a) => a.id.startsWith('neu'))).toBe(false);
    expect(plan.zusatz.some((a) => a.id.startsWith('neu'))).toBe(false);
  });
});

describe('planeDurchgang — Mischung ohne Sperre (Lastenheft Abschnitt 6)', () => {
  it('~50% faellig Box 1-2, ~30% faellig Box 3-5, bis zu 2 neue', () => {
    const niedrig = aromen('n', 3);
    const hoch = aromen('h', 9);
    const neuKandidaten = aromen('neu', 5);
    const alle = [...niedrig, ...hoch, ...neuKandidaten];
    const staende = new Map<string, GesamtStand>([
      ...niedrig.map((a): [string, GesamtStand] => [a.id, STAND({ benennen: { versuche: 5, treffer: 5 }, box: 1, faellig: JETZT - TAG })]),
      ...hoch.map((a): [string, GesamtStand] => [a.id, STAND({ benennen: { versuche: 5, treffer: 5 }, box: 4, faellig: JETZT - TAG })]),
    ]);
    // Anteil Box 1-2 an den eingefuehrten: 3/12 = 25% < 30% -> Einfuehrung erlaubt.
    const plan = planeDurchgang(alle, staende, JETZT, DURCHGANG_GROESSE, () => 0);
    expect(plan.abgefragt).toHaveLength(8);

    const niedrigIds = new Set(niedrig.map((a) => a.id));
    const hochIds = new Set(hoch.map((a) => a.id));
    const neuIds = new Set(neuKandidaten.map((a) => a.id));
    const gezogen = plan.abgefragt.map((a) => a.id);

    expect(gezogen.filter((id) => niedrigIds.has(id))).toHaveLength(3); // alle drei, es gibt nicht mehr
    expect(gezogen.filter((id) => hochIds.has(id))).toHaveLength(3);
    expect(gezogen.filter((id) => neuIds.has(id))).toHaveLength(2); // Obergrenze aus dem Lastenheft
  });
});

describe('planeDurchgang — Rueckstau-Fallback (Lastenheft Abschnitt 7)', () => {
  it('reicht die Zahl faelliger Aromen nicht, fuellt die Funktion trotzdem auf die Zielgroesse auf', () => {
    const faellig = aromen('f', 2);
    const nichtFaellig = aromen('s', 2);
    const alle = [...faellig, ...nichtFaellig];
    const staende = new Map<string, GesamtStand>([
      ...faellig.map((a): [string, GesamtStand] => [a.id, STAND({ benennen: { versuche: 5, treffer: 5 }, box: 1, faellig: JETZT - TAG })]),
      ...nichtFaellig.map((a): [string, GesamtStand] => [a.id, STAND({ benennen: { versuche: 5, treffer: 5 }, box: 1, faellig: JETZT + TAG })]),
    ]);
    const plan = planeDurchgang(alle, staende, JETZT, 4);
    expect(plan.abgefragt).toHaveLength(4);
    expect(new Set(plan.abgefragt.map((a) => a.id))).toEqual(new Set(alle.map((a) => a.id)));
    expect(plan.zusatz).toHaveLength(0); // der Bestand ist erschoepft — kein Absturz, nur ein leerer Rest
  });
});

describe('planeDurchgang — Zusatzfläschchen aus allen Boxen (Lastenheft Abschnitt 6)', () => {
  it('die Zusatzfläschchen stammen nicht aus nur einer Box', () => {
    const niedrig = aromen('n', 3);
    const hoch = aromen('h', 4);
    const alle = [...niedrig, ...hoch];
    const staende = new Map<string, GesamtStand>([
      ...niedrig.map((a): [string, GesamtStand] => [a.id, STAND({ benennen: { versuche: 5, treffer: 5 }, box: 1, faellig: JETZT - TAG })]),
      ...hoch.map((a): [string, GesamtStand] => [a.id, STAND({ benennen: { versuche: 5, treffer: 5 }, box: 4, faellig: JETZT - TAG })]),
    ]);
    // durchgangsGroesse 4 -> Zusatzanzahl 3, und genau 3 Aromen bleiben uebrig
    // (n3, h3, h4) — deren gesamter Pool wird genommen, unabhaengig vom Zufall.
    const plan = planeDurchgang(alle, staende, JETZT, 4);
    expect(new Set(plan.zusatz.map((a) => a.id))).toEqual(new Set(['n3', 'h3', 'h4']));
  });
});

describe('planeDurchgang — verwechselte Paare bevorzugt in denselben Durchgang (Lastenheft Abschnitt 6)', () => {
  it('ein dokumentiertes Verwechslungspaar rueckt gemeinsam vor eine sonst gleichrangige Konkurrenz', () => {
    const hoch = aromen('h', 4); // h1..h4, alle gleich ueberfaellig
    const staende = new Map<string, GesamtStand>(
      hoch.map((a): [string, GesamtStand] => [
        a.id,
        STAND({
          benennen: { versuche: 5, treffer: 5 },
          box: 4,
          faellig: JETZT - TAG,
          // h1 wurde dokumentiert oft mit h4 verwechselt — beide sollen
          // gemeinsam gezogen werden, nicht nur h1 allein.
          verwechslungen: a.id === 'h1' ? { h4: 2 } : {},
        }),
      ]),
    );
    const plan = planeDurchgang(hoch, staende, JETZT, 2);
    expect(new Set(plan.abgefragt.map((a) => a.id))).toEqual(new Set(['h1', 'h4']));
  });
});

// ============================================================================
// werteAntwortAus — Auswertung, nachdem die Nummer feststeht
// ============================================================================

describe('werteAntwortAus — Stufe C (freier Abruf): nur richtig oder falsch, nie teilweise', () => {
  const BASIS = {
    formStufe: 'c' as const,
    tatsaechlicheAromaId: 'mandel',
    tatsaechlicheFamilieId: 'nussig-kakao',
    tatsaechlicherStand: STAND({ box: 3, faellig: JETZT - TAG, stufe: 'c' }),
  };

  it('richtiges Aroma getippt: richtig, Box eine hoch', () => {
    const auswertung = werteAntwortAus({ ...BASIS, tipAromaId: 'mandel' }, JETZT);
    expect(auswertung.ergebnis).toBe('richtig');
    expect(auswertung.box).toBe(4);
  });

  it('falsches Aroma getippt, auch wenn die Familie stimmen würde: falsch, Box zurück auf 1', () => {
    const auswertung = werteAntwortAus({ ...BASIS, tipAromaId: 'haselnuss', tipFamilieId: 'nussig-kakao' }, JETZT);
    expect(auswertung.ergebnis).toBe('falsch');
    expect(auswertung.box).toBe(1);
  });
});

describe('werteAntwortAus — Stufe A (Familie): richtig oder falsch, keine Aroma-Frage', () => {
  const BASIS = {
    formStufe: 'a' as const,
    tatsaechlicheAromaId: 'erbsenschote',
    tatsaechlicheFamilieId: 'gruen-pflanzlich',
    tatsaechlicherStand: STAND({ box: 1, faellig: JETZT - TAG, familienSerie: 1 }),
  };

  it('richtige Familie: richtig, Box eine hoch, familienSerie +1', () => {
    const auswertung = werteAntwortAus({ ...BASIS, tipFamilieId: 'gruen-pflanzlich' }, JETZT);
    expect(auswertung.ergebnis).toBe('richtig');
    expect(auswertung.box).toBe(2);
    expect(auswertung.familienSerie).toBe(2);
    expect(auswertung.stufe).toBe('a'); // erst bei 3 in Folge schaltet Stufe B
  });

  it('falsche Familie: falsch, Box zurück auf 1, familienSerie zurueckgesetzt', () => {
    const auswertung = werteAntwortAus({ ...BASIS, tipFamilieId: 'blumig' }, JETZT);
    expect(auswertung.ergebnis).toBe('falsch');
    expect(auswertung.box).toBe(1);
    expect(auswertung.familienSerie).toBe(0);
  });

  it('die dritte richtige Familie in Folge schaltet auf Stufe B, familienSerie startet neu bei 0', () => {
    const kurzVorSchwelle = { ...BASIS, tatsaechlicherStand: STAND({ box: 1, faellig: JETZT - TAG, familienSerie: 2 }) };
    const auswertung = werteAntwortAus({ ...kurzVorSchwelle, tipFamilieId: 'gruen-pflanzlich' }, JETZT);
    expect(auswertung.stufe).toBe('b');
    expect(auswertung.familienSerie).toBe(0);
  });
});

describe('werteAntwortAus — Stufe B (Aroma in der Familie): teilweise bei richtiger Familie, falschem Aroma', () => {
  const BASIS = {
    formStufe: 'b' as const,
    tatsaechlicheAromaId: 'haselnuss',
    tatsaechlicheFamilieId: 'nussig-kakao',
    tatsaechlicherStand: STAND({ box: 3, faellig: JETZT - TAG, stufe: 'b' }),
  };

  it('Familie und Aroma richtig: richtig, Box eine hoch', () => {
    const auswertung = werteAntwortAus({ ...BASIS, tipFamilieId: 'nussig-kakao', tipAromaId: 'haselnuss' }, JETZT);
    expect(auswertung.ergebnis).toBe('richtig');
    expect(auswertung.box).toBe(4);
  });

  it('Familie richtig, Aroma falsch: teilweise, Box nur eine runter, nicht auf Null', () => {
    const auswertung = werteAntwortAus({ ...BASIS, tipFamilieId: 'nussig-kakao', tipAromaId: 'mandel' }, JETZT);
    expect(auswertung.ergebnis).toBe('teilweise');
    expect(auswertung.box).toBe(2);
  });

  it('Familie schon falsch: falsch, Box zurueck auf 1', () => {
    const auswertung = werteAntwortAus({ ...BASIS, tipFamilieId: 'blumig', tipAromaId: 'mandel' }, JETZT);
    expect(auswertung.ergebnis).toBe('falsch');
    expect(auswertung.box).toBe(1);
  });
});

describe('werteAntwortAus — formStufe stammt von einem anderen Aroma als dem tatsaechlich gezogenen (der Regelfall bei blindem Ziehen, nicht die Ausnahme)', () => {
  it('formStufe war A (Familienform gezeigt), das tatsaechliche Aroma steht laengst auf Stufe C — familienSerie bleibt unberuehrt', () => {
    const stand = STAND({ box: 5, faellig: JETZT - TAG, stufe: 'c', familienSerie: 0 });
    const auswertung = werteAntwortAus(
      { formStufe: 'a', tipFamilieId: 'nussig-kakao', tatsaechlicheAromaId: 'mandel', tatsaechlicheFamilieId: 'nussig-kakao', tatsaechlicherStand: stand },
      JETZT,
    );
    expect(auswertung.ergebnis).toBe('richtig'); // die gezeigte Form (A) wird korrekt ausgewertet
    expect(auswertung.wertung).toBe('ohneAussage'); // ... beweist aber nichts ueber Stufe C
    expect(auswertung.box).toBe(5); // Box bleibt stehen, statt fuer Familienwissen aufzusteigen
    expect(auswertung.faellig).toBe(JETZT - TAG); // und das Aroma bleibt faellig
    expect(auswertung.stufe).toBe('c'); // bleibt auf C, kein Rueckschritt durch die andere Form
    expect(auswertung.familienSerie).toBe(0); // wird nicht hochgezaehlt — das Aroma ist laengst ueber Stufe A hinaus
  });
});

// ============================================================================
// Stufenlogik-Nachzug (2026-11-08) — Wertung gegen die Stufe des gezogenen
// Aromas, Box beim Stufenwechsel, B → C, Rueckweg, lange Pause, "nur
// geraten", zaehe Aromen. docs/konzept.md, Abschnitt Uebungsmodus.
// ============================================================================

describe('werteAntwortAus — Wertung gegen die Stufe des tatsaechlich gezogenen Aromas', () => {
  const MANDEL = { tatsaechlicheAromaId: 'mandel', tatsaechlicheFamilieId: 'nussig-kakao' };

  it('leichtere Form, Fehler: zaehlt voll als falsch', () => {
    const a = werteAntwortAus({ ...MANDEL, formStufe: 'a', tipFamilieId: 'blumig', tatsaechlicherStand: STAND({ box: 4, stufe: 'b' }) }, JETZT);
    expect(a.wertung).toBe('falsch');
    expect(a.box).toBe(1);
  });

  it('leichtere Form B fuer ein Aroma auf C: Aroma richtig ist ohneAussage, Familie richtig aber Aroma falsch ist falsch', () => {
    const stand = STAND({ box: 3, faellig: JETZT - TAG, stufe: 'c' });
    const treffer = werteAntwortAus({ ...MANDEL, formStufe: 'b', tipFamilieId: 'nussig-kakao', tipAromaId: 'mandel', tatsaechlicherStand: stand }, JETZT);
    expect(treffer.wertung).toBe('ohneAussage');
    expect(treffer.box).toBe(3);
    const daneben = werteAntwortAus({ ...MANDEL, formStufe: 'b', tipFamilieId: 'nussig-kakao', tipAromaId: 'haselnuss', tatsaechlicherStand: stand }, JETZT);
    expect(daneben.ergebnis).toBe('teilweise'); // gemessen an der gezeigten Frage
    expect(daneben.wertung).toBe('falsch'); // gemessen an Stufe C
  });

  it('schwerere Form C fuer ein Aroma auf A: die Familie des getippten Aromas entscheidet', () => {
    const stand = STAND({ box: 1, stufe: 'a', familienSerie: 1 });
    const a = werteAntwortAus(
      { ...MANDEL, formStufe: 'c', tipAromaId: 'haselnuss', tipAromaFamilieId: 'nussig-kakao', tatsaechlicherStand: stand },
      JETZT,
    );
    expect(a.ergebnis).toBe('falsch'); // die gezeigte Frage (freier Abruf) war falsch
    expect(a.wertung).toBe('richtig'); // Stufe A verlangt nur die Familie — und die stimmte
    expect(a.familienSerie).toBe(2);
  });

  it('schwerere Form C fuer ein Aroma auf B: Familie richtig, Aroma falsch ist teilweise', () => {
    const a = werteAntwortAus(
      { ...MANDEL, formStufe: 'c', tipAromaId: 'haselnuss', tipAromaFamilieId: 'nussig-kakao', tatsaechlicherStand: STAND({ box: 3, stufe: 'b' }) },
      JETZT,
    );
    expect(a.wertung).toBe('teilweise');
    expect(a.box).toBe(2);
  });
});

describe('werteAntwortAus — Stufenwechsel', () => {
  const MANDEL = { tatsaechlicheAromaId: 'mandel', tatsaechlicheFamilieId: 'nussig-kakao' };

  it('A → B: Box zurueck auf 2 statt die Box der Familienstufe zu erben', () => {
    const a = werteAntwortAus({ ...MANDEL, formStufe: 'a', tipFamilieId: 'nussig-kakao', tatsaechlicherStand: STAND({ box: 3, stufe: 'a', familienSerie: 2 }) }, JETZT);
    expect(a.stufe).toBe('b');
    expect(a.stufenwechsel).toBe('auf');
    expect(a.box).toBe(2);
    expect(a.faellig).toBe(JETZT + 2 * TAG);
  });

  it('B → C: zwei Treffer mindestens 12 h auseinander', () => {
    const stand = STAND({ box: 2, stufe: 'b' });
    const erster = werteAntwortAus({ ...MANDEL, formStufe: 'b', tipFamilieId: 'nussig-kakao', tipAromaId: 'mandel', tatsaechlicherStand: stand }, JETZT);
    expect(erster.stufe).toBe('b');
    expect(erster.abrufSerie).toBe(1);
    const nachStand = STAND({ ...stand, box: erster.box, abrufSerie: erster.abrufSerie, abrufSerieZuletzt: erster.abrufSerieZuletzt });

    const amSelbenAbend = werteAntwortAus({ ...MANDEL, formStufe: 'c', tipAromaId: 'mandel', tatsaechlicherStand: nachStand }, JETZT + 2 * 60 * 60 * 1000);
    expect(amSelbenAbend.stufe).toBe('b'); // zwei Durchgaenge am selben Abend zaehlen als einer
    expect(amSelbenAbend.abrufSerie).toBe(1);

    const amNaechstenTag = werteAntwortAus({ ...MANDEL, formStufe: 'c', tipAromaId: 'mandel', tatsaechlicherStand: nachStand }, JETZT + 13 * 60 * 60 * 1000);
    expect(amNaechstenTag.stufe).toBe('c');
    expect(amNaechstenTag.stufenwechsel).toBe('auf');
    expect(amNaechstenTag.box).toBe(2);
  });

  it('B: ein Teilerfolg setzt die Aufstiegsserie zurueck', () => {
    const stand = STAND({ box: 3, stufe: 'b', abrufSerie: 1, abrufSerieZuletzt: JETZT - TAG });
    const a = werteAntwortAus({ ...MANDEL, formStufe: 'b', tipFamilieId: 'nussig-kakao', tipAromaId: 'haselnuss', tatsaechlicherStand: stand }, JETZT);
    expect(a.abrufSerie).toBe(0);
    expect(a.stufe).toBe('b');
  });

  it('C → B: zweimal in Folge schon die Familie falsch', () => {
    const stand = STAND({ box: 3, stufe: 'c' });
    const tip = { formStufe: 'c' as const, tipAromaId: 'jasmin', tipAromaFamilieId: 'blumig' };
    const erster = werteAntwortAus({ ...MANDEL, ...tip, tatsaechlicherStand: stand }, JETZT);
    expect(erster.stufe).toBe('c');
    expect(erster.familieFalschSerie).toBe(1);
    const zweiter = werteAntwortAus({ ...MANDEL, ...tip, tatsaechlicherStand: STAND({ ...stand, familieFalschSerie: 1 }) }, JETZT);
    expect(zweiter.stufe).toBe('b');
    expect(zweiter.stufenwechsel).toBe('ab');
    expect(zweiter.box).toBe(1);
  });

  it('C: Familie richtig, Aroma falsch unterbricht die Rueckweg-Serie', () => {
    const stand = STAND({ box: 3, stufe: 'c', familieFalschSerie: 1 });
    const a = werteAntwortAus({ ...MANDEL, formStufe: 'c', tipAromaId: 'haselnuss', tipAromaFamilieId: 'nussig-kakao', tatsaechlicherStand: stand }, JETZT);
    expect(a.familieFalschSerie).toBe(0);
    expect(a.stufe).toBe('c');
  });
});

describe('werteAntwortAus — "nur geraten" und lange Pause', () => {
  const MANDEL = { tatsaechlicheAromaId: 'mandel', tatsaechlicheFamilieId: 'nussig-kakao' };

  it('ein als geraten markierter Treffer zaehlt wie ein Teilerfolg — die gezeigte Frage bleibt richtig', () => {
    const a = werteAntwortAus(
      { ...MANDEL, formStufe: 'b', tipFamilieId: 'nussig-kakao', tipAromaId: 'mandel', geraten: true, tatsaechlicherStand: STAND({ box: 3, stufe: 'b' }) },
      JETZT,
    );
    expect(a.ergebnis).toBe('richtig');
    expect(a.wertung).toBe('teilweise');
    expect(a.box).toBe(2);
    expect(a.abrufSerie).toBe(0);
  });

  it('stark ueberfaellig, auf der eigenen Stufe nicht gewusst, aber auf der darunter: aufgefrischt, Box 2', () => {
    const stand = STAND({ box: 4, stufe: 'b', faellig: JETZT - 30 * TAG });
    const a = werteAntwortAus({ ...MANDEL, formStufe: 'b', tipFamilieId: 'nussig-kakao', tipAromaId: 'haselnuss', tatsaechlicherStand: stand }, JETZT);
    expect(a.wertung).toBe('aufgefrischt');
    expect(a.box).toBe(2);
    expect(a.faellig).toBe(JETZT + 2 * TAG);
    expect(a.stufe).toBe('b');
  });

  it('nicht stark ueberfaellig: derselbe Tipp ist ein normaler Teilerfolg', () => {
    const stand = STAND({ box: 4, stufe: 'b', faellig: JETZT - TAG });
    const a = werteAntwortAus({ ...MANDEL, formStufe: 'b', tipFamilieId: 'nussig-kakao', tipAromaId: 'haselnuss', tatsaechlicherStand: stand }, JETZT);
    expect(a.wertung).toBe('teilweise');
    expect(a.box).toBe(3);
  });

  it('eine leichtere Form nach langer Pause loest die Dauerschleife "ohneAussage" auf', () => {
    const stand = STAND({ box: 4, stufe: 'b', faellig: JETZT - 30 * TAG });
    const a = werteAntwortAus({ ...MANDEL, formStufe: 'a', tipFamilieId: 'nussig-kakao', tatsaechlicherStand: stand }, JETZT);
    expect(a.wertung).toBe('aufgefrischt');
    expect(a.faellig).toBe(JETZT + 2 * TAG);
  });
});

describe('zaehe Aromen — zaehlen nicht fuer die Einfuehrungssperre', () => {
  it('fuenf nicht richtige Wertungen in Folge machen ein Aroma zaeh, ein Treffer hebt es auf', () => {
    expect(effektiverZustand(STAND({ benennen: { versuche: 5, treffer: 0 }, fehlerSerie: 4 }), JETZT).zaeh).toBe(false);
    expect(effektiverZustand(STAND({ benennen: { versuche: 5, treffer: 0 }, fehlerSerie: 5 }), JETZT).zaeh).toBe(true);
    const a = werteAntwortAus(
      { formStufe: 'a', tipFamilieId: 'nussig-kakao', tatsaechlicheAromaId: 'mandel', tatsaechlicheFamilieId: 'nussig-kakao', tatsaechlicherStand: STAND({ fehlerSerie: 7 }) },
      JETZT,
    );
    expect(a.fehlerSerie).toBe(0);
  });

  it('drei zaehe Aromen auf Box 1 blockieren die Einfuehrung nicht mehr', () => {
    const zaeh = aromen('z', 3);
    const sitzt = aromen('s', 7);
    const neu = aromen('neu', 3);
    const staende = new Map<string, GesamtStand>([
      ...zaeh.map((a) => [a.id, STAND({ benennen: { versuche: 6, treffer: 0 }, box: 1, faellig: JETZT - TAG, fehlerSerie: 6 })] as const),
      ...sitzt.map((a) => [a.id, STAND({ benennen: { versuche: 6, treffer: 6 }, box: 4, faellig: JETZT - TAG })] as const),
    ]);
    const plan = planeDurchgang([...zaeh, ...sitzt, ...neu], staende, JETZT);
    expect(plan.abgefragt.filter((a) => a.id.startsWith('neu'))).toHaveLength(2);
    // Gegenprobe: ohne die Zaeh-Regel stuenden 3 von 10 = 30 % in Box 1-2 — Sperre.
    const ohneZaeh = new Map([...staende].map(([id, s]) => [id, { ...s, fehlerSerie: 0 }]));
    const gesperrt = planeDurchgang([...zaeh, ...sitzt, ...neu], ohneZaeh, JETZT);
    expect(gesperrt.abgefragt.some((a) => a.id.startsWith('neu'))).toBe(false);
  });
});

// ============================================================================
// Aromapaket, Etappe 7 — Kontrastdurchgang
// ============================================================================

describe('verwechslungspaare — Schwelle, Richtungs-Dedup, Sortierung (Lastenheft Abschnitt 8)', () => {
  it('unter der Schwelle taucht kein Paar auf', () => {
    const staende = new Map<string, GesamtStand>([['mandel', STAND({ verwechslungen: { haselnuss: KONTRASTDURCHGANG_SCHWELLE - 1 } })]]);
    expect(verwechslungspaare(staende)).toEqual([]);
  });

  it('an der Schwelle taucht das Paar auf', () => {
    const staende = new Map<string, GesamtStand>([['mandel', STAND({ verwechslungen: { haselnuss: KONTRASTDURCHGANG_SCHWELLE } })]]);
    const paare = verwechslungspaare(staende);
    expect(paare).toHaveLength(1);
    expect(paare[0]).toMatchObject({ aId: 'mandel', bId: 'haselnuss', anzahl: KONTRASTDURCHGANG_SCHWELLE });
  });

  it('eine in beide Richtungen dokumentierte Verwechslung zaehlt als EIN Paar mit der hoeheren Zahl, nicht als Summe', () => {
    const staende = new Map<string, GesamtStand>([
      ['mandel', STAND({ verwechslungen: { haselnuss: 5 } })],
      ['haselnuss', STAND({ verwechslungen: { mandel: 3 } })],
    ]);
    const paare = verwechslungspaare(staende);
    expect(paare).toHaveLength(1);
    expect(paare[0]!.anzahl).toBe(5);
  });

  it('mehrere Paare stehen absteigend nach Haeufigkeit', () => {
    const staende = new Map<string, GesamtStand>([
      ['mandel', STAND({ verwechslungen: { haselnuss: 3 } })],
      ['teer', STAND({ verwechslungen: { gummi: 7 } })],
    ]);
    const paare = verwechslungspaare(staende);
    expect(paare.map((p) => p.anzahl)).toEqual([7, 3]);
  });
});

describe('werteKontrastAus — eine Zuordnungsfrage, wirkt am Paar, nie an der Box', () => {
  it('richtig senkt den Verwechslungszaehler in beide Richtungen um 1, ein Eintrag auf 0 verschwindet', () => {
    const a = STAND({ box: 2, verwechslungen: { b: 3 } });
    const b = STAND({ box: 4, verwechslungen: { a: 1 } });
    const auswertung = werteKontrastAus(true, 'a', 'b', a, b);
    expect(auswertung.ergebnis).toBe('richtig');
    expect(auswertung.aVerwechslungen).toEqual({ b: 2 });
    expect(auswertung.bVerwechslungen).toEqual({});
    expect('aBox' in auswertung).toBe(false); // bei 50 % Ratechance kein Beleg fuer die Box
  });

  it('falsch erhoeht den Zaehler in beide Richtungen — auch fuer ein bisher nur verwandtes Paar', () => {
    const auswertung = werteKontrastAus(false, 'a', 'b', STAND(), undefined);
    expect(auswertung.ergebnis).toBe('falsch');
    expect(auswertung.aVerwechslungen).toEqual({ b: 1 });
    expect(auswertung.bVerwechslungen).toEqual({ a: 1 });
  });
});

describe('kontrastpaare — Rangfolge, jedes Aroma hoechstens einmal', () => {
  const opt = (id: string, verwandte: string[] = []): AromaOption => ({ id, label: id, kategorieId: 'k', verwandte });
  const EINGEFUEHRT = { benennen: { versuche: 3, treffer: 2 } };

  it('belegte Verwechslung vor zaehem Aroma vor verwandtem Paar', () => {
    const alle = [opt('m', ['h']), opt('h', ['m']), opt('z', ['x']), opt('x'), opt('v1', ['v2']), opt('v2'), opt('q', ['r']), opt('r')];
    const staende = new Map<string, GesamtStand>([
      ['m', STAND({ ...EINGEFUEHRT, stufe: 'b', verwechslungen: { h: 3 } })],
      ['h', STAND({ ...EINGEFUEHRT, stufe: 'b' })],
      ['z', STAND({ ...EINGEFUEHRT, stufe: 'a', fehlerSerie: 6 })],
      ['x', STAND({ ...EINGEFUEHRT, stufe: 'a' })],
      ['v1', STAND({ ...EINGEFUEHRT, stufe: 'b' })],
      ['v2', STAND({ ...EINGEFUEHRT, stufe: 'c' })],
      ['q', STAND({ ...EINGEFUEHRT, stufe: 'a' })], // Stufe A: kein vorbeugendes Paar
      ['r', STAND({ ...EINGEFUEHRT, stufe: 'b' })],
    ]);
    const paare = kontrastpaare(alle, staende, JETZT, () => 0);
    expect(paare.map((p) => p.quelle)).toEqual(['verwechslung', 'zaeh', 'verwandt']);
    expect(paare.map((p) => [p.aId, p.bId].sort().join('|'))).toEqual(['h|m', 'x|z', 'v1|v2']);
  });

  it('ein Aroma steht nie in zwei Paaren', () => {
    const alle = [opt('a', ['b', 'c']), opt('b', ['a', 'c']), opt('c', ['a', 'b'])];
    const staende = new Map<string, GesamtStand>(alle.map((a) => [a.id, STAND({ ...EINGEFUEHRT, stufe: 'b' })]));
    const paare = kontrastpaare(alle, staende, JETZT, () => 0);
    expect(paare).toHaveLength(1);
  });

  it(`hoechstens ${KONTRAST_PAARE_MAX} Paare`, () => {
    const alle = Array.from({ length: 12 }, (_, i) => opt('p' + i, ['p' + (i % 2 === 0 ? i + 1 : i - 1)]));
    const staende = new Map<string, GesamtStand>(alle.map((a) => [a.id, STAND({ ...EINGEFUEHRT, stufe: 'b' })]));
    expect(kontrastpaare(alle, staende, JETZT, () => 0.5)).toHaveLength(KONTRAST_PAARE_MAX);
  });
});

describe('waehleDurchgangsart — etwa jeder vierte, nur ab drei Paaren', () => {
  it('unter drei Paaren immer normal', () => {
    expect(waehleDurchgangsart(2, () => 0)).toBe('normal');
  });
  it('ab drei Paaren: Kontrast bei Zufall unter 25 %', () => {
    expect(waehleDurchgangsart(3, () => 0.24)).toBe('kontrast');
    expect(waehleDurchgangsart(3, () => 0.25)).toBe('normal');
  });
});

describe('kontrastNachriechenAngebracht — beide Fläschchen, zwei Riechvorgänge', () => {
  it('nach falsch ja, nach richtig nein', () => {
    expect(kontrastNachriechenAngebracht('falsch', 4, 0)).toBe(true);
    expect(kontrastNachriechenAngebracht('richtig', 4, 0)).toBe(false);
  });
  it(`bei 4 Paaren hoechstens zweimal: 8 + 2 + 2 = ${RIECHGRENZE}`, () => {
    expect(kontrastNachriechenAngebracht('falsch', 4, 2)).toBe(true);
    expect(kontrastNachriechenAngebracht('falsch', 4, 4)).toBe(false);
  });
});

describe('reverseVorschlag — schwierigstes eingefuehrtes Aroma fuer die Uebersicht', () => {
  it('ohne eingefuehrtes Aroma: kein Vorschlag', () => {
    const alle = aromen('n', 3); // keine Staende -> nicht eingefuehrt
    expect(reverseVorschlag(alle, new Map(), JETZT)).toBeUndefined();
  });

  it('waehlt ein Aroma aus der niedrigsten Box, nicht aus einer hoeheren', () => {
    const alle = aromen('a', 3);
    const staende = new Map<string, GesamtStand>([
      ['a1', STAND({ benennen: { versuche: 5, treffer: 5 }, box: 1, faellig: JETZT - TAG })],
      ['a2', STAND({ benennen: { versuche: 5, treffer: 5 }, box: 3, faellig: JETZT - TAG })],
      ['a3', STAND({ benennen: { versuche: 5, treffer: 5 }, box: 4, faellig: JETZT - TAG })],
    ]);
    const vorschlag = reverseVorschlag(alle, staende, JETZT);
    expect(vorschlag?.id).toBe('a1');
  });

  it('ignoriert nicht eingefuehrte Aromen, auch wenn sie rechnerisch Box 1 waeren', () => {
    const eingefuehrt = aromen('e', 1);
    const nichtEingefuehrt = aromen('n', 1);
    const alle = [...eingefuehrt, ...nichtEingefuehrt];
    const staende = new Map<string, GesamtStand>([['e1', STAND({ benennen: { versuche: 5, treffer: 5 }, box: 3, faellig: JETZT - TAG })]]);
    const vorschlag = reverseVorschlag(alle, staende, JETZT);
    expect(vorschlag?.id).toBe('e1');
  });

  it('bei Gleichstand auf derselben Box wird zufaellig gezogen (mit festem Zufall deterministisch)', () => {
    const alle = aromen('a', 3);
    const staende = new Map<string, GesamtStand>(
      alle.map((a): [string, GesamtStand] => [a.id, STAND({ benennen: { versuche: 5, treffer: 5 }, box: 2, faellig: JETZT - TAG })]),
    );
    expect(reverseVorschlag(alle, staende, JETZT, () => 0)?.id).toBe('a2');
    expect(reverseVorschlag(alle, staende, JETZT, () => 0.99)?.id).toBe('a1');
  });
});

// ============================================================================
// Nachriechen (Etappe 2 des Lern-Nachzugs)
// ============================================================================

describe('nachriechenAngebracht — nach Fehlern, solange die Riechgrenze reicht', () => {
  it('nach einem echten Treffer nicht — das wäre ein Riechvorgang ohne Lerngewinn', () => {
    expect(nachriechenAngebracht({ ergebnis: 'richtig', wertung: 'richtig' }, 0)).toBe(false);
    expect(nachriechenAngebracht({ ergebnis: 'richtig', wertung: 'ohneAussage' }, 0)).toBe(false);
  });

  it('nach falsch, teilweise, geraten oder aufgefrischt ja', () => {
    expect(nachriechenAngebracht({ ergebnis: 'falsch', wertung: 'falsch' }, 0)).toBe(true);
    expect(nachriechenAngebracht({ ergebnis: 'teilweise', wertung: 'teilweise' }, 0)).toBe(true);
    expect(nachriechenAngebracht({ ergebnis: 'richtig', wertung: 'teilweise' }, 0)).toBe(true); // als geraten markiert
    expect(nachriechenAngebracht({ ergebnis: 'falsch', wertung: 'richtig' }, 0)).toBe(true); // schwerere Form verfehlt, Stufe gehalten
    expect(nachriechenAngebracht({ ergebnis: 'falsch', wertung: 'aufgefrischt' }, 0)).toBe(true);
  });

  it(`höchstens ${RIECHGRENZE - DURCHGANG_GROESSE}-mal je Durchgang: 8 Abfragen + Nachriechen ≤ ${RIECHGRENZE}`, () => {
    const fehler = { ergebnis: 'falsch' as const, wertung: 'falsch' as const };
    expect(nachriechenAngebracht(fehler, RIECHGRENZE - DURCHGANG_GROESSE - 1)).toBe(true);
    expect(nachriechenAngebracht(fehler, RIECHGRENZE - DURCHGANG_GROESSE)).toBe(false);
  });
});
