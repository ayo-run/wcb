import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * `/llms.txt` and `/llms-full.txt` are generated from the docs collection, so
 * they cannot go stale page-by-page — but they can lose pages wholesale if the
 * sidebar or the collection shape changes, and nothing on the site would look
 * wrong. These assertions are about the source the endpoints read from: every
 * English page has to be reachable through the sidebar, or it silently never
 * reaches the corpus.
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

/** @returns {string[]} every page slug listed in the astro.config.mjs sidebar */
function getSidebarSlugs() {
  const config = readFileSync(CONFIG, 'utf8')
  const block = config.match(/^ {6}sidebar: \[(.*?)^ {6}\],/ms)?.[1] ?? ''
  return [...block.matchAll(/^ {12}'([\w/-]+)',$/gm)].map(([, slug]) => slug)
}

const locales = getLocales()
const sidebar = getSidebarSlugs()

/** English pages, by the slug the sidebar would refer to them by. */
const english = getPages(DOCS)
  .filter((page) => {
    const rest = page.slice(DOCS.length + 1)
    return !locales.some((locale) => rest.startsWith(`${locale}/`))
  })
  .map((page) => ({
    page,
    slug: readFileSync(page, 'utf8').match(/^slug: '?([^'\n]+)'?/m)?.[1],
  }))

describe('llms.txt corpus', () => {
  it('reads a sidebar with entries', () => {
    expect(sidebar.length).toBeGreaterThan(0)
  })

  it.each(english.filter(({ slug }) => slug))(
    '$page is listed in the sidebar',
    ({ slug }) => {
      expect(sidebar).toContain(slug)
    }
  )

  it.each(sidebar)('sidebar entry %s resolves to a page', (slug) => {
    expect(english.some((entry) => entry.slug === slug)).toBe(true)
  })
})
