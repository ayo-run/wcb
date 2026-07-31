---
title: 样式
slug: 'zh-cn/styling'
---

有两种方式可以安全地实现作用域样式：

1. 使用样式对象
2. 使用 Shadow DOM 和可构造样式表

强烈推荐使用第二种方式，因为借助它，浏览器能在性能方面提供更多帮助。

## 使用样式对象

在使用内置的 `html` 函数编写标签模板时，可以为任意元素的 `style` 属性传入一个类型为 `Partial<CSSStyleDeclaration>` 的样式对象。这使得计算型和条件式样式成为可能。更多关于样式对象的内容参见 [MDN 文档](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleDeclaration)。

现在就用这个 [CodePen 示例 ↗](https://codepen.io/ayoayco-the-styleful/pen/bGzXjwQ?editors=1010) 试试，或查看实况：[样式对象演示 ↗](https://demo.webcomponent.io/examples/style-objects/)

```js
import { WebComponent } from 'https://esm.sh/web-component-base@latest'

class StyledElement extends WebComponent {
  static props = {
    emphasize: false,
    type: 'warn',
  }

  #typeStyles = {
    warn: {
      backgroundColor: 'yellow',
      border: '1px solid orange',
    },
    error: {
      backgroundColor: 'orange',
      border: '1px solid red',
    },
  }

  get template() {
    return html`
      <div
        style=${{
          ...this.#typeStyles[this.props.type],
          padding: '1em',
        }}
      >
        <p style=${{ fontStyle: this.props.emphasize && 'italic' }}>Wow!</p>
      </div>
    `
  }
}

customElements.define('styled-elements', StyledElement)
```

## 使用 Shadow DOM 和可构造样式表

如果你[使用 Shadow DOM](/zh-cn/shadow-dom)，可以添加一个 `static styles` 属性，它会被加入到 `shadowRoot` 的 [`adoptedStylesheets`](https://developer.mozilla.org/en-US/docs/Web/API/Document/adoptedStyleSheets) 中。它接受一个字符串、一个 `CSSStyleSheet`，或两者组成的数组。

现在就用这个 [CodePen 示例 ↗](https://codepen.io/ayoayco-the-styleful/pen/JojmeEe?editors=1010) 试试，或查看实况：[可构造样式演示 ↗](https://demo.webcomponent.io/examples/constructed-styles/)

```js
class StyledElement extends WebComponent {
  static shadowRootInit = {
    mode: 'open',
  }

  static styles = `
    div {
      background-color: yellow;
      border: 1px solid black;
      padding: 1em;

      p {
        text-decoration: underline;
      }
    }
  `

  get template() {
    return html`
      <div>
        <p>Wow!?</p>
      </div>
    `
  }
}

customElements.define('styled-elements', StyledElement)
```

### 组合多个样式表

传入一个数组即可采用多个样式表。它们会**按顺序**应用，因此在特异度相同的情况下，后面的条目生效。应将共享的令牌或基础样式表放在前面，组件自身的样式放在后面：

```js
// tokens.js：所有组件共享
export const tokens = `
  :host {
    --cozy-radius: 6px;
    --cozy-accent: rebeccapurple;
  }
`

// cozy-button.js
import { tokens } from './tokens.js'

class CozyButton extends WebComponent {
  static shadowRootInit = { mode: 'open' }
  static styles = [
    tokens,
    `
      button {
        border-radius: var(--cozy-radius);
        background: var(--cozy-accent);
      }
    `,
  ]
}
```

条目可以是字符串，也可以是现成的 [`CSSStyleSheet`](https://developer.mozilla.org/en-US/docs/Web/API/CSSStyleSheet) 对象，两者也可以混用。`CSSStyleSheet` 会被按原样采用而不是重新创建，因此可以只构造一次共享实例，供每个采用它的组件复用：

```js
const base = new CSSStyleSheet()
base.replaceSync(tokens)

class CozyBadge extends WebComponent {
  static shadowRootInit = { mode: 'open' }
  static styles = [base, `span { font-size: 0.8em; }`]
}
```

单个字符串的用法照旧完全不受影响。数组写法只是一种增量能力。
