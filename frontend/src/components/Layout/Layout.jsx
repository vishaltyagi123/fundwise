import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { useTheme } from '../../context/ThemeContext'

export default function Layout() {
  const { isDark } = useTheme()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  return (
    <div className={`flex min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className={`flex-1 p-6 overflow-auto transition-colors duration-300 ${
          isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
        }`}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
