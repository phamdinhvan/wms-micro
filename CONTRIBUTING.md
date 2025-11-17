# Contributing Guide

Thank you for contributing! This monorepo houses multiple UI packages and shared tooling.

## Requirements

- Node >= 20, Yarn 4 (Corepack)
- TypeScript strict mode
- React 18

## Getting Started

1. Install deps and peer deps
   - `yarn install`
   - Peer deps are managed via `yarn peers:install`
2. Dev
   - `yarn dev` (runs workspaces in parallel; filter if needed)
3. Build
   - `yarn build` or `yarn build:uip` / `yarn build:apps`
4. Lint/Format
   - `yarn lint`
   - `yarn format`

## Monorepo Conventions

- No default exports for UI components; use named exports only.
- Do not import global CSS from UI packages.
- Keep React, react-dom, Mantine packages as peerDependencies in UI packages.
- Use Tailwind utility classes primarily; avoid inline styles.
- Follow strict TypeScript settings and shared tsconfig.
- Use Vite library mode for building (ESM + CJS + types) via `@wms/build-config/vite.lib.config.mjs`; keep peer deps external (`rollupOptions.external`).

## Commits & Changesets

- Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`
- Add a changeset for any user-visible change (version bump and changelog). If this repo doesn’t have .changeset, maintain changes in package-level CHANGELOGs or PR description.

## Branching & PRs

- Branch: `type/scope-short-desc` (e.g., `feat/ui-list-add-sort`)
- PR checklist:
  - [ ] Build passes (`yarn build`)
  - [ ] Lint/format passes
  - [ ] Tests green (if applicable)
  - [ ] Docs/README updated
  - [ ] No global CSS imported from `packages/ui/*`
  - [ ] Peer deps correctly declared

## Adding a New UI Package

Use the established blueprint (see `docs/ui-package-blueprint.md`). Ensure:

- `src/index.ts` re-exports named components
- Tests and stories (if Storybook is used)
- `package.json` has proper fields (`type`, `main`, `module`, `types`, `sideEffects`, `files`, `peerDependencies`)


- Filter with Turbo: `turbo run dev --filter="./packages/ui/list"`
- Or use existing scripts like `dev:board`, `dev:gantt`.

## Code Review Guidelines
- Accessibility: proper roles, aria-*, focus management, keyboard support
- Tokenized colors via theme; no hard-coded colors
- Minimal public props; sensible defaults; clear variants

## Workspace dependency management

- Add dependency to a specific workspace (same as Yarn add, scoped to workspace):
  ```sh
  yarn workspace @wms/board add classnames
  yarn workspace @wms/board add -D vitest @types/node
  ```
- If one package uses types/utils from another package, declare that other package as a dependency:
  ```sh
  yarn workspace @wms/gantt add @wms/core
  ```

## Release & Publish
- Standard release: run from repo root
  ```sh
  ./publish.sh
  ```
  Windows: use Git Bash/WSL or `bash ./publish.sh`.
