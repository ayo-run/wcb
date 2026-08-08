/**
 * @author Ayo Ayco <https://ayo.ayco.io>
 * @license MIT
 * https://opensource.org/licenses/MIT
 * @see https://webcomponent.io/cem-plugin/
 */

/**
 * A module entry in the manifest, whose `path` this plugin rewrites.
 * @typedef {{ path?: string }} ManifestModule
 */

/**
 * The `packageLinkPhase` params this plugin reads.
 * @typedef {object} PackageLinkPhaseParams
 * @property {{ modules?: ManifestModule[] }} customElementsManifest the completed manifest
 */

/**
 * `distPaths`: rewrites manifest module paths from scanned source to
 * the built output
 * Zero-config it maps the `src/` prefix to `dist/` and rewrites TypeScript
 * extensions to their emitted JS form (`.ts`→`.js`, `.mts`→`.mjs`,
 * `.cts`→`.cjs`); other extensions pass through untouched. Override `rootDir` /
 * `outDir` (named to mirror `tsconfig`) or extend `ext` for other layouts.
 *
 * Every internal reference that points back at a module (`exports[].declaration`,
 * `superclass`, `mixins[]`, …) is rewritten with the module paths, so the
 * `module` a consumer follows still resolves. References carrying a `package`
 * name another package's layout and are left alone.
 * @param {object} [options] Options to customize the paths
 * @param {string} [options.rootDir] source directory prefix to replace (default `'src'`)
 * @param {string} [options.outDir] built-output directory to point at (default `'dist'`)
 * @param {Record<string, string>} [options.ext] extension remap, merged over the defaults
 * @returns {{ name: string, packageLinkPhase: (params: PackageLinkPhaseParams) => void }} a CEM analyzer plugin
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
   * @param {unknown} node a manifest node, array, or leaf value
   * @returns {void}
   */
  const rewriteRefs = (node) => {
    if (Array.isArray(node)) return node.forEach(rewriteRefs)
    if (!node || typeof node !== 'object') return
    const record = /** @type {Record<string, unknown>} */ (node)
    if (typeof record.module === 'string' && !record.package)
      record.module = rewrite(record.module)
    for (const value of Object.values(record)) rewriteRefs(value)
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
