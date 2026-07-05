import { describe, expect, it, vi } from 'vitest'
import { createElement } from '../../src/utils/create-element.mjs'
import { html } from '../../src/html.js'

describe('createElement', () => {
  it('turns a string leaf into a text node', () => {
    const node = createElement('hello')
    expect(node.nodeType).toBe(Node.TEXT_NODE)
    expect(node.textContent).toBe('hello')
  })

  it('builds an element from a vnode', () => {
    const el = createElement({ type: 'p', props: null, children: ['hi'] })
    expect(el.tagName).toBe('P')
    expect(el.textContent).toBe('hi')
  })

  it('assigns known DOM properties directly', () => {
    const el = createElement({ type: 'div', props: { id: 'foo' }, children: [] })
    expect(el.id).toBe('foo')
  })

  it('falls back to setAttribute for unknown props', () => {
    const el = createElement({ type: 'div', props: { 'data-x': 'y' }, children: [] })
    expect(el.getAttribute('data-x')).toBe('y')
  })

  it('applies style objects', () => {
    const el = createElement(html`<div style=${{ color: 'red', padding: '1em' }}>x</div>`)
    expect(el.style.color).toBe('red')
    expect(el.style.padding).toBe('1em')
  })

  it('attaches event handlers passed as props', () => {
    const onClick = vi.fn()
    const btn = createElement(html`<button onClick=${onClick}>hey</button>`)
    btn.click()
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('appends nested element and text children', () => {
    const el = createElement(html`<ul><li>a</li><li>b</li></ul>`)
    expect(el.tagName).toBe('UL')
    expect(el.querySelectorAll('li')).toHaveLength(2)
    expect(el.textContent).toBe('ab')
  })

  it('wraps an array of vnodes in a document fragment', () => {
    const frag = createElement([
      { type: 'p', props: null, children: ['a'] },
      { type: 'p', props: null, children: ['b'] },
    ])
    expect(frag.nodeType).toBe(Node.DOCUMENT_FRAGMENT_NODE)
    expect(frag.childNodes).toHaveLength(2)
  })

  it('handles a multi-root html template as a fragment', () => {
    const frag = createElement(html`<p>a</p><p>b</p>`)
    expect(frag.querySelectorAll('p')).toHaveLength(2)
  })
})
