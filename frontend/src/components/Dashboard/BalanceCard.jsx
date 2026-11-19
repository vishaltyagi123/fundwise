import { Send, ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function BalanceCard({ balance = 32352 }) {
  const { isDark } = useTheme()

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
      <div className="mb-6">
        <p className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Balance in USD</p>
        <h2 className={`text-4xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(balance)}</h2>
      </div>

      <div className="flex gap-3">
        <button className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 shadow-sm shadow-emerald-500/20 transition-all">
          <Send size={18} />
          <span>Send</span>
        </button>
        <button className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
          isDark
            ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
        }`}>
          <ArrowDownLeft size={18} />
          <span>Request</span>
        </button>
        <button className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
          isDark
            ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
        }`}>
          <ArrowUpRight size={18} />
          <span>Top Up</span>
        </button>
      </div>
    </div>
  )
}
