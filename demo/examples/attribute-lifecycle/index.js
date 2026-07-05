import { WebComponent, html } from 'web-component-base'

/**
 * v5 attribute-change correctness:
 *
 *   - `label=""` (empty string) stays the string `''` — it is no longer
 *     coerced to boolean `true` / echoed as `"true"`.
 *   - `removeAttribute('label')` resets the prop to its **declared default**
 *     instead of writing `null` and throwing before render().
 *   - an attribute authored in markup **wins** over the default: defaults are
 *     reflected on connect and skip any attribute already present.
 */
export class AttrDemo extends WebComponent {
  static props = {
    label: 'default-label',
  }

  setValue = () => this.setAttribute('label', 'hello')
  setEmpty = () => this.setAttribute('label', '')
  remove = () => this.removeAttribute('label')

  get template() {
    const value = this.props.label
    return html`
      <p>label prop: <code class="value">${JSON.stringify(value)}</code></p>
      <p>typeof: <code class="type">${typeof value}</code></p>
      <button class="set-value" onclick=${this.setValue}>set "hello"</button>
      <button class="set-empty" onclick=${this.setEmpty}>set "" (empty)</button>
      <button class="remove" onclick=${this.remove}>
        removeAttribute → default
      </button>
    `
  }
}

customElements.define('attr-demo', AttrDemo)
