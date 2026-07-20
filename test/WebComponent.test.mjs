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
/**
 *
 * @param Class
 * @param attributes
 */
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

  it('patches a prop-triggered re-render in place, keeping focus and caret', () => {
    class Patched extends WebComponent {
      static props = { label: 'before' }
      get template() {
        return html`
          <label>${this.props.label}</label>
          <input type="text" />
        `
      }
    }
    const el = mount(Patched)
    const input = el.querySelector('input')
    input.focus()
    input.value = 'uncommitted'
    input.setSelectionRange(3, 3)

    el.props.label = 'after'

    expect(el.querySelector('label').textContent).toBe('after')
    // same element instance — not rebuilt
    expect(el.querySelector('input')).toBe(input)
    expect(input.value).toBe('uncommitted')
    expect(document.activeElement).toBe(input)
    expect(input.selectionStart).toBe(3)
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

  it('adopts an array of styles in declaration order', () => {
    class MultiStyled extends WebComponent {
      static shadowRootInit = { mode: 'open' }
      static styles = [`p { color: red; }`, `p { padding: 1em; }`]
      get template() {
        return html`<p>hi</p>`
      }
    }
    const el = mount(MultiStyled)
    const sheets = el.shadowRoot.adoptedStyleSheets
    expect(sheets).toHaveLength(2)
    expect(sheets[0].cssRules[0].style.color).toBe('red')
    expect(sheets[1].cssRules[0].style.padding).toBe('1em')
  })

  it('passes CSSStyleSheet entries through, mixed with strings', () => {
    const shared = new CSSStyleSheet()
    shared.replaceSync(`p { color: blue; }`)

    class MixedStyled extends WebComponent {
      static shadowRootInit = { mode: 'open' }
      static styles = [shared, `p { padding: 2em; }`]
      get template() {
        return html`<p>hi</p>`
      }
    }
    const el = mount(MixedStyled)
    const sheets = el.shadowRoot.adoptedStyleSheets
    expect(sheets).toHaveLength(2)
    // the existing instance is adopted as-is, not re-created
    expect(sheets[0]).toBe(shared)
    expect(sheets[1].cssRules[0].style.padding).toBe('2em')
  })

  it('accepts a lone CSSStyleSheet', () => {
    const sheet = new CSSStyleSheet()
    sheet.replaceSync(`p { color: green; }`)

    class SheetStyled extends WebComponent {
      static shadowRootInit = { mode: 'open' }
      static styles = sheet
      get template() {
        return html`<p>hi</p>`
      }
    }
    const el = mount(SheetStyled)
    expect(el.shadowRoot.adoptedStyleSheets).toEqual([sheet])
  })

  it('logs the shadow-root guidance instead of throwing in light DOM', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})

    class LightStyled extends WebComponent {
      static styles = [`p { color: red; }`]
      get template() {
        return html`<p>hi</p>`
      }
    }
    expect(() => mount(LightStyled)).not.toThrow()
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining('shadow roots'),
      expect.anything()
    )
    error.mockRestore()
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
 * String and vnode templates render into the same target, so a string
 * template on a shadow component lands in the shadow root instead of
 * overwriting consumer-slotted light-DOM children.
 */
