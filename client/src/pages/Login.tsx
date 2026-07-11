import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import * as authAPI from '../api/auth'

const Login = () => {

  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()

  const handleSubmit = async () => {
    try {
      setError('')
      setLoading(true)

      let data

      if (isRegister) {
        if (!name || !email || !password) {
          setError('All fields are required')
          return
        }
        data = await authAPI.register(name, email, password)
      } else {
        if (!email || !password) {
          setError('Email and password are required')
          return
        }
        data = await authAPI.login(email, password)
      }

      login(data.token, data.user)

    } catch (err: any) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* Left side — branding */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-green-400 via-teal-500 to-blue-500 p-12 flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <span className="text-green-600 font-bold text-lg">₹</span>
          </div>
          <span className="text-white font-bold text-xl">PaisaTrack</span>
        </div>

        <div>
          <h1 className="text-white text-4xl font-bold leading-tight mb-4">
            Track every rupee,<br />without the friction.
          </h1>
          <p className="text-white/80 text-lg mb-8">
            Type it like you'd say it — "zepto 320", "onion 50" — and let AI sort the rest.
          </p>

          {/* Example expenses */}
          <div className="space-y-3">
            {[
              { label: 'Zepto order', amount: '₹320', color: 'bg-white/20' },
              { label: 'Auto to office', amount: '₹80', color: 'bg-white/20' },
              { label: 'Movie tickets', amount: '₹700', color: 'bg-white/20' },
            ].map((item, i) => (
              <div key={i} className={`${item.color} rounded-xl px-4 py-3 flex justify-between items-center`}>
                <span className="text-white">{item.label}</span>
                <span className="text-white font-semibold">{item.amount}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/60 text-sm">Private by design · Your data stays secure.</p>
      </div>

      {/* Right side — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {isRegister ? 'Create account' : 'Welcome back'}
          </h2>
          <p className="text-gray-500 mb-8">
            {isRegister ? 'Start tracking your expenses today.' : 'Sign in to pick up where you left off.'}
          </p>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {loading ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in'}
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}
            {' '}
            <button
              onClick={() => {
                setIsRegister(!isRegister)
                setError('')
              }}
              className="text-green-600 font-medium hover:underline"
            >
              {isRegister ? 'Sign in' : 'Create one'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login