import { beforeEach, expect, test } from 'vitest'
import '../../demo/examples/use-shadow/index.js'

beforeEach(() => {
  document.body.innerHTML = ''
})

test('renders into an open shadow root and increments on click', () => {
  document.body.innerHTML = '<my-counter></my-counter>'
  const el = document.querySelector('my-counter')

  expect(el.shadowRoot).toBeTruthy()
  // light DOM stays empty; content lives in the shadow root
  expect(el.querySelector('#btn')).toBeNull()
  expect(el.shadowRoot.querySelector('#btn span').textContent.trim()).toBe(
    '123'
  )

  el.shadowRoot.querySelector('#btn').click()
  expect(el.shadowRoot.querySelector('#btn span').textContent.trim()).toBe(
    '124'
  )
})
