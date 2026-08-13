---
title: Mga Halimbawa
slug: 'tl/examples'
description: 'Gallery ng mga tumatakbong wcb demo kasama ang source: boolean props, attribute converters, templating, Shadow DOM, lifecycle at iba pa.'
---

## Live demo gallery

Ang bawat halimbawa sa ibaba ay tumatakbo bilang standalone page sa
[demo.webcomponent.io ↗](https://demo.webcomponent.io/), isang live gallery na may
source katabi ng bawat demo.

| Demo                                                                                         | Ipinapakita                                                        |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| [Boolean props ↗](https://demo.webcomponent.io/examples/boolean-props/)                      | presence/absence reflection, `toggleAttribute`, `[flag]` selectors |
| [Custom attribute converters ↗](https://demo.webcomponent.io/examples/attribute-converters/) | `toAttribute`/`fromAttribute` para sa `Date` at array props        |
| [Props blueprint ↗](https://demo.webcomponent.io/examples/props-blueprint/)                  | `static props` bilang iisang source ng defaults at types           |
| [Prop type enforcement ↗](https://demo.webcomponent.io/examples/strict-props/)               | `static strictProps` at ang log-not-throw default                  |
| [Compile-time prop types ↗](https://demo.webcomponent.io/examples/typed-props/)              | pag-type ng `this.props` sa TypeScript                             |
| [Typed props ↗](https://demo.webcomponent.io/examples/type-restore/)                         | attribute round-trips na nagpapanumbalik ng declared type          |
| [Templating ↗](https://demo.webcomponent.io/examples/templating/)                            | string kumpara sa `html` tagged-template rendering                 |
| [Render reconciliation ↗](https://demo.webcomponent.io/examples/render-reconciliation/)      | in-place patching na nagpapanatili ng focus, caret, at input state |
| [Style objects ↗](https://demo.webcomponent.io/examples/style-objects/)                      | calculated at conditional styles gamit ang `style` prop            |
| [Shadow DOM ↗](https://demo.webcomponent.io/examples/use-shadow/)                            | `static shadowRootInit`                                            |
| [Constructable styles ↗](https://demo.webcomponent.io/examples/constructed-styles/)          | `static styles`, kasama ang pagsasama ng ilang sheet               |
| [Lifecycle order ↗](https://demo.webcomponent.io/examples/lifecycle-order/)                  | bawat hook na naka-log habang tumatakbo                            |
| [Attribute lifecycle ↗](https://demo.webcomponent.io/examples/attribute-lifecycle/)          | kung paano dinadala ng attribute changes ang mga hooks             |
| [onChanges payload ↗](https://demo.webcomponent.io/examples/on-changes/)                     | camelCase `property` kumpara sa kebab-case `attribute`             |
| [Just the parts ↗](https://demo.webcomponent.io/examples/just-parts/)                        | paggamit ng `html`/`createElement` nang walang base class          |
| [Kitchen sink ↗](https://demo.webcomponent.io/examples/demo/)                                | ilang feature na pinagsama                                         |
| [Single-file pen ↗](https://demo.webcomponent.io/examples/pens/counter-toggle.html)          | counter at toggle sa iisang HTML file                              |

## Mga halimbawa sa CodePen

### 1. To-Do App

Isang simpleng app na nagpapahintulot ng pagdagdag / pagtapos ng mga gawain:
[Tingnan sa CodePen ↗](https://codepen.io/ayoayco-the-styleful/pen/GRegyVe?editors=1010)

![To-Do App screen recording](/todo-app.gif)

### 2. Halimbawa ng Single HTML File

Narito ang isang halimbawa ng paggamit ng custom element sa iisang .html file.

```html
<!doctype html>
<html lang="en">
  <head>
    <title>WC Base Test</title>
    <script type="module">
      import { WebComponent } from 'https://esm.sh/web-component-base@latest'

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

### 3. Mga Feature Demo

Ilang feature-specific na demo:

1. [Context-Aware Post-Apocalyptic Human](https://codepen.io/ayoayco-the-styleful/pen/WNqJMNG?editors=1010)
1. [Simpleng reactive property](https://codepen.io/ayoayco-the-styleful/pen/ZEwoNOz?editors=1010)
1. [Counter & Toggle](https://codepen.io/ayoayco-the-styleful/pen/PoVegBK?editors=1010)
1. [Paggamit ng custom templating (lit-html)](https://codepen.io/ayoayco-the-styleful/pen/ZEwNJBR?editors=1010)
1. [Paggamit ng dynamic style objects](https://codepen.io/ayoayco-the-styleful/pen/bGzXjwQ?editors=1010)
1. [Paggamit ng Shadow DOM](https://codepen.io/ayoayco-the-styleful/pen/VwRYVPv?editors=1010)
1. [Paggamit ng tagged templates sa iyong vanilla custom element](https://codepen.io/ayoayco-the-styleful/pen/bGzJQJg?editors=1010)
