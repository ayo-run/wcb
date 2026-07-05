import { beforeEach, expect, test } from 'vitest'
import '../../demo/examples/props-blueprint/index.js'
import '../../demo/examples/props-blueprint/hello-world.js'

beforeEach(() => {
  document.body.innerHTML = ''
})

test('Counter starts at its non-zero default and increments', () => {
  document.body.innerHTML = '<my-counter></my-counter>'
  const el = document.querySelector('my-counter')
  expect(el.querySelector('#btn').textContent.trim()).toBe('123')
  el.querySelector('#btn').click()
  expect(el.querySelector('#btn').textContent.trim()).toBe('124')
})

test('camelCase prop myName renders', () => {
  document.body.innerHTML = '<hello-world></hello-world>'
  const el = document.querySelector('hello-world')
  expect(el.textContent).toContain('Hello World')
})

test('authored my-name attribute overrides the default', () => {
  document.body.innerHTML = '<hello-world my-name="Ayo"></hello-world>'
  const el = document.querySelector('hello-world')
  expect(el.textContent).toContain('Hello Ayo')
})
