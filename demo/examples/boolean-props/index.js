import { WebComponent, html } from 'web-component-base'

/**
 * Boolean props reflect as **bare attributes**: `true` sets the attribute with
 * no value, `false` removes it entirely — exactly how native `disabled` and
 * `required` behave.
 *
 * Two things that silently broke under the old string reflection now work:
 *
 *   - `el.toggleAttribute(name, force)` only ever adds/removes an attribute,
 *     it never rewrites a value. With `flag="false"` sitting there, forcing
 *     `true` changed nothing — no attributeChangedCallback, no re-render.
 *   - `[flag]` CSS selectors match on *presence*, so a stamped `flag="false"`
 *     matched too and painted the "on" style onto an element whose prop was
 *     false.
 */
class FlagBox extends WebComponent {
  static props = { flag: false }
  static shadowRootInit = { mode: 'open' }
  static styles = `
    :host {
      display: block;
      padding: 0.8em 1em;
      border: 2px solid #8884;
      border-radius: 8px;
      font-family: system-ui, sans-serif;
    }
    /* presence selector: matches only while the prop is actually true */
    :host([flag]) {
      border-color: #c2410c;
      background: #c2410c22;
    }
    .state { font-weight: 600; }
  `

  get template() {
    return html`
      <div>flag is <span class="state">${String(this.props.flag)}</span></div>
    `
  }
}
customElements.define('flag-box', FlagBox)

/**
 * The panel wires the three ways host code drives a boolean prop, and prints
 * what the DOM actually looks like after each one.
 */
class BooleanDemo extends WebComponent {
  static props = { log: '' }

  onInit() {
    this.box = null
  }

  afterViewInit() {
    this.box = this.querySelector('flag-box')
    this.#report('initial mount')
  }

  #report(action) {
    const el = this.box
    if (!el) return
    const attr = el.hasAttribute('flag')
      ? `flag="${el.getAttribute('flag')}"`
      : '(absent)'
    this.props.log = `${action} → prop: ${el.props.flag} · attribute: ${attr}`
  }

  #toggle() {
    // the platform API — a silent no-op back when flag="false" was stamped
    this.box.toggleAttribute('flag', !this.box.props.flag)
    this.#report('toggleAttribute()')
  }

  #write(value) {
    this.box.props.flag = value
    this.#report(`props.flag = ${value}`)
  }

  #stringly() {
    // the pre-v6 idiom: any present value is true, so this turns the flag ON
    // even though it reads as "off". wcb warns in the console when it sees it.
    this.box.setAttribute('flag', 'false')
    this.#report('setAttribute("flag", "false")')
  }

  get template() {
    return html`
      <flag-box></flag-box>

      <p class="log"><code>${this.props.log}</code></p>

      <div class="row">
        <button onclick=${() => this.#toggle()}>toggleAttribute()</button>
        <button onclick=${() => this.#write(true)}>props.flag = true</button>
        <button onclick=${() => this.#write(false)}>props.flag = false</button>
        <button onclick=${() => this.#stringly()}>
          setAttribute("flag", "false") ⚠️
        </button>
      </div>

      <p class="hint">
        The last button is the migration trap:
        <strong>any present value is true</strong>, so writing the string
        <code>"false"</code> turns the flag <em>on</em> — just like native
        <code>disabled="false"</code> is still disabled. Check the console for
        the warning wcb logs. Use
        <code>toggleAttribute(name, bool)</code> instead.
      </p>
    `
  }
}
customElements.define('boolean-demo', BooleanDemo)
