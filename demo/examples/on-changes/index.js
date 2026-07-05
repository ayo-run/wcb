import { WebComponent, html } from 'web-component-base'

/**
 * v5 `onChanges` payload: the `changes` object cleanly separates the
 * camelCase **property** key from the kebab-case **attribute** name.
 *
 *   - `property`      → camelCase prop key, matching `this.props` access (`myName`)
 *   - `attribute`     → kebab-case attribute name that changed (`my-name`)
 *   - `previousValue` / `currentValue`
 *
 * Before v5, `property` held the kebab-case attribute name. Code that read
 * `changes.property` for the attribute name must now read `changes.attribute`.
 */
export class ChangeLogger extends WebComponent {
  static props = {
    myName: 'World',
  }

  #last = null

  onChanges(changes) {
    this.#last = changes
    console.log('>>> onChanges', changes)
    // onChanges fires after render(), so re-render to surface the payload
    this.render()
  }

  rename = () => {
    this.props.myName = this.props.myName === 'World' ? 'Ayo' : 'World'
  }

  get template() {
    const c = this.#last
    return html`
      <button id="rename" onclick=${this.rename}>Rename</button>
      <p id="greeting">Hello ${this.props.myName}</p>
      ${c
        ? html`
            <dl>
              <dt>property (camelCase)</dt>
              <dd id="property">${c.property}</dd>
              <dt>attribute (kebab-case)</dt>
              <dd id="attribute">${c.attribute}</dd>
              <dt>previousValue</dt>
              <dd id="previous">${c.previousValue}</dd>
              <dt>currentValue</dt>
              <dd id="current">${c.currentValue}</dd>
            </dl>
          `
        : html`<p id="no-changes">No changes yet</p>`}
    `
  }
}

customElements.define('change-logger', ChangeLogger)
