import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingDown } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const defaultData = [
  { month: 'Jan', amount: 5000 },
  { month: 'Feb', amount: 7000 },
  { month: 'Mar', amount: 9000 },
  { month: 'Apr', amount: 12000 },
  { month: 'May', amount: 15000 },
  { month: 'Jun', amount: 18000 },
  { month: 'Jul', amount: 16000 },
  { month: 'Aug', amount: 14000 },
  { month: 'Sep', amount: 17254 },
  { month: 'Oct', amount: 13000 },
  { month: 'Nov', amount: 10000 },
  { month: 'Dec', amount: 8000 },
]

export default function SpentChart({ data = defaultData, total = 17254, changePercent = 23 }) {
  const { isDark } = useTheme()

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
        <div className={`px-3 py-2 rounded-lg shadow-lg ${isDark ? 'bg-gray-700' : 'bg-slate-800'}`}>
          <p className="text-white text-xs font-medium">{label}</p>
          <p className="text-amber-400 text-sm font-bold">{formatCurrency(payload[0].value)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Spent</p>
          <div className="flex items-center gap-3">
            <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(total)}</h3>
            <span className="flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
              <TrendingDown size={12} />
              -{changePercent}%
            </span>
          </div>
        </div>
        <select className={`px-3 py-1.5 rounded-lg text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
          isDark
            ? 'bg-gray-700 border border-gray-600 text-gray-300'
            : 'bg-gray-50 border border-gray-200 text-gray-600'
        }`}>
          <option>Last 30 days</option>
          <option>Last 90 days</option>
          <option>Last year</option>
        </select>
      </div>

      <div className="h-52 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barCategoryGap="20%">
            <defs>
              <linearGradient id="spentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                <stop offset="100%" stopColor="#d97706" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#374151' : '#e5e7eb'} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#6b7280', fontWeight: 500 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: isDark ? '#9ca3af' : '#6b7280' }}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(55, 65, 81, 0.3)' : 'rgba(0, 0, 0, 0.05)' }} />
            <Bar dataKey="amount" fill="url(#spentGradient)" radius={[6, 6, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
