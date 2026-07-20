import { beforeEach, expect, test } from 'vitest'
import '../../demo/examples/nested-composition/index.js'

beforeEach(() => {
  document.body.innerHTML = ''
})

test('three-level nesting renders all levels on connect', () => {
  document.body.innerHTML = '<counter-board></counter-board>'
  const board = document.querySelector('counter-board')

  const rows = board.querySelectorAll('counter-row')
  expect(rows.length).toBe(3)
  // each row hosts a leaf counter that rendered its own button + count
  rows.forEach((row) => {
    expect(row.querySelector('tick-counter .count').textContent.trim()).toBe(
      '0'
    )
  })
})

test('an ancestor re-render keeps each nested counter’s own state', () => {
  document.body.innerHTML = '<counter-board></counter-board>'
  const board = document.querySelector('counter-board')
  const counters = [...board.querySelectorAll('tick-counter')]

  // click the leaf counters different numbers of times — pure self-state
  counters[0].querySelector('button').click()
  counters[1].querySelector('button').click()
  counters[1].querySelector('button').click()

  expect(
    counters.map((c) => c.querySelector('.count').textContent.trim())
  ).toEqual(['1', '2', '0'])

  // re-render the ROOT for an unrelated reason
  const titleBefore = board.querySelector('#board-title').textContent
  board.querySelector('#rename').click()
  expect(board.querySelector('#board-title').textContent).not.toBe(titleBefore)

  // the same counter elements are reused and their counts are intact
  expect([...board.querySelectorAll('tick-counter')]).toEqual(counters)
  expect(
    counters.map((c) => c.querySelector('.count').textContent.trim())
  ).toEqual(['1', '2', '0'])
})