describe('string templates', () => {
  it('renders a string template into the shadow root', () => {
    class StringShadow extends WebComponent {
      static shadowRootInit = { mode: 'open' }
      get template() {
        return '<p>in shadow</p>'
      }
    }
    const el = mount(StringShadow)
    expect(el.shadowRoot.querySelector('p')?.textContent).toBe('in shadow')
    expect(el.querySelector('p')).toBeNull()
  })

  it('leaves slotted light-DOM children alone', () => {
    class Slotting extends WebComponent {
      static shadowRootInit = { mode: 'open' }
      static props = { active: false }
      get template() {
        return this.props.active ? '<slot></slot>' : ''
      }
    }
    const el = mount(Slotting)
    el.appendChild(
      Object.assign(document.createElement('span'), { textContent: 'mine' })
    )

    el.toggleAttribute('active', true)
    el.toggleAttribute('active', false)

    expect(el.querySelector('span')?.textContent).toBe('mine')
  })

  it('empties the rendered subtree for an empty template', () => {
    class Conditional extends WebComponent {
      static shadowRootInit = { mode: 'open' }
      static props = { active: false }
      get template() {
        return this.props.active ? html`<div>piece</div>` : html``
      }
    }
    const el = mount(Conditional, { active: '' })
    expect(el.shadowRoot.querySelector('div')).not.toBeNull()

    el.toggleAttribute('active', false)
    expect(el.shadowRoot.querySelector('div')).toBeNull()
    expect(el.shadowRoot.innerHTML).toBe('')
  })

  it('alternates element -> string -> element templates', () => {
    class Alternating extends WebComponent {
      static shadowRootInit = { mode: 'open' }
      static props = { mode: 'element' }
      get template() {
        return this.props.mode === 'element'
          ? html`<p>element</p>`
          : '<em>string</em>'
      }
    }
    const el = mount(Alternating)
    expect(el.shadowRoot.querySelector('p')?.textContent).toBe('element')

    el.setAttribute('mode', 'string')
    expect(el.shadowRoot.querySelector('p')).toBeNull()
    expect(el.shadowRoot.querySelector('em')?.textContent).toBe('string')

    el.setAttribute('mode', 'element')
    expect(el.shadowRoot.querySelector('em')).toBeNull()
    expect(el.shadowRoot.querySelector('p')?.textContent).toBe('element')
  })

  it('still renders a string template into the light DOM by default', () => {
    class StringLight extends WebComponent {
      get template() {
        return '<p>in light</p>'
      }
    }
    const el = mount(StringLight)
    expect(el.shadowRoot).toBeNull()
    expect(el.querySelector('p')?.textContent).toBe('in light')
  })

  it('adopts styles once across repeated renders', () => {
    class Restyled extends WebComponent {
      static shadowRootInit = { mode: 'open' }
      static styles = `p { color: red; }`
      static props = { label: 'a' }
      get template() {
        return html`<p>${this.props.label}</p>`
      }
    }
    const el = mount(Restyled)
    el.setAttribute('label', 'b')
    el.setAttribute('label', 'c')
    expect(el.shadowRoot.adoptedStyleSheets).toHaveLength(1)
  })
})

/**
 * Reactive-prop contract as documented on the docs site
 * (guides/usage, guides/prop-access, guides/life-cycle-hooks).
 *
 * Default props are no longer reflected onto attributes in the constructor
 * (the custom-elements spec forbids attribute mutation there, and it fired
 * `attributeChangedCallback` before the `#props` proxy existed). Reflection
 * now happens on first connect via `#reflectDefaults()`, skipping any
 * attribute already provided by markup/SSR/user.
 */
