import {createRequire} from 'node:module';
import path from 'node:path';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';

const require = createRequire(import.meta.url);

// Resolve to the actual package folders (robust across monorepos)
const reactI18nextDir = path.dirname(
  require.resolve('react-i18next/package.json'),
);
const i18nextDir = path.dirname(require.resolve('i18next/package.json'));
const reactDir = path.dirname(require.resolve('react/package.json'));
const reactDomDir = path.dirname(require.resolve('react-dom/package.json'));

export default defineConfig({
  resolve: {
    alias: {
      'react-i18next': reactI18nextDir,
      i18next: i18nextDir,
      react: reactDir,
      'react-dom': reactDomDir,
    },
    dedupe: ['react', 'react-dom', 'i18next', 'react-i18next'],
    preserveSymlinks: false,
  },
  build: {
    lib: {
      entry: 'src/index.tsx',
      name: 'WmsUI', // global for IIFE
      fileName: 'wms-ui',
      formats: ['es'],
      cssFileName: 'styles',
    },
    rollupOptions: {
      treeshake: {moduleSideEffects: 'no-external'},
      output: {
        exports: 'named',
      },
    },
    sourcemap: false,
    cssCodeSplit: false,
    target: 'es6',
  },
  plugins: [
    dts({
      entryRoot: 'src',
      outDir: 'dist/types',
      insertTypesEntry: true,
      compilerOptions: {
        sourceMap: false,
        declarationMap: false,
        emitDeclarationOnly: true,
        declaration: true,
      },
    }),
  ],
});
