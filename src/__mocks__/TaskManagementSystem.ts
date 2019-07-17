type Real = typeof import('../TaskManagementSystem')

export const createTask: Real['createTask'] = async information => {
  throw new Error('!!!')
}

export const completeTask: Real['completeTask'] = async taskReference => {
  throw new Error('!!!')
}

export const updateTask: Real['updateTask'] = async (
  taskReference,
  information,
) => {
  throw new Error('!!!')
}
