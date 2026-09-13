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
  KONTRASTDURCHGANG_SCHWELLE,
  reverseVorschlag,
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
    expect(z).toEqual({ box: 1, faellig: JETZT, stufe: 'a', eingefuehrt: false });
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
    tatsaechlicherStand: STAND({ box: 3, faellig: JETZT - TAG }),
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
    tatsaechlicherStand: STAND({ box: 3, faellig: JETZT - TAG }),
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
    expect(auswertung.stufe).toBe('c'); // bleibt auf C, kein Rueckschritt durch die andere Form
    expect(auswertung.familienSerie).toBe(0); // wird nicht hochgezaehlt — das Aroma ist laengst ueber Stufe A hinaus
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

describe('werteKontrastAus — eine gemeinsame Zuordnungsfrage, kein "teilweise" (Lastenheft Abschnitt 6)', () => {
  it('richtige Reihenfolge bewegt beide Boxen eine hoch, jede von ihrer eigenen aus', () => {
    const a = STAND({ box: 2, faellig: JETZT - TAG });
    const b = STAND({ box: 4, faellig: JETZT - TAG });
    const auswertung = werteKontrastAus(true, a, b, JETZT);
    expect(auswertung.ergebnis).toBe('richtig');
    expect(auswertung.aBox).toBe(3);
    expect(auswertung.bBox).toBe(5);
  });

  it('falsche Reihenfolge wirft beide Boxen auf 1 zurueck', () => {
    const a = STAND({ box: 2, faellig: JETZT - TAG });
    const b = STAND({ box: 4, faellig: JETZT - TAG });
    const auswertung = werteKontrastAus(false, a, b, JETZT);
    expect(auswertung.ergebnis).toBe('falsch');
    expect(auswertung.aBox).toBe(1);
    expect(auswertung.bBox).toBe(1);
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
