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

describe('utils exports', () => {
  it('exposes every documented utility', () => {
    for (const name of [
      'serialize',
      'deserialize',
      'getCamelCase',
      'getKebabCase',
      'createElement',
    ]) {
      expect(typeof utils[name], name).toBe('function')
    }
  })
})
