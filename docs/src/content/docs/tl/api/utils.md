---
title: Mga Utility
slug: 'tl/api/utils'
description: Case conversion, attribute serialization, paggawa ng element, at ang vnode reconciler.
---

Ang mga helper na ginagamit ng `WebComponent` sa loob nito, na na-export para magamit mo
mismo. I-import mula sa `utils` entry point o sa bawat module nang hiwalay:

```js
import { serialize, getKebabCase } from 'web-component-base/utils'
// or
import { serialize } from 'web-component-base/utils/serialize.js'
```

Tingnan ito nang live: binubuo ng [Just the parts demo ↗](https://demo.webcomponent.io/examples/just-parts/) ang isang component mula sa mga helper na ito nang hindi nagpapalawig sa base class.

## Case conversion

### `getCamelCase(kebab)`

Kino-convert ang kebab-case na attribute name tungo sa katugmang camelCase na prop key nito.

| Parameter   | Type     |                          |
| ----------- | -------- | ------------------------ |
| `kebab`     | `string` | ang attribute name       |
| **ibinabalik** | `string` | ang prop key             |

```js
getCamelCase('max-count') // 'maxCount'
```

### `getKebabCase(str)`

Kino-convert ang camelCase na prop key tungo sa katugmang kebab-case na attribute name nito. Ito ang
mapping na ginagamit ng `observedAttributes`.

| Parameter   | Type     |                          |
| ----------- | -------- | ------------------------ |
| `str`       | `string` | ang prop key             |
| **ibinabalik** | `string` | ang attribute name       |

```js
getKebabCase('maxCount') // 'max-count'
```

Ang magkakasunod na capital letters ay itinuturing na iisang salita, kaya ang `parseHTML` ay nagiging
`parse-html`.

## Attribute serialization

### `serialize(value)`

Kino-convert ang value tungo sa attribute string form nito.

| Parameter   | Type     |                                        |
| ----------- | -------- | -------------------------------------- |
| `value`     | `any`    | ang value na sise-serialize                 |
| **ibinabalik** | `string` | ang attribute value                    |

Ang mga numero, boolean, at object ay dumadaan sa `JSON.stringify`; ang mga string at
lahat ng iba pa ay dumadaan nang hindi nagbabago.

### `deserialize(value, type)`

Nagpa-parse ng attribute string pabalik sa value ng ibinigay na na-declare na type, ang
kabaligtaran ng `serialize()`.

| Parameter   | Type     |                                                     |
| ----------- | -------- | --------------------------------------------------- |
| `value`     | `string` | ang attribute value                                 |
| `type`      | `string` | `'boolean'`, `'number'`, `'object'`, `'undefined'` o `'string'` |
| **ibinabalik** | `any`    | ang na-parse na value                                    |

Ang `'boolean'` ay palaging nagbabalik ng `true`: mahigpit na HTML boolean-attribute semantics,
kung saan totoo ang anumang present na value. Ang absence ay hinahawakan ng caller at hindi kailanman
umaabot dito. Ang `'number'`, `'object'`, at `'undefined'` ay gumagamit ng `JSON.parse` at
nagtatapon ng error sa malformed na input; ang mga string ay dumadaan nang hindi nagbabago.

## Mga Element

### `createElement(tree)`

Bumubuo ng totoong DOM mula sa vnode tree.

| Parameter   | Type     |                                                      |
| ----------- | -------- | ---------------------------------------------------- |
| `tree`      | `any`    | isang vnode, isang array ng vnodes, o isang text value          |
| **ibinabalik** | `Node`   | isang element, isang `DocumentFragment`, o isang text node      |

Ang array ay nagiging `DocumentFragment`; ang value na walang `type` ay nagiging text
node. Ang mga props ay ina-apply gamit ang `applyProp()` at ang mga child ay ginagawa
nang recursive.

### `applyProp(el, prop, value)`

Ina-apply ang isang solong vnode prop sa isang element, gamit ang panuntunang inilarawan sa
[html](/tl/api/html/#kung-paano-ina-apply-ang-mga-props).

| Parameter | Type      |                                    |
| --------- | --------- | ---------------------------------- |
| `el`      | `Element` | ang element na ia-a-apply-an ng prop    |
| `prop`    | `string`  | ang prop name ayon sa pagkakasulat sa vnode |
| `value`   | `any`     | ang prop value                     |

Ibinabahagi sa reconciler, kaya ang isang patched na element ay nakakakuha ng props gamit ang eksaktong
parehong panuntunan tulad ng isang bagong likhang element.

## Reconciler

Pinapagana ng mga ito ang in-place na re-render na inilarawan sa
[Template vs Render](/tl/template-vs-render/). Ang matching ay **index-based at
non-keyed**.

### `patchChildren(parent, oldChildren, newChildren)`

Ini-reconcile ang mga anak ng isang parent node mula sa isang vnode list papunta sa isa pa, na pina-patch
ang mga tugma sa lugar at tinatabas ang mga natira.

| Parameter     | Type   |                                                |
| ------------- | ------ | ---------------------------------------------- |
| `parent`      | `Node` | ang parent node na pinapatch-an                  |
| `oldChildren` | `any`  | ang nakaraang vnode children, o nakaraang tree  |
| `newChildren` | `any`  | ang bagong vnode children, o bagong tree            |

### `patchNode(parent, dom, oldVnode, newVnode)`

Ini-reconcile ang isang solong node position. Muling ginagamit ang `dom` kapag tumugma ang vnode type,
kung hindi ay pinapalitan ito.

| Parameter  | Type              |                                          |
| ---------- | ----------------- | ---------------------------------------- |
| `parent`   | `Node`            | ang parent node na pinapatch-an            |
| `dom`      | `Node \| null`    | ang umiiral na node sa index na ito, kung mayroon   |
| `oldVnode` | `any`             | ang vnode na gumawa ng `dom`, kung alam   |
| `newVnode` | `any`             | ang vnode na ire-render                      |
