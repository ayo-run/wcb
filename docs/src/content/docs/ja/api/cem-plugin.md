---
title: cem-plugin
slug: 'ja/api/cem-plugin'
description: wcbStaticProps CEMアナライザープラグイン。
---

[`@custom-elements-manifest/analyzer`](https://custom-elements-manifest.open-wc.org/)向けのプラグインで、wcbの `static props` オブジェクトを読み取れるようにします。

```js
import { wcbStaticProps, distPaths } from 'web-component-base/cem-plugin'
// wcbStaticProps はモジュールのデフォルトエクスポートとしても利用できます
import wcbStaticProps from 'web-component-base/cem-plugin'
```

セットアップ、Storybookおよびエディタとの統合については、[CEMアナライザープラグインガイド](/cem-plugin/)を参照してください。

## `wcbStaticProps()`

引数を取らず、アナライザープラグインオブジェクトを返します。

| フィールド      | 型                    |                                     |
| -------------- | ----------------------- | ------------------------------------ |
| `name`         | `string`                | プラグイン名                     |
| `analyzePhase` | `(ctx: any) => void`    | アナライザーフック                   |

```js
// custom-elements-manifest.config.mjs
import { wcbStaticProps } from 'web-component-base/cem-plugin'

export default {
  globs: ['src/**/*.js'],
  outdir: '.',
  plugins: [wcbStaticProps()],
}
```

## 何をするか

`WebComponent` を拡張する各クラスについて、`static props` の初期化子を読み取り、各キーごとにマニフェストに次を記録します。

- そのcamelCase名での**メンバー**
- そのkebab-case名での**attribute**（そのメンバーに紐づく）
- デフォルト値から推測される**型**: `boolean`、`number`、`object`、`string` のいずれか
- 書かれたとおりの**デフォルト値**

これがなければ、アナライザーは `props` を1つの不透明な静的フィールドとして認識し、attributeを出力しないため、エディタの補完やStorybookのcontrolsには読み取るものが何もなくなります。

`static props` の初期化子は、同じソースファイル内でオブジェクトリテラルに解決される必要があります。

## `distPaths(options?)`

マニフェスト内の各モジュールの `path` を、スキャンされたソースからパッケージが公開するビルド済み出力へと書き換える、付随のプラグインです。これにより、公開される `custom-elements.json` は、消費者が実際にimportできるファイルを指すようになります。

```js
// custom-elements-manifest.config.mjs
import { wcbStaticProps, distPaths } from 'web-component-base/cem-plugin'

export default {
  globs: ['src/**/*.ts'],
  outdir: '.',
  plugins: [wcbStaticProps(), distPaths()],
}
```

| オプション    | 型                     | デフォルト  |                                                |
| --------- | ------------------------ | -------- | ---------------------------------------------- |
| `rootDir` | `string`                 | `'src'`  | 置き換え対象のソースディレクトリの接頭辞  |
| `outDir`  | `string`                 | `'dist'` | 指し示すビルド済み出力ディレクトリ             |
| `ext`     | `Record<string, string>` | 下記参照 | 拡張子のリマップ。デフォルトにマージされる     |

ゼロコンフィグでは `rootDir` の接頭辞を `outDir` にマッピングし、TypeScriptの拡張子を出力されたJS形式に書き換えます — `.ts` → `.js`、`.mts` → `.mjs`、
`.cts` → `.cjs`。それ以外の拡張子はそのまま通過するため、プレーンな `.js` のソースはディレクトリだけが入れ替わります。`options.ext` はそのデフォルトのマップにマージされます。

モジュールを指し示す参照（`exports[].declaration`、`superclass`、
`mixins[]`）もパスと一緒に書き換えられるため、消費者がたどる `module` は引き続きマニフェスト内のモジュールに解決されます。`package` を持つ参照は別のパッケージのレイアウトを指しているため、変更されずそのまま残されます。

これはアナライザーの `packageLinkPhase`（`wcbStaticProps` の
`analyzePhase` の後）で実行されるため、`plugins` 配列内での2つの順序は問題になりません。書き換えられたパスが指すファイルが存在するよう、ビルドの**後に** `cem analyze` を実行してください。[ガイド内の公開に関する注記](/cem-plugin/#パッケージにマニフェストを同梱するdistpaths)も参照してください。
