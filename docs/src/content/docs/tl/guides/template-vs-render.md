---
title: template kumpara sa render()
slug: 'tl/template-vs-render'
description: Kung paano nag-uugnay ang read-only na template getter at ang render(), kailan awtomatikong tumatakbo ang render(), at paano ito i-override.
---

Sinusubukan ng mental model na ito na bawasan ang cognitive complexity ng pag-author ng mga component:

1. Ang `template` ay isang read-only property (naka-initialize gamit ang `get` keyword) na kumakatawan sa _paano_ nire-render ang view ng component.
1. May `render()` method na nagpapagana ng view render.
1. Ang `render()` method na ito ay _awtomatikong_ tinatawag sa likod ng eksena tuwing may nagbabagong value ng attribute.
1. Maaari mong _piliing_ tawagan ang `render()` method na ito kahit kailan para magpagana ng render kung kailangan (hal., kung may mga private unobserved properties ka na kailangang manu-manong magpagana ng render)
1. Posible ring i-override ang `render()` function para hawakan ang custom na `template`. Narito ang halimbawa ng paggamit ng `lit-html`: [Tingnan sa CodePen ↗](https://codepen.io/ayoayco-the-styleful/pen/ZEwNJBR?editors=1010)

Tingnan ito nang live: [Templating demo ↗](https://demo.webcomponent.io/examples/templating/) para sa dalawang uri ng template, at [Render reconciliation demo ↗](https://demo.webcomponent.io/examples/render-reconciliation/) para sa kung ano ang napapanatili ng in-place re-render: nananatili ang focus, posisyon ng caret, at ang uncommitted na value ng input.

## Pagsasama-sama ng mga component

Ang `template` ng isang component ay maaaring maglaman ng ibang mga component, na naka-nest nang kasindami ng gusto mo:

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

Ang bawat naka-nest na component ay **nagmamay-ari ng DOM na nire-render nito para sa sarili nito**. Kapag nag-re-render ang isang outer
component, ina-patch ng reconciler ang mga props na ipinapasa nito pababa sa isang
nested element (ganito dumadaloy ang data mula sa parent papunta sa child) ngunit hindi kailanman ginagalaw
ang sariling mga anak ng element, kaya pinananatili ng nested component ang naka-render nitong content
at anumang internal state kahit na nag-re-render ang ninuno nito dahil sa hindi kaugnay
na dahilan. Dumadaloy pababa ang data bilang attributes, kaya magpasa ng mga value na mababasa ulit ng
nested component mula sa isang attribute: mga primitive, o mga object/array na buo pa rin
matapos ang JSON round-trip. Tingnan ito nang live: [Nested composition demo ↗](https://demo.webcomponent.io/examples/nested-composition/).

Ang tanging eksepsyon ay ang **slot projection**: ang mga anak na isinusulat mo _sa loob_ ng
tag ng isang shadow-DOM component ay iyong content, na naka-project papunta sa `<slot>` nito, kaya
patuloy na ini-reconcile ng parent ang mga ito. Sa kabilang banda, ang isang light-DOM component ay nagre-render sa ibabaw
ng sarili nitong mga anak, kaya magpasa ng data dito sa pamamagitan ng attributes sa halip na bilang projected
na mga anak.
