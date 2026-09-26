import { ArrowUpRight, CheckCircle2, Clock3, FolderKanban, MoreHorizontal, Calendar, AlertCircle } from 'lucide-react'
import { getGreeting, isTaskOverdue } from '../utils/date'
import { useAuth } from '../contexts/AuthContext'
import { calculateProjectProgress } from '../utils/projectProgress'

function Dashboard({ projectState, taskState }) {
  const { projects, loading: projectsLoading, error: projectsError } = projectState
  const { tasks, loading: tasksLoading, error: tasksError } = taskState
  const { user } = useAuth()

  if (projectsLoading || tasksLoading) return <div style={{ padding: '2rem' }}>Loading dashboard...</div>
  if (projectsError || tasksError) return <div style={{ padding: '2rem', color: 'red' }}>Error loading dashboard data</div>

  // Metrics calculations
  const totalProjects = projects.length
  const activeProjects = projects.filter(p => p.status !== 'Completed').length
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'Completed').length
  const pendingTasks = tasks.filter(t => t.status !== 'Completed').length
  
  const now = new Date()
  const overdueTasks = tasks.filter(isTaskOverdue).length
  
  // Upcoming deadlines (tasks due in next 7 days)
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const upcomingDeadlines = tasks.filter(t => t.status !== 'Completed' && t.dueDate && new Date(t.dueDate) >= now && new Date(t.dueDate) <= nextWeek).length

  // Overall progress
  const overallProgress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U'

  // Get upcoming tasks for the panel
  const upcomingTasksList = tasks
    .filter(t => t.status !== 'Completed')
    .sort((a, b) => new Date(a.dueDate || '2099-01-01') - new Date(b.dueDate || '2099-01-01'))
    .slice(0, 5)

  // Get recent projects for the panel
  const recentProjects = [...projects]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3)

  return <>
    <section className="welcome-row">
      <div>
        <p className="eyebrow">{now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <h1>{getGreeting()}, {user?.name ? user.name.split(' ')[0] : 'User'} <span className="wave">↗</span></h1>
        <p className="intro">Here is what is happening across your projects.</p>
      </div>
      <button className="date-button"><Clock3 size={16} /> This week</button>
    </section>
    
    <section className="metric-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
      <Metric icon={<FolderKanban />} label="Total projects" value={totalProjects} change={`${activeProjects} active`} />
      <Metric icon={<CheckCircle2 />} label="Tasks completed" value={completedTasks} change={`${totalTasks} total`} />
      <Metric icon={<Clock3 />} label="Pending tasks" value={pendingTasks} change={`${upcomingDeadlines} due soon`} />
      <Metric icon={<AlertCircle />} label="Overdue tasks" value={overdueTasks} change="Requires attention" muted={overdueTasks === 0} />
    </section>

    <section className="dashboard-grid">
      <div className="panel projects-panel">
        <div className="panel-heading">
          <div><p className="eyebrow">Your portfolio</p><h2>Projects</h2></div>
          <a href="/projects" className="text-link">View all <ArrowUpRight size={15} /></a>
        </div>
        <div className="project-list">
          {recentProjects.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No projects found.</p>
          ) : (
            recentProjects.map((project) => (
              <ProjectRow key={project._id} project={project} progress={calculateProjectProgress(tasks, project._id)} />
            ))
          )}
        </div>
      </div>
      
      <div className="panel tasks-panel">
        <div className="panel-heading">
          <div><p className="eyebrow">Keep moving</p><h2>Upcoming tasks</h2></div>
          <a href="/tasks" className="text-link">View all <ArrowUpRight size={15} /></a>
        </div>
        <div className="task-list">
          {upcomingTasksList.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No upcoming tasks.</p>
          ) : (
            upcomingTasksList.map((task) => {
              const project = projects.find(p => p._id === (task.project?._id || task.project))
              return (
                <div className="task-row" key={task._id}>
                  <span className={`task-check ${task.priority === 'High' ? 'coral' : 'teal'}`}></span>
                  <div className="task-copy">
                    <strong>{task.title}</strong>
                    <small>{project ? project.name : 'Unknown Project'}</small>
                  </div>
                  <span className="task-date">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</span>
                  <span className="avatar small-avatar">{getInitials(user?.name)}</span>
                </div>
              )
            })
          )}
        </div>
      </div>
    </section>

    <section className="focus-banner">
      <div>
        <span className="focus-kicker">Focus for today</span>
        <h2>Make progress visible.</h2>
        <p>{pendingTasks} tasks are pending. {upcomingDeadlines > 0 ? `${upcomingDeadlines} are due soon.` : 'You are right on schedule.'}</p>
      </div>
      <div className="focus-ring">
        <strong>{overallProgress}%</strong>
        <small>overall completion</small>
      </div>
    </section>
  </>
}

function Metric({ icon, label, value, change, muted }) { 
  return (
    <div className="metric">
      <span className="metric-icon">{icon}</span>
      <p>{label}</p>
      <strong>{value}</strong>
      <small className={muted ? 'muted' : ''}>{change}</small>
    </div>
  ) 
}

function ProjectRow({ project, progress }) { 
  const formattedDate = project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'
  return (
    <div className="project-row">
      <span className="project-dot" style={{ backgroundColor: '#0e7c78' }}></span>
      <div className="project-name">
        <strong>{project.name}</strong>
        <small>{project.description || 'No description'}</small>
      </div>
      <div className="progress-wrap">
        <div className="progress-label">
          <span>{progress}%</span>
          <span>{formattedDate}</span>
        </div>
        <div className="progress-bar">
          <span style={{ width: `${progress}%`, backgroundColor: '#0e7c78' }}></span>
        </div>
      </div>
      <button className="more-button" aria-label={`More options for ${project.name}`}><MoreHorizontal size={18} /></button>
    </div>
  ) 
}

export default Dashboard
