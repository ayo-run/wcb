import { setCustomElementsManifest } from '@storybook/web-components-vite'
import manifest from '../.wcb/custom-elements.json'

// This single line is what turns the manifest into autodocs + inferred
// controls. Without the wcb CEM plugin the manifest has no `attributes` at
// all, so every story would have to hand-write `argTypes`.
setCustomElementsManifest(manifest)

/** @type {import('@storybook/web-components-vite').Preview} */
export default {
  parameters: {
    docs: { toc: true },
    controls: { expanded: true },
  },
  tags: ['autodocs'],
}
