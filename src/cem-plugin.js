/**
 * @license MIT <https://opensource.org/licenses/MIT>
 * @author Ayo Ayco <https://ayo.ayco.io>
 *
 * A Custom Elements Manifest analyzer plugin that teaches
 * `@custom-elements-manifest/analyzer` about wcb's `static props` convention.
 *
 * For easy scaffolding, run: `npm create wcb@latest`
 *
 * This module is **dev-time only** — it runs in Node during `cem analyze` and
 * never reaches the browser. It is not imported by `WebComponent`, so the core
 * stays zero-dependency and within its size budget.
 * @see https://webcomponent.io/cem-plugin/
 */

import { getKebabCase } from './utils/index.js'

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
 * Maps a `static props` default literal to a CEM type string.
 * @param {any} ts the TypeScript module handed to the hook
 * @param {any} init the property initializer node
 * @returns {string} `boolean` | `number` | `object` | `string`
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
 * @param {any} ts the TypeScript module handed to the hook
 * @param {any} node the node to read modifiers from
 * @returns {any[]} the modifiers, or an empty array
 */
function modifiersOf(ts, node) {
  return (
    (ts.canHaveModifiers?.(node) ? ts.getModifiers(node) : node.modifiers) ?? []
  )
}

/**
 * Unwraps `x as const` / `x satisfies T` down to the underlying expression.
 * @param {any} ts the TypeScript module handed to the hook
 * @param {any} node the expression node
 * @returns {any} the unwrapped expression
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
 * @param {any} ts the TypeScript module handed to the hook
 * @param {any} node any node in the source file
 * @param {string} name the identifier to resolve
 * @returns {any} the object literal, or undefined
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
 * @param {any} ts the TypeScript module handed to the hook
 * @param {any} node the class declaration node
 * @returns {any} the object literal, or undefined
 */
function findStaticProps(ts, node) {
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
 * @param {any} ts the TypeScript module handed to the hook
 * @param {any} node the class declaration node
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
 * Teaches the CEM analyzer to read wcb's `static props`: every key becomes a
 * public field plus a reflected attribute, named with wcb's own
 * `getKebabCase` so manifest attribute names match `observedAttributes`
 * exactly. wcb internals are stripped from the public surface.
 * @example
 * // custom-elements-manifest.config.mjs
 * import { wcbStaticProps } from 'web-component-base/cem-plugin'
 * export default { globs: ['src/**\/*.js'], plugins: [wcbStaticProps()] }
 * @returns {{name: string, analyzePhase: (ctx: any) => void}} a CEM analyzer plugin
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

/**
 * A companion analyzer plugin that rewrites each module's `path` from the
 * scanned source to its built, published counterpart — so a shipped
 * `custom-elements.json` points at the files consumers actually import
 * (`dist/*.js`) rather than the source the analyzer read (`src/*.ts`), which a
 * package typically does not publish.
 *
 * Zero-config it maps the `src/` prefix to `dist/` and rewrites TypeScript
 * extensions to their emitted JS form (`.ts`→`.js`, `.mts`→`.mjs`,
 * `.cts`→`.cjs`); other extensions pass through untouched. Override `rootDir` /
 * `outDir` (named to mirror `tsconfig`) or extend `ext` for other layouts.
 *
 * Every internal reference that points back at a module (`exports[].declaration`,
 * `superclass`, `mixins[]`, …) is rewritten with the module paths, so the
 * `module` a consumer follows still resolves. References carrying a `package`
 * name another package's layout and are left alone.
 * @param {object} [options]
 * @param {string} [options.rootDir] source directory prefix to replace (default `'src'`)
 * @param {string} [options.outDir] built-output directory to point at (default `'dist'`)
 * @param {Record<string, string>} [options.ext] extension remap, merged over the defaults
 * @returns {{name: string, packageLinkPhase: (ctx: any) => void}} a CEM analyzer plugin
 * @example
 * // custom-elements-manifest.config.mjs
 * import { wcbStaticProps, distPaths } from 'web-component-base/cem-plugin'
 * export default {
 *   globs: ['src/**\/*.ts'],
 *   plugins: [wcbStaticProps(), distPaths()],
 * }
 */
export function distPaths(options = {}) {
  const withSlash = (dir) => dir.replace(/\/*$/, '/')
  const from = withSlash(options.rootDir ?? 'src')
  const to = withSlash(options.outDir ?? 'dist')
  const ext = { '.ts': '.js', '.mts': '.mjs', '.cts': '.cjs', ...options.ext }

  /**
   * Maps one scanned source path to the built file that ships in its place.
   * @param {string} path the path the analyzer stamped
   * @returns {string} the built-output path
   */
  const rewrite = (path) => {
    const swapped = path.startsWith(from) ? to + path.slice(from.length) : path
    for (const [srcExt, outExt] of Object.entries(ext))
      if (swapped.endsWith(srcExt))
        return swapped.slice(0, -srcExt.length) + outExt
    return swapped
  }

  /**
   * Walks a manifest node and rewrites `module` on every reference to a module
   * in this package, so references keep resolving after the paths move.
   * @param {any} node a manifest node, array, or leaf value
   * @returns {void}
   */
  const rewriteRefs = (node) => {
    if (Array.isArray(node)) return node.forEach(rewriteRefs)
    if (!node || typeof node !== 'object') return
    if (typeof node.module === 'string' && !node.package)
      node.module = rewrite(node.module)
    for (const value of Object.values(node)) rewriteRefs(value)
  }

  return {
    name: 'wcb-dist-paths',
    packageLinkPhase({ customElementsManifest }) {
      for (const mod of customElementsManifest.modules ?? []) {
        if (mod.path) mod.path = rewrite(mod.path)
        rewriteRefs(mod)
      }
    },
  }
}

export default wcbStaticProps
