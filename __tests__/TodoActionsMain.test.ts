import { runMain } from '../src/TodoActionsMain'
import { resetMockWorld } from '../src/__mocks__/World'
import sortBy from 'lodash.sortby'

jest.mock('@actions/core')
jest.mock('../src/DataStore')
jest.mock('../src/CodeRepository')
jest.mock('../src/TaskManagementSystem')

const MARKER = 'TODO'

it('works', async () => {
  const world = resetMockWorld()

  // Round 1: Arrange
  world.file(
    'main.js',
    `
      // ${MARKER}: Hello world
      // This is great!

      <!--
        - ${MARKER}:
        - Somebody once told me
        - the world is gonna roll me
        -->
    `,
  )

  // Round 1: Act
  await runMain()

  // Round 1: Assert commits
  expect(world.commits.length).toEqual(2)
  expect(world.commits[0].files.get('main.js')).toMatch(
    new RegExp(`${MARKER} \\[\\$\\w+\\]: Hello world`),
  )
  expect(world.commits[1].files.get('main.js')).toMatch(
    new RegExp(`${MARKER} \\[#\\d+\\]: Hello world`),
  )

  expect(world.commits[1].message).toMatch(/#1/)
  expect(world.commits[1].message).toMatch(/#2/)

  // Round 1: Assert tasks
  expect(sortBy(world.tasks.map(t => t.title))).toEqual([
    'Hello world',
    'Somebody once told me',
  ])

  // Idempotent check
  await runMain()
  expect(world.commits.length).toEqual(2)
  expect(world.tasks.length).toEqual(2)

  // Round 2: Arrange
  const task1 = world.tasks.find(t => t.title === 'Hello world')!
  const task2 = world.tasks.find(t => t.title === 'Somebody once told me')!
  world.file(
    'main.js',
    `
      <!--
        - ${MARKER} [#${task2.number}]:
        - Somebody once told me?
        - the world is gonna roll me
        -->
    `,
  )

  // Round 2: Act
  await runMain()

  // Round 2: Assert commits
  // No new commits expected
  expect(world.commits.length).toEqual(2)

  // Round 2: Assert tasks
  expect(task1.completed).toBe(true)
  expect(task2.completed).toBe(false)
  expect(task2.title).toBe('Somebody once told me?')
})
