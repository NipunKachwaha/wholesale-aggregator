import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector }          from 'react-redux'
import { useEffect, useRef }                 from 'react'
import { gsap }                             from 'gsap'
import type { RootState }                   from '../../store'
import { logout, toggleSidebar }            from '../../store'
import { useTranslation }                   from 'react-i18next'

const navItems = [
  { path: '/',          icon: '📊', key: 'dashboard'  },
  { path: '/products',  icon: '📦', key: 'products'   },
  { path: '/orders',    icon: '🛒', key: 'orders'     },
  { path: '/vendors',   icon: '🏭', key: 'vendors'    },
  { path: '/analytics', icon: '📈', key: 'analytics'  },
]

// Sirf admin ke liye alag items
const adminItems = [
  { path: '/admin', icon: '🛡️', key: 'admin' },
]

export default function Sidebar() {
  const dispatch        = useDispatch()
  const navigate        = useNavigate()
  const location        = useLocation()
  const { t }           = useTranslation()
  const { user }        = useSelector((s: RootState) => s.auth)
  const { sidebarOpen } = useSelector((s: RootState) => s.ui)

  const sidebarRef  = useRef<HTMLElement>(null)
  const overlayRef  = useRef<HTMLDivElement>(null)
  const navRefs     = useRef<(HTMLAnchorElement | null)[]>([])
  // Admin nav items ke liye alag refs
  const adminNavRef = useRef<HTMLAnchorElement | null>(null)

  // Mobile detection
  const isMobile = window.innerWidth < 768

  useEffect(() => {
    const tl = gsap.timeline()
    tl.fromTo(sidebarRef.current,
      { x: -100, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }
    )
    .fromTo(navRefs.current,
      { x: -20, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.3, stagger: 0.07, ease: 'power2.out' },
      '-=0.2'
    )

    // Admin link bhi animate karo agar user admin hai
    if (adminNavRef.current) {
      tl.fromTo(adminNavRef.current,
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.3, ease: 'power2.out' },
        '-=0.1'
      )
    }
  }, [])

  // Mobile mein overlay show
  useEffect(() => {
    if (isMobile && sidebarOpen && overlayRef.current) {
      gsap.fromTo(overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.2 }
      )
    }
  }, [sidebarOpen, isMobile])

  const handleLogout = () => {
    gsap.to(sidebarRef.current, {
      x: -100, opacity: 0, duration: 0.3,
      onComplete: () => { dispatch(logout()); navigate('/login') }
    })
  }

  const handleNavClick = () => {
    // Mobile mein nav click pe sidebar close karo
    if (isMobile) dispatch(toggleSidebar())
  }

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && sidebarOpen && (
        <div
          ref={overlayRef}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}

      <aside
        ref={sidebarRef}
        className={`
          fixed left-0 top-0 h-full z-50 flex flex-col
          bg-slate-800 dark:bg-slate-950 text-white
          transition-all duration-300
          ${sidebarOpen ? 'w-64' : 'w-0 md:w-16'}
          ${isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-700 min-w-max">
          <span className="text-2xl">🏪</span>
          {sidebarOpen && (
            <span className="font-bold text-lg whitespace-nowrap">
              Wholesale
            </span>
          )}
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="ml-auto text-slate-400 hover:text-white text-xl p-1"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">

          {/* ── Regular Nav Items ── */}
          {navItems.map((item, i) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              ref={(el) => { navRefs.current[i] = el }}
              onClick={handleNavClick}
              onMouseEnter={(e) => {
                gsap.to(e.currentTarget, { x: 4, duration: 0.2 })
              }}
              onMouseLeave={(e) => {
                gsap.to(e.currentTarget, { x: 0, duration: 0.2 })
              }}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 mx-2 rounded-lg
                transition-colors duration-150 mb-1 min-w-max
                ${isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }
              `}
            >
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              {sidebarOpen && (
                <span className="whitespace-nowrap font-medium">
                  {t(`nav.${item.key}`)}
                </span>
              )}
            </NavLink>
          ))}

          {/* ── Admin Link — sirf admin role wale users ko dikhega ── */}
          {user?.role === 'admin' && (
            <div className="border-t border-slate-700 mt-2 pt-2">
              {adminItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  ref={(el) => { adminNavRef.current = el }}
                  onClick={handleNavClick}
                  onMouseEnter={(e) => {
                    gsap.to(e.currentTarget, { x: 4, duration: 0.2 })
                  }}
                  onMouseLeave={(e) => {
                    gsap.to(e.currentTarget, { x: 0, duration: 0.2 })
                  }}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 mx-2 rounded-lg
                    transition-colors duration-150 mb-1 min-w-max
                    ${isActive
                      ? 'bg-red-600 text-white'
                      : 'text-red-300 hover:bg-red-900/30 hover:text-red-200'
                    }
                  `}
                >
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  {sidebarOpen && (
                    <span className="whitespace-nowrap font-medium">
                      {/* Translation key nahi hai toh fallback text */}
                      {t(`nav.${item.key}`, 'Admin Panel')}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          )}

        </nav>

        {/* User + Logout */}
        <div className="border-t border-slate-700 p-4 min-w-max">
          {sidebarOpen && user && (
            <div className="mb-3">
              <p className="text-sm font-medium text-white truncate max-w-[180px]">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-slate-400 truncate max-w-[180px]">
                {user.email}
              </p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-blue-600 text-xs rounded-full capitalize">
                {user.role}
              </span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors"
          >
            <span className="text-xl">🚪</span>
            {sidebarOpen && (
              <span className="text-sm">{t('nav.logout')}</span>
            )}
          </button>
        </div>
      </aside>
    </>
  )
}