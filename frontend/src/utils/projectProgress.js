export const getProjectTasks = (tasks, projectId) => {
  if (!tasks || !Array.isArray(tasks) || !projectId) return []
  const targetId = String(typeof projectId === 'object' && projectId._id ? projectId._id : projectId)
  return tasks.filter(t => {
    if (!t || !t.project) return false
    const taskProjId = String(typeof t.project === 'object' && t.project._id ? t.project._id : t.project)
    return taskProjId === targetId
  })
}

export const calculateProjectProgress = (tasks, projectId) => {
  const projectTasks = getProjectTasks(tasks, projectId)
  if (!projectTasks || projectTasks.length === 0) return 0
  const completedTasks = projectTasks.filter(t => t.status && String(t.status).toLowerCase() === 'completed').length
  const percentage = Math.round((completedTasks / projectTasks.length) * 100)
  return isNaN(percentage) ? 0 : percentage
}
