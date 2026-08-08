/**
 * @license MIT <https://opensource.org/licenses/MIT>
 * @author Ayo Ayco <https://ayo.ayco.io>
 *
 * Helpers shared by the manifest-consuming generators (`wcbVsCodePlugin`,
 * `wcbJetBrainsPlugin`). Dev-time only — run in Node during `cem analyze`.
 * @see https://webcomponent.io/cem-plugin/
 */

import fs from 'node:fs'
import path from 'node:path'

/**
 * The custom-element declarations across every module, minus excluded names.
 * @param {any} manifest the full custom elements manifest
 * @param {string[]} exclude declaration names to skip
 * @returns {any[]} the custom-element declarations
 */
export function customElementDecls(manifest, exclude) {
  const decls = []
  for (const mod of manifest.modules ?? [])
    for (const dec of mod.declarations ?? [])
      if ((dec.customElement || dec.tagName) && !exclude.includes(dec.name))
        decls.push(dec)
  return decls
}

/**
 * A declaration's human description, with escaped newlines restored. Empty
 * string when the declaration carries neither a summary nor a description.
 * @param {any} dec a custom-element declaration
 * @returns {string} the description text, or `''`
 */
export function descriptionOf(dec) {
  return (dec.summary || dec.description || '').replaceAll('\\n', '\n')
}

/**
 * Serializes `data` as pretty JSON into `dir/file`, creating `dir` if needed.
 * @param {string} dir output directory
 * @param {string} file file name
 * @param {object} data the value to serialize
 */
export function writeJson(dir, file, data) {
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, file), JSON.stringify(data, null, 2) + '\n')
}
