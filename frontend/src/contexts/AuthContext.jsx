import { createContext, useState, useEffect, useContext } from 'react'
import { getMe, login as apiLogin, register as apiRegister } from '../services/authService'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const data = await getMe()
          // /auth/me returns { user: {...} }
          const u = data.user || data
          setUser({ id: u.id || u._id, name: u.name, email: u.email })
        } catch (error) {
          console.error('Auth initialization failed', error)
          localStorage.removeItem('token')
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [])

  const login = async (email, password) => {
    // backend returns { user: { id, name, email, ... }, token }
    const data = await apiLogin(email, password)
    localStorage.setItem('token', data.token)
    const u = data.user || data
    setUser({ id: u.id || u._id, name: u.name, email: u.email })
  }

  const register = async (name, email, password) => {
    // backend returns { user: { id, name, email, ... }, token }
    const data = await apiRegister(name, email, password)
    localStorage.setItem('token', data.token)
    const u = data.user || data
    setUser({ id: u.id || u._id, name: u.name, email: u.email })
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
