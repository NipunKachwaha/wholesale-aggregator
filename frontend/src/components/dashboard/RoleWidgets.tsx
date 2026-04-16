import { useSelector }    from 'react-redux'
import { useRef, useEffect } from 'react'
import { gsap }           from 'gsap'
import { Link }           from 'react-router-dom'
import type { RootState } from '../../store'
import { useTranslation } from 'react-i18next'

// ── Widget types
interface Widget {
  id:       string
  title:    string
  value:    string
  subtitle: string
  icon:     string
  color:    string
  link:     string
  roles:    string[]
}

const ALL_WIDGETS: Widget[] = [
  // Admin only
  {
    id:       'total_users',
    title:    'Total Users',
    value:    '8',
    subtitle: '2 admins, 6 others',
    icon:     '👥',
    color:    'from-blue-500 to-blue-600',
    link:     '/settings',
    roles:    ['admin'],
  },
  {
    id:       'system_health',
    title:    'System Health',
    value:    '99.9%',
    subtitle: 'All services running',
    icon:     '💚',
    color:    'from-green-500 to-green-600',
    link:     '/analytics',
    roles:    ['admin'],
  },
  // Admin + Purchaser
  {
    id:       'pending_orders',
    title:    'Pending Orders',
    value:    '12',
    subtitle: 'Needs confirmation',
    icon:     '⏳',
    color:    'from-yellow-500 to-orange-500',
    link:     '/orders',
    roles:    ['admin', 'purchaser'],
  },
  {
    id:       'total_revenue',
    title:    'This Month Revenue',
    value:    '₹2.4L',
    subtitle: '+18% from last month',
    icon:     '💰',
    color:    'from-emerald-500 to-green-600',
    link:     '/analytics',
    roles:    ['admin', 'purchaser'],
  },
  // All roles
  {
    id:       'my_orders',
    title:    'My Orders',
    value:    '5',
    subtitle: '2 pending, 3 confirmed',
    icon:     '🛒',
    color:    'from-purple-500 to-purple-600',
    link:     '/orders',
    roles:    ['admin', 'purchaser', 'viewer', 'supplier'],
  },
  {
    id:       'catalog_items',
    title:    'Catalog Items',
    value:    '1,842',
    subtitle: '10 low stock alerts',
    icon:     '📦',
    color:    'from-cyan-500 to-blue-500',
    link:     '/products',
    roles:    ['admin', 'purchaser', 'viewer', 'supplier'],
  },
  // Supplier only
  {
    id:       'my_products',
    title:    'My Products',
    value:    '42',
    subtitle: 'Last synced 2h ago',
    icon:     '🏭',
    color:    'from-slate-500 to-slate-600',
    link:     '/vendors',
    roles:    ['supplier'],
  },
  // Viewer + others
  {
    id:       'price_alerts',
    title:    'Price Alerts',
    value:    '3',
    subtitle: 'Significant changes',
    icon:     '🔔',
    color:    'from-red-500 to-rose-600',
    link:     '/analytics',
    roles:    ['admin', 'purchaser', 'viewer'],
  },
]

// ── Widget Card
function WidgetCard({ widget, index }: { widget: Widget; index: number }) {
  const cardRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    gsap.fromTo(cardRef.current,
      { y: 40, opacity: 0, scale: 0.9 },
      {
        y: 0, opacity: 1, scale: 1,
        duration: 0.4,
        delay:    index * 0.08,
        ease:     'back.out(1.4)',
      }
    )
  }, [index])

  const handleEnter = () => {
    gsap.to(cardRef.current, {
      y: -4, scale: 1.02, duration: 0.2, ease: 'power2.out'
    })
  }
  const handleLeave = () => {
    gsap.to(cardRef.current, {
      y: 0, scale: 1, duration: 0.2, ease: 'power2.out'
    })
  }

  return (
    <Link
      ref={cardRef}
      to={widget.link}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className={`
        relative overflow-hidden rounded-xl p-4 text-white
        bg-gradient-to-br ${widget.color}
        shadow-sm hover:shadow-md transition-shadow
      `}
    >
      {/* Background decoration */}
      <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full" />
      <div className="absolute -right-2 -bottom-4 w-16 h-16 bg-white/10 rounded-full" />

      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl">{widget.icon}</span>
          <span className="text-white/60 text-xs">→</span>
        </div>
        <p className="text-2xl font-bold mb-0.5">{widget.value}</p>
        <p className="text-sm font-medium opacity-90">{widget.title}</p>
        <p className="text-xs opacity-70 mt-1">{widget.subtitle}</p>
      </div>
    </Link>
  )
}

// ── Quick Actions per role
const QUICK_ACTIONS: Record<string, { label: string; icon: string; link: string }[]> = {
  admin: [
    { label: 'Add Vendor',    icon: '🏭', link: '/vendors'   },
    { label: 'View Reports',  icon: '📊', link: '/analytics' },
    { label: 'Manage Orders', icon: '🛒', link: '/orders'    },
    { label: 'Sync Products', icon: '🔄', link: '/products'  },
  ],
  purchaser: [
    { label: 'New Order',     icon: '➕', link: '/orders'    },
    { label: 'View Products', icon: '📦', link: '/products'  },
    { label: 'AI Pricing',    icon: '🤖', link: '/analytics' },
    { label: 'Check Vendors', icon: '🏭', link: '/vendors'   },
  ],
  viewer: [
    { label: 'View Orders',   icon: '🛒', link: '/orders'    },
    { label: 'View Products', icon: '📦', link: '/products'  },
    { label: 'Analytics',     icon: '📊', link: '/analytics' },
  ],
  supplier: [
    { label: 'My Products',   icon: '📦', link: '/products'  },
    { label: 'Sync Feed',     icon: '🔄', link: '/vendors'   },
    { label: 'Orders',        icon: '🛒', link: '/orders'    },
  ],
}

export default function RoleWidgets() {
  const { user }    = useSelector((s: RootState) => s.auth)
  const { t }       = useTranslation()
  const role        = user?.role || 'viewer'

  // Role ke hisaab se widgets filter karo
  const visibleWidgets = ALL_WIDGETS.filter(
    (w) => w.roles.includes(role)
  )

  const actions = QUICK_ACTIONS[role] || QUICK_ACTIONS.viewer

  return (
    <div className="space-y-6">
      {/* Role Badge */}
      <div className="flex items-center gap-3">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
          role === 'admin'     ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'     :
          role === 'purchaser' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
          role === 'supplier'  ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
        }`}>
          {role} Dashboard
        </span>
        <span className="text-slate-500 dark:text-slate-400 text-sm">
          {t('dashboard.welcome')} {user?.firstName}!
        </span>
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {visibleWidgets.map((widget, i) => (
          <WidgetCard key={widget.id} widget={widget} index={i} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-4">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          ⚡ Quick Actions
        </h3>
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <Link
              key={action.label}
              to={action.link}
              className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-700 hover:bg-blue-50 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 rounded-lg text-sm transition-colors border border-slate-200 dark:border-slate-600"
            >
              <span>{action.icon}</span>
              <span>{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}