import { useState, useRef } from 'react'
import { gsap } from 'gsap'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts'
import { forecastDemand } from '../../services/ai.service'

const SAMPLE_SKUS = ['RICE-001', 'OIL-001', 'DAL-001', 'TEA-001']
const TENANT_ID   = '00000000-0000-0000-0000-000000000001'

export default function DemandForecast() {
  const [sku,     setSku]     = useState(SAMPLE_SKUS[0])
  const [days,    setDays]    = useState(14)
  const [result,  setResult]  = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const chartRef = useRef<HTMLDivElement>(null)

  const handleForecast = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await forecastDemand({
        sku, tenant_id: TENANT_ID, days
      })
      setResult(data)

      setTimeout(() => {
        gsap.fromTo(chartRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }
        )
      }, 50)

    } catch {
      setError('Forecast data load nahi ho pa raha')
    } finally {
      setLoading(false)
    }
  }

  const trendColor = result?.trend === 'increasing'
    ? 'text-green-600 bg-green-50'
    : result?.trend === 'decreasing'
    ? 'text-red-600 bg-red-50'
    : 'text-blue-600 bg-blue-50'

  // Chart ke liye data format
  const chartData = result?.forecasts?.map((f: any, i: number) => ({
    day:       `Day ${i + 1}`,
    predicted: f.predicted,
    lower:     f.lower,
    upper:     f.upper,
  })) || []

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">
        📈 Demand Forecaster
      </h3>

      {/* Controls */}
      <div className="flex gap-3 mb-4">
        <select
          value={sku}
          onChange={(e) => { setSku(e.target.value); setResult(null) }}
          className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {SAMPLE_SKUS.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value={7}>7 days</option>
          <option value={14}>14 days</option>
          <option value={30}>30 days</option>
        </select>
      </div>

      <button
        onClick={handleForecast}
        disabled={loading}
        className={`w-full py-3 rounded-lg font-medium text-white mb-4 transition-colors ${
          loading ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-700'
        }`}
      >
        {loading ? '⏳ Forecasting...' : '🔮 Generate Forecast'}
      </button>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm mb-4">
          ❌ {error}
        </div>
      )}

      {result && (
        <div ref={chartRef} className="space-y-4">
          {/* Trend Badge */}
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${trendColor}`}>
            {result.trend === 'increasing' ? '📈' :
             result.trend === 'decreasing' ? '📉' : '➡️'}
            {result.trend.charAt(0).toUpperCase() + result.trend.slice(1)}
          </div>

          {/* Summary */}
          <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
            {result.summary}
          </p>

          {/* Chart */}
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  interval={Math.floor(chartData.length / 4)}
                />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    background: '#1e293b',
                    border:     'none',
                    borderRadius: '8px',
                    color:      '#f8fafc',
                    fontSize:   '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="predicted"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fill="url(#colorPred)"
                  name="Predicted"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {!result && !loading && (
        <div className="text-center py-8 text-slate-400">
          <p className="text-4xl mb-2">🔮</p>
          <p className="text-sm">SKU select karo aur forecast generate karo</p>
        </div>
      )}
    </div>
  )
}