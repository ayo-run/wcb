// Custom Elements Manifest config — `npm run analyze` reads this.
//
// The wcb plugin teaches the analyzer about `static props`: every key becomes
// a typed public field plus a reflected attribute in custom-elements.json,
// and wcb internals are stripped from the public surface.
// See https://webcomponent.io/cem-plugin/ for the Storybook and editor setup.
//
// `distPaths()` rewrites each module's `path` from the scanned source
// (`src/*.ts`) to the built output this package publishes (`dist/*.js`), so a
// consumer reading the manifest resolves the files they can actually import —
// only `dist/` is shipped, never `src/`. `prepack` runs `build:lib` before
// `analyze`, so `dist/` exists when the manifest is generated.

import { wcbStaticProps, distPaths } from 'web-component-base/cem-plugin'

export default {
  globs: ['src/**/*.ts'],
  outdir: '.',
  plugins: [wcbStaticProps(), distPaths()],
}
