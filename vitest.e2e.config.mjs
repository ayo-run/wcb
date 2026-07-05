import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'
import { fileURLToPath } from 'node:url'

const src = (p) => fileURLToPath(new URL(`./src/${p}`, import.meta.url))

// Which engines to run the e2e suite against. Defaults to all three Playwright
// engines (Chromium, Firefox, and WebKit — the engine behind Safari). Override
// with e.g. `E2E_BROWSERS=chromium pnpm test:e2e` in environments that only
// have some browsers installed (Firefox/WebKit also need system libs — see
// `npx playwright install-deps`).
const BROWSERS = (process.env.E2E_BROWSERS || 'chromium,firefox,webkit')
  .split(',')
  .map((name) => name.trim())
  .filter(Boolean)

// End-to-end specs run against the real `src/` in a real browser (via
// Playwright), so behaviors that happy-dom cannot reproduce — custom-element
// upgrade ordering, constructor attribute rules, adopted stylesheets — are
// actually exercised across engines. Kept separate from the unit config so
// `pnpm test` stays fast and headless-browser-free.
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
      instances: BROWSERS.map((browser) => ({ browser })),
    },
  },
})
