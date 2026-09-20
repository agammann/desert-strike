# Fidelity ledger

The initial reference was **Desert Strike: Return to the Gulf for Genesis / Mega Drive (1992)**. The current target is the user-supplied **DOS CD edition**, including its fifth campaign, Supergun. **v0.6.0** implements five campaigns and 35 objectives. The [DOS comparison](DOS-COMPARISON.md) takes precedence for decoded object positions, armor and edition-specific rules. This is a standalone JavaScript engine, not a ROM/emulator wrapper or a verified one-to-one port. Tests establish this recreation’s behavior and completion, not identical original difficulty.

## Documented values

The [Electronic Arts manual hosted by Sega](https://www.sega.jp/genesismini2/assets/manual/pdf/US_Desert-Strike.pdf), especially its Weapons Appendix, supplies these enemy values. They are encoded in `src/reference.js` and covered by a regression test. Values below are for an ordinary enemy in Standard, outside an alert zone.

| Enemy | Armor | Damage per hit | Seconds between shots |
| :--- | ---: | ---: | ---: |
| AK-47 infantry | 10 | 5 | 0.50 |
| APHID infantry | 25 | 75 | 3.00 |
| AAA | 50 | 20 | 0.50 |
| Rapier | 75 | 100 | 2.50 |
| VDA | 100 | 25 | 0.33 |
| ZSU | 150 | 40 | 0.33 |
| Speedboat | 150 | 50 | 1.25 |
| Chopper | 150 | 100 | 1.50 |
| M48 | 200 | 100 | 2.50 |
| Crotale | 250 | 150 | 2.00 |

The player begins with 600 armor, 1,178 cannon rounds, 38 Hydras, eight Hellfires, three lives and a six-person cabin. Cannon/Hydra/Hellfire damage is 3/25/100. The quick ladder, extra-life pickups, and some fuel/ammunition are concealed in destructible buildings. The game preserves fuel over water and requires finite supply pickups in Standard.

The manual describes radar range alerts, power/aim alerts and increased damage, firing rate and effective armor inside alert zones. This implementation links specific guards to controllers. The **numeric multipliers are estimates**: radar range ×1.6, alert damage ×1.5, incoming damage divided by 1.5, and shot interval ×0.65. Power alerts accelerate turret tracking. Disabling the linked controller removes those bonuses. No claim is made that those multipliers equal the original program.

## Campaign geography

DarkWolf's [Genesis maps on VGMaps](https://www.vgmaps.com/Atlas/Genesis/) supply the layout reference. Version 0.5 matches each 512 × 512 region against the 25 original DOS terrain tiles supplied through The Spriters Resource. A campaign-specific palette is derived from corresponding pixels. The full reference map images are **not** distributed or loaded by the game.

| Campaign | Reference dimensions | Reconstructed features |
| :--- | :--- | :--- |
| [Air Superiority reference](https://www.vgmaps.com/Atlas/Genesis/DesertStrike-ReturnToTheGulf-Campaign1.png) | 6144 × 3072 | Southwest coast, inland roads, two airfield clusters, command centers and agent compound |
| [Scud Buster reference](https://www.vgmaps.com/Atlas/Genesis/DesertStrike-ReturnToTheGulf-Campaign2.png) | 6144 × 3584 | Longer coast, town blocks, northern chemical complex, southeastern POW compound |
| [Embassy City reference](https://www.vgmaps.com/Atlas/Genesis/DesertStrike-ReturnToTheGulf-Campaign3.png) | 6144 × 4096 | City road network, northwest biological facilities, embassy, eastern power station, yacht offshore |
| [Nuclear Storm reference](https://www.vgmaps.com/Atlas/Genesis/DesertStrike-ReturnToTheGulf-Campaign4.png) | 6144 × 4096 | Night palette, northwest runway, oil field, palace, northeast nuclear complex |

The DOS level block counts independently confirm these dimensions in stored screen-map coordinates. `src/terrain-data.js` contains the selected tile grids, palette maps and a water boundary sampled every 16 pixels. On a four-pixel sampling grid, reconstructed terrain agreed with reference pixels at 96.69%, 97.03%, 96.04% and 95.95% respectively. The comparison includes reference buildings that are not part of the terrain tiles, so **these are terrain-comparison statistics, not game-fidelity percentages**. The least separated first/second tile candidate differs by 0.78 percentage points; some populated blocks remain ambiguous.

v0.6.0 uses decoded building drawing anchors and dimensions across five campaigns, and corrects the major objective groups listed in the DOS comparison. Ordinary fuel/ammunition/repair anchors and starting positions also come from DOS records. Earlier guards, hidden-object triggers, landing zones and some mission objects remain estimates. Additional building scenery is visual only; its full original destruction and collision behavior is absent. The renderer uses original DOS artwork, with directional helicopter frames and distinct vehicle bodies/turrets. This does not establish identical animation cadence or collision shapes.

## Gameplay and difficulty changes

- Five full-size tile layouts replace the earlier procedural terrain. The closer camera and longer journeys make map reading and fuel planning more important.
- Mobile ground defenses pursue locally; boats stay on water, and helicopters can cross the coast. Turrets rotate rather than instantly firing in every direction. Their speeds, ranges, pursuit limits and tracking rates are estimates.
- Supplies are finite and scattered. Hidden caches must be destroyed before their pickups can be recovered. Rescue remains an alternative way to restore armor.
- Collidable buildings and scenery block the aircraft and inflict armor damage. The manual specifies 10 damage to each participant and a temporary loss of control (printed pp. 12–13). Collision shapes and the 0.35-second interruption are estimates.
- Standard / With Momentum is the default. Shift plus left/right strafes while preserving heading. From Above and Relaxed remain optional accessibility choices.
- The 35-objective structure, intelligence chain, timed attacks, hostage rescues, commando landing, oil protection, bus escort and bomber ending are described in [CAMPAIGNS.md](CAMPAIGNS.md).

## Manual comparison corrections in v0.4.0

The printed page numbers below refer to the original Genesis manual linked above.

| Reference | Previous discrepancy | Current behavior |
| :--- | :--- | :--- |
| pp. 6–7 | No copilot choice or Valdez rescue | Four initial choices; rescue Valdez and deliver him to the frigate to unlock Jake. |
| pp. 10–11 | Unfiltered map; two final-campaign orders initially visible | Mission/resource/personnel/weapon filters; only the first final-campaign order is initially revealed. Concealed supplies stay off the map. |
| pp. 12–13 | Collision only damaged the helicopter; incomplete warnings | Both objects lose 10 armor; temporary control interruption; fuel warnings at 14/12/10/etc.; armor warning at 125. |
| pp. 18–19 | 15 optional MIAs; AAA could inherit radar bonuses | 20 MIAs in campaign 1; AAA does not benefit from radar. |
| pp. 20–21 | Only special upgrades were hidden | Some ordinary fuel and ammunition now need their cover destroyed. Supply locations remain estimates. |
| pp. 22–23 | Visible duplicate power-station repair | One repair is revealed when the power station is destroyed. |
| pp. 26–27 | Both command centers required; one agent building | One center and one commander suffice. Three agent buildings, one concealing the trapdoor. |
| pp. 36–37 | Destroyed yacht stopped colliding | Breached yacht remains an obstacle during rescue. |
| pp. 42–43 | Score reset between operations | Next-operation score rounds down to thousands and survives browser reload when storage is available. The original password format is not implemented. |

Copilot numeric settings (person pickup seconds / forward aim cone in radians): X-Man 1.6 / 0.12, Aussie 2.2 / 0.24, Tracker 2.8 / 0.38, Mr. D 3.2 / 0.08, Jake 1.4 / 0.42. Without a copilot, pickup takes 3.2 seconds and aim assistance is unavailable. The quick winch uses 0.5 seconds. These values are openly recorded for later calibration. The [roster reference](https://strike-series.fandom.com/wiki/Co-Pilots) is secondary; the manual is the primary evidence for the selection/rescue system.

The embassy boarding attacks and route ambush remain reconstructed encounters. Nuclear Storm’s ATV is indestructible according to the supplied DOS briefing. Follow its journey, wait for the copilot transfer, breach the bomber, rescue the copilot and finish the aircraft. The route, 70-unit/s driving speed and 22-unit/s escorted walk remain estimates. Supergun includes the eight recovered mission roles; its trigger timing, convoy paths, civilian-driver quota and simplified general capture still need a measured original playthrough.

Supergun’s terrain is reconstructed from the 192 × 128 DOS tactical image using the existing terrain tiles. Ambiguous road/city tiles remain approximate. It does not inherit the four Genesis-map pixel agreement statistics above.

## Timing and scoring in v0.5.0

Browser rendering is decoupled from simulation: gameplay advances at 60 fixed steps per second. Regression runs at 30, 60 and 144 render frames per second produce identical positions, fuel consumption and weapon counts for the same held inputs. This removes display-rate drift; it does not measure the original console's flight coefficients.

The manual (printed p. 13) describes bonus rescues beyond a mission quota and deductions for friendly/civilian destruction. Both are implemented. The numerical table remains custom: 350 per enemy target, 150 per pickup, 500 per delivery, 250 per extra rescue above its quota, and a 500-point penalty for personnel/civilian/supply losses (clamped at zero total score). Cache covers and scenery award no target score. Enemy fire destroying a supply crate does not deduct player points. A completion report itemizes target, rescue, bonus and penalty totals. This is **not the original numeric score table**.

Original music accompanies the title, selected briefing, success, failure and ending screens. Flight uses synthesized rotor/weapon effects. Source credits and asset scope are in [THIRD_PARTY.md](../THIRD_PARTY.md).

## Directional artwork correction in v0.5.1

The source sprite sheets progress north through east to south; western views require horizontal mirroring. The Apache now follows that ordering, enemy turrets use all 24 directional frames, and eight-direction vehicles mirror correctly. The bus updates its heading along its route. Chopper frame offsets and Crotale frames are corrected, and the tank body no longer selects its wreck for the south-facing view. Player tracers share the aircraft visual elevation. These corrections align the supplied DOS art with gameplay headings; they do not establish an exact Genesis animation or ballistics match.

## Still estimated or missing

| Area | Current limitation |
| :--- | :--- |
| Difficulty | No side-by-side human run or original-console timing capture has calibrated the overall challenge. An automated pilot proves completion, not equivalent hardness. |
| Flight and weapons | Speed, acceleration, turning, projectile speeds/ranges, targeting and player firing cadence remain custom values; decoded building armor is listed in the DOS comparison. |
| Fuel | Standard consumes 0.36 units per second over land; Relaxed uses 0.18. These rates are not measurements of the original. |
| Timers | SCUD 100/160 s, silo 30/55 s, hostage 100/150 s, bomber 150/240 s in Standard/Relaxed. All are reconstruction settings. |
| Placement | Many objective and ordinary supply anchors now come from DOS records. Earlier guards, hidden-object triggers, patrols and some remaining mission objects still use estimates; not every original encounter is present. Vehicles now use distinct source sprite frames; their exact Genesis equivalents are unverified. |
| Missions | The palace escape and bomber transfer are implemented; path, protection rules and event timing remain unmeasured. Other cinematic events are condensed. |
| Presentation | Original DOS sprites and eight Mega Drive music tracks are included. Complete cutscenes, every animation state and original passwords are absent. Browser checkpoints replace password entry. No mid-campaign save. |
| Copilots | Roster and differing roles are implemented; numeric aim cones and pickup durations are estimates, not extracted values. |
| New mission events | Boarding one official per 1.5 seconds, two air attacks and two ambush tanks reconstruct the embassy sequence. Their exact counts, placement and timing are unmeasured. |

For a stricter comparison, record original-console routes with movement duration, resource consumption, enemy positions, trigger order and launch/drowning deadlines, then compare the same routes here. The remaining work is measured calibration, not merely increasing damage. Current test evidence is recorded in [VERIFIED.md](../VERIFIED.md).
