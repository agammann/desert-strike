# v1 support

The released product is a five-campaign browser fan recreation with a self-contained offline download. Windows browser acceptance uses Chrome 155 and Edge 154; the source build uses Node.js 24.19.0 with no npm dependencies. Other current browsers are best effort. The offline ZIP includes all active game assets and requires no server or account.

The supported durable save is the next campaign/rounded score after a completed operation, best score and Jake unlock. Progress backups use schemaVersion 1 and can move between v1 browsers/releases. Import replaces this durable progress and returns to the briefing. An unfinished mission is not saved. Storage errors and malformed backups preserve existing data and give a session-backup route.

Campaign simulation and maps retain the v0.6.1 rules. This is not a one-to-one DOS/Genesis port; see the [fidelity ledger](docs/FIDELITY.md) and [DOS comparison](docs/DOS-COMPARISON.md). Keyboard/pointer automation does not establish physical-phone, controller or speaker behavior, a full control/copilot matrix, or universal winning routes.

Download a versioned release, compare checksums, keep the previous release and export progress before updating. Report a reproducible problem with the release/browser, control mode and objective. Initial v1 is complete when its matching source/offline consumers, bounded campaign and recovery gates, and public delivery checks have passed; maintenance follows separately.
