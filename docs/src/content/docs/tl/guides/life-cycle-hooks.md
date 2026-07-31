---
title: Life-Cycle Hooks
slug: 'tl/life-cycle-hooks'
description: Ang apat na lifecycle hooks — onInit, afterViewInit, onChanges at onDestroy — kung kailan tumatakbo ang bawat isa at ano ang nararapat dito.
---

Tukuyin ang behavior kapag may na-trigger na tiyak na event sa life cycle ng component sa pamamagitan ng pagbibigay ng hook methods

Tingnan ito nang live: [Lifecycle order demo ↗](https://demo.webcomponent.io/examples/lifecycle-order/) na naglo-log sa bawat hook habang tumatakbo ito, at ipinapakita ng [Attribute lifecycle demo ↗](https://demo.webcomponent.io/examples/attribute-lifecycle/) kung paano dinadala ng attribute changes ang mga ito.

### onInit()

- Tinatawag kapag naka-connect na ang component sa DOM
- Pinakamainam para sa pag-set up ng component

```js
import { WebComponent } from 'https://esm.sh/web-component-base@latest'

class ClickableText extends WebComponent {
  // gets called when the component is used in an HTML document
  onInit() {
    this.onclick = () => console.log('>>> click!')
  }

  get template() {
    return `<span style="cursor:pointer">Click me!</span>`
  }
}
```

### afterViewInit()

- Tinatawag pagkatapos munang ma-initialize ang view

```js
class ClickableText extends WebComponent {
  // gets called when the component's innerHTML is first filled
  afterViewInit() {
    const footer = this.querySelector('footer')
    // do stuff to footer after view is initialized
  }

  get template() {
    return `<footer>Awesome site &copy; 2023</footer>`
  }
}
```

### onDestroy()

- Tinatawag kapag na-disconnect ang component mula sa DOM
- pinakamainam para sa pag-undo ng anumang setup na ginawa sa `onInit()`

```js
import { WebComponent } from 'https://esm.sh/web-component-base@latest'

class ClickableText extends WebComponent {
  clickCallback() {
    console.log('>>> click!')
  }

  onInit() {
    this.onclick = this.clickCallback
  }

  onDestroy() {
    console.log('>>> removing event listener')
    this.removeEventListener('click', this.clickCallback)
  }

  get template() {
    return `<span style="cursor:pointer">Click me!</span>`
  }
}
```

### onChanges()

- Tinatawag kapag may nagbagong value ng attribute
- Malinaw na pinaghihiwalay ng `changes` object ang **property** mula sa **attribute**:
  - `property`: ang **camelCase** na prop key, tumutugma sa kung paano mo ina-access ang `props` (hal. `myName`)
  - `attribute`: ang **kebab-case** na attribute name na nagbago (hal. `my-name`)
  - `previousValue` / `currentValue`: ang mga value bago at pagkatapos ng pagbabago

Gamitin ang `property` para basahin nang direkta ang value mula sa `props` (`this.props[property]`); gamitin ang `attribute` kapag kailangan mo ng raw na attribute name.

Tingnan ito nang live: [onChanges payload demo ↗](https://demo.webcomponent.io/examples/on-changes/)

```js
import { WebComponent } from 'https://esm.sh/web-component-base@latest'

class ClickableText extends WebComponent {
  // gets called when an attribute value changes
  onChanges(changes) {
    const { property, attribute, previousValue, currentValue } = changes
    console.log('>>> ', { property, attribute, previousValue, currentValue })
  }

  get template() {
    return `<span style="cursor:pointer">Click me!</span>`
  }
}
```

:::caution[Breaking change]
Ang `onChanges` payload ngayon ay gumuguhit ng malinaw na pagkakaiba sa pagitan ng **attribute at property**. Dati, ang `property` ay may hawak na kebab-case na pangalan ng _attribute_. Ngayon, hawak na nito ang camelCase na _prop_ key (tumutugma sa `props` access), at ang kebab-case na attribute name ay lumipat sa bagong `attribute` field.

```js
// before
onChanges({ property /* 'my-name' */, previousValue, currentValue }) {}

// after
onChanges({ property /* 'myName' */, attribute /* 'my-name' */, previousValue, currentValue }) {}
```

Kung dati mong binabasa ang `changes.property` para sa attribute name, lumipat sa `changes.attribute`.
:::

## Upgrade ordering at ang buffering guarantee

Ayon sa Custom Elements spec, kapag na-upgrade ang isang element na may mga attribute na naroon na sa markup (hal. `<my-el my-name="Zoe">`), tinatawag ng browser ang `attributeChangedCallback` **bago** ang `connectedCallback`. Kung susundin nang literal, nangangahulugan iyon na maaaring tumakbo ang `render()` at `onChanges()` bago ang `onInit()`, kaya ang anumang setup na ginagawa mo sa `onInit` (event wiring, pagbasa ng external state) ay hindi pa nangyayari sa unang render na iyon. Ang mga test environment tulad ng happy-dom/jsdom ay hindi kinokopya ang pagkakasunod-sunod na ito, kaya maaaring pumasa ang mga component sa mga test at pagkatapos ay kumilos nang mali sa totoong browser.

Tinatanggal ng `WebComponent` ang panganib na ito. Ang mga pagbabago sa attribute na dumarating **bago** ma-connect ang element ay naka-buffer:

- ang **prop value ay agad na ina-apply**, kaya tama na ang `this.props` sa loob ng `onInit()`;
- ang **side effects ng `render()` at `onChanges()` ay ipinagpapaliban** hanggang matapos tumakbo ang `onInit()`.

Sa pag-connect, ang pagkakasunod-sunod ay palaging:

1. `onInit()`: naipapakita na ng `this.props` ang anumang authored na attributes
2. isang solong `render()`: naipapakita ang lahat ng buffered na props sa iisang pagdaan
3. `afterViewInit()`

**Hindi kailanman tumatakbo ang `onChanges()` bago ang `onInit()`.** Ang mga pre-connect na pagbabago sa attribute ay **hindi** ini-replay sa pamamagitan ng `onChanges()`. Naipapakita na ito ng unang `render()`, kaya ang `onChanges()` ay nakalaan para sa tunay na post-connect na mga pagbabago. Matapos ma-connect ang element, kumikilos nang normal ang mga pagbabago sa attribute: agad na pinapagana ng bawat isa ang `render()` at `onChanges()`.
