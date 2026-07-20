import { beforeEach, expect, test } from 'vitest'
import '../../demo/examples/attribute-converters/index.js'

/**
 * Exercises the demo example itself, so the page shipped in `demo/` cannot
 * drift from the behavior it demonstrates.
 */
beforeEach(() => {
  document.body.innerHTML = ''
})

const mount = () => {
  document.body.innerHTML = '<converter-demo></converter-demo>'
  const panel = document.querySelector('converter-demo')
  return [panel, panel.querySelector('event-card')]
}

const button = (panel, label) =>
  [...panel.querySelectorAll('button')].find((b) =>
    b.textContent.includes(label)
  )

test('defaults reflect through toAttribute at mount', () => {
  const [panel, card] = mount()
  expect(card.getAttribute('when')).toBe('2026-07-20')
  // an empty array converts to null, so no attribute is stamped
  expect(card.hasAttribute('tags')).toBe(false)
  expect(panel.textContent).toContain('when="2026-07-20"')
})

test('markup is parsed through fromAttribute into real types', () => {
  document.body.innerHTML =
    '<event-card when="2026-01-02" tags="alpha,beta"></event-card>'
  const card = document.querySelector('event-card')

  expect(card.props.when).toBeInstanceOf(Date)
  expect(card.props.when.toISOString()).toBe('2026-01-02T00:00:00.000Z')
  expect(card.props.tags).toEqual(['alpha', 'beta'])
})

test('a lossy toAttribute does not corrupt the prop', () => {
  const [, card] = mount()
  button(document.querySelector('converter-demo'), 'a precise Date').click()

  // the attribute carries only the date...
  expect(card.getAttribute('when')).toBe('2026-12-25')
  // ...but the prop kept the time of day, because reflection does not
  // round-trip back through fromAttribute
  expect(card.props.when.toISOString()).toBe('2026-12-25T18:45:12.000Z')
  expect(card.shadowRoot.textContent).toContain('2026-12-25T18:45:12.000Z')
})

test('an array prop reflects as a joined attribute and re-renders', () => {
  const [panel, card] = mount()
  button(panel, "['web', 'components']").click()

  expect(card.getAttribute('tags')).toBe('web,components')
  expect(card.props.tags).toEqual(['web', 'components'])
  expect(card.shadowRoot.textContent).toContain('["web","components"]')
})

test('returning null from toAttribute removes the attribute', () => {
  const [panel, card] = mount()
  button(panel, "['web', 'components']").click()
  expect(card.hasAttribute('tags')).toBe(true)

  button(panel, 'removes the attribute').click()
  expect(card.hasAttribute('tags')).toBe(false)
  // the prop keeps the value it was set to — no default-reset clobber
  expect(card.props.tags).toEqual([])
  expect(panel.textContent).toContain('(absent)')
})

test('an outside attribute write is parsed through fromAttribute', () => {
  const [panel, card] = mount()
  button(panel, 'setAttribute').click()

  expect(card.props.tags).toEqual(['html', 'css', 'js'])
  expect(card.shadowRoot.textContent).toContain('["html","css","js"]')
})
