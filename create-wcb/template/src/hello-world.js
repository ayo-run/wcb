import { WebComponent, html } from 'web-component-base'

/**
 * A starter component. Every key in `static props` is a reactive property
 * reflected to a kebab-cased attribute — writing `this.props.clicks++`
 * updates the attribute and re-renders. `npm run analyze` turns the same
 * declaration into typed entries in `custom-elements.json`.
 * @see https://webcomponent.io/props-blueprint/
 */
export class HelloWorld extends WebComponent {
  static props = {
    name: 'World',
    disabled: false,
    clicks: 0,
  }

  bump = () => {
    if (!this.props.disabled) this.props.clicks++
  }

  get template() {
    return html`
      <button onclick=${this.bump} disabled=${this.props.disabled}>
        Hello, ${this.props.name}! Clicked ${this.props.clicks}×
      </button>
    `
  }
}

customElements.define('hello-world', HelloWorld)
