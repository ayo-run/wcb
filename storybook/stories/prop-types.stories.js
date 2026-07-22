import { html } from 'lit'
import '../../demo/examples/demo/BooleanPropTest.mjs'
import '../../demo/examples/type-restore/Object.mjs'
import '../../demo/examples/strict-props/index.js'

// One story per default-literal shape the plugin infers a type from, so the
// controls panel is the assertion: boolean → toggle, number → number input,
// object → JSON editor, string → text field.

export const BooleanProps = {
  name: 'boolean → toggle',
  parameters: {
    docs: { description: { story: 'Both props default to `false`.' } },
  },
  args: { isInline: false, anotherone: false },
  render: ({ isInline, anotherone }) => html`
    <boolean-prop-test
      ?is-inline=${isInline}
      ?anotherone=${anotherone}
    ></boolean-prop-test>
  `,
}

export const NumberProps = {
  name: 'number → number input',
  args: { count: 0 },
  render: ({ count }) =>
    html`<lenient-counter count=${count}></lenient-counter>`,
}

export const ObjectProps = {
  name: 'object → JSON editor',
  args: { object: { hello: 'worldzz', age: 2 } },
  render: ({ object }) =>
    html`<my-object object=${JSON.stringify(object)}></my-object>`,
}

export default {
  title: 'Plugin/Inferred control types',
  component: 'boolean-prop-test',
}
