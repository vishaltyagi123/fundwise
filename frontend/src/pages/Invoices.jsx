import { useState, useEffect } from 'react'
import { Plus, FileText, Clock, CheckCircle, AlertCircle, Download, Eye, Send } from 'lucide-react'
import api from '../services/api'

export default function Invoices() {
  const [invoices, setInvoices] = useState([])
  const [stats, setStats] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [invoicesRes, statsRes] = await Promise.all([
        api.get('/invoices'),
        api.get('/invoices/stats')
      ])
      setInvoices(invoicesRes.data.content || [])
      setStats(statsRes.data)
    } catch (error) {
      console.error('Failed to fetch invoices:', error)
      // Set mock data for demo
      setInvoices([
        { id: 1, invoiceNumber: 'INV-2023-A1B2C3', clientName: 'Acme Corp', total: 1250.00, status: 'PAID', dueDate: '2023-11-15' },
        { id: 2, invoiceNumber: 'INV-2023-D4E5F6', clientName: 'Tech Solutions', total: 3500.00, status: 'SENT', dueDate: '2023-11-20' },
        { id: 3, invoiceNumber: 'INV-2023-G7H8I9', clientName: 'Design Studio', total: 850.00, status: 'DRAFT', dueDate: '2023-11-25' },
        { id: 4, invoiceNumber: 'INV-2023-J0K1L2', clientName: 'Marketing Inc', total: 2100.00, status: 'OVERDUE', dueDate: '2023-10-30' },
      ])
      setStats({ totalPaid: 15250, totalPending: 5600, draftCount: 2, sentCount: 3, paidCount: 8, overdueCount: 1 })
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const getStatusBadge = (status) => {
    const styles = {
      DRAFT: 'bg-gray-100 text-gray-700',
      SENT: 'bg-blue-100 text-blue-700',
      PAID: 'bg-emerald-100 text-emerald-700',
      OVERDUE: 'bg-red-100 text-red-700',
      CANCELLED: 'bg-gray-100 text-gray-500',
    }
    const icons = {
      DRAFT: <FileText size={14} />,
      SENT: <Send size={14} />,
      PAID: <CheckCircle size={14} />,
      OVERDUE: <AlertCircle size={14} />,
    }
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {icons[status]}
        {status}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
        >
          <Plus size={18} />
          <span>Create Invoice</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle className="text-emerald-600" size={20} />
            </div>
            <span className="text-gray-500">Total Paid</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalPaid || 0)}</p>
          <p className="text-sm text-gray-500 mt-1">{stats.paidCount || 0} invoices</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <Clock className="text-amber-600" size={20} />
            </div>
            <span className="text-gray-500">Pending</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalPending || 0)}</p>
          <p className="text-sm text-gray-500 mt-1">{stats.sentCount || 0} invoices</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <FileText className="text-gray-600" size={20} />
            </div>
            <span className="text-gray-500">Drafts</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.draftCount || 0}</p>
          <p className="text-sm text-gray-500 mt-1">invoices</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="text-red-600" size={20} />
            </div>
            <span className="text-gray-500">Overdue</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.overdueCount || 0}</p>
          <p className="text-sm text-gray-500 mt-1">invoices</p>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-sm text-gray-500">
              <th className="px-6 py-4 font-medium">Invoice</th>
              <th className="px-6 py-4 font-medium">Client</th>
              <th className="px-6 py-4 font-medium">Amount</th>
              <th className="px-6 py-4 font-medium">Due Date</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <span className="font-medium text-gray-900">{invoice.invoiceNumber}</span>
                </td>
                <td className="px-6 py-4 text-gray-600">{invoice.clientName}</td>
                <td className="px-6 py-4 font-medium text-gray-900">{formatCurrency(invoice.total)}</td>
                <td className="px-6 py-4 text-gray-600">{invoice.dueDate}</td>
                <td className="px-6 py-4">{getStatusBadge(invoice.status)}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                      <Eye size={18} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                      <Download size={18} />
                    </button>
                    {invoice.status === 'DRAFT' && (
                      <button className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg">
                        <Send size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Invoice Modal would go here */}
    </div>
  )
}