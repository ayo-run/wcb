import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'
import { fileURLToPath } from 'node:url'

const src = (p) => fileURLToPath(new URL(`./src/${p}`, import.meta.url))

// End-to-end specs run against the real `src/` in a real browser (Chromium via
// Playwright), so behaviors that happy-dom cannot reproduce — custom-element
// upgrade ordering, constructor attribute rules, adopted stylesheets — are
// actually exercised. Kept separate from the unit config so `pnpm test` stays
// fast and headless-browser-free.
export default defineConfig({
  // The demo examples import the `web-component-base` package; resolve it to
  // local source (mirrors demo/vite.config.js) so e2e tests exercise src.
  resolve: {
    alias: [
      {
        find: /^web-component-base\/utils$/,
        replacement: src('utils/index.js'),
      },
      { find: /^web-component-base\/html$/, replacement: src('html.js') },
      { find: /^web-component-base$/, replacement: src('index.js') },
    ],
  },
  test: {
    include: ['test/e2e/**/*.test.mjs'],
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      screenshotFailures: false,
      instances: [{ browser: 'chromium' }],
    },
  },
})
