import { ArrowRightLeft } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function ConversionRate() {
  const { isDark } = useTheme()

  return (
    <div className={`rounded-2xl p-6 overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
      <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Conversion Rate</h3>

      <div className="space-y-4">
        <div>
          <label className={`text-sm block mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Amount</label>
          <div className="flex gap-2">
            <input
              type="number"
              defaultValue={238}
              className={`flex-1 min-w-0 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                isDark ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border border-gray-200'
              }`}
            />
            <select className={`w-16 flex-shrink-0 px-2 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'border border-gray-200 text-gray-600'
            }`}>
              <option>USD</option>
              <option>EUR</option>
              <option>GBP</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <ArrowRightLeft className={isDark ? 'text-gray-500' : 'text-gray-400'} size={20} />
        </div>

        <div className="flex gap-2">
          <input
            type="number"
            defaultValue={222.13}
            className={`flex-1 min-w-0 px-4 py-2 rounded-lg ${
              isDark ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border border-gray-200 bg-gray-50'
            }`}
            readOnly
          />
          <select className={`w-16 flex-shrink-0 px-2 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
            isDark ? 'bg-gray-700 border-gray-600 text-gray-300' : 'border border-gray-200 text-gray-600'
          }`}>
            <option>EUR</option>
            <option>USD</option>
            <option>GBP</option>
          </select>
        </div>

        <button className="w-full py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2">
          <span>Convert</span>
          <ArrowRightLeft size={18} />
        </button>

        <p className={`text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>238 USD = 222.13 EUR</p>
      </div>
    </div>
  )
}
