import { esClient, INDICES } from '../config/elasticsearch'
import { pool }              from '../models/product.model'

// ── Product ES mein index karo
export const indexProduct = async (product: any): Promise<void> => {
  try {
    await esClient.index({
      index: INDICES.PRODUCTS,
      id:    product.id,
      body: {
        tenantId:   product.tenant_id,
        vendorId:   product.vendor_id,
        sku:        product.sku,
        name:       product.name,
        category:   product.category,
        basePrice:  product.base_price,
        unit:       product.unit,
        stockQty:   product.stock_qty,
        isActive:   product.is_active,
        attributes: product.attributes,
        syncedAt:   new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error('ES index error:', error.message)
  }
}

// ── Bulk index karo
export const bulkIndexProducts = async (
  products: any[]
): Promise<void> => {
  if (products.length === 0) return

  try {
    const operations = products.flatMap((p) => [
      { index: { _index: INDICES.PRODUCTS, _id: p.id } },
      {
        tenantId:   p.tenant_id,
        vendorId:   p.vendor_id,
        sku:        p.sku,
        name:       p.name,
        category:   p.category,
        basePrice:  p.base_price,
        unit:       p.unit,
        stockQty:   p.stock_qty,
        isActive:   p.is_active,
        attributes: p.attributes,
        syncedAt:   new Date().toISOString(),
      },
    ])

    await esClient.bulk({ body: operations })
    await esClient.indices.refresh({ index: INDICES.PRODUCTS })
    console.log(`✅ Bulk indexed ${products.length} products`)
  } catch (error: any) {
    console.error('ES bulk index error:', error.message)
  }
}

// ── Advanced search
export const searchProducts = async (params: {
  tenantId:  string
  query?:    string
  category?: string
  minPrice?: number
  maxPrice?: number
  minStock?: number
  sortBy?:   'price_asc' | 'price_desc' | 'name' | 'stock'
  page?:     number
  limit?:    number
}): Promise<{
  hits:    any[]
  total:   number
  took:    number
  suggest: string[]
}> => {
  const {
    tenantId, query, category,
    minPrice, maxPrice, minStock,
    sortBy, page = 1, limit = 20,
  } = params

  // ── Build query
  const must: any[]    = [
    { term: { tenantId } },
    { term: { isActive: true } },
  ]
  const filter: any[]  = []
  const should: any[]  = []

  // Full-text search
  if (query) {
    should.push(
      { match:        { name:     { query, boost: 3 } } },
      { match:        { category: { query, boost: 2 } } },
      { term:         { sku:      { value: query.toUpperCase(), boost: 5 } } },
      { fuzzy:        { name:     { value: query, fuzziness: 'AUTO' } } },
      { match_phrase: { name:     { query, boost: 4 } } },
    )
  }

  // Category filter
  if (category && category !== 'All') {
    filter.push({ term: { 'category.keyword': category } })
  }

  // Price range
  if (minPrice !== undefined || maxPrice !== undefined) {
    const range: any = {}
    if (minPrice !== undefined) range.gte = minPrice
    if (maxPrice !== undefined) range.lte = maxPrice
    filter.push({ range: { basePrice: range } })
  }

  // Stock filter
  if (minStock !== undefined) {
    filter.push({ range: { stockQty: { gte: minStock } } })
  }

  // ── Sort
  const sort: any[] = []
  switch (sortBy) {
    case 'price_asc':  sort.push({ basePrice: 'asc' });  break
    case 'price_desc': sort.push({ basePrice: 'desc' }); break
    case 'name':       sort.push({ 'name.keyword': 'asc' }); break
    case 'stock':      sort.push({ stockQty: 'desc' }); break
    default:
      if (query) sort.push({ _score: 'desc' })
      else       sort.push({ 'name.keyword': 'asc' })
  }

  try {
    const response = await esClient.search({
      index: INDICES.PRODUCTS,
      body: {
        from:  (page - 1) * limit,
        size:  limit,
        query: {
          bool: {
            must,
            filter,
            should,
            minimum_should_match: query ? 1 : 0,
          },
        },
        sort,
        highlight: {
          fields: {
            name:     { pre_tags: ['<mark>'], post_tags: ['</mark>'] },
            category: { pre_tags: ['<mark>'], post_tags: ['</mark>'] },
          },
        },
        // Search suggestions
        suggest: query ? {
          product_suggest: {
            prefix: query,
            completion: {
              field: 'name',
              size:  5,
            },
          },
        } : undefined,
        // Aggregations
        aggs: {
          categories: {
            terms: { field: 'category.keyword', size: 20 }
          },
          price_stats: {
            stats: { field: 'basePrice' }
          },
        },
      },
    })

    const hits = response.hits.hits.map((hit: any) => ({
      ...hit._source,
      id:        hit._id,
      score:     hit._score,
      highlight: hit.highlight,
    }))

    const suggest: string[] = []

    return {
      hits,
      total: typeof response.hits.total === 'number'
        ? response.hits.total
        : (response.hits.total as any)?.value || 0,
      took:    response.took,
      suggest,
    }
  } catch (error: any) {
    console.error('ES search error:', error.message)
    // Fallback to PostgreSQL
    return fallbackSearch(params)
  }
}

// ── PostgreSQL fallback
const fallbackSearch = async (params: any) => {
  const { tenantId, query, category, page = 1, limit = 20 } = params
  let   q      = `SELECT * FROM products WHERE tenant_id = $1 AND is_active = true`
  const values = [tenantId]
  let   idx    = 2

  if (query) {
    q += ` AND (name ILIKE $${idx} OR sku ILIKE $${idx})`
    values.push(`%${query}%`)
    idx++
  }
  if (category && category !== 'All') {
    q += ` AND category = $${idx}`
    values.push(category)
    idx++
  }
  q += ` LIMIT $${idx} OFFSET $${idx + 1}`
  values.push(limit, (page - 1) * limit)

  const result = await pool.query(q, values)
  return { hits: result.rows, total: result.rowCount || 0, took: 0, suggest: [] }
}

// ── Re-index all products
export const reindexAllProducts = async (
  tenantId: string
): Promise<number> => {
  const result = await pool.query(
    `SELECT * FROM products WHERE tenant_id = $1 AND is_active = true`,
    [tenantId]
  )
  await bulkIndexProducts(result.rows)
  return result.rows.length
}