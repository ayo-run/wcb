import { beforeEach, expect, test } from 'vitest'
import '../../demo/examples/boolean-props/index.js'

/**
 * Exercises the demo example itself, so the page shipped in `demo/` cannot
 * drift from the behavior it is meant to demonstrate.
 */
beforeEach(() => {
  document.body.innerHTML = ''
})

const mount = () => {
  document.body.innerHTML = '<boolean-demo></boolean-demo>'
  const panel = document.querySelector('boolean-demo')
  return [panel, panel.querySelector('flag-box')]
}

const button = (panel, label) =>
  [...panel.querySelectorAll('button')].find((b) =>
    b.textContent.includes(label)
  )

test('the demo mounts with no attribute and reports it', () => {
  const [panel, box] = mount()
  expect(box.hasAttribute('flag')).toBe(false)
  expect(box.props.flag).toBe(false)
  expect(panel.textContent).toContain('attribute: (absent)')
})

test('the toggleAttribute button drives the prop and the style', () => {
  const [panel, box] = mount()

  button(panel, 'toggleAttribute()').click()
  expect(box.props.flag).toBe(true)
  expect(box.getAttribute('flag')).toBe('')
  expect(window.getComputedStyle(box).borderColor).toBe('rgb(194, 65, 12)')
  expect(panel.textContent).toContain('prop: true')

  button(panel, 'toggleAttribute()').click()
  expect(box.props.flag).toBe(false)
  expect(box.hasAttribute('flag')).toBe(false)
})

test('the prop-write buttons reflect as a bare/absent attribute', () => {
  const [panel, box] = mount()

  button(panel, 'props.flag = true').click()
  expect(box.getAttribute('flag')).toBe('')
  expect(panel.textContent).toContain('attribute: flag=""')

  button(panel, 'props.flag = false').click()
  expect(box.hasAttribute('flag')).toBe(false)
  expect(panel.textContent).toContain('attribute: (absent)')
})

test('the trap button demonstrates that "false" means true', () => {
  const [panel, box] = mount()

  button(panel, 'setAttribute').click()
  // the whole point of the warning: this reads as "off" but turns the flag on
  expect(box.props.flag).toBe(true)
  expect(panel.textContent).toContain('prop: true')
})

test('markup presence turns the flag on whatever the value says', () => {
  document.body.innerHTML =
    '<flag-box flag></flag-box><flag-box flag=""></flag-box><flag-box flag="false"></flag-box><flag-box></flag-box>'
  const [bare, empty, stringly, absent] = document.querySelectorAll('flag-box')

  expect(bare.props.flag).toBe(true)
  expect(empty.props.flag).toBe(true)
  expect(stringly.props.flag).toBe(true)
  expect(absent.props.flag).toBe(false)
})
