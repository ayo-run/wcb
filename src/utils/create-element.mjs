import { serialize } from './serialize.mjs'
/**
 *
 * @param tree
 */
export function createElement(tree) {
  if (!tree.type) {
    if (Array.isArray(tree)) {
      const frag = document.createDocumentFragment()
      frag.replaceChildren(...tree.map((leaf) => createElement(leaf)))
      return frag
    }
    return document.createTextNode(tree)
  } else {
    const el = document.createElement(tree.type)
    /**
     * handle props
     */
    if (tree.props) {
      Object.entries(tree.props).forEach(([prop, value]) =>
        applyProp(el, prop, value)
      )
    }
    /**
     * handle children
     */
    tree.children?.forEach((child) => el.appendChild(createElement(child)))
    return el
  }
}

/**
 * Applies one vnode prop to an element: a `style` object is applied rule by
 * rule, a name the element owns as a DOM property is assigned (so event
 * handlers and non-string values keep their type), anything else becomes a
 * serialized attribute. Shared with the reconciler so a patched element gets
 * props by exactly the same rule as a freshly created one.
 * @param {Element} el the element to apply the prop to
 * @param {string} prop the prop name as written in the vnode
 * @param {any} value the prop value
 */
export function applyProp(el, prop, value) {
  const domProp = prop.toLowerCase()
  if (domProp === 'style' && typeof value === 'object' && !!value) {
    applyStyles(el, value)
  } else if (prop in el) {
    el[prop] = value
  } else if (domProp in el) {
    el[domProp] = value
  } else if (typeof value === 'boolean') {
    // no DOM property to take the value: fall back to the HTML boolean
    // convention rather than stamping the string "false", which any
    // boolean-attribute reader (including a nested WebComponent) reads as true
    el.toggleAttribute(prop, value)
  } else {
    el.setAttribute(prop, serialize(value))
  }
}

/**
 *
 * @param el
 * @param styleObj
 */
function applyStyles(el, styleObj) {
  Object.entries(styleObj).forEach(([rule, value]) => {
    if (rule in el.style && value) el.style[rule] = value
  })
}
