---
title: 导出
slug: 'zh-cn/exports'
description: 包提供的全部导入路径：WebComponent 与 html 主导出，以及工具函数，可整体导入或分模块导入。
---

你可以分别单独导入各项内容，也可以为主要导出项和工具函数各使用一个统一文件导入。

### 主要导出

```js
// 全部在一个文件中

import { WebComponent, html } from 'web-component-base'

// 或分别放在不同文件中

import { WebComponent } from 'web-component-base/WebComponent.js'

import { html } from 'web-component-base/html.js'
```

### 工具函数

```js
// 在一个文件中

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

// 或分别放在不同文件中

import { serialize } from 'web-component-base/utils/serialize.js'

import { createElement } from 'web-component-base/utils/create-element.js'

// 等等...
```
