import { DIFFICULTIES } from '../game/difficulty.js';
import { GameSession } from '../game/session.js';
import { createHighScoreStore } from '../storage.js';

/** Pause after a correct answer so the player sees the feedback. */
const ADVANCE_DELAY_MS = 700;
/** Below this fraction of time remaining the timer turns to a warning colour. */
const TIMER_WARNING_RATIO = 0.25;

/**
 * Wires the game model to the DOM. All game rules live in GameSession; this
 * module only renders state and translates user events into model calls.
 *
 * @param {Document} doc
 * @param {{ store?: ReturnType<typeof createHighScoreStore> }} [deps]
 */
export function createApp(doc, { store = createHighScoreStore() } = {}) {
  const screens = {
    home: doc.getElementById('screen-home'),
    game: doc.getElementById('screen-game'),
    results: doc.getElementById('screen-results'),
  };
  const difficultyList = doc.getElementById('difficulty-list');
  const questionEl = doc.getElementById('question');
  const feedbackEl = doc.getElementById('feedback');
  const form = doc.getElementById('answer-form');
  const input = /** @type {HTMLInputElement} */ (doc.getElementById('answer-input'));
  const submitBtn = form.querySelector('button[type="submit"]');

  /** @param {string} name */
  const bound = (name) => doc.querySelector(`[data-bind="${name}"]`);
  const prefersReducedMotion = () =>
    doc.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  /** @type {GameSession | null} */
  let session = null;
  let frameId = 0;
  let advanceTimeoutId = 0;

  // ---- Screens ---------------------------------------------------------------

  /** @param {keyof typeof screens} name */
  function showScreen(name) {
    for (const [key, el] of Object.entries(screens)) el.hidden = key !== name;
  }

  function showHome() {
    stopRound();
    renderDifficultyList();
    showScreen('home');
    difficultyList.querySelector('button')?.focus();
  }

  function renderDifficultyList() {
    const items = Object.entries(DIFFICULTIES).map(([key, difficulty]) => {
      const button = doc.createElement('button');
      button.type = 'button';
      button.className = `difficulty-card difficulty-${key}`;
      button.dataset.difficulty = key;
      button.append(
        el('span', 'difficulty-label', difficulty.label),
        el('span', 'difficulty-description', difficulty.description),
        el(
          'span',
          'difficulty-meta',
          `+${difficulty.points} pts · ${difficulty.timeLimitMs / 1000}s · best ${store.get(key)}`,
        ),
      );

      const li = doc.createElement('li');
      li.append(button);
      return li;
    });
    difficultyList.replaceChildren(...items);
  }

  /**
   * @param {string} tag
   * @param {string} className
   * @param {string} text
   */
  function el(tag, className, text) {
    const node = doc.createElement(tag);
    node.className = className;
    node.textContent = text;
    return node;
  }

  // ---- Round lifecycle -------------------------------------------------------

  /** @param {string} difficultyKey */
  function startRound(difficultyKey) {
    stopRound();
    session = new GameSession(difficultyKey);
    bound('difficulty').textContent = session.difficulty.label;
    screens.game.dataset.difficulty = difficultyKey;
    renderQuestion();
    renderStats();
    showScreen('game');
    input.focus();
    frameId = requestAnimationFrame(tick);
  }

  function stopRound() {
    cancelAnimationFrame(frameId);
    clearTimeout(advanceTimeoutId);
  }

  function finishRound() {
    stopRound();
    const isNewBest = store.record(session.difficultyKey, session.score);

    bound('last-prompt').textContent = session.question.prompt;
    bound('last-answer').textContent = String(session.question.answer);
    bound('final-score').textContent = String(session.score);
    bound('solved').textContent = String(session.solved);
    bound('best-streak').textContent = String(session.bestStreak);
    bound('high-score').textContent = String(store.get(session.difficultyKey));
    bound('new-best').hidden = !isNewBest;

    showScreen('results');
    screens.results.querySelector('[data-action="replay"]').focus();
  }

  function tick() {
    if (session.checkTimeout()) {
      finishRound();
      return;
    }
    renderTimer();
    frameId = requestAnimationFrame(tick);
  }

  // ---- Rendering -------------------------------------------------------------

  function renderQuestion() {
    questionEl.textContent = `${session.question.prompt} = ?`;
    feedbackEl.textContent = '';
    feedbackEl.dataset.tone = '';
    input.value = '';
    input.disabled = false;
    submitBtn.disabled = false;
  }

  function renderStats() {
    bound('score').textContent = String(session.score);
    bound('streak').textContent = String(session.streak);
  }

  function renderTimer() {
    const ratio = session.timeRemainingRatio;
    const timer = bound('timer');
    timer.style.setProperty('--progress', String(ratio));
    timer.setAttribute('aria-valuenow', String(Math.round(ratio * 100)));
    timer.classList.toggle('is-warning', ratio < TIMER_WARNING_RATIO);
    bound('time').textContent = `${Math.ceil(session.timeRemainingMs / 1000)}s`;
  }

  /**
   * @param {string} message
   * @param {'success' | 'error' | 'info'} tone
   */
  function showFeedback(message, tone) {
    feedbackEl.textContent = message;
    feedbackEl.dataset.tone = tone;
  }

  function shake(node) {
    if (prefersReducedMotion() || typeof node.animate !== 'function') return;
    node.animate(
      [0, -8, 8, -6, 6, 0].map((x) => ({ transform: `translateX(${x}px)` })),
      { duration: 320, easing: 'ease-out' },
    );
  }

  // ---- Event handlers ----------------------------------------------------------

  function handleSubmit(event) {
    event.preventDefault();
    const { outcome, delta } = session.submit(input.value);

    switch (outcome) {
      case 'correct':
        showFeedback(`Correct! +${delta}`, 'success');
        input.disabled = true;
        submitBtn.disabled = true;
        advanceTimeoutId = setTimeout(() => {
          session.nextQuestion();
          renderQuestion();
          input.focus();
        }, ADVANCE_DELAY_MS);
        break;
      case 'incorrect':
        showFeedback(`Not quite, try again (−${Math.abs(delta)})`, 'error');
        shake(form);
        input.select();
        break;
      case 'invalid':
        showFeedback('Enter a whole number, e.g. 42 or -7.', 'info');
        input.focus();
        break;
      case 'ignored':
        if (session.status === 'over') finishRound();
        break;
    }
    renderStats();
  }

  function handleAction(event) {
    const target = /** @type {HTMLElement} */ (event.target);
    const difficulty = target.closest('[data-difficulty]')?.getAttribute('data-difficulty');
    if (difficulty && target.closest('#difficulty-list')) {
      startRound(difficulty);
      return;
    }

    switch (target.closest('[data-action]')?.getAttribute('data-action')) {
      case 'quit':
      case 'home':
        showHome();
        break;
      case 'replay':
        startRound(session.difficultyKey);
        break;
    }
  }

  function handleKeydown(event) {
    if (event.key === 'Escape' && !screens.game.hidden) showHome();
  }

  return {
    mount() {
      form.addEventListener('submit', handleSubmit);
      doc.addEventListener('click', handleAction);
      doc.addEventListener('keydown', handleKeydown);
      showHome();
    },
  };
}
