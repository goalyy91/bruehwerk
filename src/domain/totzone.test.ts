import { describe, it, expect } from 'vitest';
import { findeTotzonen, inTotzone } from './totzone';

/**
 * Die Erzaehlung aus konzept.md:522-524: MG 3,75-3,90 dreimal getestet,
 * alle daneben -> toter Bereich. Ein vierter Shot dort soll nicht mehr
 * vorgeschlagen werden (inTotzone).
 */
describe('findeTotzonen — die Espresso-Entcoffeiniert-Erzaehlung aus dem Konzept', () => {
  it('drei daneben-Shots im selben Band ergeben eine Totzone', () => {
    const totzonen = findeTotzonen(
      [
        { mg: 3.75, daneben: true },
        { mg: 3.8, daneben: true },
        { mg: 3.9, daneben: true },
      ],
      0.1,
    );
    expect(totzonen).toHaveLength(1);
    expect(totzonen[0]).toMatchObject({ von: 3.75, bis: 3.9, anzahl: 3 });
  });

  it('zwei daneben-Shots reichen nicht — ein einzelner Shot ist kein toter Bereich', () => {
    expect(findeTotzonen([{ mg: 3.75, daneben: true }, { mg: 3.8, daneben: true }], 0.1)).toEqual([]);
  });

  it('okay/sehr-gut-Shots zaehlen nicht mit', () => {
    const totzonen = findeTotzonen(
      [
        { mg: 3.75, daneben: true },
        { mg: 3.8, daneben: true },
        { mg: 3.9, daneben: false },
      ],
      0.1,
    );
    expect(totzonen).toEqual([]);
  });

  it('weit auseinanderliegende daneben-Shots bilden getrennte Baender', () => {
    const totzonen = findeTotzonen(
      [
        { mg: 3.6, daneben: true },
        { mg: 3.65, daneben: true },
        { mg: 3.7, daneben: true },
        { mg: 3.95, daneben: true },
        { mg: 4.0, daneben: true },
        { mg: 4.05, daneben: true },
      ],
      0.1,
    );
    expect(totzonen).toHaveLength(2);
  });

  it('ein vierter Shot mitten in der Totzone gilt als "nicht mehr vorschlagen"', () => {
    const totzonen = findeTotzonen(
      [{ mg: 3.75, daneben: true }, { mg: 3.8, daneben: true }, { mg: 3.9, daneben: true }],
      0.1,
    );
    expect(inTotzone(3.82, totzonen)).toBe(true);
    expect(inTotzone(3.6, totzonen)).toBe(false);
  });
});
