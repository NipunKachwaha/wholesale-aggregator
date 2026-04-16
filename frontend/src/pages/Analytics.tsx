import { useEffect, useRef, useState } from 'react'
import { gsap }                        from 'gsap'
import { useTranslation }              from 'react-i18next'
import StatsCard                       from '../components/analytics/StatsCard'
import PriceOptimizer                  from '../components/analytics/PriceOptimizer'
import DemandForecast                  from '../components/analytics/DemandForecast'
import RevenueChart                    from '../components/analytics/RevenueChart'
import { checkAiHealth }               from '../services/ai.service'

export default function Analytics() {
  const { t }      = useTranslation()
  const titleRef   = useRef<HTMLDivElement>(null)
  const [aiStatus, setAiStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const [activeTab, setActiveTab] = useState<'overview' | 'ai'>('overview')

  useEffect(() => {
    gsap.fromTo(titleRef.current,
      { y: -20, opacity: 0 },
      { y: 0,   opacity: 1, duration: 0.4, ease: 'power2.out' }
    )
    checkAiHealth()
      .then(() => setAiStatus('online'))
      .catch(() => setAiStatus('offline'))
  }, [])

  const stats = [
    { title: t('analytics.ordersAnalyzed'), value: '248',   icon: '🛒', color: 'bg-blue-500',   trend: 'up'     as const },
    { title: t('analytics.priceSavings'),   value: '12.4%', icon: '💰', color: 'bg-green-500',  trend: 'up'     as const },
    { title: t('analytics.accuracy'),       value: '87%',   icon: '🎯', color: 'bg-purple-500', trend: 'stable' as const },
    {
      title:    t('analytics.aiService'),
      value:    aiStatus === 'online' ? t('common.online') : t('common.offline'),
      icon:     '🤖',
      color:    aiStatus === 'online' ? 'bg-green-500' : 'bg-red-500',
      subtitle: 'localhost:8000',
    },
  ]

  return (
    <div>
      {/* Header */}
      <div ref={titleRef}
           className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          {t('analytics.subtitle')}
        </p>

        {/* AI Status */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm w-fit ${
          aiStatus === 'online'
            ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
            : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            aiStatus === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          }`} />
          AI {aiStatus}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        {stats.map((s) => (
          <StatsCard key={s.title} {...s} />
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'overview', label: '📊 Overview Charts', value: 'overview' as const },
          { key: 'ai',       label: '🤖 AI Tools',        value: 'ai'       as const },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <RevenueChart />
      )}

      {activeTab === 'ai' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PriceOptimizer />
          <DemandForecast />
        </div>
      )}
    </div>
  )
}