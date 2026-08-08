import { createElement, applyProp } from './create-element.mjs'

/**
 * @import { VNode, VNodeChild } from '../html.js'
 */

/**
 * Flattens a vnode or a (possibly nested) children array into the flat list of
 * nodes `createElement` would have produced — it nests arrays into document
 * fragments, which append flat. `null`/`undefined` entries are dropped so a
 * conditional branch removes its node instead of rendering "null".
 * @param {VNodeChild} children a vnode, a children array, or nothing
 * @returns {Array<VNode | string | number | boolean>} the flat list, with nested arrays inlined and `null`/`undefined` dropped
 */
function flatten(children) {
  return children == null
    ? []
    : [children].flat(Infinity).filter((c) => c != null)
}

/**
 * Undoes a prop that is present in the old vnode but gone from the new one,
 * mirroring how `applyProp` set it.
 * @param {Element} el the element to patch
 * @param {string} prop the prop name as written in the vnode
 * @param {unknown} oldValue the value the prop had in the old vnode
 */
function removeProp(el, prop, oldValue) {
  const domProp = prop.toLowerCase()

  if (domProp === 'style' && typeof oldValue === 'object' && !!oldValue) {
    Object.keys(oldValue).forEach((rule) => {
      if (rule in el.style) el.style[rule] = ''
    })
    return
  }

  const key = prop in el ? prop : domProp in el ? domProp : null
  if (key === null) {
    el.removeAttribute(prop)
  } else {
    // reset to the DOM's own empty value for that property's type: `false` for
    // booleans (disabled), `''` for strings (id, className), `null` otherwise
    // (event handlers, object-valued props)
    const current = el[key]
    el[key] =
      typeof current === 'boolean'
        ? false
        : typeof current === 'string'
          ? ''
          : null
  }
}

/**
 * Patches a `style` object rule by rule. `applyProp` only ever *sets* truthy
 * rules, so on a reused element a rule that was dropped from the object — or
 * that went falsy, the usual `{ fontStyle: condition && 'italic' }` shape —
 * has to be cleared explicitly. A full rebuild used to do this implicitly.
 * @param {Element} el the element to patch
 * @param {unknown} oldValue the previous `style` prop value
 * @param {unknown} newValue the new `style` prop value
 */
function patchStyle(el, oldValue, newValue) {
  const previous = typeof oldValue === 'object' && !!oldValue ? oldValue : {}
  const next = typeof newValue === 'object' && !!newValue ? newValue : {}

  Object.keys(previous).forEach((rule) => {
    if (!next[rule] && rule in el.style) el.style[rule] = ''
  })
  applyProp(el, 'style', next)
}

/**
 * Patches an element's props in place: applies additions and changes, then
 * removes props that are gone. Function props (event handlers) are always
 * re-applied because `render()`'s `JSON.stringify` diff can't see them.
 * @param {Element} el the element to patch
 * @param {object | null | undefined} oldProps props from the previous vnode
 * @param {object | null | undefined} newProps props from the new vnode
 */
function patchProps(el, oldProps, newProps) {
  const previous = oldProps ?? {}
  const next = newProps ?? {}

  Object.entries(next).forEach(([prop, value]) => {
    const isStyleObject =
      prop.toLowerCase() === 'style' &&
      (typeof value === 'object' || typeof previous[prop] === 'object')

    if (isStyleObject) patchStyle(el, previous[prop], value)
    else if (typeof value === 'function' || !Object.is(previous[prop], value))
      applyProp(el, prop, value)
  })

  Object.keys(previous).forEach((prop) => {
    if (!(prop in next)) removeProp(el, prop, previous[prop])
  })
}

/**
 * Puts `node` where `dom` is, or appends it when there is no node to replace.
 * @param {Node} parent the parent node being patched
 * @param {Node | null | undefined} dom the node being replaced, if any
 * @param {Node | null | undefined} node the replacement
 */
function place(parent, dom, node) {
  if (!(node instanceof Node)) return
  if (dom) parent.replaceChild(node, dom)
  else parent.appendChild(node)
}

/**
 * Reconciles one DOM node against a new vnode, reusing it whenever it is the
 * same kind of node so focus, selection, uncommitted input values, `:hover`
 * and running transitions survive the re-render.
 * @param {Node} parent the parent node being patched
 * @param {Node | null | undefined} dom the existing node at this index, if any
 * @param {VNodeChild} oldVnode the vnode that produced `dom`, if known
 * @param {VNodeChild} newVnode the vnode to render
 */
export function patchNode(parent, dom, oldVnode, newVnode) {
  if (newVnode == null) {
    if (dom) parent.removeChild(dom)
    return
  }

  // primitive: keep the text node and retarget its data
  if (typeof newVnode !== 'object') {
    const data = String(newVnode)
    if (dom && dom.nodeType === 3) {
      if (dom.data !== data) dom.data = data
    } else {
      place(parent, dom, document.createTextNode(data))
    }
    return
  }

  const sameTag =
    dom &&
    dom.nodeType === 1 &&
    dom.tagName.toLowerCase() === String(newVnode.type).toLowerCase()

  if (!sameTag) {
    place(parent, dom, createElement(newVnode))
    return
  }

  const previous =
    typeof oldVnode === 'object' && oldVnode !== null ? oldVnode : {}
  patchProps(dom, previous.props, newVnode.props)

  // A nested custom element that renders its own light DOM owns that subtree:
  // the parent's vnode never describes what the child rendered for itself, so
  // reconciling those children here would trim them away and leave the child
  // blank until it happens to re-render on its own. Patch the element's props
  // (that is how data flows down) but leave its children to the child.
  // A shadow-DOM component is exempt — its own content lives in the shadow
  // root, invisible here, so any *light* children are genuine parent-authored
  // slot content that the parent must keep reconciling.
  if (dom.tagName.includes('-') && !dom.shadowRoot) return

  patchChildren(dom, previous.children, newVnode.children)
}

/**
 * Reconciles a parent's child nodes against a new children list by index
 * (non-keyed), trimming any leftover trailing nodes.
 * @param {Node} parent the parent node to patch into
 * @param {VNodeChild} oldChildren the previous vnode children (or previous tree)
 * @param {VNodeChild} newChildren the new vnode children (or new tree)
 */
export function patchChildren(parent, oldChildren, newChildren) {
  const previous = flatten(oldChildren)
  const next = flatten(newChildren)
  const nodes = [...parent.childNodes]

  next.forEach((vnode, i) => patchNode(parent, nodes[i], previous[i], vnode))
  for (let i = next.length; i < nodes.length; i++) parent.removeChild(nodes[i])
}
