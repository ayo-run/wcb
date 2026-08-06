import { describe, expect, it } from 'vitest'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { showcase } from '../docs/src/showcase.mjs'

/**
 * The homepage showcase is data: `docs/src/showcase.mjs` is looped by
 * `ShowcaseGrid.astro`, so a demo is added by a one-entry pull request from
 * someone who has never touched this repo before — see the Showcase guide.
 * That is only true while the entries stay in the shape the grid renders, and
 * a malformed one is invisible in review: a missing `description` renders an
 * empty card, and a bare-domain `href` builds a link to nowhere.
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

/** @returns {string[]} every homepage, one per locale plus the English one */
function getHomepages() {
  return [
    join(DOCS, 'index.mdx'),
    ...readdirSync(DOCS, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => join(DOCS, entry.name, 'index.mdx'))
      .filter((page) => existsSync(page)),
  ]
}

const locales = getLocales()
const entries = Object.entries(showcase)

describe('homepage showcase', () => {
  it('has entries', () => {
    expect(entries.length).toBeGreaterThan(0)
  })

  // the key is the card's title, rendered as `<key>`, so it has to read as a
  // custom element name — and a duplicate key would silently drop a demo
  it.each(entries.map(([tag]) => tag))('%s is a custom element name', (tag) => {
    expect(tag).toMatch(/^[a-z][a-z0-9]*(-[a-z0-9]+)+$/)
  })

  it('keeps the keys in alphabetical order', () => {
    const tags = entries.map(([tag]) => tag)
    expect(tags).toEqual([...tags].sort())
  })

  describe.each(entries)('%s', (tag, demo) => {
    it('links to a demo page over https', () => {
      expect(() => new URL(demo.href)).not.toThrow()
      expect(new URL(demo.href).protocol).toBe('https:')
    })

    it('describes the component in one line', () => {
      expect(demo.description).toBeTruthy()
      expect(demo.description).not.toContain('\n')
    })

    it('translates only into locales the site publishes', () => {
      for (const [locale, text] of Object.entries(demo.translations ?? {})) {
        expect(locales).toContain(locale)
        expect(text.trim()).toBeTruthy()
      }
    })
  })
})

describe('homepage', () => {
  const homepages = getHomepages()

  it('finds a homepage per locale', () => {
    expect(homepages.length).toBe(locales.length + 1)
  })

  // a card written into a page is a card three translations never get, which
  // is the failure the data file exists to prevent
  it.each(homepages)('%s renders the grid from the data', (page) => {
    const source = readFileSync(page, 'utf8')
    expect(source).toContain('<ShowcaseGrid />')
    expect(source).not.toContain('<ShowcaseCard')
  })
})
