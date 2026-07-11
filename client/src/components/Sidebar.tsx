import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.png'

const Sidebar = () => {
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/this-month', label: 'This Month', icon: '📊' },
    { path: '/history', label: 'History', icon: '🕐' },
  ]

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <div
        className="hidden lg:flex w-56 h-screen border-r border-green-100 flex-col flex-shrink-0"
        style={{ background: 'linear-gradient(160deg, #f0fdf4 0%, #ecfdf5 40%, #f0fdfa 100%)' }}
      >
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <img
            src={logo}
            alt="PaisaTrack"
            className="w-8 h-8 rounded-lg"
          />
          <span className="font-bold text-gray-900">PaisaTrack</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3">
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-green-600 text-white'
                    : 'text-gray-600 hover:bg-green-100'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-green-100">
          <p className="text-xs text-gray-400 mb-3">
            Type naturally — "zepto 320", "onion 50". AI sorts it.
          </p>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full text-left text-xs text-red-500 hover:text-red-600 font-medium"
          >
            Log out
          </button>
        </div>
      </div>

      {/* ── Mobile Bottom Nav ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 flex items-center justify-around px-4 py-2 shadow-lg">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
                isActive ? 'text-green-600' : 'text-gray-400'
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
        <button
          onClick={logout}
          className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl text-red-400"
        >
          <span className="text-xl">🚪</span>
          <span className="text-xs font-medium">Logout</span>
        </button>
      </div>
    </>
  )
}

export default Sidebar