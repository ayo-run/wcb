import { html } from 'lit'
import '../../demo/examples/typed-props/index.ts'

// No `argTypes` anywhere in this file: the controls and the attributes table
// come from custom-elements.json, which the wcb CEM plugin filled in from
// `static props = { variant, disabled, clicks }`.
export default {
  title: 'Demo/Typed button',
  component: 'typed-button',
  render: ({ variant, disabled, clicks }) => html`
    <typed-button
      variant=${variant}
      ?disabled=${disabled}
      clicks=${clicks}
    ></typed-button>
  `,
}

export const Default = {
  args: { variant: 'primary', disabled: false, clicks: 0 },
}

export const Ghost = {
  args: { variant: 'ghost', disabled: false, clicks: 7 },
}

export const Disabled = {
  args: { variant: 'secondary', disabled: true, clicks: 0 },
}
