import { WebComponent, html } from 'web-component-base'

/**
 * v5 buffering guarantee. Per the Custom Elements spec, an element upgraded
 * with authored attributes (`<lifecycle-order label="authored">`) fires
 * `attributeChangedCallback` **before** `connectedCallback`. Taken literally
 * that means `render()` could run before `onInit()`.
 *
 * WebComponent buffers pre-connect attribute changes: the prop value is applied
 * immediately (so `this.props` is correct inside `onInit`), but the `render()`
 * and `onChanges()` side effects are deferred until after `onInit`. The order
 * on connect is always: onInit → render → afterViewInit, and pre-connect
 * changes are NOT replayed through onChanges.
 *
 * This component records the order it observes and surfaces it in the page.
 */
export class LifecycleOrder extends WebComponent {
  static props = {
    label: 'default',
  }

  #log = []

  onInit() {
    // props already reflect any authored attribute here, before the first render
    this.#log.push(`onInit (props.label = "${this.props.label}")`)
  }

  render() {
    this.#log.push(`render (props.label = "${this.props.label}")`)
    super.render()
  }

  onChanges(changes) {
    this.#log.push(
      `onChanges (${changes.attribute} → "${changes.currentValue}")`
    )
  }

  afterViewInit() {
    this.#log.push('afterViewInit')
    const list = document.createElement('ol')
    list.className = 'lifecycle-log'
    for (const line of this.#log) {
      const li = document.createElement('li')
      li.textContent = line
      list.appendChild(li)
    }
    this.after(list)
  }

  get template() {
    return html`<p>label: ${this.props.label}</p>`
  }
}

customElements.define('lifecycle-order', LifecycleOrder)
