import { useSelector }        from 'react-redux'
import { Outlet, useLocation } from 'react-router-dom'
import type { RootState }     from '../../store'
import Sidebar                from './Sidebar'
import Header                 from './Header'
import { useTranslation }     from 'react-i18next'

const PAGE_TITLE_KEYS: Record<string, string> = {
  '/':          'nav.dashboard',
  '/products':  'nav.products',
  '/orders':    'nav.orders',
  '/vendors':   'nav.vendors',
  '/analytics': 'nav.analytics',
}

export default function Layout() {
  const { sidebarOpen } = useSelector((s: RootState) => s.ui)
  const location        = useLocation()
  const { t }           = useTranslation()
  const titleKey        = PAGE_TITLE_KEYS[location.pathname] || 'nav.dashboard'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Sidebar />
      <div className={`
        transition-all duration-300 min-h-screen
        ml-0
        ${sidebarOpen ? 'md:ml-64' : 'md:ml-16'}
      `}>
        <Header title={t(titleKey)} />
        <main className="pt-16 p-3 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}