import { Search, Filter, CheckCircle, Clock } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const defaultTransactions = [
  {
    id: 1,
    invoice: 'INV_00092323',
    name: 'Figma Pro Plan',
    category: 'Design Tools',
    logo: 'F',
    logoColor: 'bg-purple-500',
    date: '11 Nov, 2023',
    amount: -64.00,
    status: 'Completed',
  },
  {
    id: 2,
    invoice: 'INV_00092324',
    name: 'Internal Payment',
    category: 'billing@acme.com',
    logo: 'A',
    logoColor: 'bg-red-500',
    date: '11 Nov, 2023',
    amount: 200.00,
    status: 'On Progress',
  },
  {
    id: 3,
    invoice: 'INV_00092325',
    name: 'Dribbble Premium',
    category: 'Design Tools',
    logo: 'D',
    logoColor: 'bg-pink-500',
    date: '11 Nov, 2023',
    amount: -64.00,
    status: 'Completed',
  },
  {
    id: 4,
    invoice: 'INV_00092326',
    name: 'YouTube Premium',
    category: 'Design Tools',
    logo: 'Y',
    logoColor: 'bg-red-600',
    date: '11 Nov, 2023',
    amount: -64.00,
    status: 'On Progress',
  },
  {
    id: 5,
    invoice: 'INV_00092327',
    name: 'Slack Subscription',
    category: 'Communication',
    logo: 'S',
    logoColor: 'bg-purple-700',
    date: '10 Nov, 2023',
    amount: -12.00,
    status: 'Completed',
  },
]

export default function TransactionHistory({ transactions = defaultTransactions }) {
  const { isDark } = useTheme()

  const formatCurrency = (amount) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(Math.abs(amount))
    return amount >= 0 ? `+${formatted}` : `-${formatted}`
  }

  return (
    <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Transaction history</h3>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} size={16} />
            <input
              type="text"
              placeholder="Search Transaction"
              className={`pl-9 pr-4 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                isDark ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'border border-gray-200'
              }`}
            />
          </div>
          <select className={`px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
            isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'border border-gray-200 text-gray-600'
          }`}>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>Last year</option>
          </select>
          <button className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
            isDark ? 'border border-gray-600 text-gray-300 hover:bg-gray-700' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}>
            <Filter size={16} />
            <span>Filter</span>
          </button>
        </div>
      </div>

      <table className="w-full">
        <thead>
          <tr className={`text-left text-sm ${isDark ? 'text-gray-400 border-b border-gray-700' : 'text-gray-500 border-b border-gray-100'}`}>
            <th className="pb-3 font-medium">
              <input type="checkbox" className="rounded" />
            </th>
            <th className="pb-3 font-medium">Invoice</th>
            <th className="pb-3 font-medium">Transactions</th>
            <th className="pb-3 font-medium">Date</th>
            <th className="pb-3 font-medium">Amount</th>
            <th className="pb-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx.id} className={isDark ? 'border-b border-gray-700 hover:bg-gray-700' : 'border-b border-gray-50 hover:bg-gray-50'}>
              <td className="py-4">
                <input type="checkbox" className="rounded" />
              </td>
              <td className={`py-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{tx.invoice}</td>
              <td className="py-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${tx.logoColor} rounded-lg flex items-center justify-center text-white font-semibold`}>
                    {tx.logo}
                  </div>
                  <div>
                    <p className={`font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{tx.name}</p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{tx.category}</p>
                  </div>
                </div>
              </td>
              <td className={`py-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{tx.date}</td>
              <td className={`py-4 font-medium ${tx.amount >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {formatCurrency(tx.amount)}
              </td>
              <td className="py-4">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  tx.status === 'Completed'
                    ? isDark ? 'bg-emerald-900/50 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                    : isDark ? 'bg-amber-900/50 text-amber-400' : 'bg-amber-100 text-amber-700'
                }`}>
                  {tx.status === 'Completed' ? <CheckCircle size={12} /> : <Clock size={12} />}
                  {tx.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
