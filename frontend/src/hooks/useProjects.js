import { useState, useEffect, useCallback } from 'react'
import * as projectService from '../services/projectService'

export function useProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true)
      const data = await projectService.getProjects()
      setProjects(data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch projects')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const addProject = async (projectData) => {
    const newProject = await projectService.createProject(projectData)
    setProjects((current) => [newProject, ...current])
    return newProject
  }

  const updateProject = async (id, projectData) => {
    const updated = await projectService.updateProject(id, projectData)
    setProjects((current) => current.map((p) => p._id === id ? updated : p))
    return updated
  }

  const deleteProject = async (id) => {
    await projectService.deleteProject(id)
    setProjects((current) => current.filter((p) => p._id !== id))
  }

  return { projects, loading, error, addProject, updateProject, deleteProject, refetch: fetchProjects }
}
