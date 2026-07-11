import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Sidebar = () => {
  const { user, logout } = useAuth()

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/this-month', label: 'This Month', icon: '📊' },
    { path: '/history', label: 'History', icon: '🕐' },
  ]

  return (
    <div className="w-56 h-screen bg-white border-r border-gray-100 flex flex-col">

      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">₹</span>
        </div>
        <span className="font-bold text-gray-900">PaisaTrack</span>
      </div>

      {/* Nav items */}
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
                  : 'text-gray-600 hover:bg-gray-100'
              }`
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom — user info */}
      <div className="p-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 mb-3">
          Type naturally — "zepto 320", "onion 50". AI sorts it.
        </p>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-700 font-semibold text-sm">
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
  )
}

export default Sidebar