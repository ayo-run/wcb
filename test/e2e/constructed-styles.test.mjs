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

test('adopts an array of styles in order, and the composed CSS actually applies', () => {
  document.body.innerHTML = '<composed-styles></composed-styles>'
  const el = document.querySelector('composed-styles')

  // tokens, a shared CSSStyleSheet, then local styles
  expect(el.shadowRoot.adoptedStyleSheets).toHaveLength(3)

  // the real proof: a custom property declared in sheet 1 resolves inside
  // sheet 2's rule, and sheet 3's own rule applies — computed, not asserted
  // against the source text
  const div = el.shadowRoot.querySelector('div')
  const p = el.shadowRoot.querySelector('p')
  expect(getComputedStyle(div).borderRadius).toBe('6px')
  expect(getComputedStyle(div).borderTopWidth).toBe('2px')
  expect(getComputedStyle(p).fontWeight).toBe('600')
})
