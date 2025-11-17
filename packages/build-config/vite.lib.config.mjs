// packages/config/vite.lib.config.mjs
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';

export const viteLibConfig = (entry, name, outBase) =>
  defineConfig({
    ssr: {external: ['@tanstack/react-query']},
    build: {
      lib: {
        entry,
        name,
        fileName: format =>
          format === 'es' ? `${outBase}.js` : `${outBase}.cjs`,
        formats: ['es', 'cjs'],
        cssFileName: 'styles',
      },
      rollupOptions: {
        external: [
          'react',
          'react-dom',
          '@mantine/core',
          '@mantine/hooks',
          '@mantine/notifications',
          '@mantine/dates',
          '@tanstack/react-query',
          'i18next',
          'react-i18next',
        ],
        onwarn(warning, warn) {
          if (
            warning.code === 'MODULE_LEVEL_DIRECTIVE' ||
            warning.message.includes(
              "Can't resolve original location of error.",
            )
          ) {
            return;
          }
          warn(warning);
        },
      },
      sourcemap: false,
    },
    plugins: [
      dts({
        entryRoot: 'src',
        outDir: 'dist',
        insertTypesEntry: true,
      }),
    ],
    css: {
      modules: {
        localsConvention: 'camelCaseOnly',
      },
    },
  });