describe('reactive props (documented contract)', () => {
  class HelloWorld extends WebComponent {
    static props = { myName: 'World', count: 0, active: false, user: { a: 1 } }
    get template() {
      return `<h1>Hello ${this.props.myName}</h1>`
    }
  }
  // A class may only be registered under one tag, so register once and
  // create a fresh, connected instance per test.
  const tag = 'reactive-hello-world'
  window.customElements.define(tag, HelloWorld)
  const connected = () => {
    const el = document.createElement(tag)
    document.body.appendChild(el)
    return el
  }

  it('reflects static props defaults onto attributes', () => {
    const el = connected()
    expect(el.getAttribute('my-name')).toBe('World')
  })

  it('exposes camelCase props with their declared types', () => {
    const el = connected()
    expect(el.props.myName).toBe('World')
    expect(el.props.count).toBe(0)
    expect(el.props.active).toBe(false)
    expect(el.props.user).toEqual({ a: 1 })
  })

  it('re-renders and updates props when an attribute changes', () => {
    const el = connected()
    el.setAttribute('my-name', 'Ayo')
    expect(el.props.myName).toBe('Ayo')
    expect(el.querySelector('h1').textContent).toBe('Hello Ayo')
  })

  it('reflects prop writes back to the attribute (props === setAttribute)', () => {
    const el = connected()
    el.props.myName = 'Ayo'
    expect(el.getAttribute('my-name')).toBe('Ayo')
  })

  it('preserves the declared type when updating a number prop', () => {
    const el = connected()
    el.setAttribute('count', '5')
    expect(el.props.count).toBe(5)
  })

  it('turns a boolean prop on from a bare attribute (<el active>)', () => {
    const el = connected()
    // `<el active>` and `<el active="">` are the same to the DOM
    el.setAttribute('active', '')
    expect(el.props.active).toBe(true)
  })

  it('treats any present value on a boolean attribute as true', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const el = connected()
    el.setAttribute('active', 'true')
    expect(el.props.active).toBe(true)
    // presence wins — exactly like native `disabled="false"` is still disabled
    el.setAttribute('active', 'false')
    expect(el.props.active).toBe(true)
    warn.mockRestore()
  })

  it('warns when a boolean attribute is written as a "true"/"false" string', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const el = connected()
    el.setAttribute('active', 'false')
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('toggleAttribute("active", false)')
    )
    warn.mockRestore()
  })

  it('sets a boolean prop to false when the attribute is removed', () => {
    const el = connected()
    el.setAttribute('active', '')
    el.removeAttribute('active')
    expect(el.props.active).toBe(false)
  })

  it('reflects a boolean prop write as a bare/absent attribute', () => {
    const el = connected()
    el.props.active = true
    expect(el.getAttribute('active')).toBe('')
    expect(el.props.active).toBe(true)
    el.props.active = false
    expect(el.hasAttribute('active')).toBe(false)
    expect(el.props.active).toBe(false)
  })

  it('round-trips a boolean prop through toggleAttribute()', () => {
    const el = connected()
    // the whole point of REQ-07: host code can use the platform API
    el.toggleAttribute('active', true)
    expect(el.props.active).toBe(true)
    expect(el.getAttribute('active')).toBe('')
    el.toggleAttribute('active', false)
    expect(el.props.active).toBe(false)
    expect(el.hasAttribute('active')).toBe(false)
  })

  it('fires onChanges with property/attribute/previousValue/currentValue', () => {
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
      property: 'myName',
      attribute: 'my-name',
      currentValue: 'Ayo',
    })
  })
})

/**
 * Spec conformance: no attribute mutation in the constructor. Defaults are
 * reflected on connect, and pre-existing attributes (markup/SSR/user) win.
 */
describe('default reflection (no setAttribute in constructor)', () => {
  class Defaulted extends WebComponent {
    static props = { myName: 'World', count: 0 }
    get template() {
      return `<h1>Hello ${this.props.myName}</h1>`
    }
  }
  const tag = 'reflect-defaulted'
  window.customElements.define(tag, Defaulted)

  class TrueDefault extends WebComponent {
    static props = { flag: true }
  }
  window.customElements.define('reflect-bool-true', TrueDefault)

  it('createElement does not throw and defers defaults until connect', () => {
    const el = document.createElement(tag)
    // no attributes reflected before connect (spec-legal constructor)
    expect(el.getAttribute('my-name')).toBeNull()

    document.body.appendChild(el)
    // defaults appear as serialized attributes only after connect
    expect(el.getAttribute('my-name')).toBe('World')
    expect(el.getAttribute('count')).toBe('0')
  })

  it('does not overwrite a markup-provided attribute with a default', () => {
    const el = document.createElement(tag)
    el.setAttribute('my-name', 'Zoe')
    document.body.appendChild(el)
    expect(el.props.myName).toBe('Zoe')
    expect(el.getAttribute('my-name')).toBe('Zoe')
  })

  it('reflects a false boolean default as no attribute at all', () => {
    class BoolDefault extends WebComponent {
      static props = { flag: false, myName: 'World' }
    }
    const t = 'reflect-bool-false'
    window.customElements.define(t, BoolDefault)

    const el = document.createElement(t)
    document.body.appendChild(el)
    // no `flag="false"` noise, and `[flag]` CSS correctly does not match
    expect(el.hasAttribute('flag')).toBe(false)
    expect(el.props.flag).toBe(false)
    expect(el.matches('[flag]')).toBe(false)
  })

  it('reflects a true boolean default as a bare attribute', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const el = document.createElement('reflect-bool-true')
    document.body.appendChild(el)
    expect(el.getAttribute('flag')).toBe('')
    expect(el.props.flag).toBe(true)
    // a true default is discouraged: absence has to mean both false and
    // default, so removing the attribute lands on false, not back on true
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('boolean default should be false')
    )
    el.removeAttribute('flag')
    expect(el.props.flag).toBe(false)
    warn.mockRestore()
  })

  it('does not re-clobber a prop changed while connected on re-connect', () => {
    const el = document.createElement(tag)
    document.body.appendChild(el)
    el.props.myName = 'Ayo'
    el.remove()
    document.body.appendChild(el)
    expect(el.props.myName).toBe('Ayo')
    expect(el.getAttribute('my-name')).toBe('Ayo')
  })
})

