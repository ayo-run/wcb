/**
 * @author Ayo Ayco <https://ayo.ayco.io>
 * @license MIT
 * https://opensource.org/licenses/MIT
 *
 * `wcbVsCodePlugin`: generates VS Code HTML/CSS custom-data files from the
 * manifest. Dev-time only — runs in Node during `cem analyze`.
 * @see https://webcomponent.io/cem-plugin/
 */

import { getKebabCase } from '../utils/index.js'
import { customElementDecls, descriptionOf, writeJson } from './shared.js'

/**
 * @typedef {typeof import('typescript')} TypeScript
 * @import * as TypeScriptInstance from 'typescript'
 * @import { CustomElementDecl, Manifest } from './shared.js'
 */

/**
 * The `analyzePhase` params this plugin reads.
 * @typedef {object} AnalyzePhaseParams
 * @property {TypeScript} ts the TypeScript module handed to the hook
 * @property {TypeScriptInstance.Node} node the current AST node
 */

/**
 * The `packageLinkPhase` params this plugin reads.
 * @typedef {object} PackageLinkPhaseParams
 * @property {Manifest} customElementsManifest the completed manifest
 */

/** TypeScript primitive type names that are not useful as attribute value hints. */
const PRIMITIVE_TYPES = new Set([
  'string',
  'boolean',
  'number',
  'undefined',
  'null',
])

/**
 * Reads a JSDoc tag's comment as a plain string across TypeScript versions
 * (older releases give a string, newer ones a `NodeArray` of comment parts).
 * @param {TypeScriptInstance.JSDocTag} tag a JSDoc tag node
 * @returns {string} the comment text, or `''`
 */
function commentText(tag) {
  const comment = tag.comment
  if (typeof comment === 'string') return comment
  return (comment ?? []).map((part) => part.text ?? '').join('')
}

/**
 * Collects `@reference Name - url` JSDoc tags off a class, keeping only the
 * well-formed ones. A tag that does not split cleanly into a name and a url is
 * dropped — never emitted as `null`, which the third-party generator does and
 * which VS Code rejects as invalid custom data, silently dropping the whole
 * tag with it.
 * @param {TypeScript} ts the TypeScript module handed to the hook
 * @param {TypeScriptInstance.ClassDeclaration & { jsDoc?: readonly TypeScriptInstance.JSDoc[] }} node the class declaration node
 * @returns {{name: string, url: string}[]} valid references, possibly empty
 */
function readReferences(ts, node) {
  const references = []
  for (const doc of node.jsDoc ?? []) {
    for (const tag of doc.tags ?? []) {
      if (tag.tagName?.getText() !== 'reference') continue
      const [name, url] = commentText(tag).split(/ - (.*)/s)
      if (name?.trim() && url?.trim())
        references.push({ name: name.trim(), url: url.trim() })
    }
  }
  return references
}

/**
 * Splits a manifest `type.text` (`'a' | 'b'`, `a,b`) into VS Code value
 * completions, dropping bare primitive types that carry no useful suggestion.
 * @param {string | undefined} text the manifest type text
 * @returns {{name: string}[]} value completions, possibly empty
 */
