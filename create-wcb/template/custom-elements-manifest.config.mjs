// Custom Elements Manifest config — `npm run analyze` reads this.
//
// The wcb plugin teaches the analyzer about `static props`: every key becomes
// a typed public field plus a reflected attribute in custom-elements.json,
// and wcb internals are stripped from the public surface.
// See https://webcomponent.io/cem-plugin/ for the Storybook and editor setup.

import { wcbStaticProps } from 'web-component-base/cem-plugin'

export default {
  globs: ['src/**/*.ts'],
  outdir: '.',
  plugins: [wcbStaticProps()],
}
