// @ts-check
import { WebComponent, html } from 'web-component-base'

class StyledElements extends WebComponent {
  static props = {
    condition: false,
    type: 'info',
  }

  #typeStyles = {
    info: {
      backgroundColor: 'blue',
      border: '1px solid green',
    },
    warn: {
      backgroundColor: 'yellow',
      border: '1px solid orange',
    },
    error: {
      backgroundColor: 'orange',
      border: '1px solid red',
    },
  }

  get template() {
    return html`
      <div
        style=${{
          ...this.#typeStyles[this.props.type],
          padding: '1em',
        }}
      >
        <p style=${{ fontStyle: this.props.condition && 'italic' }}>Wow!</p>
      </div>
    `
  }
}

customElements.define('styled-elements', StyledElements)
