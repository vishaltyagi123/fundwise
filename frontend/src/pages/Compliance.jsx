import { useState, useEffect } from 'react'
import {
  AlertTriangle, Shield, FileSearch, Users, TrendingUp,
  CheckCircle, XCircle, Clock,
  Search, MoreVertical, Eye, FileText
} from 'lucide-react'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import api from '../services/api'
import { useTheme } from '../context/ThemeContext'

const SEVERITY_COLORS = {
  CRITICAL: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
  HIGH: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', dot: 'bg-orange-500' },
  MEDIUM: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', dot: 'bg-yellow-500' },
  LOW: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' }
}

const STATUS_COLORS = {
  OPEN: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
  UNDER_REVIEW: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
  ESCALATED: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400' },
  RESOLVED: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
  FALSE_POSITIVE: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300' }
}

const PIE_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#6b7280']

export default function Compliance() {
  const { isDark } = useTheme()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [dashboard, setDashboard] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [cases, setCases] = useState([])
  const [rules, setRules] = useState([])
  const [watchlist, setWatchlist] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      if (activeTab === 'dashboard') {
        const res = await api.get('/compliance/dashboard')
        setDashboard(res.data)
      } else if (activeTab === 'alerts') {
        const res = await api.get('/compliance/alerts')
        setAlerts(res.data.content || [])
      } else if (activeTab === 'cases') {
        const res = await api.get('/compliance/cases')
        setCases(res.data.content || [])
      } else if (activeTab === 'rules') {
        const res = await api.get('/compliance/rules')
        setRules(res.data || [])
      } else if (activeTab === 'watchlist') {
        const res = await api.get('/compliance/watchlist')
        setWatchlist(res.data.content || [])
      }
    } catch (error) {
      console.error('Failed to fetch compliance data:', error)
      // Mock data for demo
      setDashboard({
        openAlerts: 23,
        underReviewAlerts: 12,
        escalatedAlerts: 5,
        resolvedToday: 18,
        totalAlerts: 40,
        openCases: 8,
        investigatingCases: 15,
        highRiskAlerts: 14,
        criticalAlerts: 6,
        activeRules: 9,
        watchlistStats: { totalEntries: 156, byType: [] },
        alertTrend: [
          { date: '2023-11-05', count: 12 },
          { date: '2023-11-06', count: 18 },
          { date: '2023-11-07', count: 15 },
          { date: '2023-11-08', count: 22 },
          { date: '2023-11-09', count: 19 },
          { date: '2023-11-10', count: 14 },
          { date: '2023-11-11', count: 23 }
        ],
        alertsByType: [
          { type: 'THRESHOLD_BREACH', count: 35 },
          { type: 'STRUCTURING', count: 18 },
          { type: 'VELOCITY', count: 12 },
          { type: 'WATCHLIST_MATCH', count: 8 },
          { type: 'HIGH_RISK_JURISDICTION', count: 5 }
        ]
      })
      setAlerts([
        { id: 1, alertNumber: 'ALT-001', alertType: 'THRESHOLD_BREACH', severity: 'HIGH', status: 'OPEN', description: 'Transaction amount $52,000 exceeds threshold of $50,000', riskScore: 85, createdAt: '2023-11-11T10:30:00', user: { firstName: 'Thomas', lastName: 'Fletcher', email: 'thomas@fundwise.com' } },
        { id: 2, alertNumber: 'ALT-002', alertType: 'STRUCTURING', severity: 'CRITICAL', status: 'UNDER_REVIEW', description: 'Potential structuring detected: 5 transactions totaling $47,500 within 24 hours', riskScore: 92, createdAt: '2023-11-11T09:15:00', user: { firstName: 'Watson', lastName: 'User', email: 'watson@example.com' } },
        { id: 3, alertNumber: 'ALT-003', alertType: 'WATCHLIST_MATCH', severity: 'CRITICAL', status: 'ESCALATED', description: 'Potential watchlist match (87% confidence): Viktor P matches Viktor Petrov (OFAC_SDN)', riskScore: 95, createdAt: '2023-11-10T16:45:00', user: { firstName: 'Viktor', lastName: 'P', email: 'viktor@example.com' } },
        { id: 4, alertNumber: 'ALT-004', alertType: 'VELOCITY', severity: 'MEDIUM', status: 'OPEN', description: 'Unusual transaction velocity: 12 transactions within 24 hours (limit: 10)', riskScore: 65, createdAt: '2023-11-10T14:20:00', user: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' } },
        { id: 5, alertNumber: 'ALT-005', alertType: 'HIGH_RISK_JURISDICTION', severity: 'HIGH', status: 'RESOLVED', description: 'Transaction involves high-risk jurisdiction: IR', riskScore: 78, createdAt: '2023-11-09T11:00:00', user: { firstName: 'Ali', lastName: 'Hassan', email: 'ali@example.com' } }
      ])
      setCases([
        { id: 1, caseNumber: 'CASE-001', title: 'Suspected Structuring Activity', status: 'INVESTIGATING', priority: 'HIGH', user: { firstName: 'Watson', lastName: 'User' }, createdAt: '2023-11-10T10:00:00' },
        { id: 2, caseNumber: 'CASE-002', title: 'Watchlist Match Investigation', status: 'OPEN', priority: 'CRITICAL', user: { firstName: 'Viktor', lastName: 'P' }, createdAt: '2023-11-11T09:00:00' }
      ])
      setRules([
        { id: 1, ruleCode: 'CTR_10K', ruleName: 'Currency Transaction Report', type: 'THRESHOLD_BREACH', category: 'AML', severity: 'MEDIUM', enabled: true },
        { id: 2, ruleCode: 'HIGH_VALUE_50K', ruleName: 'High Value Transaction', type: 'THRESHOLD_BREACH', category: 'AML', severity: 'HIGH', enabled: true },
        { id: 3, ruleCode: 'STRUCTURING_9K', ruleName: 'Structuring Detection', type: 'STRUCTURING', category: 'AML', severity: 'HIGH', enabled: true },
        { id: 4, ruleCode: 'HIGH_VELOCITY_DAY', ruleName: 'Daily Transaction Velocity', type: 'VELOCITY', category: 'FRAUD', severity: 'MEDIUM', enabled: true },
        { id: 5, ruleCode: 'SANCTIONS_COUNTRY', ruleName: 'Sanctioned Country Detection', type: 'HIGH_RISK_JURISDICTION', category: 'SANCTIONS', severity: 'CRITICAL', enabled: true },
        { id: 6, ruleCode: 'WATCHLIST_MATCH', ruleName: 'Watchlist Match Detection', type: 'WATCHLIST_MATCH', category: 'SANCTIONS', severity: 'CRITICAL', enabled: true }
      ])
      setWatchlist([
        { id: 1, entryId: 'OFAC-001', fullName: 'Viktor Petrov', type: 'OFAC_SDN', entityType: 'INDIVIDUAL', country: 'RU', active: true },
        { id: 2, entryId: 'OFAC-002', fullName: 'Global Trade Finance Ltd', type: 'OFAC_SDN', entityType: 'ORGANIZATION', country: 'IR', active: true },
        { id: 3, entryId: 'PEP-001', fullName: 'Carlos Rodriguez', type: 'PEP', entityType: 'INDIVIDUAL', country: 'VE', active: true },
        { id: 4, entryId: 'UN-001', fullName: 'Al-Qaeda Network', type: 'UN_SANCTIONS', entityType: 'ORGANIZATION', active: true }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const toggleRule = async (ruleId) => {
    try {
      await api.post(`/compliance/rules/${ruleId}/toggle`)
      setRules(rules.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    } catch (error) {
      setRules(rules.map(r => r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    }
  }

  const updateAlertStatus = async (alertId, status) => {
    try {
      await api.put(`/compliance/alerts/${alertId}/status`, { status })
      setAlerts(alerts.map(a => a.id === alertId ? { ...a, status } : a))
    } catch (error) {
      setAlerts(alerts.map(a => a.id === alertId ? { ...a, status } : a))
    }
  }

  const filteredAlerts = filterStatus === 'all'
    ? alerts
    : alerts.filter(a => a.status === filterStatus)

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
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Transaction Monitoring</h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>AML/KYC Compliance & Risk Management</p>
        </div>
        <div className="flex gap-2">
          {['dashboard', 'alerts', 'cases', 'rules', 'watchlist'].map((tab) => (
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
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && dashboard && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-5 gap-4">
            <div className={`rounded-xl p-5 shadow-sm border-l-4 border-red-500 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Open Alerts</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{dashboard.openAlerts}</p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-red-900/30' : 'bg-red-100'}`}>
                  <AlertTriangle className="text-red-500" size={24} />
                </div>
              </div>
            </div>

            <div className={`rounded-xl p-5 shadow-sm border-l-4 border-yellow-500 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Under Review</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{dashboard.underReviewAlerts}</p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-yellow-900/30' : 'bg-yellow-100'}`}>
                  <Clock className="text-yellow-500" size={24} />
                </div>
              </div>
            </div>

            <div className={`rounded-xl p-5 shadow-sm border-l-4 border-purple-500 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Escalated</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{dashboard.escalatedAlerts}</p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
                  <TrendingUp className="text-purple-500" size={24} />
                </div>
              </div>
            </div>

            <div className={`rounded-xl p-5 shadow-sm border-l-4 border-green-500 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Resolved Today</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{dashboard.resolvedToday}</p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-green-900/30' : 'bg-green-100'}`}>
                  <CheckCircle className="text-green-500" size={24} />
                </div>
              </div>
            </div>

            <div className={`rounded-xl p-5 shadow-sm border-l-4 border-blue-500 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Active Rules</p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{dashboard.activeRules}</p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDark ? 'bg-blue-900/30' : 'bg-blue-100'}`}>
                  <Shield className="text-blue-500" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-3 gap-6">
            {/* Alert Trend */}
            <div className={`col-span-2 rounded-xl p-6 shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Alert Trend (Last 7 Days)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboard.alertTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f0f0f0'} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }} />
                    <Tooltip contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#fff', border: isDark ? '1px solid #374151' : '1px solid #e5e7eb', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="count" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444' }} name="Alerts" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Alerts by Type */}
            <div className={`rounded-xl p-6 shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Alerts by Type</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboard.alertsByType}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="count"
                      nameKey="type"
                      label={({ count }) => `${count}`}
                    >
                      {dashboard.alertsByType.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: isDark ? '#1f2937' : '#fff', border: isDark ? '1px solid #374151' : '1px solid #e5e7eb', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 space-y-1">
                {dashboard.alertsByType.slice(0, 4).map((item, index) => (
                  <div key={item.type} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[index] }}></span>
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{item.type.replace('_', ' ')}</span>
                    </div>
                    <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Risk Summary */}
          <div className="grid grid-cols-2 gap-6">
            <div className={`rounded-xl p-6 shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Risk Level Distribution</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Critical Risk</span>
                  </div>
                  <span className="font-bold text-red-500">{dashboard.criticalAlerts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>High Risk</span>
                  </div>
                  <span className="font-bold text-orange-500">{dashboard.highRiskAlerts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Open Cases</span>
                  </div>
                  <span className="font-bold text-blue-500">{dashboard.openCases}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Investigating</span>
                  </div>
                  <span className="font-bold text-purple-500">{dashboard.investigatingCases}</span>
                </div>
              </div>
            </div>

            <div className={`rounded-xl p-6 shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Watchlist Coverage</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Total Watchlist Entries</span>
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{dashboard.watchlistStats?.totalEntries || 0}</span>
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Includes OFAC SDN, UN Sanctions, EU Sanctions, UK Sanctions, and PEP lists
                </div>
                <button className="w-full mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
                  Run Full Screening
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {['all', 'OPEN', 'UNDER_REVIEW', 'ESCALATED', 'RESOLVED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === status
                      ? 'bg-emerald-500 text-white'
                      : isDark
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {status === 'all' ? 'All' : status.replace('_', ' ')}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} size={18} />
                <input
                  type="text"
                  placeholder="Search alerts..."
                  className={`pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDark
                      ? 'bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500'
                      : 'border border-gray-200 text-gray-900'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Alerts Table */}
          <div className={`rounded-xl shadow-sm overflow-hidden border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <table className="w-full">
              <thead className={isDark ? 'bg-gray-900/50' : 'bg-gray-50'}>
                <tr className={`text-left text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <th className="px-4 py-3 font-medium">Alert ID</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Severity</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Risk Score</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-100'}`}>
                {filteredAlerts.map((alert) => (
                  <tr key={alert.id} className={isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                    <td className="px-4 py-3">
                      <span className={`font-mono text-sm ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{alert.alertNumber}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{alert.alertType.replace('_', ' ')}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${isDark ? SEVERITY_COLORS[alert.severity]?.bg.split(' ')[1] : SEVERITY_COLORS[alert.severity]?.bg.split(' ')[0]} ${isDark ? SEVERITY_COLORS[alert.severity]?.text.split(' ')[1] : SEVERITY_COLORS[alert.severity]?.text.split(' ')[0]}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${SEVERITY_COLORS[alert.severity]?.dot}`}></span>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{alert.user?.firstName} {alert.user?.lastName}</p>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>{alert.user?.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-16 rounded-full h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          <div
                            className={`h-2 rounded-full ${alert.riskScore >= 80 ? 'bg-red-500' : alert.riskScore >= 60 ? 'bg-orange-500' : 'bg-yellow-500'}`}
                            style={{ width: `${alert.riskScore}%` }}
                          ></div>
                        </div>
                        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>{alert.riskScore}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${isDark ? STATUS_COLORS[alert.status]?.bg.split(' ')[1] : STATUS_COLORS[alert.status]?.bg.split(' ')[0]} ${isDark ? STATUS_COLORS[alert.status]?.text.split(' ')[1] : STATUS_COLORS[alert.status]?.text.split(' ')[0]}`}>
                        {alert.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(alert.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          className={`p-1.5 rounded transition-colors ${isDark ? 'text-gray-400 hover:text-blue-400 hover:bg-blue-900/30' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        {alert.status === 'OPEN' && (
                          <button
                            onClick={() => updateAlertStatus(alert.id, 'UNDER_REVIEW')}
                            className={`p-1.5 rounded transition-colors ${isDark ? 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-900/30' : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'}`}
                            title="Start Review"
                          >
                            <FileSearch size={16} />
                          </button>
                        )}
                        {alert.status === 'UNDER_REVIEW' && (
                          <>
                            <button
                              onClick={() => updateAlertStatus(alert.id, 'RESOLVED')}
                              className={`p-1.5 rounded transition-colors ${isDark ? 'text-gray-400 hover:text-green-400 hover:bg-green-900/30' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}
                              title="Mark Resolved"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => updateAlertStatus(alert.id, 'FALSE_POSITIVE')}
                              className={`p-1.5 rounded transition-colors ${isDark ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                              title="False Positive"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cases Tab */}
      {activeTab === 'cases' && (
        <div className={`rounded-xl shadow-sm overflow-hidden border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <table className="w-full">
            <thead className={isDark ? 'bg-gray-900/50' : 'bg-gray-50'}>
              <tr className={`text-left text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <th className="px-4 py-3 font-medium">Case Number</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-100'}`}>
              {cases.map((caseItem) => (
                <tr key={caseItem.id} className={isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                  <td className="px-4 py-3">
                    <span className={`font-mono text-sm ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{caseItem.caseNumber}</span>
                  </td>
                  <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{caseItem.title}</td>
                  <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {caseItem.user?.firstName} {caseItem.user?.lastName}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${isDark ? SEVERITY_COLORS[caseItem.priority]?.bg.split(' ')[1] : SEVERITY_COLORS[caseItem.priority]?.bg.split(' ')[0]} ${isDark ? SEVERITY_COLORS[caseItem.priority]?.text.split(' ')[1] : SEVERITY_COLORS[caseItem.priority]?.text.split(' ')[0]}`}>
                      {caseItem.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                      {caseItem.status}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {new Date(caseItem.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button className={`p-1.5 rounded transition-colors ${isDark ? 'text-gray-400 hover:text-blue-400 hover:bg-blue-900/30' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}>
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Rules Tab */}
      {activeTab === 'rules' && (
        <div className={`rounded-xl shadow-sm overflow-hidden border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <table className="w-full">
            <thead className={isDark ? 'bg-gray-900/50' : 'bg-gray-50'}>
              <tr className={`text-left text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <th className="px-4 py-3 font-medium">Rule Code</th>
                <th className="px-4 py-3 font-medium">Rule Name</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Severity</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-100'}`}>
              {rules.map((rule) => (
                <tr key={rule.id} className={isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                  <td className="px-4 py-3">
                    <span className={`font-mono text-sm ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{rule.ruleCode}</span>
                  </td>
                  <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{rule.ruleName}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                      {rule.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{rule.category}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${isDark ? SEVERITY_COLORS[rule.severity]?.bg.split(' ')[1] : SEVERITY_COLORS[rule.severity]?.bg.split(' ')[0]} ${isDark ? SEVERITY_COLORS[rule.severity]?.text.split(' ')[1] : SEVERITY_COLORS[rule.severity]?.text.split(' ')[0]}`}>
                      {rule.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleRule(rule.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        rule.enabled ? 'bg-emerald-500' : isDark ? 'bg-gray-600' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        rule.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button className={`p-1.5 rounded transition-colors ${isDark ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}>
                      <MoreVertical size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Watchlist Tab */}
      {activeTab === 'watchlist' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} size={18} />
              <input
                type="text"
                placeholder="Search watchlist..."
                className={`pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isDark
                    ? 'bg-gray-800 border border-gray-700 text-gray-100 placeholder-gray-500'
                    : 'border border-gray-200 text-gray-900'
                }`}
              />
            </div>
            <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
              + Add Entry
            </button>
          </div>

          <div className={`rounded-xl shadow-sm overflow-hidden border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <table className="w-full">
              <thead className={isDark ? 'bg-gray-900/50' : 'bg-gray-50'}>
                <tr className={`text-left text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <th className="px-4 py-3 font-medium">Entry ID</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">List Type</th>
                  <th className="px-4 py-3 font-medium">Entity Type</th>
                  <th className="px-4 py-3 font-medium">Country</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-100'}`}>
                {watchlist.map((entry) => (
                  <tr key={entry.id} className={isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}>
                    <td className="px-4 py-3">
                      <span className={`font-mono text-sm ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{entry.entryId}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {entry.entityType === 'INDIVIDUAL' ? (
                          <Users size={16} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
                        ) : (
                          <FileText size={16} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
                        )}
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{entry.fullName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        entry.type.includes('OFAC')
                          ? isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'
                          : entry.type.includes('UN')
                            ? isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
                            : entry.type === 'PEP'
                              ? isDark ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-700'
                              : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {entry.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{entry.entityType}</td>
                    <td className={`px-4 py-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{entry.country || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        entry.active
                          ? isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
                          : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {entry.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}