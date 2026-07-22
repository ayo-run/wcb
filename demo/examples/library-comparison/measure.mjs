// Reproducible size benchmark behind the comparison guide's numbers.
//
// For each library it bundles the *same* counter component
// (`counters/<lib>.mjs`) together with that library's runtime, minifies with
// esbuild, and compresses the result with gzip (level 9) and brotli (quality
// 11) using Node's built-in zlib. That is the real "cost of your first
// component": everything the browser downloads for one reactive element.
//
//   node measure.mjs            # human-readable table
//   node measure.mjs --md       # a Markdown table (what the guide embeds)
//   node measure.mjs --json     # machine-readable JSON
//
// The external libraries are pinned dev dependencies of this demo workspace, so
// the run is deterministic; `web-component-base` is bundled from its published
// build output (`dist/`) rather than the workspace source, to measure exactly
// what consumers install.
import { build } from 'esbuild'
import { gzipSync, brotliCompressSync, constants } from 'node:zlib'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { readFileSync } from 'node:fs'
import process from 'node:process'

const here = dirname(fileURLToPath(import.meta.url))
const demoRoot = resolve(here, '../..')

// Resolve `web-component-base` to its built entry (the published artifact), not
// the workspace `src/` the Vite dev server aliases it to.
const wcbDist = resolve(here, '../../../dist/index.js')
const wcbAlias = {
  name: 'wcb-dist',
  setup(b) {
    b.onResolve({ filter: /^web-component-base$/ }, () => ({ path: wcbDist }))
  },
}

// Not every library exposes `./package.json` in its `exports` map, so read the
// installed manifest straight from the demo's `node_modules`.
const version = (pkg) =>
  JSON.parse(
    readFileSync(resolve(demoRoot, 'node_modules', pkg, 'package.json'), 'utf8')
  ).version

const wcbVersion = JSON.parse(
  readFileSync(resolve(here, '../../../package.json'), 'utf8')
).version

const targets = [
  { name: 'web-component-base', file: 'wcb.mjs', version: wcbVersion },
  {
    name: '@elenajs/core',
    file: 'elena.mjs',
    version: version('@elenajs/core'),
  },
  { name: 'lit', file: 'lit.mjs', version: version('lit') },
  {
    name: '@microsoft/fast-element',
    file: 'fast.mjs',
    version: version('@microsoft/fast-element'),
  },
  { name: 'vanilla HTMLElement', file: 'vanilla.mjs', version: '-' },
]

const gzip = (buf) => gzipSync(buf, { level: 9 }).length
const brotli = (buf) =>
  brotliCompressSync(buf, {
    params: { [constants.BROTLI_PARAM_QUALITY]: 11 },
  }).length

const kb = (n) => (n / 1000).toFixed(1) + ' kB'

const rows = []
for (const t of targets) {
  const result = await build({
    entryPoints: [resolve(here, 'counters', t.file)],
    bundle: true,
    minify: true,
    format: 'esm',
    write: false,
    plugins: [wcbAlias],
    logLevel: 'silent',
  })
  const code = result.outputFiles[0].contents
  rows.push({
    name: t.name,
    version: t.version,
    minified: code.length,
    gzip: gzip(code),
    brotli: brotli(code),
  })
}

const arg = process.argv[2]

if (arg === '--json') {
  console.log(JSON.stringify(rows, null, 2))
} else if (arg === '--md') {
  console.log('| Library | Version | Minified | Gzip | Brotli |')
  console.log('| ------- | ------- | -------- | ---- | ------ |')
  for (const r of rows) {
    console.log(
      `| ${r.name} | ${r.version} | ${kb(r.minified)} | ${kb(r.gzip)} | ${kb(r.brotli)} |`
    )
  }
} else {
  const pad = (s, n) => String(s).padEnd(n)
  const lpad = (s, n) => String(s).padStart(n)
  console.log(
    pad('Library', 26),
    pad('Version', 9),
    lpad('Minified', 10),
    lpad('Gzip', 8),
    lpad('Brotli', 8)
  )
  console.log('-'.repeat(63))
  for (const r of rows) {
    console.log(
      pad(r.name, 26),
      pad(r.version, 9),
      lpad(kb(r.minified), 10),
      lpad(kb(r.gzip), 8),
      lpad(kb(r.brotli), 8)
    )
  }
}
