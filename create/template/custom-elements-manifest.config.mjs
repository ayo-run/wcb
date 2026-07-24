// Custom Elements Manifest config — `npm run analyze` reads this.
//
// `wcbPluginSet()` spreads in the whole wcb plugin set:
//   - wcbStaticProps() — teaches the analyzer about `static props`: every key
//     becomes a typed field + reflected attribute; wcb internals are stripped.
//   - distPaths() — rewrites each module's `path` from the scanned source
//     (`src/*.ts`) to the published build (`dist/*.js`), so a consumer reading
//     the manifest resolves files they can import. `prepack` runs `build:lib`
//     before `analyze`, so `dist/` exists when the manifest is generated.
//   - wcbVsCodePlugin() — writes VS Code custom-data (`.wcb/html-custom-data.json`,
//     `.wcb/css-custom-data.json`) that `.vscode/settings.json` points at.
//   - wcbJetBrainsPlugin() — writes the JetBrains equivalent (`.wcb/web-types.json`,
//     discovered via the `web-types` field in package.json).
//
// See documentation at https://webcomponent.io/cem-plugin/.

import wcbPluginSet from 'web-component-base/cem-plugin'

export default {
  globs: ['src/**/*.ts'],
  outdir: '.wcb',
  plugins: [...wcbPluginSet()],
}
