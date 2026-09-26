export function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export function isTaskOverdue(task) {
  if (!task || !task.dueDate || task.status === 'Completed') return false
  const due = new Date(task.dueDate)
  if (isNaN(due.getTime())) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDay = new Date(due.getUTCFullYear(), due.getUTCMonth(), due.getUTCDate())
  return dueDay < today
}
