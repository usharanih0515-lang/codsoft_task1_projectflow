import api from './api'

export const getTasks = async () => {
  const response = await api.get('/tasks')
  return response.data
}

export const getTask = async (id) => {
  const response = await api.get(`/tasks/${id}`)
  return response.data
}

export const createTask = async (taskData) => {
  const response = await api.post('/tasks', taskData)
  return response.data
}

export const updateTask = async (id, taskData) => {
  const response = await api.put(`/tasks/${id}`, taskData)
  return response.data
}

export const deleteTask = async (id) => {
  const response = await api.delete(`/tasks/${id}`)
  return response.data
}
