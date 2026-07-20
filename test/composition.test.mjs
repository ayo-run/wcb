import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { WebComponent } from '../src/WebComponent.js'
import { html } from '../src/html.js'

/**
 * Composition: a component that renders another component, several levels deep.
 * A parent's vnode never describes what a nested component rendered for itself,
 * so the in-place reconciler must treat a nested custom element as opaque —
 * patch its props (data flows down) but leave its own children to the child.
 * Reconciling them trims the child's rendered content on every ancestor
 * re-render and leaves it blank until the child next re-renders on its own.
 */

let mounted = []
/**
 * Creates, connects and tracks an element so it is cleaned up between tests.
 * @param {string} tag the custom element tag to mount
 * @returns {HTMLElement} the connected element
 */
function mount(tag) {
  const el = document.createElement(tag)
  document.body.appendChild(el)
  mounted.push(el)
  return el
}
beforeEach(() => {
  mounted.forEach((el) => el.remove())
  mounted = []
})

describe('light-DOM component nesting', () => {
  class Leaf extends WebComponent {
    static props = { n: 0 }
    get template() {
      return html`<span class="leaf">${this.props.n}</span>`
    }
  }
  class Middle extends WebComponent {
    static props = { n: 0 }
    get template() {
      return html`<div class="mid"><c-leaf n=${this.props.n}></c-leaf></div>`
    }
  }
  class Root extends WebComponent {
    static props = { n: 0, banner: 'hi' }
    get template() {
      return html`
        <section>
          <p class="banner">${this.props.banner}</p>
          <c-middle n=${this.props.n}></c-middle>
        </section>
      `
    }
  }
  beforeAll(() => {
    customElements.define('c-leaf', Leaf)
    customElements.define('c-middle', Middle)
    customElements.define('c-root', Root)
  })

  it('renders all three levels on first connect', () => {
    const root = mount('c-root')
    expect(root.querySelector('.banner').textContent).toBe('hi')
    expect(root.querySelector('c-leaf .leaf').textContent).toBe('0')
  })

  it('propagates a prop down every level on re-render', () => {
    const root = mount('c-root')
    root.props.n = 5
    expect(root.querySelector('c-middle').getAttribute('n')).toBe('5')
    expect(root.querySelector('c-leaf').getAttribute('n')).toBe('5')
    expect(root.querySelector('c-leaf .leaf').textContent).toBe('5')
  })

  it('does not wipe a nested subtree when an unrelated ancestor prop changes', () => {
    const root = mount('c-root')
    const leaf = root.querySelector('c-leaf')
    // the leaf's own rendered content is present...
    expect(leaf.querySelector('.leaf').textContent).toBe('0')
    // ...and an ancestor re-render for an unrelated reason leaves it in place
    root.props.banner = 'changed'
    expect(root.querySelector('c-leaf')).toBe(leaf)
    expect(leaf.querySelector('.leaf')).not.toBeNull()
    expect(leaf.querySelector('.leaf').textContent).toBe('0')
  })

  it('preserves a nested component’s own internal state across ancestor re-renders', () => {
    const root = mount('c-root')
    const leaf = root.querySelector('c-leaf')
    // the leaf mutates its own state, independent of any parent prop
    leaf.props.n = 99
    expect(leaf.querySelector('.leaf').textContent).toBe('99')
    // unrelated ancestor re-render must not reset it
    root.props.banner = 'again'
    expect(leaf.querySelector('.leaf').textContent).toBe('99')
    // ...and the leaf node itself was reused, not rebuilt
    expect(root.querySelector('c-leaf')).toBe(leaf)
  })

  it('reuses the nested element instance rather than rebuilding it', () => {
    const root = mount('c-root')
    const leaf = root.querySelector('c-leaf')
    root.props.n = 1
    root.props.n = 2
    root.props.banner = 'x'
    expect(root.querySelector('c-leaf')).toBe(leaf)
    expect(leaf.querySelector('.leaf').textContent).toBe('2')
  })
})

describe('conditional nesting', () => {
  class Inner extends WebComponent {
    static props = { n: 0 }
    get template() {
      return html`<b class="inner">${this.props.n}</b>`
    }
  }
  class Toggle extends WebComponent {
    static props = { show: false }
    get template() {
      return this.props.show
        ? html`<div><t-inner n=${7}></t-inner></div>`
        : html`<div>empty</div>`
    }
  }
  beforeAll(() => {
    customElements.define('t-inner', Inner)
    customElements.define('t-toggle', Toggle)
  })

  it('adds, removes and re-adds a nested component cleanly', () => {
    const t = mount('t-toggle')
    expect(t.querySelector('t-inner')).toBeNull()
    t.props.show = true
    expect(t.querySelector('t-inner .inner').textContent).toBe('7')
    t.props.show = false
    expect(t.querySelector('t-inner')).toBeNull()
    expect(t.querySelector('div').textContent).toBe('empty')
    t.props.show = true
    expect(t.querySelector('t-inner .inner').textContent).toBe('7')
  })
})

describe('shadow-DOM nesting is unaffected', () => {
  class SLeaf extends WebComponent {
    static props = { n: 0 }
    static shadowRootInit = { mode: 'open' }
    get template() {
      return html`<span>${this.props.n}</span>`
    }
  }
  class SRoot extends WebComponent {
    static props = { n: 0, banner: 'hi' }
    get template() {
      return html`<p>${this.props.banner}</p>
        <s-leaf n=${this.props.n}></s-leaf>`
    }
  }
  // a light-DOM component that projects parent-authored children into a slot
  class SlotHost extends WebComponent {
    static props = {}
    static shadowRootInit = { mode: 'open' }
    get template() {
      return html`<div class="frame"><slot></slot></div>`
    }
  }
  class SlotParent extends WebComponent {
    static props = { label: 'a' }
    get template() {
      return html`<slot-host
        ><em class="proj">${this.props.label}</em></slot-host
      >`
    }
  }
  beforeAll(() => {
    customElements.define('s-leaf', SLeaf)
    customElements.define('s-root', SRoot)
    customElements.define('slot-host', SlotHost)
    customElements.define('slot-parent', SlotParent)
  })

  it('a shadow-DOM child keeps its content through an ancestor re-render', () => {
    const root = mount('s-root')
    const leaf = root.querySelector('s-leaf')
    expect(leaf.shadowRoot.querySelector('span').textContent).toBe('0')
    root.props.banner = 'changed'
    expect(leaf.shadowRoot.querySelector('span').textContent).toBe('0')
    root.props.n = 3
    expect(leaf.shadowRoot.querySelector('span').textContent).toBe('3')
  })

  it('parent-authored slot content is still reconciled on the child', () => {
    const p = mount('slot-parent')
    const host = p.querySelector('slot-host')
    expect(host.querySelector('.proj').textContent).toBe('a')
    // this light child is genuinely parent-authored, so it must keep updating
    p.props.label = 'B'
    expect(host.querySelector('.proj').textContent).toBe('B')
  })
})
