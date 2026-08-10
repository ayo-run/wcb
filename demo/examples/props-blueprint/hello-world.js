import { html, WebComponent } from 'web-component-base'

export class HelloWorld extends WebComponent {
  static props = {
    myName: 'World',
  }
  get template() {
    return html`<p onclick=${() => (this.props.myName = undefined)}>
      Hello ${this.props.myName}
    </p>`
  }
}

customElements.define('hello-world', HelloWorld)
