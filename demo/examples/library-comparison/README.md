# Library comparison

The counter component from the [comparison guide](https://webcomponent.io/comparison/),
implemented in each library it's measured against, plus the reproducible size
benchmark behind the guide's numbers.

- `counters/*.mjs` — the same minimal counter (one reactive `count` prop, a
  click handler, a re-render on change) in `web-component-base`, Elena, Lit,
  FAST, and vanilla `HTMLElement`. `index.html` runs all five live.
- `measure.mjs` — bundles each counter _with_ its library runtime (esbuild,
  `--bundle --minify --format=esm`) and compresses the result with gzip (−9) and
  brotli (q11) via Node's `zlib`. That's the real "cost of your first
  component": library runtime + component code, everything the browser
  downloads.

## Run the benchmark

From this folder:

```sh
node measure.mjs          # human-readable table
node measure.mjs --md     # Markdown table (what the guide embeds)
node measure.mjs --json   # raw numbers
```

The external libraries are pinned dev dependencies of the `demo` workspace, and
`web-component-base` is bundled from its published `dist/` (run `pnpm build` at
the repo root first), so the numbers are deterministic. Bump a pinned version in
`demo/package.json`, re-run, and the table moves with it.
