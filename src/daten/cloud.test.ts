import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce } from './cloud';

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('löst erst nach der Wartezeit ohne weiteren Aufruf aus', () => {
    const auftrag = vi.fn();
    const verzoegert = debounce(auftrag, 1000);
    verzoegert();
    expect(auftrag).not.toHaveBeenCalled();
    vi.advanceTimersByTime(999);
    expect(auftrag).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(auftrag).toHaveBeenCalledTimes(1);
  });

  it('mehrere schnelle Aufrufe lösen nur einen einzigen Lauf aus', () => {
    const auftrag = vi.fn();
    const verzoegert = debounce(auftrag, 1000);
    verzoegert('a');
    vi.advanceTimersByTime(500);
    verzoegert('b');
    vi.advanceTimersByTime(500);
    verzoegert('c');
    vi.advanceTimersByTime(999);
    expect(auftrag).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(auftrag).toHaveBeenCalledTimes(1);
    expect(auftrag).toHaveBeenCalledWith('c');
  });

  it('läuft nach der Wartezeit erneut, wenn wieder angestoßen wird', () => {
    const auftrag = vi.fn();
    const verzoegert = debounce(auftrag, 1000);
    verzoegert();
    vi.advanceTimersByTime(1000);
    expect(auftrag).toHaveBeenCalledTimes(1);
    verzoegert();
    vi.advanceTimersByTime(1000);
    expect(auftrag).toHaveBeenCalledTimes(2);
  });
});
