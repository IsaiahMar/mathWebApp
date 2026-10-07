/**
 * Arithmetic expression generation and evaluation.
 *
 * An expression is a flat infix sequence: operands[0] op[0] operands[1] op[1] ...
 * Evaluation honours standard operator precedence (× before + and −) and
 * left-associativity, so we never have to special-case operator combinations.
 */

/** @typedef {'+' | '-' | '*'} Operator */

/**
 * @typedef {object} Expression
 * @property {number[]} operands
 * @property {Operator[]} operators  Always operands.length - 1 entries.
 */

/** @type {Readonly<Record<Operator, number>>} */
const PRECEDENCE = Object.freeze({ '+': 1, '-': 1, '*': 2 });

/** @type {Readonly<Record<Operator, (a: number, b: number) => number>>} */
const APPLY = Object.freeze({
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '*': (a, b) => a * b,
});

/** @type {Readonly<Record<Operator, string>>} */
const DISPLAY_SYMBOL = Object.freeze({ '+': '+', '-': '−', '*': '×' });

export const OPERATORS = Object.freeze(/** @type {Operator[]} */ (Object.keys(PRECEDENCE)));

/**
 * Evaluates a flat infix expression using a two-stack (shunting-yard) reduction.
 *
 * @param {Expression} expression
 * @returns {number}
 */
export function evaluate({ operands, operators }) {
  if (operands.length === 0 || operands.length !== operators.length + 1) {
    throw new RangeError(`Malformed expression: ${operands.length} operands, ${operators.length} operators`);
  }

  const values = [operands[0]];
  /** @type {Operator[]} */
  const pending = [];

  const reduce = () => {
    const right = values.pop();
    const left = values.pop();
    values.push(APPLY[pending.pop()](left, right));
  };

  operators.forEach((op, i) => {
    if (!(op in APPLY)) throw new TypeError(`Unknown operator: ${op}`);
    while (pending.length > 0 && PRECEDENCE[pending.at(-1)] >= PRECEDENCE[op]) reduce();
    pending.push(op);
    values.push(operands[i + 1]);
  });

  while (pending.length > 0) reduce();
  return values[0];
}

/**
 * Returns a uniformly distributed integer in [min, max].
 *
 * @param {number} min
 * @param {number} max
 * @param {() => number} rng  Returns a float in [0, 1), like Math.random.
 */
export function randomInt(min, max, rng = Math.random) {
  return min + Math.floor(rng() * (max - min + 1));
}

/**
 * @typedef {object} GeneratorOptions
 * @property {number} terms                 Number of operands (>= 2).
 * @property {Operator[]} operators         Operators to choose from.
 * @property {[number, number]} range       Inclusive range for +/− operands.
 * @property {[number, number]} [mulRange]  Tighter range for operands touching ×,
 *                                          which keeps products solvable mentally.
 */

/**
 * Builds a random expression. Pure given `rng`, which makes it deterministic in tests.
 *
 * @param {GeneratorOptions} options
 * @param {() => number} [rng]
 * @returns {Expression}
 */
export function generateExpression({ terms, operators, range, mulRange = range }, rng = Math.random) {
  if (terms < 2) throw new RangeError('An expression needs at least two terms');

  const ops = Array.from({ length: terms - 1 }, () => operators[randomInt(0, operators.length - 1, rng)]);
  const touchesMultiply = (i) => ops[i - 1] === '*' || ops[i] === '*';
  const operands = Array.from({ length: terms }, (_, i) => {
    const [min, max] = touchesMultiply(i) ? mulRange : range;
    return randomInt(min, max, rng);
  });

  return { operands, operators: ops };
}

/**
 * Renders an expression for humans, e.g. `7 × (−3) + 2`.
 * Negative operands after the first are parenthesised so `5 − −3` never appears.
 *
 * @param {Expression} expression
 * @returns {string}
 */
export function formatExpression({ operands, operators }) {
  const formatOperand = (n, i) => {
    const text = n < 0 ? `−${Math.abs(n)}` : String(n);
    return n < 0 && i > 0 ? `(${text})` : text;
  };

  return operands
    .map((n, i) =>
      i === 0 ? formatOperand(n, i) : `${DISPLAY_SYMBOL[operators[i - 1]]} ${formatOperand(n, i)}`,
    )
    .join(' ');
}
