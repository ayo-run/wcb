/**
 * @author Ayo Ayco <https://ayo.ayco.io>
 * @license MIT
 * https://opensource.org/licenses/MIT
 *
 * Helpers shared by the manifest-consuming generators (`wcbVsCodePlugin`,
 * `wcbJetBrainsPlugin`). Dev-time only — run in Node during `cem analyze`.
 * @see https://webcomponent.io/cem-plugin/
 */

import fs from 'node:fs'
import path from 'node:path'

/**
 * A manifest attribute entry, narrowed to the fields these plugins read.
 * @typedef {object} ManifestAttribute
 * @property {string} [name] the kebab-cased attribute name
 * @property {string} [fieldName] the camelCase prop it reflects, used when `name` is absent
 * @property {{ text?: string }} [type] the attribute's type, as CEM records it
 * @property {string} [description] the attribute's description
 * @property {string} [default] the default value's source text
 */

/**
 * A manifest class member, narrowed to the fields these plugins read.
 * @typedef {object} ManifestMember
 * @property {string} name the member name
 * @property {string} [kind] the member kind — only `'field'` becomes a property
 * @property {string} [privacy] the member's visibility; private and protected are skipped
 * @property {{ text?: string }} [type] the member's type
 * @property {string} [description] the member's description
 * @property {boolean} [readonly] whether the member is read-only
 */

/**
 * A named manifest entry carrying an optional description — events, CSS custom
 * properties and CSS parts all share this shape.
 * @typedef {object} ManifestNamed
 * @property {string} name the entry name
 * @property {string} [description] the entry's description
 * @property {{ text?: string }} [type] the entry's type, where one applies
 */

/**
 * A custom-element declaration in a manifest, narrowed to what these plugins read.
 * @typedef {object} CustomElementDecl
 * @property {string} name the class name
 * @property {boolean} [customElement] set when the analyzer recognised it as a custom element
 * @property {string} [tagName] the registered tag name, when self-registering
 * @property {string} [summary] a short description, preferred over `description`
 * @property {string} [description] the full description
 * @property {ManifestAttribute[]} [attributes] the element's attributes
 * @property {ManifestMember[]} [members] the class's fields and methods
 * @property {ManifestNamed[]} [events] the events the element fires
 * @property {ManifestNamed[]} [cssProperties] the CSS custom properties it reads
 * @property {ManifestNamed[]} [cssParts] the shadow parts it exposes
 */

/**
 * A custom elements manifest, narrowed to what these plugins walk.
 * @typedef {{ modules?: { declarations?: CustomElementDecl[] }[] }} Manifest
 */

/**
 * The custom-element declarations across every module, minus excluded names.
 * @param {Manifest} manifest the full custom elements manifest
 * @param {string[]} exclude declaration names to skip
 * @returns {CustomElementDecl[]} the custom-element declarations
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
 * @param {CustomElementDecl} dec a custom-element declaration
 * @returns {string} the description text, or `''`
 */
export function descriptionOf(dec) {
  return (dec.summary || dec.description || '').replaceAll('\\n', '\n')
}

/**
 * Serializes `data` as pretty JSON into `dir/file`, creating `dir` if needed.
 * @param {string} dir output directory
 * @param {string} file file name
 * @param {unknown} data the value to serialize
 * @returns {void} nothing
 */
export function writeJson(dir, file, data) {
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, file), JSON.stringify(data, null, 2) + '\n')
}
