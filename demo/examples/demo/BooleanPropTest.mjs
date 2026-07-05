//@ts-check
import { html, WebComponent } from 'web-component-base'

export class BooleanPropTest extends WebComponent {
  static props = {
    isInline: false,
    anotherone: false,
  }

  get template() {
    return html`
      <p>is-inline: ${this.props.isInline}</p>
      <p>another-one: ${this.props.anotherone}</p>
    `
  }
}

customElements.define('boolean-prop-test', BooleanPropTest)
