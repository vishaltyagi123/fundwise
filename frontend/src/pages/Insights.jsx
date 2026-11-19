import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import api from '../services/api'

export default function Insights() {
  const [insights, setInsights] = useState(null)
  const [period, setPeriod] = useState(30)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchInsights()
  }, [period])

  const fetchInsights = async () => {
    try {
      setIsLoading(true)
      const response = await api.get(`/insights?days=${period}`)
      setInsights(response.data)
    } catch (error) {
      console.error('Failed to fetch insights:', error)
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
        <h1 className="text-2xl font-bold text-gray-900">Financial Insights</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(Number(e.target.value))}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={365}>Last year</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
              <TrendingUp className="text-emerald-600" size={24} />
            </div>
            <span className="flex items-center text-emerald-500 text-sm">
              <ArrowUpRight size={16} />
              12%
            </span>
          </div>
          <p className="text-gray-500 text-sm mb-1">Total Income</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(insights?.totalIncome || 0)}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <TrendingDown className="text-red-600" size={24} />
            </div>
            <span className="flex items-center text-red-500 text-sm">
              <ArrowDownRight size={16} />
              8%
            </span>
          </div>
          <p className="text-gray-500 text-sm mb-1">Total Expenses</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(insights?.totalExpenses || 0)}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <DollarSign className="text-blue-600" size={24} />
            </div>
          </div>
          <p className="text-gray-500 text-sm mb-1">Net Savings</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(insights?.netSavings || 0)}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <PiggyBank className="text-purple-600" size={24} />
            </div>
          </div>
          <p className="text-gray-500 text-sm mb-1">Savings Rate</p>
          <p className="text-2xl font-bold text-gray-900">{insights?.savingsRate?.toFixed(1) || 0}%</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Income vs Expenses</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={insights?.monthlyTrends || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `$${v/1000}k`} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2} dot={false} name="Income" />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} dot={false} name="Expenses" />
                <Line type="monotone" dataKey="savings" stroke="#3b82f6" strokeWidth={2} dot={false} name="Savings" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spending by Category */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Spending by Category</h3>
          <div className="flex">
            <div className="w-1/2 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={insights?.spendingByCategory || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="amount"
                  >
                    {(insights?.spendingByCategory || []).map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 flex flex-col justify-center space-y-2">
              {(insights?.spendingByCategory || []).map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                    <span className="text-sm text-gray-600">{category.category}</span>
                  </div>
                  <span className="text-sm font-medium">{category.percentage?.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Merchants */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Merchants</h3>
        <div className="grid grid-cols-5 gap-4">
          {(insights?.topMerchants || []).map((merchant, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="w-12 h-12 bg-white rounded-full mx-auto mb-3 flex items-center justify-center text-lg font-bold text-gray-700 shadow-sm">
                {merchant.name[0]}
              </div>
              <p className="font-medium text-gray-900">{merchant.name}</p>
              <p className="text-emerald-600 font-semibold">{formatCurrency(merchant.totalSpent)}</p>
              <p className="text-xs text-gray-500">{merchant.transactionCount} transactions</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
