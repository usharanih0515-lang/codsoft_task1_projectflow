import { useEffect, useState } from 'react'
import { ArrowUpRight, CalendarDays, Plus, X, Trash2, Edit2, Users } from 'lucide-react'
import ManageMembersModal from '../components/ManageMembersModal'
import { calculateProjectProgress } from '../utils/projectProgress'

function Projects({ projectState, taskState, searchQuery = '', setSearchQuery }) {
  const { projects, loading, error, addProject, updateProject, deleteProject } = projectState
  const { tasks, refetch: refetchTasks } = taskState
  
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  
  const [showMembersModal, setShowMembersModal] = useState(false)
  const [managingProject, setManagingProject] = useState(null)
  
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [status, setStatus] = useState('Planning')
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    if (refetchTasks) {
      refetchTasks()
    }
  }, [refetchTasks])

  const openNewForm = () => {
    setEditingProject(null)
    setName('')
    setDescription('')
    setDeadline('')
    setStatus('Planning')
    setSubmitError('')
    setShowForm(true)
  }

  const openEditForm = (project) => {
    setEditingProject(project)
    setName(project.name)
    setDescription(project.description || '')
    setDeadline(project.deadline ? project.deadline.substring(0, 10) : '')
    setStatus(project.status || 'Planning')
    setSubmitError('')
    setShowForm(true)
  }

  const openMembersModal = (project) => {
    setManagingProject(project)
    setShowMembersModal(true)
  }

  const handleUpdateProjectMembers = async (projectId, data) => {
    const updated = await updateProject(projectId, data)
    setManagingProject(updated)
    return updated
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id)
        if (managingProject && managingProject._id === id) {
          setShowMembersModal(false)
          setManagingProject(null)
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete project')
      }
    }
  }

  async function submit(event) {
    event.preventDefault()
    if (!name.trim()) return
    
    setIsSubmitting(true)
    setSubmitError('')
    
    try {
      const projectData = {
        name: name.trim(),
        description: description.trim(),
        status,
        deadline: deadline || undefined
      }
      
      if (editingProject) {
        await updateProject(editingProject._id, projectData)
      } else {
        await addProject(projectData)
      }
      setShowForm(false)
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusClass = (status) => {
    if (status === 'Completed') return 'status'
    if (status === 'Planning') return 'status risk'
    return 'status'
  }

  const filteredProjects = projects.filter(project => {
    if (!searchQuery || !searchQuery.trim()) return true
    const q = searchQuery.toLowerCase().trim()
    return (
      project.name?.toLowerCase().includes(q) ||
      project.description?.toLowerCase().includes(q) ||
      project.status?.toLowerCase().includes(q)
    )
  })

  if (loading) return <div style={{ padding: '2rem' }}>Loading projects...</div>
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>{error}</div>

  return <>
    <section className="welcome-row">
      <div>
        <p className="eyebrow">Workspace / Projects</p>
        <h1>All projects</h1>
        <p className="intro">A clear view of everything your team is building.</p>
      </div>
      <button className="new-button" onClick={openNewForm}><Plus size={17} />New project</button>
    </section>
    
    {searchQuery && (
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--muted)', fontSize: '13px' }}>
        <span>Showing results for <strong>"{searchQuery}"</strong> ({filteredProjects.length} found)</span>
        <button onClick={() => setSearchQuery && setSearchQuery('')} style={{ background: 'none', border: 'none', color: 'var(--teal)', cursor: 'pointer', fontWeight: '600' }}>Clear search</button>
      </div>
    )}

    {filteredProjects.length === 0 ? (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
        <p>{searchQuery ? `No projects match "${searchQuery}".` : 'No projects yet. Create one to get started!'}</p>
      </div>
    ) : (
      <div className="project-cards">
        {filteredProjects.map((project) => {
          const progress = calculateProjectProgress(tasks, project._id)
          const formattedDate = project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'
          
          return (
            <article className="project-card" key={project._id}>
              <div className="card-top">
                <span className="project-dot" style={{ backgroundColor: '#0e7c78' }}></span>
                <span className={getStatusClass(project.status)}>{project.status}</span>
                <div className="card-actions">
                  <button 
                    onClick={() => openMembersModal(project)} 
                    className="btn-manage-members" 
                    title="Manage project members"
                  >
                    <Users size={14} />
                    <span>Members</span>
                  </button>
                  <button 
                    onClick={() => openEditForm(project)} 
                    className="icon-button" 
                    title="Edit project"
                    aria-label="Edit project"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button 
                    onClick={() => handleDelete(project._id)} 
                    className="icon-button-delete" 
                    title="Delete project"
                    aria-label="Delete project"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <h2>{project.name}</h2>
              <p>{project.description || 'No description'}</p>
              <div className="card-progress">
                <div className="progress-label"><span>Progress</span><strong>{progress}%</strong></div>
                <div className="progress-bar"><span style={{ width: `${progress}%`, backgroundColor: '#0e7c78', transition: 'width 0.3s ease' }}></span></div>
              </div>
              <footer>
                <span><CalendarDays size={15} />Due {formattedDate}</span>
                <a href={`/projects/${project._id}`} aria-label={`Open ${project.name}`} onClick={(e) => e.preventDefault()}><ArrowUpRight size={18} /></a>
              </footer>
            </article>
          )
        })}
      </div>
    )}
    
    {showForm && (
      <div className="modal-backdrop" role="presentation">
        <form className="modal" onSubmit={submit}>
          <button type="button" className="modal-close" onClick={() => setShowForm(false)} aria-label="Close"><X size={19} /></button>
          <p className="eyebrow">{editingProject ? 'Edit project' : 'New project'}</p>
          <h2>{editingProject ? 'Update details.' : 'Start something clear.'}</h2>
          
          {submitError && <div className="error-message" style={{ color: 'var(--risk)', marginBottom: '1rem', fontSize: '14px' }}>{submitError}</div>}
          
          <label>Project name
            <input required autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Website Redesign" />
          </label>
          <label>Description (Client or team)
            <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="e.g. Northstar Studio" />
          </label>
          <label>Deadline
            <input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} />
          </label>
          
          <label>Status
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', marginTop: '0.5rem' }}>
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </label>

          <button className="new-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : (editingProject ? 'Save changes' : 'Create project')} <ArrowUpRight size={16} />
          </button>
        </form>
      </div>
    )}

    <ManageMembersModal
      project={managingProject}
      isOpen={showMembersModal}
      onClose={() => setShowMembersModal(false)}
      onUpdateProject={handleUpdateProjectMembers}
    />
  </>
}

export default Projects
