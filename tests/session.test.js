import { beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { GameSession, parseAnswer } from '../src/game/session.js';
import { DIFFICULTIES, WRONG_ANSWER_PENALTY, getDifficulty } from '../src/game/difficulty.js';
import { fakeClock } from './helpers.js';

describe('parseAnswer', () => {
  it('accepts integers with optional ASCII or Unicode minus', () => {
    assert.equal(parseAnswer('42'), 42);
    assert.equal(parseAnswer('  -7 '), -7);
    assert.equal(parseAnswer('−7'), -7);
    assert.equal(parseAnswer('0'), 0);
  });

  it('rejects anything that is not a whole number', () => {
    for (const raw of ['', ' ', '12abc', '1.5', '--3', 'abc', '1e3']) {
      assert.equal(parseAnswer(raw), null, raw);
    }
  });
});

describe('getDifficulty', () => {
  it('rejects unknown keys, including prototype properties', () => {
    assert.throws(() => getDifficulty('impossible'), RangeError);
    assert.throws(() => getDifficulty('toString'), RangeError);
  });
});

describe('GameSession', () => {
  let clock;
  let session;

  beforeEach(() => {
    clock = fakeClock();
    session = new GameSession('medium', { clock });
  });

  it('awards difficulty points and builds a streak on correct answers', () => {
    const result = session.submit(String(session.question.answer));
    assert.deepEqual(result, { outcome: 'correct', delta: DIFFICULTIES.medium.points });
    assert.equal(session.score, DIFFICULTIES.medium.points);
    assert.equal(session.streak, 1);
    assert.equal(session.solved, 1);
  });

  it('ignores repeat submissions of a solved question (no point farming)', () => {
    session.submit(String(session.question.answer));
    assert.equal(session.submit(String(session.question.answer)).outcome, 'ignored');
    assert.equal(session.score, DIFFICULTIES.medium.points);
  });

  it('penalises wrong answers and resets the streak', () => {
    session.submit(String(session.question.answer));
    session.nextQuestion();
    const result = session.submit(String(session.question.answer + 1));
    assert.deepEqual(result, { outcome: 'incorrect', delta: -WRONG_ANSWER_PENALTY });
    assert.equal(session.streak, 0);
    assert.equal(session.bestStreak, 1);
  });

  it('does not penalise unparseable input', () => {
    assert.equal(session.submit('abc').outcome, 'invalid');
    assert.equal(session.score, 0);
  });

  it('ends the session when the question times out', () => {
    clock.advance(DIFFICULTIES.medium.timeLimitMs - 1);
    assert.equal(session.checkTimeout(), false);
    clock.advance(1);
    assert.equal(session.checkTimeout(), true);
    assert.equal(session.status, 'over');
    assert.equal(session.submit(String(session.question.answer)).outcome, 'ignored');
  });

  it('does not time out while a solved question awaits the next one', () => {
    session.submit(String(session.question.answer));
    clock.advance(DIFFICULTIES.medium.timeLimitMs * 2);
    assert.equal(session.checkTimeout(), false);
    assert.equal(session.status, 'playing');
  });

  it('resets the clock for each new question', () => {
    clock.advance(DIFFICULTIES.medium.timeLimitMs / 2);
    session.nextQuestion();
    assert.equal(session.timeRemainingMs, DIFFICULTIES.medium.timeLimitMs);
    assert.equal(session.timeRemainingRatio, 1);
  });
});
