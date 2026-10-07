/**
 * Difficulty presets. Tuning the game means editing data here, not code paths.
 *
 * @typedef {import('./expression.js').GeneratorOptions & {
 *   label: string,
 *   description: string,
 *   points: number,
 *   timeLimitMs: number,
 * }} Difficulty
 */

const WRONG_ANSWER_PENALTY = 5;

/** @type {Readonly<Record<string, Readonly<Difficulty>>>} */
export const DIFFICULTIES = Object.freeze({
  easy: Object.freeze({
    label: 'Easy',
    description: 'Two terms, whole numbers',
    terms: 2,
    operators: ['+', '-', '*'],
    range: [0, 20],
    mulRange: [0, 12],
    points: 10,
    timeLimitMs: 30_000,
  }),
  medium: Object.freeze({
    label: 'Medium',
    description: 'Three terms, negatives, order of operations',
    terms: 3,
    operators: ['+', '-', '*'],
    range: [-20, 20],
    mulRange: [-12, 12],
    points: 20,
    timeLimitMs: 30_000,
  }),
  hard: Object.freeze({
    label: 'Hard',
    description: 'Four terms, wider ranges',
    terms: 4,
    operators: ['+', '-', '*'],
    range: [-25, 25],
    mulRange: [-15, 15],
    points: 30,
    timeLimitMs: 45_000,
  }),
});

export { WRONG_ANSWER_PENALTY };

/**
 * @param {string} key
 * @returns {Readonly<Difficulty>}
 */
export function getDifficulty(key) {
  if (!Object.hasOwn(DIFFICULTIES, key)) throw new RangeError(`Unknown difficulty: ${key}`);
  return DIFFICULTIES[key];
}
