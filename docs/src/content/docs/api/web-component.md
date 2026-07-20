---
title: WebComponent
slug: api/web-component
description: The WebComponent base class — static configuration, instance members, lifecycle hooks and attribute converters.
---

The base class every component extends. Import from the package root or its own
module:

```js
import { WebComponent } from 'web-component-base'
// or
import { WebComponent } from 'web-component-base/WebComponent.js'
```

`WebComponent` extends `HTMLElement`, so a subclass is registered with
`customElements.define()` like any other custom element.

In TypeScript, pass the shape of `static props` as a type argument to get a
typed `this.props`:

```ts
const props = { variant: 'primary', disabled: false }

class CozyButton extends WebComponent<typeof props> {
  static props = props
}
```

## Static properties

### `static props`

An object of declared prop names and their default values.

```js
static props = { count: 0, label: 'hi', disabled: false }
```

It drives three things at once:

- **Observed attributes.** Each key is kebab-cased, so `maxCount` observes
  `max-count`.
- **The runtime type guard.** The `typeof` each default becomes the prop's
  declared type. A write of a different type is rejected (see
  [`strictProps`](#static-strictprops)).
- **The compile-time type of `this.props`** when the object is passed as the
  class type argument.

Defaults are copied per instance with `structuredClone`, so object and array
defaults are never shared between instances. Values that cannot be cloned
(functions, class instances) are kept by reference instead of throwing.

On first use of each class, defaults that cannot reflect to an attribute are
reported with `console.warn`:

| Default            | Warning                                             |
| ------------------ | --------------------------------------------------- |
| a function or symbol | not reflectable — use handlers or refs instead     |
| `true`             | boolean defaults should be `false` — invert the name |

A `true` boolean default is discouraged because HTML has no true-by-default
boolean attribute: absence would have to mean both "false" and "default". Name
the prop for its `false` state (`disabled`, not `enabled`).

See it live: [Props blueprint demo ↗](https://demo.webcomponent.io/examples/props-blueprint/)

### `static styles`

CSS adopted into the shadow root as constructable stylesheet(s).

```js
static shadowRootInit = { mode: 'open' }
static styles = `p { color: red; }`
```

Accepts a string, a `CSSStyleSheet`, or an array mixing both. An array is
adopted in declaration order, so a shared token sheet can come first and
per-component rules after it. Strings are compiled to a `CSSStyleSheet` once;
existing `CSSStyleSheet` instances are adopted as-is and can be shared across
components.

Adoption happens **once per instance**, when the element is constructed — not
per render.

Requires [`shadowRootInit`](#static-shadowrootinit). Without a shadow root
there is nothing to adopt into, and the failure is reported with
`console.error` rather than thrown.

See it live: [Constructable styles demo ↗](https://demo.webcomponent.io/examples/constructed-styles/)

### `static shadowRootInit`

A [`ShadowRootInit`](https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow#options)
object. Its presence is what opts the component into shadow DOM — the shadow
root is attached during construction and becomes the render target.

```js
static shadowRootInit = { mode: 'open' }
```

Without it the component renders into its own light DOM.

See it live: [Shadow DOM demo ↗](https://demo.webcomponent.io/examples/use-shadow/)

### `static strictProps`

When `true`, assigning a value whose type does not match the declared type
throws a `TypeError`.

```js
static strictProps = true
```

The default is to report the violation with `console.error` and skip the write,
so a stray assignment cannot halt `render()` or `onChanges()`.

Either way, `null` and `undefined` are always allowed.

See it live: [Prop type enforcement demo ↗](https://demo.webcomponent.io/examples/strict-props/)

### `static get observedAttributes`

Returns the kebab-cased keys of [`static props`](#static-props). Provided by the
base class; you do not normally define it yourself.

## Instance properties

### `props`

Read-only accessor returning a `Proxy` over the component's prop values. Read
and write camelCase keys directly:

```js
this.props.count += 1
```

A write that changes the value reflects to the matching attribute through
[`toAttribute()`](#toattributename-value), which in turn triggers a render.
Assigning the value it already holds does nothing.

### `template`

Read-only getter returning what the component renders. Two kinds are supported:

- an [`html`](/api/html/) tagged template — a vnode tree, reconciled in place
  on re-render
- a **string** — assigned to the render target's `innerHTML`

Both render into the same target: the shadow root when `shadowRootInit` is set,
the element itself otherwise. Returning `` html`` `` (which is `undefined`) or
`''` empties the rendered subtree, which is how a component renders nothing
without disturbing light-DOM children a consumer slotted in.

Switching between the two kinds is safe in either direction: a string render
resets the vnode bookkeeping so the next vnode render rebuilds from scratch.

The base implementation returns `''`.

See it live: [Templating demo ↗](https://demo.webcomponent.io/examples/templating/)

### `render()`

Renders `template` into the render target. Called automatically on connect and
on every prop or attribute change; you rarely call it yourself.

For a vnode template, the new tree is compared against the previous one and
re-render **patches the existing DOM in place** — see
[Template vs Render](/template-vs-render/) for what that preserves and the
non-keyed matching caveat.

## Lifecycle hooks

Override any of these; all are no-ops by default.

| Hook              | When it runs                                          |
| ----------------- | ----------------------------------------------------- |
| `onInit()`        | on connect, before the first render                   |
| `afterViewInit()` | on connect, after the first render                    |
| `onChanges(changes)` | after an observed attribute changes                |
| `onDestroy()`     | when the element is disconnected                      |

On connect the order is always: default reflection → `onInit()` → `render()` →
`afterViewInit()`. Attribute-driven renders and `onChanges()` calls that the
platform fires *before* connect are buffered, so `onInit()` is guaranteed to run
before the first render even for attributes written in markup.

`onChanges()` receives:

| Field           | Type     | Description                                  |
| --------------- | -------- | -------------------------------------------- |
| `property`      | `string` | camelCase prop key, matching `props` access  |
| `attribute`     | `string` | kebab-case attribute name that changed       |
| `previousValue` | `any`    | value before the change                      |
| `currentValue`  | `any`    | value after the change                       |

See [Life-cycle Hooks](/life-cycle-hooks/) for worked examples. See it live: [Lifecycle order demo ↗](https://demo.webcomponent.io/examples/lifecycle-order/) and [onChanges payload demo ↗](https://demo.webcomponent.io/examples/on-changes/)

## Attribute converters

Override these to control how one prop crosses the prop/attribute boundary, and
call `super` for the props you do not handle.

### `toAttribute(name, value)`

Converts a prop value into the attribute value that reflects it.

| Parameter | Type     | Description                              |
| --------- | -------- | ---------------------------------------- |
| `name`    | `string` | camelCase prop key                       |
| `value`   | `any`    | the prop value being reflected           |
| **returns** | `string \| null` | the attribute value, or `null` to remove the attribute |

Returning `null` **removes** the attribute. That is how a `false` boolean
becomes an absent attribute, and it works for any prop.

```js
toAttribute(name, value) {
  if (name === 'point') return `${value.x},${value.y}`
  return super.toAttribute(name, value)
}
```

### `fromAttribute(name, value)`

Converts an attribute value into the prop value it represents — the inverse of
`toAttribute()`.

| Parameter | Type     | Description                                   |
| --------- | -------- | --------------------------------------------- |
| `name`    | `string` | camelCase prop key                            |
| `value`   | `string` | the attribute value, never `null`             |
| **returns** | `any`  | the value to store on `this.props[name]`      |

Only called for attributes that are **present**. Removal is handled by the
declared-default reset instead, so a converter never has to handle `null`.

A malformed value for a typed prop falls back to the raw string rather than
throwing, so `render()` and `onChanges()` are never skipped.

See it live: [Custom attribute converters demo ↗](https://demo.webcomponent.io/examples/attribute-converters/) and [Typed props demo ↗](https://demo.webcomponent.io/examples/type-restore/)

## Boolean props

Boolean props follow the HTML convention in both directions: **presence means
`true`, absence means `false`**.

| State   | Attribute            | `toAttribute` returns |
| ------- | -------------------- | --------------------- |
| `true`  | present, empty value | `''`                  |
| `false` | absent               | `null`                |

Any present value reads as `true` — including the literal `flag="false"`, just
as native `disabled="false"` is still disabled. Removing the attribute always
yields `false`, never the declared default.

Use `toggleAttribute(name, bool)` to set them. Writing
`setAttribute(name, String(bool))` always means `true`; wcb warns in the console
when it sees a boolean attribute written as `"true"` or `"false"` so the
inversion cannot fail silently.

Attributes whose `"false"` is meaningful — `aria-*`, `contenteditable` — should
be declared as **string** props.

See it live: [Boolean props demo ↗](https://demo.webcomponent.io/examples/boolean-props/)
