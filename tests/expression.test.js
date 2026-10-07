import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { evaluate, formatExpression, generateExpression, randomInt } from '../src/game/expression.js';
import { sequenceRng } from './helpers.js';

describe('evaluate', () => {
  const cases = [
    [[2, 3], ['+'], 5],
    [[2, 3], ['-'], -1],
    [[2, 3], ['*'], 6],
    [[2, 3, 4], ['+', '*'], 14],
    [[2, 3, 4], ['*', '+'], 10],
    [[10, 3, 2], ['-', '-'], 5], // left-associative
    [[1, 2, 3, 4], ['*', '+', '*'], 14], // regression: previously returned undefined
    [[5, 2, 3, 4], ['-', '*', '*'], -19],
    [[5, 2, 3, 4], ['+', '*', '-'], 7],
    [[-3, -4, 2], ['*', '-'], 10],
  ];

  for (const [operands, operators, expected] of cases) {
    it(`${formatExpression({ operands, operators })} = ${expected}`, () => {
      assert.equal(evaluate({ operands, operators }), expected);
    });
  }

  it('regression: a + b × c uses b × c, not 0', () => {
    assert.equal(evaluate({ operands: [7, 3, 4], operators: ['-', '*'] }), -5);
  });

  it('rejects malformed expressions', () => {
    assert.throws(() => evaluate({ operands: [1, 2], operators: [] }), RangeError);
    assert.throws(() => evaluate({ operands: [], operators: [] }), RangeError);
    assert.throws(() => evaluate({ operands: [1, 2], operators: ['/'] }), TypeError);
  });

  it('agrees with JavaScript precedence on random expressions', () => {
    for (let i = 0; i < 500; i++) {
      const expr = generateExpression({ terms: 5, operators: ['+', '-', '*'], range: [-30, 30] });
      const js = expr.operands
        .map((n, j) => (j === 0 ? `(${n})` : `${expr.operators[j - 1]} (${n})`))
        .join(' ');
      assert.equal(evaluate(expr), Function(`return ${js}`)(), js);
    }
  });
});

describe('randomInt', () => {
  it('maps the rng range onto [min, max] inclusively', () => {
    assert.equal(
      randomInt(-5, 5, () => 0),
      -5,
    );
    assert.equal(
      randomInt(-5, 5, () => 0.999999),
      5,
    );
  });
});

describe('generateExpression', () => {
  it('produces the requested number of terms', () => {
    const expr = generateExpression({ terms: 4, operators: ['+'], range: [0, 9] });
    assert.equal(expr.operands.length, 4);
    assert.equal(expr.operators.length, 3);
  });

  it('uses mulRange for operands adjacent to ×', () => {
    for (let i = 0; i < 200; i++) {
      const expr = generateExpression({ terms: 3, operators: ['*'], range: [100, 200], mulRange: [1, 2] });
      assert.ok(expr.operands.every((n) => n >= 1 && n <= 2));
    }
  });

  it('is deterministic for a given rng', () => {
    const options = { terms: 3, operators: ['+', '-', '*'], range: [-10, 10] };
    assert.deepEqual(
      generateExpression(options, sequenceRng([0.1, 0.9, 0.5, 0.2, 0.7])),
      generateExpression(options, sequenceRng([0.1, 0.9, 0.5, 0.2, 0.7])),
    );
  });

  it('rejects fewer than two terms', () => {
    assert.throws(() => generateExpression({ terms: 1, operators: ['+'], range: [0, 1] }), RangeError);
  });
});

describe('formatExpression', () => {
  it('uses typographic operators', () => {
    assert.equal(formatExpression({ operands: [3, 4, 5], operators: ['*', '-'] }), '3 × 4 − 5');
  });

  it('parenthesises negative operands after the first', () => {
    assert.equal(formatExpression({ operands: [-2, -3], operators: ['-'] }), '−2 − (−3)');
  });
});
