# Artwork and music credits

The JavaScript engine, browser interface, build scripts and tests are maintained by **agammann** under the MIT license in `LICENSE`. That license does **not** grant rights to the original game's artwork, music, title or trademarks.

## Original game assets

Desert Strike: Return to the Gulf was published by **Electronic Arts**. Original game assets remain the property of their respective rights holders. This repository does not claim ownership of them or an open-source license for them.

- **Sprites and terrain:** MS-DOS sprite sheets and 25 terrain tiles extracted by **DarkWolf**, from [The Spriters Resource collection](https://www.spriters-resource.com/ms_dos/desertstrikereturntothegulf/). Those sheets and tiles are retained unmodified under `assets/original/`. The renderer selects rectangles from those sheets and remaps terrain colors at runtime. These are DOS assets, not a claim of an identical Genesis sprite set.
- **Additional DOS artwork and object tables (v0.6.0):** `dos-buildings.png`, `dos-supergun.png`, `dos-cd_truck.png`, `dos-cd_bomb.png`, `dos-pickups.png` and `src/dos-data.js` derive from the user-supplied DOS CD edition. They remain original-game material, outside the MIT grant. A private format-inspection adapter used [OpenStrike](https://github.com/AMDmi3/openstrike), by Dmitry Marakasov, under GPL-3.0-or-later. Neither that adapter, OpenStrike code, the disc image nor original executable is included or required to build/play this repository.
- **Terrain layout references:** [DarkWolf's Genesis maps on VGMaps](https://www.vgmaps.com/Atlas/Genesis/). The fifth terrain grid is reconstructed from the supplied DOS `DASHMAP5` tactical image. The full reference images are not bundled. The game contains derived tile-layout and palette tables in `src/terrain-data.js`.
- **Music:** **Rob Hubbard and Brian Schmidt**, published by Electronic Arts. VGM package by **2ch-N / Project 2612**; audio conversion and archive upload by **archivologist**. Eight MP3 tracks come from the user-supplied [Internet Archive collection](https://archive.org/details/md_music_desert_strike_return_to_the_gulf): Title Theme, Mission Briefings 1–4, Campaign Clear, Mission Failed and Ending Theme. They are embedded in the offline build. In-flight rotor and weapon effects remain synthesized approximations.

The source URLs and download sizes are recorded in `assets/original/sources.json`. Availability on an archive or sprite site is not a statement that the material is public domain or licensed under MIT. No ROM, emulator or original game executable is included.

## Other artwork

`assets/sprites.png` contains the recreation's supplementary supply and landing-zone artwork. `assets/terrain.png` is retained from earlier versions and is not loaded by the game. The original game's complete cutscenes and all animation states are not reproduced.
