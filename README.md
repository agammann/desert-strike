# Desert Strike: Return to the Gulf

A standalone recreation by **agammann**, with a custom JavaScript engine, original DOS artwork and Mega Drive music. Play **35 objectives across all five campaigns in the supplied DOS CD edition**, including Supergun: intelligence captures, missile interceptions, rescues, the embassy bus escort, the nuclear bomber, and the capture of General Carranza.

**[Play now on Sites](https://desert-strike.alx21.chatgpt.site/)** · **[GitHub Pages](https://agammann.github.io/desert-strike/)** · **[Download the offline game](https://github.com/agammann/desert-strike/releases/latest/download/Desert-Strike-offline.zip)** · **[Get the source](https://github.com/agammann/desert-strike/archive/refs/heads/main.zip)**

No ROM, emulator, account, installation, or runtime download is needed. The offline release is one self-contained HTML game that opens in a modern browser.

**Fidelity status:** v0.6.0 is a playable five-campaign recreation, with more objective positions, armor values, supply locations and building artwork taken from the supplied DOS data. It is **not a verified one-to-one port**: movement, enemy scripts, scoring and some map details still differ or remain unmeasured. See the [DOS comparison](docs/DOS-COMPARISON.md) and [fidelity ledger](docs/FIDELITY.md).

![Desert Strike recreation: pixel-art helicopter approaching radar defenses, a landing zone, tactical map and aircraft instruments](docs/gameplay.png)

## Play offline

1. Download **Desert-Strike-offline.zip** above.
2. Extract the ZIP. On Windows, right-click it and choose **Extract All**.
3. Open **Desert-Strike.html** in Chrome, Edge, or Firefox. Windows users can also double-click **Play.cmd**.
4. Choose a campaign, copilot and control mode, then select **Launch operation**.

You can disconnect from the internet before opening the extracted game. Artwork, music, sound effects, missions, and code are all included. There is no local server to install or run.

## Controls

The game starts in **Standard / With Momentum**: finite supplies, documented enemy weapon values, and classic turn-and-thrust controls. **From Cockpit** responds more quickly to the throttle. For an easier first flight, choose **Relaxed / From Above**: WASD or arrow keys move in compass directions, and the copilot aims toward nearby targets when firing with J. In From Above mode, moving the mouse lets you aim manually with left click.

| Control | Action |
| :--- | :--- |
| **W / Up**, **S / Down** | Forward / reverse in classic modes; north / south in From Above |
| **A / Left**, **D / Right** | Turn in classic modes; west / east in From Above |
| **Shift + A / D** | Strafe without turning in classic modes |
| **J** or **left click** | Chain gun |
| **K** or **Space** | Hydra rockets |
| **L** | Hellfire missile; copilot can track a target ahead of the aircraft |
| **Hover over a person or crate** | Automatic rescue or supply pickup |
| **E** | Slow movement for precise pickup positioning |
| **M** | Open / close the tactical map; the action pauses |
| **P** or **Escape** | Pause / resume |
| **Enter** | Start / resume when the briefing is open |

On narrow screens, use the direction pad and **Gun / Hydra / Hellfire** buttons. A keyboard is recommended for classic flight controls. Switching tabs or windows pauses the game automatically. Sound starts muted; use **Sound off** to enable it. The title and selected campaign briefing play music; flight uses rotor and weapon sounds, with separate success, failure and ending tracks.

## Complete a campaign

Follow the **current mission** and numbered checklist beside the battlefield. The yellow map marker and edge arrow point toward the next objective. Press **M** to pause and inspect the full map. Use **Display** to select a mission, personnel, fuel, ammunition, repairs, landing zones or enemy weapons. Selected locations blink; the data panel shows the mission requirement or enemy armor and damage.

- Capture commanders and scientists to reveal hidden targets. Watch launch countdowns; opening a bunker or capturing a commander can trigger the next event.
- Stop shooting when people emerge. Hover to winch them aboard. The cabin holds **six**; deliver passengers at a marked **L** landing zone or the **H** frigate.
- Delivered personnel restore armor: 150 points each in Air Superiority, 100 in later campaigns, up to **600**. Ordinary MIAs are optional; the briefing identifies required rescues.
- In **Standard**, collect finite fuel, ammunition and repair crates scattered across the map. The frigate has no free fuel or ammo. Fuel is conserved over water. Some fuel and ammunition are concealed under destructible buildings and only appear on the map once exposed. Hidden caches also contain the quick winch and extra life. Stray fire can destroy fuel and ammunition.
- Keep clear of buildings: collisions take 10 armor from both the aircraft and object and briefly interrupt control. Circle mobile defenses, use heavy weapons carefully, and disable radar/power before attacking their protected positions. Enemy classes have different armor, damage, firing intervals, movement and aim.
- Start with **1,178 gun rounds, 38 Hydras, 8 Hellfires, and three lives**. Aircraft replacement retains passengers and ammunition. Losing every aircraft or failing a critical mission ends the operation.
- Ground missions temporarily take your copilot away, disabling automatic aiming and missile tracking. Use mouse aim or steer toward the target. For the bus, protect boarding officials from helicopter attacks, clear the gate, and fly beside it through the armor ambush.
- When every required mission is complete, **hover at the frigate** to finish. Continue to the next campaign from the results screen. Score carries forward rounded down to the nearest 1,000. The next campaign and score are saved in this browser when storage is available; **Continue operation** restores that checkpoint after reopening. This does not save an unfinished mission.

**Copilots:** X-Man has a fast winch, Aussie is balanced, Tracker offers stronger aim assistance, and Mr. D has weaker gunnery and a slower winch. Jake starts missing in action: find Valdez in campaign 1 or 2 and deliver him to the **frigate**, then choose Jake for your next operation. His unlock is remembered in this browser. Copilot assistance and pickup times are reconstruction settings.

**Relaxed** mode reduces damage and fuel use, lengthens mission timers, and restores resources at the frigate. Every campaign is selectable from the briefing.

| Campaign | Missions | Main operations |
| :--- | :---: | :--- |
| Air Superiority | 5 | Radar, power, airfields, commanders, secret-agent extraction |
| Scud Buster | 6 | Jail break, chemical complex, timed SCUD launches, POW rescue |
| Embassy City | 8 | Inspectors, biological silos, sea/yacht rescues, ambassador, bus escort |
| Nuclear Storm | 8 | Commandos, oil spills, shelters, bomb trucks, nuclear plant, palace, bomber |
| Supergun | 8 | Spy chain, airport, parts convoy, bribe, factories and guns, palace decoy, capture alive |

Read **[the campaign guide](docs/CAMPAIGNS.md)** for every objective, rescue threshold, timer and failure condition.

## How close is it to the original?

**v0.6.0 targets the supplied DOS CD edition**, which adds Supergun to the four-campaign game originally released in 1992. The fifth campaign follows the mission text recovered from that edition. Airport buildings, factories, gun emplacements, the official’s office, power station, palace and yacht use its object anchors.

The update also corrects earlier objectives—including Scud Buster’s chemical plant and power station—uses DOS fuel/ammunition/repair coordinates, and renders the original building scenery at its stored size and position. The palace ATV is indestructible, as described by the DOS briefing: follow the transfer, breach the bomber, recover the copilot, and finish the aircraft. The helicopter’s corrected directional rendering is retained.

The engine uses **60 fixed updates per second**. All five campaigns have automated completion tests in Standard and Relaxed. This demonstrates that this implementation can be completed; it does not establish identical original difficulty.

Exact flight coefficients, numeric scoring, patrols, collision geometry, rescue timing and mission deadlines remain unverified. Extra scenery currently serves as a visual backdrop; only mission objects and supply covers participate in combat. The first four terrain grids retain the Genesis-based reconstruction; Supergun’s grid is reconstructed from the DOS tactical map. Original DOS music, complete cinematics and passwords are not implemented. Supergun currently reuses the fourth Mega Drive briefing track. The [fidelity ledger](docs/FIDELITY.md) records these limitations explicitly.

Desert Strike: Return to the Gulf is Electronic Arts' original title. This is an unofficial fan recreation, not affiliated with or endorsed by Electronic Arts. No ROM, emulator or original executable is included. **Original artwork and music are not covered by the code's MIT license.** See **[artwork and music credits](THIRD_PARTY.md)** for the creators, extraction credits and source links.

## Build and verification

See **[BUILD.md](BUILD.md)** for the dependency-free build, local development and GitHub Actions deployment. See **[VERIFIED.md](VERIFIED.md)** for the checks performed and their limits. The source implementation is available under the [MIT license](LICENSE).

