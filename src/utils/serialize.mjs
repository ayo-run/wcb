/**
 * Encodes a prop value for its attribute: number, boolean and object are
 * JSON-encoded, anything else is passed through unchanged.
 * @param {unknown} value the prop value to encode
 * @returns {unknown} the attribute value, or `value` unchanged
 */
export function serialize(value) {
  switch (typeof value) {
    case 'number':
    case 'boolean':
    case 'object':
      return JSON.stringify(value)
    default:
      return value
  }
}
