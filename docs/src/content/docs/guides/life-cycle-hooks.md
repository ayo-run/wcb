---
title: Life-Cycle Hooks
slug: life-cycle-hooks
---

Define behavior when certain events in the component's life cycle is triggered by providing hook methods

### onInit()

- Triggered when the component is connected to the DOM
- Best for setting up the component

```js
import { WebComponent } from 'https://unpkg.com/web-component-base@latest/index.js'

class ClickableText extends WebComponent {
  // gets called when the component is used in an HTML document
  onInit() {
    this.onclick = () => console.log('>>> click!')
  }

  get template() {
    return `<span style="cursor:pointer">Click me!</span>`
  }
}
```

### afterViewInit()

- Triggered after the view is first initialized

```js
class ClickableText extends WebComponent {
  // gets called when the component's innerHTML is first filled
  afterViewInit() {
    const footer = this.querySelector('footer')
    // do stuff to footer after view is initialized
  }

  get template() {
    return `<footer>Awesome site &copy; 2023</footer>`
  }
}
```

### onDestroy()

- Triggered when the component is disconnected from the DOM
- best for undoing any setup done in `onInit()`

```js
import { WebComponent } from 'https://unpkg.com/web-component-base@latest/index.js'

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

- Triggered when an attribute value changed
- The `changes` object cleanly separates the **property** from the **attribute**:
  - `property` — the **camelCase** prop key, matching how you access `props` (e.g. `myName`)
  - `attribute` — the **kebab-case** attribute name that changed (e.g. `my-name`)
  - `previousValue` / `currentValue` — the values before and after the change

Use `property` to read the value straight off `props` (`this.props[property]`); use `attribute` when you need the raw attribute name.

```js
import { WebComponent } from 'https://unpkg.com/web-component-base@latest/index.js'

class ClickableText extends WebComponent {
  // gets called when an attribute value changes
  onChanges(changes) {
    const { property, attribute, previousValue, currentValue } = changes
    console.log('>>> ', { property, attribute, previousValue, currentValue })
  }

  get template() {
    return `<span style="cursor:pointer">Click me!</span>`
  }
}
```

:::caution[Breaking change]
The `onChanges` payload now draws a clear **attribute vs. property** distinction. Previously `property` held the kebab-case _attribute_ name. It now holds the camelCase _prop_ key (matching `props` access), and the kebab-case attribute name moved to the new `attribute` field.

```js
// before
onChanges({ property /* 'my-name' */, previousValue, currentValue }) {}

// after
onChanges({ property /* 'myName' */, attribute /* 'my-name' */, previousValue, currentValue }) {}
```

If you previously read `changes.property` for the attribute name, switch to `changes.attribute`.
:::
