import { WebComponent, html } from 'web-component-base'

/**
 * v5 derives a prop's type from its `static props` default and, by default,
 * treats a type violation as **loud but non-fatal**: the bad write is logged
 * via `console.error` and skipped, so the prop keeps its value and
 * `render()` / `onChanges()` still run.
 *
 * Here `count` is typed `number` (default `0`). Assigning a string is skipped.
 */
export class LenientCounter extends WebComponent {
  static props = { count: 0 }

  #status = 'ok'

  bump = () => ++this.props.count

  violate = () => {
    this.props.count = 'not-a-number' // logged + skipped; count stays a number
    this.#status = `count is still ${this.props.count} (${typeof this.props.count})`
    this.render()
  }

  get template() {
    return html`
      <h3>Default: log &amp; skip</h3>
      <button id="lenient-bump" onclick=${this.bump}>
        count = ${this.props.count}
      </button>
      <button id="lenient-violate" onclick=${this.violate}>
        Assign a string
      </button>
      <p id="lenient-status">${this.#status}</p>
    `
  }
}

/**
 * Teams wanting hard enforcement opt in with `static strictProps = true`.
 * The same violation now throws a `TypeError` instead of being skipped.
 */
export class StrictCounter extends WebComponent {
  static strictProps = true
  static props = { count: 0 }

  #status = 'ok'

  violate = () => {
    try {
      this.props.count = 'not-a-number'
      this.#status = 'no error (unexpected)'
    } catch (e) {
      this.#status = `threw: ${e.name}`
    }
    this.render()
  }

  get template() {
    return html`
      <h3>strictProps = true</h3>
      <button id="strict-violate" onclick=${this.violate}>
        Assign a string
      </button>
      <p id="strict-status">${this.#status}</p>
    `
  }
}

customElements.define('lenient-counter', LenientCounter)
customElements.define('strict-counter', StrictCounter)
