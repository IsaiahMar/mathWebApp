import { evaluate, formatExpression, generateExpression } from './expression.js';
import { WRONG_ANSWER_PENALTY, getDifficulty } from './difficulty.js';

/**
 * @typedef {object} Question
 * @property {string} prompt  Human-readable expression, e.g. `3 × 4 + 1`.
 * @property {number} answer
 */

/** @typedef {'playing' | 'over'} SessionStatus */

/**
 * @typedef {object} SubmitResult
 * @property {'correct' | 'incorrect' | 'invalid' | 'ignored'} outcome
 * @property {number} delta  Change in score caused by this submission.
 */

/**
 * Parses user input into an integer. Accepts a leading ASCII or Unicode minus.
 * Unlike `parseInt`, rejects partial matches such as `"12abc"`.
 *
 * @param {string} raw
 * @returns {number | null}
 */
export function parseAnswer(raw) {
  const normalised = String(raw).trim().replace(/^[−–]/, '-');
  return /^-?\d+$/.test(normalised) ? Number(normalised) : null;
}

/**
 * One play-through at a fixed difficulty. Holds no DOM references, and time and
 * randomness are injected, so the full game loop is unit-testable.
 */
export class GameSession {
  /** @type {SessionStatus} */
  status = 'playing';
  score = 0;
  streak = 0;
  bestStreak = 0;
  solved = 0;
  /** @type {Question} */
  question;
  /** True once the current question is answered; its clock no longer matters. */
  questionSolved = false;

  #rng;
  #clock;
  #deadline = 0;

  /**
   * @param {string} difficultyKey
   * @param {{ rng?: () => number, clock?: () => number }} [deps]
   */
  constructor(difficultyKey, { rng = Math.random, clock = () => performance.now() } = {}) {
    this.difficultyKey = difficultyKey;
    this.difficulty = getDifficulty(difficultyKey);
    this.#rng = rng;
    this.#clock = clock;
    this.nextQuestion();
  }

  nextQuestion() {
    const expression = generateExpression(this.difficulty, this.#rng);
    this.question = { prompt: formatExpression(expression), answer: evaluate(expression) };
    this.questionSolved = false;
    this.#deadline = this.#clock() + this.difficulty.timeLimitMs;
  }

  /** Milliseconds left for the current question, clamped at zero. */
  get timeRemainingMs() {
    return Math.max(0, this.#deadline - this.#clock());
  }

  /** Fraction of the time limit remaining, in [0, 1]. */
  get timeRemainingRatio() {
    return this.timeRemainingMs / this.difficulty.timeLimitMs;
  }

  /**
   * Ends the session if the current question has run out of time.
   *
   * @returns {boolean} true if this call ended the session.
   */
  checkTimeout() {
    if (this.status !== 'playing' || this.questionSolved || this.timeRemainingMs > 0) return false;
    this.end();
    return true;
  }

  end() {
    this.status = 'over';
  }

  /**
   * @param {string} rawInput
   * @returns {SubmitResult}
   */
  submit(rawInput) {
    if (this.status !== 'playing' || this.questionSolved || this.checkTimeout()) {
      return { outcome: 'ignored', delta: 0 };
    }

    const guess = parseAnswer(rawInput);
    if (guess === null) return { outcome: 'invalid', delta: 0 };

    if (guess === this.question.answer) {
      const delta = this.difficulty.points;
      this.score += delta;
      this.solved += 1;
      this.questionSolved = true;
      this.streak += 1;
      this.bestStreak = Math.max(this.bestStreak, this.streak);
      return { outcome: 'correct', delta };
    }

    this.score -= WRONG_ANSWER_PENALTY;
    this.streak = 0;
    return { outcome: 'incorrect', delta: -WRONG_ANSWER_PENALTY };
  }
}
