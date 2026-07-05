# Web Component Base

> [!Note]
> **What's next: correctness fixes.** Thanks to feedback from teams building on WCB, our immediate focus is a set of state-corruption fixes: no attribute writes in the constructor, correct handling of empty-string and removed attributes (so `render()`/`onChanges` are never silently skipped), removing the props proxy's first-write type lock, and safe cloning of `static props` defaults. Detailed issues will follow.

[![Package information: NPM version](https://img.shields.io/npm/v/web-component-base)](https://www.npmjs.com/package/web-component-base)
[![Package information: NPM license](https://img.shields.io/npm/l/web-component-base)](https://www.npmjs.com/package/web-component-base)
[![Package information: NPM downloads](https://img.shields.io/npm/dt/web-component-base)](https://www.npmjs.com/package/web-component-base)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/web-component-base)](#library-size)

🤷‍♂️ zero-dependency, 🤏 tiny JS base class for creating reactive [custom elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_Components/Using_custom_elements) easily ✨

![counter example code snippet](https://git.sr.ht/~ayoayco/wcb/blob/main/assets/IMG_0682.png)

When you extend the `WebComponent` class for your component, you only have to define the `template` and `properties`. Any change in any property value will automatically cause just the component UI to render.

The result is a reactive UI on property changes.

## Links

- [Documentation](https://webcomponent.io)
- [Read a blog explaining the reactivity](https://ayos.blog/reactive-custom-elements-with-html-dataset/)
- [View demo on CodePen](https://codepen.io/ayoayco-the-styleful/pen/ZEwoNOz?editors=1010)

## Want to get in touch?

There are many ways to get in touch:

1. Open a [GitHub issue](https://github.com/ayo-run/wcb/issues/new) or [discussion](https://github.com/ayo-run/wcb/discussions)
1. Submit a ticket via [SourceHut todo](https://todo.sr.ht/~ayoayco/wcb)
1. Email me: [hi@ayo.run](mailto:hi@ayo.run)

## Inspirations and thanks

1. [htm](https://github.com/developit/htm) - I use it for the `html` function for tagged templates, and take a lot of inspiration in building the rendering implementation. It is highly likely that I will go for what Preact is doing... but we'll see.
1. [fast](https://github.com/microsoft/fast) - When I found that Microsoft has their own base class I thought it was super cool!
1. [lit](https://github.com/lit/lit) - `lit-html` continues to amaze me and I worked to make `wcb` generic so I (and others) can continue to use it

---

_Just keep building._<br>
_A project by [Ayo](https://ayo.ayco.io)_
