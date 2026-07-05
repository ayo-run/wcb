import { describe, expect, it } from 'vitest'
import { html } from '../src/html.js'

describe('html tagged template', () => {
  it('produces a {type, props, children} vnode', () => {
    const vnode = html`<p>hi</p>`
    expect(vnode).toMatchObject({ type: 'p', children: ['hi'] })
  })

  it('reads static attributes into props', () => {
    const vnode = html`<a href="/x">y</a>`
    expect(vnode.props).toEqual({ href: '/x' })
  })

  it('reads interpolated attribute values into props', () => {
    const href = '/dynamic'
    const vnode = html`<a href=${href}>y</a>`
    expect(vnode.props.href).toBe('/dynamic')
  })

  it('treats bare attributes as boolean true', () => {
    const vnode = html`<input disabled />`
    expect(vnode.type).toBe('input')
    expect(vnode.props).toEqual({ disabled: true })
  })

  it('supports spread props', () => {
    const vnode = html`<a ...${{ href: '/x', title: 't' }}>y</a>`
    expect(vnode.props).toMatchObject({ href: '/x', title: 't' })
  })

  it('nests child vnodes', () => {
    const vnode = html`<ul><li>a</li></ul>`
    expect(vnode.type).toBe('ul')
    expect(vnode.children[0]).toMatchObject({ type: 'li', children: ['a'] })
  })

  it('interleaves text and interpolated values as children', () => {
    const vnode = html`<p>Hello ${'World'}</p>`
    expect(vnode.type).toBe('p')
    expect(vnode.children.join('')).toBe('Hello World')
  })

  it('returns an array for multiple root nodes', () => {
    const vnodes = html`<p>a</p><p>b</p>`
    expect(Array.isArray(vnodes)).toBe(true)
    expect(vnodes).toHaveLength(2)
  })
})
