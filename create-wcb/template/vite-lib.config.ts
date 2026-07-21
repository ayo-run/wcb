// Library build — `npm run build` emits ESM + UMD bundles and .d.ts types
// into dist/, with web-component-base left external for consumers to provide
// (it is a peerDependency). The plain `vite` dev server ignores this file and
// serves the index.html demo page instead.

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
    rollupOptions: {
      external: ['web-component-base'],
      output: {
        globals: {
          'web-component-base': 'WebComponentBase',
        },
      },
    },
  },
  plugins: [dts()],
})
