# Project Overview

This repository is a Yarn 4 + Turborepo monorepo for multiple UI packages and shared tooling.

- Package manager: Yarn 4 (see `packageManager` in root `package.json`)
- Node: >= 20
- Builds: Vite library mode per package (ESM + CJS + types)
- Frameworks/Libraries: TypeScript, React 18, Mantine 8, Tailwind utilities (via shared styles)
- Workspaces: `packages/*`, `packages/ui/*`

## Layout

- `packages/ui/*` UI packages (e.g., `board`, `core`, `gantt`, `list`)
- `packages/styles` shared styles
- `packages/query-client` data/query utilities
- `packages/eslint-config` shared lint rules
- `packages/typescript-config` shared tsconfig
- `packages/build-config`, `packages/bundle` build-related utilities

## Development

- Install: `yarn install` (peer deps auto-installed via `peers:install`)
- Dev all: `yarn dev`
- Dev filtered: `turbo run dev --filter="./packages/ui/board"`
- Lint/Format: `yarn lint`, `yarn format`
- Type check: `yarn check-types`

### Per-package Dev Environments (Vite)

Each UI package (except `core`) has its own Vite dev setup. Use Turbo filters to run a single package:

```sh
turbo run dev --filter="./packages/ui/board"
```

You can use `board` as the reference setup for others (`gantt`, `list`, etc.).

## Build & Publish

- Build all: `yarn build`
- Build UI packages only: `yarn build:uip`
- Publish helper (adjust per package): `yarn workspace @wms/ui build`

## Conventions

- Named exports only for components; no default exports
- Peer dependencies for `react`, `react-dom`, `@mantine/*` in UI packages
- Avoid importing global CSS inside `packages/ui/*`
- Prefer Tailwind utility classes; avoid inline styles
- Strict TypeScript; shared `tsconfig`

See `docs/ui-package-blueprint.md` for adding a new UI package.
