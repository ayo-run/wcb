import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Translated pages are hand-written copies of the English ones, so it is easy
 * to carry over a root-absolute link (`/getting-started`) verbatim. Starlight
 * does not rewrite links per locale: following one from `/ja/` drops the
 * reader back into English and the locale is lost for the rest of the visit.
 * Every internal link in a translated page has to carry its own locale prefix.
 */

const DOCS = 'docs/src/content/docs'
const CONFIG = 'docs/astro.config.mjs'

/** @returns {string[]} the non-default locale keys declared in astro.config.mjs */
function getLocales() {
  const config = readFileSync(CONFIG, 'utf8')
  const block = config.match(/locales: \{(.*?)\n {6}\},/s)?.[1] ?? ''
  return [...block.matchAll(/^ {8}'?([\w-]+)'?: \{/gm)]
    .map(([, key]) => key)
    .filter((key) => key !== 'root')
}

/**
 * @param {string} dir directory to walk
 * @returns {string[]} every markdown page under `dir`, relative to the repo
 */
function getPages(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) return getPages(path)
    return /\.mdx?$/.test(entry.name) ? [path] : []
  })
}

/**
 * @param {string} source raw markdown of a page
 * @returns {string[]} the root-absolute internal links a page points at
 */
function getInternalLinks(source) {
  return [
    ...[...source.matchAll(/\]\((\/[^)]*)\)/g)].map(([, href]) => href),
    ...[...source.matchAll(/^\s*link: (\/\S*)/gm)].map(([, href]) => href),
  ].filter((href) => !href.startsWith('//'))
}

const locales = getLocales()

describe('translated docs pages', () => {
  it('declares locales other than the default', () => {
    expect(locales.length).toBeGreaterThan(0)
  })

  describe.each(locales)('%s', (locale) => {
    const pages = getPages(join(DOCS, locale))

    it('has pages', () => {
      expect(pages.length).toBeGreaterThan(0)
    })

    it.each(pages)('%s keeps internal links in-locale', (page) => {
      // file name derived from `page`
      const filename = page.substring(page.lastIndexOf('/') + 1)
      // shared assets expected to be the same for locales
      const expectedShared = {
        'examples.md': ['/todo-app.gif'],
      }
      const links = getInternalLinks(readFileSync(page, 'utf8'))
      const leaking = links.filter((href) => !href.startsWith(`/${locale}/`))

      console.log('>>>', { page })

      expect(leaking).toEqual(expectedShared[filename] ?? [])
    })

    // four pages sharing one slug collapse into a single collection entry,
    // so every locale renders whichever file was scanned last
    it.each(pages)('%s scopes its slug to the locale', (page) => {
      const slug = readFileSync(page, 'utf8').match(
        /^slug: '?([^'\n]+)'?/m
      )?.[1]
      if (slug) expect(slug.startsWith(`${locale}/`)).toBe(true)
    })
  })
})
