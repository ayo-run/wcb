import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { WebComponent } from '../src/WebComponent.js'
import { html } from '../src/html.js'

let componentUnderTest

describe('WebComponent', () => {
  /**
   * We need to define the custom element because
   * browsers throw an error when you instantiate
   * a custom element class that is not in the registry
   */
  window.customElements.define('component-test', WebComponent)

  beforeEach(() => {
    componentUnderTest = new WebComponent()
  })

  it('is instantiated', () => {
    expect(componentUnderTest).toBeDefined()
  })

  it('has a readonly template prop', () => {
    expect(componentUnderTest.template).toBe('')
    const assignToReadonly = () => {
      componentUnderTest.template = 'should error'
    }
    expect(() => assignToReadonly()).toThrowError()
  })
})

/**
 * Registers a one-off custom element for `Class` under a unique tag,
 * appends an instance to the document (triggering connectedCallback),
 * and returns it. Remove it with `el.remove()` to trigger disconnect.
 */
let tagSeq = 0
function mount(Class, attributes = {}) {
  const tag = `wc-test-${tagSeq++}`
  window.customElements.define(tag, Class)
  const el = document.createElement(tag)
  for (const [name, value] of Object.entries(attributes)) {
    el.setAttribute(name, value)
  }
  document.body.appendChild(el)
  return el
}

afterEach(() => {
  document.body.replaceChildren()
})

describe('observedAttributes', () => {
  it('is derived from static props as kebab-case names', () => {
    class Observed extends WebComponent {
      static props = { myName: 'World', isActive: false }
    }
    expect(Observed.observedAttributes).toEqual(['my-name', 'is-active'])
  })

  it('is empty when no static props are declared', () => {
    class Bare extends WebComponent {}
    expect(Bare.observedAttributes).toEqual([])
  })
})

describe('life-cycle hooks', () => {
  it('calls onInit when connected, then afterViewInit after first render', () => {
    const order = []
    class Hooked extends WebComponent {
      onInit() {
        order.push('onInit')
      }
      afterViewInit() {
        order.push('afterViewInit')
      }
      get template() {
        return `<span>hi</span>`
      }
    }
    mount(Hooked)
    expect(order).toEqual(['onInit', 'afterViewInit'])
  })

  it('renders the template into the DOM on connect', () => {
    class Rendered extends WebComponent {
      get template() {
        return `<h1>Hello</h1>`
      }
    }
    const el = mount(Rendered)
    expect(el.querySelector('h1')?.textContent).toBe('Hello')
  })

  it('calls onDestroy when disconnected', () => {
    const onDestroy = vi.fn()
    class Destroyed extends WebComponent {
      onDestroy() {
        onDestroy()
      }
    }
    const el = mount(Destroyed)
    el.remove()
    expect(onDestroy).toHaveBeenCalledOnce()
  })
})

describe('render()', () => {
  it('renders a string template into innerHTML', () => {
    class StringTemplate extends WebComponent {
      get template() {
        return `<p class="from-string">yo</p>`
      }
    }
    const el = mount(StringTemplate)
    expect(el.querySelector('p.from-string')?.textContent).toBe('yo')
  })

  it('renders an object (html) template into real DOM nodes', () => {
    class ObjectTemplate extends WebComponent {
      get template() {
        return html`<p class="from-html">yo</p>`
      }
    }
    const el = mount(ObjectTemplate)
    const p = el.querySelector('p.from-html')
    expect(p).not.toBeNull()
    expect(p.textContent).toBe('yo')
  })

  it('can be called manually to re-render unobserved state', () => {
    class Manual extends WebComponent {
      _count = 0
      get template() {
        return `<span>${this._count}</span>`
      }
    }
    const el = mount(Manual)
    expect(el.querySelector('span').textContent).toBe('0')
    el._count = 5
    el.render()
    expect(el.querySelector('span').textContent).toBe('5')
  })

  it('can be overridden to use a custom rendering approach', () => {
    class Custom extends WebComponent {
      render() {
        this.innerHTML = '<em>custom</em>'
      }
    }
    const el = mount(Custom)
    expect(el.querySelector('em')?.textContent).toBe('custom')
  })
})

