import { useState } from 'react'
import { Check, Circle, Filter, Plus, X, Trash2, Edit2, AlertTriangle, RotateCcw } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { isTaskOverdue } from '../utils/date'

function Tasks({ projectState, taskState, searchQuery = '', setSearchQuery }) {
  const { projects } = projectState
  const { tasks, loading, error, addTask, updateTask, deleteTask } = taskState
  const { user } = useAuth()
  
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [showFilterBar, setShowFilterBar] = useState(false)
  
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [projectFilter, setProjectFilter] = useState('All')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [projectId, setProjectId] = useState('')
  const [status, setStatus] = useState('To Do')
  const [priority, setPriority] = useState('Medium')
  const [dueDate, setDueDate] = useState('')
  const [startDate, setStartDate] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const openNewForm = () => {
    setEditingTask(null)
    setTitle('')
    setDescription('')
    const initialProject = projects.length > 0 ? projects[0] : null
    setProjectId(initialProject ? initialProject._id : '')
    setStatus('To Do')
    setPriority('Medium')
    setDueDate('')
    setStartDate('')
    
    if (initialProject && initialProject.members && initialProject.members.length > 0) {
      setAssignedTo(initialProject.members[0]._id)
    } else {
      setAssignedTo(user.id)
    }
    
    setSubmitError('')
    setShowForm(true)
  }

  const openEditForm = (task) => {
    setEditingTask(task)
    setTitle(task.title)
    setDescription(task.description || '')
    const pId = task.project?._id || task.project || ''
    setProjectId(pId)
    setStatus(task.status)
    setPriority(task.priority)
    setDueDate(task.dueDate ? task.dueDate.substring(0, 10) : '')
    setStartDate(task.startDate ? task.startDate.substring(0, 10) : '')
    setAssignedTo(task.assignedTo?._id || task.assignedTo || '')
    setSubmitError('')
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(id)
      } catch (err) {
        alert('Failed to delete task')
      }
    }
  }

  const handleToggleStatus = async (task) => {
    try {
      const newStatus = task.status === 'Completed' ? 'To Do' : 'Completed'
      await updateTask(task._id, { status: newStatus })
    } catch (err) {
      alert('Failed to update task status')
    }
  }

  const submit = async (event) => {
    event.preventDefault()
    if (!title.trim() || !projectId) {
      setSubmitError('Title and Project are required')
      return
    }
    
    setIsSubmitting(true)
    setSubmitError('')
    
    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        project: projectId,
        assignedTo: assignedTo || user.id,
        status,
        priority,
        startDate: startDate || undefined,
        dueDate: dueDate || undefined
      }
      
      if (editingTask) {
        await updateTask(editingTask._id, taskData)
      } else {
        await addTask(taskData)
      }
      setShowForm(false)
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter tasks logic
  const filteredTasks = tasks.filter(task => {
    // Search query filter
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      const project = projects.find(p => p._id === (task.project?._id || task.project))
      const projectName = project?.name || ''
      const assigneeName = task.assignedTo?.name || ''
      
      const titleMatch = task.title?.toLowerCase().includes(q)
      const descMatch = task.description?.toLowerCase().includes(q)
      const projMatch = projectName.toLowerCase().includes(q)
      const assigneeMatch = assigneeName.toLowerCase().includes(q)
      
      if (!titleMatch && !descMatch && !projMatch && !assigneeMatch) return false
    }

    // Status filter
    if (statusFilter !== 'All' && task.status !== statusFilter) {
      return false
    }

    // Priority filter
    if (priorityFilter !== 'All' && task.priority !== priorityFilter) {
      return false
    }

    // Project filter
    if (projectFilter !== 'All' && (task.project?._id || task.project) !== projectFilter) {
      return false
    }

    return true
  })

  const hasActiveFilters = statusFilter !== 'All' || priorityFilter !== 'All' || projectFilter !== 'All' || searchQuery !== ''

  const resetFilters = () => {
    setStatusFilter('All')
    setPriorityFilter('All')
    setProjectFilter('All')
    if (setSearchQuery) setSearchQuery('')
  }

  if (loading) return <div style={{ padding: '2rem' }}>Loading tasks...</div>
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>{error}</div>

  // Group tasks for Kanban columns
  const allGroups = ['To Do', 'In Progress', 'Completed']
  const visibleGroups = statusFilter !== 'All' ? [statusFilter] : allGroups
  
  const taskGroups = Object.fromEntries(
    visibleGroups.map(group => [
      group,
      filteredTasks.filter(t => t.status === group)
    ])
  )

  const completedCount = tasks.filter(t => t.status === 'Completed').length

  return <>
    <section className="welcome-row">
      <div>
        <p className="eyebrow">Workspace / Tasks</p>
        <h1>Task board</h1>
        <p className="intro">Keep the small things moving toward the big picture.</p>
      </div>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button 
          className="filter-button" 
          onClick={() => setShowFilterBar(!showFilterBar)}
          style={hasActiveFilters ? { borderColor: 'var(--teal)', color: 'var(--teal)', fontWeight: '600' } : {}}
        >
          <Filter size={16} /> Filter {hasActiveFilters ? '(Active)' : ''}
        </button>
        <button className="new-button" onClick={openNewForm}><Plus size={17} />New task</button>
      </div>
    </section>

    {/* Filter controls toolbar */}
    {(showFilterBar || hasActiveFilters) && (
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '20px', padding: '12px 16px', background: 'white', borderRadius: '8px', border: '1px solid var(--line)' }}>
        <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Filter size={13} /> Filters:
        </span>

        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '12px', background: 'var(--paper)', color: 'var(--ink)', outline: 'none' }}
        >
          <option value="All">Status: All</option>
          <option value="To Do">Status: To Do</option>
          <option value="In Progress">Status: In Progress</option>
          <option value="Completed">Status: Completed</option>
        </select>

        <select 
          value={priorityFilter} 
          onChange={(e) => setPriorityFilter(e.target.value)}
          style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '12px', background: 'var(--paper)', color: 'var(--ink)', outline: 'none' }}
        >
          <option value="All">Priority: All</option>
          <option value="Low">Priority: Low</option>
          <option value="Medium">Priority: Medium</option>
          <option value="High">Priority: High</option>
        </select>

        <select 
          value={projectFilter} 
          onChange={(e) => setProjectFilter(e.target.value)}
          style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--line)', fontSize: '12px', background: 'var(--paper)', color: 'var(--ink)', outline: 'none' }}
        >
          <option value="All">Project: All</option>
          {projects.map(p => (
            <option key={p._id} value={p._id}>Project: {p.name}</option>
          ))}
        </select>

        {hasActiveFilters && (
          <button 
            onClick={resetFilters}
            style={{ background: 'none', border: 'none', color: 'var(--teal)', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto' }}
          >
            <RotateCcw size={12} /> Reset filters
          </button>
        )}
      </div>
    )}

    {searchQuery && (
      <div style={{ marginBottom: '1.2rem', color: 'var(--muted)', fontSize: '13px' }}>
        Showing tasks matching <strong>"{searchQuery}"</strong> ({filteredTasks.length} found)
      </div>
    )}
    
    {filteredTasks.length === 0 && tasks.length > 0 ? (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)', background: 'white', borderRadius: '8px', border: '1px solid var(--line)' }}>
        <p>No tasks match the selected filters or search query.</p>
        <button onClick={resetFilters} style={{ marginTop: '0.5rem', background: 'none', border: 'none', color: 'var(--teal)', cursor: 'pointer', fontWeight: '600', textDecoration: 'underline' }}>Clear filters</button>
      </div>
    ) : (
      <div className="task-board" style={{ gridTemplateColumns: `repeat(${visibleGroups.length}, 1fr)` }}>
        {Object.entries(taskGroups).map(([group, items]) => (
          <section className="task-column" key={group}>
            <div className="column-heading">
              <h2>{group}</h2><span>{items.length}</span>
            </div>
            {items.map((task) => {
              const project = projects.find(p => p._id === (task.project?._id || task.project))
              const projectName = project ? project.name : 'Unknown Project'
              const formattedDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'
              const assigneeName = task.assignedTo?.name || 'Unassigned'
              const initials = task.assignedTo?.name ? task.assignedTo.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U'
              const overdue = isTaskOverdue(task)
              
              return (
                <article className="board-task" key={task._id} style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '5px' }}>
                    <button onClick={() => openEditForm(task)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }} title="Edit task"><Edit2 size={13} color="var(--text-secondary)"/></button>
                    <button onClick={() => handleDelete(task._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }} title="Delete task"><Trash2 size={13} color="var(--risk)"/></button>
                  </div>
                  <button 
                    className="board-check" 
                    aria-label={`Complete ${task.title}`}
                    onClick={() => handleToggleStatus(task)}
                  >
                    {task.status === 'Completed' ? <Check size={18} color="var(--teal)" /> : <Circle size={18} />}
                  </button>
                  <div>
                    <strong style={task.status === 'Completed' ? { textDecoration: 'line-through', color: 'var(--text-secondary)' } : {}}>{task.title}</strong>
                    <small>{projectName}</small>
                    <footer>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span style={task.priority === 'High' ? { color: 'var(--risk)', fontWeight: '600' } : {}}>{formattedDate}</span>
                        {overdue && (
                          <span className="overdue-badge">
                            <AlertTriangle size={11} /> Overdue
                          </span>
                        )}
                        <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
                          {task.priority}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{assigneeName}</span>
                        <span className="avatar small-avatar" title={assigneeName}>{initials}</span>
                      </div>
                    </footer>
                  </div>
                </article>
              )
            })}
          </section>
        ))}
      </div>
    )}
    
    <div className="completed-note"><Check size={18} /> {completedCount} tasks completed</div>
    
    {showForm && (
      <div className="modal-backdrop" role="presentation">
        <form className="modal" onSubmit={submit}>
          <button type="button" className="modal-close" onClick={() => setShowForm(false)} aria-label="Close"><X size={19} /></button>
          <p className="eyebrow">{editingTask ? 'Edit task' : 'New task'}</p>
          <h2>{editingTask ? 'Update task details.' : 'What needs to be done?'}</h2>
          
          {submitError && <div className="error-message" style={{ color: 'var(--risk)', marginBottom: '1rem', fontSize: '14px' }}>{submitError}</div>}
          
          {projects.length === 0 ? (
            <div style={{ color: 'var(--risk)', marginBottom: '1rem' }}>You need to create a project before adding a task.</div>
          ) : (
            <>
              <label>Task title
                <input required autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Design homepage wireframes" />
              </label>
              
              <label>Project
                <select required value={projectId} onChange={(e) => {
                  setProjectId(e.target.value)
                  const newProject = projects.find(p => p._id === e.target.value)
                  if (newProject && newProject.members && newProject.members.length > 0) {
                    setAssignedTo(newProject.members[0]._id)
                  }
                }} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', marginTop: '0.5rem', marginBottom: '1rem' }}>
                  <option value="" disabled>Select a project</option>
                  {projects.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </label>

              <label>Assignee
                <select required value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', marginTop: '0.5rem', marginBottom: '1rem' }}>
                  <option value="" disabled>Select an assignee</option>
                  {projects.find(p => p._id === projectId)?.members.map(member => (
                    <option key={member._id} value={member._id}>{member.name} ({member.email})</option>
                  ))}
                </select>
              </label>
              
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <label style={{ flex: 1 }}>Priority
                  <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', marginTop: '0.5rem' }}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </label>
                
                <label style={{ flex: 1 }}>Status
                  <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', marginTop: '0.5rem' }}>
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </label>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <label style={{ flex: 1 }}>Start Date
                  <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
                </label>
                
                <label style={{ flex: 1 }}>Due Date
                  <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
                </label>
              </div>

              <button className="new-button" type="submit" disabled={isSubmitting || projects.length === 0}>
                {isSubmitting ? 'Saving...' : (editingTask ? 'Save changes' : 'Create task')} <Check size={16} />
              </button>
            </>
          )}
        </form>
      </div>
    )}
  </>
}

export default Tasks
