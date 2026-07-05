import { beforeEach, expect, test } from 'vitest'
import '../../demo/examples/templating/index.js'

beforeEach(() => {
  document.body.innerHTML = ''
})

test('renders interpolated lists and links and counts on click', () => {
  document.body.innerHTML = '<my-counter></my-counter>'
  const el = document.querySelector('my-counter')

  expect(el.querySelector('#btn span').textContent.trim()).toBe('123')

  const paragraphs = [...el.querySelectorAll('p')].map((p) =>
    p.textContent.trim()
  )
  expect(paragraphs).toContain('what')

  const links = el.querySelectorAll('li a')
  expect(links.length).toBe(2)
  expect(links[0].getAttribute('href')).toBe('https://ayco.io')

  el.querySelector('#btn').click()
  expect(el.querySelector('#btn span').textContent.trim()).toBe('124')
})
