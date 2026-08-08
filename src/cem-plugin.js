/**
 * @license MIT <https://opensource.org/licenses/MIT>
 * @author Ayo Ayco <https://ayo.ayco.io>
 *
 * Custom Elements Manifest analyzer plugins for wcb. The default export is
 * `wcbPluginSet()`, the whole set ready to spread into the analyzer's `plugins`;
 * the individual plugins are also named exports for granular configs:
 * - `wcbStaticProps` — teaches the analyzer about wcb's `static props`.
 * - `distPaths` — rewrites manifest module paths to the built output.
 * - `wcbVsCodePlugin` — generates VS Code HTML/CSS custom-data files.
 * - `wcbJetBrainsPlugin` — generates a JetBrains web-types file.
 *
 * For easy scaffolding, run: `npm create wcb@latest`
 * @see https://webcomponent.io/cem-plugin/
 */

export { distPaths } from './cem-plugin/dist-paths.js'
export { wcbStaticProps } from './cem-plugin/wcb-static-props.js'
export { wcbVsCodePlugin } from './cem-plugin/wcb-vs-code-plugin.js'
export { wcbJetBrainsPlugin } from './cem-plugin/wcb-jet-brains-plugin.js'

import { distPaths } from './cem-plugin/dist-paths.js'
import { wcbStaticProps } from './cem-plugin/wcb-static-props.js'
import { wcbVsCodePlugin } from './cem-plugin/wcb-vs-code-plugin.js'
import { wcbJetBrainsPlugin } from './cem-plugin/wcb-jet-brains-plugin.js'

/**
 * The full wcb plugin set — `wcbStaticProps()`, `distPaths()`,
 * `wcbVsCodePlugin()` and `wcbJetBrainsPlugin()` — ready to spread into the
 * analyzer's `plugins`. Forward options to individual plugins by key;
 * `wcbStaticProps` takes none.
 * @param {object} [options]
 * @param {object} [options.distPaths] options for `distPaths()`
 * @param {object} [options.vsCode] options for `wcbVsCodePlugin()`
 * @param {object} [options.jetBrains] options for `wcbJetBrainsPlugin()`
 * @returns {object[]} the analyzer plugins, in order
 * @example
 * // custom-elements-manifest.config.mjs
 * import wcbPluginSet from 'web-component-base/cem-plugin'
 * export default {
 *   globs: ['src/**\/*.ts'],
 *   outdir: '.wcb',
 *   plugins: [...wcbPluginSet()],
 * }
 */
export function wcbPluginSet(options = {}) {
  return [
    wcbStaticProps(),
    distPaths(options.distPaths),
    wcbVsCodePlugin(options.vsCode),
    wcbJetBrainsPlugin(options.jetBrains),
  ]
}

export default wcbPluginSet
