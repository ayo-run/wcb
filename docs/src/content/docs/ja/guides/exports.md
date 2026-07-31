---
title: エクスポート
slug: 'ja/exports'
---

すべてを個別にインポートすることも、主要なエクスポートとユーティリティのそれぞれを1つのファイルとしてインポートすることもできます。

### 主要なエクスポート

```js
// すべてを1つのファイルで

import { WebComponent, html } from 'web-component-base'

// 個別のファイルで

import { WebComponent } from 'web-component-base/WebComponent.js'

import { html } from 'web-component-base/html.js'
```

### ユーティリティ

```js
// 1つのファイルで

import {
  serialize,
  deserialize,
  getCamelCase,
  getKebabCase,
  createElement,
  applyProp,
  patchNode,
  patchChildren,
} from 'web-component-base/utils'

// または個別のファイルで

import { serialize } from 'web-component-base/utils/serialize.js'

import { createElement } from 'web-component-base/utils/create-element.js'

// など...
```
