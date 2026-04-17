import { useState, useEffect, useRef } from 'react'
import { gsap }                        from 'gsap'
import { useSelector }                 from 'react-redux'
import { Navigate }                    from 'react-router-dom'
import type { RootState }              from '../../store'
import axios                           from 'axios'

const AUTH_URL  = 'http://localhost:3001'
const ORDER_URL = 'http://localhost:3003'
const TENANT_ID = '00000000-0000-0000-0000-000000000001'

// ── Mock tenant data
const MOCK_TENANTS = [
  { id: '00000000-0000-0000-0000-000000000001', name: 'Demo Tenant',  plan: 'enterprise', users: 8,  orders: 248, isActive: true  },
  { id: '00000000-0000-0000-0000-000000000002', name: 'ABC Traders',  plan: 'pro',        users: 12, orders: 156, isActive: true  },
  { id: '00000000-0000-0000-0000-000000000003', name: 'XYZ Supplies', plan: 'starter',    users: 3,  orders: 45,  isActive: false },
]

const PLAN_COLORS: Record<string, string> = {
  starter:    'bg-slate-100 text-slate-700',
  pro:        'bg-blue-100 text-blue-700',
  enterprise: 'bg-purple-100 text-purple-700',
}

type AdminTab = 'tenants' | 'users' | 'system' | 'billing'

