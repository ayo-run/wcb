---
title: cem-plugin
slug: 'tl/api/cem-plugin'
description: Ang wcbStaticProps CEM analyzer plugin.
---

Isang plugin para sa
[`@custom-elements-manifest/analyzer`](https://custom-elements-manifest.open-wc.org/)
na nagtuturo dito na basahin ang `static props` object ng wcb.

```js
import { wcbStaticProps, distPaths } from 'web-component-base/cem-plugin'
// wcbStaticProps is also available as the module's default export
import wcbStaticProps from 'web-component-base/cem-plugin'
```

Tingnan ang [gabay sa CEM Analyzer Plugin](/cem-plugin/) para sa setup, Storybook, at
editor integration.

## `wcbStaticProps()`

Walang tinatanggap na argumento at nagbabalik ng analyzer plugin object.

| Field          | Type                    |                                     |
| -------------- | ----------------------- | ----------------------------------- |
| `name`         | `string`                | ang pangalan ng plugin                     |
| `analyzePhase` | `(ctx: any) => void`    | ang analyzer hook                   |

```js
// custom-elements-manifest.config.mjs
import { wcbStaticProps } from 'web-component-base/cem-plugin'

export default {
  globs: ['src/**/*.js'],
  outdir: '.',
  plugins: [wcbStaticProps()],
}
```

## Ano ang ginagawa nito

Para sa bawat class na nagpapalawig sa `WebComponent`, binabasa nito ang `static props`
initializer at, para sa bawat key, itinatala sa manifest ang:

- ang **member** sa ilalim ng camelCase na pangalan nito
- ang **attribute** sa ilalim ng kebab-case na pangalan nito, na naka-link sa member na iyon
- ang **type** na hinango mula sa default value: `boolean`, `number`, `object`
  o `string`
- ang **default value** ayon sa pagkakasulat

Kung wala ito, nakikita ng analyzer ang `props` bilang iisang opaque na static field at walang inilalabas
na attributes, kaya walang mababasa ang editor completion at Storybook controls.

Ang `static props` initializer ay dapat mag-resolve sa isang object literal sa parehong
source file.

## `distPaths(options?)`

Isang companion plugin na muling nagsusulat sa `path` ng bawat module sa manifest mula sa
na-scan na source tungo sa built output na ipinu-publish ng isang package, kaya ang isang naipadalang
`custom-elements.json` ay itinuturo sa mga file na aktwal na ma-import ng mga consumer.

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
| `rootDir` | `string`                 | `'src'`  | source directory prefix na papalitan     |
| `outDir`  | `string`                 | `'dist'` | built-output directory na ituturo             |
| `ext`     | `Record<string, string>` | tingnan sa ibaba | extension remap, na naka-merge sa ibabaw ng defaults     |

Sa zero-config, mine-map nito ang `rootDir` prefix tungo sa `outDir` at muling isinusulat ang mga extension
ng TypeScript tungo sa kanilang emitted JS form — `.ts` → `.js`, `.mts` → `.mjs`,
`.cts` → `.cjs`. Dumadaan ang ibang extension, kaya ang plain na `.js` source ay
ang directory lang nito ang napapalitan. Ang `options.ext` ay nagme-merge sa ibabaw ng default map na iyon.

Ang mga reference na tumuturo pabalik sa isang module — `exports[].declaration`, `superclass`,
`mixins[]` — ay muling isinusulat kasabay ng mga path, kaya ang `module` na sinusundan ng
consumer ay nagre-resolve pa rin sa isang module sa manifest. Ang isang reference na may hawak na
`package` ay nagpapangalan ng layout ng ibang package at hindi ginagalaw.

Tumatakbo ito sa `packageLinkPhase` ng analyzer (pagkatapos ng `analyzePhase` ng `wcbStaticProps`),
kaya hindi mahalaga ang pagkakasunod-sunod ng dalawa sa `plugins` array.
Patakbuhin ang `cem analyze` pagkatapos ng iyong build para umiral ang mga file na itinuturo ng muling isinulat na mga path. Tingnan ang [publishing note sa
gabay](/cem-plugin/#ship-the-manifest-with-a-package-distpaths).
