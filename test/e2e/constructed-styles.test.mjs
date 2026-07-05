import { beforeEach, expect, test } from 'vitest'
import '../../demo/examples/constructed-styles/index.js'

beforeEach(() => {
  document.body.innerHTML = ''
})

test('applies a constructable stylesheet via adoptedStyleSheets in the shadow root', () => {
  document.body.innerHTML = '<styled-elements></styled-elements>'
  const el = document.querySelector('styled-elements')

  expect(el.shadowRoot).toBeTruthy()
  expect(el.shadowRoot.adoptedStyleSheets.length).toBeGreaterThan(0)
  expect(el.shadowRoot.querySelector('p').textContent.trim()).toBe('Wow!?')
})
