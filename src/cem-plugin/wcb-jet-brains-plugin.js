/**
 * @license MIT <https://opensource.org/licenses/MIT>
 * @author Ayo Ayco <https://ayo.ayco.io>
 *
 * `wcbJetBrainsPlugin`: generates a JetBrains `web-types.json` from the manifest.
 * Dev-time only — runs in Node during `cem analyze`.
 * @see https://webcomponent.io/cem-plugin/
 */

import fs from 'node:fs'
import path from 'node:path'
import { getKebabCase } from '../utils/index.js'
import { customElementDecls, descriptionOf, writeJson } from './shared.js'

/** Manifest type texts that map to a web-types HTML attribute value type. */
const HTML_VALUE_TYPES = new Set(['string', 'boolean', 'number'])

/**
 * Reads `name` / `version` from the package.json in the analyzer's working
 * directory, so the generated file mirrors the package it describes. Both are
 * required by the web-types schema; missing values fall back to placeholders.
 * @returns {{name: string, version: string}} the package identity
 */
function packageIdentity() {
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.resolve('package.json'), 'utf8')
    )
    return { name: pkg.name, version: pkg.version }
  } catch {
    return {}
  }
}

/**
 * Points the `web-types` field of the package.json in the analyzer's working
 * directory at the generated file, so JetBrains discovers it — mirroring how
 * the analyzer itself maintains `customElements`. Idempotent: it only writes
 * when the field is missing or stale, and stays silent if there is no readable
 * package.json.
 * @param {string} value the path to store in the `web-types` field
 */
function setWebTypesField(value) {
  try {
    const packageJsonPath = path.resolve('package.json')
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
    if (pkg['web-types'] === value) return
    pkg['web-types'] = value
    fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n')
  } catch {
    // no package.json (or unreadable) — nothing to point at it
  }
}

/**
 * Maps a manifest `type.text` to a web-types HTML value type, collapsing
 * anything that is not a bare `string` / `boolean` / `number` to `string`.
 * @param {string | undefined} text the manifest type text
 * @returns {string} `'string'` | `'boolean'` | `'number'`
 */
function htmlValueType(text) {
  return HTML_VALUE_TYPES.has(text) ? text : 'string'
}

/**
 * Strips a single pair of surrounding quotes from a manifest default literal
 * (`"'primary'"` → `'primary'`), so string defaults read cleanly in the IDE.
 * @param {string | undefined} text the manifest default literal
 * @returns {string | undefined} the unquoted default, or the input unchanged
 */
function unquote(text) {
  return text?.replace(/^['"]|['"]$/g, '')
}

/**
 * Builds a web-types HTML attribute contribution from a manifest attribute.
 * Boolean attributes are `no-value`; everything else is a `plain` value that
 * carries its default when one is known.
 * @param {any} attr a manifest attribute
 * @returns {object} a web-types attribute contribution
 */
function attributeContribution(attr) {
  const type = htmlValueType(attr.type?.text)
  const entry = { name: attr.name || attr.fieldName }
  if (attr.description) entry.description = attr.description

  if (type === 'boolean') {
    entry.value = { kind: 'no-value', type: 'boolean' }
    return entry
  }

  const value = { kind: 'plain', type }
  const fallback = unquote(attr.default)
  if (fallback !== undefined && fallback !== '') {
    value.default = fallback
    entry.default = fallback
  }
  entry.value = value
  return entry
}

/**
 * Builds one web-types HTML element contribution from a manifest declaration:
 * its attributes, plus DOM properties and events under `js`. Empty groups are
 * omitted so the output stays compact.
 * @param {any} dec a custom-element declaration
 * @returns {object} a web-types element contribution
 */
function elementContribution(dec) {
  const element = { name: dec.tagName || getKebabCase(dec.name) }
  const description = descriptionOf(dec)
  if (description) element.description = description

  element.attributes = (dec.attributes ?? []).reduce((attributes, attr) => {
    const name = attr.name || attr.fieldName
    if (!name || attributes.some((a) => a.name === name)) return attributes
    attributes.push(attributeContribution(attr))
    return attributes
  }, [])

  const properties = (dec.members ?? [])
    .filter(
      (member) =>
        member.kind === 'field' &&
        member.privacy !== 'private' &&
        member.privacy !== 'protected'
    )
    .map((member) => {
      const property = { name: member.name }
      if (member.description) property.description = member.description
      if (member.type?.text) property.type = member.type.text
      if (member.readonly) property['read-only'] = true
      return property
    })

  const events = (dec.events ?? []).map((event) => {
    const entry = { name: event.name }
    if (event.description) entry.description = event.description
    if (event.type?.text) entry.type = event.type.text
    return entry
  })

  const js = {}
  if (properties.length) js.properties = properties
  if (events.length) js.events = events
  if (properties.length || events.length) element.js = js

  return element
}

/**
 * A CEM analyzer plugin that generates a JetBrains
 * [web-types](https://github.com/JetBrains/web-types) file from the manifest,
 * so WebStorm / IntelliJ offer tag, attribute, property and event completion
 * for your components. It is the JetBrains counterpart to `wcbVsCodePlugin`
 * (which targets VS Code and the editors sharing its HTML/CSS language service);
 * the two formats are unrelated, so a package that wants both ships both files.
 *
 * JetBrains discovers the file through the `web-types` field in `package.json`.
 * This plugin sets that field for you during `cem analyze` (pointing it at
 * `<outdir>/<fileName>`), the same way the analyzer maintains `customElements` —
 * so you only need to include the file in your `files` array to ship it. Pass
 * `packageJson: false` to leave package.json untouched. The generated
 * `name` / `version` mirror your `package.json`; override them if needed.
 * @param {object} [options]
 * @param {string} [options.outdir] directory to write into (default `'.wcb'`)
 * @param {string | null} [options.fileName] file name, or `null` to skip (default `'web-types.json'`)
 * @param {boolean} [options.packageJson] set the `web-types` field in package.json (default `true`)
 * @param {string} [options.name] package name for the `name` field (default: read from `package.json`)
 * @param {string} [options.version] package version for the `version` field (default: read from `package.json`)
 * @param {string[]} [options.exclude] declaration names to omit
 * @returns {{name: string, packageLinkPhase: (ctx: any) => void}} a CEM analyzer plugin
 * @example
 * // custom-elements-manifest.config.mjs
 * import { wcbStaticProps, wcbJetBrainsPlugin } from 'web-component-base/cem-plugin'
 * export default {
 *   globs: ['src/**\/*.ts'],
 *   outdir: '.wcb',
 *   plugins: [wcbStaticProps(), wcbJetBrainsPlugin()],
 * }
 */
export function wcbJetBrainsPlugin(options = {}) {
  const outdir = options.outdir ?? '.wcb'
  const fileName = 'fileName' in options ? options.fileName : 'web-types.json'
  const exclude = options.exclude ?? []
  const updatePackageJson = options.packageJson ?? true

  return {
    name: 'wcb-jet-brains-plugin',
    packageLinkPhase({ customElementsManifest }) {
      if (!fileName) return
      const pkg = packageIdentity()
      writeJson(outdir, fileName, {
        $schema: 'http://json.schemastore.org/web-types',
        name: options.name ?? pkg.name ?? 'components',
        version: options.version ?? pkg.version ?? '0.0.0',
        'description-markup': 'markdown',
        contributions: {
          html: {
            elements: customElementDecls(customElementsManifest, exclude).map(
              elementContribution
            ),
          },
        },
      })
      if (updatePackageJson) setWebTypesField(path.posix.join(outdir, fileName))
    },
  }
}
