// Library build — `npm run build:lib` emits ESM + UMD bundles and .d.ts
// types into dist/, with web-component-base left external for consumers to
// provide (it is a peerDependency). The plain `vite` dev server and
// `npm run build` use the default config and the index.html demo page.

import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  publicDir: false,
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/wcb-button.ts'),
      name: 'WcbButton',
      fileName: 'wcb-button',
    },
    rolldownOptions: {
      external: ['web-component-base'],
      output: {
        globals: {
          'web-component-base': 'web-component-base',
        },
      },
    },
  },
  plugins: [dts()],
})
