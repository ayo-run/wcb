// The same reactive counter, written in FAST (@microsoft/fast-element).
// The buildless, non-decorator form: the template binds against the element
// instance (`x`), and `count` is declared as a number attribute.
import {
  FASTElement,
  html,
  nullableNumberConverter,
} from '@microsoft/fast-element'

const template = html`
  <button @click=${(x) => x.count++}>${(x) => x.count}</button>
`

export class FastCounter extends FASTElement {
  constructor() {
    super()
    this.count = 0
  }
}

FastCounter.define({
  name: 'fast-counter',
  template,
  attributes: [{ property: 'count', converter: nullableNumberConverter }],
})
