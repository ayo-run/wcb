# wcb-button

A publishable custom element built on
[web-component-base](https://webcomponent.io), scaffolded with
`npm create wcb@latest`.

## Commands

- `npm run dev` — start the Vite dev server on the `index.html` demo page
- `npm run build` — build the demo page
- `npm run build:lib` — build the library: ESM + UMD bundles and `.d.ts`
  types in `dist/`, with `web-component-base` left external (it is a
  peerDependency)
- `npm run analyze` — generate `custom-elements.json` from the component's
  `static props`

## Publishing

`npm publish` (or `npm pack`) runs the `prepack` script, which rebuilds the
library and regenerates `custom-elements.json` — both ship inside the
package, and the `customElements` field in `package.json` is how Storybook,
editors, and other tooling discover the manifest. In the repo itself the
manifest stays gitignored; it is a build artifact.

See the [CEM plugin guide](https://webcomponent.io/cem-plugin/) for setting
it up with Storybook and code editors.

---

_Just keep building._
