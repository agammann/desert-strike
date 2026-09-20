# Desert Strike: Return to the Gulf

A standalone recreation of the 1992 helicopter game, built by **agammann** with a custom JavaScript game engine and newly drawn pixel artwork. Play through 27 mission objectives across the original four-campaign structure: intelligence captures, timed missile interceptions, rescues, the embassy bus escort, and the final bomber attack.

**[Play now on Sites](https://desert-strike.alx21.chatgpt.site/)** · **[GitHub Pages](https://agammann.github.io/desert-strike/)** · **[Download the offline game](https://github.com/agammann/desert-strike/releases/latest/download/Desert-Strike-offline.zip)** · **[Get the source](https://github.com/agammann/desert-strike/archive/refs/heads/main.zip)**

No ROM, emulator, account, installation, or runtime download is needed. The offline release is one self-contained HTML game that opens in a modern browser.

![Desert Strike recreation: pixel-art helicopter, coastal desert, frigate, mission map and aircraft instruments](docs/gameplay.png)

## Play offline

1. Download **Desert-Strike-offline.zip** above.
2. Extract the ZIP. On Windows, right-click it and choose **Extract All**.
3. Open **Desert-Strike.html** in Chrome, Edge, or Firefox. Windows users can also double-click **Play.cmd**.
4. Choose a campaign and control mode, then select **Launch operation**.

You can disconnect from the internet before opening the extracted game. Artwork, sound synthesis, missions, and code are all included. There is no local server to install or run.

## Controls

The game starts in **Relaxed / From Above** for an easier first flight. Select **Standard / With Momentum** for finite supplies and the original turn-and-thrust approach. **From Cockpit** responds more quickly to the throttle. **From Above** is easier to learn: WASD or arrow keys move in compass directions, and the copilot aims toward nearby targets when firing with J. In From Above mode, moving the mouse lets you aim manually with left click.

| Control | Action |
| :--- | :--- |
| **W / Up**, **S / Down** | Forward / reverse in classic modes; north / south in From Above |
| **A / Left**, **D / Right** | Turn in classic modes; west / east in From Above |
| **J** or **left click** | Chain gun |
| **K** or **Space** | Hydra rockets |
| **L** | Hellfire missile; tracks the nearby selected target |
| **Hover over a person or crate** | Automatic rescue or supply pickup |
| **E** | Slow movement for precise pickup positioning |
| **M** | Open / close the tactical map; the action pauses |
| **P** or **Escape** | Pause / resume |
| **Enter** | Start / resume when the briefing is open |

On narrow screens, use the direction pad and **Gun / Hydra / Hellfire** buttons. A keyboard is recommended for classic flight controls. Switching tabs or windows pauses the game automatically. Sound starts muted; use **Sound off** to enable it.

## Complete a campaign

Follow the **current mission** and numbered checklist beside the battlefield. The yellow map marker and edge arrow point toward the next objective. Press **M** to pause and inspect the full map.

- Capture commanders and scientists to reveal hidden targets. Watch launch countdowns; opening a bunker or capturing a commander can trigger the next event.
- Stop shooting when people emerge. Hover to winch them aboard. The cabin holds **six**; deliver passengers at a marked **L** landing zone or the **H** frigate.
- Delivered personnel restore armor: 150 points each in Air Superiority, 100 in later campaigns, up to **600**. Ordinary MIAs are optional; the briefing identifies required rescues.
- In **Standard**, collect fuel, ammunition and repair crates. The frigate has no free fuel or ammo. Fuel is conserved over water. Quick-winch and extra-life pickups are available.
- Start with **1,178 gun rounds, 38 Hydras, 8 Hellfires, and three lives**. Aircraft replacement retains passengers and ammunition. Losing every aircraft or failing a critical mission ends the operation.
- Ground missions temporarily take your copilot away, disabling automatic aiming and missile tracking. Use mouse aim or steer toward the target. For the bus, clear its route and fly beside it.
- When every required mission is complete, **hover at the frigate** to finish. Continue to the next campaign from the results screen.

**Relaxed** mode reduces damage and fuel use, lengthens mission timers, and restores resources at the frigate. Every campaign is selectable from the briefing.

| Campaign | Missions | Main operations |
| :--- | :---: | :--- |
| Air Superiority | 5 | Radar, power, airfields, commanders, secret-agent extraction |
| Scud Buster | 6 | Jail break, chemical complex, timed SCUD launches, POW rescue |
| Embassy City | 8 | Inspectors, biological silos, sea/yacht rescues, ambassador, bus escort |
| Nuclear Storm | 8 | Commandos, oil spills, shelters, bomb trucks, nuclear plant, palace, bomber |

Read **[the campaign guide](docs/CAMPAIGNS.md)** for every objective, rescue threshold, timer and failure condition.

## How close is it to the 1992 game?

Version **0.2.0** reconstructs the original campaign structure and major mission events. It replaces the first release's generic destroy-and-rescue objectives with role-based rescues, intelligence reveals, mission timers, escort behavior and specific failure conditions.

It is **not a verified one-to-one port**. Maps are compact original layouts sharing one terrain background. Artwork, audio, physics, enemy behavior, scoring, timers and balance are newly implemented. The original enemy roster, complete maps, cutscenes, palace escape vehicle, copilot selection, passwords, and building collisions are not fully reproduced. There is no mid-campaign save. See the [fidelity notes and reference sources](docs/CAMPAIGNS.md#what-matches-and-what-remains-approximate) for precise boundaries.

Desert Strike: Return to the Gulf is the title of Electronic Arts' original game. This is an unofficial fan recreation and is not affiliated with or endorsed by Electronic Arts. No original game files are included.

## Build and verification

See **[BUILD.md](BUILD.md)** for the dependency-free build, local development and GitHub Actions deployment. See **[VERIFIED.md](VERIFIED.md)** for the checks performed and their limits. The source implementation is available under the [MIT license](LICENSE).

