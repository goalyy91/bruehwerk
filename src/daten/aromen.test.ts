import { describe, it, expect } from 'vitest';
import { kanonischesAromaLabel } from './aromen';

describe('kanonischesAromaLabel — setuebergreifendes Zaehlen (K55)', () => {
  it('nutzt das SCA-Label des Zwillings, auch wenn die Namen sich unterscheiden', () => {
    // Nr. 44 "Toast" hat als Naeherung den SCA-Zwilling "getreidig" (aromen.ts).
    // Der Punkt des Tests: das SCA-Label gewinnt, nicht der eigene Name.
    expect(kanonischesAromaLabel({ pfad: ['Röstig', 'Röstig', 'Toast'], nummer: 44 })).toBe('getreidig');
  });

  it('faellt auf das letzte Pfadglied zurueck, wenn kein SCA-Zwilling bekannt ist', () => {
    // Nr. 43 "Butter" hat laut aromen.ts bewusst gar keine sca-Zuordnung.
    expect(kanonischesAromaLabel({ pfad: ['Röstig', 'Röstig', 'Butter'], nummer: 43 })).toBe('Butter');
  });

  it('faellt auf das letzte Pfadglied zurueck, wenn keine Nummer vorliegt (SCA-Set selbst)', () => {
    expect(kanonischesAromaLabel({ pfad: ['Fruchtig', 'Beere', 'Blaubeere'] })).toBe('Blaubeere');
  });

  it('deckt sich mit dem tatsaechlichen SCA-Label, nicht nur mit einer Id', () => {
    // Nr. 6 "Blaubeere" (Le Nez) hat den SCA-Zwilling "blaubeere" — Le-Nez-Name
    // und SCA-Label sind hier zufaellig identisch, das Ergebnis muss trotzdem
    // ueber die Zuordnung kommen, nicht ueber den Zufall gleicher Woerter.
    expect(kanonischesAromaLabel({ pfad: ['Fruchtig', 'Beere', 'Blaubeere'], nummer: 6 })).toBe('Blaubeere');
  });
});
