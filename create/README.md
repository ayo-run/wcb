# create-wcb

> [!Note] Work in progress CLI for wcb development.
> Currently, it scaffolds a new web component project
> with our CEM Analyzer Plugin already configured

Scaffold a publishable [web-component-base](https://webcomponent.io) (wcb)
custom element:

```sh
npm create wcb@latest
# or: npm create wcb@latest my-button
# or: pnpm create wcb / yarn create wcb / bun create wcb
```

## What you get

- A custom element built on wcb's `static props` convention, written in
  TypeScript — the class, tag, and file names are stamped from your project
  name (`my-button` → `MyButton` / `<my-button>`), so there are no rename-me
  TODOs
- A Vite setup patterned on the
  [`ayo-run/web-component`](https://github.com/ayo-run/web-component)
  template: `npm run dev` serves the demo page, `npm run build:lib` produces
  ESM + UMD bundles and `.d.ts` types in `dist/`, with `web-component-base`
  external as a peerDependency
- `custom-elements.json` generation set up end to end:
  - `custom-elements-manifest.config.mjs` configured with
    [`web-component-base/cem-plugin`](https://webcomponent.io/cem-plugin/), so
    every `static props` key becomes a typed attribute + field in the manifest
  - an `analyze` script (`npm run analyze`) running
    `@custom-elements-manifest/analyzer`
  - the `customElements` field set in `package.json`, which is how Storybook,
    editors, and other tooling discover the manifest
  - the manifest ships inside the published package: `prepack` rebuilds
    `dist/` and regenerates `custom-elements.json`, and both are in `files`

The manifest is one shared `custom-elements.json` per package — the file every
tool expects — regenerated on demand and gitignored in the repo.

## Options

```sh
npm create wcb@latest [directory]
```

Prompts for a directory when omitted; `.` scaffolds into the current (empty)
directory. Refuses to write into a non-empty directory. A hyphen-less name
gets an `-element` suffix on the tag (`button` → `<button-element>`), since
custom element tag names require a hyphen.

Prefer starting from GitHub instead of the terminal? The
[`ayo-run/web-component`](https://github.com/ayo-run/web-component) template
repository serves the same purpose via "Use this template".

---

Part of the [wcb](https://github.com/ayo-run/wcb) project · MIT ·
[Ayo Ayco](https://ayo.ayco.io)
