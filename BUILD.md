# Build Desert Strike

Requires **Node.js 20 or newer** to build and test. Playing a release only requires a browser. There are no npm packages to install and no emulator, ROM, external game engine, remote font, or CDN script.

```sh
git clone https://github.com/agammann/desert-strike.git
cd desert-strike
node --test tests/campaigns.test.cjs
node scripts/build.mjs
```

Open `dist/Desert-Strike.html`. The builder embeds the sprite atlas, map data, CSS, and JavaScript into a single file. `dist/index.html` is the equivalent GitHub Pages entry point. You may also open the source `index.html` directly while keeping its `src/` and `assets/` folders beside it.

## Development

```sh
node scripts/serve.mjs
```

Open `http://127.0.0.1:4173`. The server binds only to loopback. Press Ctrl+C to stop it. Set `PORT` to choose a different port.

| File | Responsibility |
| :--- | :--- |
| `src/reference.js` | Weapon table, map geometry, landmark placements, defenses and supply distribution |
| `src/campaigns.js` | Mission definitions, intelligence, scripted events, escorts, timers and campaign success/failure |
| `src/simulation.js` | Flight physics, combat, winch, supplies, damage and lives |
| `src/game.js` | Canvas rendering, input, audio synthesis, HUD, map, pause and menus |
| `src/style.css` | Desktop/mobile game interface |
| `assets/terrain.png` | Legacy v0.1/v0.2 terrain artwork; no longer loaded or included in builds |
| `assets/sprites.png` | Transparent aircraft, building, personnel and supply atlas |
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

Name it `Desert-Strike-offline.zip`. The GitHub Releases source archives contain the buildable source; the offline ZIP is the ready-to-play download. `Play.cmd` opens the adjacent HTML in the default browser and does not download anything.

## Troubleshooting

- **Artwork fails in the source version:** extract the whole source archive so `assets/` and `src/` remain alongside `index.html`, or use the single-file release.
- **Browser shows text instead of a game:** use Open With and choose a modern browser for the `.html` file.
- **Can't move after switching windows:** the game automatically paused. Choose Resume flight.
- **Aircraft turns instead of moving sideways:** select From Above in the briefing if you prefer compass-direction movement.
- **No sound:** select Sound off to enable sound. Browser sound begins after a user interaction.
- **Command not found: node:** install Node.js to build from source, or use the prebuilt offline download to play without development tools.
