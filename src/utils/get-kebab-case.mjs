/**
 * Converts a camelCase prop key to the kebab-case attribute name it reflects
 * to — the inverse of `getCamelCase`.
 * @param {string} str the camelCase prop key
 * @returns {string} the kebab-case attribute name
 */
export function getKebabCase(str) {
  return str.replace(
    /[A-Z]+(?![a-z])|[A-Z]/g,
    ($, ofs) => (ofs ? '-' : '') + $.toLowerCase()
  )
}
