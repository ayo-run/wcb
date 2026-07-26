import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import * as main from '../src/index.js'
import * as utils from '../src/utils/index.js'

describe('main exports', () => {
  it('exposes WebComponent and html', () => {
    expect(typeof main.WebComponent).toBe('function')
    expect(typeof main.html).toBe('function')
  })

  it('WebComponent extends HTMLElement', () => {
    expect(main.WebComponent.prototype).toBeInstanceOf(HTMLElement)
  })
})

describe('cem-plugin entry', () => {
  it('is reachable from its own subpath', async () => {
    const mod = await import('../src/cem-plugin.js')
    expect(typeof mod.wcbStaticProps).toBe('function')
    expect(mod.wcbStaticProps().name).toBe('wcb-static-props')
  })

  it('is not reachable from the package root', () => {
    // dev-only tooling must never be pulled into the browser bundle or the
    // size-limit budget
    expect(Object.keys(main)).not.toContain('wcbStaticProps')
  })
})

describe('published source shape', () => {
  it('has no spec files under src', () => {
    // `copy:source` globs ./src/*.js and ./src/utils/*, so anything living in
    // src ends up in the published dist — specs belong in test/
    const strays = readdirSync(resolve('src'), { recursive: true }).filter(
      (entry) => /\.(test|spec)\./.test(String(entry))
    )
    expect(strays).toEqual([])
  })
})

describe('utils exports', () => {
  it('exposes every documented utility', () => {
    for (const name of [
      'serialize',
      'deserialize',
      'getCamelCase',
      'getKebabCase',
      'createElement',
      'applyProp',
      'patchNode',
      'patchChildren',
    ]) {
      expect(typeof utils[name], name).toBe('function')
    }
  })
})
