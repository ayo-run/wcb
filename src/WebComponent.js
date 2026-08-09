/**
 * @author Ayo Ayco <https://ayo.ayco.io>
 * @license MIT
 * https://opensource.org/licenses/MIT
 */

import { createElement, patchChildren } from './utils/index.js'

/**
 * The template to render
 * @typedef {string | import('./html.js').VNode | import('./html.js').VNode[] | undefined} TemplateNode
 */

/**
 * A minimal base class to reduce the complexity of creating reactive custom elements
 * ```ts
 * class CozyButton extends WebComponent{
 *    static shadowRootInit = { mode: 'open' }
 *    static styles = 'h1 { color: blue }'
 *    get template() {
 *      return '<h1>Hello World!</h1>'
 *    }
 * }
 * ```
 * @see https://webcomponent.io
 */
export class WebComponent extends HTMLElement {
  #host
  #prevDOM

  /**
   * CSS adopted into the shadow root as constructable stylesheet(s). An array
   * is adopted in order, so shared/base sheets can be composed with
   * per-component ones. Requires `static shadowRootInit`.
   * @type {string | CSSStyleSheet | Array<string | CSSStyleSheet>}
   */
  static styles

  /**
   * Read-only string property that represents how the component will be rendered:
   * - a string of HTML
   * - a vnode tree from `html`
   * - an array of vnodes; or
   * - undefined for `` html`` `` to render nothing
   * @returns {TemplateNode} the template to render
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

  constructor() {
    super()
    this.#initializeHost()
  }

  connectedCallback() {
    this.onInit()
    this.render()
    this.afterViewInit()
  }

  disconnectedCallback() {
    this.onDestroy()
  }

  #initializeHost() {
    this.#host = this
    if (this.constructor.shadowRootInit) {
      this.#host = this.attachShadow(this.constructor.shadowRootInit)
    }
    // adoption appends, so it happens once per instance here rather than per
    // render — otherwise every re-render (and every switch between template
    // kinds) would stack another copy of each sheet
    this.#applyStyles()
  }

  render() {
    const template = this.template

    if (template && typeof template === 'object') {
      if (JSON.stringify(this.#prevDOM) !== JSON.stringify(template)) {
        if (!this.#prevDOM) {
          /**
           * first render: create element
           * - resolve prop values
           * - attach event listeners
           */
          // a multi-root template comes back as a DocumentFragment, which
          // replaceChildren splices in — so one call covers both shapes
          this.#host.replaceChildren(createElement(template))
        } else {
          // re-render: reconcile in place so focus, caret/selection, an
          // uncommitted <input> value, :hover and running transitions survive
          patchChildren(this.#host, this.#prevDOM, template)
        }
        this.#prevDOM = template
      }
    } else {
      // string templates render into #host like vnode ones do, so they
      // respect the shadow root instead of writing over consumer-slotted
      // light-DOM children. `html``` — the natural way to render nothing —
      // yields undefined rather than a vnode, so it lands here too: both it
      // and '' empty the rendered subtree. Dropping the vnode bookkeeping
      // makes the next vnode render start fresh instead of patching against
      // a tree that is no longer on screen.
      this.#prevDOM = undefined
      this.#host.innerHTML = template ?? ''
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
