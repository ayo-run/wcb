/**
 * @author Ayo Ayco <https://ayo.ayco.io>
 * @license MIT
 * https://opensource.org/licenses/MIT
 *
 * `wcbStaticProps`: teaches `@custom-elements-manifest/analyzer` to read wcb's
 * `static props` convention. Dev-time only — runs in Node during `cem analyze`.
 * @see https://webcomponent.io/cem-plugin/
 */

import { getKebabCase } from '../utils/index.js'

/**
 * @typedef {typeof import('typescript')} TypeScript
 * @import * as TypeScriptInstance from 'typescript'
 */

/** wcb statics that are implementation detail, not public API. */
const WCB_INTERNAL = new Set([
  'props',
  'shadowRootInit',
  'styles',
  'strictProps',
  'observedAttributes',
  'template',
])

/**
 * Classifies a `static props` default by the **syntactic form** of its initializer.
 * @param {TypeScript} ts the TypeScript module handed to the hook
 * @param {TypeScriptInstance.Expression} init the property initializer node
 * @returns {'boolean' | 'number' | 'object' | 'string'} the manifest `type.text` value
 */
function typeOfDefault(ts, init) {
  if (
    init.kind === ts.SyntaxKind.TrueKeyword ||
    init.kind === ts.SyntaxKind.FalseKeyword
  )
    return 'boolean'
  if (ts.isNumericLiteral(init)) return 'number'
  if (ts.isObjectLiteralExpression(init) || ts.isArrayLiteralExpression(init))
    return 'object'
  return 'string'
}

/**
 * Reads a node's modifiers across TypeScript versions.
 * @param {TypeScript} ts the TypeScript module handed to the hook
 * @param {TypeScriptInstance.Node & {modifiers?: readonly TypeScriptInstance.ModifierLike[]} } node the node to read modifiers from
 * @returns {TypeScriptInstance.ModifierLike[]} the modifiers, or an empty array
 */
function modifiersOf(ts, node) {
  // Older versions of TypeScript (i.e., before 4.8) does not have
  // `canHaveModifiers` and `getModifiers`
  return (
    (ts.canHaveModifiers?.(node) ? ts.getModifiers(node) : node.modifiers) ?? []
  )
}

/**
 * Unwraps `x as const` / `x satisfies T` down to the underlying expression.
 * @param {TypeScript} ts the TypeScript module handed to the hook
 * @param {TypeScriptInstance.Expression} node the expression node
 * @returns {TypeScriptInstance.Expression} the unwrapped expression
 */
function unwrap(ts, node) {
  let current = node

  while (
    current &&
    (ts.isAsExpression?.(current) ||
      ts.isSatisfiesExpression?.(current) ||
      ts.isParenthesizedExpression(current))
  )
    current = current.expression
  return current
}

/**
 * Resolves an identifier to the object literal of a module-level `const` in
 * the same file, so a component that keeps its defaults in a shared `const`
 * still yields attributes instead of silently emitting none:
 *
 * ```js
 * const props = { variant: 'primary' }
 * class Foo extends WebComponent { static props = props }
 * ```
 * @param {TypeScript} ts the TypeScript module handed to the hook
 * @param {TypeScriptInstance.Node} node any node in the source file
 * @param {string} name the identifier to resolve
 * @returns {TypeScriptInstance.ObjectLiteralExpression | undefined} the object literal, or undefined
 */
function resolveObjectLiteral(ts, node, name) {
  for (const statement of node.getSourceFile()?.statements ?? []) {
    if (!ts.isVariableStatement(statement)) continue
    for (const declaration of statement.declarationList.declarations) {
      if (declaration.name?.getText() !== name || !declaration.initializer)
        continue
      const initializer = unwrap(ts, declaration.initializer)
      if (ts.isObjectLiteralExpression(initializer)) return initializer
    }
  }
  return undefined
}

/**
 * Finds the object literal behind a class's `static props`, whether it is
 * written inline or hoisted into a module-level const.
 * @param {TypeScript} ts the TypeScript module handed to the hook
 * @param {TypeScriptInstance.ClassDeclaration} node the class declaration node
 * @returns {TypeScriptInstance.ObjectLiteralExpression | undefined} the object literal, or undefined
 */
