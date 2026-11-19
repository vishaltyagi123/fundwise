import { useState } from 'react'
import { useSelector } from 'react-redux'
import {
  User, Lock, Bell, Shield, CreditCard,
  Eye, EyeOff, Save, Camera, Mail, Phone, MapPin
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function Settings() {
  const { user } = useSelector((state) => state.auth)
  const { isDark } = useTheme()
  const [activeTab, setActiveTab] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Form states
  const [profile, setProfile] = useState({
    firstName: user?.firstName || 'John',
    lastName: user?.lastName || 'Doe',
    email: user?.email || 'john.doe@fundwise.com',
    phone: '+1 (555) 123-4567',
    address: '123 Financial Street, New York, NY 10001',
    timezone: 'America/New_York',
    language: 'en'
  })

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    pushNotifications: true,
    transactionAlerts: true,
    securityAlerts: true,
    marketingEmails: false,
    weeklyReport: true
  })

  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    loginAlerts: true,
    sessionTimeout: '30'
  })

  const handleSave = async () => {
    setIsSaving(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    alert('Settings saved successfully!')
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'compliance', label: 'Compliance', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Settings</h1>
        <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Manage your account settings and preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Tabs */}
        <div className={`w-64 rounded-xl shadow-sm p-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-emerald-50 text-emerald-600'
                    : isDark
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <tab.icon size={20} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className={`flex-1 rounded-xl shadow-sm p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Profile Information</h2>

              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center ${isDark ? 'bg-emerald-900/50' : 'bg-emerald-100'}`}>
                    <span className="text-3xl font-bold text-emerald-600">
                      {profile.firstName[0]}{profile.lastName[0]}
                    </span>
                  </div>
                  <button className="absolute bottom-0 right-0 p-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600">
                    <Camera size={16} />
                  </button>
                </div>
                <div>
                  <h3 className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{profile.firstName} {profile.lastName}</h3>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>{profile.email}</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>First Name</label>
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isDark ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border border-gray-200 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Last Name</label>
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isDark ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border border-gray-200 text-gray-900'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                  <div className="relative">
                    <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} size={18} />
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className={`w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        isDark ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border border-gray-200 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Phone</label>
                  <div className="relative">
                    <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} size={18} />
                    <input
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className={`w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        isDark ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border border-gray-200 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
                <div className="col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Address</label>
                  <div className="relative">
                    <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} size={18} />
                    <input
                      type="text"
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                      className={`w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        isDark ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border border-gray-200 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Timezone</label>
                  <select
                    value={profile.timezone}
                    onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isDark ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border border-gray-200 text-gray-900'
                    }`}
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="Asia/Kolkata">India (IST)</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Language</label>
                  <select
                    value={profile.language}
                    onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isDark ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border border-gray-200 text-gray-900'
                    }`}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Security Settings</h2>

              {/* Change Password */}
              <div className={`p-4 rounded-lg ${isDark ? 'border border-gray-700' : 'border border-gray-200'}`}>
                <h3 className={`font-medium mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Change Password</h3>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Current Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter current password"
                        className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                          isDark ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'border border-gray-200'
                        }`}
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className={isDark ? 'absolute right-3 top-1/2 -translate-y-1/2 text-gray-500' : 'absolute right-3 top-1/2 -translate-y-1/2 text-gray-400'}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>New Password</label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        isDark ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'border border-gray-200'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        isDark ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' : 'border border-gray-200'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className={`p-4 rounded-lg ${isDark ? 'border border-gray-700' : 'border border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Two-Factor Authentication</h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Add an extra layer of security to your account</p>
                  </div>
                  <button
                    onClick={() => setSecurity({ ...security, twoFactorEnabled: !security.twoFactorEnabled })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      security.twoFactorEnabled ? 'bg-emerald-500' : isDark ? 'bg-gray-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      security.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Login Alerts */}
              <div className={`p-4 rounded-lg ${isDark ? 'border border-gray-700' : 'border border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Login Alerts</h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Get notified when someone logs into your account</p>
                  </div>
                  <button
                    onClick={() => setSecurity({ ...security, loginAlerts: !security.loginAlerts })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      security.loginAlerts ? 'bg-emerald-500' : isDark ? 'bg-gray-600' : 'bg-gray-300'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      security.loginAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Session Timeout */}
              <div className={`p-4 rounded-lg ${isDark ? 'border border-gray-700' : 'border border-gray-200'}`}>
                <h3 className={`font-medium mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Session Timeout</h3>
                <select
                  value={security.sessionTimeout}
                  onChange={(e) => setSecurity({ ...security, sessionTimeout: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDark ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border border-gray-200'
                  }`}
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="120">2 hours</option>
                </select>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Notification Preferences</h2>

              {Object.entries({
                emailAlerts: { title: 'Email Alerts', desc: 'Receive important alerts via email' },
                pushNotifications: { title: 'Push Notifications', desc: 'Get real-time push notifications' },
                transactionAlerts: { title: 'Transaction Alerts', desc: 'Notifications for all transactions' },
                securityAlerts: { title: 'Security Alerts', desc: 'Alerts for suspicious activity' },
                marketingEmails: { title: 'Marketing Emails', desc: 'Receive promotional content' },
                weeklyReport: { title: 'Weekly Report', desc: 'Weekly summary of your account' }
              }).map(([key, { title, desc }]) => (
                <div key={key} className={`p-4 rounded-lg ${isDark ? 'border border-gray-700' : 'border border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{title}</h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifications({ ...notifications, [key]: !notifications[key] })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notifications[key] ? 'bg-emerald-500' : isDark ? 'bg-gray-600' : 'bg-gray-300'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        notifications[key] ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Compliance Tab */}
          {activeTab === 'compliance' && (
            <div className="space-y-6">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Compliance Settings</h2>

              <div className={`p-4 rounded-lg ${isDark ? 'bg-emerald-900/30 border border-emerald-800' : 'bg-emerald-50 border border-emerald-200'}`}>
                <h3 className={`font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-800'}`}>KYC Status: Verified</h3>
                <p className={`text-sm mt-1 ${isDark ? 'text-emerald-500' : 'text-emerald-600'}`}>Your identity has been verified on Oct 15, 2023</p>
              </div>

              <div className={`p-4 rounded-lg ${isDark ? 'border border-gray-700' : 'border border-gray-200'}`}>
                <h3 className={`font-medium mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Risk Level</h3>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${isDark ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-700'}`}>LOW</span>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Based on your transaction history and profile</span>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${isDark ? 'border border-gray-700' : 'border border-gray-200'}`}>
                <h3 className={`font-medium mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Transaction Limits</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Daily Limit</span>
                    <span className={`font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>$50,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Monthly Limit</span>
                    <span className={`font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>$500,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Single Transaction Limit</span>
                    <span className={`font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>$25,000</span>
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${isDark ? 'border border-gray-700' : 'border border-gray-200'}`}>
                <h3 className={`font-medium mb-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Documents</h3>
                <div className="space-y-2">
                  <div className={`flex items-center justify-between p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>ID Document</span>
                    <span className="text-xs text-green-500">Verified</span>
                  </div>
                  <div className={`flex items-center justify-between p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Proof of Address</span>
                    <span className="text-xs text-green-500">Verified</span>
                  </div>
                  <div className={`flex items-center justify-between p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Source of Funds</span>
                    <span className="text-xs text-yellow-500">Pending</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <h2 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Billing & Subscription</h2>

              <div className={`p-4 rounded-lg ${isDark ? 'border border-emerald-800 bg-emerald-900/30' : 'border border-emerald-200 bg-emerald-50'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-800'}`}>Pro Plan</h3>
                    <p className={`text-sm ${isDark ? 'text-emerald-500' : 'text-emerald-600'}`}>$29.99/month</p>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500 text-white rounded-full text-sm">Active</span>
                </div>
              </div>

              <div className={`p-4 rounded-lg ${isDark ? 'border border-gray-700' : 'border border-gray-200'}`}>
                <h3 className={`font-medium mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Payment Method</h3>
                <div className={`flex items-center gap-4 p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                    VISA
                  </div>
                  <div>
                    <p className={`font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>**** **** **** 4242</p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Expires 12/2025</p>
                  </div>
                </div>
                <button className="mt-4 text-emerald-500 text-sm font-medium hover:underline">
                  + Add new payment method
                </button>
              </div>

              <div className={`p-4 rounded-lg ${isDark ? 'border border-gray-700' : 'border border-gray-200'}`}>
                <h3 className={`font-medium mb-4 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Billing History</h3>
                <table className="w-full">
                  <thead>
                    <tr className={`text-left text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Description</th>
                      <th className="pb-2">Amount</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <tr className={isDark ? 'border-t border-gray-700' : 'border-t border-gray-100'}>
                      <td className="py-2">Oct 1, 2023</td>
                      <td className="py-2">Pro Plan - Monthly</td>
                      <td className="py-2">$29.99</td>
                      <td className="py-2"><span className="text-green-500">Paid</span></td>
                    </tr>
                    <tr className={isDark ? 'border-t border-gray-700' : 'border-t border-gray-100'}>
                      <td className="py-2">Sep 1, 2023</td>
                      <td className="py-2">Pro Plan - Monthly</td>
                      <td className="py-2">$29.99</td>
                      <td className="py-2"><span className="text-green-500">Paid</span></td>
                    </tr>
                    <tr className={isDark ? 'border-t border-gray-700' : 'border-t border-gray-100'}>
                      <td className="py-2">Aug 1, 2023</td>
                      <td className="py-2">Pro Plan - Monthly</td>
                      <td className="py-2">$29.99</td>
                      <td className="py-2"><span className="text-green-500">Paid</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition-colors"
            >
              <Save size={18} />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}