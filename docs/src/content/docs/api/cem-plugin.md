---
title: cem-plugin
slug: api/cem-plugin
description: The wcbStaticProps CEM analyzer plugin.
---

A plugin for
[`@custom-elements-manifest/analyzer`](https://custom-elements-manifest.open-wc.org/)
that teaches it to read wcb's `static props` object.

```js
import { wcbStaticProps, distPaths } from 'web-component-base/cem-plugin'
// wcbStaticProps is also available as the module's default export
import wcbStaticProps from 'web-component-base/cem-plugin'
```

See the [CEM Analyzer Plugin guide](/cem-plugin/) for setup, Storybook and
editor integration.

## `wcbStaticProps()`

Takes no arguments and returns an analyzer plugin object.

| Field          | Type                    |                                     |
| -------------- | ----------------------- | ----------------------------------- |
| `name`         | `string`                | the plugin name                     |
| `analyzePhase` | `(ctx: any) => void`    | the analyzer hook                   |

```js
// custom-elements-manifest.config.mjs
import { wcbStaticProps } from 'web-component-base/cem-plugin'

export default {
  globs: ['src/**/*.js'],
  outdir: '.',
  plugins: [wcbStaticProps()],
}
```

## What it does

For each class that extends `WebComponent`, it reads the `static props`
initializer and, for every key, records in the manifest:

- the **member** under its camelCase name
- the **attribute** under its kebab-case name, linked to that member
- the **type** inferred from the default value: `boolean`, `number`, `object`
  or `string`
- the **default value** as written

Without it the analyzer sees `props` as one opaque static field and emits no
attributes, so editor completion and Storybook controls have nothing to read.

The `static props` initializer must resolve to an object literal in the same
source file.

## `distPaths(options?)`

A companion plugin that rewrites each module's `path` in the manifest from the
scanned source to the built output a package publishes, so a shipped
`custom-elements.json` points at files consumers can actually import.

```js
// custom-elements-manifest.config.mjs
import { wcbStaticProps, distPaths } from 'web-component-base/cem-plugin'

export default {
  globs: ['src/**/*.ts'],
  outdir: '.',
  plugins: [wcbStaticProps(), distPaths()],
}
```

| Option    | Type                     | Default  |                                                |
| --------- | ------------------------ | -------- | ---------------------------------------------- |
| `rootDir` | `string`                 | `'src'`  | source directory prefix to replace             |
| `outDir`  | `string`                 | `'dist'` | built-output directory to point at             |
| `ext`     | `Record<string, string>` | see below | extension remap, merged over the defaults     |

Zero-config it maps the `rootDir` prefix to `outDir` and rewrites TypeScript
extensions to their emitted JS form — `.ts` → `.js`, `.mts` → `.mjs`,
`.cts` → `.cjs`. Other extensions pass through, so a plain `.js` source only
has its directory swapped. `options.ext` merges over that default map.

References that point back at a module — `exports[].declaration`, `superclass`,
`mixins[]` — are rewritten along with the paths, so the `module` a consumer
follows still resolves to a module in the manifest. A reference carrying a
`package` names another package's layout and is left untouched.

It runs in the analyzer's `packageLinkPhase` (after `wcbStaticProps`'s
`analyzePhase`), so ordering the two in the `plugins` array does not matter.
Run `cem analyze` after your build so the files the rewritten paths point at
exist. See the [publishing note in the
guide](/cem-plugin/#ship-the-manifest-with-a-package-distpaths).
