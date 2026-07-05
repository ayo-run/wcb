// @ts-check
import { html, WebComponent } from 'web-component-base'

class SimpleText extends WebComponent {
  clickCallback() {
    console.log('>>> click!')
  }

  onDestroy() {
    console.log('>>> removing event listener')
    this.removeEventListener('click', this.clickCallback)
  }

  get template() {
    return html`<span onclick=${this.clickCallback} style="cursor:pointer"
      >Click me!</span
    >`
  }
}

customElements.define('simple-text', SimpleText)
