---
title: cem-plugin
slug: api/cem-plugin
description: The wcbStaticProps CEM analyzer plugin.
---

A plugin for
[`@custom-elements-manifest/analyzer`](https://custom-elements-manifest.open-wc.org/)
that teaches it to read wcb's `static props` object.

```js
import { wcbStaticProps } from 'web-component-base/cem-plugin'
// also available as the module's default export
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
