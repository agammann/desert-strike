# Verification

Version **0.3.0**, checked on **20 September 2026**, reconstructs 27 objectives across four campaigns with expanded maps and documented enemy weapon values. Gameplay completion and original-game fidelity are separate claims: the checks below establish that this implementation works; the [fidelity ledger](docs/FIDELITY.md) records its reference basis and remaining differences.

## Automated simulation

**32 tests passed**, including eight complete control-driven playthroughs: every campaign in both Standard and Relaxed. The full-playthrough pilot reads game state and emits ordinary movement, aim, fire and winch inputs. It does not teleport, replenish resources, skip objectives, change timers, or directly destroy targets.

Focused tests separately set up fixtures for mission transitions and failure cases: commander intelligence, SCUD launches, silo exposure, drowning, bus clearance/proximity/delivery/destruction, one-use commando landing, civilian trucks, the palace trap, bomber takeoff, copilot recovery, fuel over water, life replacement, supply limits, winch capacity and landing-zone repair. Fixture tests are not presented as complete playthroughs.

New checks cover the manual's ten enemy armor/damage/cadence profiles, all four reference map dimensions, building collision damage, heading-preserving strafing, hidden cache exposure, radar range bonuses and power-assisted turret tracking. Separate complete simulation runs also finished all four Standard campaigns at a 50 ms update interval.

## Browser gameplay

All four campaigns completed in **Standard / From Above** in Microsoft Edge through automated keyboard and pointer events. A read-only state observer guided those inputs; an accelerated browser clock advanced ordinary animation frames. No mission state or aircraft resources were changed by the browser pilot.

| Campaign | Completed objectives | Final result | Uncaught page errors |
| :--- | :---: | :--- | :---: |
| Air Superiority | 5/5 | Operation accomplished | 0 |
| Scud Buster | 6/6 | Operation accomplished | 0 |
| Embassy City | 8/8 | Operation accomplished | 0 |
| Nuclear Storm | 8/8 | Operation accomplished | 0 |

Scud Buster and Embassy City were repeated after correcting their local power links. Both completed again with no uncaught page errors, using keyboard/pointer input with animation frames spaced approximately 48 ms apart. These runs also exercised the larger maps at a lower frame rate. No game state was advanced directly by either browser pilot.

The in-app browser also launched the updated game and displayed the mission list. The longer repeatable control sequences used a separate Edge session because the in-app automation API does not provide sustained key-down/key-up controls.

Additional browser checks passed: launch, movement, all three weapons, map pausing time, pause/resume, sound toggle, focus-loss pause, restart, objective counters, touch-control pointer input, and no horizontal overflow at 1536 × 1024 and 390 × 844. Desktop and narrow-screen screenshots were visually inspected.

The default **Standard / With Momentum** selection, turn, forward thrust and Shift-strafe were checked through browser keyboard events. Strafing moved the aircraft sideways while preserving its heading. The tactical map now draws immediately when opened; this was checked visually in the in-app browser with no console warnings or errors.

## Offline and build

The dependency-free builder produced both `dist/index.html` and `dist/Desert-Strike.html`, approximately **1.4 MB** each. The standalone artifact opened through `file://`, launched and flew with **zero HTTP or HTTPS requests**. The sprite atlas, reconstructed map data, scripts, styles, and synthesized sound are embedded. The unused legacy terrain image is no longer part of the build.

```sh
node --test tests/campaigns.test.cjs
node scripts/build.mjs
```

GitHub Actions reruns these commands for each revision. The workflow result on the exact published commit is the current CI evidence.

## Limits

Automated completion is not a human difficulty assessment. Full playthroughs were tested with From Above controls; classic turn-and-thrust movement has a focused check, not a complete campaign run. Physical phones, gamepads, and every browser were not tested. Audio controls were exercised, but sound was not independently assessed by listening. The recreation was not compared frame by frame against an original console playthrough; timings, layouts, enemies and other differences are listed in the campaign guide.
