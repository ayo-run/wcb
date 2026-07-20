/**
 *
 * @param value
 * @param type
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