function findStaticProps(ts, node) {
  /**
   * @type {TypeScriptInstance.PropertyDeclaration & { initializer: TypeScriptInstance.Expression } | undefined }
   */
  const declaration = node.members.find(
    (member) =>
      ts.isPropertyDeclaration(member) &&
      modifiersOf(ts, member).some(
        (mod) => mod.kind === ts.SyntaxKind.StaticKeyword
      ) &&
      member.name?.getText() === 'props' &&
      member.initializer
  )
  if (!declaration) return undefined

  const initializer = unwrap(ts, declaration.initializer)
  if (ts.isObjectLiteralExpression(initializer)) return initializer
  if (ts.isIdentifier(initializer))
    return resolveObjectLiteral(ts, node, initializer.getText())
  return undefined
}

/**
 * True when the class extends something named `WebComponent`. Used so wcb
 * components that declare no props still get their internals stripped.
 * @param {TypeScript} ts the TypeScript module handed to the hook
 * @param {TypeScriptInstance.ClassDeclaration} node the class declaration node
 * @returns {boolean} whether the class extends `WebComponent`
 */
function extendsWebComponent(ts, node) {
  return (node.heritageClauses ?? []).some(
    (clause) =>
      clause.token === ts.SyntaxKind.ExtendsKeyword &&
      clause.types.some((t) => t.expression.getText().endsWith('WebComponent'))
  )
}

/**
 * A CEM class member etnry
 * @typedef {object} MemberDoc
 * @property {string} name the member name
 * @property {string} [kind] the member kind
 * @property {string} [privacy] the member's visibility
 * @property {{ text: string }} [type] the member's type
 * @property {string} [default] the default value's source text
 * @property {string} [attribute] the attribute this field reflects to
 * @property {string} [description] the member's description
 */

/**
 * A CEM attribute entry
 * @typedef {object} AttributeDoc
 * @property {string} name the kebab-cased attribute name
 * @property {string} fieldName the camelCase prop it reflects
 * @property {{ text: string }} type the attribute's type
 * @property {string} [default] the default value's source text
 */

/**
 * A CEM class declaration, narrowed to the fields this plugin mutates.
 * @typedef {object} ClassDoc
 * @property {string} kind the CEM declaration kind
 * @property {string} name the class name, matched against the source class
 * @property {MemberDoc[]} [members] the documented fields and methods
 * @property {AttributeDoc[]} [attributes] the documented attributes
 */

/**
 * The `analyzePhase` params
 * @typedef {object} AnalyzePhaseParams
 * @property {TypeScript} ts the TypeScript module handed to the hook
 * @property {TypeScriptInstance.Node} node the current AST node
 * @property {{ declarations?: ClassDoc[]}} moduleDoc the module's manifest so far
 */

/**
 * Teaches the CEM analyzer to read wcb's `static props`: every key becomes a
 * public field plus a reflected attribute, named with wcb's own
 * `getKebabCase` so manifest attribute names match `observedAttributes`
 * exactly. wcb internals are stripped from the public surface.
 * @example
 * // custom-elements-manifest.config.mjs
 * import { wcbStaticProps } from 'web-component-base/cem-plugin'
 * export default { globs: ['src/**\/*.js'], plugins: [wcbStaticProps()] }
 * @returns {{name: string, analyzePhase: (ctx: AnalyzePhaseParams) => void}} a CEM analyzer plugin
 */
export function wcbStaticProps() {
  return {
    name: 'wcb-static-props',
    analyzePhase({ ts, node, moduleDoc }) {
      if (!ts.isClassDeclaration(node) || !node.name) return

      const className = node.name.getText()
      const classDoc = (moduleDoc.declarations ?? []).find(
        (declaration) =>
          declaration.kind === 'class' && declaration.name === className
      )
      if (!classDoc) return

      const props = findStaticProps(ts, node)
      if (!props && !extendsWebComponent(ts, node)) return

      classDoc.members = (classDoc.members ?? []).filter(
        (member) => !WCB_INTERNAL.has(member.name)
      )
      classDoc.attributes = classDoc.attributes ?? []
      if (!props) return

      for (const prop of props.properties) {
        // shorthand (`{ variant }`) and spreads carry no inspectable default
        if (!ts.isPropertyAssignment(prop)) continue

        const fieldName = prop.name.getText().replace(/['"]/g, '')
        const attribute = getKebabCase(fieldName)
        const type = { text: typeOfDefault(ts, prop.initializer) }
        const defaultValue = prop.initializer.getText()

        classDoc.members.push({
          kind: 'field',
          name: fieldName,
          privacy: 'public',
          type,
          default: defaultValue,
          attribute,
          description: `Reactive prop, reflected to the \`${attribute}\` attribute.`,
        })

        classDoc.attributes.push({
          name: attribute,
          fieldName,
          type,
          default: defaultValue,
        })
      }
    },
  }
}
