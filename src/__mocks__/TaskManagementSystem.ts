import { mockWorld, MockTask } from './World'

type Real = typeof import('../TaskManagementSystem')

export const createTask: Real['createTask'] = async information => {
  const number = mockWorld.tasks.length + 1
  const task: MockTask = { ...information, number, completed: false }
  mockWorld.tasks.push(task)
  return `#${task.number}`
}

export const completeTask: Real['completeTask'] = async taskReference => {
  getTask(taskReference).completed = true
}

export const updateTask: Real['updateTask'] = async (
  taskReference,
  information,
) => {
  Object.assign(getTask(taskReference), information)
}

function getTask(taskReference: string) {
  return mockWorld.tasks.find(t => `#${t.number}` === taskReference)!
}
