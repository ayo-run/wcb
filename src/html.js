import htm from 'htm/mini'

/**
 *
 * @param type
 * @param props
 * @param {...any} children
 */
function h(type, props, ...children) {
  return { type, props, children }
}

/**
 * For htm license information please see ./vendors/htm/LICENSE.txt
 * @license Apache <https://www.apache.org/licenses/LICENSE-2.0>
 * @author Jason Miller <jason@developit.ca>
 */
export const html = htm.bind(h)
