---
title: cem-plugin
slug: api/cem-plugin
description: The wcb CEM analyzer plugins — wcbStaticProps, distPaths, wcbVsCodePlugin and wcbJetBrainsPlugin.
---

Plugins for
[`@custom-elements-manifest/analyzer`](https://custom-elements-manifest.open-wc.org/)
that teach it to read wcb's `static props` object and turn the resulting
manifest into the files editors and IDEs read.

```js
import {
  wcbStaticProps,
  distPaths,
  wcbVsCodePlugin,
  wcbJetBrainsPlugin,
} from 'web-component-base/cem-plugin'
// wcbPluginSet — all four at once — is the module's default export
import wcbPluginSet from 'web-component-base/cem-plugin'
```

They are dev-time only: they run in Node during `cem analyze` and are never
imported by `WebComponent`. See the
[CEM Analyzer Plugin guide](/cem-plugin/) for setup, Storybook and editor
integration.

## `wcbPluginSet()`

Returns all four plugins as an array, ready to spread into `plugins`. This is
the module's default export, and what `npm create wcb@latest` scaffolds.

```js
// custom-elements-manifest.config.mjs
import wcbPluginSet from 'web-component-base/cem-plugin'

export default {
  globs: ['src/**/*.{js,ts}'],
  outdir: '.wcb',
  plugins: [...wcbPluginSet()],
}
```

Options are forwarded to the individual plugins by key. `wcbStaticProps` takes
none, so there is no key for it.

| Option      | Type     |                                    |
| ----------- | -------- | ---------------------------------- |
| `distPaths` | `object` | options for `distPaths()`          |
| `vsCode`    | `object` | options for `wcbVsCodePlugin()`    |
| `jetBrains` | `object` | options for `wcbJetBrainsPlugin()` |

```js
plugins: [...wcbPluginSet({ vsCode: { cssFileName: null } })]
```

To leave a plugin out entirely, list the named exports you want instead of
spreading the set.

## `wcbStaticProps()`

Takes no arguments and returns an analyzer plugin object.

| Field          | Type                 |                   |
| -------------- | -------------------- | ----------------- |
| `name`         | `string`             | the plugin name   |
| `analyzePhase` | `(ctx: any) => void` | the analyzer hook |

```js
// custom-elements-manifest.config.mjs
import { wcbStaticProps } from 'web-component-base/cem-plugin'

export default {
  globs: ['src/**/*.js'],
  outdir: '.wcb',
  plugins: [wcbStaticProps()],
}
```

### What it does

For each class that extends `WebComponent`, it reads the `static props`
initializer and, for every key, records in the manifest:

- the **member** under its camelCase name
- the **attribute** under its kebab-case name, linked to that member
- the **type** inferred from the default value: `boolean`, `number`, `object`
  or `string`
- the **default value** as written

Without it the analyzer sees `props` as one opaque static field and emits no
attributes, so editor completion and Storybook controls have nothing to read.

The `static props` initializer must resolve to an object literal — written
inline, or in a module-level `const` in the same source file.

## `distPaths()`

Rewrites each module's `path` in the manifest from the scanned source to the
built output a package publishes, so a shipped `custom-elements.json` points at
files consumers can actually import.

```js
// custom-elements-manifest.config.mjs
import { wcbStaticProps, distPaths } from 'web-component-base/cem-plugin'

export default {
  globs: ['src/**/*.ts'],
  outdir: '.wcb',
  plugins: [wcbStaticProps(), distPaths()],
}
```

| Option    | Type                     | Default   |                                            |
| --------- | ------------------------ | --------- | ------------------------------------------ |
| `rootDir` | `string`                 | `'src'`   | source directory prefix to replace         |
| `outDir`  | `string`                 | `'dist'`  | built-output directory to point at         |
| `ext`     | `Record<string, string>` | see below | extension remap, merged over the defaults  |

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

## `wcbVsCodePlugin()`

Generates VS Code [custom data](https://github.com/microsoft/vscode-custom-data)
files from the manifest, so VS Code's built-in HTML and CSS language services
offer completions for your components with no editor extension.

```js
// custom-elements-manifest.config.mjs
import { wcbStaticProps, wcbVsCodePlugin } from 'web-component-base/cem-plugin'

export default {
  globs: ['src/**/*.ts'],
  outdir: '.wcb',
  plugins: [wcbStaticProps(), wcbVsCodePlugin()],
}
```

| Option         | Type             | Default                      |                                        |
| -------------- | ---------------- | ---------------------------- | -------------------------------------- |
| `outdir`       | `string`         | `'.wcb'`                     | directory to write into                |
| `htmlFileName` | `string \| null` | `'html-custom-data.json'`    | HTML file name, or `null` to skip      |
| `cssFileName`  | `string \| null` | `'css-custom-data.json'`     | CSS file name, or `null` to skip       |
| `exclude`      | `string[]`       | `[]`                         | declaration names to omit              |

Two files are written:

- `html-custom-data.json` — one tag per custom element, its attributes, and
  (when present) `@reference Name - url` links from the class JSDoc.
- `css-custom-data.json` — `@cssproperty` entries as `properties`, and
  `@csspart` entries as `::part(...)` `pseudoElements`.

VS Code's `html.customData` / `css.customData` paths resolve from the
**workspace root**, not from the settings file — point `outdir` and the setting
where they meet.

It replaces `cem-plugin-vs-code-custom-data-generator`: same one-`cem analyze`
output, but schema-valid files. That plugin writes `"references": [null]` for
any component without a `@reference` tag, which VS Code rejects — silently
dropping the whole tag.

See [Route 1 in the guide](/cem-plugin/#route-1-native-vs-code-no-extension).

## `wcbJetBrainsPlugin()`

Generates a JetBrains [web-types](https://github.com/JetBrains/web-types) file
from the manifest, so WebStorm and IntelliJ offer tag, attribute, property and
event completion. The two formats are unrelated, so a package that wants both
families ships both files.

```js
// custom-elements-manifest.config.mjs
import { wcbStaticProps, wcbJetBrainsPlugin } from 'web-component-base/cem-plugin'

export default {
  globs: ['src/**/*.ts'],
  outdir: '.wcb',
  plugins: [wcbStaticProps(), wcbJetBrainsPlugin()],
}
```

| Option        | Type             | Default             |                                            |
| ------------- | ---------------- | ------------------- | ------------------------------------------ |
| `outdir`      | `string`         | `'.wcb'`            | directory to write into                    |
| `fileName`    | `string \| null` | `'web-types.json'`  | file name, or `null` to skip               |
| `packageJson` | `boolean`        | `true`              | set the `web-types` field in `package.json` |
| `name`        | `string`         | from `package.json` | the `name` field in the output             |
| `version`     | `string`         | from `package.json` | the `version` field in the output          |
| `exclude`     | `string[]`       | `[]`                | declaration names to omit                  |

JetBrains discovers the file through the `web-types` field in `package.json`.
The plugin sets that field for you during `cem analyze` (pointing it at
`<outdir>/<fileName>` and keeping it in sync, the same way the analyzer
maintains `customElements`); pass `packageJson: false` to opt out. Include the
file in your `files` array to ship it.

See [JetBrains in the guide](/cem-plugin/#jetbrains-webstorm--intellij).
