# WMS Frontend Monorepo

A Yarn 4 + Turborepo monorepo housing multiple UI packages and shared tooling.

## Overview

- Node >= 20
- Package manager: Yarn 4 (Corepack)
- Builds: Vite library mode per package (ESM + CJS + types)
- Tech: TypeScript, React 18, Mantine 8, Tailwind utilities
- Workspaces: `packages/*`, `packages/ui/*`

## Repository Structure

- `packages/ui/board` UI package
- `packages/ui/core` UI package
- `packages/ui/gantt` UI package
- `packages/ui/list` UI package
- `packages/styles` shared styles
- `packages/query-client` data/query utilities
- `packages/eslint-config` shared ESLint rules
- `packages/typescript-config` shared tsconfig
- `packages/build-config`, `packages/bundle` build utilities

See `docs/overview.md` for more details.

## Quickstart

1.  Enable Corepack and install

    ```sh
    corepack enable
    yarn install
    ```

    Peer deps are auto-installed by `peers:install`.

2.  Develop

    ```sh
    yarn dev
    # or filter to a package
    turbo run dev --filter="./packages/ui/board"
    ```

3.  Build

    ```sh
    yarn build             # build all
    yarn build:uip         # build all UI packages
    yarn build:apps        # build all apps (if present)
    ```

4.  Lint/Format/Types
    ```sh
    yarn lint
    yarn format
    yarn check-types
    ```

## NPM Scripts (root)

- `peers:install` install peer deps across workspaces
- `build` run all builds via Turbo
- `dev` run all dev tasks in parallel
- `lint` run lint across workspaces
- `format` Prettier on `ts/tsx/md`
- `check-types` run TypeScript checks
- `create:uim` scaffold UI module via `scripts/create-ui-module.mjs`
- `generate:component` turbo generator alias
- `build:uip` build `packages/ui/*`
- `build:apps` build apps
- `publish` helper to build UIs and workspace `@wms/ui`

## Conventions

- Named exports only for components; no default exports
- Do not import global CSS from `packages/ui/*`
- Keep `react`, `react-dom`, and `@mantine/*` in `peerDependencies` for UI packages
- Prefer Tailwind utility classes; avoid inline styles
- Strict TypeScript with shared tsconfig
- Use Vite library build via shared config (`@wms/build-config/vite.lib.config.mjs`) and keep peer deps external (`rollupOptions.external`)

Accessibility, tokens, and variants guidelines apply across UI packages. See `docs/ui-package-blueprint.md`.

## Development Tips

- Filter tasks with Turbo:
  ```sh
  turbo run dev --filter="./packages/ui/gantt"
  ```
- Example dedicated scripts:
  ```sh
  yarn dev:gantt
  ```

## Generate a new UI package

Use the generator script to scaffold a new UI module with Vite dev setup:

```sh
node scripts/create-ui-module.mjs
```

or

```sh
./create-ui-module.sh
```

It will prompt for:

- Folder name under `packages` (creates `packages/ui/<name>`)
- NPM scope (default: `wms` → package name `@wms/<name>`)
- Root component name (PascalCase)

Next steps after generation:

```sh
yarn install
yarn workspace @wms/<name> dev
```

## Workspace dependency management

- Add a dependency to a specific package (same as Yarn add, but scoped to workspace):
  ```sh
  yarn workspace @wms/board add classnames
  yarn workspace @wms/board add -D vitest @types/node
  ```
- If one package uses types/utils from another package, declare that other package as a dependency:
  ```sh
  yarn workspace @wms/gantt add @wms/core
  ```

## Build & Release

- Standard release: `./publish.sh` (Windows: use Git Bash/WSL or `bash ./publish.sh`)
- Before publishing, verify peer deps are not bundled and `dist/` contains ESM + CJS + types
- See `docs/releasing.md` for details
- After the script completes, consolidated release bundles are available at `packages/bundle/dist/*` and can be copied for use

## Contributing

See `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md`.

Proprietary or TBD.
# wms-micro
# wms-micro
