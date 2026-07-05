import { beforeEach, expect, test } from 'vitest'
import '../../demo/examples/demo/Counter.mjs'
import '../../demo/examples/demo/Toggle.js'
import '../../demo/examples/demo/HelloWorld.mjs'
import '../../demo/examples/demo/BooleanPropTest.mjs'
import '../../demo/examples/demo/SimpleText.mjs'

beforeEach(() => {
  document.body.innerHTML = ''
})

test('Counter increments on click', () => {
  document.body.innerHTML = '<my-counter></my-counter>'
  const el = document.querySelector('my-counter')
  // re-query after each render: object templates rebuild child nodes
  expect(el.querySelector('#btn').textContent.trim()).toBe('0')
  el.querySelector('#btn').click()
  expect(el.querySelector('#btn').textContent.trim()).toBe('1')
})

test('Toggle flips its boolean value on click', () => {
  document.body.innerHTML = '<my-toggle></my-toggle>'
  const el = document.querySelector('my-toggle')
  expect(el.querySelector('button').textContent.trim()).toBe('false')
  el.querySelector('button').click()
  expect(el.querySelector('button').textContent.trim()).toBe('true')
})

test('HelloWorld renders defaults and counts clicks', () => {
  document.body.innerHTML = '<hello-world></hello-world>'
  const el = document.querySelector('hello-world')
  expect(el.textContent).toContain('Hello World')
  el.querySelector('button').click()
  expect(el.textContent).toContain('Clicked 1')
})

test('BooleanPropTest reflects camelCase↔kebab boolean props', () => {
  document.body.innerHTML = '<boolean-prop-test></boolean-prop-test>'
  const el = document.querySelector('boolean-prop-test')
  expect(el.textContent).toContain('is-inline: false')
  expect(el.textContent).toContain('another-one: false')
})

test('SimpleText renders its clickable span', () => {
  document.body.innerHTML = '<simple-text></simple-text>'
  const el = document.querySelector('simple-text')
  expect(el.textContent).toContain('Click me!')
})
