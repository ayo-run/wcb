/**
 * @license MIT <https://opensource.org/licenses/MIT>
 * @author Ayo Ayco <https://ayo.ayco.io>
 */

import {
  createElement,
  getKebabCase,
  getCamelCase,
  serialize,
  deserialize,
  patchChildren,
} from './utils/index.js'

/** Component classes whose defaults have been validated (once per class). */
const validated = new WeakSet()

/**
 * Returns a fresh defaults object for a component: plain data is deep-copied
 * per key so instances never share object/array defaults, while non-cloneable
 * values (functions, class instances) are kept by reference instead of
 * throwing `DataCloneError`. On the first call per class it also warns (once)
 * about types that can't reflect to an attribute — those belong in
 * handlers/refs, not reflected props.
 * @param {typeof WebComponent} ctor the component constructor
 * @returns {object} a fresh defaults object
 */
function cloneDefaults(ctor) {
  const check = !validated.has(ctor)
  if (check) validated.add(ctor)
  const out = {}
  for (const key in ctor.props) {
    const value = ctor.props[key]
    const type = typeof value
    // a true boolean default is discouraged: HTML has no true-default boolean
    // attribute, so absence has to mean both "false" and "default", which only
    // holds when they coincide. A way to work with this is to invert the name (`disabled`, not `enabled`) when you need a default.
    if (check) {
      const bad =
        type === 'function' || type === 'symbol'
          ? `${type} default not reflectable; use handlers/refs.`
          : value === true &&
            'boolean default should be false; invert the name.'
      if (bad) console.warn(`${ctor.name}.${key}: ${bad}`)
    }
    try {
      out[key] = structuredClone(value)
    } catch {
      out[key] = value
    }
  }
  return out
}

/**
 * Blueprint for the Proxy props
 * @typedef {{[name: string]: any}} PropStringMap
 */

/**
 * A minimal base class to reduce the complexity of creating reactive custom elements
 *
 * Pass the shape of your `static props` as a type argument to get typed
 * `this.props` access in TypeScript:
 * ```ts
 * const props = { variant: 'primary', enabled: true }
 * class CozyButton extends WebComponent<typeof props> {
 *   static props = props
 * }
 * ```
 * @template {PropStringMap} [Props=PropStringMap]
 * @see https://webcomponent.io
 * @see https://webcomponent.io/prop-access/
 */
export class WebComponent extends HTMLElement {
  #host
  #prevDOM
  #props
  #typeMap = {}
  #reflected = false
  #connected = false

  /**
   * Declared props and their defaults. The value types of this object drive
   * both the runtime type guard and — when passed as the class type argument
   * — the compile-time type of `this.props`.
   * @type {PropStringMap}
   */
  static props

  /**
   * CSS adopted into the shadow root as constructable stylesheet(s). An array
   * is adopted in order, so shared/base sheets can be composed with
   * per-component ones. Requires `static shadowRootInit`.
   * @type {string | CSSStyleSheet | Array<string | CSSStyleSheet>}
   */
  static styles

  /**
   * Read-only string property that represents how the component will be rendered
   * @returns {string | any}
   * @see https://webcomponent.io/template-vs-render/
   */
  get template() {
    return ''
  }

  /**
   * Shadow root initialization options
   * @type {ShadowRootInit}
   */
  static shadowRootInit

  /**
   * When `true`, a declared-type violation on a prop write throws a
   * `TypeError` instead of logging via `console.error` and skipping.
   * @type {boolean}
   */
  static strictProps

  /**
   * Read-only property containing camelCase counterparts of observed attributes.
   * @see https://webcomponent.io/prop-access/
   * @returns {Props}
   */
  get props() {
    return this.#props
  }

  /**
   * Triggered after view is initialized
   */
  afterViewInit() {}

  /**
   * Triggered when the component is connected to the DOM
   */
  onInit() {}

  /**
   * Triggered when the component is disconnected from the DOM
   */
  onDestroy() {}

  /**
   * Triggered when an attribute value changes
   * @typedef {object} Changes
   * @property {string} property camelCase prop key, matching `props` access
   * @property {string} attribute kebab-case attribute name that changed
   * @property {any} previousValue value before the change
   * @property {any} currentValue value after the change
   * @param {Changes} changes
   */
  onChanges(changes) {}

  constructor() {
    super()
    this.#initializeProps()
    this.#initializeHost()
  }

  static get observedAttributes() {
    const propKeys = this.props
      ? Object.keys(this.props).map((camelCase) => getKebabCase(camelCase))
      : []

    return propKeys
  }

  connectedCallback() {
    this.#reflectDefaults()
    this.onInit()
    // Attribute-driven render/onChanges are buffered until here, so onInit
    // always runs before the first render — even when the platform fires
    // attributeChangedCallback before connect for authored attributes.
    this.#connected = true
    this.render()
    this.afterViewInit()
  }

  disconnectedCallback() {
    this.onDestroy()
  }

