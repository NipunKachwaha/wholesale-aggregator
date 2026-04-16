import { useState, useEffect, useRef } from 'react'
import { gsap }                        from 'gsap'
import { useTranslation }              from 'react-i18next'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'

// ── Mock data generators
const generateRevenueData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return months.map((month, i) => ({
    month,
    revenue:  Math.floor(Math.random() * 50000) + 20000,
    orders:   Math.floor(Math.random() * 100)   + 50,
    products: Math.floor(Math.random() * 500)   + 200,
  }))
}

const generateCategoryData = () => [
  { name: 'Grains',     value: 35, color: '#3b82f6' },
  { name: 'Oils',       value: 25, color: '#8b5cf6' },
  { name: 'Pulses',     value: 20, color: '#06b6d4' },
  { name: 'Beverages',  value: 12, color: '#10b981' },
  { name: 'Others',     value: 8,  color: '#f59e0b' },
]

const generatePerformanceData = () => [
  { metric: 'Delivery',   current: 85, target: 90 },
  { metric: 'Quality',    current: 92, target: 95 },
  { metric: 'Price',      current: 78, target: 85 },
  { metric: 'Stock',      current: 88, target: 90 },
  { metric: 'Returns',    current: 95, target: 98 },
  { metric: 'Accuracy',   current: 87, target: 92 },
]

// ── Custom Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 text-white p-3 rounded-xl shadow-xl text-xs">
      <p className="font-bold mb-1">{label}</p>
      {payload.map((entry: any) => (
        <p key={entry.dataKey} style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === 'number'
            ? entry.value.toLocaleString('en-IN')
            : entry.value}
        </p>
      ))}
    </div>
  )
}

type ChartType = 'area' | 'bar' | 'line'

export default function RevenueChart() {
  const { t }           = useTranslation()
  const [chartType, setChartType] = useState<ChartType>('area')
  const [revenueData]   = useState(generateRevenueData)
  const [categoryData]  = useState(generateCategoryData)
  const [perfData]      = useState(generatePerformanceData)
  const containerRef    = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.fromTo(containerRef.current,
      { y: 30, opacity: 0 },
      { y: 0,  opacity: 1, duration: 0.6, ease: 'power2.out' }
    )
  }, [])

  const CHART_TYPES: { type: ChartType; label: string; icon: string }[] = [
    { type: 'area', label: 'Area',   icon: '📈' },
    { type: 'bar',  label: 'Bar',    icon: '📊' },
    { type: 'line', label: 'Line',   icon: '📉' },
  ]

  const renderMainChart = () => {
    const commonProps = {
      data:   revenueData,
      margin: { top: 5, right: 10, left: 0, bottom: 5 },
    }

    switch (chartType) {
      case 'area':
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
              </linearGradient>
              <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area type="monotone" dataKey="revenue" stroke="#3b82f6"
                  fill="url(#colorRevenue)" strokeWidth={2} name="Revenue (₹)" />
            <Area type="monotone" dataKey="orders"  stroke="#8b5cf6"
                  fill="url(#colorOrders)"  strokeWidth={2} name="Orders" />
          </AreaChart>
        )
      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="revenue" fill="#3b82f6" name="Revenue (₹)"
                 radius={[4, 4, 0, 0]} />
            <Bar dataKey="orders"  fill="#8b5cf6" name="Orders"
                 radius={[4, 4, 0, 0]} />
          </BarChart>
        )
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#3b82f6"
                  strokeWidth={2} dot={{ r: 4 }} name="Revenue (₹)" />
            <Line type="monotone" dataKey="orders"  stroke="#8b5cf6"
                  strokeWidth={2} dot={{ r: 4 }} name="Orders" />
          </LineChart>
        )
    }
  }

  return (
    <div ref={containerRef} className="space-y-6">

      {/* Main Revenue Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-800 dark:text-white">
              📊 Revenue & Orders Trend
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Last 12 months performance
            </p>
          </div>

          {/* Chart Type Switcher */}
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            {CHART_TYPES.map(({ type, label, icon }) => (
              <button
                key={type}
                onClick={() => setChartType(type)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  chartType === type
                    ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-56 md:h-72">
          <ResponsiveContainer width="100%" height="100%">
            {renderMainChart()}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row — Pie + Radar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Category Distribution Pie */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-4 md:p-6">
          <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-4">
            🥧 Category Distribution
          </h3>
          <div className="h-48 md:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius="50%"
                  outerRadius="75%"
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value}%`, 'Share']}
                  contentStyle={{
                    background: '#1e293b', border: 'none',
                    borderRadius: '8px', color: '#f8fafc', fontSize: '12px',
                  }}
                />
                <Legend
                  iconType="circle"
                  formatter={(value) => (
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vendor Performance Radar */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm p-4 md:p-6">
          <h3 className="text-base font-semibold text-slate-800 dark:text-white mb-4">
            🎯 Vendor Performance Radar
          </h3>
          <div className="h-48 md:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={perfData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis
                  dataKey="metric"
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fontSize: 9, fill: '#94a3b8' }}
                />
                <Radar name="Current" dataKey="current"
                       stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2}
                       strokeWidth={2} />
                <Radar name="Target"  dataKey="target"
                       stroke="#10b981" fill="#10b981" fillOpacity={0.1}
                       strokeWidth={2} strokeDasharray="4 4" />
                <Tooltip
                  contentStyle={{
                    background: '#1e293b', border: 'none',
                    borderRadius: '8px', color: '#f8fafc', fontSize: '12px',
                  }}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      {value}
                    </span>
                  )}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* KPI Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Revenue', value: '₹8.4L', change: '+12%', up: true,  icon: '💰' },
          { label: 'Avg Order Val', value: '₹3,400', change: '+5%',  up: true,  icon: '📦' },
          { label: 'Return Rate',   value: '2.3%',   change: '-0.5%', up: true, icon: '↩️' },
          { label: 'On-time Del',   value: '94%',    change: '+2%',  up: true,  icon: '🚚' },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-3 md:p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl">{kpi.icon}</span>
              <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                kpi.up
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-600'
              }`}>
                {kpi.change}
              </span>
            </div>
            <p className="text-lg md:text-xl font-bold text-slate-800 dark:text-white">
              {kpi.value}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}