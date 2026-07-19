import { describe, expect, test } from 'vitest'
import { serialize } from '../../src/utils/serialize.mjs'
import { deserialize } from '../../src/utils/deserialize.mjs'

describe('deserialize', () => {
  test('parses number strings', () => {
    expect(deserialize('3', 'number')).toBe(3)
    expect(deserialize('-4.5', 'number')).toBe(-4.5)
  })

  test('parses boolean strings', () => {
    expect(deserialize('true', 'boolean')).toBe(true)
    expect(deserialize('false', 'boolean')).toBe(false)
  })

  test('treats a bare/empty boolean attribute as true', () => {
    expect(deserialize('', 'boolean')).toBe(true)
  })

  test('parses object strings', () => {
    expect(deserialize('{"hello":"world"}', 'object')).toEqual({
      hello: 'world',
    })
    expect(deserialize('[1,2,3]', 'object')).toEqual([1, 2, 3])
    expect(deserialize('null', 'object')).toBeNull()
  })

  test('passes strings through untouched', () => {
    expect(deserialize('World', 'string')).toBe('World')
    // an unknown/default type is treated as a plain string
    expect(deserialize('World', 'symbol')).toBe('World')
  })

  test('round-trips values through serialize', () => {
    const cases = [
      [3, 'number'],
      [false, 'boolean'],
      [{ a: 1, b: [2, 3] }, 'object'],
      ['hello', 'string'],
    ]
    for (const [value, type] of cases) {
      expect(deserialize(serialize(value), type)).toEqual(value)
    }
  })
})
