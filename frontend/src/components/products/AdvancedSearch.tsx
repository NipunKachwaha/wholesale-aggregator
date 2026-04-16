import { useState, useRef, useEffect, useCallback } from 'react'
import { gsap }   from 'gsap'
import axios      from 'axios'
import { useTranslation } from 'react-i18next'

const CATALOG_URL = 'http://localhost:3002'
const TENANT_ID   = '00000000-0000-0000-0000-000000000001'

interface SearchResult {
  id:         string
  sku:        string
  name:       string
  category:   string
  base_price: number
  stock_qty:  number
  unit:       string
  score?:     number
  highlight?: { name?: string[]; category?: string[] }
}

const SORT_OPTIONS = [
  { value: '',           label: 'Relevance'   },
  { value: 'name',       label: 'Name A-Z'    },
  { value: 'price_asc',  label: 'Price ↑'     },
  { value: 'price_desc', label: 'Price ↓'     },
  { value: 'stock',      label: 'Stock High'  },
]

export default function AdvancedSearch() {
  const { t }           = useTranslation()
  const [query,    setQuery]    = useState('')
  const [results,  setResults]  = useState<SearchResult[]>([])
  const [total,    setTotal]    = useState(0)
  const [took,     setTook]     = useState(0)
  const [loading,  setLoading]  = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters,  setFilters]  = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    minStock: '',
    sortBy:   '',
  })

  const inputRef      = useRef<HTMLInputElement>(null)
  const resultsRef    = useRef<HTMLDivElement>(null)
  const filtersRef    = useRef<HTMLDivElement>(null)
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>()

  const doSearch = useCallback(async (q: string, f = filters) => {
    setLoading(true)
    try {
      const params: any = {
        tenantId: TENANT_ID,
        page:     1,
        limit:    20,
      }
      if (q)           params.q         = q
      if (f.category)  params.category  = f.category
      if (f.minPrice)  params.minPrice  = f.minPrice
      if (f.maxPrice)  params.maxPrice  = f.maxPrice
      if (f.minStock)  params.minStock  = f.minStock
      if (f.sortBy)    params.sortBy    = f.sortBy

      const res = await axios.get(`${CATALOG_URL}/catalog/search`, { params })
      const data = res.data.data

      setResults(data.hits || [])
      setTotal(data.total || 0)
      setTook(data.took || 0)

      // Results animation
      setTimeout(() => {
        const rows = resultsRef.current?.querySelectorAll('.result-row')
        if (rows?.length) {
          gsap.fromTo(Array.from(rows),
            { x: -10, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.2, stagger: 0.03, ease: 'power2.out' }
          )
        }
      }, 50)
    } catch {
      // Fallback to basic search
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Debounced search
  useEffect(() => {
    clearTimeout(debounceTimer.current)
    if (query.length === 0) { setResults([]); setTotal(0); return }
    if (query.length < 2) return

    debounceTimer.current = setTimeout(() => doSearch(query), 300)
    return () => clearTimeout(debounceTimer.current)
  }, [query, doSearch])

  // Filters animation
  useEffect(() => {
    if (showFilters) {
      gsap.fromTo(filtersRef.current,
        { height: 0, opacity: 0 },
        { height: 'auto', opacity: 1, duration: 0.3, ease: 'power2.out' }
      )
    } else {
      gsap.to(filtersRef.current, {
        height: 0, opacity: 0, duration: 0.2
      })
    }
  }, [showFilters])

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    if (query) doSearch(query, newFilters)
  }

  const clearAll = () => {
    setQuery('')
    setResults([])
    setTotal(0)
    setFilters({ category: '', minPrice: '', maxPrice: '', minStock: '', sortBy: '' })
    inputRef.current?.focus()
  }

  // Highlight HTML render karo
  const renderHighlight = (result: SearchResult) => {
    if (result.highlight?.name?.[0]) {
      return (
        <span
          dangerouslySetInnerHTML={{ __html: result.highlight.name[0] }}
          className="[&_mark]:bg-yellow-200 [&_mark]:dark:bg-yellow-800 [&_mark]:rounded [&_mark]:px-0.5"
        />
      )
    }
    return <span>{result.name}</span>
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">

      {/* Search Bar */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-700">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              🔍
            </span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products, SKUs, categories..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
            {loading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
              showFilters
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            ⚡ Filters
          </button>
          {(query || Object.values(filters).some(Boolean)) && (
            <button
              onClick={clearAll}
              className="px-3 py-2 text-slate-400 hover:text-red-500 transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Advanced Filters */}
        <div ref={filtersRef} className="overflow-hidden" style={{ height: 0 }}>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-2 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {['Grains','Oils','Flour','Sugar','Spices','Pulses','Beverages'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              placeholder="Min Price ₹"
              className="px-2 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              placeholder="Max Price ₹"
              className="px-2 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

            <input
              type="number"
              value={filters.minStock}
              onChange={(e) => handleFilterChange('minStock', e.target.value)}
              placeholder="Min Stock"
              className="px-2 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-2 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {query.length >= 2 && (
        <div>
          {/* Stats bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {total} results
              {took > 0 && ` (${took}ms)`}
            </p>
            <button
              onClick={async () => {
                await axios.post(`${CATALOG_URL}/catalog/reindex`, { tenantId: TENANT_ID })
                doSearch(query)
              }}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              🔄 Re-index
            </button>
          </div>

          <div ref={resultsRef} className="divide-y divide-slate-50 dark:divide-slate-700 max-h-80 overflow-y-auto">
            {results.length === 0 && !loading ? (
              <div className="text-center py-8 text-slate-400">
                <p className="text-2xl mb-2">🔍</p>
                <p className="text-sm">No results for "{query}"</p>
              </div>
            ) : (
              results.map((result) => (
                <div
                  key={result.id}
                  className="result-row flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded flex-shrink-0">
                      {result.sku}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-white">
                        {renderHighlight(result)}
                      </p>
                      <p className="text-xs text-slate-400">
                        {result.category}
                        {result.score && (
                          <span className="ml-2 text-slate-300">
                            score: {result.score.toFixed(2)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">
                      ₹{Number(result.base_price).toFixed(2)}
                    </p>
                    <p className={`text-xs ${
                      result.stock_qty < 50 ? 'text-red-500' : 'text-green-600'
                    }`}>
                      {result.stock_qty} {result.unit}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}