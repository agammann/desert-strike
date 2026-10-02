# Verification — v0.6.1

## October 2, 2026 review

Checked on Windows with Node.js 24.19.0 and Microsoft Edge 154.0.4258.48. All **63 simulation tests passed**, including the ten complete input-driven campaigns described below. The simulation and campaign rules are unchanged in this patch.

The actual downloaded **v0.6.0** offline ZIP was extracted and its HTML matched a fresh source build byte for byte. Opening that file directly with browser networking disabled reproduced two keyboard defects: Space did not activate Launch, and Space on Pause consumed a Hydra instead of pausing. In v0.6.1, Space activates the focused button; focused direction and weapon buttons also support holding Space or Enter, releasing the control on key release or loss of focus.

The corrected self-contained HTML passed direct-file checks with networking disabled: keyboard launch, pause/resume with unchanged rocket count, movement, all three weapons, map pause/filter/close, sound toggle, restart, and keyboard direction/weapon button holds and releases. Only the local HTML was requested; there were no uncaught page errors. Widths of **1440, 390 and 320 pixels** had no horizontal overflow. The 320-pixel review found and corrected overflowing mission/map panels.

An actual tab switch in a separate headed Edge session paused the game and preserved the pause on return. The observer recorded a browser-generated, trusted blur event. This check disabled Playwright's focus emulation, which had masked blur in the initial automation attempts. A separate controlled blur-event check also passed. Browser automation uses Playwright because the Browser plugin is unavailable; no test observer is included in the game.

These checks establish the reviewed Windows browser and offline behavior. Physical phones, other browser engines and the complete control/copilot matrix were not rerun. The full browser campaign results below are retained from the earlier v0.6.0 review, not claimed as fresh v0.6.1 runs.

## Earlier v0.6.0 verification

Checked on Windows with Node.js 24 and headless Microsoft Edge. This is a standalone five-campaign recreation. Successful tests establish its behavior and completion; they do not establish identical DOS timing or difficulty.

## Simulation

**63 tests pass**, including complete campaigns 1–5 in both Standard and Relaxed: **ten full input-driven simulation playthroughs**. The pilot reads state and emits normal controls; it does not set health, ammo, mission completion or win states. Focused tests use fixtures to check individual success/failure branches.

Coverage includes the intelligence chain, rescue quotas, finite supplies, collision damage, hidden pickup exposure, classic strafe, weapon values, swept projectiles, copilot effects, boarding/escort sequences, the indestructible ATV and bomber rescue, and fixed-step behavior at different rendering rates.

New regressions verify the five-campaign/35-objective structure, DOS objective anchors and counts, supplies linked to their covering building, the spy reveal, convoy activation/arrival failure, the required cash bribe, and capture alive with frigate-only delivery. Artwork tests prevent intact transports from selecting burning frames and preserve stored building drawing offsets. Apache heading/projectile regressions remain passing.

## Browser playthroughs

The browser harness uses normal keyboard/pointer events with a read-only state observer. Virtual time accelerates the normal game loop. Browser automation uses Playwright because the Browser plugin is unavailable. No observer or automation harness is included in the offline game.

The earlier v0.6.0 full-campaign browser results use **Standard / From Above / X-Man**:

| Campaign | Result | Objectives | Uncaught errors |
| :--- | :--- | :---: | :---: |
| Air Superiority | Operation accomplished | 5/5 | 0 |
| Scud Buster | Operation accomplished | 6/6 | 0 |
| Supergun | Operation accomplished | 8/8 | 0 |

Supergun completed at 1,220.67 simulated seconds with ten personnel delivered. The final general was delivered to the frigate. These are automated route results, not original-game benchmark times. An initial Scud Buster run with infrequent pilot input lost all aircraft; a subsequent normal-frame input run completed. Tests do not imply that arbitrary routes or frame-by-frame input sequences always win.

## Interface, rendering and offline build

Desktop **1536 × 1024** and mobile **390 × 844** checks passed: launch, movement, all weapons, map pause, pause/resume, sound, focus-loss pause, restart and touch direction controls. Neither viewport had horizontal overflow or uncaught errors. Physical phones remain untested. Screenshots were inspected. Static DOS scenery is cached in the terrain canvas and off-screen enemies/personnel are culled from drawing; the simulation continues normally off screen.

In that earlier review, the self-contained HTML loaded over local HTTP with **every subresource request blocked**. Only the initial HTML was requested. All five briefing selections decoded audio with one active track; flight stopped the briefing music, and turning/firing worked. Supergun intentionally reuses the fourth Mega Drive briefing track. That review did not test direct-file launch because its browser URL policy blocked `file://`; the separate October 2 direct-file result is recorded above.

The dependency-free build embeds scripts, styles, artwork, terrain, object metadata and eight music tracks. The downloadable ZIP contains `Desert-Strike.html`, `Play.cmd`, instructions, the code license and third-party credits. A clean-checkout build and public artifact comparison are release checks.

## Limits

Complete campaign automation uses From Above, not a full classic-control/copilot matrix. The original DOS session covered title/setup, first briefing, takeoff, flight and mission information; it did not complete the original game. Object data and mission text were inspected separately. Original timing, scoring, complete collision geometry, enemy/event scripts, cutscenes, passwords and DOS audio remain partly reconstructed or absent. See [DOS-COMPARISON.md](docs/DOS-COMPARISON.md) and [FIDELITY.md](docs/FIDELITY.md).

