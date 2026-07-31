---
title: WebComponent
slug: 'tl/api/web-component'
description: 'Ang WebComponent base class: static configuration, instance members, lifecycle hooks, at attribute converters.'
---

Ang base class na pinapalawig ng bawat component. I-import mula sa root ng package o sa
sarili nitong module:

```js
import { WebComponent } from 'web-component-base'
// or
import { WebComponent } from 'web-component-base/WebComponent.js'
```

Ang `WebComponent` ay nagpapalawig sa `HTMLElement`, kaya ang isang subclass ay ire-register gamit ang
`customElements.define()` tulad ng kahit anong custom element.

Sa TypeScript, ipasa ang shape ng `static props` bilang type argument para makakuha ng
typed na `this.props`:

```ts
type CozyButtonProps = {
  variant: 'primary' | 'ghost'
  disabled: boolean
}

class CozyButton extends WebComponent<CozyButtonProps> {
  static props: CozyButtonProps = {
    variant: 'primary',
    disabled: false,
  }
}
```

## Mga Static property

### `static props`

Isang object ng mga na-declare na prop names at ang kanilang mga default value.

```js
static props = { count: 0, label: 'hi', disabled: false }
```

Nagpapagana ito ng tatlong bagay nang sabay-sabay:

- **Ang observed attributes.** Ang bawat key ay kebab-cased, kaya ang `maxCount` ay obserbado bilang
  `max-count`.
