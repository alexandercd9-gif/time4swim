'use client'

import { useState } from 'react'

export default function ModernLoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🔴 handleSubmit EJECUTADO')
    
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      })

      if (response.ok) {
        console.log('✅ Login exitoso')
        // REDIRECCIÓN DIRECTA AL DASHBOARD
        window.location.href = '/admin/dashboard'
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error en el login')
      }
    } catch (error) {
      console.log('🔴 ERROR en fetch', error)
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card shadow-lg border-0" style={{ width: '400px' }}>
      <div className="card-body p-4">
        <h2 className="card-title text-center mb-4">Iniciar Sesión</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-control"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          <button 
            type="submit" 
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}