  attributeChangedCallback(attribute, previousValue, currentValue) {
    if (previousValue === currentValue) return

    const property = getCamelCase(attribute)
    const type = this.#typeMap[property]
    let next
    if (currentValue === null) {
      // boolean props follow HTML: absence *is* false, never the declared
      // default. Other props reset to the declared default (or undefined).
      next = type === 'boolean' ? false : this.constructor.props?.[property]
    } else if (type === 'boolean' && /^(true|false)$/.test(currentValue)) {
      // a literal "true"/"false" written to a boolean attribute is almost
      // always the pre-v6 `setAttribute(name, String(bool))` idiom — which now
      // silently means true. Make the inversion loud instead of silent.
      console.warn(
        `${attribute}="${currentValue}" is true; use toggleAttribute("${attribute}", ${currentValue}).`
      )
      next = true
    } else if (type && type !== 'string') {
      // typed props deserialize; a malformed value falls back to the raw
      // string so render()/onChanges() are never skipped
      try {
        next = deserialize(currentValue, type)
      } catch {
        next = currentValue
      }
    } else {
      // strings (and untyped props) stay as-is; '' stays ''
      next = currentValue
    }

    // write through the proxy; item 25 makes this log-not-throw by default
    // (prop value is always applied so `props` stays current)
    this.props[property] = next

    // defer the render/onChanges side effects until after onInit
    if (!this.#connected) return
    this.render()
    this.onChanges({ property, attribute, previousValue, currentValue })
  }

  #handler(setter, meta) {
    const typeMap = meta.#typeMap

    return {
      set(obj, prop, value) {
        // Types come from `static props` defaults only; undeclared props are
        // untyped. A declared-type violation is logged and skipped rather
        // than thrown, so a stray write can't halt render()/onChanges().
        // Opt into `static strictProps = true` to restore throwing.
        const declared = typeMap[prop]

        if (declared && declared !== typeof value && value != null) {
          const msg = `${meta.constructor.name}: cannot assign ${typeof value} to ${declared} prop "${prop}"`
          if (meta.constructor.strictProps) throw TypeError(msg)
          console.error(msg)
        } else if (obj[prop] !== value) {
          obj[prop] = value
          setter(prop, value)
        }

        return true
      },
      get(obj, prop) {
        return obj[prop]
      },
    }
  }

  #initializeProps() {
    let initialProps = cloneDefaults(this.constructor)
    Object.keys(initialProps).forEach((camelCase) => {
      this.#typeMap[camelCase] = typeof initialProps[camelCase]
    })
    if (!this.#props) {
      this.#props = new Proxy(
        initialProps,
        this.#handler((key, value) => this.#reflect(key, value), this)
      )
    }
  }

  /**
   * Reflects one prop value onto its attribute. Boolean-typed props follow the
   * HTML convention — `true` is a bare attribute, `false` removes it — so host
   * code can use `toggleAttribute()` and `:host([flag])` CSS matches only when
   * the prop is actually true. Everything else reflects as a serialized value.
   * @param {string} camelCase the prop key
   * @param {any} value the value to reflect
   */
  #reflect(camelCase, value) {
    const kebab = getKebabCase(camelCase)
    // declared type wins, so a boolean prop set to null/undefined still
    // removes its attribute; undeclared props fall back to the value's type
    if ((this.#typeMap[camelCase] ?? typeof value) === 'boolean')
      this.toggleAttribute(kebab, !!value)
    else this.setAttribute(kebab, serialize(value))
  }

  /**
   * Reflects default prop values onto attributes on first connect.
   * Runs outside the constructor (spec forbids attribute mutation there)
   * and skips any attribute already set by markup/SSR/user so those win.
   */
  #reflectDefaults() {
    if (this.#reflected) return
    Object.keys(this.#props).forEach((camelCase) => {
      if (!this.hasAttribute(getKebabCase(camelCase)))
        this.#reflect(camelCase, this.#props[camelCase])
    })
    this.#reflected = true
  }
  #initializeHost() {
    this.#host = this
    if (this.constructor.shadowRootInit) {
      this.#host = this.attachShadow(this.constructor.shadowRootInit)
    }
  }

  render() {
    if (typeof this.template === 'string') {
      this.innerHTML = this.template
    } else if (typeof this.template === 'object') {
      const tree = this.template

      if (JSON.stringify(this.#prevDOM) !== JSON.stringify(tree)) {
        this.#applyStyles()

        if (this.#prevDOM === undefined) {
          /**
           * first render: create element
           * - resolve prop values
           * - attach event listeners
           */
          const el = createElement(tree)

          if (el) {
            if (Array.isArray(el)) this.#host.replaceChildren(...el)
            else this.#host.replaceChildren(el)
          }
        } else {
          // re-render: reconcile in place so focus, caret/selection, an
          // uncommitted <input> value, :hover and running transitions survive
          patchChildren(this.#host, this.#prevDOM, tree)
        }
        this.#prevDOM = tree
      }
    }
  }

  #applyStyles() {
    const styles = this.constructor.styles
    if (styles !== undefined)
      try {
        // one sheet or many, in declaration order — a design system can put a
        // shared tokens sheet first and component styles after it
        this.#host.adoptedStyleSheets = [
          ...this.#host.adoptedStyleSheets,
          ...[styles].flat().map((s) => {
            if (typeof s != 'string') return s
            const sheet = new CSSStyleSheet()
            sheet.replaceSync(s)
            return sheet
          }),
        ]
      } catch (e) {
        console.error(
          'ERR: Constructable stylesheets are only supported in shadow roots. Use `static shadowRootInit` https://webcomponent.io/shadow-dom/',
          e
        )
      }
  }
}
