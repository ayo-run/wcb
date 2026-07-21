/**
 * Type-level test for WCB-REQ-02: `this.props.*` is inferred from the shape
 * passed as the class type argument. Checked by `pnpm test:types` (tsc only —
 * nothing here runs).
 */
import { WebComponent } from '../../dist/index.js'

type Equals<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false
type Expect<T extends true> = T

const buttonProps = { variant: 'primary', disabled: false }

class CozyButton extends WebComponent<typeof buttonProps> {
  static props = buttonProps

  get template() {
    // reads are inferred from the defaults, not `any`
    type _variantIsString = Expect<Equals<typeof this.props.variant, string>>
    type _disabledIsBoolean = Expect<
      Equals<typeof this.props.disabled, boolean>
    >

    return `<button class="${this.props.variant}"></button>`
  }

  ok() {
    this.props.variant = 'secondary'
    this.props.disabled = true
  }

  wrong() {
    // @ts-expect-error string is not assignable to boolean
    this.props.disabled = 'x'
    // @ts-expect-error boolean is not assignable to string
    this.props.variant = false
    // @ts-expect-error prop is not declared
    this.props.notAProp
  }
}

// the same contract holds with an explicit named type — the type above, the
// defaults within — where unions stay narrow and the annotation also checks
// the defaults themselves
type IndicatorProps = {
  status: 'default' | 'active' | 'negative'
  pulse: boolean
}

class StatusIndicator extends WebComponent<IndicatorProps> {
  static props: IndicatorProps = { status: 'default', pulse: false }

  read() {
    type _statusIsUnion = Expect<
      Equals<typeof this.props.status, 'default' | 'active' | 'negative'>
    >
    type _pulseIsBoolean = Expect<Equals<typeof this.props.pulse, boolean>>
  }

  wrong() {
    // @ts-expect-error 'blinking' is not in the union
    this.props.status = 'blinking'
  }
}

class BadDefaults extends WebComponent<IndicatorProps> {
  // @ts-expect-error missing 'pulse', and 'blinking' is outside the union
  static props: IndicatorProps = { status: 'blinking' }
}

// without a type argument, props stays the permissive PropStringMap
class Untyped extends WebComponent {
  static props = { anything: 1 }
  read() {
    type _isAny = Expect<Equals<typeof this.props.anything, any>>
  }
}

export type { CozyButton, StatusIndicator, BadDefaults, Untyped }
