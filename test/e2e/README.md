# End-to-end example tests

These specs load each `demo/examples/*` component into a **real browser** (Chromium
via Playwright) and drive it the way a user would. They exist because the v5
correctness work targets behaviors that happy-dom cannot reproduce — custom
element upgrade ordering, the constructor-attribute rule, empty-string/removed
attributes, and adopted stylesheets — so the unit suite alone can pass while a
real browser misbehaves.

## Running

```sh
pnpm test:e2e     # browser specs only (this folder)
pnpm test         # fast unit suite (happy-dom), unchanged
pnpm test:all     # both
```

Config lives in `vitest.e2e.config.mjs` (Vitest browser mode + the
`@vitest/browser-playwright` provider). It is kept separate from
`vitest.config.mjs` so `pnpm test` stays fast and needs no browser. The
Chromium binary is installed with `npx playwright install chromium`.

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
