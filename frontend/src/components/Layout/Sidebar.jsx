import { NavLink } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logout } from '../../store/authSlice'
import {
  LayoutDashboard,
  CreditCard,
  Wallet,
  FileText,
  BarChart3,
  Bell,
  Shield,
  AlertTriangle,
  HelpCircle,
  MessageSquare,
  Settings,
  LogOut,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Wallet, label: 'Payments', path: '/payments' },
  { icon: CreditCard, label: 'Cards', path: '/cards' },
  { icon: FileText, label: 'Invoices', path: '/invoices' },
  { icon: BarChart3, label: 'Insights', path: '/insights' },
  { icon: Bell, label: 'Notifications', path: '/notifications' },
]

const adminItems = [
  { icon: Shield, label: 'Admin', path: '/admin' },
  { icon: AlertTriangle, label: 'Compliance', path: '/compliance' },
]

const supportItems = [
  { icon: HelpCircle, label: 'Help', path: '/help' },
  { icon: MessageSquare, label: 'Feedback', path: '/feedback' },
]

export default function Sidebar({ collapsed = false, onToggle }) {
  const dispatch = useDispatch()
  const { isDark, setLightMode, setDarkMode } = useTheme()

  const handleLogout = () => {
    dispatch(logout())
  }

  return (
    <aside className={`bg-slate-900 text-white flex flex-col transition-all duration-300 border-r border-slate-700 ${collapsed ? 'w-20' : 'w-64'}`}>
      {/* Logo & Toggle */}
      <div className={`p-4 flex ${collapsed ? 'flex-col items-center gap-3' : 'items-center justify-between'}`}>
        {!collapsed && <h1 className="text-2xl font-bold text-white">Fundwise</h1>}
        {collapsed && (
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">F</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-lg text-gray-400 hover:bg-slate-800 hover:text-white transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* General Menu */}
      <nav className="flex-1 px-3 overflow-y-auto">
        {!collapsed && <p className="text-xs text-gray-500 uppercase tracking-wider mb-4 px-1">General</p>}
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-emerald-500 text-white'
                      : 'text-gray-400 hover:bg-slate-800 hover:text-white'
                  }`
                }
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={20} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Admin Menu */}
        {!collapsed && <p className="text-xs text-gray-500 uppercase tracking-wider mt-8 mb-4 px-1">Admin</p>}
        {collapsed && <div className="mt-6 mb-2 border-t border-slate-700"></div>}
        <ul className="space-y-1">
          {adminItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-emerald-500 text-white'
                      : 'text-gray-400 hover:bg-slate-800 hover:text-white'
                  }`
                }
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={20} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Support Menu */}
        {!collapsed && <p className="text-xs text-gray-500 uppercase tracking-wider mt-8 mb-4 px-1">Support</p>}
        {collapsed && <div className="mt-6 mb-2 border-t border-slate-700"></div>}
        <ul className="space-y-1">
          {supportItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-3 rounded-lg text-gray-400 hover:bg-slate-800 hover:text-white transition-colors`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={20} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-slate-800">
        <NavLink
          to="/settings"
          className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-3 rounded-lg text-gray-400 hover:bg-slate-800 hover:text-white transition-colors w-full`}
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings size={20} />
          {!collapsed && <span>Settings</span>}
        </NavLink>
        <button
          onClick={handleLogout}
          className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} px-3 py-3 rounded-lg text-gray-400 hover:bg-slate-800 hover:text-white transition-colors w-full`}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>

        {/* Theme Toggle */}
        {!collapsed ? (
          <div className="flex items-center gap-2 mt-4 bg-slate-800 rounded-full p-1">
            <button
              onClick={setLightMode}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full transition-colors ${
                !isDark ? 'bg-white text-slate-900' : 'text-gray-400'
              }`}
            >
              <Sun size={16} />
              <span className="text-sm">Light</span>
            </button>
            <button
              onClick={setDarkMode}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full transition-colors ${
                isDark ? 'bg-slate-700 text-white' : 'text-gray-400'
              }`}
            >
              <Moon size={16} />
              <span className="text-sm">Dark</span>
            </button>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-2">
            <button
              onClick={isDark ? setLightMode : setDarkMode}
              className="p-3 rounded-lg bg-slate-800 text-gray-400 hover:text-white transition-colors flex items-center justify-center"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
