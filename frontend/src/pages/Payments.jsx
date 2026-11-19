import { useState } from 'react'
import { Send, ArrowDownLeft, ArrowUpRight, CreditCard } from 'lucide-react'

export default function Payments() {
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Payments</h1>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <button className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
            <Send size={24} />
          </div>
          <span className="font-medium text-gray-900">Send</span>
        </button>
        <button className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <ArrowDownLeft size={24} />
          </div>
          <span className="font-medium text-gray-900">Request</span>
        </button>
        <button className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
            <ArrowUpRight size={24} />
          </div>
          <span className="font-medium text-gray-900">Top Up</span>
        </button>
        <button className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center gap-3">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
            <CreditCard size={24} />
          </div>
          <span className="font-medium text-gray-900">Pay Bills</span>
        </button>
      </div>

      {/* Transfer Form */}
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Send Money</h2>

        <form className="space-y-6">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Recipient</label>
            <input
              type="text"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Enter email or account number"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-2xl font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-2">Note (optional)</label>
            <textarea
              placeholder="Add a note..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium text-lg"
          >
            Send Money
          </button>
        </form>
      </div>
    </div>
  )
}
