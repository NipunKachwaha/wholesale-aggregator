import { useState, useRef } from 'react'
import { gsap }             from 'gsap'

interface ExportButtonProps {
  reportType: 'products' | 'orders'
  label?:     string
  status?:    string
}

const CATALOG_URL = 'http://localhost:3002'
const TENANT_ID   = '00000000-0000-0000-0000-000000000001'

export default function ExportButton({
  reportType, label, status
}: ExportButtonProps) {
  const [loading, setLoading] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)

  const handleExport = async () => {
    setLoading(true)

    // Spin animation
    gsap.to(btnRef.current, {
      rotation: 360, duration: 0.8,
      ease: 'power2.inOut',
      onComplete: () => gsap.set(btnRef.current, { rotation: 0 })
    })

    try {
      const params = new URLSearchParams({ tenantId: TENANT_ID })
      if (status) params.append('status', status)

      const url = `${CATALOG_URL}/catalog/reports/${reportType}?${params}`

      // Download trigger
      const response = await fetch(url)
      const blob     = await response.blob()
      const link     = document.createElement('a')
      link.href      = URL.createObjectURL(blob)
      link.download  = `${reportType}-report-${Date.now()}.pdf`
      link.click()
      URL.revokeObjectURL(link.href)

    } catch (err) {
      alert('PDF export failed — catalog service chal rahi hai?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      ref={btnRef}
      onClick={handleExport}
      disabled={loading}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        loading
          ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
          : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800'
      }`}
    >
      <span>{loading ? '⏳' : '📄'}</span>
      <span>{loading ? 'Generating...' : (label || 'Export PDF')}</span>
    </button>
  )
}