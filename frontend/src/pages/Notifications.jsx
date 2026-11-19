import { useState, useEffect } from 'react'
import { Bell, CheckCircle, AlertCircle, CreditCard, Shield, Megaphone, Check, Trash2 } from 'lucide-react'
import api from '../services/api'

const mockNotifications = [
  {
    id: 1,
    title: 'Transaction Completed',
    message: 'Your transfer of $500 to Watson has been completed successfully.',
    type: 'TRANSACTION',
    isRead: false,
    createdAt: '2023-11-11T10:30:00'
  },
  {
    id: 2,
    title: 'Low Balance Alert',
    message: 'Your checking account balance is below $1,000. Consider adding funds.',
    type: 'PAYMENT',
    isRead: false,
    createdAt: '2023-11-11T09:15:00'
  },
  {
    id: 3,
    title: 'Invoice Paid',
    message: 'Invoice INV-2023-A1B2C3 has been paid by Acme Corp.',
    type: 'INVOICE',
    isRead: true,
    createdAt: '2023-11-10T16:45:00'
  },
  {
    id: 4,
    title: 'New Login Detected',
    message: 'A new login was detected from Chrome on Windows. If this wasn\'t you, please secure your account.',
    type: 'SECURITY',
    isRead: true,
    createdAt: '2023-11-10T14:20:00'
  },
  {
    id: 5,
    title: 'Card Payment Successful',
    message: 'Your payment of $64.00 for Figma Pro Plan was successful.',
    type: 'TRANSACTION',
    isRead: true,
    createdAt: '2023-11-09T11:00:00'
  },
  {
    id: 6,
    title: 'Special Offer',
    message: 'Get 2% cashback on all transactions this weekend! Limited time offer.',
    type: 'PROMOTION',
    isRead: true,
    createdAt: '2023-11-08T09:00:00'
  }
]

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [filter, setFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      const response = await api.get('/notifications')
      setNotifications(response.data.content || [])
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      setNotifications(mockNotifications)
    } finally {
      setIsLoading(false)
    }
  }

  const markAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`)
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, isRead: true } : n
      ))
    } catch (error) {
      // Update locally anyway for demo
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, isRead: true } : n
      ))
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all')
      setNotifications(notifications.map(n => ({ ...n, isRead: true })))
    } catch (error) {
      setNotifications(notifications.map(n => ({ ...n, isRead: true })))
    }
  }

  const getIcon = (type) => {
    const icons = {
      TRANSACTION: <CreditCard className="text-emerald-600" size={20} />,
      PAYMENT: <AlertCircle className="text-amber-600" size={20} />,
      INVOICE: <CheckCircle className="text-blue-600" size={20} />,
      SECURITY: <Shield className="text-red-600" size={20} />,
      PROMOTION: <Megaphone className="text-purple-600" size={20} />,
      SYSTEM: <Bell className="text-gray-600" size={20} />
    }
    return icons[type] || icons.SYSTEM
  }

  const getIconBg = (type) => {
    const bgs = {
      TRANSACTION: 'bg-emerald-100',
      PAYMENT: 'bg-amber-100',
      INVOICE: 'bg-blue-100',
      SECURITY: 'bg-red-100',
      PROMOTION: 'bg-purple-100',
      SYSTEM: 'bg-gray-100'
    }
    return bgs[type] || bgs.SYSTEM
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes} minutes ago`
    if (hours < 24) return `${hours} hours ago`
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString()
  }

  const filteredNotifications = filter === 'all'
    ? notifications
    : filter === 'unread'
      ? notifications.filter(n => !n.isRead)
      : notifications.filter(n => n.type === filter)

  const unreadCount = notifications.filter(n => !n.isRead).length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500">{unreadCount} unread notifications</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
          >
            <Check size={18} />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {['all', 'unread', 'TRANSACTION', 'SECURITY', 'INVOICE'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-emerald-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f === 'all' ? 'All' : f === 'unread' ? 'Unread' : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl shadow-sm divide-y divide-gray-100">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500">No notifications</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 flex items-start gap-4 hover:bg-gray-50 transition-colors ${
                !notification.isRead ? 'bg-emerald-50/50' : ''
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getIconBg(notification.type)}`}>
                {getIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                      {notification.title}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                  </div>
                  {!notification.isRead && (
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">{formatTime(notification.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                {!notification.isRead && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                    title="Mark as read"
                  >
                    <Check size={16} />
                  </button>
                )}
                <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}