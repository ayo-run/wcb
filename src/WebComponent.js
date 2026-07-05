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
    if (check && (type === 'function' || type === 'symbol'))
      console.warn(
        `${ctor.name}.${key}: ${type} default not reflectable; use handlers/refs.`
      )
    try {
      out[key] = structuredClone(value)
    } catch {
      out[key] = value
    }
  }
  return out
}

/**
 * A minimal base class to reduce the complexity of creating reactive custom elements
 * @see https://webcomponent.io
 */
export class WebComponent extends HTMLElement {
  #host
  #prevDOM
  #props
  #typeMap = {}
  #reflected = false

  /**
   * Blueprint for the Proxy props
   * @typedef {{[name: string]: any}} PropStringMap
   * @type {PropStringMap}
   */
  static props

  // TODO: support array of styles
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
   * Read-only property containing camelCase counterparts of observed attributes.
   * @see https://webcomponent.io/prop-access/
   * @type {PropStringMap}
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
   * @typedef {{
   *  property: string,
   *  previousValue: any,
   *  currentValue: any
   * }} Changes
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
    this.render()
    this.afterViewInit()
  }

  disconnectedCallback() {
    this.onDestroy()
  }

  attributeChangedCallback(property, previousValue, currentValue) {
    const camelCaps = getCamelCase(property)

    if (previousValue !== currentValue) {
      this[property] = currentValue === '' || currentValue
      this[camelCaps] = this[property]

      this.#handleUpdateProp(camelCaps, this[property])

      this.render()
      this.onChanges({ property, previousValue, currentValue })
    }
  }

  #handleUpdateProp(key, stringifiedValue) {
    const restored = deserialize(stringifiedValue, this.#typeMap[key])
    if (restored !== this.props[key]) this.props[key] = restored
  }

  #handler(setter, meta) {
    const typeMap = meta.#typeMap

    return {
      set(obj, prop, value) {
        const oldValue = obj[prop]

        if (!(prop in typeMap)) {
          typeMap[prop] = typeof value
        }

        if (typeMap[prop] !== typeof value) {
          throw TypeError(
            `Cannot assign ${typeof value} to ${
              typeMap[prop]
            } property (setting '${prop}' of ${meta.constructor.name})`
          )
        } else if (oldValue !== value) {
          obj[prop] = value
          const kebab = getKebabCase(prop)
          setter(kebab, serialize(value))
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
        this.#handler((key, value) => this.setAttribute(key, value), this)
      )
    }
  }

  /**
   * Reflects default prop values onto attributes on first connect.
   * Runs outside the constructor (spec forbids attribute mutation there)
   * and skips any attribute already set by markup/SSR/user so those win.
   */
  #reflectDefaults() {
    if (this.#reflected) return
    Object.keys(this.#props).forEach((camelCase) => {
      const kebab = getKebabCase(camelCase)
      if (!this.hasAttribute(kebab))
        this.setAttribute(kebab, serialize(this.#props[camelCase]))
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

      // TODO: smart diffing
      if (JSON.stringify(this.#prevDOM) !== JSON.stringify(tree)) {
        this.#applyStyles()

        /**
         * create element
         * - resolve prop values
         * - attach event listeners
         */
        const el = createElement(tree)

        if (el) {
          if (Array.isArray(el)) this.#host.replaceChildren(...el)
          else this.#host.replaceChildren(el)
        }
        this.#prevDOM = tree
      }
    }
  }

  #applyStyles() {
    if (this.constructor.styles !== undefined)
      try {
        const styleObj = new CSSStyleSheet()
        styleObj.replaceSync(this.constructor.styles)
        this.#host.adoptedStyleSheets = [
          ...this.#host.adoptedStyleSheets,
          styleObj,
        ]
      } catch (e) {
        console.error(
          'ERR: Constructable stylesheets are only supported in shadow roots. Use `static shadowRootInit` https://webcomponent.io/shadow-dom/',
          e
        )
      }
  }
}
