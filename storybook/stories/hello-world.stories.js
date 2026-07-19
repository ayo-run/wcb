import { html } from 'lit'
import '../../demo/examples/props-blueprint/hello-world.js'

// `myName` is the interesting case: the plugin runs it through wcb's own
// `getKebabCase`, so the manifest attribute is `my-name` — exactly what
// `observedAttributes` reflects. Set the control and the element updates.
export default {
  title: 'Demo/Hello world',
  component: 'hello-world',
  render: ({ myName }) => html`<hello-world my-name=${myName}></hello-world>`,
}

export const Default = { args: { myName: 'World' } }
export const Named = { args: { myName: 'Ayo' } }
