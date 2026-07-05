# End-to-end example tests

These specs load each `demo/examples/*` component into a **real browser**
(Chromium, Firefox, and WebKit via Playwright) and drive it the way a user
would. They exist because the v5 correctness work targets behaviors that
happy-dom cannot reproduce — custom element upgrade ordering, the
constructor-attribute rule, empty-string/removed attributes, and adopted
stylesheets — so the unit suite alone can pass while a real browser misbehaves.
Running across engines also catches cross-browser differences.

## Running

```sh
pnpm test:e2e           # default: Chromium only (fast, universal)
pnpm test:e2e:chromium  # Chromium
pnpm test:e2e:firefox   # Firefox
pnpm test:e2e:webkit    # WebKit (the engine behind Safari)
pnpm test:e2e:all       # Chromium + Firefox + WebKit

pnpm test               # fast unit suite (happy-dom), unchanged
pnpm test:all           # unit + full e2e (all 3 engines)
```

`pnpm test:e2e` stays on Chromium so it works everywhere with minimal setup; use
`test:e2e:all` for the full cross-browser run. Each script just sets the
`E2E_BROWSERS` env var (comma-separated), which the config reads.

### Where each runs

| Stage                         | e2e scope                     |
| ----------------------------- | ----------------------------- |
| pre-commit                    | none (unit only)              |
| pre-push                      | `test:e2e` (Chromium)         |
| CI on push to `main` / PRs    | `test:e2e` (Chromium)         |
| CI nightly (`nightly.yml`)    | `test:e2e:all` (all 3 engines) |

The full Firefox/WebKit matrix is heavy to provision, so it runs once a day
(and on-demand via **workflow_dispatch**) rather than on every push/PR.

Config lives in `vitest.e2e.config.mjs` (Vitest browser mode + the
`@vitest/browser-playwright` provider), kept separate from `vitest.config.mjs`
so `pnpm test` stays fast and needs no browser.

### Browser setup

```sh
npx playwright install chromium firefox webkit   # download the browsers
npx playwright install-deps                       # Linux only: system libraries
```

Firefox and especially WebKit need extra OS libraries on Linux (`libwoff1`,
etc.); `playwright install-deps` requires root. Without them those engines fail
to launch — which is why the default target is Chromium, and only the nightly
workflow installs the deps before running `test:e2e:all`.

## Coverage

One spec per example folder:

| Example folder        | Behavior exercised                                                        |
| --------------------- | ------------------------------------------------------------------------- |
| `on-changes`          | v5 `onChanges` payload — camelCase `property` vs kebab `attribute`         |
| `strict-props`        | v5 default log-and-skip vs `static strictProps` throwing                   |
| `attribute-lifecycle` | v5 empty-string stays `''`, removal resets to default, markup wins        |
| `lifecycle-order`     | v5 buffering — `onInit` runs before the first render, no replayed onChanges |
| `just-parts`          | `html` + `createElement` on a vanilla `HTMLElement`                        |
| `demo`                | counter / toggle / hello-world / boolean props / onDestroy span           |
| `type-restore`        | number, boolean, string, and object prop round-trips                       |
| `props-blueprint`     | non-zero default, camelCase↔kebab, authored attribute override            |
| `style-objects`       | computed inline style objects, type-driven style sets                      |
| `use-shadow`          | rendering into an open shadow root                                         |
| `constructed-styles`  | `static styles` via `adoptedStyleSheets` in the shadow root               |
| `templating`          | interpolated lists / links via the built-in `html`                        |

## Intentionally not covered

- **`demo/examples/pens/counter-toggle.html`** and
  **`demo/examples/templating/with-lit.js`** load their dependencies from a CDN
  (`esm.sh` / `unpkg`) at runtime. They are omitted from the hermetic e2e run to
  avoid a network dependency; the same `WebComponent` behaviors they show are
  already covered by the local specs above (the `templating` spec covers
  `demo/examples/templating/index.js`).