export default function AdminPanel() {
  const { user }     = useSelector((s: RootState) => s.auth)
  const [tab,       setTab]       = useState<AdminTab>('tenants')
  const [tenants,   setTenants]   = useState(MOCK_TENANTS)
  const [users,     setUsers]     = useState<any[]>([])
  const [systemStats, setSystemStats] = useState<any>(null)
  const [loading,   setLoading]   = useState(false)

  const panelRef = useRef<HTMLDivElement>(null)

  // Sirf admin access kar sakta hai
  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  useEffect(() => {
    gsap.fromTo(panelRef.current,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
    )
    fetchUsers()
    fetchSystemStats()
  }, [])

  const fetchUsers = async () => {
    // Mock users
    setUsers([
      { id: '1', email: 'admin@demo.com',    role: 'admin',     tenant: 'Demo',     lastLogin: '2 min ago',   isActive: true  },
      { id: '2', email: 'buyer@demo.com',    role: 'purchaser', tenant: 'Demo',     lastLogin: '1 hour ago',  isActive: true  },
      { id: '3', email: 'viewer@demo.com',   role: 'viewer',    tenant: 'Demo',     lastLogin: '2 days ago',  isActive: true  },
      { id: '4', email: 'supplier@abc.com',  role: 'supplier',  tenant: 'ABC',      lastLogin: '3 hours ago', isActive: true  },
      { id: '5', email: 'admin@xyz.com',     role: 'admin',     tenant: 'XYZ',      lastLogin: 'Never',       isActive: false },
    ])
  }

  const fetchSystemStats = async () => {
    setSystemStats({
      services: [
        { name: 'Gateway',    port: 3000, status: 'healthy', uptime: '99.9%' },
        { name: 'Auth',       port: 3001, status: 'healthy', uptime: '99.9%' },
        { name: 'Catalog',    port: 3002, status: 'healthy', uptime: '99.8%' },
        { name: 'Orders',     port: 3003, status: 'healthy', uptime: '99.9%' },
        { name: 'GraphQL',    port: 4000, status: 'healthy', uptime: '99.7%' },
        { name: 'AI Service', port: 8000, status: 'healthy', uptime: '99.5%' },
        { name: 'Collab',     port: 3004, status: 'healthy', uptime: '99.9%' },
      ],
      database: {
        postgres:      'healthy',
        mongodb:       'healthy',
        redis:         'healthy',
        elasticsearch: 'healthy',
      },
      metrics: {
        totalRequests:   '1.2M',
        avgResponseTime: '45ms',
        errorRate:       '0.02%',
        activeUsers:     12,
      }
    })
  }

  const TABS: { key: AdminTab; label: string; icon: string }[] = [
    { key: 'tenants', label: 'Tenants',     icon: '🏢' },
    { key: 'users',   label: 'Users',       icon: '👥' },
    { key: 'system',  label: 'System',      icon: '⚙️' },
    { key: 'billing', label: 'Billing',     icon: '💳' },
  ]

  return (
    <div ref={panelRef} className="space-y-6">

      {/* Admin Badge */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-600 to-red-700 rounded-xl text-white">
        <span className="text-3xl">🛡️</span>
        <div>
          <h2 className="font-bold text-lg">Super Admin Panel</h2>
          <p className="text-red-100 text-sm">
            Full system access — {MOCK_TENANTS.length} tenants managed
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm text-red-100">System Healthy</span>
        </div>
      </div>

      {/* Overview KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Tenants',  value: MOCK_TENANTS.length,                                    icon: '🏢', color: 'bg-blue-500'   },
          { label: 'Total Users',    value: users.length,                                            icon: '👥', color: 'bg-green-500'  },
          { label: 'Active Plans',   value: MOCK_TENANTS.filter((t) => t.isActive).length,           icon: '✅', color: 'bg-purple-500' },
          { label: 'Total Revenue',  value: '₹8.4L',                                                 icon: '💰', color: 'bg-orange-500' },
        ].map((kpi) => (
          <div key={kpi.label}
               className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4">
            <div className={`w-10 h-10 ${kpi.color} rounded-lg flex items-center justify-center text-xl mb-3`}>
              {kpi.icon}
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{kpi.value}</p>
            <p className="text-xs text-slate-500 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="flex border-b border-slate-100 dark:border-slate-700">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                tab === t.key
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {/* Tenants Tab */}
          {tab === 'tenants' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-800 dark:text-white">
                  All Tenants
                </h3>
                <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                  + Add Tenant
                </button>
              </div>
              {tenants.map((tenant) => (
                <div key={tenant.id}
                     className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                      {tenant.name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 dark:text-white">{tenant.name}</p>
                      <p className="text-xs text-slate-500">{tenant.id.slice(0, 12)}...</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${PLAN_COLORS[tenant.plan]}`}>
                      {tenant.plan}
                    </span>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">{tenant.users}</p>
                      <p className="text-xs text-slate-400">users</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">{tenant.orders}</p>
                      <p className="text-xs text-slate-400">orders</p>
                    </div>
                    <span className={`w-2 h-2 rounded-full ${tenant.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                    <button className="text-xs text-blue-600 hover:text-blue-700">Manage →</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Users Tab */}
          {tab === 'users' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-slate-800 dark:text-white">All Users</h3>
                <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                  + Invite User
                </button>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700">
                    {['Email', 'Role', 'Tenant', 'Last Login', 'Status', ''].map((h) => (
                      <th key={h} className="text-left py-2 px-3 text-slate-500 text-xs font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-slate-50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{u.email}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          u.role === 'admin' ? 'bg-red-100 text-red-700' :
                          u.role === 'purchaser' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>{u.role}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 text-xs">{u.tenant}</td>
                      <td className="py-2.5 px-3 text-slate-400 text-xs">{u.lastLogin}</td>
                      <td className="py-2.5 px-3">
                        <span className={`w-2 h-2 inline-block rounded-full ${u.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                      </td>
                      <td className="py-2.5 px-3">
                        <button className="text-xs text-blue-600 hover:text-blue-700">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* System Tab */}
          {tab === 'system' && systemStats && (
            <div className="space-y-4">
              {/* Services */}
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white mb-3">
                  Microservices Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {systemStats.services.map((svc: any) => (
                    <div key={svc.name}
                         className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-700 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          svc.status === 'healthy' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                        }`} />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {svc.name}
                        </span>
                        <span className="text-xs text-slate-400">:{svc.port}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-green-600 font-medium">{svc.uptime}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          svc.status === 'healthy' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                        }`}>{svc.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metrics */}
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white mb-3">
                  Performance Metrics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(systemStats.metrics).map(([key, val]) => (
                    <div key={key}
                         className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 text-center">
                      <p className="text-lg font-bold text-slate-800 dark:text-white">{val as string}</p>
                      <p className="text-xs text-slate-500 mt-1 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Database status */}
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white mb-3">
                  Database Status
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(systemStats.database).map(([db, status]) => (
                    <div key={db}
                         className="flex items-center gap-2 p-3 border border-slate-100 dark:border-slate-700 rounded-lg">
                      <span className={`w-2 h-2 rounded-full ${status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-sm text-slate-700 dark:text-slate-300 capitalize">{db}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Billing Tab */}
          {tab === 'billing' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-800 dark:text-white">Plan Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { plan: 'Starter',    price: '₹999/mo',  features: ['1 vendor', '100 orders', 'Basic reports'],          color: 'border-slate-200', tenants: 1 },
                  { plan: 'Pro',        price: '₹2,999/mo', features: ['5 vendors', '1K orders', 'AI features', 'PDF export'], color: 'border-blue-300', tenants: 1 },
                  { plan: 'Enterprise', price: '₹9,999/mo', features: ['Unlimited', 'All features', 'Priority support', 'Custom'], color: 'border-purple-300', tenants: 1 },
                ].map((plan) => (
                  <div key={plan.plan}
                       className={`border-2 ${plan.color} rounded-xl p-5`}>
                    <h4 className="font-bold text-slate-800 dark:text-white mb-1">{plan.plan}</h4>
                    <p className="text-2xl font-bold text-blue-600 mb-3">{plan.price}</p>
                    <ul className="space-y-1 mb-4">
                      {plan.features.map((f) => (
                        <li key={f} className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1">
                          <span className="text-green-500">✓</span> {f}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-slate-400">{plan.tenants} active tenant</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}