import { useSelector }       from 'react-redux'
import type { RootState }    from '../../store'
import NotificationPanel     from '../NotificationPanel'

interface HeaderProps {
  title: string
}

export default function Header({ title }: HeaderProps) {
  const { sidebarOpen } = useSelector((state: RootState) => state.ui)

  return (
    <header className={`
      fixed top-0 right-0 h-16 bg-white border-b border-slate-200
      flex items-center px-6 z-40 transition-all duration-300
      ${sidebarOpen ? 'left-64' : 'left-16'}
    `}>
      <h1 className="text-xl font-semibold text-slate-800">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        {/* Real-time Notifications */}
        <NotificationPanel />

        {/* Settings */}
        <button className="p-2 text-slate-500 hover:text-slate-800 text-xl transition-colors">
          ⚙️
        </button>
      </div>
    </header>
  )
}