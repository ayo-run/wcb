import { beforeEach, expect, test } from 'vitest'
import '../../demo/examples/style-objects/index.js'

beforeEach(() => {
  document.body.innerHTML = ''
})

test('style object applies computed inline styles for the default type', () => {
  document.body.innerHTML = '<styled-elements></styled-elements>'
  const div = document.querySelector('styled-elements div')
  expect(div.style.backgroundColor).toBe('blue')
  expect(div.style.padding).toBe('1em')
  expect(document.querySelector('styled-elements p').textContent.trim()).toBe(
    'Wow!'
  )
})

test('the type attribute selects a different style set', () => {
  document.body.innerHTML = '<styled-elements type="warn"></styled-elements>'
  const div = document.querySelector('styled-elements div')
  expect(div.style.backgroundColor).toBe('yellow')
})