function attributeValues(text) {
  if (!text) return []
  return (text.includes('|') ? text.split('|') : text.split(','))
    .map((part) => part.trim())
    .filter((part) => part && !PRIMITIVE_TYPES.has(part))
    .map((part) => ({ name: part.replace(/^['"]|['"]$/g, '') }))
}

/**
 * Splits a CSS custom property's `type.text` into value completions, wrapping
 * bare custom-property references (`--x`) as `var(--x)`.
 * @param {string | undefined} text the manifest type text
 * @returns {{name: string}[]} value completions, possibly empty
 */
function cssValues(text) {
  if (!text) return []
  return (text.includes('|') ? text.split('|') : text.split(','))
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => ({ name: part.startsWith('--') ? `var(${part})` : part }))
}

/**
 * Builds one VS Code HTML custom-data tag from a manifest declaration. Keys
 * that would be empty (`description`, `references`) are omitted rather than set
 * to a falsy value, so the output stays schema-valid.
 * @param {CustomElementDecl} dec a custom-element declaration
 * @param {Record<string, {name: string, url: string}[]>} references references by class name
 * @returns {object} a VS Code custom-data tag
 */
function htmlTag(dec, references) {
  const tag = { name: dec.tagName || getKebabCase(dec.name) }
  const description = descriptionOf(dec)
  if (description) tag.description = description

  tag.attributes = (dec.attributes ?? []).reduce((attributes, attr) => {
    const name = attr.name || attr.fieldName
    if (!name || attributes.some((a) => a.name === name)) return attributes
    const entry = { name, values: attributeValues(attr.type?.text) }
    if (attr.description) entry.description = attr.description
    attributes.push(entry)
    return attributes
  }, [])

  const refs = references[dec.name] ?? []
  if (refs.length) tag.references = refs
  return tag
}

/**
 * A CEM analyzer plugin that generates VS Code
 * [custom data](https://github.com/microsoft/vscode-custom-data) files from the
 * manifest, so VS Code's built-in HTML/CSS language services offer tag,
 * attribute and CSS completions for your components with no editor extension.
 *
 * It replaces `cem-plugin-vs-code-custom-data-generator`: same one-`cem analyze`
 * output, but it emits schema-valid files (that plugin writes
 * `"references": [null]` for any component without a `@reference` tag, which
 * VS Code rejects — silently dropping the whole tag). Attribute names and
 * descriptions come from wcb's `static props` as read by
 * `wcbStaticProps`, so hints can't drift from the code.
 *
 * Two files are written, each disabled by passing its name as `null`:
 * - `html-custom-data.json` — one tag per custom element, its attributes
 *   and (when present) `@reference Name - url` links.
 * - `css-custom-data.json` — `@cssproperty` entries as `properties` and
 *   `@csspart` entries as `::part(...)` `pseudoElements`.
 * @param {object} [options] overrides for the output location and contents
 * @param {string} [options.outdir] directory to write into (default `'.wcb'`). Note VS Code's `html.customData` resolves from the workspace root, not the settings file — point `outdir` (and the setting) where they meet.
 * @param {string | null} [options.htmlFileName] HTML custom-data file name, or `null` to skip (default `'html-custom-data.json'`)
 * @param {string | null} [options.cssFileName] CSS custom-data file name, or `null` to skip (default `'css-custom-data.json'`)
 * @param {string[]} [options.exclude] declaration names to omit
 * @returns {{ name: string, analyzePhase: (params: AnalyzePhaseParams) => void, packageLinkPhase: (params: PackageLinkPhaseParams) => void }} a CEM analyzer plugin
 * @example
 * // custom-elements-manifest.config.mjs
 * import { wcbStaticProps, wcbVsCodePlugin } from 'web-component-base/cem-plugin'
 * export default {
 *   globs: ['src/**\/*.ts'],
 *   outdir: '.wcb',
 *   plugins: [wcbStaticProps(), wcbVsCodePlugin()],
 * }
 */
export function wcbVsCodePlugin(options = {}) {
  const outdir = options.outdir ?? '.wcb'
  const htmlFileName =
    'htmlFileName' in options ? options.htmlFileName : 'html-custom-data.json'
  const cssFileName =
    'cssFileName' in options ? options.cssFileName : 'css-custom-data.json'
  const exclude = options.exclude ?? []
  const references = {}

  return {
    name: 'wcb-vs-code-plugin',
    analyzePhase({ ts, node }) {
      if (!ts.isClassDeclaration(node) || !node.name) return
      const refs = readReferences(ts, node)
      if (refs.length) references[node.name.getText()] = refs
    },
    packageLinkPhase({ customElementsManifest }) {
      const decls = customElementDecls(customElementsManifest, exclude)
      if (htmlFileName)
        writeJson(outdir, htmlFileName, {
          version: 1.1,
          tags: decls.map((dec) => htmlTag(dec, references)),
        })
      if (cssFileName)
        writeJson(outdir, cssFileName, {
          version: 1.1,
          properties: decls.flatMap((dec) =>
            (dec.cssProperties ?? []).map((prop) => {
              const entry = {
                name: prop.name,
                values: cssValues(prop.type?.text),
              }
              if (prop.description) entry.description = prop.description
              return entry
            })
          ),
          pseudoElements: decls.flatMap((dec) =>
            (dec.cssParts ?? []).map((part) => {
              const entry = { name: `::part(${part.name})` }
              if (part.description) entry.description = part.description
              return entry
            })
          ),
        })
    },
  }
}
