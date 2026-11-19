import { Plus } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const defaultUsers = [
  { id: 1, name: 'Watson', tag: '#65135', avatar: 'W', color: 'bg-blue-500' },
  { id: 2, name: 'Nathan', tag: '#87441', avatar: 'N', color: 'bg-purple-500' },
  { id: 3, name: 'Angelina', tag: '#63518', avatar: 'A', color: 'bg-pink-500' },
  { id: 4, name: 'Thomas', tag: '#21400', avatar: 'T', color: 'bg-orange-500' },
  { id: 5, name: 'Robert', tag: '#56142', avatar: 'R', color: 'bg-teal-500' },
]

export default function QuickTransaction({ users = defaultUsers }) {
  const { isDark } = useTheme()

  return (
    <div className={`rounded-2xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
      <h3 className={`text-lg font-semibold mb-5 ${isDark ? 'text-white' : 'text-gray-900'}`}>Quick Transaction</h3>

      <div className="flex items-center gap-5">
        {/* Add New Button */}
        <button className="flex flex-col items-center gap-2 group">
          <div className={`w-14 h-14 border-2 border-dashed rounded-full flex items-center justify-center transition-all group-hover:border-emerald-500 group-hover:text-emerald-500 group-hover:scale-105 ${
            isDark ? 'border-gray-600 text-gray-500' : 'border-gray-300 text-gray-400'
          }`}>
            <Plus size={22} />
          </div>
          <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Transfer</span>
        </button>

        {/* User Avatars */}
        {users.slice(0, 5).map((user) => (
          <button key={user.id} className="flex flex-col items-center gap-2 group">
            <div className={`w-14 h-14 ${user.color} rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-md group-hover:ring-2 ring-offset-2 ring-emerald-500 transition-all group-hover:scale-105 ${
              isDark ? 'ring-offset-gray-800' : 'ring-offset-white'
            }`}>
              {user.avatar}
            </div>
            <div className="text-center">
              <p className={`text-xs font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{user.name}</p>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{user.tag}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
