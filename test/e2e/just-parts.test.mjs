import { beforeEach, expect, test } from 'vitest'
import '../../demo/examples/just-parts/index.js'

beforeEach(() => {
  document.body.innerHTML = ''
})

test('html + createElement build interactive DOM on a vanilla HTMLElement', () => {
  document.body.innerHTML = '<my-quote></my-quote>'
  const btn = document.querySelector('#quote-btn')

  expect(btn).toBeTruthy()
  expect(btn.textContent.trim()).toBe('click me')

  btn.click()
  expect(btn.textContent).toBe('clicked 1')
  btn.click()
  expect(btn.textContent).toBe('clicked 2')
})
