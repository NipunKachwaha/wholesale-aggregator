import { useSelector, useDispatch } from 'react-redux'
import { useRef }                   from 'react'
import { gsap }                     from 'gsap'
import type { RootState }           from '../../store'
import { toggleDarkMode, toggleSidebar } from '../../store'
import NotificationPanel            from '../NotificationPanel'
import { useTranslation }           from 'react-i18next'

interface HeaderProps { title: string }

export default function Header({ title }: HeaderProps) {
  const dispatch  = useDispatch()
  const { sidebarOpen, darkMode } = useSelector((s: RootState) => s.ui)
  const moonRef   = useRef<HTMLButtonElement>(null)
  const { t, i18n } = useTranslation()

  const handleDarkToggle = () => {
    gsap.to(moonRef.current, {
      rotation: 360, scale: 1.3, duration: 0.4,
      ease: 'back.out(1.7)',
      onComplete: () => gsap.set(moonRef.current, { rotation: 0, scale: 1 })
    })
    dispatch(toggleDarkMode())
  }

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'hi' : 'en')
  }

  return (
    <header className={`
      fixed top-0 right-0 h-16
      bg-white dark:bg-slate-900
      border-b border-slate-200 dark:border-slate-700
      flex items-center px-3 md:px-6 z-40
      transition-all duration-300
      left-0
      ${sidebarOpen ? 'md:left-64' : 'md:left-16'}
    `}>
      {/* Mobile hamburger */}
      <button
        onClick={() => dispatch(toggleSidebar())}
        className="md:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white mr-2"
      >
        ☰
      </button>

      <h1 className="text-base md:text-xl font-semibold text-slate-800 dark:text-white truncate">
        {title}
      </h1>

      <div className="ml-auto flex items-center gap-1 md:gap-2">

        {/* Language Toggle */}
        <button
          onClick={toggleLang}
          className="px-2 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
        >
          {i18n.language === 'en' ? '🇮🇳 HI' : '🇺🇸 EN'}
        </button>

        {/* Dark Mode */}
        <button
          ref={moonRef}
          onClick={handleDarkToggle}
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors text-lg"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>

        {/* Notifications */}
        <NotificationPanel />
      </div>
    </header>
  )
}