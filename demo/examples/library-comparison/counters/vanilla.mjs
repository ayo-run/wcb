// The same reactive counter, written from scratch on top of HTMLElement — the
// baseline every library above is measured against. No library runtime: the
// reactivity, the attribute reflection, and the re-render are all hand-rolled.
export class VanillaCounter extends HTMLElement {
  static observedAttributes = ['count']

  connectedCallback() {
    if (!this.hasAttribute('count')) this.setAttribute('count', '0')
    this.render()
    this.addEventListener('click', () => {
      this.setAttribute('count', String(this.count + 1))
    })
  }

  attributeChangedCallback() {
    this.render()
  }

  get count() {
    return Number(this.getAttribute('count')) || 0
  }

  render() {
    let button = this.querySelector('button')
    if (!button) {
      button = document.createElement('button')
      this.append(button)
    }
    button.textContent = String(this.count)
  }
}

customElements.define('vanilla-counter', VanillaCounter)
