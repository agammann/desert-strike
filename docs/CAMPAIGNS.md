# Campaign guide and fidelity notes

Version 0.3 implements **27 mission objectives in the original four-campaign structure**. The mission roles, intelligence dependencies, rescues, and major set pieces follow the 1992 game. It adds four maps at the Genesis reference dimensions and documented enemy weapon values. Placements, physics and balance remain a reconstruction; this is not a verified one-to-one port.

The numbered mission list recommends the original order. In campaigns 1–3, visible objectives can be tackled early; intelligence still gates hidden targets. Nuclear Storm reveals later assignments as earlier ones finish. After completing a campaign's objectives, hover at the frigate to finish.

## Air Superiority — 5 missions

| Mission | What to do in this version |
| :--- | :--- |
| 1. Radar sites | Destroy both radar installations. Active radar extends the range of linked local defenses. |
| 2. Power station | Cut power to weaken linked defenses' aiming, fire rate and protection. Recover the repair crate. |
| 3. Airfields | Destroy the hangar, tower and two aircraft at each of two fields. |
| 4. Command centers | Destroy both centers and capture at least one commander. His intelligence reveals the bunker. |
| 5. Secret agent | Breach the bunker, hover at LAND, and fight the three reinforcements while the copilot is inside. Winch the agent and copilot, deliver the agent, then return to the frigate. |

Ordinary MIAs provide score and armor when delivered; they are not all mandatory campaign objectives. Losing both commanders, the agent, or the copilot fails the campaign.

## Scud Buster — 6 missions

| Mission | What to do in this version |
| :--- | :--- |
| 1. Radar sites | Destroy three installations. |
| 2. Jail break | Breach three prisons and deliver at least 10 of 12 political prisoners. |
| 3. Power station | Destroy the station. |
| 4. Chemical weapons | Demolish the three production buildings. |
| 5. SCUD launchers | Capture a commander from each headquarters. Each capture reveals one timed launcher. Stop at least 5 of 6 launches. |
| 6. POW camp | Breach four huts and deliver at least 14 of 16 POWs. |

Do one intelligence-and-launcher pair at a time. Capturing several commanders starts several countdowns. Losing more than one commander or allowing more than one SCUD launch fails the campaign.

## Embassy City — 8 missions

| Mission | What to do in this version |
| :--- | :--- |
| 1. UN inspectors | Deliver at least 5 of 6 inspectors. Clear the nearby defense before hovering. |
| 2. Biological weapons | Destroy at least 6 of 8 plants and capture the lead chemist. |
| 3. Missile silos | Intelligence reveals four buried silos. Shoot each dune away, then destroy the exposed missile before launch. |
| 4. Lost at sea | Deliver at least two of three pilots. A rescued pilot identifies the power station. |
| 5. Power station | Disable the station. |
| 6. Madman's yacht | Breach the yacht. Twelve hostages enter the water gradually. Deliver at least seven and lose no more than five. |
| 7. Enemy ambassador | Destroy all four command buildings and capture the ambassador. |
| 8. Embassy rescue | Hover at the embassy. The copilot drives twelve officials onto the bus. Clear its gate and route; escort it to the SEAL camp. |

The bus moves when the helicopter is within 340 world units but more than 65 units away. Fly beside it. Route defenses stop it; hostile or friendly fire can destroy it. Auto-aim and Hellfire tracking are unavailable while the copilot is driving. He returns after the bus reaches safety.

## Nuclear Storm — 8 missions

| Mission | What to do in this version |
| :--- | :--- |
| 1. Oil fields | Stop the attacking tanks. Collect all six commandos and deliver them together to the one-use oil-field LZ. |
| 2. Oil spills | Shoot the small ends of three pipes to seal the leaks. |
| 3. Bomb shelters | Breach four shelters and deliver at least 15 of 16 civilians. |
| 4. Bomb parts | Destroy five trucks carrying red-marked bomb cargo. Preserve the green-marked civilian trucks. |
| 5. Nuclear plant | Destroy the plant and two towers; capture the scientist. |
| 6. Power station | Disable the palace's power station. |
| 7. Presidential palace | Breach the palace and hover at its entrance. The copilot enters and is captured. |
| 8. Nuclear bomber | Intercept before takeoff. Partway through the attack, stop firing and recover the escaping copilot. Destroy the bomber, then return to the frigate. |

Oil storage takes damage while enemy tanks survive, and from stray fire. Losing two storage tanks fails the mission. Landing a partial commando squad, losing an essential person, destroying two civilian trucks, or allowing bomber takeoff also fails.

## What matches, and what remains approximate

**Implemented:** the mission sequence above; distinct rescue roles; intelligence reveals; timed launches and drowning; six-passenger capacity; landing-zone delivery and armor recovery; three lives; three weapon inventories; fuel conservation over water; radar/power effects; quick winch; extra-life pickups; ground copilot missions; bus escort; oil protection; civilian truck identification; and bomber interception.

**Added in v0.3.0:** four separate maps at the reference image dimensions, reconstructed roads/coasts/landmarks, a longer embassy escort route, finite scattered supplies, hidden cache pickups, building collisions, strafing, local alert zones, distinct ground/air/boat behaviors, and enemy armor/damage/firing intervals from the Genesis manual. Standard / With Momentum is now the default.

**Reconstructed rather than exact:** road/coast vertices, building and defense placement, scenery density, speed, aiming, enemy AI, scoring, weapon ranges, fuel rate, alert multipliers, escort waypoints, and timer durations. Ground infiltration is represented by gameplay events rather than original cutscenes. The original palace escape vehicle is condensed into the bomber reveal. Copilot selection, passwords, original music, and mid-campaign saving are absent. The **[fidelity ledger](FIDELITY.md)** separates documented values from estimates and lists the map references.

**Timer settings in this version:** SCUDs 100 seconds Standard / 160 Relaxed after capture; silos 30 / 55 after exposure; hostages 100 / 150 after entering the water; bomber 150 / 240 after the palace trap. These are tested recreation settings, not measured original timings. Relaxed mode additionally reduces damage and fuel use and restores supplies at the frigate.

## Reference basis

- [Electronic Arts' Genesis manual, hosted by Sega](https://www.sega.jp/genesismini2/assets/manual/pdf/US_Desert-Strike.pdf): primary basis for campaign order, rescue and intelligence rules, original aircraft resources, and the first two Nuclear Storm assignments. The manual intentionally leaves later final-campaign assignments undisclosed.
- [Matt Keller's Genesis playthrough guide](https://gamefaqs.gamespot.com/sms/570266-desert-strike/faqs/20312): the page is filed under another platform, but the guide itself explicitly identifies Sega Mega Drive. Used to cross-check the first campaign's airfield and agent sequence.
- [Cosmão's illustrated Mega Drive playthrough](https://shugames.blogspot.com/2015/10/guia-completo-desert-strike-mega-drive.html): firsthand playthrough covering later campaigns and the palace/bomber ending. Where guide prose conflicts with the original manual, the manual takes priority. Thresholds and layout details that have not been independently measured against original hardware remain reconstruction choices.

No ROM, emulator, original executable, extracted game assets, or third-party game engine is included.