/**
 * Non-cloneable defaults (functions, class instances) must not crash the
 * constructor via structuredClone's DataCloneError; they are kept by
 * reference and flagged once with a readable warning.
 */
describe('safe prop cloning + define-time validation', () => {
  it('constructs with a function default (kept by ref) and warns once per class', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    class WithFn extends WebComponent {
      static props = { fn: () => 42 }
    }
    const tag = 'clone-with-fn'
    window.customElements.define(tag, WithFn)

    const a = document.createElement(tag)
    const b = document.createElement(tag)
    // function survives by reference and is callable on both instances
    expect(a.props.fn()).toBe(42)
    expect(b.props.fn()).toBe(42)
    // memoized per class: constructing many instances warns at most once
    expect(warn).toHaveBeenCalledOnce()
    expect(warn.mock.calls[0][0]).toContain('WithFn.fn')

    warn.mockRestore()
  })

  it('deep-copies object/array defaults so instances do not share them', () => {
    class WithList extends WebComponent {
      static props = { list: [1, 2] }
    }
    const tag = 'clone-with-list'
    window.customElements.define(tag, WithList)

    const a = document.createElement(tag)
    const b = document.createElement(tag)
    a.props.list.push(3)
    expect(a.props.list).toEqual([1, 2, 3])
    expect(b.props.list).toEqual([1, 2])
  })
})

/**
 * Prop types are derived from `static props` defaults only. A declared-type
 * violation is logged and skipped (never thrown), so a stray write can't
 * escape `attributeChangedCallback` and silently halt rendering. Undeclared
 * props are untyped and never lock a type on first write.
 */
describe('prop type handling (derive from defaults, log not throw)', () => {
  it('logs and skips a declared-type violation without throwing', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    class Typed extends WebComponent {
      static props = { label: 'hi' }
    }
    window.customElements.define('typed-label', Typed)
    const el = document.createElement('typed-label')
    document.body.appendChild(el)

    expect(() => {
      el.props.label = 5
    }).not.toThrow()
    expect(error).toHaveBeenCalledOnce()
    expect(error.mock.calls[0][0]).toContain('label')
    // value unchanged after the rejected write
    expect(el.props.label).toBe('hi')

    // a subsequent same-type write still succeeds and reflects the attribute
    el.props.label = 'ok'
    expect(el.props.label).toBe('ok')
    expect(el.getAttribute('label')).toBe('ok')

    error.mockRestore()
  })

  it('does not lock or throw on an undeclared prop written with mixed types', () => {
    class Untyped extends WebComponent {
      static props = { name: 'x' }
    }
    window.customElements.define('untyped-extra', Untyped)
    const el = document.createElement('untyped-extra')
    document.body.appendChild(el)

    expect(() => {
      el.props.extra = 'first'
      el.props.extra = 2
      el.props.extra = true
    }).not.toThrow()
    expect(el.props.extra).toBe(true)
  })

  it('throws on a declared-type violation when static strictProps is true', () => {
    class Strict extends WebComponent {
      static props = { label: 'hi' }
      static strictProps = true
    }
    window.customElements.define('strict-label', Strict)
    const el = document.createElement('strict-label')
    document.body.appendChild(el)

    expect(() => {
      el.props.label = 5
    }).toThrow(TypeError)
    // value stays intact after the rejected write
    expect(el.props.label).toBe('hi')
  })

  it('renders through the previously-poisoning empty-then-string sequence', () => {
    class Poisonable extends WebComponent {
      static props = { myName: 'World' }
      get template() {
        return `<h1>Hello ${this.props.myName}</h1>`
      }
    }
    window.customElements.define('poison-seq', Poisonable)
    const el = document.createElement('poison-seq')
    document.body.appendChild(el)

    expect(() => {
      el.setAttribute('my-name', '')
      el.setAttribute('my-name', 'Ayo')
    }).not.toThrow()
    expect(el.querySelector('h1').textContent).toBe('Hello Ayo')
  })
})

