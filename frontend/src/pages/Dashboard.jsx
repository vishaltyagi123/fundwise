import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchDashboardSummary, fetchTransactions, fetchCards, fetchQuickTransferUsers } from '../store/dashboardSlice'
import BalanceCard from '../components/Dashboard/BalanceCard'
import QuickTransaction from '../components/Dashboard/QuickTransaction'
import IncomeChart from '../components/Dashboard/IncomeChart'
import SpentChart from '../components/Dashboard/SpentChart'
import TransactionHistory from '../components/Dashboard/TransactionHistory'
import CardWidget from '../components/Cards/CardWidget'
import ConversionRate from '../components/Dashboard/ConversionRate'
import Workflows from '../components/Dashboard/Workflows'

export default function Dashboard() {
  const dispatch = useDispatch()
  const { summary, transactions, cards, isLoading } = useSelector((state) => state.dashboard)

  useEffect(() => {
    dispatch(fetchDashboardSummary())
    dispatch(fetchTransactions())
    dispatch(fetchCards())
    dispatch(fetchQuickTransferUsers())
  }, [dispatch])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return (
    <div className="flex gap-6 min-h-0">
      {/* Main Content */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Top Section */}
        <div className="grid grid-cols-2 gap-6">
          <BalanceCard balance={summary?.totalBalance || 32352} />
          <QuickTransaction />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-2 gap-6">
          <IncomeChart
            total={summary?.totalIncome || 24521}
            changePercent={summary?.incomeChangePercent || 23}
            data={summary?.monthlyIncome}
          />
          <SpentChart
            total={summary?.totalSpent || 17254}
            changePercent={summary?.spentChangePercent || 23}
            data={summary?.monthlySpent}
          />
        </div>

        {/* Transaction History */}
        <TransactionHistory transactions={transactions} />
      </div>

      {/* Right Sidebar */}
      <div className="w-80 flex-shrink-0 space-y-6">
        <CardWidget card={cards[0]} />
        <ConversionRate />
        <Workflows />
      </div>
    </div>
  )
}
