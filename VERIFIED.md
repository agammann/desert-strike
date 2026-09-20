# Verification

Version **0.5.2**, checked on **20 September 2026**. These checks establish completion and behavior of this standalone implementation. They do not establish identical difficulty, object placement or timing against the original executable. The [fidelity ledger](docs/FIDELITY.md) and [DOS comparison](docs/DOS-COMPARISON.md) record the remaining differences. Older checks below retain their version labels.

## Simulation

**53 tests passed** with `node --test tests/campaigns.test.cjs`, including all four campaigns in both Standard and Relaxed. The test pilot reads state and emits movement, aim, fire and winch inputs. It never teleports, replenishes resources, skips objectives, changes timers or directly destroys targets. It knows the world state, including cache contents; it is a completion test, not a model of a new player's knowledge or skill.

Focused regressions cover mission transitions and losses, documented weapon values, finite resources, heading-preserving strafe, collision damage, escorts, rescue quotas, copilots, hidden objects, swept projectile collision, warnings, embassy boarding and ambushes, and the breached yacht obstacle. New checks cover the palace vehicle journey, copilot transfer and bomber rescue; failure when the occupied vehicle is destroyed; civilian penalties and bonus rescues; final-campaign defenses and extra lives; and identical held-input flight, fuel and ammunition results at 30, 60 and 144 render frames per second.

An early automated approach to the nuclear scientist building caused friendly fire. The pilot now clears the radar controllers and approaches the building from the side opposite its exit. The game's damage rules were retained. All eight campaign/difficulty combinations then passed.

## Browser campaigns

In **v0.5.2**, the changed Air Superiority campaign completed again in Standard / From Above / X-Man through the rendered browser input loop: **5/5 objectives, 333.38 simulated seconds, three personnel delivered, zero uncaught errors**. All 18 airfield objects were required by the objective. The two new regressions verify that leaving the last airfield object alive prevents completion, entity IDs remain unique, and a 100-damage Hellfire destroys the corrected 100-armor radar. Power and command values were also checked. Browser automation used Playwright because the Browser plugin was unavailable. This does not measure DOS difficulty equivalence.

In v0.5.0, all four campaigns completed in **Standard / From Above / X-Man** in headless Microsoft Edge using Playwright. A local observer reads game state and dispatches ordinary keyboard and pointer events. Virtual animation time accelerates the run; the game's normal update/render loop handles the input. The observer does not modify mission state or aircraft resources and is not included in release artifacts.

| Campaign | Completed objectives | Result | Simulated flight time | Uncaught errors |
| :--- | :---: | :--- | ---: | :---: |
| Air Superiority | 5/5 | Operation accomplished | 348.45 s | 0 |
| Scud Buster | 6/6 | Operation accomplished | 835.72 s | 0 |
| Embassy City | 8/8 | Operation accomplished | 787.93 s | 0 |
| Nuclear Storm | 8/8 | Operation accomplished | 859.10 s | 0 |

These are automated route durations, not original-game benchmarks. The final campaign exercised the occupied escape vehicle, copilot disembarkation and boarding, empty-vehicle destruction, bomber breach, copilot rescue, aircraft destruction and return to the frigate.

## Directional rendering regression in v0.5.1

The reported backward-firing appearance was reproduced through ordinary mouse input. The projectile direction was correct, but the Apache sprite selected the opposite north/south view and did not mirror western views. The corrected frames were compared visually with the original supplied sprite sheet. North, northeast, east, southeast, south, southwest, west and northwest were exercised with cannon, Hydra and Hellfire fire (24 combinations); projectiles travelled along the selected heading. Both classic control modes also fired forward after turning. No uncaught errors were reported.

A renderer comparison additionally checked enemy turrets, helicopters, boats, the bus and escape vehicle. Fixes cover reversed enemy headings, western vehicle mirroring, the bus heading along its route, incorrect Crotale/chopper frame selection, a tank direction selecting a wreck, and player tracer height relative to the aircraft. Two new regression tests cover frame selection/projectile consistency and bus route-facing. The 51-test suite reruns all eight campaign/difficulty simulations; the four complete browser campaign runs above remain v0.5.0 evidence.

## Interface and responsive checks

Separate browser checks exercised launch, movement, all three weapons, tactical-map pause, pause/resume, sound toggle, automatic pause on focus loss and restart. Desktop (1536 × 1024) and mobile (390 × 844) checks passed without horizontal overflow or uncaught errors. The mobile pass pressed and held the touch direction pad. Screenshots of the briefing, gameplay and narrow layout were inspected. Physical phones remain untested.

A focused classic-control run checked the default Standard / With Momentum settings, turning, thrust and heading-preserving strafe. A separate flight inspected the reconstructed terrain and source sprite rendering. Full campaign automation uses From Above controls, so a complete classic-control campaign matrix is not claimed.

## Self-contained build and audio

The dependency-free builder produces identical `dist/index.html` and `dist/Desert-Strike.html` files of approximately **13.7 MiB**. Sprites, terrain tiles, eight music tracks, map data, scripts, styles and synthesized flight sounds are embedded. The offline ZIP includes the HTML, Windows launcher, instructions, code license and third-party credits.

The built HTML launched over local HTTP while every subresource request was blocked. Exactly one request—the HTML itself—was made. Flight and Hellfire use worked with no uncaught errors. Enabling sound started the title track; selecting each campaign played its briefing track, with exactly one active track. Launching flight stopped the music. Audio decoding and playback state were checked; independent listening and every result-screen track were not assessed.

This is a self-contained HTTP test, **not a fresh direct-file launch test**. A browser URL policy blocked a previous attempt to open `file://`; that restriction was not bypassed. The v0.3.0 artifact had previously passed a direct-file run, but that older evidence is not presented as a v0.5.0 result.

## Limits

Automated completion is not a human assessment of original difficulty. Copilots other than X-Man have focused tests rather than a full browser campaign matrix. No original-console frame-by-frame comparison is claimed. The supplied DOS sprites and Mega Drive music improve presentation, but exact Genesis animations, original numeric scores, complete cutscenes, passwords, dynamic-object placement and movement coefficients remain unmatched or unverified. Read the [fidelity ledger](docs/FIDELITY.md) before treating this as a one-to-one port.
