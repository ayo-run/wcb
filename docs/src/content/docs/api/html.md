---
title: html
slug: api/html
description: The html tagged template function and the vnode shape it produces.
---

A tagged template function that turns markup into a vnode tree, for use as a
component's [`template`](/api/web-component/#template).

```js
import { html } from 'web-component-base'
// or
import { html } from 'web-component-base/html.js'
```

```js
get template() {
  return html`<p class="greeting">Hello, ${this.props.name}!</p>`
}
```

It is [htm](https://github.com/developit/htm) bound to a hyperscript factory, so
the full htm syntax applies: standard HTML, self-closing tags, `${}`
interpolation in text and attribute positions, spread props (`...${obj}`), and
optional closing tags (`<//>`).

## Return value

| Markup            | Returns                                     |
| ----------------- | ------------------------------------------- |
| a single root     | one vnode object                            |
| several roots     | an array of vnodes                          |
| nothing           | `undefined`                                 |

A vnode is a plain object:

```js
html`<p class="a">hi</p>`
// { type: 'p', props: { class: 'a' }, children: ['hi'] }
```

| Field      | Type              | Description                                          |
| ---------- | ----------------- | ---------------------------------------------------- |
| `type`     | `string`          | the tag name                                         |
| `props`    | `object \| null`  | attributes and properties as written                 |
| `children` | `any[]`           | child vnodes and text; text stays as a raw value     |

Because the tree is a plain object it is comparable and serializable, which is
what lets `render()` diff one render against the next.

`` html`` `` returns `undefined`. This is the idiomatic way for a component to
render nothing, and it empties the rendered subtree rather than leaving the
previous render on screen.

See it live: [Templating demo ↗](https://demo.webcomponent.io/examples/templating/)

## How props are applied

Each entry in `props` is applied by [`applyProp`](/api/utils/#applypropel-prop-value),
in this order:

1. a `style` object is applied rule by rule
2. a name the element owns as a **DOM property** is assigned to that property,
   so event handlers (`onclick=${fn}`) and non-string values keep their type
3. a boolean value with no matching DOM property is toggled as an HTML boolean
   attribute
4. anything else is serialized and set as an attribute

The same rule applies to freshly created and patched elements, so a prop behaves
identically on first render and re-render.

A `style` prop accepts an object of camelCase CSS properties:

```js
html`<div style=${{ color: 'red', padding: '1em' }}>x</div>`
```

See it live: [Style objects demo ↗](https://demo.webcomponent.io/examples/style-objects/)

## Re-rendering

Returning a vnode tree opts into in-place reconciliation: elements of the same
tag are reused, only changed props and text are touched, and leftover nodes are
trimmed. See [Template vs Render](/template-vs-render/) for what that preserves
and the non-keyed matching caveat. See it live: [Render reconciliation demo ↗](https://demo.webcomponent.io/examples/render-reconciliation/)