/**
 * Attribute value & removal handling in attributeChangedCallback: empty
 * string stays a string (not coerced to `true`), removal resets to the
 * declared default, malformed typed values don't skip render, and prop
 * names that collide with native element properties (e.g. `title`) are no
 * longer written to the instance.
 */
describe('attribute value & removal handling', () => {
  it('keeps an empty-string attribute as "" (not coerced to true)', () => {
    const changes = []
    class Emptyable extends WebComponent {
      static props = { label: 'hi' }
      onChanges(c) {
        changes.push(c)
      }
    }
    window.customElements.define('attr-emptyable', Emptyable)
    const el = document.createElement('attr-emptyable')
    document.body.appendChild(el)

    el.setAttribute('label', '')
    expect(el.props.label).toBe('')
    // regression: must NOT echo back as "true"
    expect(el.getAttribute('label')).toBe('')
    expect(changes.at(-1)).toMatchObject({
      property: 'label',
      currentValue: '',
    })
  })

  it('resets a prop to its static default when the attribute is removed', () => {
    const changes = []
    class Removable extends WebComponent {
      static props = { myName: 'World' }
      onChanges(c) {
        changes.push(c)
      }
    }
    window.customElements.define('attr-removable', Removable)
    const el = document.createElement('attr-removable')
    document.body.appendChild(el)

    el.setAttribute('my-name', 'Ayo')
    expect(el.props.myName).toBe('Ayo')

    expect(() => el.removeAttribute('my-name')).not.toThrow()
    expect(el.props.myName).toBe('World')
    // onChanges fired for the removal with currentValue null
    expect(changes.some((c) => c.currentValue === null)).toBe(true)
  })

  it('does not skip render when a typed attribute value is malformed', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    const changes = []
    class Counter extends WebComponent {
      static props = { count: 0 }
      onChanges(c) {
        changes.push(c)
      }
    }
    window.customElements.define('attr-counter', Counter)
    const el = document.createElement('attr-counter')
    document.body.appendChild(el)

    // valid value round-trips through the number type
    el.setAttribute('count', '5')
    expect(el.props.count).toBe(5)

    // malformed value must not throw and must still fire onChanges/render
    expect(() => el.setAttribute('count', 'abc')).not.toThrow()
    expect(changes.at(-1)).toMatchObject({
      property: 'count',
      currentValue: 'abc',
    })

    error.mockRestore()
  })

  it('does not touch the native property for a prop named "title"', () => {
    class Titled extends WebComponent {
      static props = { title: 'original' }
    }
    window.customElements.define('attr-titled', Titled)
    const el = document.createElement('attr-titled')
    document.body.appendChild(el)

    el.setAttribute('title', 'changed')
    expect(el.props.title).toBe('changed')
    // the callback no longer writes `this.title = true`; the native property
    // reflects the real string value, not a boolean-coerced "true"
    expect(el.title).not.toBe('true')
    expect(el.getAttribute('title')).toBe('changed')
  })
})

/**
 * onChanges distinguishes `property` (camelCase prop key, matching `props`
 * access) from `attribute` (kebab-case attribute name), so handlers can index
 * `props` without re-deriving the key.
 */
