---
title: 生命周期钩子
slug: 'zh-cn/life-cycle-hooks'
description: 四个生命周期钩子——onInit、afterViewInit、onChanges 和 onDestroy——各自的触发时机与用途。
---

通过提供钩子方法，为组件生命周期中的特定事件被触发时定义相应行为

查看实况：[生命周期顺序演示 ↗](https://demo.webcomponent.io/examples/lifecycle-order/) 会记录每个钩子的触发时机，[属性生命周期演示 ↗](https://demo.webcomponent.io/examples/attribute-lifecycle/) 展示属性变化如何驱动这些钩子。

### onInit()

- 当组件连接到 DOM 时触发
- 最适合用于组件的初始化设置

```js
import { WebComponent } from 'https://esm.sh/web-component-base@latest'

class ClickableText extends WebComponent {
  // 当组件在 HTML 文档中被使用时调用
  onInit() {
    this.onclick = () => console.log('>>> click!')
  }

  get template() {
    return `<span style="cursor:pointer">Click me!</span>`
  }
}
```

### afterViewInit()

- 在视图首次初始化之后触发

```js
class ClickableText extends WebComponent {
  // 当组件的 innerHTML 首次被填充时调用
  afterViewInit() {
    const footer = this.querySelector('footer')
    // 在视图初始化后对 footer 做一些操作
  }

  get template() {
    return `<footer>Awesome site &copy; 2023</footer>`
  }
}
```

### onDestroy()

- 当组件从 DOM 断开连接时触发
- 最适合用于撤销在 `onInit()` 中所做的任何设置

```js
import { WebComponent } from 'https://esm.sh/web-component-base@latest'

class ClickableText extends WebComponent {
  clickCallback() {
    console.log('>>> click!')
  }

  onInit() {
    this.onclick = this.clickCallback
  }

  onDestroy() {
    console.log('>>> removing event listener')
    this.removeEventListener('click', this.clickCallback)
  }

  get template() {
    return `<span style="cursor:pointer">Click me!</span>`
  }
}
```

### onChanges()

- 当某个属性值发生变化时触发
- `changes` 对象清晰地区分了**属性名（property）**与**特性名（attribute）**：
  - `property`：**驼峰式**的 prop 键名，与你访问 `props` 的方式一致（例如 `myName`）
  - `attribute`：发生变化的**短横线式**属性名（例如 `my-name`）
  - `previousValue` / `currentValue`：变化前后的值

使用 `property` 直接从 `props` 上读取值（`this.props[property]`）；需要原始属性名时使用 `attribute`。

查看实况：[onChanges 载荷演示 ↗](https://demo.webcomponent.io/examples/on-changes/)

```js
import { WebComponent } from 'https://esm.sh/web-component-base@latest'

class ClickableText extends WebComponent {
  // 当某个属性值发生变化时调用
  onChanges(changes) {
    const { property, attribute, previousValue, currentValue } = changes
    console.log('>>> ', { property, attribute, previousValue, currentValue })
  }

  get template() {
    return `<span style="cursor:pointer">Click me!</span>`
  }
}
```

:::caution[破坏性变更]
`onChanges` 的载荷现在清晰地区分了 **attribute 与 property**。此前 `property` 保存的是短横线式的*属性*名。现在它保存的是驼峰式的 *prop* 键名（与 `props` 访问方式一致），短横线式的属性名则移到了新增的 `attribute` 字段中。

```js
// 变更前
onChanges({ property /* 'my-name' */, previousValue, currentValue }) {}

// 变更后
onChanges({ property /* 'myName' */, attribute /* 'my-name' */, previousValue, currentValue }) {}
```

如果你此前是通过 `changes.property` 读取属性名的，请改为使用 `changes.attribute`。
:::

## 升级顺序与缓冲保证

根据自定义元素规范，当一个元素在标记中已带有属性的情况下被升级时（例如 `<my-el my-name="Zoe">`），浏览器会在 `connectedCallback` **之前**触发 `attributeChangedCallback`。从字面上理解，这意味着 `render()` 和 `onChanges()` 可能会在 `onInit()` 之前运行，因此你在 `onInit` 中所做的任何设置（事件绑定、读取外部状态）在首次渲染时可能还未发生。像 happy-dom/jsdom 这样的测试环境并不会复现这种顺序，因此组件可能在测试中通过，却在真实浏览器中出现异常行为。

`WebComponent` 消除了这个隐患。在元素连接**之前**到达的属性变化会被缓冲：

- **prop 值会被立即应用**，因此在 `onInit()` 内部 `this.props` 已经是正确的；
- **`render()` 和 `onChanges()` 的副作用会被推迟**，直到 `onInit()` 运行之后才执行。

在连接时，顺序始终是：

1. `onInit()`：`this.props` 已经反映了任何在标记中设置的属性
2. 一次 `render()`：一次性反映所有被缓冲的 props
3. `afterViewInit()`

**`onChanges()` 永远不会在 `onInit()` 之前触发。** 连接前的属性变化**不会**通过 `onChanges()` 被重放。首次 `render()` 已经反映了这些变化，因此 `onChanges()` 只保留给连接之后的真实变化使用。元素连接之后，属性变化的行为就恢复正常：每一次变化都会立即触发 `render()` 和 `onChanges()`。
