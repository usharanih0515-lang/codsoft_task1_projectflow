import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()

    console.log('LOGIN FORM SUBMITTED')

    setError('')
    setIsLoading(true)

    try {
      await login(email, password)

      console.log('LOGIN SUCCESS')

      navigate('/')
    } catch (err) {
      console.error('LOGIN ERROR:', err)

      setError(
        err.response?.data?.message ||
        'Failed to login. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="auth-container"
      style={{
        maxWidth: '400px',
        margin: '4rem auto',
        padding: '0 1rem'
      }}
    >
      <section
        className="welcome-row"
        style={{
          flexDirection: 'column',
          alignItems: 'flex-start',
          marginBottom: '2rem'
        }}
      >
        <div>
          <p className="eyebrow">Welcome back</p>
          <h1>Log in to ProjectFlow</h1>
        </div>
      </section>

      <form
        className="modal"
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '100%'
        }}
        onSubmit={handleSubmit}
        autoComplete="on"
      >
        {error && (
          <div
            className="error-message"
            style={{
              color: 'var(--risk)',
              marginBottom: '1rem',
              fontSize: '14px'
            }}
          >
            {error}
          </div>
        )}

        <label htmlFor="email">
          Email
          <input
            id="email"
            name="email"
            type="email"
            required
            autoFocus
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
          />
        </label>

        <label htmlFor="password">
          Password
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </label>

        <button
          className="new-button"
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            justifyContent: 'center'
          }}
        >
          {isLoading ? 'Logging in...' : 'Log in'}
          <ArrowUpRight size={16} />
        </button>

        <p
          style={{
            marginTop: '1.5rem',
            textAlign: 'center',
            fontSize: '14px',
            color: 'var(--text-secondary)'
          }}
        >
          Don't have an account?{' '}
          <Link to="/register" className="text-link">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  )
}

export default Login