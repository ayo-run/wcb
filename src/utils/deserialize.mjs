/**
 * Decodes a present attribute value back into a prop value, using the prop's
 * declared type — the inverse of `serialize`.
 * @param {string} value the attribute value, never `null`
 * @param {'string' | 'number' | 'bigint' | 'boolean' | 'symbol' | 'undefined' | 'object' | 'function'} type the declared prop type, as recorded by `typeof`
 * @returns {unknown} the value to store on `props`
 */
export function deserialize(value, type) {
  switch (type) {
    // strict HTML boolean-attribute semantics: *any* present value is true,
    // including the literal string "false" (`<el flag>`, `flag=""`,
    // `flag="false"` are all true). Absence means false and is handled by the
    // caller, which never reaches here with a null value.
    case 'boolean':
      return true
    case 'number':
    case 'object':
    case 'undefined':
      return JSON.parse(value)
    default:
      return value
  }
}
