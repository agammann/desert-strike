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

**This recreation currently has four campaigns and 27 objectives. Supergun is not implemented. It is not a complete one-to-one recreation of the supplied DOS CD edition.**

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

- The fifth campaign needs a complete standalone implementation and original playthrough verification.
- Other campaign placements, the first campaign's agent compound, guards, supplies, frigate and landing zones remain estimates. Newly corrected objective placements do not make every encounter exact.
- Terrain still uses the earlier Genesis map reconstruction with DOS tile artwork. The renderer scales and centers sprites differently from the DOS engine.
- Movement, acceleration, turning, projectile timing/range, scoring, rescue duration and scripted deadlines remain unmeasured. An emulator's wall-clock speed alone is not a reliable original-hardware timing reference.
- The existing music is from Mega Drive. DOS music and sound behavior have not been reproduced.
- The palace escape, bus escort, cinematics and password system still have the limitations recorded in [FIDELITY.md](FIDELITY.md).

Build and browser test results are recorded in [VERIFIED.md](../VERIFIED.md). Completion tests validate this implementation; they do not establish identical original difficulty.
