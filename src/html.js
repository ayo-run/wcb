import htm from 'htm/mini'

/**
 * A vnode: plain object `html` produces, consumed by `createElement` or `patchNode`
 * @typedef {object} VNode
 * @property {string} type the tagname to create
 * @property {Record<string, unknown> | null} props parsed attributes, `null` if none
 * @property {VNodeChild[]} children the node's children
 */

/**
 *
 * Anything that can be a vnode child:
 * - another vnode
 * - a primitive text
 * - a nested array; or
 * - null or undefined from a falsy branch
 * @typedef {VNode | string | number | boolean | null | undefined | VNodeChild[]} VNodeChild
 */

/**
 * Hyperscript function we bind `htm` to. Builds a single vnode.
 * @param {string} type the tag name
 * @param {Record<string, unknown> | null} props parsed attributes, `null` if none
 * @param {...VNodeChild} children the node's children
 * @returns {VNode} the vnode
 */
function h(type, props, ...children) {
  return { type, props, children }
}

/**
 * @author Jason Miller <jason@developit.ca>
 * @license Apache-2.0
 * https://www.apache.org/licenses/LICENSE-2.0
 * For htm license information please see ./vendors/htm/LICENSE.txt
 */
export const html = htm.bind(h)
