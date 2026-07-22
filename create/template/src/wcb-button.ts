import { WebComponent, html } from 'web-component-base'

// the type above, the defaults within — see
// https://webcomponent.io/prop-access/#typed-props-in-typescript
type WcbButtonProps = {
  label: string
  disabled: boolean
  clicks: number
}

/**
 * A starter component. Every key in `static props` is a reactive property
 * reflected to a kebab-cased attribute — writing `this.props.clicks++`
 * updates the attribute and re-renders. `npm run analyze` turns the same
 * declaration into typed entries in `custom-elements.json`.
 */
export class WcbButton extends WebComponent<WcbButtonProps> {
  static props: WcbButtonProps = {
    label: 'Click me',
    disabled: false,
    clicks: 0,
  }

  bump = () => {
    if (!this.props.disabled) this.props.clicks++
  }

  get template() {
    return html`
      <button onclick=${this.bump} disabled=${this.props.disabled}>
        ${this.props.label} — ${this.props.clicks}×
      </button>
    `
  }
}

customElements.define('wcb-button', WcbButton)
