import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { register } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      await register(name, email, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-container" style={{ maxWidth: '400px', margin: '4rem auto', padding: '0 1rem' }}>
      <section className="welcome-row" style={{ flexDirection: 'column', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <p className="eyebrow">Get started</p>
          <h1>Create an account</h1>
        </div>
      </section>

      <form className="modal" style={{ position: 'relative', width: '100%', maxWidth: '100%' }} onSubmit={handleSubmit}>
        {error && <div className="error-message" style={{ color: 'var(--risk)', marginBottom: '1rem', fontSize: '14px' }}>{error}</div>}
        
        <label>
          Full Name
          <input
            type="text"
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jordan Doe"
          />
        </label>
        <label>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </label>

        <button className="new-button" type="submit" disabled={isLoading} style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
          {isLoading ? 'Creating account...' : 'Sign up'} <ArrowUpRight size={16} />
        </button>

        <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" className="text-link">Log in</Link>
        </p>
      </form>
    </div>
  )
}

export default Register
