// The same reactive counter, written in FAST (@microsoft/fast-element).
// Justified deviation from the docs' default: FAST's getting-started page uses
// the `@attr` decorator, which needs decorator tooling this benchmark
// deliberately does not use. This is the shape FAST documents for that case
// ("Working without Decorators"): reactive props declared as an `attributes`
// array on `define()`, initial value assigned in the constructor, and the
// template binding against the element instance (`x`). Event handlers use the
// documented `@event` binding; FAST calls `preventDefault()` unless the
// expression returns exactly `true`, which an increment never does.
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
