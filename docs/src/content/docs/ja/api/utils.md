---
title: ユーティリティ
slug: 'ja/api/utils'
description: ケース変換、attributeのシリアライズ、要素の作成、vnode reconciler。
---

`WebComponent` が内部で使用しているヘルパー群です。直接使用できるようエクスポートされています。`utils` エントリポイントから、または各モジュールを個別にインポートしてください。

```js
import { serialize, getKebabCase } from 'web-component-base/utils'
// または
import { serialize } from 'web-component-base/utils/serialize.js'
```

実際に動く様子はこちら: [一部だけを使うデモ ↗](https://demo.webcomponent.io/examples/just-parts/)は、これらのヘルパーからベースクラスを拡張せずにコンポーネントを構築しています。

## ケース変換

### `getCamelCase(kebab)`

kebab-caseのattribute名を、対応するcamelCaseのpropキーに変換します。

| パラメータ   | 型     |                          |
| ----------- | -------- | ------------------------ |
| `kebab`     | `string` | attribute名       |
| **戻り値** | `string` | propキー             |

```js
getCamelCase('max-count') // 'maxCount'
```

### `getKebabCase(str)`

camelCaseのpropキーを、対応するkebab-caseのattribute名に変換します。これは `observedAttributes` が使うマッピングです。

| パラメータ   | 型     |                          |
| ----------- | -------- | ------------------------ |
| `str`       | `string` | propキー             |
| **戻り値** | `string` | attribute名       |

```js
getKebabCase('maxCount') // 'max-count'
```

連続する大文字は1つの単語として扱われるため、`parseHTML` は
`parse-html` になります。

## Attributeのシリアライズ

### `serialize(value)`

値をそのattribute文字列形式に変換します。

| パラメータ   | 型     |                                        |
| ----------- | -------- | -------------------------------------- |
| `value`     | `any`    | シリアライズする値                 |
| **戻り値** | `string` | attribute値                    |

number、boolean、objectは `JSON.stringify` を通ります。文字列とそれ以外はそのまま変更なく通過します。

### `deserialize(value, type)`

attribute文字列を、指定された宣言済みの型の値にパースし直します。`serialize()` の逆です。

| パラメータ   | 型     |                                                     |
| ----------- | -------- | --------------------------------------------------- |
| `value`     | `string` | attribute値                                 |
| `type`      | `string` | `'boolean'`、`'number'`、`'object'`、`'undefined'`、`'string'` のいずれか |
| **戻り値** | `any`    | パースされた値                                    |

`'boolean'` は常に `true` を返します。これは厳密なHTMLのboolean属性の意味論であり、存在する値はどれもtrueになります。不在の場合は呼び出し元が処理し、ここには到達しません。`'number'`、`'object'`、`'undefined'` は `JSON.parse` を使い、不正な入力に対しては例外をスローします。文字列はそのまま通過します。

## 要素

### `createElement(tree)`

vnodeツリーから実際のDOMを構築します。

| パラメータ   | 型     |                                                      |
| ----------- | -------- | ---------------------------------------------------- |
| `tree`      | `any`    | vnode、vnodeの配列、またはテキスト値          |
| **戻り値** | `Node`   | 要素、`DocumentFragment`、またはテキストノード      |

配列は `DocumentFragment` になります。`type` を持たない値はテキストノードになります。propは `applyProp()` で適用され、子要素は再帰的に作成されます。

### `applyProp(el, prop, value)`

[html](/api/html/#propの適用方法)で説明されているルールを使い、単一のvnode propを要素に適用します。

| パラメータ | 型      |                                    |
| --------- | --------- | ---------------------------------- |
| `el`      | `Element` | propを適用する要素    |
| `prop`    | `string`  | vnodeに書かれたとおりのprop名 |
| `value`   | `any`     | prop値                     |

reconcilerと共有されているため、パッチされた要素も新規作成された要素とまったく同じルールでpropを取得します。

## Reconciler

これらは、[Template vs Render](/template-vs-render/)で説明されているインプレースの再レンダリングを支えています。マッチングは**インデックスベースで非キー**です。

### `patchChildren(parent, oldChildren, newChildren)`

親ノードの子要素を、あるvnodeリストから別のvnodeリストへと調整し、一致するものをその場でパッチし、余った要素を削除します。

| パラメータ     | 型   |                                                |
| ------------- | ------ | ---------------------------------------------- |
| `parent`      | `Node` | パッチを適用する親ノード                  |
| `oldChildren` | `any`  | 以前のvnodeの子要素、または以前のツリー  |
| `newChildren` | `any`  | 新しいvnodeの子要素、または新しいツリー            |

### `patchNode(parent, dom, oldVnode, newVnode)`

単一のノード位置を調整します。vnodeの型が一致する場合は `dom` を再利用し、それ以外の場合は置き換えます。

| パラメータ  | 型              |                                          |
| ---------- | ----------------- | ---------------------------------------- |
| `parent`   | `Node`            | パッチされている親ノード            |
| `dom`      | `Node \| null`    | このインデックスにある既存のノード（あれば）   |
| `oldVnode` | `any`             | `dom` を生成したvnode（分かっていれば）   |
| `newVnode` | `any`             | レンダリングするvnode                      |
