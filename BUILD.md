# Build Desert Strike

Requires **Node.js 20 or newer** to build and test. Playing a release only requires a browser. There are no npm packages to install and no emulator, ROM, external game engine, remote font, or CDN script.

```sh
git clone https://github.com/agammann/desert-strike.git
cd desert-strike
node --test tests/campaigns.test.cjs
node scripts/build.mjs
```

Open `dist/Desert-Strike.html`. The builder embeds the sprite sheets, terrain tiles, eight MP3 tracks, map data, CSS, and JavaScript into a single file. `dist/index.html` is the equivalent GitHub Pages entry point. Use the local server below to run the unbuilt source; its terrain palette conversion reads local images through canvas. The built HTML embeds those images and needs no server.

## Development

```sh
node scripts/serve.mjs
```

Open `http://127.0.0.1:4173`. The server binds only to loopback. Press Ctrl+C to stop it. Set `PORT` to choose a different port.

| File | Responsibility |
| :--- | :--- |
| `src/terrain-data.js` | Matched 512-pixel terrain grid, campaign palettes and sampled coast boundaries |
| `src/original-art.js` | Original sprite frame selection and terrain composition |
| `assets/original/` | Original sprite sheets, tiles and music; see THIRD_PARTY.md |
| `src/reference.js` | Copilot profiles, weapon table, map geometry, landmark placements, defenses and supply distribution |
| `src/campaigns.js` | Mission definitions, intelligence, scripted events, escorts, timers and campaign success/failure |
| `src/simulation.js` | Flight physics, combat, winch, supplies, damage and lives |
| `src/game.js` | Canvas rendering, input, music playback, synthesized effects, HUD, map, pause and menus |
| `src/style.css` | Desktop/mobile game interface |
| `assets/terrain.png` | Legacy v0.1/v0.2 terrain artwork; no longer loaded or included in builds |
| `assets/sprites.png` | Supplementary recreated supply and landing-zone atlas |
| `scripts/build.mjs` | Creates the standalone offline and Pages HTML |
| `tests/campaigns.test.cjs` | Mission transitions, failure cases, resources and eight complete playthroughs |
| `tests/pilot.cjs` | A read-only test pilot that emits ordinary player inputs |

## GitHub builds

`.github/workflows/pages.yml` runs tests and builds on pushes to `main` and pull requests. Each build uploads the self-contained HTML as the **Desert-Strike-offline** workflow artifact. Pushes to `main` also deploy `dist/` to GitHub Pages. Pull requests do not deploy.

For a fork, enable Pages in **Settings → Pages → Source: GitHub Actions** and enable workflows. Update the repository and player links in the README for your account. No deployment secret or API key is needed.

## Package a release

After building, put these files in a ZIP:

- `dist/Desert-Strike.html`
- `Play.cmd`
- `OFFLINE.txt`
- `LICENSE`
- `THIRD_PARTY.md`

Name it `Desert-Strike-offline.zip`. The GitHub Releases source archives contain the buildable source; the offline ZIP is the ready-to-play download. `Play.cmd` opens the adjacent HTML in the default browser and does not download anything.

## Troubleshooting

- **Artwork fails in the source version:** extract the whole source archive so `assets/` and `src/` remain alongside `index.html`, or use the single-file release.
- **Browser shows text instead of a game:** use Open With and choose a modern browser for the `.html` file.
- **Can't move after switching windows:** the game automatically paused. Choose Resume flight.
- **Aircraft turns instead of moving sideways:** select From Above in the briefing if you prefer compass-direction movement.
- **No sound:** select Sound off to enable sound. Browser sound begins after a user interaction.
- **Command not found: node:** install Node.js to build from source, or use the prebuilt offline download to play without development tools.
