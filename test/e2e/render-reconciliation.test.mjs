import { beforeEach, expect, test } from 'vitest'
import '../../demo/examples/render-reconciliation/index.js'

beforeEach(() => {
  document.body.innerHTML = ''
})

test('a controlled input keeps its element, focus, caret and value while typing', () => {
  document.body.innerHTML = '<controlled-input></controlled-input>'
  const el = document.querySelector('controlled-input')
  const input = el.querySelector('#field')

  input.focus()
  input.value = 'Ayo'
  input.setSelectionRange(3, 3)
  // the real event the browser fires while typing — this writes a prop, which
  // re-renders the whole component
  input.dispatchEvent(new Event('input', { bubbles: true }))

  expect(el.querySelector('#field')).toBe(input)
  expect(document.activeElement).toBe(input)
  expect(input.value).toBe('Ayo')
  expect(input.selectionStart).toBe(3)
  // ...and the rest of the tree did update
  expect(el.querySelector('#echo').textContent.trim()).toBe('Ayo')
})

test('an attribute-only change patches in place and keeps keyboard focus', () => {
  document.body.innerHTML = '<segmented-control></segmented-control>'
  const el = document.querySelector('segmented-control')
  const two = el.querySelector('#two')

  two.focus()
  expect(two.getAttribute('aria-selected')).toBe('false')

  two.click()

  expect(el.querySelector('#two')).toBe(two)
  expect(two.getAttribute('aria-selected')).toBe('true')
  expect(two.className).toBe('seg selected')
  expect(el.querySelector('#one').getAttribute('aria-selected')).toBe('false')
  expect(document.activeElement).toBe(two)
  expect(el.querySelector('#selected').textContent.trim()).toBe('two')
})

test('an unrelated re-render leaves an animating element untouched', async () => {
  document.body.innerHTML = '<transition-safe></transition-safe>'
  const el = document.querySelector('transition-safe')
  const root = el.shadowRoot
  const box = root.querySelector('#box')

  // read layout first so the transition has a resolved start value
  const startWidth = box.getBoundingClientRect().width
  root.querySelector('#run').click()

  // let a few of the unrelated re-renders land mid-transition
  await new Promise((resolve) => setTimeout(resolve, 500))

  // same element instance, still growing — a rebuilt node would have snapped
  // back to the start width
  expect(root.querySelector('#box')).toBe(box)
  const midFlight = box.getBoundingClientRect().width
  expect(midFlight).toBeGreaterThan(startWidth)
  // still mid-transition, not snapped to the end value
  expect(midFlight).toBeLessThan(el.getBoundingClientRect().width)
  expect(Number(root.querySelector('#ticks').textContent)).toBeGreaterThan(0)
})

test('props, attributes and style rules removed from the tree are undone', () => {
  document.body.innerHTML = '<prop-removal></prop-removal>'
  const el = document.querySelector('prop-removal')
  const target = el.querySelector('#target')

  expect(target.disabled).toBe(true)
  expect(target.getAttribute('data-badge')).toBe('decorated')
  expect(target.style.outline).not.toBe('')

  el.querySelector('#toggle').click()

  // same element, decorations actively undone rather than left behind
  expect(el.querySelector('#target')).toBe(target)
  expect(target.disabled).toBe(false)
  expect(target.hasAttribute('data-badge')).toBe(false)
  expect(target.style.outline).toBe('')
})

test('list grow/shrink reuses surviving rows', () => {
  document.body.innerHTML = '<item-list></item-list>'
  const el = document.querySelector('item-list')
  const firstRow = el.querySelector('#list li')

  el.querySelector('#add').click()
  expect(el.querySelectorAll('#list li').length).toBe(4)
  expect(el.querySelector('#list li')).toBe(firstRow)

  el.querySelector('#drop').click()
  el.querySelector('#drop').click()
  const labels = [...el.querySelectorAll('.row-label')].map((s) =>
    s.textContent.trim()
  )
  expect(labels).toEqual(['alpha', 'bravo'])
  expect(el.querySelector('#list li')).toBe(firstRow)
})

test('reordering is matched by position, not identity (non-keyed)', () => {
  document.body.innerHTML = '<item-list></item-list>'
  const el = document.querySelector('item-list')
  const rows = [...el.querySelectorAll('#list li')]
  const firstNote = el.querySelector('.row-note')

  firstNote.value = 'my note'

  el.querySelector('#reverse').click()

  const labels = [...el.querySelectorAll('.row-label')].map((s) =>
    s.textContent.trim()
  )
  // the rendered result is correct...
  expect(labels).toEqual(['charlie', 'bravo', 'alpha'])
  // ...but no node moved: each row kept its slot and had its content rewritten,
  // so the typed note stayed with position 1 instead of following 'alpha'
  expect([...el.querySelectorAll('#list li')]).toEqual(rows)
  expect(el.querySelector('.row-note')).toBe(firstNote)
  expect(firstNote.value).toBe('my note')
})
