import { describe, it, expect } from 'vitest';
import { planeBezuege, effektiverAnteil, verschnittAngebotSichtbar, type Position } from './plan';

const INPUT = new Map([['espresso-profil', 18]]);

let lfd = 0;
function cappuccino(kaffeeId = 'entcoffeiniert', modifikatoren: string[] = []): Position {
  return {
    id: `p${++lfd}`,
    getraenkId: 'cappuccino',
    kaffeeId,
    profilId: 'espresso-profil',
    anteilBezug: 'halb',
    modifikatoren,
  };
}

function espresso(kaffeeId = 'entcoffeiniert'): Position {
  return {
    id: `p${++lfd}`,
    getraenkId: 'espresso',
    kaffeeId,
    profilId: 'espresso-profil',
    anteilBezug: 'ganz',
    modifikatoren: [],
  };
}

/**
 * Diese Tabelle steht so im Konzept. Sie ist der Grund, warum der Planer
 * nie fragen muss — und der Beleg, dass ein Extra Shot bei gerader Anzahl
 * Verschnitt erzeugt statt ihn zu loesen.
 */
describe('Buendelungstabelle aus dem Konzept', () => {
  it('1 x Cappuccino: 1 Bezug, 9 g Verschnitt', () => {
    const plan = planeBezuege([cappuccino()], INPUT);
    expect(plan.durchgaenge).toHaveLength(1);
    expect(plan.verschnittGramm).toBe(9);
  });

  it('1 x Cappuccino + Extra Shot: 1 Bezug, kein Verschnitt', () => {
    const plan = planeBezuege([cappuccino('entcoffeiniert', ['extra-shot'])], INPUT);
    expect(plan.durchgaenge).toHaveLength(1);
    expect(plan.verschnittGramm).toBe(0);
  });

  it('2 x Cappuccino: 1 Bezug, kein Verschnitt', () => {
    const plan = planeBezuege([cappuccino(), cappuccino()], INPUT);
    expect(plan.durchgaenge).toHaveLength(1);
    expect(plan.durchgaenge[0]?.positionIds).toHaveLength(2);
    expect(plan.verschnittGramm).toBe(0);
  });

  it('3 x Cappuccino: 2 Bezuege, 9 g Verschnitt', () => {
    const plan = planeBezuege([cappuccino(), cappuccino(), cappuccino()], INPUT);
    expect(plan.durchgaenge).toHaveLength(2);
    expect(plan.verschnittGramm).toBe(9);
  });

  it('2 x Cappuccino, einer mit Extra Shot: 2 Bezuege, 9 g Verschnitt', () => {
    const plan = planeBezuege(
      [cappuccino(), cappuccino('entcoffeiniert', ['extra-shot'])],
      INPUT,
    );
    expect(plan.durchgaenge).toHaveLength(2);
    // Der ehrliche Fall: 1,5 Bezuege gibt es nicht.
    expect(plan.verschnittGramm).toBe(9);
  });
});

describe('Bohnenwechsel ist definitionsgemaess ein neuer Durchgang', () => {
  it('buendelt zwei Cappuccino mit verschiedenen Bohnen nicht', () => {
    const plan = planeBezuege([cappuccino('entcoffeiniert'), cappuccino('manaresi')], INPUT);
    expect(plan.durchgaenge).toHaveLength(2);
    // Beide bleiben halb belegt, also zweimal Verschnitt.
    expect(plan.verschnittGramm).toBe(18);
  });

  it('buendelt vier Cappuccino, zwei je Bohne, zu zwei Bezuegen', () => {
    const plan = planeBezuege(
      [
        cappuccino('entcoffeiniert'),
        cappuccino('entcoffeiniert'),
        cappuccino('manaresi'),
        cappuccino('manaresi'),
      ],
      INPUT,
    );
    expect(plan.durchgaenge).toHaveLength(2);
    expect(plan.verschnittGramm).toBe(0);
  });
});

describe('ganze Bezuege', () => {
  it('bekommen das Sieb allein und erzeugen nie Verschnitt', () => {
    const plan = planeBezuege([espresso(), espresso()], INPUT);
    expect(plan.durchgaenge).toHaveLength(2);
    expect(plan.verschnittGramm).toBe(0);
  });

  it('buendeln nicht mit halben Bezuegen derselben Bohne', () => {
    const plan = planeBezuege([espresso(), cappuccino()], INPUT);
    expect(plan.durchgaenge).toHaveLength(2);
    expect(plan.verschnittGramm).toBe(9);
  });
});

describe('effektiverAnteil', () => {
  it('hebt halb mit Extra Shot auf ganz', () => {
    expect(effektiverAnteil(cappuccino('x', ['extra-shot']))).toBe('ganz');
  });

  it('laesst ganz unberuehrt', () => {
    expect(effektiverAnteil(espresso())).toBe('ganz');
  });
});

describe('Verschnitt-Angebot am Fuss des Plans', () => {
  it('steht da, solange ein halber Bezug zu holen ist', () => {
    expect(verschnittAngebotSichtbar(planeBezuege([cappuccino()], INPUT))).toBe(true);
  });

  it('verschwindet ersatzlos, sobald nichts uebrig bleibt', () => {
    expect(verschnittAngebotSichtbar(planeBezuege([cappuccino(), cappuccino()], INPUT))).toBe(
      false,
    );
  });
});

describe('unbekanntes Profil', () => {
  it('zaehlt 0 g Verschnitt statt den Input zu raten', () => {
    const plan = planeBezuege([cappuccino()], new Map());
    expect(plan.durchgaenge).toHaveLength(1);
    expect(plan.verschnittGramm).toBe(0);
  });
});

describe('leere Bestellung', () => {
  it('ergibt keinen Durchgang und keinen Verschnitt', () => {
    const plan = planeBezuege([], INPUT);
    expect(plan.durchgaenge).toHaveLength(0);
    expect(plan.verschnittGramm).toBe(0);
  });
});

describe('Buendelungs-Schluessel', () => {
  it('verwechselt zwei Paare nicht, deren Ids ineinander laufen', () => {
    const eins: Position = {
      id: 'a', getraenkId: 'cappuccino', kaffeeId: 'bohne', profilId: 'x-espresso',
      anteilBezug: 'halb', modifikatoren: [],
    };
    const zwei: Position = {
      id: 'b', getraenkId: 'cappuccino', kaffeeId: 'bohne-x', profilId: 'espresso',
      anteilBezug: 'halb', modifikatoren: [],
    };
    // Verschiedene Bohnen duerfen nie in einen Durchgang fallen.
    const plan = planeBezuege([eins, zwei], new Map());
    expect(plan.durchgaenge).toHaveLength(2);
  });
});
