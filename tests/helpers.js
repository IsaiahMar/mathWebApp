/**
 * Returns an rng that cycles through fixed values, for deterministic tests.
 *
 * @param {number[]} values  Each in [0, 1).
 */
export function sequenceRng(values) {
  let i = 0;
  return () => values[i++ % values.length];
}

/** A controllable clock for testing time-dependent code. */
export function fakeClock(start = 0) {
  let now = start;
  const clock = () => now;
  clock.advance = (ms) => {
    now += ms;
  };
  return clock;
}
