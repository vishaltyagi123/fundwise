import { RefreshCw, ShoppingCart, ChevronRight, Eye } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const workflows = [
  {
    id: 1,
    name: 'Transactions',
    status: 'Auto Block',
    icon: RefreshCw,
    color: 'bg-emerald-500',
    active: true,
  },
  {
    id: 2,
    name: 'Create order',
    status: 'Looks OK',
    icon: ShoppingCart,
    color: 'bg-gray-200',
    active: false,
  },
]

export default function Workflows() {
  const { isDark } = useTheme()

  return (
    <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Workflows</h3>
        <button className={isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}>
          <Eye size={20} />
        </button>
      </div>

      <div className="space-y-3">
        {workflows.map((workflow) => (
          <div
            key={workflow.id}
            className={`flex items-center justify-between p-4 rounded-xl transition-colors ${
              workflow.active
                ? 'bg-emerald-500 text-white'
                : isDark
                  ? 'bg-gray-700 hover:bg-gray-600'
                  : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${workflow.active ? 'bg-white/20' : isDark ? 'bg-gray-600' : 'bg-gray-200'} rounded-lg flex items-center justify-center`}>
                <workflow.icon size={20} className={workflow.active ? 'text-white' : isDark ? 'text-gray-300' : 'text-gray-600'} />
              </div>
              <div>
                <p className={`font-medium ${workflow.active ? 'text-white' : isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                  {workflow.name}
                </p>
                <p className={`text-sm ${workflow.active ? 'text-white/70' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {workflow.status}
                </p>
              </div>
            </div>
            <ChevronRight size={20} className={workflow.active ? 'text-white' : isDark ? 'text-gray-500' : 'text-gray-400'} />
          </div>
        ))}
      </div>

      <button className={`w-full mt-4 text-center text-sm flex items-center justify-center gap-1 ${
        isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
      }`}>
        Upcoming
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
