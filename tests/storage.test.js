import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { createHighScoreStore } from '../src/storage.js';

function memoryStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
  };
}

describe('createHighScoreStore', () => {
  it('returns 0 for difficulties with no score', () => {
    assert.equal(createHighScoreStore(memoryStorage()).get('easy'), 0);
  });

  it('only records improvements and persists them', () => {
    const storage = memoryStorage();
    const store = createHighScoreStore(storage);
    assert.equal(store.record('easy', 50), true);
    assert.equal(store.record('easy', 30), false);
    assert.equal(createHighScoreStore(storage).get('easy'), 50);
  });

  it('survives corrupt data', () => {
    const store = createHighScoreStore(memoryStorage({ 'quickfire:high-scores:v1': '{not json' }));
    assert.equal(store.get('easy'), 0);
  });

  it('keeps working in memory when storage throws', () => {
    const store = createHighScoreStore({
      getItem: () => {
        throw new Error('SecurityError');
      },
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    });
    assert.equal(store.record('hard', 90), true);
    assert.equal(store.get('hard'), 90);
  });

  it('works with no storage at all', () => {
    const store = createHighScoreStore(undefined);
    assert.equal(store.record('easy', 10), true);
  });
});
