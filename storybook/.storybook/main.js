import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const repo = resolve(root, '..')
const srcDir = resolve(repo, 'src')

/** @type {import('@storybook/web-components-vite').StorybookConfig} */
export default {
  stories: ['../stories/**/*.stories.js', '../stories/**/*.mdx'],
  addons: ['@storybook/addon-docs'],
  framework: { name: '@storybook/web-components-vite', options: {} },

  // Same aliasing the demo uses: resolve the library to `src/` so stories get
  // instant HMR against the real source instead of the built bundle. (The CEM
  // config deliberately does the opposite and imports the plugin from `dist/`
  // via its published subpath.)
  viteFinal: (config) => ({
    ...config,
    resolve: {
      ...config.resolve,
      alias: [
        ...(config.resolve?.alias ?? []),
        {
          find: /^web-component-base\/utils$/,
          replacement: resolve(srcDir, 'utils/index.js'),
        },
        {
          find: /^web-component-base\/html$/,
          replacement: resolve(srcDir, 'html.js'),
        },
        {
          find: /^web-component-base$/,
          replacement: resolve(srcDir, 'index.js'),
        },
      ],
    },
    // stories import components from the sibling `demo/` workspace
    server: { ...config.server, fs: { allow: [repo] } },
  }),
}
