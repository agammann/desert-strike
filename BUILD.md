# Build Desert Strike v1

Requires **Node.js 24 or newer**. The v1 acceptance runtime is Node.js 24.19.0. No npm packages, emulator, ROM or external engine are required. Python 3.10 or newer and Git are needed only for packaging/consumer verification.

Download the versioned source ZIP from the [v1.0.0 release](https://github.com/agammann/desert-strike/releases/tag/v1.0.0), compare SHA256SUMS, extract it and open a terminal in `desert-strike-1.0.0`.

```sh
node --test tests/campaigns.test.cjs tests/progress.test.cjs
node scripts/build.mjs
```

Open `dist/Desert-Strike.html`. `dist/index.html` has the same bytes for static hosting. The builder embeds all active sprite sheets, terrain tiles, eight MP3 tracks, metadata, CSS and scripts; it sorts input filenames so fresh builds match across supported build platforms.

For development, run `node scripts/serve.mjs` and open `http://127.0.0.1:4173`. This server binds to loopback; stop it with Ctrl+C. Set PORT to choose another port. The unbuilt source needs this local server for artwork canvas access. A release HTML needs none.

## Engine map

| File | Responsibility |
| :--- | :--- |
| `src/terrain-data.js`, `src/original-art.js` | Terrain grids, palette and original sprite selection |
| `src/dos-data.js`, `src/dos-reference.js`, `src/reference.js` | DOS anchors, metadata, weapons and reconstructed rules |
| `src/campaigns.js` | Five campaigns, objectives, intelligence, escorts, timers and endings |
| `src/simulation.js` | Fixed-step flight, combat, winch, supplies, damage and lives |
| `src/game.js`, `src/style.css`, `index.html` | Rendering, DOM controls, audio and pause/menu states |
| `src/progress.js` | Strict progress backup schema, legacy migration and storage boundary |
| `assets/original/`, `THIRD_PARTY.md` | Original artwork/music and their separate rights |
| `tests/campaigns.test.cjs`, `tests/pilot.cjs` | Rule regressions and input-driven campaign completions |
| `tests/progress.test.cjs` | Backup validation, corruption/blocked-write preservation and migration |
| `scripts/build.mjs` | Self-contained offline/static HTML |

Keep simulation and browser behavior aligned. The test pilot reads state and emits player inputs; focused rule fixtures explicitly set up their branch. Neither pilot nor browser observer ships in a built game. When changing maps, assets or rules, update the campaign/fidelity documentation and directly verify the affected browser journey.

## Package a release

Use a clean committed Git checkout; packaging from a source ZIP without Git metadata is intentionally rejected.

```sh
git clone https://github.com/agammann/desert-strike.git
cd desert-strike
git checkout v1.0.0
python scripts/package-release.py
python scripts/check-consumer.py --out ../desert-strike-consumer
```

Packaging builds the game, writes exact committed source and six-file offline ZIPs under `release-artifacts/`, and adds two individual checksums plus SHA256SUMS. RELEASE.json inside the offline ZIP records version, commit, tree and HTML hash. The consumer check safely extracts into a new folder, compares every source blob with the commit, runs the tests, builds again and requires exact offline HTML/documentation bytes.

## CI and hosting

`.github/workflows/pages.yml` tests and verifies fresh package consumers on Linux and Windows. A main push publishes v1 only after both jobs pass. Its publisher checks main/tag identity and every uploaded asset's SHA-256 and size before making a draft public; published releases are left unchanged. The same built HTML deploys to the existing GitHub Pages site. Pull requests do not publish or deploy.

A fork can enable Pages in **Settings → Pages → Source: GitHub Actions**. Update the repo/player links and publisher repository guard before publishing under a new identity. Existing Sites hosting is separately deployed from this source; GitHub Actions does not deploy it.

## Troubleshooting

- Unbuilt artwork fails: extract all source files and use the loopback server, or open the built single-file HTML.
- HTML opens as text: choose a browser with Open With.
- Flight does not move after a tab/window switch: choose Resume flight; focus loss pauses automatically.
- Aircraft turns instead of moving sideways: select From Above for compass movement.
- No sound: select Sound off to enable it after user interaction. Browser audio APIs do not prove speakers are audible.
- Progress is unavailable: export the current session before closing; import a valid backup or clear only this game's browser site data to start fresh.
- Node is missing: the prebuilt offline ZIP does not require Node; install Node only to build/develop.
