import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppShell from './components/AppShell'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import Tasks from './pages/Tasks'
import Login from './pages/Login'
import Register from './pages/Register'
import { useProjects } from './hooks/useProjects'
import { useTasks } from './hooks/useTasks'
import './App.css'

function AuthenticatedRoutes() {
  const projectState = useProjects()
  const taskState = useTasks()
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <AppShell searchQuery={searchQuery} setSearchQuery={setSearchQuery}>
      <Routes>
        <Route path="/" element={<Dashboard projectState={projectState} taskState={taskState} searchQuery={searchQuery} />} />
        <Route path="/projects" element={<Projects projectState={projectState} taskState={taskState} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />} />
        <Route path="/tasks" element={<Tasks projectState={projectState} taskState={taskState} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />} />
      </Routes>
    </AppShell>
  )
}

function App() {
  return (
    <BrowserRouter basename="/codsoft_tasks">
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/*" element={<AuthenticatedRoutes />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
