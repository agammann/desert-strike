# Verification

Version **0.4.0**, checked on **20 September 2026**. These checks establish completion and behavior of this standalone implementation. They do not establish identical difficulty, map placement or frame timing against the 1992 executable. The [fidelity ledger](docs/FIDELITY.md) records the remaining differences.

## Simulation

**44 tests passed**, including all four campaigns in both Standard and Relaxed. The test pilot reads state and emits movement, aim, fire and winch inputs. It never teleports, replenishes resources, skips objectives, changes timers or directly destroys targets. It knows the world state, including cache contents; it is a completion test, not a model of a new player's knowledge or skill.

Focused fixtures cover mission transitions and losses, documented weapon values, geography dimensions, finite resources, all three weapons, heading-preserving strafe, one-use commando delivery, escort behavior, timers and the bomber ending. New regressions cover one-center completion, three agent buildings, collision damage to both participants, interrupted steering, winch target changes, Valdez delivery/unlock, copilot differences, forward-only assisted aiming, hidden map objects, swept projectile collision, warnings, embassy boarding/ambushes, AAA radar immunity and the breached yacht obstacle.

Separate complete Standard simulation runs at **50 ms per update** also finished all four campaigns. An initial ambassador approach caused friendly fire; the pilot now approaches that building from the side opposite its exit. Damage rules were retained.

The managed local environment blocks the child process used by `node --test` (`spawn EPERM`). The same test file ran successfully in-process with:

```sh
node tests/campaigns.test.cjs
node scripts/build.mjs
```

GitHub Actions uses the ordinary `node --test tests/campaigns.test.cjs` command. Its result on the published commit is independent CI evidence.

## Browser campaigns

All four campaigns completed in **Standard / From Above / X-Man** in the in-app browser, using an isolated local QA page. The fixture loads the application source, observes the game, and dispatches ordinary keyboard and pointer events. It accelerates animation timestamps; the game's normal update/render loop handles every frame. It does not modify mission state or aircraft resources. The fixture and observer are not included in the game or release artifacts.

| Campaign | Completed objectives | Result | Uncaught errors |
| :--- | :---: | :--- | :---: |
| Air Superiority | 5/5 | Operation accomplished | 0 |
| Scud Buster | 6/6 | Operation accomplished | 0 |
| Embassy City | 8/8 | Operation accomplished | 0 |
| Nuclear Storm | 8/8 | Operation accomplished | 0 |

The first Embassy City attempt lost the ambassador to friendly fire. The completed rerun uses the safer approach described above. Neither the failed attempt nor simulation runs are substituted for a successful browser completion.

After Air Superiority, reloading showed **Continue operation 2 · 15,000 pts**, restored the rounded score, and launched Scud Buster. Next-operation transitions and the final completion screen were exercised.

## Interface and responsive checks

The ordinary local game was also checked separately from the automated fixture: launch, copilot selection, Hydra/Hellfire consumption, tactical-map opening, paused time, resource filtering and visible mission guidance. Desktop screenshots were inspected at the browser's 1280 × 720 viewport. No uncaught errors were reported.

A **390 × 844 iframe viewport** exercised the narrow-screen CSS. The briefing, copilot selector and launch button were visible, the final campaign showed one initial order plus seven concealed orders, and document width equaled scroll width (375 px excluding the scrollbar). No console errors or warnings were reported. The browser's viewport override did not change its actual dimensions, so it was reset; this iframe check is explicitly a layout test. The browser tool could not click controls inside the frame, so a fresh mobile interaction pass is not claimed. Physical phones are untested.

## Offline build

The dependency-free builder creates identical `dist/index.html` and `dist/Desert-Strike.html` files of approximately **1.4 MiB**. The sprite atlas, map data, scripts, styles and synthesized sound are embedded. Packaging validates that the ZIP contains the HTML, launcher, instructions and license, and that no QA harness is included.

The v0.3.0 standalone artifact previously launched through `file://` with zero HTTP/HTTPS requests. This turn's browser URL policy blocked a new direct-file launch, and separate Edge startup was blocked by `spawn EPERM`. That earlier offline run is not presented as a fresh v0.4.0 file-launch test. Current source gameplay, embedded build output and archive integrity are checked separately.

## Limits

Automated completion is not a human assessment of original difficulty. Full playthroughs use From Above controls; classic controls have focused movement/aim checks, not a full campaign run. Copilot profiles other than X-Man have focused checks, not a full campaign matrix. Original-console footage could not be played in this environment, so no frame-by-frame video comparison is claimed. Music, exact artwork/animations, original passwords and scoring, and the palace escape vehicle remain unmatched. Audio synthesis was not independently assessed by listening.
