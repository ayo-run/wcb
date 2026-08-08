/**
 * Converts a kebab-case attribute name to the camelCase prop key it maps to.
 * @param {string} kebab the kebab-case attribute name
 * @returns {string} the camelCase prop key
 */
export function getCamelCase(kebab) {
  return kebab.replace(/-./g, (x) => x[1].toUpperCase())
}
