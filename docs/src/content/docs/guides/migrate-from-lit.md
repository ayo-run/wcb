---
title: 'Migrating from Lit to wcb'
slug: migrate-from-lit
description: A field-by-field map from LitElement to WebComponent — properties, render, styles and lifecycle — and the three differences that need a decision rather than a rename.
draft: true
---

Most of a `LitElement` component translates mechanically. This page is the map,
followed by the three differences that are not renames and need a decision.

For what you give up and gain in bytes and features, see
[wcb vs Lit vs FAST](/comparison/).

## The same component, both ways

```js title="Lit"
import { LitElement, html } from 'lit'

export class Counter extends LitElement {
  static properties = { count: { type: Number } }

  constructor() {
    super()
    this.count = 0
  }

  render() {
    return html`<button @click=${() => this.count++}>${this.count}</button>`
  }
}
customElements.define('my-counter', Counter)
```

```js title="wcb"
import { WebComponent, html } from 'web-component-base'

export class Counter extends WebComponent {
  static props = { count: 0 }

  get template() {
    return html`
      <button onClick=${() => ++this.props.count}>${this.props.count}</button>
    `
  }
}
customElements.define('my-counter', Counter)
```

The declared default (`count: 0`) carries the type, so there is no separate
`{ type: Number }` and no constructor.

## Field map

| Lit | wcb | Notes |
| --- | --- | --- |
| `static properties = { x: { type: Number } }` | `static props = { x: 0 }` | The default's `typeof` is the type. See [Prop Access](/prop-access/) |
| `this.x` | `this.props.x` | Writing reflects to the attribute, which triggers the render |
| `render()` returning `html` | `get template()` | A getter, not a method — assigning to it throws |
| `@click=${fn}` | `onClick=${fn}` | wcb uses the DOM property name |
| `static styles = css\`…\`` | `static styles = '…'` | A string, `CSSStyleSheet`, or an array. **Requires a shadow root** — see below |
| `connectedCallback()` | `onInit()` | No `super()` call needed |
| `firstUpdated()` | `afterViewInit()` | |
| `updated(changed)` | `onChanges({ property, attribute, previousValue, currentValue })` | One call per attribute, not a batched map |
| `disconnectedCallback()` | `onDestroy()` | |
| `requestUpdate()` | `render()` | Call it directly; see [template vs render()](/template-vs-render/) |
| `reflect: true` | *always on* | Props are attribute-backed by definition |
| `converter` | `toAttribute()` / `fromAttribute()` | Overridden per component, `super` for the rest |

## The three that are not renames

### 1. Light DOM is the default

Lit attaches a shadow root unless you opt out. wcb renders into the light DOM
unless you opt **in** with
[`static shadowRootInit`](/shadow-dom/).

This is the difference most likely to surprise you mid-migration, because it
changes two things at once: page CSS now reaches inside your component, and
`static styles` stops working — constructable stylesheets need a shadow root.
Porting a component that relied on shadow encapsulation means adding:

```js
static shadowRootInit = { mode: 'open' }
```

Without it, `static styles` is silently inert. Components that were happy to
inherit page styles can drop the shadow root and use plain CSS, or
[style objects](/styling/).

### 2. There is no update batching

Lit coalesces property writes into one asynchronous update and gives you
`updateComplete` to await. wcb renders **per prop write**, synchronously.

```js
// Lit: one render
this.a = 1
this.b = 2

// wcb: two renders
this.props.a = 1
this.props.b = 2
```

For the component sizes wcb is built for this is rarely worth optimising. When
it is, batch the state yourself in an object prop, or set the values on a
private field and call `render()` once. There is no `updateComplete` to await —
the DOM is already updated when the assignment returns.

### 3. Lists are reconciled by position, not by key

Lit's `repeat` directive moves DOM nodes to follow their keys. wcb's reconciler
is index-based: it walks children by position, reuses same-tag elements, and
trims the tail. Reordering a keyed list will reuse the wrong nodes, which shows
up as component state landing on the wrong row.

If your component reorders lists and the rows hold their own state, that is the
case wcb does not cover — and a genuine reason to stay on Lit.

## What comes along unchanged

Custom element registration, attributes, slots, events, and `part`/`::part`
styling are all platform features, not library features. Consumers of your
component do not need to know it changed libraries: the tag, its attributes and
its events stay exactly as they were.
