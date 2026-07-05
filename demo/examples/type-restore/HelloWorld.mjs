import { html, WebComponent } from 'web-component-base'

export class HelloWorld extends WebComponent {
  static props = {
    name: 'a',
  }
  addA = () => (this.props.name += 'a')

  get template() {
    return html`<button onclick=${this.addA}>W${this.props.name}h!</button>`
  }
}

customElements.define('my-hello-world', HelloWorld)
