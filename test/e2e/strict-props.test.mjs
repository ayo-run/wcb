import { beforeEach, expect, test, vi } from 'vitest'
import '../../demo/examples/strict-props/index.js'

beforeEach(() => {
  document.body.innerHTML = ''
})

test('default mode logs and skips a type violation, keeping the value/type', () => {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
  document.body.innerHTML = '<lenient-counter></lenient-counter>'
  const el = document.querySelector('lenient-counter')

  el.querySelector('#lenient-bump').click()
  expect(el.querySelector('#lenient-bump').textContent.trim()).toBe('count = 1')

  el.querySelector('#lenient-violate').click()
  // the string write was skipped; count is still the number 1
  expect(el.querySelector('#lenient-status').textContent.trim()).toBe(
    'count is still 1 (number)'
  )
  expect(spy).toHaveBeenCalled()
  spy.mockRestore()
})

test('strictProps throws a TypeError on a type violation', () => {
  document.body.innerHTML = '<strict-counter></strict-counter>'
  const el = document.querySelector('strict-counter')

  el.querySelector('#strict-violate').click()
  expect(el.querySelector('#strict-status').textContent.trim()).toBe(
    'threw: TypeError'
  )
})
