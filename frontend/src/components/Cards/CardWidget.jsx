import { Plus, Wifi } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function CardWidget({ card }) {
  const { isDark } = useTheme()

  const defaultCard = {
    cardholderName: 'Thomas Fletcher',
    formattedCardNumber: '1253 5432 3621 3090',
    expiryDate: '09/24',
    cvv: '341',
    type: 'VISA',
  }

  const c = card || defaultCard

  return (
    <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>My Cards</h3>
        <button className="flex items-center gap-1 text-emerald-500 text-sm font-medium hover:text-emerald-600 transition-colors">
          <span>Add New</span>
          <Plus size={16} />
        </button>
      </div>

      {/* Card Display */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -right-10 -top-10 w-40 h-40 border border-white rounded-full"></div>
          <div className="absolute -right-5 -top-5 w-32 h-32 border border-white rounded-full"></div>
        </div>

        <div className="relative">
          <div className="flex items-center justify-between mb-8">
            <span className="text-sm text-gray-400">Fundwise</span>
            <span className="text-2xl font-bold tracking-wider">VISA</span>
          </div>

          <div className="flex items-center gap-2 mb-6">
            <Wifi className="rotate-90 text-gray-400" size={24} />
          </div>

          <p className="text-xl tracking-widest mb-6">{c.formattedCardNumber}</p>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-1">{c.cardholderName}</p>
            </div>
            <div className="flex gap-6">
              <div>
                <p className="text-xs text-gray-400">Exp</p>
                <p className="text-sm">{c.expiryDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">CVV</p>
                <p className="text-sm">{c.cvv}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
