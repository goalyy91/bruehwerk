import { describe, it, expect } from 'vitest';
import { neueId } from './id';

describe('neueId', () => {
  it('liefert eine UUID-artige Zeichenkette (8-4-4-4-12)', () => {
    expect(neueId()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
  });

  it('liefert bei wiederholtem Aufruf unterschiedliche Werte', () => {
    expect(neueId()).not.toBe(neueId());
  });
});
