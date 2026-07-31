---
title: cem-plugin
slug: 'zh-cn/api/cem-plugin'
description: wcbStaticProps CEM 分析器插件。
---

一个用于
[`@custom-elements-manifest/analyzer`](https://custom-elements-manifest.open-wc.org/)
的插件，教会它读取 wcb 的 `static props` 对象。

```js
import { wcbStaticProps, distPaths } from 'web-component-base/cem-plugin'
// wcbStaticProps 也可以作为该模块的默认导出使用
import wcbStaticProps from 'web-component-base/cem-plugin'
```

关于安装配置、Storybook 和编辑器集成，参见 [CEM 分析器插件指南](/zh-cn/cem-plugin/)。

## `wcbStaticProps()`

不接受任何参数，返回一个分析器插件对象。

| 字段            | 类型                  |                                     |
| --------------- | --------------------- | ----------------------------------- |
| `name`          | `string`              | 插件名称                             |
| `analyzePhase`  | `(ctx: any) => void`  | 分析器钩子                            |

```js
// custom-elements-manifest.config.mjs
import { wcbStaticProps } from 'web-component-base/cem-plugin'

export default {
  globs: ['src/**/*.js'],
  outdir: '.',
  plugins: [wcbStaticProps()],
}
```

## 它做了什么

对于每个继承自 `WebComponent` 的类，它会读取 `static props` 的初始化内容，
并为每个键在清单中记录：

- 以其驼峰式名称记录的**成员（member）**
- 以其短横线式名称记录、并关联到该成员的**属性（attribute）**
- 从默认值推断出的**类型**：`boolean`、`number`、`object` 或 `string`
- 编写时的**默认值**

如果没有这个插件，分析器会将 `props` 视为一个不透明的静态字段，不会生成
任何属性，导致编辑器补全和 Storybook 控件无内容可读。

`static props` 的初始化表达式必须在同一源文件中解析为一个对象字面量。

## `distPaths(options?)`

一个配套插件，将清单中每个模块的 `path` 从被扫描的源文件路径重写为包所
发布的构建产物路径，使发布出去的 `custom-elements.json` 指向消费者实际能
导入的文件。

```js
// custom-elements-manifest.config.mjs
import { wcbStaticProps, distPaths } from 'web-component-base/cem-plugin'

export default {
  globs: ['src/**/*.ts'],
  outdir: '.',
  plugins: [wcbStaticProps(), distPaths()],
}
```

| 选项       | 类型                      | 默认值    |                                                |
| ---------- | ------------------------- | --------- | ---------------------------------------------- |
| `rootDir`  | `string`                  | `'src'`   | 要替换的源目录前缀                              |
| `outDir`   | `string`                  | `'dist'`  | 要指向的构建产物目录                            |
| `ext`      | `Record<string, string>`  | 见下文     | 扩展名重映射，会与默认值合并                     |

零配置情况下，它会将 `rootDir` 前缀映射为 `outDir`，并将 TypeScript
扩展名重写为其编译后的 JS 形式——`.ts` → `.js`、`.mts` → `.mjs`、
`.cts` → `.cjs`。其他扩展名会原样通过，因此一个普通的 `.js` 源文件只会
替换其目录部分。`options.ext` 会与该默认映射合并。

指向某个模块的引用——`exports[].declaration`、`superclass`、
`mixins[]`——也会与路径一起被重写，因此消费者所跟随的 `module` 仍然会
解析到清单中的某个模块。携带 `package` 的引用指向的是另一个包的目录结构，
会保持不变。

它运行在分析器的 `packageLinkPhase` 中（在 `wcbStaticProps` 的
`analyzePhase` 之后），因此在 `plugins` 数组中两者的顺序无关紧要。请在
构建之后运行 `cem analyze`，以确保重写路径所指向的文件确实存在。参见
[指南中关于发布的说明](/zh-cn/cem-plugin/#随包发布清单文件distpaths)。
