import { beforeEach, expect, test } from 'vitest'
import '../../demo/examples/lifecycle-order/index.js'

beforeEach(() => {
  document.body.innerHTML = ''
})

function logLines(el) {
  const ol = el.nextElementSibling
  return [...ol.querySelectorAll('li')].map((li) => li.textContent)
}

test('onInit runs before the first render and already sees authored attributes', () => {
  document.body.innerHTML =
    '<lifecycle-order id="authored" label="authored"></lifecycle-order>'
  const el = document.querySelector('#authored')
  const lines = logLines(el)

  expect(lines[0]).toBe('onInit (props.label = "authored")')
  expect(lines[1]).toBe('render (props.label = "authored")')
  expect(lines[2]).toBe('afterViewInit')
  // exactly one render, and the pre-connect change is not replayed via onChanges
  expect(lines).toHaveLength(3)
  expect(lines.some((l) => l.startsWith('onChanges'))).toBe(false)
})

test('default-value path keeps the onInit → render → afterViewInit order', () => {
  document.body.innerHTML = '<lifecycle-order id="default"></lifecycle-order>'
  const el = document.querySelector('#default')
  const lines = logLines(el)

  expect(lines[0]).toBe('onInit (props.label = "default")')
  expect(lines[1]).toBe('render (props.label = "default")')
  expect(lines[2]).toBe('afterViewInit')
  expect(lines).toHaveLength(3)
})
