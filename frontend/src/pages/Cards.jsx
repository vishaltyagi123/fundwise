import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCards } from '../store/dashboardSlice'
import { Plus, Wifi, Lock, Eye, Settings } from 'lucide-react'

export default function Cards() {
  const dispatch = useDispatch()
  const { cards } = useSelector((state) => state.dashboard)

  useEffect(() => {
    dispatch(fetchCards())
  }, [dispatch])

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Cards</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors">
          <Plus size={18} />
          <span>Add New Card</span>
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {cards.length > 0 ? (
          cards.map((card) => (
            <div key={card.id} className="bg-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute -right-10 -top-10 w-40 h-40 border border-white rounded-full"></div>
                <div className="absolute -right-5 -top-5 w-32 h-32 border border-white rounded-full"></div>
              </div>

              <div className="relative">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-sm text-gray-400">Fundwise</span>
                  <span className="text-2xl font-bold tracking-wider">{card.type}</span>
                </div>

                <div className="flex items-center gap-2 mb-6">
                  <Wifi className="rotate-90 text-gray-400" size={24} />
                </div>

                <p className="text-xl tracking-widest mb-6">{card.formattedCardNumber}</p>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">{card.cardholderName}</p>
                  </div>
                  <div className="flex gap-6">
                    <div>
                      <p className="text-xs text-gray-400">Exp</p>
                      <p className="text-sm">{card.expiryDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">CVV</p>
                      <p className="text-sm">***</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 bg-gray-100 rounded-2xl p-12 text-center">
            <p className="text-gray-500">No cards found. Add a new card to get started.</p>
          </div>
        )}
      </div>

      {/* Card Actions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Card Settings</h2>
        <div className="grid grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <Lock size={20} className="text-gray-600" />
            <span className="text-gray-900">Lock Card</span>
          </button>
          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <Eye size={20} className="text-gray-600" />
            <span className="text-gray-900">View PIN</span>
          </button>
          <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <Settings size={20} className="text-gray-600" />
            <span className="text-gray-900">Card Limits</span>
          </button>
        </div>
      </div>
    </div>
  )
}
