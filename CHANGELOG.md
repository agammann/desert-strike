# Changelog

## 1.0.0

The five-campaign playable release adds portable progress export/import and clear local-save status. Invalid backups preserve current progress; unavailable or corrupt storage leaves existing bytes untouched and offers a session backup. Existing v0.6.1 checkpoints and Jake unlock migrate when no v1 record exists.

Source and offline ZIPs have matching version/commit identities, individual and combined SHA-256 checksums, and a six-file offline build receipt. Fresh source consumers rebuild the identical game without npm installation. The Windows launcher reports a missing/extracted-file problem instead of opening incomplete source.

Campaign definitions, simulation, maps, assets and the original-game fidelity limits are retained. There is no mid-mission save or account.
