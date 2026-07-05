import { beforeEach, expect, test } from 'vitest'
import '../../demo/examples/type-restore/Counter.mjs'
import '../../demo/examples/type-restore/Toggle.mjs'
import '../../demo/examples/type-restore/HelloWorld.mjs'
import '../../demo/examples/type-restore/Object.mjs'

beforeEach(() => {
  document.body.innerHTML = ''
})

test('number prop restores and increments', () => {
  document.body.innerHTML = '<my-counter></my-counter>'
  const el = document.querySelector('my-counter')
  expect(el.querySelector('button').textContent.trim()).toBe('1')
  el.querySelector('button').click()
  expect(el.querySelector('button').textContent.trim()).toBe('2')
})

test('boolean prop drives On/Off label', () => {
  document.body.innerHTML = '<my-toggle></my-toggle>'
  const el = document.querySelector('my-toggle')
  expect(el.querySelector('#toggle').textContent.trim()).toBe('Off')
  el.querySelector('#toggle').click()
  expect(el.querySelector('#toggle').textContent.trim()).toBe('On')
})

test('string prop appends on click', () => {
  document.body.innerHTML = '<my-hello-world></my-hello-world>'
  const el = document.querySelector('my-hello-world')
  expect(el.querySelector('button').textContent.trim()).toBe('Wah!')
  el.querySelector('button').click()
  expect(el.querySelector('button').textContent.trim()).toBe('Waah!')
})

test('object prop renders its nested values', () => {
  document.body.innerHTML = '<my-object></my-object>'
  const el = document.querySelector('my-object')
  expect(el.querySelector('#greeting-field').textContent).toContain('worldzz')
  expect(el.querySelector('#age-field').value).toBe('2')
})
