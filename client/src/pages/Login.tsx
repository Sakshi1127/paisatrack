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
  const [showPassword, setShowPassword] = useState(false)

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

      {/* ── Left side — branding (desktop only) ── */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-green-400 via-teal-500 to-blue-500 p-12 flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
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

          <div className="space-y-3">
            {[
              { label: 'Zepto order', amount: '₹320' },
              { label: 'Auto to office', amount: '₹80' },
              { label: 'Movie tickets', amount: '₹700' },
            ].map((item, i) => (
              <div key={i} className="bg-white/20 rounded-xl px-4 py-3 flex justify-between items-center">
                <span className="text-white">{item.label}</span>
                <span className="text-white font-semibold">{item.amount}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/60 text-sm">Private by design · Your data stays secure.</p>
      </div>

      {/* ── Right side — form ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-8"
        style={{ background: 'linear-gradient(160deg, #f0fdf4 0%, #ffffff 50%, #f0fdfa 100%)' }}
      >
        <div className="w-full max-w-md">

          {/* Mobile branding — only on small screens */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-teal-600 rounded-3xl flex items-center justify-center mb-4 shadow-lg">
              <span className="text-white font-bold text-4xl">₹</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">PaisaTrack</h1>
            <p className="text-sm text-gray-400 mt-1 text-center">
              Track every rupee, without the friction.
            </p>
          </div>

          {/* Form heading */}
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {isRegister ? 'Create account' : 'Welcome back'}
          </h2>
          <p className="text-gray-500 mb-6 text-sm">
            {isRegister ? 'Start tracking your expenses today.' : 'Sign in to pick up where you left off.'}
          </p>

          {/* Error */}
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              />
            </div>

         <div>
  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
  <div className="relative">
    <input
      type={showPassword ? 'text' : 'password'}
      placeholder="••••••••"
      value={password}
      onChange={e => setPassword(e.target.value)}
      onKeyDown={e => e.key === 'Enter' && handleSubmit()}
      className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
    />
    <button
      type="button"
      onClick={() => setShowPassword(s => !s)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
    >
      {!showPassword ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </button>
  </div>
</div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-all shadow-sm"
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