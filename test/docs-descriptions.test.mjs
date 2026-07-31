import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * A page without `description` frontmatter ships with no `<meta
 * name="description">` and no `og:description` at all — Starlight has nothing
 * to fall back to. That string is the search snippet, the social card body,
 * and often the only text a summariser reads before deciding whether the page
 * answers the question. It is invisible while authoring, so nothing catches a
 * new guide that omits it except this test.
 */

const DOCS = 'docs/src/content/docs'

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
 * @returns {string|undefined} the page's description, unquoted and trimmed
 */
function getDescription(source) {
  const frontmatter = source.match(/^---\n(.*?)\n---/s)?.[1]
  const value = frontmatter?.match(/^description:[ \t]*(.+)$/m)?.[1]
  return value
    ?.trim()
    .replace(/^(['"])(.*)\1$/, '$2')
    .trim()
}

const pages = getPages(DOCS)

describe('docs pages', () => {
  it('finds pages to check', () => {
    expect(pages.length).toBeGreaterThan(0)
  })

  it.each(pages)('%s has a description', (page) => {
    const description = getDescription(readFileSync(page, 'utf8'))
    expect(description).toBeTruthy()
  })
})