describe('onChanges property vs attribute', () => {
  it('exposes camelCase property and kebab attribute for a multi-word prop', () => {
    const changes = []
    class MultiWord extends WebComponent {
      static props = { myName: 'World' }
      onChanges(c) {
        changes.push(c)
      }
    }
    window.customElements.define('changes-multiword', MultiWord)
    const el = document.createElement('changes-multiword')
    document.body.appendChild(el)

    el.setAttribute('my-name', 'Ayo')
    const last = changes.at(-1)
    expect(last.property).toBe('myName') // camelCase prop key
    expect(last.attribute).toBe('my-name') // kebab attribute name
    expect(last.currentValue).toBe('Ayo')
  })
})

/**
 * Upgrade ordering: the platform can fire attributeChangedCallback for
 * authored attributes BEFORE connectedCallback. Attribute-driven
 * render()/onChanges() are buffered so onInit always runs first, while the
 * prop value itself is applied immediately (props stays current in onInit).
 */
describe('attribute callback buffering (upgrade ordering)', () => {
  it('runs onInit before the first render/onChanges for a pre-connect attribute', () => {
    const order = []
    let nameInOnInit
    class Upgraded extends WebComponent {
      static props = { myName: 'World' }
      onInit() {
        order.push('onInit')
        nameInOnInit = this.props.myName
      }
      onChanges() {
        order.push('onChanges')
      }
      render() {
        order.push('render')
        super.render()
      }
      get template() {
        return `<h1>Hello ${this.props.myName}</h1>`
      }
    }
    window.customElements.define('upgrade-order', Upgraded)

    // approximate upgrade: set the attribute before the element connects
    const el = document.createElement('upgrade-order')
    el.setAttribute('my-name', 'Ayo')
    // buffered: no render/onChanges have fired yet
    expect(order).toEqual([])

    document.body.appendChild(el)

    // onInit ran before the first render; onChanges was NOT replayed
    expect(order[0]).toBe('onInit')
    expect(order.indexOf('onInit')).toBeLessThan(order.indexOf('render'))
    expect(order).not.toContain('onChanges')
    // props already reflects the authored attribute inside onInit
    expect(nameInOnInit).toBe('Ayo')
    expect(el.querySelector('h1').textContent).toBe('Hello Ayo')
  })

  it('fires render and onChanges normally for post-connect attribute changes', () => {
    const order = []
    class PostConnect extends WebComponent {
      static props = { myName: 'World' }
      onChanges() {
        order.push('onChanges')
      }
      render() {
        order.push('render')
        super.render()
      }
      get template() {
        return `<h1>Hello ${this.props.myName}</h1>`
      }
    }
    window.customElements.define('post-connect', PostConnect)
    const el = document.createElement('post-connect')
    document.body.appendChild(el)

    order.length = 0
    el.setAttribute('my-name', 'Zoe')
    expect(order).toContain('render')
    expect(order).toContain('onChanges')
    expect(el.querySelector('h1').textContent).toBe('Hello Zoe')
  })
})

/**
 * `toAttribute` / `fromAttribute` are the seam for props whose reflection or
 * parsing doesn't fit the built-in rules. Overriding one prop must not disturb
 * the others, which keep the default behavior via `super`.
 */
