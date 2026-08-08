// Custom Elements Manifest config for the wcb Storybook testing ground.
//
// This is the real consumer path for `web-component-base/cem-plugin`: the
// plugin is imported from its published subpath (so this doubles as a check
// that the packaging works), and the manifest it emits is what Storybook reads
// to build autodocs + controls.
//
// The globs are an explicit list rather than `../demo/examples/**`, because the
// demo pages are standalone — several of them reuse the same tag name
// (`my-counter` is defined in five examples). That is fine when each page loads
// alone, but Storybook loads everything into one document, where duplicate tag
// names collide both in `customElements.define` and in the manifest lookup.
// Keep this list to one definition per tag.

import { wcbStaticProps, wcbVsCodePlugin } from 'web-component-base/cem-plugin'

export default {
  globs: [
    '../demo/examples/typed-props/index.ts',
    '../demo/examples/props-blueprint/hello-world.js',
    '../demo/examples/strict-props/index.js',
    '../demo/examples/type-restore/Object.mjs',
    '../demo/examples/attribute-lifecycle/index.js',
    '../demo/examples/on-changes/index.js',
    '../demo/examples/demo/BooleanPropTest.mjs',
  ],
  // The manifest lands in `storybook/.wcb/`, keeping generated output out of
  // the storybook root (preview.js imports it from there).
  outdir: '.wcb',
  plugins: [
    wcbStaticProps(),
    // Emits html-custom-data.json into the repo-root `.wcb/`, because
    // `html.customData` in .vscode/settings.json resolves from the workspace
    // root, not from the settings file.
    //
    // `cssFileName: null` turns off the companion CSS custom data file: it is
    // built from `@cssproperty` / `@csspart` JSDoc tags, which none of these
    // components declare, so it only ever comes out empty.
    wcbVsCodePlugin({ outdir: '../.wcb', cssFileName: null }),
  ],
}
