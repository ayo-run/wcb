import { beforeEach, expect, test } from 'vitest'
import '../../demo/examples/on-changes/index.js'

beforeEach(() => {
  document.body.innerHTML = ''
})

test('onChanges payload separates camelCase property from kebab attribute', () => {
  document.body.innerHTML = '<change-logger></change-logger>'
  const el = document.querySelector('change-logger')

  // nothing has changed yet
  expect(el.querySelector('#no-changes')).toBeTruthy()
  expect(el.querySelector('#greeting').textContent.trim()).toBe('Hello World')

  el.querySelector('#rename').click()

  expect(el.querySelector('#property').textContent).toBe('myName')
  expect(el.querySelector('#attribute').textContent).toBe('my-name')
  expect(el.querySelector('#previous').textContent).toBe('World')
  expect(el.querySelector('#current').textContent).toBe('Ayo')
  expect(el.querySelector('#greeting').textContent.trim()).toBe('Hello Ayo')
})
