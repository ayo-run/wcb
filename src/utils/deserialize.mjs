/**
 *
 * @param value
 * @param type
 */
export function deserialize(value, type) {
  switch (type) {
    case 'boolean':
      // bare presence follows the HTML convention: `<el flag>` / `flag=""` is true.
      if (value === '') return true
    // falls through
    case 'number':
    case 'object':
    case 'undefined':
      return JSON.parse(value)
    default:
      return value
  }
}
