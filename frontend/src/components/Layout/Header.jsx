import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Search, Bell, Plus, ArrowRight, X } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function Header() {
  const { user } = useSelector((state) => state.auth)
  const { isDark } = useTheme()
  const navigate = useNavigate()
  const [showCreateMenu, setShowCreateMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const notifications = [
    { id: 1, title: 'Transaction Completed', message: 'Transfer of $500 completed', time: '2 min ago', unread: true },
    { id: 2, title: 'Low Balance Alert', message: 'Your balance is below $1,000', time: '1 hour ago', unread: true },
    { id: 3, title: 'Invoice Paid', message: 'Invoice INV-2023-A1B2 paid', time: '3 hours ago', unread: false },
  ]

  const unreadCount = notifications.filter(n => n.unread).length

  return (
    <header className={`px-6 py-4 transition-colors duration-300 ${
      isDark ? 'bg-gray-800 border-b border-gray-700' : 'bg-white border-b border-gray-100'
    }`}>
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="relative w-96">
          <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search anything..."
            className={`w-full pl-11 pr-10 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
              isDark
                ? 'bg-gray-700/50 border border-gray-600 text-gray-100 placeholder-gray-400'
                : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 hover:border-gray-300'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors ${isDark ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'}`}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Create New Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowCreateMenu(!showCreateMenu)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isDark
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>Create New</span>
              <Plus size={16} />
            </button>
            {showCreateMenu && (
              <div className={`absolute right-0 top-full mt-2 w-48 rounded-lg shadow-lg py-2 z-50 ${
                isDark
                  ? 'bg-gray-800 border border-gray-700'
                  : 'bg-white border border-gray-100'
              }`}>
                <button
                  onClick={() => { navigate('/invoices'); setShowCreateMenu(false); }}
                  className={`w-full px-4 py-2 text-left ${
                    isDark
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  New Invoice
                </button>
                <button
                  onClick={() => { navigate('/payments'); setShowCreateMenu(false); }}
                  className={`w-full px-4 py-2 text-left ${
                    isDark
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  New Payment
                </button>
                <button
                  onClick={() => { navigate('/cards'); setShowCreateMenu(false); }}
                  className={`w-full px-4 py-2 text-left ${
                    isDark
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  New Card
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/payments')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              isDark
                ? 'text-gray-300 hover:bg-gray-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>Add Funds</span>
          </button>

          <button
            onClick={() => navigate('/payments')}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
          >
            <span>Move Money</span>
            <ArrowRight size={18} />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-2 rounded-lg transition-colors ${
                isDark
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            {showNotifications && (
              <div className={`absolute right-0 top-full mt-2 w-80 rounded-lg shadow-lg z-50 ${
                isDark
                  ? 'bg-gray-800 border border-gray-700'
                  : 'bg-white border border-gray-100'
              }`}>
                <div className={`p-4 flex items-center justify-between ${
                  isDark ? 'border-b border-gray-700' : 'border-b border-gray-100'
                }`}>
                  <h3 className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Notifications</h3>
                  <span className="text-xs text-emerald-500">{unreadCount} new</span>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 cursor-pointer ${
                        isDark
                          ? `border-b border-gray-700 hover:bg-gray-700 ${notif.unread ? 'bg-emerald-900/20' : ''}`
                          : `border-b border-gray-50 hover:bg-gray-50 ${notif.unread ? 'bg-emerald-50/50' : ''}`
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className={`font-medium text-sm ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{notif.title}</p>
                          <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{notif.message}</p>
                        </div>
                        {notif.unread && <span className="w-2 h-2 bg-emerald-500 rounded-full mt-1"></span>}
                      </div>
                      <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{notif.time}</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => { navigate('/notifications'); setShowNotifications(false); }}
                  className={`w-full p-3 text-center text-emerald-500 text-sm font-medium ${
                    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>

          {/* User Avatar */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer hover:bg-emerald-600 transition-colors">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(showCreateMenu || showNotifications) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setShowCreateMenu(false); setShowNotifications(false); }}
        />
      )}
    </header>
  )
}