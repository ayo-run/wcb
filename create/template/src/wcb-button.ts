import { WebComponent, html } from 'web-component-base'

/**
 * Declare a type for your `static props`
 * It is not required for wcb to work, but rather an
 * opt-in compile-time type safety with Typescript
 * @see https://webcomponent.io/prop-access/#opt-in-typed-props-in-typescript
 */
type WcbButtonProps = {
  label: string
  disabled: boolean
  clicks: number
}

/**
 * A starter component. Every key in `static props` is a reactive property
 * reflected to a kebab-cased attribute — writing `this.props.clicks++`
 * updates the attribute and re-renders.
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
