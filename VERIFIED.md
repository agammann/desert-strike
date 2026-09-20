# Verification

## Scope

Version 0.1.0 is a playable standalone fan recreation with four compact campaigns. It is not an exact original-game port. Differences and omitted original features are listed in [README.md](README.md).

## Checks performed

- **22 Node simulation tests passed.** These cover movement, bounds, diagonal speed, classic turning/thrust, gun/rocket ammunition, Hellfire tracking, automatic hover pickup, six-person capacity, delivery, supplies, finite Standard resources, replacement aircraft, and terminal failure.
- **Eight complete simulated campaigns passed:** all four campaigns in Standard and Relaxed. The autopilot uses normal From Above controls, without teleporting or boosting aircraft stats. This verifies reachability and completion logic; it is not a human difficulty study or a complete playthrough in every control mode.
- **Browser interaction checks passed** in installed Microsoft Edge through Playwright: launch, flight, all three weapons, tactical map pause, pause/resume, sound toggle, focus-loss pause, restart, and objective counters. No uncaught page errors were observed.
- **Desktop and mobile layout checks:** 1536 × 1024 desktop and 390 × 844 narrow screen; no horizontal document overflow. Touch controls rendered and responded to pointer input. Physical phone and gamepad testing was not performed.
- **Offline check:** opened the built standalone HTML through `file://`, launched the game, and moved the helicopter. The session made zero HTTP or HTTPS requests.
- **Build:** `node scripts/build.mjs` produced the single-file offline game and Pages entry point without installing packages.

The in-app browser initially blocked the local preview, so the browser checks and screenshots used a separate Edge test session. Audio controls and AudioContext setup were exercised, but sound was not independently assessed by listening.

## Visual review

The desktop and narrow-screen renders were inspected for the pixel-art palette, transparent sprite edges and complete sprite frames, title and control readability, battlefield/mission-panel alignment, instrument values, mobile controls, and overflow. The final design keeps chunky desert terrain, military sprites, an isometric treatment for buildings, and a dark compact interface. Rotor blades, projectiles, winch lines, targeting markers and brief effects are drawn by the engine so they can animate with game state.

The original concept's painted artwork, working title, three missions, four-person cabin and simplified weapons were intentionally replaced after the requested shift toward the 1992 game's style and mechanics. The original manual informed the control modes, supply limits, cabin capacity and lives. New terrain, sprite art, layouts and mission logic remain reinterpretations.

## Reproduce

```sh
node --test tests/simulation.test.cjs
node scripts/build.mjs
```

Open `dist/Desert-Strike.html` after disconnecting from the internet. Start a campaign, fly, fire all three weapons, open the map, pause/resume, collect a nearby supply and rescue crew. Standard mode needs supplies; Relaxed mode also restores resources at the frigate.

The GitHub Actions workflow reruns the simulation tests and build for each revision. Its visible run status is the source of truth for a particular published commit.
