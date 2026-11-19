import { useState, useEffect } from 'react'
import { Users, CreditCard, ArrowUpDown, DollarSign, MoreVertical, Shield, UserX, UserCheck, Search } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import api from '../services/api'
import { useTheme } from '../context/ThemeContext'

export default function Admin() {
  const { isDark } = useTheme()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [dashboardRes, usersRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/users')
      ])
      setStats(dashboardRes.data)
      setUsers(usersRes.data.content || [])
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
      // Set mock data
      setStats({
        totalUsers: 567,
        activeUsers: 523,
        totalAccounts: 892,
        totalTransactions: 15420,
        totalVolume: 1250000,
        userGrowth: [
          { month: 'Jan', newUsers: 45, totalUsers: 245 },
          { month: 'Feb', newUsers: 52, totalUsers: 297 },
          { month: 'Mar', newUsers: 38, totalUsers: 335 },
          { month: 'Apr', newUsers: 65, totalUsers: 400 },
          { month: 'May', newUsers: 78, totalUsers: 478 },
          { month: 'Jun', newUsers: 89, totalUsers: 567 }
        ],
        transactionVolume: [
          { date: 'Mon', count: 125, volume: 45000 },
          { date: 'Tue', count: 189, volume: 67000 },
          { date: 'Wed', count: 156, volume: 52000 },
          { date: 'Thu', count: 203, volume: 78000 },
          { date: 'Fri', count: 178, volume: 61000 },
          { date: 'Sat', count: 95, volume: 32000 },
          { date: 'Sun', count: 67, volume: 24000 }
        ],
        recentActivities: [
          { action: 'User Registration', user: 'john@example.com', details: 'New user registered', timestamp: '2 minutes ago' },
          { action: 'Transaction', user: 'thomas@fundwise.com', details: 'Transfer of $500 completed', timestamp: '5 minutes ago' },
          { action: 'Login', user: 'admin@fundwise.com', details: 'Admin logged in', timestamp: '10 minutes ago' }
        ]
      })
      setUsers([
        { id: 1, email: 'thomas@fundwise.com', firstName: 'Thomas', lastName: 'Fletcher', role: 'USER', enabled: true },
        { id: 2, email: 'watson@example.com', firstName: 'Watson', lastName: 'User', role: 'USER', enabled: true },
        { id: 3, email: 'admin@fundwise.com', firstName: 'Admin', lastName: 'User', role: 'ADMIN', enabled: true },
        { id: 4, email: 'nathan@example.com', firstName: 'Nathan', lastName: 'User', role: 'USER', enabled: false }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`px-3 py-2 rounded-lg shadow-lg ${isDark ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-200'}`}>
          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{label}</p>
          {payload.map((item, index) => (
            <p key={index} className="text-sm" style={{ color: item.color }}>
              {item.name}: {item.name.includes('Volume') || item.dataKey === 'volume' ? formatCurrency(item.value) : item.value.toLocaleString()}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Admin Dashboard</h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>System overview and user management</p>
        </div>
        <div className="flex gap-2">
          {['dashboard', 'users', 'logs'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-emerald-500 text-white'
                  : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {tab === 'logs' ? 'Audit Logs' : tab === 'dashboard' ? 'Overview' : 'Users'}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-6">
            <div className={`rounded-2xl p-6 shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                  <Users className="text-blue-500" size={20} />
                </div>
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Users</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats?.totalUsers?.toLocaleString()}</p>
              <p className="text-sm text-emerald-500 mt-1">+12% from last month</p>
            </div>

            <div className={`rounded-2xl p-6 shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-emerald-900/30' : 'bg-emerald-100'}`}>
                  <CreditCard className="text-emerald-500" size={20} />
                </div>
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Accounts</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats?.totalAccounts?.toLocaleString()}</p>
              <p className="text-sm text-emerald-500 mt-1">+8% from last month</p>
            </div>

            <div className={`rounded-2xl p-6 shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
                  <ArrowUpDown className="text-purple-500" size={20} />
                </div>
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Transactions</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats?.totalTransactions?.toLocaleString()}</p>
              <p className="text-sm text-emerald-500 mt-1">+15% from last month</p>
            </div>

            <div className={`rounded-2xl p-6 shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDark ? 'bg-amber-900/30' : 'bg-amber-100'}`}>
                  <DollarSign className="text-amber-500" size={20} />
                </div>
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Volume</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(stats?.totalVolume || 0)}</p>
              <p className="text-sm text-emerald-500 mt-1">+22% from last month</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-2 gap-6">
            <div className={`rounded-2xl p-6 shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <h3 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>User Growth</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats?.userGrowth || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f0f0f0'} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="totalUsers" stroke="#22c55e" strokeWidth={2} dot={false} name="Total Users" />
                    <Line type="monotone" dataKey="newUsers" stroke="#3b82f6" strokeWidth={2} dot={false} name="New Users" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={`rounded-2xl p-6 shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <h3 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Transaction Volume</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.transactionVolume || []}>
                    <defs>
                      <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f0f0f0'} vertical={false} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }} tickFormatter={(v) => `$${v/1000}k`} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(55, 65, 81, 0.3)' : 'rgba(0, 0, 0, 0.05)' }} />
                    <Bar dataKey="volume" fill="url(#volumeGradient)" radius={[6, 6, 0, 0]} name="Volume" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className={`rounded-2xl p-6 shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Activity</h3>
            <div className="space-y-4">
              {(stats?.recentActivities || []).map((activity, index) => (
                <div key={index} className={`flex items-center justify-between py-3 border-b last:border-0 ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{activity.action}</p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{activity.user} - {activity.details}</p>
                  </div>
                  <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{activity.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search and filters */}
          <div className="flex items-center justify-between">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} size={18} />
              <input
                type="text"
                placeholder="Search users..."
                className={`pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isDark
                    ? 'bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500'
                    : 'border border-gray-200 text-gray-900'
                }`}
              />
            </div>
            <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
              + Add User
            </button>
          </div>

          <div className={`rounded-2xl shadow-sm overflow-hidden border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <table className="w-full">
              <thead className={isDark ? 'bg-gray-900/50' : 'bg-gray-50'}>
                <tr className={`text-left text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Email</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-100'}`}>
                {users.map((user) => (
                  <tr key={user.id} className={isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.firstName} {user.lastName}</span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'ADMIN'
                          ? isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700'
                          : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.enabled
                          ? isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                          : isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'
                      }`}>
                        {user.enabled ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          className={`p-2 rounded-lg transition-colors ${
                            isDark
                              ? 'text-gray-400 hover:text-purple-400 hover:bg-purple-900/30'
                              : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
                          }`}
                          title="Change Role"
                        >
                          <Shield size={18} />
                        </button>
                        <button
                          className={`p-2 rounded-lg transition-colors ${
                            user.enabled
                              ? isDark
                                ? 'text-gray-400 hover:text-red-400 hover:bg-red-900/30'
                                : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                              : isDark
                                ? 'text-gray-400 hover:text-emerald-400 hover:bg-emerald-900/30'
                                : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={user.enabled ? 'Disable User' : 'Enable User'}
                        >
                          {user.enabled ? <UserX size={18} /> : <UserCheck size={18} />}
                        </button>
                        <button
                          className={`p-2 rounded-lg transition-colors ${
                            isDark
                              ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className={`rounded-2xl p-6 shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Audit Logs</h3>
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} size={18} />
              <input
                type="text"
                placeholder="Search logs..."
                className={`pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isDark
                    ? 'bg-gray-700 border border-gray-600 text-gray-100 placeholder-gray-500'
                    : 'border border-gray-200 text-gray-900'
                }`}
              />
            </div>
          </div>
          <div className="space-y-3">
            {[
              { action: 'LOGIN', user: 'thomas@fundwise.com', ip: '192.168.1.1', time: '2023-11-11 10:30:00' },
              { action: 'TRANSFER', user: 'thomas@fundwise.com', ip: '192.168.1.1', time: '2023-11-11 10:25:00' },
              { action: 'LOGIN', user: 'admin@fundwise.com', ip: '10.0.0.1', time: '2023-11-11 09:00:00' },
              { action: 'USER_UPDATE', user: 'admin@fundwise.com', ip: '10.0.0.1', time: '2023-11-11 08:45:00' },
              { action: 'INVOICE_CREATE', user: 'watson@example.com', ip: '192.168.1.50', time: '2023-11-10 16:30:00' }
            ].map((log, index) => (
              <div key={index} className={`flex items-center justify-between p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    log.action === 'LOGIN'
                      ? isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
                      : log.action === 'TRANSFER'
                        ? isDark ? 'bg-emerald-900/30 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                        : isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {log.action}
                  </span>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>{log.user}</span>
                  <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>IP: {log.ip}</span>
                </div>
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
