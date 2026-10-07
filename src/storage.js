const STORAGE_KEY = 'quickfire:high-scores:v1';

/**
 * Persists best scores per difficulty. Storage can be unavailable (private
 * browsing, blocked cookies), so every access degrades to an in-memory map.
 *
 * @param {Pick<Storage, 'getItem' | 'setItem'> | undefined} [storage]
 */
export function createHighScoreStore(storage = safeLocalStorage()) {
  /** @type {Record<string, number>} */
  let scores = load();

  function load() {
    try {
      const parsed = JSON.parse(storage?.getItem(STORAGE_KEY) ?? '{}');
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  function save() {
    try {
      storage?.setItem(STORAGE_KEY, JSON.stringify(scores));
    } catch {
      // Quota exceeded or storage disabled: keep the in-memory copy.
    }
  }

  return {
    /** @param {string} difficulty */
    get(difficulty) {
      return Number.isFinite(scores[difficulty]) ? scores[difficulty] : 0;
    },

    /**
     * Records a score if it beats the stored best.
     *
     * @param {string} difficulty
     * @param {number} score
     * @returns {boolean} true if this is a new best.
     */
    record(difficulty, score) {
      if (score <= this.get(difficulty)) return false;
      scores = { ...scores, [difficulty]: score };
      save();
      return true;
    },
  };
}

function safeLocalStorage() {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}
