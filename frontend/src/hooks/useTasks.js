import { useState, useEffect, useCallback } from 'react'
import * as taskService from '../services/taskService'

export function useTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      const data = await taskService.getTasks()
      setTasks(data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const addTask = async (taskData) => {
    const newTask = await taskService.createTask(taskData)
    setTasks((current) => [newTask, ...current])
    return newTask
  }

  const updateTask = async (id, taskData) => {
    const updated = await taskService.updateTask(id, taskData)
    setTasks((current) => current.map((t) => t._id === id ? updated : t))
    return updated
  }

  const deleteTask = async (id) => {
    await taskService.deleteTask(id)
    setTasks((current) => current.filter((t) => t._id !== id))
  }

  return { tasks, loading, error, addTask, updateTask, deleteTask, refetch: fetchTasks }
}