- **Ang runtime type guard.** Ang `typeof` ng bawat default ay nagiging na-declare na
  type ng prop. Ang pagsulat ng ibang type ay tinatanggihan (tingnan ang
  [`strictProps`](#static-strictprops)).
- **Ang compile-time type ng `this.props`** kapag ipinasa ang object bilang
  class type argument.

Ang mga default ay kinokopya bawat instance gamit ang `structuredClone`, kaya ang mga default na object at array
ay hindi kailanman ibinabahagi sa pagitan ng mga instance. Ang mga value na hindi maaaring ma-clone
(functions, class instances) ay pinapanatili sa pamamagitan ng reference sa halip na magtapon ng error.

Sa unang paggamit ng bawat class, ang mga default na hindi maaaring mag-reflect sa isang attribute ay
iniuulat gamit ang `console.warn`:

| Default            | Babala                                             |
| ------------------ | --------------------------------------------------- |
| isang function o symbol | hindi reflectable: gumamit ng handlers o refs sa halip |
| `true`             | dapat `false` ang boolean defaults: baligtarin ang pangalan |

Hindi hinihikayat ang `true` na boolean default dahil walang true-by-default na
boolean attribute ang HTML: kailangang mangahulugan ng absence ng kapwa "false" at "default". Pangalanan
ang prop batay sa `false` na estado nito (`disabled`, hindi `enabled`).

Tingnan ito nang live: [Props blueprint demo ↗](https://demo.webcomponent.io/examples/props-blueprint/)

### `static styles`

CSS na na-adopt sa shadow root bilang constructable stylesheet(s).

```js
static shadowRootInit = { mode: 'open' }
static styles = `p { color: red; }`
```

Tumatanggap ng string, isang `CSSStyleSheet`, o isang array na naghahalo ng dalawa. Ang array ay
ina-adopt ayon sa pagkakasunod-sunod ng declaration, kaya ang isang shared token sheet ay maaaring pumasok muna at
mga per-component na rules pagkatapos nito. Ang mga string ay kino-compile sa isang `CSSStyleSheet` nang isang beses;
ang mga umiiral nang `CSSStyleSheet` instance ay ina-adopt as-is at maaaring ibahagi sa
mga component.

Nangyayari ang adoption **nang isang beses bawat instance**, kapag na-construct ang element, hindi
bawat render.

Nangangailangan ng [`shadowRootInit`](#static-shadowrootinit). Kung walang shadow root,
walang ma-a-adopt-an, at ang kabiguan ay iniuulat gamit ang `console.error` sa halip na itapon.

Tingnan ito nang live: [Constructable styles demo ↗](https://demo.webcomponent.io/examples/constructed-styles/)

### `static shadowRootInit`

Isang [`ShadowRootInit`](https://developer.mozilla.org/en-US/docs/Web/API/Element/attachShadow#options)
na object. Ang presensya nito ang nag-o-opt sa component papunta sa shadow DOM. Ang shadow
root ay naka-attach habang naka-construct at nagiging render target.

```js
static shadowRootInit = { mode: 'open' }
```

Kung wala ito, nagre-render ang component sa sarili nitong light DOM.

Tingnan ito nang live: [Shadow DOM demo ↗](https://demo.webcomponent.io/examples/use-shadow/)

### `static strictProps`

Kapag `true`, ang pag-assign ng value na ang type ay hindi tumutugma sa na-declare na type
ay magtatapon ng `TypeError`.

```js
static strictProps = true
```

Ang default ay ang pag-uulat ng paglabag gamit ang `console.error` at ang paglaktaw sa write,
kaya hindi mapipigilan ng isang liblib na assignment ang `render()` o `onChanges()`.

Sa alinmang paraan, palaging pinapayagan ang `null` at `undefined`.

Tingnan ito nang live: [Prop type enforcement demo ↗](https://demo.webcomponent.io/examples/strict-props/)

### `static get observedAttributes`

Ibinabalik ang mga kebab-cased na key ng [`static props`](#static-props). Ibinibigay ng
base class; karaniwang hindi mo na ito tinutukoy mismo.

## Mga Instance property

### `props`

Read-only na accessor na nagbabalik ng `Proxy` sa ibabaw ng mga prop value ng component. Basahin
at sulatan nang direkta ang mga camelCase key:

```js
this.props.count += 1
```

Ang isang write na nagbabago sa value ay nag-re-reflect sa katugmang attribute sa pamamagitan ng
[`toAttribute()`](#toattributename-value), na sa gilid nito ay nagpapagana ng render.
Walang ginagawa ang pag-assign ng value na hawak na nito.

### `template`

Read-only na getter na nagbabalik ng ire-render ng component. Dalawang uri ang suportado:

- isang [`html`](/tl/api/html/) tagged template: isang vnode tree, na ini-reconcile in place
  sa bawat re-render
- isang **string**: ina-assign sa `innerHTML` ng render target

Kapwa nagre-render sa parehong target: ang shadow root kapag naka-set ang `shadowRootInit`,
ang element mismo kung hindi. Ang pagbabalik ng `` html`` `` (na `undefined`) o
`''` ay nagpapawalang-laman sa naka-render na subtree, na ganito nagre-render ng wala
ang isang component nang hindi ginagambala ang light-DOM na mga anak na na-slot ng consumer.

Ligtas ang paglipat sa pagitan ng dalawang uri sa alinmang direksyon: ang string render
ay nagri-reset sa vnode bookkeeping kaya ang susunod na vnode render ay muling bubuuin mula sa umpisa.

Ang base implementation ay nagbabalik ng `''`.

Tingnan ito nang live: [Templating demo ↗](https://demo.webcomponent.io/examples/templating/)

### `render()`

Nagre-render ng `template` sa render target. Awtomatikong tinatawag sa pag-connect at
sa bawat pagbabago ng prop o attribute; bihira mo itong tawagin mismo.

Para sa vnode template, ang bagong tree ay inihahambing laban sa nauna at
**pina-patch ng re-render ang umiiral na DOM in place**. Tingnan ang
[Template vs Render](/tl/template-vs-render/) para sa kung ano ang napapanatili nito at ang
non-keyed matching caveat.

## Mga Lifecycle hook

I-override ang alinman sa mga ito; lahat ay no-ops bilang default.

| Hook              | Kailan tumatakbo                                      |
| ----------------- | ----------------------------------------------------- |
| `onInit()`        | sa pag-connect, bago ang unang render                 |
| `afterViewInit()` | sa pag-connect, pagkatapos ng unang render             |
| `onChanges(changes)` | matapos magbago ang isang observed attribute       |
| `onDestroy()`     | kapag na-disconnect ang element                        |

Sa pag-connect, ang pagkakasunod-sunod ay palaging: default reflection → `onInit()` → `render()` →
`afterViewInit()`. Ang mga attribute-driven na render at `onChanges()` calls na tinatawag ng
platform *bago* mag-connect ay naka-buffer, kaya garantisadong tatakbo ang `onInit()`
bago ang unang render kahit para sa mga attribute na isinulat sa markup.

Ang `onChanges()` ay tumatanggap ng:

| Field           | Type     | Paglalarawan                                  |
| --------------- | -------- | -------------------------------------------- |
| `property`      | `string` | camelCase na prop key, tumutugma sa `props` access  |
| `attribute`     | `string` | kebab-case na attribute name na nagbago       |
| `previousValue` | `any`    | value bago ang pagbabago                      |
| `currentValue`  | `any`    | value pagkatapos ng pagbabago                 |

Tingnan ang [Life-cycle Hooks](/tl/life-cycle-hooks/) para sa mga worked example. Tingnan ito nang live: [Lifecycle order demo ↗](https://demo.webcomponent.io/examples/lifecycle-order/) at [onChanges payload demo ↗](https://demo.webcomponent.io/examples/on-changes/)

## Mga Attribute converter

I-override ang mga ito para kontrolin kung paano tumatawid ang isang prop sa hangganan ng prop/attribute, at
tawagin ang `super` para sa mga prop na hindi mo hinahawakan.

Ina-round-trip ng default na conversion ang mga value sa pamamagitan ng JSON. Ang mga type na hindi maibabalik ng JSON
(`Date`, `Map`, `Set`, `URL`, class instances) ay nangangailangan ng na-override na
converters para manatili sa `static props`; tingnan ang
[Custom attribute conversion](/tl/prop-access/#custom-na-attribute-conversion) para sa
mga worked example, kasama ang mga non-serializable na kaso.

### `toAttribute(name, value)`

Kino-convert ang isang prop value tungo sa attribute value na nagre-reflect nito.

| Parameter | Type     | Paglalarawan                              |
| --------- | -------- | ---------------------------------------- |
| `name`    | `string` | camelCase na prop key                       |
| `value`   | `any`    | ang prop value na ire-reflect           |
| **ibinabalik** | `string \| null` | ang attribute value, o `null` para tanggalin ang attribute |

Ang pagbabalik ng `null` ay **nagtatanggal** ng attribute. Ganito nagiging
absent attribute ang isang `false` na boolean, at gumagana ito para sa kahit anong prop.

```js
toAttribute(name, value) {
  if (name === 'point') return `${value.x},${value.y}`
  return super.toAttribute(name, value)
}
```

### `fromAttribute(name, value)`

Kino-convert ang isang attribute value tungo sa prop value na kinakatawan nito, ang kabaligtaran ng
`toAttribute()`.

| Parameter | Type     | Paglalarawan                                   |
| --------- | -------- | --------------------------------------------- |
| `name`    | `string` | camelCase na prop key                            |
| `value`   | `string` | ang attribute value, hindi kailanman `null`             |
| **ibinabalik** | `any`  | ang value na ilalagay sa `this.props[name]`      |

Tinatawag lamang para sa mga attribute na **present**. Ang pagtanggal ay hinahawakan ng
declared-default reset sa halip, kaya hindi na kailangang hawakan ng converter ang `null`.

Ang isang malformed na value para sa isang typed prop ay babalik sa raw string sa halip na
magtapon ng error, kaya hindi kailanman nilalaktawan ang `render()` at `onChanges()`.

Tingnan ito nang live: [Custom attribute converters demo ↗](https://demo.webcomponent.io/examples/attribute-converters/) at [Typed props demo ↗](https://demo.webcomponent.io/examples/type-restore/)

## Mga Boolean prop

Ang mga boolean prop ay sumusunod sa HTML convention sa magkabilang direksyon: **ang presence ay nangangahulugang
`true`, ang absence ay nangangahulugang `false`**.

| State   | Attribute            | Ibinabalik ng `toAttribute` |
| ------- | -------------------- | --------------------- |
| `true`  | present, empty value | `''`                  |
| `false` | absent               | `null`                |

Anumang present na value ay babasahin bilang `true`, kasama ang literal na `flag="false"`, tulad
mismo ng native na `disabled="false"` na disabled pa rin. Ang pagtanggal ng attribute ay palaging
nagbubunga ng `false`, hindi kailanman ng na-declare na default.

Gamitin ang `toggleAttribute(name, bool)` para i-set ang mga ito. Ang pagsulat ng
`setAttribute(name, String(bool))` ay palaging nangangahulugang `true`; nagbabala ang wcb sa console
kapag nakita nitong may boolean attribute na naisulat bilang `"true"` o `"false"` para hindi
tahimik na mabigo ang inversion.

Ang mga attribute kung saan makabuluhan ang `"false"` (`aria-*`, `contenteditable`) ay dapat
i-declare bilang **string** props.

Tingnan ito nang live: [Boolean props demo ↗](https://demo.webcomponent.io/examples/boolean-props/)
