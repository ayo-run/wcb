---
title: 'Server-rendering wcb components'
slug: server-rendering
description: Initial state renders as plain HTML attributes from any server — Rails, Django, PHP, Astro — with no framework-specific SSR integration and no hydration step.
draft: true
---

Most component libraries need a server integration to render on the server: a
package that runs the component in Node, serialises its state, and re-attaches
it in the browser. wcb needs none, because a component's state **is** its
attributes.

Whatever renders your HTML — Rails, Django, PHP, Go templates, Astro, a static
site generator, a handwritten file — already knows how to write an attribute.
That is the whole integration.

```html
<!-- rendered by your server, with no JavaScript involved -->
<user-badge name="Ada" role="admin" verified></user-badge>
```

The page is meaningful before any JavaScript arrives. When the module loads,
the element upgrades and renders with `name`, `role` and `verified` already
set.

## Authored attributes win

The guarantee that makes this work: **a value in the markup is never
overwritten by a declared default.**

```js
class UserBadge extends WebComponent {
  static props = { name: 'Anonymous', role: 'guest', verified: false }
  get template() {
    return html`<span>${this.props.name} (${this.props.role})</span>`
  }
}
```

Rendered from the markup above, `props.name` is `'Ada'`, not `'Anonymous'`.
Defaults are reflected onto the host when the component connects, and that step
skips any attribute that is already present — so server-rendered state always
takes precedence over the component's own defaults. The constructor never
touches attributes at all, which is also what the custom elements spec
requires.

This is covered by the suite: see `does not overwrite a markup-provided
attribute with a default` in `test/WebComponent.test.mjs`.

## No hydration step

There is nothing to hydrate. The element upgrades, `onInit()` runs, and the
first render happens with the authored values already in `this.props` — `onInit`
is guaranteed to run before the first render even when the browser fires
attribute callbacks before connecting.

What you do **not** get is markup produced by your component's own `template` on
the server. wcb renders in the browser; the server renders the host element and
its attributes. In practice that means:

- Write the host element's server-side markup so the page is useful before the
  component upgrades — real text, or the element's own light-DOM children.
- Expect the component's rendered subtree to appear on upgrade. Style for that
  moment if the shift would be visible, with `:not(:defined)` or a reserved
  height.

## Serialising richer state

Attributes are strings, so anything that is not a string round-trips through
the serialisation layer: numbers, booleans and plain objects are JSON-encoded,
and the declared default's type decides how the string is parsed back.

Booleans follow HTML rather than JSON — write the bare attribute for `true` and
omit it entirely for `false`:

```html
<!-- correct -->
<user-badge verified></user-badge>
<user-badge></user-badge>

<!-- wrong: any present value is true, including this one -->
<user-badge verified="false"></user-badge>
```

For values with no useful string form — a `Date`, a class instance — declare a
[custom converter](/prop-access/#custom-attribute-conversion) so the server can
emit a format you control.

## Light DOM by default helps here

Because components render into the light DOM unless you opt into
[shadow DOM](/shadow-dom/), server-rendered children stay visible to page CSS
and to crawlers that do not execute JavaScript. A shadow root is still available
per component when you want encapsulation — but it is a choice you make, not the
default you have to work around.
