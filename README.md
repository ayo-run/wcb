# Web Component Base

> [!Note]
> **Correctness fixes shipped (v5.0.0)** — We now have better compliance with the custom elements specs, better property type handling and clearer distinction between attributes and property within `onChanges()` hook (breaking change). See the [change log](https://github.com/ayo-run/wcb/releases/tag/v5.0.0) for more details. Next up: **faster templates!**

[![Package information: NPM version](https://img.shields.io/npm/v/web-component-base)](https://www.npmjs.com/package/web-component-base)
[![Package information: NPM license](https://img.shields.io/npm/l/web-component-base)](https://www.npmjs.com/package/web-component-base)
[![Package information: NPM downloads](https://img.shields.io/npm/dt/web-component-base)](https://www.npmjs.com/package/web-component-base)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/web-component-base)](#library-size)

🤷‍♂️ zero-dependency, 🤏 tiny JS base class for creating reactive [custom elements](https://developer.mozilla.org/en-US/docs/Web/API/Web_Components/Using_custom_elements) easily ✨

This is the base class used for web components in Ayo's projects, primarily [cozy-games](https://git.ayo.run/ayo/cozy-games), [mcfly](https://git.ayo.run/ayo/mcfly/), his [personal site](https://ayo.ayco.io), his [blog](https://ayos.blog), and [others](https://git.ayo.run/ayo).

Read more about it on the [docs](https://webcomponent.io) or [view a demo on CodePen](https://codepen.io/ayoayco-the-styleful/pen/ZEwoNOz?editors=1010).

![counter example code snippet](https://git.sr.ht/~ayoayco/wcb/blob/main/assets/IMG_0682.png)

When you extend the `WebComponent` class for your component, you only have to define the `template` and `properties`. Any change in any property value will automatically cause just the component UI to render.

The result is a reactive UI on property changes.


## TypeScript: typed props

`this.props` is untyped (`{ [name: string]: any }`) by default. Pass the shape of your defaults as a type argument to get compile-time types on declared props:

```ts
const props = { variant: 'primary', disabled: false }

class CozyButton extends WebComponent<typeof props> {
  static props = props

  get template() {
    this.props.variant // string
    this.props.disabled // boolean
    this.props.disabled = 'yes' // ❌ compile error
    return html`<button class=${this.props.variant}></button>`
  }
}
```

The runtime is unchanged — this is types-only, and omitting the type argument keeps the previous behavior. See the [prop access guide](https://webcomponent.io/prop-access/) for details.

## Storybook autodocs & controls

Storybook infers autodocs and controls from a Custom Elements Manifest, but the stock analyzer reads `static props` as one opaque `object` and emits no attributes. `web-component-base/cem-plugin` teaches it the convention — dev-time only, so the core stays zero-dependency:

```js
// custom-elements-manifest.config.mjs
import { wcbStaticProps } from 'web-component-base/cem-plugin'

export default {
  globs: ['src/**/*.js'],
  outdir: '.',
  plugins: [wcbStaticProps()],
}
```

`npx cem analyze` then emits a typed attribute per prop — `variant` (string), `disabled` (boolean), `maxCount` → `max-count` (number) — named with wcb's own `getKebabCase` so they match `observedAttributes`, with wcb internals stripped. Point Storybook at the result:

```js
// .storybook/preview.js
import { setCustomElementsManifest } from '@storybook/web-components-vite'
import manifest from '../custom-elements.json'

setCustomElementsManifest(manifest)
export default { tags: ['autodocs'] }
```

A story only needs `component: 'cozy-button'` — no per-story `argTypes`. See the [full recipe](https://webcomponent.io/cem-plugin/), or the working setup in [`storybook/`](./storybook).

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
