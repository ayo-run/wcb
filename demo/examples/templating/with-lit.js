import { WebComponent } from 'web-component-base'
import {
  html,
  render as lit,
} from 'https://unpkg.com/lit-html@3.1.0/lit-html.js'

export class LitCounter extends WebComponent {
  static props = {
    count: 123,
  }
  get template() {
    const list = ['a', 'b', 'c', 'what']
    const links = [
      {
        url: 'https://ayco.io',
        text: 'Ayo Ayco',
      },
      {
        url: 'https://ayco.io/gh/McFly',
        text: 'McFly',
      },
    ]

    return html`
      <button
        class="hey"
        id="btn"
        @click=${() => ++this.props.count}
        style="background-color: green; color: white;"
        about="Elephant"
        data-name="thing"
        aria-name="thingz"
      >
        <span>${this.props.count}</span>
      </button>
      <form style="margin: 1em 0;">
        <label data-my-name="Ayo" for="the-input">Name</label>
        <input id="the-input" type="foo" value="Name:" />
      </form>
      ${list.map((item) => html`<p>${item}</p>`)}
      <h3 about="Elephant">Links</h3>
      <ul>
        ${links.map(
          (link) =>
            html`<li><a href=${link.url} target="_blank">${link.text}</a></li>`
        )}
      </ul>
    `
  }
  render() {
    lit(this.template, this)
  }
}

customElements.define('lit-counter', LitCounter)
