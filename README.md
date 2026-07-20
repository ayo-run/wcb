# Web Component Base

> [!Note]
> **HTML boolean attributes semantics shipped in v6** - A boolean
> prop follows the HTML convention in both directions: **presence means `true`,
> absence means `false`**. `true` reflects as a bare attribute and `false`
> removes it, so `toggleAttribute()` and `[attr]` CSS selectors finally work as
> expected.
>
> **Any present value is `true`** — including the literal `flag="false"`, just
> like native `disabled="false"` is still disabled. If you write boolean
> attributes as `setAttribute(name, String(bool))`, that now always means
> `true`; switch those call sites to `toggleAttribute(name, bool)`. wcb warns
> in the console when it sees a boolean attribute written as `"true"`/`"false"`
> so the change cannot fail silently. Attributes whose `"false"` is meaningful
> (`aria-*`, `contenteditable`) should be declared as **string** props.
>
> See [Prop Access](https://webcomponent.io/prop-access/#boolean-props) for details.

[![Package information: NPM version](https://img.shields.io/npm/v/web-component-base)](https://www.npmjs.com/package/web-component-base)
[![Package information: NPM license](https://img.shields.io/npm/l/web-component-base)](https://www.npmjs.com/package/web-component-base)
[![Package information: NPM downloads](https://img.shields.io/npm/dt/web-component-base)](https://www.npmjs.com/package/web-component-base)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/web-component-base)](#library-size)

🤷‍♂️ zero-dependency, 🤏 tiny JS base class for creating reactive [custom elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_Components/Using_custom_elements) easily ✨

This is the base class used for web components in Ayo's projects, primarily [cozy-games](https://git.ayo.run/ayo/cozy-games), [mcfly](https://git.ayo.run/ayo/mcfly/), his [personal site](https://ayo.ayco.io), his [blog](https://ayos.blog), and [others](https://git.ayo.run/ayo).

Next actions:

1. [Read the docs](https://webcomponent.io)
2. [View a demo on CodePen](https://codepen.io/ayoayco-the-styleful/pen/ZEwoNOz?editors=1010).

![counter example code snippet](https://git.sr.ht/~ayoayco/wcb/blob/main/assets/IMG_0682.png)

When you extend the `WebComponent` class for your component, you only have to define the `template` and `properties`. Any change in any property value will automatically cause just the component UI to render.

The result is a reactive UI on property changes.

When the `template` is an `html` tagged template (a vnode tree), a re-render **patches the existing DOM in place** instead of rebuilding it: elements of the same tag are reused, only changed props/attributes/text are touched, and leftover nodes are trimmed. Transient DOM state on the rendered nodes therefore survives a re-render — focus, caret/selection, an `<input>`'s uncommitted value, `:hover`, and running CSS transitions. A controlled text field can write every keystroke back to a prop without losing focus. The first render still builds the tree from scratch, and string templates still assign to `innerHTML`.

Patching is **index-based and non-keyed**: list items are matched by position, not identity. The resulting DOM is always correct, but preserved state follows the *position* rather than the *item* — remove the first row of a list and the node that held row 1 is rewritten to hold row 2, so a caret, an uncommitted value, or a running transition stays where it was while the content shifts under it. Fixed-order lists and append/remove-at-the-end are unaffected; reorderable lists of focusable or animated items are the sharp edge. A `key` prop for identity-based matching is not implemented.

## Want to get in touch?

There are many ways to get in touch:

1. Open a [GitHub issue](https://github.com/ayo-run/wcb/issues/new) or [discussion](https://github.com/ayo-run/wcb/discussions)
1. Submit a ticket via [SourceHut todo](https://todo.sr.ht/~ayoayco/wcb)
1. Email me: [hi@ayo.run](mailto:hi@ayo.run)

## Inspirations and thanks

1. [htm](https://github.com/developit/htm) - I use it for the `html` function for tagged templates, and take a lot of inspiration in building the rendering implementation. It is highly likely that I will go for what Preact is doing... but we'll see.
1. [fast](https://github.com/microsoft/fast) - When I found that Microsoft has their own base class I thought it was super cool!
1. [lit](https://github.com/lit/lit) - `lit-html` continues to amaze me and I worked to make `wcb` generic so I (and others) can continue to use it

## Size change log

See [`size-change-log.md`](./size-change-log.md) for a running record of how each correctness/feature change affects the `WebComponent` base class bundle size, with the reason and benefit of each.

---

_Just keep building._<br>
_A project by [Ayo](https://ayo.ayco.io)_
