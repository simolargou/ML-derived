import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadProgress, saveProgress } from './progress';
afterEach(() => vi.unstubAllGlobals());
describe('existing completion records', () => {
  it('reads the original key, keeps valid lessons, and removes duplicate identifiers', () => {
    const getItem = vi.fn(() => JSON.stringify(['pca', 'pca', 12, 'unknown', 'vectors']));
    vi.stubGlobal('localStorage', { getItem });
    expect(loadProgress()).toEqual(['pca', 'vectors']);
    expect(getItem).toHaveBeenCalledWith('ml-derived-progress-v1');
  });
  it('recovers from corrupted, unavailable, and incorrectly shaped storage', () => {
    for (const value of ['{', '{}', 'null']) {
      vi.stubGlobal('localStorage', { getItem: () => value });
      expect(loadProgress()).toEqual([]);
    }
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('Storage denied');
      },
    });
    expect(loadProgress()).toEqual([]);
  });
  it('keeps the original write format and lets the interface report write failures', () => {
    const setItem = vi.fn();
    vi.stubGlobal('localStorage', { setItem });
    saveProgress(['pca']);
    expect(setItem).toHaveBeenCalledWith('ml-derived-progress-v1', '["pca"]');
    setItem.mockImplementation(() => {
      throw new Error('Storage denied');
    });
    expect(() => saveProgress([])).toThrow('Storage denied');
  });
});
