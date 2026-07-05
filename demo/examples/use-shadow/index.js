// @ts-check
import { WebComponent, html } from 'web-component-base'

export class Counter extends WebComponent {
  static props = {
    count: 123,
  }
  static shadowRootInit = {
    mode: 'open',
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
        onClick=${() => ++this.props.count}
        style=${{ backgroundColor: 'green', color: 'white' }}
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
            html`<li>
              <a href=${link.url} target="_blank">${link.text}</a>
            </li>`
        )}
      </ul>
    `
  }
}

customElements.define('my-counter', Counter)
