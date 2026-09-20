# Verification — v0.6.0

Checked on Windows with Node.js 24 and headless Microsoft Edge. This is a standalone five-campaign recreation. Successful tests establish its behavior and completion; they do not establish identical DOS timing or difficulty.

## Simulation

**63 tests pass**, including complete campaigns 1–5 in both Standard and Relaxed: **ten full input-driven simulation playthroughs**. The pilot reads state and emits normal controls; it does not set health, ammo, mission completion or win states. Focused tests use fixtures to check individual success/failure branches.

Coverage includes the intelligence chain, rescue quotas, finite supplies, collision damage, hidden pickup exposure, classic strafe, weapon values, swept projectiles, copilot effects, boarding/escort sequences, the indestructible ATV and bomber rescue, and fixed-step behavior at different rendering rates.

New regressions verify the five-campaign/35-objective structure, DOS objective anchors and counts, supplies linked to their covering building, the spy reveal, convoy activation/arrival failure, the required cash bribe, and capture alive with frigate-only delivery. Artwork tests prevent intact transports from selecting burning frames and preserve stored building drawing offsets. Apache heading/projectile regressions remain passing.

## Browser playthroughs

The browser harness uses normal keyboard/pointer events with a read-only state observer. Virtual time accelerates the normal game loop. Browser automation uses Playwright because the Browser plugin is unavailable. No observer or automation harness is included in the offline game.

Current v0.6.0 full-campaign browser results use **Standard / From Above / X-Man**:

| Campaign | Result | Objectives | Uncaught errors |
| :--- | :--- | :---: | :---: |
| Air Superiority | Operation accomplished | 5/5 | 0 |
| Scud Buster | Operation accomplished | 6/6 | 0 |
| Supergun | Operation accomplished | 8/8 | 0 |

Supergun completed at 1,220.67 simulated seconds with ten personnel delivered. The final general was delivered to the frigate. These are automated route results, not original-game benchmark times. An initial Scud Buster run with infrequent pilot input lost all aircraft; a subsequent normal-frame input run completed. Tests do not imply that arbitrary routes or frame-by-frame input sequences always win.

## Interface, rendering and offline build

Desktop **1536 × 1024** and mobile **390 × 844** checks passed: launch, movement, all weapons, map pause, pause/resume, sound, focus-loss pause, restart and touch direction controls. Neither viewport had horizontal overflow or uncaught errors. Physical phones remain untested. Screenshots were inspected. Static DOS scenery is cached in the terrain canvas and off-screen enemies/personnel are culled from drawing; the simulation continues normally off screen.

The self-contained HTML loaded over local HTTP with **every subresource request blocked**. Only the initial HTML was requested. All five briefing selections decoded audio with one active track; flight stopped the briefing music, and turning/firing worked. Supergun intentionally reuses the fourth Mega Drive briefing track. This is not a current direct-file launch test: an earlier browser URL policy blocked `file://`, and that restriction was not bypassed.

The dependency-free build embeds scripts, styles, artwork, terrain, object metadata and eight music tracks. The downloadable ZIP contains `Desert-Strike.html`, `Play.cmd`, instructions, the code license and third-party credits. A clean-checkout build and public artifact comparison are release checks.

## Limits

Complete campaign automation uses From Above, not a full classic-control/copilot matrix. The original DOS session covered title/setup, first briefing, takeoff, flight and mission information; it did not complete the original game. Object data and mission text were inspected separately. Original timing, scoring, complete collision geometry, enemy/event scripts, cutscenes, passwords and DOS audio remain partly reconstructed or absent. See [DOS-COMPARISON.md](docs/DOS-COMPARISON.md) and [FIDELITY.md](docs/FIDELITY.md).

