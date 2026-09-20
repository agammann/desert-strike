# Desert Strike: Return to the Gulf

A standalone recreation of the 1992 helicopter game, built by **agammann** with a custom JavaScript game engine and newly drawn pixel artwork. Fly desert sorties, destroy priority targets, recover stranded personnel, and make it back to the frigate.

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

- Destroy every priority site marked in red on the map. Tanks are optional threats; radar, power, airfield, command, missile and nuclear sites count toward the objective.
- Hover close to stranded crew until the winch completes. The cabin holds **six** people. Crew only count as delivered after you return them to the frigate marked **H**.
- Hover near the frigate to unload. Delivered crew repair armor: 150 points per person in the first campaign, 100 in later campaigns, up to **600**.
- In **Standard**, fuel and ammunition are finite. Hover over supplies to refill fuel, ammunition, or armor. The frigate does not provide free fuel or ammunition.
- Start with **1,178 gun rounds, 38 Hydras, 8 Hellfires, and three lives**. Destroying your aircraft consumes a life. The replacement retains passengers and ammunition. Losing all three aircraft ends the campaign.
- Destroy all required sites, deliver everyone, and return to the frigate to win. Then continue to the next campaign.

**Relaxed** mode reduces incoming damage and fuel use, and adds automatic resupply and repairs at the frigate. All four campaigns are selectable from the briefing: **Air Superiority**, **Scud Buster**, **Embassy City**, and **Nuclear Storm**.

## What this recreation includes

Four compact, reinterpreted campaigns; classic control options; three weapons; hover rescues; limited supplies; three lives; scrolling pixel-art scenery; a pausing tactical map; synthesized sound; desktop and touch controls; restart and campaign results.

This is **not an exact port or a pixel-for-pixel copy**. The layouts, mission scripts, sprite artwork, audio, enemy behavior and balance are newly implemented. Campaigns reuse a coastal terrain background with different target and rescue placements. Original cutscenes, passwords, copilot selection, building collisions, civilian penalties, and the original game's full scripted mission sequences are not implemented. There is no mid-campaign save; keep the tab open and pause, or restart a campaign from the briefing.

Desert Strike: Return to the Gulf is the title of Electronic Arts' original game. This is an unofficial fan recreation and is not affiliated with or endorsed by Electronic Arts. No original game files are included.

## Build and verification

See **[BUILD.md](BUILD.md)** for the dependency-free build, local development and GitHub Actions deployment. See **[VERIFIED.md](VERIFIED.md)** for the checks performed and their limits. The source implementation is available under the [MIT license](LICENSE).

