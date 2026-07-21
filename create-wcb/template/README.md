# wcb component

A [web-component-base](https://webcomponent.io) component project scaffolded
with `npm create wcb@latest`.

## Commands

- `npm run dev` — start the Vite dev server
- `npm run build` — build for production
- `npm run preview` — preview the production build
- `npm run analyze` — generate `custom-elements.json` from your components'
  `static props` (one manifest for the whole package)

## custom-elements.json

The manifest is a build artifact (gitignored here); tooling discovers it via
the `customElements` field in `package.json`. Regenerate it after changing
`static props`, and see the [CEM plugin guide](https://webcomponent.io/cem-plugin/)
for setting it up with Storybook and code editors.
