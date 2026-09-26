import { NavLink, useNavigate } from 'react-router-dom'
import { CheckSquare, FolderKanban, LayoutDashboard, Plus, Search, Bell, LogOut, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const navigation = [
  { to: '/', label: 'Overview', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
]

function AppShell({ children, searchQuery = '', setSearchQuery }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Get initials
  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U'

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">P</span><span>ProjectFlow</span></div>
        <p className="nav-label">Workspace</p>
        <nav className="main-nav" aria-label="Main navigation">
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'} end={to === '/'}>
              <Icon size={18} strokeWidth={1.8} />{label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="user-chip">
            <span className="avatar">{initials}</span>
            <span><strong>{user?.name || 'User'}</strong><small>Team Member</small></span>
            <button className="icon-button" onClick={handleLogout} aria-label="Logout" style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div className="search">
            <Search size={18} />
            <input 
              aria-label="Search" 
              placeholder="Search projects or tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery && setSearchQuery('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'var(--muted)', display: 'flex' }}
                title="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>
          <div className="topbar-actions">
            <button className="icon-button" aria-label="Notifications" title="Notifications"><Bell size={19} /></button>
            <button className="new-button" onClick={() => navigate('/projects')}><Plus size={17} />New project</button>
          </div>
        </header>
        <div className="page-content">{children}</div>
      </main>
    </div>
  )
}

export default AppShell
