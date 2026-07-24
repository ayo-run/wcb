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

  it('exposes every plugin', async () => {
    const mod = await import('../src/cem-plugin.js')
    expect(mod.distPaths().name).toBe('wcb-dist-paths')
    expect(mod.wcbVsCodePlugin().name).toBe('wcb-vs-code-plugin')
    expect(mod.wcbJetBrainsPlugin().name).toBe('wcb-jet-brains-plugin')
  })

  it('defaults to wcbPluginSet(), the spreadable full plugin set', async () => {
    const mod = await import('../src/cem-plugin.js')
    expect(mod.default).toBe(mod.wcbPluginSet)
    expect(mod.wcbPluginSet().map((p) => p.name)).toEqual([
      'wcb-static-props',
      'wcb-dist-paths',
      'wcb-vs-code-plugin',
      'wcb-jet-brains-plugin',
    ])
  })

  it('is not reachable from the package root', () => {
    // dev-only tooling must never be pulled into the browser bundle or the
    // size-limit budget
    expect(Object.keys(main)).not.toContain('wcbStaticProps')
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
