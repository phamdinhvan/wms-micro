# Releasing

Standard release flow is automated via the publish script:

```sh
./publish.sh
```

This script:
- Builds shared packages (`@wms/styles`, `@wms/qc`)
- Builds UI packages (`@wms/core`, `@wms/gantt`, `@wms/board`, `@wms/list`, `@wms/ui`)
- Ensures all artifacts are ready under each `dist/`

Notes:
- Run from the repository root.
- On Windows, execute in Git Bash or WSL, or call via: `bash ./publish.sh`.
- Verify that peer dependencies are not bundled (Vite rollup externals) and that outputs include ESM + CJS + types.

Artifacts:
- After the script completes, consolidated release bundles are available at `packages/bundle/dist/*`. You can copy these files directly for use.

Optional (if needed for your process):
- Bump versions per package before running the script.
- Update changelogs in PRs/READMEs.

Future improvements (optional):
- Adopt Changesets for automated versioning and changelogs.
