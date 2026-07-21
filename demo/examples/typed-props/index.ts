import { WebComponent, html } from 'web-component-base'

// the type above, the defaults within: unions stay narrow with nothing to
// cast, and the annotation checks the defaults themselves too
type TypedButtonProps = {
  variant: 'primary' | 'secondary' | 'ghost'
  disabled: boolean
  clicks: number
}

class TypedButton extends WebComponent<TypedButtonProps> {
  static props: TypedButtonProps = {
    variant: 'primary',
    disabled: false,
    clicks: 0,
  }

  bump = () => {
    if (!this.props.disabled) this.props.clicks++
  }

  toggle = () => (this.props.disabled = !this.props.disabled)

  cycle = () => {
    const order = ['primary', 'secondary', 'ghost'] as const
    const next = order[(order.indexOf(this.props.variant) + 1) % order.length]
    this.props.variant = next
  }

  get template() {
    // Each read below is typed by the declaration above — hover them in an
    // editor to see the variant union, `boolean` and `number`.
    const variant: TypedButtonProps['variant'] = this.props.variant
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
class CompileErrors extends WebComponent<TypedButtonProps> {
  static props: TypedButtonProps = {
    variant: 'primary',
    disabled: false,
    clicks: 0,
  }

  demo() {
    // if you remove the ts-expect-error comment below, the editor should show red squiggly lines
    // @ts-expect-error string is not assignable to boolean
    this.props.disabled = 'yes'

    // @ts-expect-error 'plaid' is not in the variant union
    this.props.variant = 'plaid'

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
