import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

/**
 * The JSON-LD on the docs site describes the *package*, and it reads those
 * facts from the root `package.json` at build time rather than repeating them.
 * That keeps them from drifting, but it also means a renamed or dropped field
 * emits `undefined` into structured data — machine-readable and silently wrong,
 * with nothing visibly broken on the page.
 *
 * The emitting module imports Astro virtual modules, so it can only run inside
 * a build. What is checkable here is its input, and that the override is wired
 * up at all.
 */

const PKG = 'package.json'
const CONFIG = 'docs/astro.config.mjs'

const pkg = JSON.parse(readFileSync(PKG, 'utf8'))

describe('structured data inputs', () => {
  it.each(['name', 'version', 'description', 'license'])(
    'package.json declares a non-empty %s',
    (field) => {
      expect(pkg[field]).toBeTruthy()
      expect(typeof pkg[field]).toBe('string')
    }
  )

  it('declares a repository URL that normalises to a browsable one', () => {
    const url = pkg.repository?.url
    expect(url).toBeTruthy()
    const normalised = url.replace(/^git\+/, '').replace(/\.git$/, '')
    expect(normalised).toMatch(/^https:\/\//)
  })

  it('declares an SPDX licence identifier', () => {
    // the emitted value is `https://spdx.org/licenses/<license>`
    expect(pkg.license).toMatch(/^[\w.-]+$/)
  })

  it('registers the Head override that emits the JSON-LD', () => {
    const config = readFileSync(CONFIG, 'utf8')
    expect(config).toMatch(/Head: '\.\/src\/components\/Head\.astro'/)
  })
})