describe('styling', () => {
  it('applies a style object to an element via the html template', () => {
    class StyleObject extends WebComponent {
      get template() {
        return html`<div style=${{ color: 'red', padding: '1em' }}>x</div>`
      }
    }
    const el = mount(StyleObject)
    const div = el.querySelector('div')
    expect(div.style.color).toBe('red')
    expect(div.style.padding).toBe('1em')
  })

  it('adopts a static styles stylesheet in the shadow root', () => {
    class ShadowStyled extends WebComponent {
      static shadowRootInit = { mode: 'open' }
      static styles = `p { color: red; }`
      get template() {
        return html`<p>hi</p>`
      }
    }
    const el = mount(ShadowStyled)
    expect(el.shadowRoot.adoptedStyleSheets).toHaveLength(1)
  })
})

describe('shadow DOM', () => {
  it('renders into a shadow root when shadowRootInit is set', () => {
    class Shadowed extends WebComponent {
      static shadowRootInit = { mode: 'open' }
      get template() {
        return html`<p>in shadow</p>`
      }
    }
    const el = mount(Shadowed)
    expect(el.shadowRoot).not.toBeNull()
    expect(el.shadowRoot.querySelector('p')?.textContent).toBe('in shadow')
    // light DOM stays empty
    expect(el.querySelector('p')).toBeNull()
  })

  it('renders into the light DOM by default', () => {
    class Light extends WebComponent {
      get template() {
        return html`<p>in light</p>`
      }
    }
    const el = mount(Light)
    expect(el.shadowRoot).toBeNull()
    expect(el.querySelector('p')?.textContent).toBe('in light')
  })
})

/**
 * Reactive-prop contract as documented on the docs site
 * (guides/usage, guides/prop-access, guides/life-cycle-hooks).
 *
 * These are marked `it.fails` because the current implementation cannot
 * construct any component that declares `static props`: the constructor
 * reflects each default with `setAttribute`, which synchronously fires
 * `attributeChangedCallback` -> `#handleUpdateProp` before the `#props`
 * proxy is assigned, throwing a TypeError. This is the Phase-0 correctness
 * work called out at the top of the README (no attribute writes in the
 * constructor; empty-string / removed-attribute handling). When those
 * fixes land, flip these back to `it` — vitest will flag each one that
 * starts passing.
 */
describe('reactive props (documented contract, pending Phase 0 fixes)', () => {
  class HelloWorld extends WebComponent {
    static props = { myName: 'World', count: 0, active: false, user: { a: 1 } }
    get template() {
      return `<h1>Hello ${this.props.myName}</h1>`
    }
  }

  it.fails('reflects static props defaults onto attributes', () => {
    const el = mount(HelloWorld)
    expect(el.getAttribute('my-name')).toBe('World')
  })

  it.fails('exposes camelCase props with their declared types', () => {
    const el = mount(HelloWorld)
    expect(el.props.myName).toBe('World')
    expect(el.props.count).toBe(0)
    expect(el.props.active).toBe(false)
    expect(el.props.user).toEqual({ a: 1 })
  })

  it.fails('re-renders and updates props when an attribute changes', () => {
    const el = mount(HelloWorld)
    el.setAttribute('my-name', 'Ayo')
    expect(el.props.myName).toBe('Ayo')
    expect(el.querySelector('h1').textContent).toBe('Hello Ayo')
  })

  it.fails('reflects prop writes back to the attribute (props === setAttribute)', () => {
    const el = mount(HelloWorld)
    el.props.myName = 'Ayo'
    expect(el.getAttribute('my-name')).toBe('Ayo')
  })

  it.fails('preserves the declared type when updating a number prop', () => {
    const el = mount(HelloWorld)
    el.setAttribute('count', '5')
    expect(el.props.count).toBe(5)
  })

  it.fails('fires onChanges with property/previousValue/currentValue', () => {
    const changes = []
    class WithChanges extends WebComponent {
      static props = { myName: 'World' }
      onChanges(change) {
        changes.push(change)
      }
    }
    const el = mount(WithChanges)
    el.setAttribute('my-name', 'Ayo')
    expect(changes.at(-1)).toMatchObject({
      property: 'my-name',
      currentValue: 'Ayo',
    })
  })
})
