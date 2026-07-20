import { beforeEach, expect, test } from 'vitest'
import { WebComponent, html } from '../../src/index.js'

/**
 * Boolean props reflect as bare attributes (presence/absence), so the two
 * things that silently broke under string reflection work here: the platform's
 * own `toggleAttribute()` API, and `[attr]` presence selectors in CSS.
 * These need a real browser — happy-dom does not evaluate `:host([flag])`.
 */
class FlagBox extends WebComponent {
  static props = { flag: false }
  static shadowRootInit = { mode: 'open' }
  static styles = `
    :host { color: rgb(0, 0, 0); }
    :host([flag]) { color: rgb(255, 0, 0); }
  `
  get template() {
    // an object template, so `static styles` actually gets adopted
    return html`<span>flag is ${this.props.flag}</span>`
  }
}
window.customElements.define('flag-box', FlagBox)

const color = (el) => window.getComputedStyle(el).color

beforeEach(() => {
  document.body.innerHTML = ''
})

test('a false boolean prop leaves no attribute to mis-match [flag]', () => {
  document.body.innerHTML = '<flag-box></flag-box>'
  const el = document.querySelector('flag-box')

  expect(el.hasAttribute('flag')).toBe(false)
  expect(el.props.flag).toBe(false)
  // the REQ-07 bug: `flag="false"` used to match `:host([flag])` and paint the
  // "on" style onto an element whose prop was false
  expect(color(el)).toBe('rgb(0, 0, 0)')
})

test('toggleAttribute drives the prop, the render and the [flag] style', () => {
  document.body.innerHTML = '<flag-box></flag-box>'
  const el = document.querySelector('flag-box')

  // used to be a silent no-op: the attribute already existed as flag="false"
  el.toggleAttribute('flag', true)
  expect(el.props.flag).toBe(true)
  expect(el.shadowRoot.querySelector('span').textContent).toBe('flag is true')
  expect(color(el)).toBe('rgb(255, 0, 0)')

  el.toggleAttribute('flag', false)
  expect(el.props.flag).toBe(false)
  expect(el.shadowRoot.querySelector('span').textContent).toBe('flag is false')
  expect(color(el)).toBe('rgb(0, 0, 0)')
})

test('a prop write reflects as a bare attribute the CSS can match', () => {
  document.body.innerHTML = '<flag-box></flag-box>'
  const el = document.querySelector('flag-box')

  el.props.flag = true
  expect(el.getAttribute('flag')).toBe('')
  expect(color(el)).toBe('rgb(255, 0, 0)')

  el.props.flag = false
  expect(el.hasAttribute('flag')).toBe(false)
  expect(color(el)).toBe('rgb(0, 0, 0)')
})

test('markup presence turns the prop on, whatever the value says', () => {
  // strict HTML semantics: any present value is true, including "false"
  document.body.innerHTML =
    '<flag-box flag></flag-box><flag-box flag="false"></flag-box>'
  const [bare, stringly] = document.querySelectorAll('flag-box')

  expect(bare.props.flag).toBe(true)
  expect(stringly.props.flag).toBe(true)
  expect(color(bare)).toBe('rgb(255, 0, 0)')
  expect(color(stringly)).toBe('rgb(255, 0, 0)')
})
