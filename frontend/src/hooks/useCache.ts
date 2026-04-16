import { useState, useEffect, useRef, useCallback } from 'react'

interface CacheEntry<T> {
  data:      T
  timestamp: number
  ttl:       number
}

// In-memory cache
const cache = new Map<string, CacheEntry<any>>()

export const useCache = <T>(
  key:     string,
  fetcher: () => Promise<T>,
  ttl:     number = 30000  // 30 seconds default
) => {
  const [data,    setData]    = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)
  const fetcherRef            = useRef(fetcher)
  fetcherRef.current          = fetcher

  const fetchData = useCallback(async (force = false) => {
    // Cache check
    if (!force) {
      const cached = cache.get(key)
      if (cached && Date.now() - cached.timestamp < cached.ttl) {
        setData(cached.data)
        setLoading(false)
        return
      }
    }

    setLoading(true)
    setError(null)

    try {
      const result = await fetcherRef.current()
      cache.set(key, {
        data:      result,
        timestamp: Date.now(),
        ttl,
      })
      setData(result)
    } catch (err: any) {
      setError(err.message || 'Fetch failed')
    } finally {
      setLoading(false)
    }
  }, [key, ttl])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const invalidate = useCallback(() => {
    cache.delete(key)
    fetchData(true)
  }, [key, fetchData])

  const refresh = useCallback(() => fetchData(true), [fetchData])

  return { data, loading, error, refresh, invalidate }
}

// ── Cache utilities
export const clearAllCache = () => cache.clear()
export const clearCacheByKey = (key: string) => cache.delete(key)
export const getCacheSize = () => cache.size