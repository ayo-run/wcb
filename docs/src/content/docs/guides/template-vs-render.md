---
title: template vs render()
slug: template-vs-render
---

This mental model attempts to reduce the cognitive complexity of authoring components:

1. The `template` is a read-only property (initialized with a `get` keyword) that represents _how_ the component view is rendered.
1. There is a `render()` method that triggers a view render.
1. This `render()` method is _automatically_ called under the hood every time an attribute value changed.
1. You can _optionally_ call this `render()` method at any point to trigger a render if you need (eg, if you have private unobserved properties that need to manually trigger a render)
1. Overriding the `render()` function for handling a custom `template` is also possible. Here's an example of using `lit-html`: [View on CodePen ↗](https://codepen.io/ayoayco-the-styleful/pen/ZEwNJBR?editors=1010)

See it live: [Templating demo ↗](https://demo.webcomponent.io/examples/templating/) for the two template kinds, and [Render reconciliation demo ↗](https://demo.webcomponent.io/examples/render-reconciliation/) for what an in-place re-render preserves — focus, caret position and an uncommitted input value all survive.
