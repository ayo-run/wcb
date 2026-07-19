import { WebComponent, html } from 'web-component-base'

const buttonProps = {
  variant: 'primary',
  disabled: false,
  clicks: 0,
}

class TypedButton extends WebComponent<typeof buttonProps> {
  static props = buttonProps

  bump = () => {
    if (!this.props.disabled) this.props.clicks++
  }

  toggle = () => (this.props.disabled = !this.props.disabled)

  cycle = () => {
    const order = ['primary', 'secondary', 'ghost']
    const next = order[(order.indexOf(this.props.variant) + 1) % order.length]
    this.props.variant = next
  }

  get template() {
    // Each read below is inferred from the default it was declared with —
    // hover them in an editor to see `string`, `boolean` and `number`.
    const variant: string = this.props.variant
    const disabled: boolean = this.props.disabled
    const clicks: number = this.props.clicks

    return html`
      <button
        id="typed-button"
        class="btn ${variant}"
        disabled=${disabled}
        onclick=${this.bump}
      >
        ${variant} — clicked ${clicks}×
      </button>
      <button id="typed-cycle" onclick=${this.cycle}>Cycle variant</button>
      <button id="typed-toggle" onclick=${this.toggle}>
        ${disabled ? 'Enable' : 'Disable'}
      </button>
    `
  }
}

/**
 * ERROR examples
 * `@ts-expect-error` keeps this example working
 */
class CompileErrors extends WebComponent<typeof buttonProps> {
  static props = buttonProps

  demo() {
    // if you remove the ts-expect-error comment below, the editor should show red squiggly lines
    // @ts-expect-error string is not assignable to boolean
    this.props.disabled = 'yes'

    // @ts-expect-error boolean is not assignable to string
    this.props.variant = false

    // @ts-expect-error 'varient' is a typo — not a declared prop
    this.props.varient

    // @ts-expect-error clicks is a number, not a string
    this.props.clicks.toUpperCase()
  }
}

/**
 * Omitting the type argument keeps the previous behavior — every read is
 * `any`, so none of the mistakes above are caught. This still compiles.
 */
class UntypedButton extends WebComponent {
  static props = { variant: 'primary' }

  get template() {
    this.props.varient // no error: `any` swallows the typo
    return html`<button class="btn">${this.props.variant} (untyped)</button>`
  }
}

customElements.define('typed-button', TypedButton)
customElements.define('untyped-button', UntypedButton)

export { CompileErrors }
