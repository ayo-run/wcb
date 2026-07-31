---
title: WebComponent
slug: 'zh-cn/api/web-component'
description: 'WebComponent 基类：静态配置、实例成员、生命周期钩子和属性转换器。'
---

每个组件都继承自这个基类。可以从包根路径或它自己的模块导入：

```js
import { WebComponent } from 'web-component-base'
// 或者
import { WebComponent } from 'web-component-base/WebComponent.js'
```

`WebComponent` 继承自 `HTMLElement`，因此子类会像任何其他自定义元素一样通过
`customElements.define()` 注册。

在 TypeScript 中，将 `static props` 的形状作为类型参数传入，即可获得带类型的
`this.props`：

```ts
type CozyButtonProps = {
  variant: 'primary' | 'ghost'
  disabled: boolean
}

class CozyButton extends WebComponent<CozyButtonProps> {
  static props: CozyButtonProps = {
    variant: 'primary',
    disabled: false,
  }
}
```

## 静态属性

### `static props`

一个由已声明的 prop 名称及其默认值组成的对象。

```js
static props = { count: 0, label: 'hi', disabled: false }
```

它同时驱动三件事：

- **被观察的属性。** 每个键都会被转换为短横线形式，因此 `maxCount` 会观察
  `max-count`。
- **运行时类型保护。** 每个默认值的 `typeof` 会成为该 prop 所声明的类型。
  写入不同类型的值会被拒绝（参见 [`strictProps`](#static-strictprops)）。
- **`this.props` 的编译期类型**，当该对象被作为类的类型参数传入时。

默认值会通过 `structuredClone` 为每个实例单独复制，因此对象和数组类型的
默认值永远不会在实例之间共享。无法被克隆的值（函数、类实例）会改为按
引用保留，而不会抛出异常。

在每个类首次使用时，无法反射到属性上的默认值会通过 `console.warn` 报告：

| 默认值              | 警告                                                 |
| -------------------- | --------------------------------------------------- |
| 函数或 symbol        | 无法反射：请改用处理函数或引用（refs）                |
| `true`                | 布尔型默认值应为 `false`：请反转命名方式              |

不建议使用 `true` 作为布尔型默认值，因为 HTML 没有默认为 true 的布尔属性：
不存在必须同时表示“false”和“默认值”。请针对 prop 的 `false` 状态命名
（用 `disabled`，而不是 `enabled`）。

查看实况：[Props 蓝图演示 ↗](https://demo.webcomponent.io/examples/props-blueprint/)

### `static styles`

被采纳到 shadow root 中的 CSS，形式为可构造样式表。

```js
static shadowRootInit = { mode: 'open' }
static styles = `p { color: red; }`
```

接受一个字符串、一个 `CSSStyleSheet`，或两者混合组成的数组。数组会按声明顺序被
采纳，因此可以将共享的令牌样式表放在前面，组件自身的规则放在后面。字符串只会
被编译为 `CSSStyleSheet` 一次；已有的 `CSSStyleSheet` 实例会被按原样采纳，
并可在多个组件之间共享。

采纳操作**每个实例只发生一次**，即在元素被构造时，而不是每次渲染时都发生。

需要配合 [`shadowRootInit`](#static-shadowrootinit) 使用。如果没有 shadow root，
就没有可供采纳的目标，此时失败会通过 `console.error` 报告，而不会抛出异常。

查看实况：[可构造样式演示 ↗](https://demo.webcomponent.io/examples/constructed-styles/)

### `static shadowRootInit`

一个 [`ShadowRootInit`](https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow#options)
对象。它的存在与否决定了组件是否启用 Shadow DOM。shadow root 会在构造期间
被附加，并成为渲染目标。

```js
static shadowRootInit = { mode: 'open' }
```

如果没有它，组件会渲染到自己的 light DOM 中。

查看实况：[Shadow DOM 演示 ↗](https://demo.webcomponent.io/examples/use-shadow/)

### `static strictProps`

当值为 `true` 时，为某个 prop 赋予与所声明类型不匹配的值会抛出 `TypeError`。

```js
static strictProps = true
```

默认行为是通过 `console.error` 报告该违规并跳过该次写入，因此一次意外的赋值
不会中断 `render()` 或 `onChanges()`。

无论哪种模式，`null` 和 `undefined` 都始终被允许。

查看实况：[Prop 类型强制演示 ↗](https://demo.webcomponent.io/examples/strict-props/)

### `static get observedAttributes`

返回 [`static props`](#static-props) 的键名的短横线形式。由基类提供；你通常
不需要自己定义它。

## 实例属性

### `props`

一个只读的访问器，返回组件 prop 值的一个 `Proxy`。可以直接读写驼峰式键名：

```js
this.props.count += 1
```

一次改变了值的写入会通过 [`toAttribute()`](#toattributename-value) 反射到
对应的属性上，进而触发一次渲染。如果赋的值与当前值相同，则不会有任何操作。

### `template`

一个只读的 getter，返回组件所渲染的内容。支持两种形式：

- 一个 [`html`](/api/html/) 标签模板：一棵 vnode 树，会在重新渲染时原地协调
- 一个**字符串**：被赋值给渲染目标的 `innerHTML`

两者都渲染到同一个目标：如果设置了 `shadowRootInit`，则渲染到 shadow root，
否则渲染到元素自身。返回 `` html`` ``（即 `undefined`）或 `''` 会清空已渲染的
子树，这也是组件在不干扰消费者插入的 light-DOM 子节点的情况下“渲染为空”的方式。

在两种形式之间切换在任一方向上都是安全的：字符串渲染会重置 vnode 的记录，
使下一次 vnode 渲染从头开始重建。

基类的实现返回 `''`。

查看实况：[模板化演示 ↗](https://demo.webcomponent.io/examples/templating/)

### `render()`

将 `template` 渲染到渲染目标中。在连接时以及每次 prop 或属性发生变化时都会自动
调用；你很少需要自己调用它。

对于 vnode 模板，新的树会与前一棵树进行比较，重新渲染会**原地 patch 现有的 DOM**。
关于这会保留哪些内容以及非 keyed 匹配的注意事项，参见
[Template vs Render](/template-vs-render/)。

## 生命周期钩子

可以重写以下任意方法；它们默认都是空操作。

| 钩子                  | 触发时机                                              |
| --------------------- | ------------------------------------------------------ |
| `onInit()`            | 连接时，在首次渲染之前                                  |
| `afterViewInit()`     | 连接时，在首次渲染之后                                  |
| `onChanges(changes)`  | 某个被观察属性发生变化之后                               |
| `onDestroy()`         | 元素断开连接时                                          |

在连接时，顺序始终是：默认值反射 → `onInit()` → `render()` → `afterViewInit()`。
平台在连接*之前*触发的属性驱动的渲染和 `onChanges()` 调用会被缓冲，因此即便
是标记中写入的属性，也能保证 `onInit()` 在首次渲染之前运行。

`onChanges()` 接收：

| 字段             | 类型     | 说明                                          |
| ---------------- | -------- | --------------------------------------------- |
| `property`       | `string` | 驼峰式的 prop 键名，与 `props` 访问方式一致    |
| `attribute`      | `string` | 发生变化的短横线式属性名                       |
| `previousValue`  | `any`    | 变化前的值                                     |
| `currentValue`   | `any`    | 变化后的值                                     |

关于实践示例参见 [生命周期钩子](/life-cycle-hooks/)。查看实况：
[生命周期顺序演示 ↗](https://demo.webcomponent.io/examples/lifecycle-order/)
和 [onChanges 载荷演示 ↗](https://demo.webcomponent.io/examples/on-changes/)

## 属性转换器

重写以下方法可以控制某个 prop 如何跨越 prop/attribute 边界，对于不处理的 prop
请调用 `super`。

默认的转换会将值通过 JSON 进行往返转换。JSON 无法还原的类型（`Date`、`Map`、
`Set`、`URL`、类实例）需要重写转换器才能存在于 `static props` 上；参见
[自定义属性转换](/prop-access/#custom-attribute-conversion) 了解实践示例，
包括不可序列化的情形。

### `toAttribute(name, value)`

将一个 prop 值转换为反射它的属性值。

| 参数       | 类型              | 说明                                          |
| ---------- | ----------------- | --------------------------------------------- |
| `name`     | `string`          | 驼峰式的 prop 键名                             |
| `value`    | `any`             | 正在被反射的 prop 值                           |
| **返回值** | `string \| null`  | 属性值，或 `null` 表示移除该属性                |

返回 `null` 会**移除**该属性。这正是 `false` 布尔值变为不存在属性的方式，
且适用于任何 prop。

```js
toAttribute(name, value) {
  if (name === 'point') return `${value.x},${value.y}`
  return super.toAttribute(name, value)
}
```

### `fromAttribute(name, value)`

将一个属性值转换为它所代表的 prop 值，是 `toAttribute()` 的逆操作。

| 参数       | 类型     | 说明                                          |
| ---------- | -------- | --------------------------------------------- |
| `name`     | `string` | 驼峰式的 prop 键名                             |
| `value`    | `string` | 属性值，永远不为 `null`                        |
| **返回值** | `any`    | 要存储到 `this.props[name]` 上的值             |

只会针对**存在**的属性被调用。移除操作由所声明默认值的重置逻辑处理，因此
转换器永远不需要处理 `null`。

对于带类型的 prop，一个格式不正确的值会回退为原始字符串而不会抛出异常，
因此 `render()` 和 `onChanges()` 永远不会被跳过。

查看实况：[自定义属性转换器演示 ↗](https://demo.webcomponent.io/examples/attribute-converters/)
和 [带类型的 props 演示 ↗](https://demo.webcomponent.io/examples/type-restore/)

## 布尔型 props

布尔型 props 在两个方向上都遵循 HTML 的约定：**存在即为 `true`，不存在即为
`false`**。

| 状态    | 属性                 | `toAttribute` 返回值 |
| ------- | -------------------- | --------------------- |
| `true`  | 存在，空值            | `''`                  |
| `false` | 不存在                | `null`                |

任何存在的值都会被读作 `true`，包括字面量 `flag="false"`，正如原生的
`disabled="false"` 依然是禁用状态一样。移除该属性总是得到 `false`，而永远
不会回到所声明的默认值。

使用 `toggleAttribute(name, bool)` 来设置它们。写
`setAttribute(name, String(bool))` 总是意味着 `true`；当 wcb 检测到某个布尔
属性被写为 `"true"` 或 `"false"` 时，会在控制台中发出警告，因此这种反转不会
静默出错。

`"false"` 有意义的属性（`aria-*`、`contenteditable`）应当被声明为**字符串**
类型的 props。

查看实况：[布尔 props 演示 ↗](https://demo.webcomponent.io/examples/boolean-props/)
