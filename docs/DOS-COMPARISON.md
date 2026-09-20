# Supplied DOS CD comparison

## Reference and scope

On 20 September 2026, a user-supplied archive named `Desert Strike -  Return to the Gulf (1994).zip` was inspected locally. It contains a MODE1/2352 BIN/CUE CD image with both Desert Strike and Jungle Strike. The filename alone does not establish the disc's exact release date or pressing. Findings below refer specifically to this supplied CD edition, not every DOS release.

The Desert Strike executable boots in a local WebAssembly DOSBox session. The title, setup menu, first-campaign briefing, takeoff and F2 mission information screens were inspected. This is not a completed original-game playthrough or a measurement of original frame timing. No disc image, executable, DOSBox runtime or extracted program code is distributed with the standalone recreation.

The disc's `DESERT.DAT` contains 290 entries. A local inspection adapter used [OpenStrike's GPL-3.0-or-later archive and level-format reader](https://github.com/AMDmi3/openstrike) to decode the archive. That adapter and OpenStrike source stay outside this repository; this engine does not use them at build time or runtime. Numeric landmarks below were transcribed from the resulting records, with resource names cross-checked against the supplied game's resource table.

## Confirmed edition difference: fifth campaign

The supplied game contains five level files and five campaign names. The additional campaign is **Supergun**, with these eight mission labels:

1. Spy
2. Airfield
3. Gun parts
4. Bribe official
5. Supergun site
6. Power station
7. General's palace
8. General's yacht

Its status text also refers to a corrupt agent, fortress and yacht. The fifth level has 159 building records and 214 unit records; unit records can represent people, supplies or scripted entities as well as enemies. Presence and labels are confirmed from the data, but its full trigger sequence and completion conditions have not been played through.

**v0.6.0 implements all five campaign outlines and 35 objectives.** Supergun follows the recovered mission prose and failure messages. Its full original trigger sequence has not been played through or decoded; the standalone sequence is detailed in [CAMPAIGNS.md](CAMPAIGNS.md).

## Corrections in v0.6.0

- **Original building art and anchors:** 103 building variants are assembled from the DOS tile graphics. Stored drawing offsets and dimensions position the scenery across all five levels. Objective buildings use the same artwork and anchors. Extra scenery is presently a backdrop, not a complete original collision/destruction system.
- **Earlier campaigns:** DOS anchors and health now place power stations, radars, command centers, jails, POW huts, biological plants, yacht, nuclear plant/towers/annex and palace. Scud Buster has one chemical-production target at (5929, 3370); its power station is (3769, 122). These were previously three estimated chemical buildings in the north and a station in the southeast.
- **Supplies and starts:** ordinary fuel, ammunition and repair counts/anchors, plus starting aircraft positions, come from the unit records. Concealed supplies are linked to nearby building covers; that proximity rule is reconstructed rather than decoded from the original event scripts. Mission-triggered repair rewards and some upgrades/MIAs/landing zones remain reconstruction choices.
- **Supergun airport:** four hangars, two towers and three transport aircraft. The gun objective has eight factories and two 400-armor guns at (1537, 79) and (1880, 343). Original truck, aircraft, gun and pickup artwork is included.
- **Supergun intelligence:** the contact leads to his brother; drivers lead to a corrupt official; a cash case is required for the bribe. The palace prisoner is a double, and the real general must be delivered alive from the yacht to the frigate.
- **Defenses:** Supergun uses a subset of DOS weapon records at their starting anchors. High-bit scripted records are excluded until their activation rules are understood. Earlier guards, patrols and reinforcements still use reconstructed placement/behavior. This is not a complete reproduction of original enemy spawning.
- **Nuclear Storm ending:** the F2 text describes the ATV as indestructible. It now ignores damage and is no longer a required demolition target. The copilot transfer, bomber breach and rescue remain reconstructed scripts.
- **Armor:** ordinary radar 100, power 400, command center 250, Scud commander headquarters 75, jail 150, POW hut 100, bio plant 200, shelter 200, bomb truck 100 and exposed silo 200. The DOS yacht building record has 150 health while its F2 text says 100; the implementation follows the building record and records the discrepancy rather than claiming both agree.

The recovered `FLICDATA` resource supplies the fifth campaign’s mission prose, intelligence messages and failure conditions. `LEVEL0`–`LEVEL4`, `THINGS` and the program’s resource table supply object identities, positions and artwork layouts. Only artwork and numeric object metadata are distributed; no DOS executable instructions or original event bytecode run in this game.

## Corrections in v0.5.2

Air Superiority now uses these DOS object anchors and health values. Anchors are not pixel-perfect sprite bounds or collision shapes.

| Object | Previous recreation | Corrected value |
| :--- | :--- | :--- |
| Radar | 200 armor, approximate coordinates | 100 armor; (1792, 688) and (2816, 1728) |
| Power station | 450 armor at (4320, 700) | 400 armor at (4281, 762) |
| Command centers | 300 armor at (3840, 1680) and (3840, 1920) | 250 armor at (5416, 819) and (5416, 1331) |
| Aircraft at the two airfields | Four total, 24 armor each | Twelve total, 20 armor each |
| Hangars | Two total, 195 armor each | Four total, 200 armor each |
| Airfield towers | Two total, 135 armor each | Two total, 150 armor each |

The F2 mission screen independently confirms radar armor 100, power-station armor 400, command-center armor 250, and the requirement to destroy all planes and buildings at the airfields. The complete 18-object airfield table is in `src/reference.js`. Both airfields must be cleared before the objective completes. Command-center destruction still releases a commander, and capture is still required.

## Remaining comparison work

- Play and measure the entire original DOS campaign sequence. The local original session covered title/setup, first briefing, takeoff, flight and F2 information, not all five campaigns.
- Decode mission activation, enemy spawning, patrol paths, hide/reveal rules, all collision shapes and wreck graphics. Some original sequences, including the general’s escape, are simplified.
- Replace the first four Genesis-derived terrain grids with verified DOS grids and verify Supergun’s tactical-map reconstruction. Stored object anchors alone do not establish pixel-perfect map rendering.
- Measure movement, acceleration, turning, projectile timing/range, numeric scoring, rescue duration and scripted deadlines. The current engine’s deterministic 60 Hz update is not evidence of identical original timing.
- Reproduce DOS audio, complete cinematics, original password behavior and remaining animation states. The current soundtrack is Mega Drive music; Supergun reuses briefing track four.

Build and browser test results are recorded in [VERIFIED.md](../VERIFIED.md). Completion tests validate this implementation; they do not establish identical original difficulty.
