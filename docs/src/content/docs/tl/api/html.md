---
title: html
slug: 'tl/api/html'
description: Ang html tagged template function at ang vnode shape na ginagawa nito.
---

Isang tagged template function na ginagawang vnode tree ang markup, para gamitin bilang
[`template`](/api/web-component/#template) ng isang component.

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

Ito ay [htm](https://github.com/developit/htm) na naka-bind sa isang hyperscript factory, kaya
ina-apply ang buong htm syntax: standard na HTML, self-closing tags, `${}`
interpolation sa text at attribute positions, spread props (`...${obj}`), at
opsyonal na closing tags (`<//>`).

## Return value

| Markup            | Ibinabalik                                     |
| ----------------- | ------------------------------------------- |
| iisang root     | isang vnode object                            |
| ilang root     | isang array ng vnodes                          |
| wala           | `undefined`                                 |

Ang isang vnode ay plain object:

```js
html`<p class="a">hi</p>`
// { type: 'p', props: { class: 'a' }, children: ['hi'] }
```

| Field      | Type              | Paglalarawan                                          |
| ---------- | ----------------- | ---------------------------------------------------- |
| `type`     | `string`          | ang tag name                                         |
| `props`    | `object \| null`  | mga attribute at property ayon sa pagkakasulat                 |
| `children` | `any[]`           | mga child vnode at text; nananatiling raw value ang text     |

Dahil ang tree ay plain object, ito ay comparable at serializable, na siyang
nagbibigay-daan sa `render()` na i-diff ang isang render laban sa susunod.

Nagbabalik ng `undefined` ang `` html`` ``. Ito ang idiomatic na paraan para sa isang component na
mag-render ng wala, at pinapawalang-laman nito ang naka-render na subtree sa halip na iwanan
ang nakaraang render sa screen.

Tingnan ito nang live: [Templating demo ↗](https://demo.webcomponent.io/examples/templating/)

## Kung paano ina-apply ang mga props

Ang bawat entry sa `props` ay ina-apply ng [`applyProp`](/api/utils/#applypropel-prop-value),
sa pagkakasunod-sunod na ito:

1. ang `style` object ay ina-apply rule by rule
2. ang pangalan na pag-aari ng element bilang **DOM property** ay ina-assign sa property na iyon,
   kaya ang mga event handler (`onclick=${fn}`) at non-string na value ay pinapanatili ang kanilang type
3. ang boolean value na walang katugmang DOM property ay tino-toggle bilang HTML boolean
   attribute
4. anumang iba pa ay sini-serialize at ise-set bilang attribute

Ang parehong panuntunan ay ina-apply sa bagong likhang at pina-patch na elements, kaya kumikilos ang isang prop
nang pareho sa unang render at re-render.

Ang isang `style` prop ay tumatanggap ng object ng camelCase na CSS properties:

```js
html`<div style=${{ color: 'red', padding: '1em' }}>x</div>`
```

Tingnan ito nang live: [Style objects demo ↗](https://demo.webcomponent.io/examples/style-objects/)

## Muling pagre-render

Ang pagbabalik ng vnode tree ay nag-o-opt sa in-place reconciliation: ang mga element ng parehong
tag ay muling ginagamit, ang mga nagbagong prop at text lamang ang nagagalaw, at ang mga natirang node ay
tinatabas. Tingnan ang [Template vs Render](/template-vs-render/) para sa kung ano ang napapanatili nito
at ang non-keyed matching caveat. Tingnan ito nang live: [Render reconciliation demo ↗](https://demo.webcomponent.io/examples/render-reconciliation/)
