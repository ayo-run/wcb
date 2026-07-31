---
title: 工具函数
slug: 'zh-cn/api/utils'
description: 大小写转换、属性序列化、元素创建以及 vnode 协调器。
---

`WebComponent` 内部使用的辅助函数，均已导出供你直接使用。可以从 `utils`
入口统一导入，也可以分别从各自模块导入：

```js
import { serialize, getKebabCase } from 'web-component-base/utils'
// 或者
import { serialize } from 'web-component-base/utils/serialize.js'
```

查看实况：[只使用部分能力演示 ↗](https://demo.webcomponent.io/examples/just-parts/) 在不继承基类的情况下，仅使用这些辅助函数构建了一个组件。

## 大小写转换

### `getCamelCase(kebab)`

将短横线式的属性名转换为其驼峰式的 prop 键名。

| 参数        | 类型     |                          |
| ----------- | -------- | ------------------------ |
| `kebab`     | `string` | 属性名                    |
| **返回值**  | `string` | prop 键名                 |

```js
getCamelCase('max-count') // 'maxCount'
```

### `getKebabCase(str)`

将驼峰式的 prop 键名转换为其短横线式的属性名。这就是 `observedAttributes`
所使用的映射方式。

| 参数        | 类型     |                          |
| ----------- | -------- | ------------------------ |
| `str`       | `string` | prop 键名                 |
| **返回值**  | `string` | 属性名                    |

```js
getKebabCase('maxCount') // 'max-count'
```

连续的大写字母会被视为同一个单词，因此 `parseHTML` 会变为 `parse-html`。

## 属性序列化

### `serialize(value)`

将一个值转换为其属性字符串形式。

| 参数        | 类型     |                                        |
| ----------- | -------- | -------------------------------------- |
| `value`     | `any`    | 要序列化的值                            |
| **返回值**  | `string` | 属性值                                  |

数字、布尔值和对象会经过 `JSON.stringify`；字符串及其他类型会原样通过。

### `deserialize(value, type)`

将一个属性字符串解析回指定所声明类型的值，是 `serialize()` 的逆操作。

| 参数        | 类型     |                                                     |
| ----------- | -------- | --------------------------------------------------- |
| `value`     | `string` | 属性值                                              |
| `type`      | `string` | `'boolean'`、`'number'`、`'object'`、`'undefined'` 或 `'string'` |
| **返回值**  | `any`    | 解析后的值                                          |

`'boolean'` 始终返回 `true`：这是严格的 HTML 布尔属性语义，任何存在的值
都为 true。不存在的情况由调用方处理，不会到达这里。`'number'`、`'object'`
和 `'undefined'` 使用 `JSON.parse`，遇到格式错误的输入会抛出异常；字符串
则原样通过。

## 元素

### `createElement(tree)`

从一棵 vnode 树构建真实的 DOM。

| 参数        | 类型     |                                                      |
| ----------- | -------- | ---------------------------------------------------- |
| `tree`      | `any`    | 一个 vnode、一个 vnode 数组，或一个文本值              |
| **返回值**  | `Node`   | 一个元素、一个 `DocumentFragment`，或一个文本节点       |

数组会变为一个 `DocumentFragment`；没有 `type` 的值会变为一个文本节点。
props 通过 `applyProp()` 应用，子节点则递归创建。

### `applyProp(el, prop, value)`

将单个 vnode prop 应用到一个元素上，遵循
[html](/api/html/#how-props-are-applied) 中所描述的规则。

| 参数      | 类型      |                                    |
| --------- | --------- | ---------------------------------- |
| `el`      | `Element` | 要应用该 prop 的元素                |
| `prop`    | `string`  | vnode 中所写的 prop 名               |
| `value`   | `any`     | prop 值                            |

它与协调器共享，因此一个被 patch 的元素获得 props 的规则与一个新创建的
元素完全一致。

## 协调器

这些函数支撑着 [Template vs Render](/template-vs-render/) 中所描述的原地
重新渲染。匹配方式是**基于索引且非 keyed** 的。

### `patchChildren(parent, oldChildren, newChildren)`

将一个父节点的子节点从一份 vnode 列表协调为另一份，原地 patch 匹配项并
裁剪多余的部分。

| 参数           | 类型   |                                                |
| -------------- | ------ | ---------------------------------------------- |
| `parent`       | `Node` | 要 patch 进去的父节点                            |
| `oldChildren`  | `any`  | 之前的 vnode 子节点，或之前的树                   |
| `newChildren`  | `any`  | 新的 vnode 子节点，或新的树                       |

### `patchNode(parent, dom, oldVnode, newVnode)`

协调单个节点位置。当 vnode 类型匹配时复用 `dom`，否则替换它。

| 参数       | 类型              |                                          |
| ---------- | ----------------- | ----------------------------------------- |
| `parent`   | `Node`            | 正在被 patch 的父节点                       |
| `dom`      | `Node \| null`    | 该索引位置上现有的节点（如果有）              |
| `oldVnode` | `any`             | 生成 `dom` 的 vnode（如果已知）              |
| `newVnode` | `any`             | 要渲染的 vnode                             |
