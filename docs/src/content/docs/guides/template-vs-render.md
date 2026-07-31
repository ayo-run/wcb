---
title: template vs render()
slug: template-vs-render
description: How the read-only template getter relates to render(), when render() is called for you, and how to override it for another templating library.
---

This mental model attempts to reduce the cognitive complexity of authoring components:

1. The `template` is a read-only property (initialized with a `get` keyword) that represents _how_ the component view is rendered.
1. There is a `render()` method that triggers a view render.
1. This `render()` method is _automatically_ called under the hood every time an attribute value changed.
1. You can _optionally_ call this `render()` method at any point to trigger a render if you need (eg, if you have private unobserved properties that need to manually trigger a render)
1. Overriding the `render()` function for handling a custom `template` is also possible. Here's an example of using `lit-html`: [View on CodePen ↗](https://codepen.io/ayoayco-the-styleful/pen/ZEwNJBR?editors=1010)

See it live: [Templating demo ↗](https://demo.webcomponent.io/examples/templating/) for the two template kinds, and [Render reconciliation demo ↗](https://demo.webcomponent.io/examples/render-reconciliation/) for what an in-place re-render preserves: focus, caret position and an uncommitted input value all survive.

## Composing components

A component's `template` can contain other components, nested as deep as you like:

```js
class CounterBoard extends WebComponent {
  static props = { title: 'Board' }
  get template() {
    return html`
      <h3>${this.props.title}</h3>
      <counter-row name="alpha"></counter-row>
      <counter-row name="bravo"></counter-row>
    `
  }
}
```

Each nested component **owns the DOM it renders for itself**. When an outer
component re-renders, the reconciler patches the props it passes down to a
nested element (that is how data flows from parent to child) but never touches
the element's own children, so a nested component keeps its rendered content
and any internal state even when an ancestor re-renders for an unrelated
reason. Data flows down as attributes, so pass values a nested component can
read back from an attribute: primitives, or objects/arrays that survive a
JSON round-trip. See it live: [Nested composition demo ↗](https://demo.webcomponent.io/examples/nested-composition/).

The one exception is **slot projection**: children you write _inside_ a
shadow-DOM component's tag are your content, projected into its `<slot>`, so the
parent keeps reconciling those. A light-DOM component, by contrast, renders over
its own children, so pass data to it through attributes rather than as projected
children.
