---
title: Examples
slug: examples
---

## Live demo gallery

Every example below runs as a standalone page at
[demo.webcomponent.io ↗](https://demo.webcomponent.io/) — a live gallery with
the source alongside each demo.

| Demo | Shows |
| ---- | ----- |
| [Boolean props ↗](https://demo.webcomponent.io/examples/boolean-props/) | presence/absence reflection, `toggleAttribute`, `[flag]` selectors |
| [Custom attribute converters ↗](https://demo.webcomponent.io/examples/attribute-converters/) | `toAttribute`/`fromAttribute` for `Date` and array props |
| [Props blueprint ↗](https://demo.webcomponent.io/examples/props-blueprint/) | `static props` as the single source of defaults and types |
| [Prop type enforcement ↗](https://demo.webcomponent.io/examples/strict-props/) | `static strictProps` and the log-not-throw default |
| [Compile-time prop types ↗](https://demo.webcomponent.io/examples/typed-props/) | typing `this.props` in TypeScript |
| [Typed props ↗](https://demo.webcomponent.io/examples/type-restore/) | attribute round-trips restoring the declared type |
| [Templating ↗](https://demo.webcomponent.io/examples/templating/) | string vs `html` tagged-template rendering |
| [Render reconciliation ↗](https://demo.webcomponent.io/examples/render-reconciliation/) | in-place patching preserving focus, caret and input state |
| [Style objects ↗](https://demo.webcomponent.io/examples/style-objects/) | calculated and conditional styles via the `style` prop |
| [Shadow DOM ↗](https://demo.webcomponent.io/examples/use-shadow/) | `static shadowRootInit` |
| [Constructable styles ↗](https://demo.webcomponent.io/examples/constructed-styles/) | `static styles`, including composing several sheets |
| [Lifecycle order ↗](https://demo.webcomponent.io/examples/lifecycle-order/) | each hook logged as it fires |
| [Attribute lifecycle ↗](https://demo.webcomponent.io/examples/attribute-lifecycle/) | how attribute changes drive the hooks |
| [onChanges payload ↗](https://demo.webcomponent.io/examples/on-changes/) | camelCase `property` vs kebab-case `attribute` |
| [Just the parts ↗](https://demo.webcomponent.io/examples/just-parts/) | using `html`/`createElement` without the base class |
| [Kitchen sink ↗](https://demo.webcomponent.io/examples/demo/) | several features together |
| [Single-file pen ↗](https://demo.webcomponent.io/examples/pens/counter-toggle.html) | counter and toggle in one HTML file |

## CodePen examples

### 1. To-Do App

A simple app that allows adding / completing tasks:
[View on CodePen ↗](https://codepen.io/ayoayco-the-styleful/pen/GRegyVe?editors=1010)

![To-Do App screen recording](https://raw.githubusercontent.com/ayoayco/web-component-base/main/assets/todo-app.gif)

### 2. Single HTML file Example

Here is an example of using a custom element in a single .html file.

```html
<!doctype html>
<html lang="en">
  <head>
    <title>WC Base Test</title>
    <script type="module">
      import { WebComponent } from 'https://unpkg.com/web-component-base@latest/dist/index.js'

      class HelloWorld extends WebComponent {
        static props = {
          myName: 'World',
        }
        get template() {
          return `<h1>Hello ${this.props.myName}!</h1>`
        }
      }

      customElements.define('hello-world', HelloWorld)
    </script>
  </head>
  <body>
    <hello-world my-name="Ayo"></hello-world>
    <script>
      const helloWorld = document.querySelector('hello-world')
      setTimeout(() => {
        helloWorld.props.myName = 'Ayo zzzZzzz'
      }, 2500)
    </script>
  </body>
</html>
```

### 3. Feature Demos

Some feature-specific demos:

1. [Context-Aware Post-Apocalyptic Human](https://codepen.io/ayoayco-the-styleful/pen/WNqJMNG?editors=1010)
1. [Simple reactive property](https://codepen.io/ayoayco-the-styleful/pen/ZEwoNOz?editors=1010)
1. [Counter & Toggle](https://codepen.io/ayoayco-the-styleful/pen/PoVegBK?editors=1010)
1. [Using custom templating (lit-html)](https://codepen.io/ayoayco-the-styleful/pen/ZEwNJBR?editors=1010)
1. [Using dynamic style objects](https://codepen.io/ayoayco-the-styleful/pen/bGzXjwQ?editors=1010)
1. [Using the Shadow DOM](https://codepen.io/ayoayco-the-styleful/pen/VwRYVPv?editors=1010)
1. [Using tagged templates in your vanilla custom element](https://codepen.io/ayoayco-the-styleful/pen/bGzJQJg?editors=1010)
