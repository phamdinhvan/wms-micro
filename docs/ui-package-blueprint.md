# UI Package Blueprint

This blueprint outlines how to add a new UI package under `packages/ui/*`.

Quick start via generator:

```sh
node scripts/create-ui-module.mjs
```

or

```sh
./create-ui-module.sh
```

This will scaffold a package with Vite dev setup similar to `packages/ui/board`.

## Structure

Create `packages/ui/<name>` with:

- `src/index.ts`
- Component file(s), e.g., `src/<Component>.tsx`
- Tests (if configured), e.g., `src/<Component>.test.tsx`
- Stories (if Storybook is configured)
- `README.md`
- `vite.config.ts`
- `package.json`

## package.json (example fields)

- `type`: `module`
- `main`: `dist/index.cjs`
- `module`: `dist/index.js`
- `types`: `dist/index.d.ts`
- `sideEffects`: `false`
- `files`: `["dist", "README.md", "LICENSE"]`
- `peerDependencies`: `{ "react": ">=18", "react-dom": ">=18", "@mantine/core": "^8", "@mantine/hooks": "^8" }`

## Build (Vite library mode)

Use the shared config helper: `@wms/build-config/vite.lib.config.mjs`.

Example `vite.config.ts`:

```ts
import {viteLibConfig} from '@wms/build-config/vite.lib.config.mjs';
export default viteLibConfig('./src/index.ts', 'index', 'index');
```

Key points:

- Outputs ESM (`dist/index.js`) and CJS (`dist/index.cjs`) with sourcemaps
- Types generated via `vite-plugin-dts` into `dist/`
- Peer deps kept external via `rollupOptions.external`
- Use shared tsconfig from `packages/typescript-config`

## Coding Conventions

- Named exports only (no default export)
- `displayName` for React components
- Minimal props with sensible defaults; variants where appropriate
- Accessibility: roles, aria-\*, keyboard navigation, focus ring
- Colors and spacing via theme/tokens; prefer Tailwind utility classes
- Do not import global CSS from the package

## Example `src/index.ts`

```ts
export * from './Badge';
```

## Example component stub

```tsx
import {forwardRef} from 'react';

export type BadgeProps = {
  variant?: 'solid' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
} & React.ComponentPropsWithoutRef<'span'>;

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({variant = 'solid', size = 'md', className, ...rest}, ref) => {
    return <span ref={ref} className={className} {...rest} />;
  },
);

Badge.displayName = 'Badge';
```

## Scripts

- Dev filtered: `turbo run dev --filter="./packages/ui/<name>"`
- Build package: run from repo root: `yarn build:uip` (or package-level build)

## Publishing

- Ensure peer deps are not bundled
- Verify `dist/` contains ESM + CJS + types (Vite library outputs)
- Follow Conventional Commits and add release notes (or use Changesets if adopted)
