// @ts-check
import { WebComponent, html } from 'web-component-base'

class StyledElements extends WebComponent {
  static shadowRootInit = {
    mode: 'open',
  }

  static styles = `
    div {
      background-color: yellow;
      border: 1px solid black;
      padding: 1em;

      p {
        text-decoration: underline;
      }
    }
  `

  get template() {
    return html`
      <div>
        <p>Wow!?</p>
      </div>
    `
  }
}

customElements.define('styled-elements', StyledElements)

// `static styles` also takes an array, adopted in order — a shared base sheet
// composed with per-component styles, instead of inlining the base everywhere.
const tokens = `
  :host {
    --demo-accent: rebeccapurple;
    --demo-radius: 6px;
  }
`

// entries may be strings or ready-made CSSStyleSheet objects; a sheet is
// adopted as-is, so one instance can be shared by many components
const base = new CSSStyleSheet()
base.replaceSync(`
  div {
    border: 2px solid var(--demo-accent);
    border-radius: var(--demo-radius);
    padding: 1em;
  }
`)

class ComposedStyles extends WebComponent {
  static shadowRootInit = {
    mode: 'open',
  }

  static styles = [
    tokens,
    base,
    // last one wins on equal specificity
    `p { color: var(--demo-accent); font-weight: 600; }`,
  ]

  get template() {
    return html`
      <div>
        <p>Three sheets: tokens, a shared CSSStyleSheet, and local styles.</p>
      </div>
    `
  }
}

customElements.define('composed-styles', ComposedStyles)