describe('custom attribute converters (toAttribute / fromAttribute)', () => {
  class WithConverters extends WebComponent {
    // the declared type comes from the default's `typeof`, so a Date-valued
    // prop must declare a Date default or the proxy's type guard rejects it
    static props = {
      when: new Date('2026-01-01T00:00:00Z'),
      label: 'hi',
      flag: false,
    }

    toAttribute(name, value) {
      // a Date reflects as an ISO date string
      if (name === 'when' && value instanceof Date)
        return value.toISOString().slice(0, 10)
      return super.toAttribute(name, value)
    }

    fromAttribute(name, value) {
      if (name === 'when') return new Date(`${value}T00:00:00Z`)
      return super.fromAttribute(name, value)
    }
  }
  const tag = 'with-converters'
  window.customElements.define(tag, WithConverters)

  const mountEl = (markup = `<${tag}></${tag}>`) => {
    document.body.innerHTML = markup
    return document.querySelector(tag)
  }

  it('uses fromAttribute to parse a custom attribute value', () => {
    const el = mountEl(`<${tag} when="2026-07-20"></${tag}>`)
    expect(el.props.when).toBeInstanceOf(Date)
    expect(el.props.when.toISOString()).toBe('2026-07-20T00:00:00.000Z')
  })

  it('uses toAttribute to serialize a custom prop write', () => {
    const el = mountEl()
    el.props.when = new Date('2026-01-02T00:00:00Z')
    expect(el.getAttribute('when')).toBe('2026-01-02')
  })

  it('keeps the exact prop value when toAttribute is lossy', () => {
    const el = mountEl()
    const exact = new Date('2026-01-02T13:45:30Z')
    el.props.when = exact
    // the attribute only carries the date part, but the prop is not
    // round-tripped back through fromAttribute, so the time survives
    expect(el.getAttribute('when')).toBe('2026-01-02')
    expect(el.props.when).toBe(exact)
    expect(el.props.when.toISOString()).toBe('2026-01-02T13:45:30.000Z')
  })

  it('still renders and fires onChanges for a reflected prop write', () => {
    const changes = []
    class Reactive extends WebComponent {
      static props = { label: 'a' }
      onChanges(c) {
        changes.push(c)
      }
      get template() {
        return `<span>${this.props.label}</span>`
      }
    }
    const t = 'reflect-reactive'
    window.customElements.define(t, Reactive)
    document.body.innerHTML = `<${t}></${t}>`
    const el = document.querySelector(t)

    el.props.label = 'b'
    // skipping the parse-back must not skip the reactivity
    expect(el.querySelector('span').textContent).toBe('b')
    expect(changes.at(-1)).toMatchObject({
      property: 'label',
      currentValue: 'b',
    })
  })

  it('leaves props the override delegates to super alone', () => {
    const el = mountEl()
    el.props.label = 'changed'
    expect(el.getAttribute('label')).toBe('changed')
    // the boolean default still reflects as presence/absence
    expect(el.hasAttribute('flag')).toBe(false)
    el.props.flag = true
    expect(el.getAttribute('flag')).toBe('')
  })

  it('removes the attribute when toAttribute returns null', () => {
    class Removable extends WebComponent {
      static props = { label: 'hi' }
      toAttribute(name, value) {
        // an empty string means "no attribute at all" for this prop
        return value === '' ? null : super.toAttribute(name, value)
      }
    }
    const t = 'removable-attr'
    window.customElements.define(t, Removable)
    document.body.innerHTML = `<${t}></${t}>`
    const el = document.querySelector(t)

    expect(el.getAttribute('label')).toBe('hi')
    el.props.label = ''
    expect(el.hasAttribute('label')).toBe(false)
    expect(el.props.label).toBe('')
  })

  it('does not call fromAttribute for a removal (default reset wins)', () => {
    const seen = []
    class Tracked extends WebComponent {
      static props = { label: 'default' }
      fromAttribute(name, value) {
        seen.push(value)
        return super.fromAttribute(name, value)
      }
    }
    const t = 'tracked-converter'
    window.customElements.define(t, Tracked)
    document.body.innerHTML = `<${t} label="set"></${t}>`
    const el = document.querySelector(t)
    expect(seen).toEqual(['set'])

    el.removeAttribute('label')
    // removal resets to the declared default without consulting the converter
    expect(seen).toEqual(['set'])
    expect(el.props.label).toBe('default')
  })

  it('defaults reflect through toAttribute at mount time', () => {
    class DefaultConv extends WebComponent {
      static props = { size: 2 }
      toAttribute(name, value) {
        return name === 'size' ? `${value}px` : super.toAttribute(name, value)
      }
    }
    const t = 'default-converter'
    window.customElements.define(t, DefaultConv)
    document.body.innerHTML = `<${t}></${t}>`
    expect(document.querySelector(t).getAttribute('size')).toBe('2px')
  })
})
