# create-wcb

Scaffold a [web-component-base](https://webcomponent.io) (wcb) project:

```sh
npm create wcb@latest
# or: npm create wcb@latest my-app
# or: pnpm create wcb / yarn create wcb / bun create wcb
```

## What you get

- A starter component built on wcb's `static props` convention
- A Vite dev server (`npm run dev`) and production build (`npm run build`)
- `custom-elements.json` generation wired up end to end:
  - `custom-elements-manifest.config.mjs` configured with
    [`web-component-base/cem-plugin`](https://webcomponent.io/cem-plugin/), so
    every `static props` key becomes a typed attribute + field in the manifest
  - an `analyze` script (`npm run analyze`) running
    `@custom-elements-manifest/analyzer`
  - the `customElements` field set in `package.json`, which is how Storybook,
    editors, and other tooling discover the manifest

The manifest is one shared `custom-elements.json` per package — the file every
tool expects — regenerated on demand and gitignored by default.

## Options

```sh
npm create wcb@latest [directory]
```

Prompts for a directory when omitted; `.` scaffolds into the current (empty)
directory. Refuses to write into a non-empty directory.

---

Part of the [wcb](https://github.com/ayo-run/wcb) project · MIT ·
[Ayo Ayco](https://ayo.ayco.io)
