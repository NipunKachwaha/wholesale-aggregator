import { useEffect, useRef }   from 'react'
import { gsap }                from 'gsap'
import { useTranslation }      from 'react-i18next'
import RoleWidgets             from '../components/dashboard/RoleWidgets'
import NLQueryBar              from '../components/NLQueryBar'

const recentOrders = [
  { id: 1001, sku: 'RICE-001', status: 'confirmed', amount: '₹1,205' },
  { id: 1002, sku: 'OIL-001',  status: 'draft',     amount: '₹900'   },
  { id: 1003, sku: 'DAL-002',  status: 'fulfilled', amount: '₹475'   },
]

const statusColors: Record<string, string> = {
  draft:     'bg-slate-100 text-slate-600',
  confirmed: 'bg-blue-100 text-blue-700',
  fulfilled: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
}

export default function Dashboard() {
  const { t }      = useTranslation()
  const tableRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.fromTo(tableRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, delay: 0.4, ease: 'power2.out' }
    )
  }, [])

  return (
    <div className="space-y-6">

      {/* NL Query Bar */}
      <NLQueryBar />

      {/* Role-based Widgets */}
      <RoleWidgets />

      {/* Recent Orders */}
      <div
        ref={tableRef}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-4 md:p-6"
      >
        <h2 className="text-base md:text-lg font-semibold text-slate-800 dark:text-white mb-4">
          {t('dashboard.recentOrders')}
        </h2>
        <div className="space-y-2">
          {recentOrders.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between py-3 px-2 border-b border-slate-50 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"
            >
              <div>
                <p className="font-medium text-slate-800 dark:text-white text-sm">
                  Order #{order.id}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  SKU: {order.sku}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">
                  {order.amount}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${statusColors[order.status]}`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}