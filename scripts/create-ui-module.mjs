// scripts/create-module.mjs
import fs from 'fs/promises';
import path from 'path';
import readline from 'readline';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function ask(question, {defaultValue} = {}) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const q = defaultValue ? `${question} (${defaultValue}): ` : `${question}: `;
  return new Promise(resolve => {
    rl.question(q, ans => {
      rl.close();
      resolve(ans.trim() || defaultValue || '');
    });
  });
}

function toPascalCase(input) {
  const cleaned = input.replace(/^ui-/, ''); // drop "ui-" prefix if present
  return cleaned
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(w => w[0].toUpperCase() + w.slice(1))
    .join('');
}

async function ensureDir(dir) {
  await fs.mkdir(dir, {recursive: true});
}

async function writeJson(fp, obj) {
  await fs.writeFile(fp, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

async function main() {
  console.log('🧩 Create UI module');
  const repoRoot = path.resolve(__dirname, '..');

  // 1) Ask for inputs
  const folderName = await ask('Folder name under packages', {
    defaultValue: 'new',
  }); // e.g., ui-gantt
  if (!/^[a-z0-9-]+$/.test(folderName)) {
    console.error(
      '❌ Folder name must be kebab-case (lowercase, digits, hyphens).',
    );
    process.exit(1);
  }

  const scope = await ask('NPM scope (without @)', {
    defaultValue: 'wms',
  });
  const pkgScope = `@${scope}`;
  const pkgName = `${pkgScope}/${folderName}`;

  const compNameDefault = toPascalCase(folderName);
  const componentName = await ask('Root component name (PascalCase)', {
    defaultValue: compNameDefault || 'Component',
  });

  // 2) Resolve paths
  const pkgDir = path.join(repoRoot, 'packages', 'ui', folderName);
  const srcDir = path.join(pkgDir, 'src');
  const devDir = path.join(pkgDir, 'dev');

  // 3) Safety checks
  try {
    await fs.access(pkgDir);
    console.error(
      `❌ ${pkgDir} already exists. Aborting to avoid overwriting.`,
    );
    process.exit(1);
  } catch {
    // ok, not exists
  }

  // 4) Create files
  await ensureDir(srcDir);
  await ensureDir(devDir);

  const packageJson = {
    name: pkgName,
    version: '0.1.0',
    private: false,
    type: 'module',
    main: `./dist/index.cjs`,
    module: `./dist/index.js`,
    types: `./dist/index.d.ts`,
    exports: {
      '.': {
        types: './dist/index.d.ts',
        import: `./dist/index.js`,
        require: `./dist/index.cjs`,
      },
    },
    files: ['dist'],
    scripts: {
      build: 'vite build',
      test: 'vitest',
      lint: 'eslint .',
      dev: 'vite',
    },
    peerDependencies: {
      [`${pkgScope}/core`]: 'workspace:*',
    },
    devDependencies: {
      '@wms/build-config': 'workspace:*',
      '@wms/eslint-config': 'workspace:*',
      '@wms/typescript-config': 'workspace:*',
      vite: '^7.1.7',
    },
  };

  const tsconfig = {
    extends: `${pkgScope}/typescript-config/react-library.json`,
    include: ['src', 'dev'],
  };

  const eslintConfigMjs = `\
import { config } from "@${scope}/eslint-config/react-internal";
/** @type {import("eslint").Linter.Config} */
export default config;
`;

  const indexTs = `export * from "./${componentName}";\n`;

  const componentTsx = `\
"use client";
import React from "react";
import { Card, Box, Text } from "@mantine/core";

export interface ${componentName}Props {
  title?: string;
  children?: React.ReactNode;
}

export function ${componentName}({ title = "${componentName}", children }: ${componentName}Props) {
  return (
    <Card padding="md" radius="md" withBorder>
      <Text fw={600} mb="xs">{title}</Text>
      <Box>{children}</Box>
    </Card>
  );
}
`;

  const gitignore = `dist
node_modules
`;

  const viteConfigTs = `\
import {viteLibConfig} from '@wms/build-config/vite.lib.config.mjs';
export default viteLibConfig('./src/index.ts', 'index', 'index');

`;

  const indexHtml = `<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>${componentName}</title>\n  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/dev/main.tsx"></script>\n  </body>\n</html>\n`;

  const devAppTsx = `import {WmsProvider} from '@wms/core';\nimport { ${componentName} } from '../src';\nconst App = () => {\n  return (\n    <WmsProvider>\n      <div className="wms-h-screen wms-p-4">\n        <${componentName} />\n      </div>\n    </WmsProvider>\n  );\n};\n\nexport default App;\n`;

  const devMainTsx = `import '@mantine/core/styles.css';\nimport '@mantine/dates/styles.css';\nimport '@mantine/notifications/styles.css';\nimport '@wms/styles';\nimport { StrictMode } from 'react';\nimport { createRoot } from 'react-dom/client';\nimport App from './App';\n\ncreateRoot(document.getElementById('root')!).render(\n  <StrictMode>\n    <App />\n  </StrictMode>,\n);\n`;

  // 5) Write
  await writeJson(path.join(pkgDir, 'package.json'), packageJson);
  await writeJson(path.join(pkgDir, 'tsconfig.json'), tsconfig);
  await fs.writeFile(path.join(pkgDir, '.gitignore'), gitignore, 'utf8');
  await fs.writeFile(
    path.join(pkgDir, 'eslint.config.mjs'),
    eslintConfigMjs,
    'utf8',
  );
  await fs.writeFile(path.join(srcDir, 'index.ts'), indexTs, 'utf8');
  await fs.writeFile(
    path.join(srcDir, `${componentName}.tsx`),
    componentTsx,
    'utf8',
  );
  await fs.writeFile(path.join(pkgDir, 'vite.config.ts'), viteConfigTs, 'utf8');
  await fs.writeFile(path.join(pkgDir, 'index.html'), indexHtml, 'utf8');
  await fs.writeFile(path.join(devDir, 'App.tsx'), devAppTsx, 'utf8');
  await fs.writeFile(path.join(devDir, 'main.tsx'), devMainTsx, 'utf8');

  // 7) Done
  console.log(`✅ Created ${pkgName} at packages/${folderName}`);
  console.log('\Next steps:');
  console.log(`  1) yarn install`);
  console.log(
    `  2) yarn workspace ${pkgScope}/${folderName} build  # or: turbo run build --filter=${folderName}`,
  );
  console.log(
    `  3) yarn workspace ${pkgScope}/${folderName} dev  # or: turbo run dev --filter=${folderName}`,
  );
  console.log('  4) Open the playground app to test your new module.');
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
