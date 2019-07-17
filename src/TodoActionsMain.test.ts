import { runMain } from './TodoActionsMain'

jest.mock('./DataStore')
jest.mock('./CodeRepository')
jest.mock('./TaskManagementSystem')

test.skip('works', async () => {
  await runMain()
})
