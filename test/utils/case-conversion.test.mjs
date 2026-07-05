import { describe, expect, test } from 'vitest'
import { getCamelCase } from '../../src/utils/get-camel-case.mjs'
import { getKebabCase } from '../../src/utils/get-kebab-case.mjs'

describe('getKebabCase', () => {
  test('converts camelCase to kebab-case', () => {
    expect(getKebabCase('myName')).toBe('my-name')
    expect(getKebabCase('isActive')).toBe('is-active')
    expect(getKebabCase('dataFooBar')).toBe('data-foo-bar')
  })

  test('leaves single-word names unchanged', () => {
    expect(getKebabCase('emotion')).toBe('emotion')
  })
})

describe('getCamelCase', () => {
  test('converts kebab-case to camelCase', () => {
    expect(getCamelCase('my-name')).toBe('myName')
    expect(getCamelCase('is-active')).toBe('isActive')
    expect(getCamelCase('data-foo-bar')).toBe('dataFooBar')
  })

  test('leaves single-word names unchanged', () => {
    expect(getCamelCase('emotion')).toBe('emotion')
  })
})

describe('case conversion round-trip', () => {
  test('camel -> kebab -> camel is stable', () => {
    for (const name of ['myName', 'isActive', 'dataFooBar', 'emotion']) {
      expect(getCamelCase(getKebabCase(name))).toBe(name)
    }
  })
})
