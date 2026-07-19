import { describe, expect, it, vi } from 'vitest'
import { createElement } from '../../src/utils/create-element.mjs'
import { patchChildren } from '../../src/utils/patch.mjs'
import { html } from '../../src/html.js'

/**
 * Mounts `tree` into a fresh host the way the first render does, and returns
 * the host plus a `patch` that reconciles it against the next tree.
 * @param tree the initial vnode tree
 */
function mount(tree) {
  const host = document.createElement('div')
  document.body.appendChild(host)
  const el = createElement(tree)
  if (el) host.replaceChildren(el)
  let previous = tree
  return {
    host,
    /**
     * @param next the next vnode tree
     */
    patch(next) {
      patchChildren(host, previous, next)
      previous = next
    },
  }
}

describe('patchChildren', () => {
  it('updates text in place without replacing the node', () => {
    const { host, patch } = mount(html`<p>one</p>`)
    const p = host.querySelector('p')
    const text = p.firstChild

    patch(html`<p>two</p>`)

    expect(host.querySelector('p')).toBe(p)
    expect(p.firstChild).toBe(text)
    expect(p.textContent).toBe('two')
  })

  it('adds, changes and removes props on the same element', () => {
    const { host, patch } = mount(
      html`<div id="a" data-keep="1" data-drop="x"></div>`
    )
    const div = host.querySelector('div')

    patch(html`<div id="b" data-keep="1" title="hi"></div>`)

    expect(host.querySelector('div')).toBe(div)
    expect(div.id).toBe('b')
    expect(div.getAttribute('data-keep')).toBe('1')
    expect(div.hasAttribute('data-drop')).toBe(false)
    expect(div.title).toBe('hi')
  })

  it('removes a dropped boolean DOM property', () => {
    const { host, patch } = mount(html`<input disabled=${true} />`)
    const input = host.querySelector('input')

    patch(html`<input />`)

    expect(host.querySelector('input')).toBe(input)
    expect(input.disabled).toBe(false)
  })

  it('clears style rules that are gone from the new tree', () => {
    const { host, patch } = mount(html`<div style=${{ color: 'red' }}>x</div>`)
    const div = host.querySelector('div')

    patch(html`<div>x</div>`)

    expect(host.querySelector('div')).toBe(div)
    expect(div.style.color).toBe('')
  })

  it('clears a style rule that goes falsy in the new style object', () => {
    // the `{ fontStyle: condition && 'italic' }` shape: a full rebuild used to
    // drop the rule implicitly, a reused element has to be told to
    const { host, patch } = mount(
      html`<p style=${{ fontStyle: 'italic', color: 'red' }}>x</p>`
    )
    const p = host.querySelector('p')

    patch(html`<p style=${{ fontStyle: false, color: 'red' }}>x</p>`)

    expect(host.querySelector('p')).toBe(p)
    expect(p.style.fontStyle).toBe('')
    expect(p.style.color).toBe('red')
  })

  it('clears rules dropped from the style object entirely', () => {
    const { host, patch } = mount(
      html`<p style=${{ outline: '2px solid red' }}>x</p>`
    )
    const p = host.querySelector('p')

    patch(html`<p style=${{}}>x</p>`)

    expect(p.style.outline).toBe('')
  })

  it('re-applies event handlers, which the JSON diff cannot see', () => {
    const first = vi.fn()
    const second = vi.fn()
    const { host, patch } = mount(html`<button onclick=${first}>go</button>`)

    patch(html`<button onclick=${second}>go</button>`)
    host.querySelector('button').click()

    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledOnce()
  })

  it('replaces a node when the tag changes', () => {
    const { host, patch } = mount(html`<p>x</p>`)
    const p = host.querySelector('p')

    patch(html`<span>x</span>`)

    expect(p.isConnected).toBe(false)
    expect(host.querySelector('span').textContent).toBe('x')
  })

  it('grows and shrinks a list, keeping the surviving nodes', () => {
    const list = (items) =>
      html`<ul>
        ${items.map((i) => html`<li>${i}</li>`)}
      </ul>`
    const { host, patch } = mount(list(['a', 'b']))
    const first = host.querySelectorAll('li')[0]

    patch(list(['a', 'b', 'c']))
    let items = [...host.querySelectorAll('li')]
    expect(items.map((li) => li.textContent.trim())).toEqual(['a', 'b', 'c'])
    expect(items[0]).toBe(first)

    patch(list(['a']))
    items = [...host.querySelectorAll('li')]
    expect(items.map((li) => li.textContent.trim())).toEqual(['a'])
    expect(items[0]).toBe(first)
  })

  /**
   * Patching is index-based, so a reordered list is matched by position, not
   * identity. These specs pin that documented limitation: the resulting DOM is
   * always correct, but a node's preserved state belongs to its *slot*, not to
   * the item that used to live there. They are what a future `key` prop would
   * change — if identity-based matching lands, expect these to be rewritten.
   */
  describe('non-keyed limitation', () => {
    const list = (items) =>
      html`<ul>
        ${items.map((i) => html`<li>${i}</li>`)}
      </ul>`

    it('renders a reorder correctly, but rewrites nodes instead of moving them', () => {
      const { host, patch } = mount(list(['a', 'b', 'c']))
      const [first, second, third] = host.querySelectorAll('li')

      patch(list(['c', 'b', 'a']))

      const items = [...host.querySelectorAll('li')]
      // final DOM is right...
      expect(items.map((li) => li.textContent.trim())).toEqual(['c', 'b', 'a'])
      // ...but every node stayed in place and had its text rewritten
      expect(items).toEqual([first, second, third])
      expect(first.textContent.trim()).toBe('c')
    })

    it('keeps preserved state on the position, not on the item', () => {
      const rows = (items) =>
        html`<ul>
          ${items.map((i) => html`<li><input value=${i} /></li>`)}
        </ul>`
      const { host, patch } = mount(rows(['a', 'b', 'c']))
      const inputs = [...host.querySelectorAll('input')]

      // the user is typing in the row showing 'b'
      inputs[1].focus()
      inputs[1].value = 'typing'

      // 'a' is removed, so 'b' shifts up into index 0
      patch(rows(['b', 'c']))

      const after = [...host.querySelectorAll('input')]
      expect(after.length).toBe(2)
      // focus did NOT follow 'b' to its new position — it stayed on index 1,
      // which now holds 'c'
      expect(document.activeElement).toBe(inputs[1])
      expect(after[1]).toBe(inputs[1])
      // and because that slot's declared `value` changed ('b' -> 'c'), the
      // typed-but-uncommitted text is overwritten. Preserving an uncommitted
      // value only holds while the surrounding vnode for that position is
      // unchanged — a reorder is not that.
      expect(inputs[1].value).toBe('c')
    })
  })

  it('preserves focus and an uncommitted input value across a re-render', () => {
    const view = (label) => html`
      <label>${label}</label>
      <input type="text" />
    `
    const { host, patch } = mount(view('before'))
    const input = host.querySelector('input')

    input.focus()
    input.value = 'typed but uncommitted'

    patch(view('after'))

    expect(host.querySelector('input')).toBe(input)
    expect(input.value).toBe('typed but uncommitted')
    expect(document.activeElement).toBe(input)
    expect(host.querySelector('label').textContent).toBe('after')
  })
})
