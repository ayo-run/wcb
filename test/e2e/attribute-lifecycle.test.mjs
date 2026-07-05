import { beforeEach, expect, test } from 'vitest'
import '../../demo/examples/attribute-lifecycle/index.js'

beforeEach(() => {
  document.body.innerHTML = ''
})

test('the declared default is used when no attribute is authored', () => {
  document.body.innerHTML = '<attr-demo></attr-demo>'
  const el = document.querySelector('attr-demo')
  expect(el.querySelector('.value').textContent).toBe('"default-label"')
  expect(el.querySelector('.type').textContent).toBe('string')
})

test('empty string stays an empty string (not coerced to boolean)', () => {
  document.body.innerHTML = '<attr-demo></attr-demo>'
  const el = document.querySelector('attr-demo')
  el.querySelector('.set-empty').click()
  expect(el.getAttribute('label')).toBe('')
  expect(el.querySelector('.value').textContent).toBe('""')
  expect(el.querySelector('.type').textContent).toBe('string')
})

test('removeAttribute resets the prop to the declared default', () => {
  document.body.innerHTML = '<attr-demo></attr-demo>'
  const el = document.querySelector('attr-demo')
  el.querySelector('.set-value').click()
  expect(el.querySelector('.value').textContent).toBe('"hello"')
  el.querySelector('.remove').click()
  expect(el.querySelector('.value').textContent).toBe('"default-label"')
})

test('an attribute authored in markup wins over the default', () => {
  document.body.innerHTML = '<attr-demo label="from markup"></attr-demo>'
  const el = document.querySelector('attr-demo')
  expect(el.querySelector('.value').textContent).toBe('"from markup"')
})
