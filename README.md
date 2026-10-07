# Quickfire

[![CI](https://github.com/IsaiahMar/mathWebApp/actions/workflows/ci.yml/badge.svg)](https://github.com/IsaiahMar/mathWebApp/actions/workflows/ci.yml)

A timed mental-arithmetic game. Pick a difficulty and solve randomly generated expressions against the clock.
Medium and Hard mix `+`, `−` and `×`, so you have to apply order of operations correctly.

## Features

- **Three difficulty tiers** defined as data (term count, operand ranges, points, time limit)
- **Precedence-aware expression engine**: a shunting-yard evaluator instead of hand-written case tables
- **Readable multiplication**: operands next to `×` come from a tighter range, so products stay mental-math sized
- **Per-question countdown** with a progress bar that warns in the final 25%
- **Scoring, streaks and persistent high scores** (via `localStorage`, with a fallback when storage is unavailable)
- **Accessible**: semantic HTML, keyboard play (<kbd>Enter</kbd> / <kbd>Esc</kbd>), live regions for screen readers, `prefers-reduced-motion` and dark mode support

## Getting started

No build step. The app is plain ES modules, so it must be served over HTTP (browsers block modules on `file://`).

```bash
npm install     # dev tooling only: ESLint + Prettier
npm start       # serves on http://localhost:3000
```

Any static server works, e.g. `python -m http.server`.

## Scripts

| Command          | Purpose                                        |
| ---------------- | ---------------------------------------------- |
| `npm test`       | Unit tests via the built-in `node:test` runner |
| `npm run lint`   | ESLint                                         |
| `npm run format` | Prettier (write)                               |
| `npm run check`  | Lint + format check + tests (what CI runs)     |

## Architecture

```
src/
├── game/
│   ├── expression.js   # generate, evaluate and format expressions (pure)
│   ├── difficulty.js   # difficulty presets
│   └── session.js      # GameSession: scoring, streaks, timing (no DOM)
├── ui/
│   └── app.js          # DOM rendering and event wiring
├── storage.js          # high-score persistence
└── main.js             # entry point
tests/                  # unit tests for everything under game/ and storage
```

The core design rule is **game logic never touches the DOM**. `GameSession` takes injectable `rng` and `clock`
functions, so scoring, timeouts and edge cases (such as resubmitting a solved question) are tested
deterministically, without a browser. `ui/app.js` is a thin layer that renders session state and forwards
user input.
