import { Pool }       from 'pg'
import DataLoader     from 'dataloader'
import dotenv         from 'dotenv'
import path           from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

const pool = new Pool({
  host:     process.env.POSTGRES_HOST     || 'localhost',
  port:     parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB       || 'wholesale_db',
  user:     process.env.POSTGRES_USER     || 'wholesale_user',
  password: process.env.POSTGRES_PASSWORD || 'changeme_dev',
})

// ── DataLoader for N+1 prevention
const vendorLoader = new DataLoader(async (vendorIds: readonly string[]) => {
  const result = await pool.query(
    `SELECT * FROM vendors WHERE id = ANY($1::uuid[])`,
    [vendorIds]
  )
  const map = new Map(result.rows.map((v) => [v.id, v]))
  return vendorIds.map((id) => map.get(id) || null)
})

// ── Helper: camelCase convert
const toCamel = (row: any) => {
  if (!row) return null
  const obj: any = {}
  for (const key of Object.keys(row)) {
    const camel = key.replace(/_([a-z])/g, (_, l) => l.toUpperCase())
    obj[camel] = row[key]
  }
  return obj
}

export const resolvers = {
  Query: {
    health: () => 'GraphQL service is running ✅',

    // ── Products
    products: async (_: any, {
      filter = {}, pagination = {}, tenantId
    }: any) => {
      const { page = 1, limit = 20 } = pagination
      let   query  = `SELECT * FROM products WHERE tenant_id = $1`
      const values = [tenantId]
      let   idx    = 2

      if (filter.search) {
        query += ` AND (name ILIKE $${idx} OR sku ILIKE $${idx})`
        values.push(`%${filter.search}%`)
        idx++
      }
      if (filter.category) {
        query += ` AND category = $${idx++}`
        values.push(filter.category)
      }
      if (filter.minPrice !== undefined) {
        query += ` AND base_price >= $${idx++}`
        values.push(filter.minPrice)
      }
      if (filter.maxPrice !== undefined) {
        query += ` AND base_price <= $${idx++}`
        values.push(filter.maxPrice)
      }
      if (filter.minStock !== undefined) {
        query += ` AND stock_qty >= $${idx++}`
        values.push(filter.minStock)
      }
      if (filter.isActive !== undefined) {
        query += ` AND is_active = $${idx++}`
        values.push(filter.isActive)
      }

      const countQ  = query.replace('SELECT *', 'SELECT COUNT(*)')
      const countR  = await pool.query(countQ, values)
      const total   = parseInt(countR.rows[0].count)

      query += ` ORDER BY name LIMIT $${idx} OFFSET $${idx + 1}`
      values.push(limit, (page - 1) * limit)

      const result = await pool.query(query, values)
      return {
        nodes:      result.rows.map(toCamel),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      }
    },

    product: async (_: any, { sku, tenantId }: any) => {
      const r = await pool.query(
        `SELECT * FROM products WHERE sku = $1 AND tenant_id = $2`,
        [sku, tenantId]
      )
      return toCamel(r.rows[0])
    },

    // ── Orders
    orders: async (_: any, {
      filter = {}, pagination = {}, tenantId
    }: any) => {
      const { page = 1, limit = 20 } = pagination
      let   query  = `SELECT * FROM orders WHERE tenant_id = $1`
      const values = [tenantId]
      let   idx    = 2

      if (filter.status) {
        query += ` AND status = $${idx++}`
        values.push(filter.status)
      }

      const countQ  = query.replace('SELECT *', 'SELECT COUNT(*)')
      const countR  = await pool.query(countQ, values)
      const total   = parseInt(countR.rows[0].count)

      query += ` ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`
      values.push(limit, (page - 1) * limit)

      const result = await pool.query(query, values)
      return {
        nodes:      result.rows.map((r) => ({
          ...toCamel(r),
          lineItems: Array.isArray(r.line_items)
            ? r.line_items
            : JSON.parse(r.line_items || '[]'),
        })),
        total,
        page,
        totalPages: Math.ceil(total / limit),
      }
    },

    order: async (_: any, { id, tenantId }: any) => {
      const r = await pool.query(
        `SELECT * FROM orders WHERE id = $1 AND tenant_id = $2`,
        [id, tenantId]
      )
      if (!r.rows[0]) return null
      return {
        ...toCamel(r.rows[0]),
        lineItems: Array.isArray(r.rows[0].line_items)
          ? r.rows[0].line_items
          : JSON.parse(r.rows[0].line_items || '[]'),
      }
    },

    // ── Vendors
    vendors: async (_: any, { tenantId }: any) => {
      const r = await pool.query(
        `SELECT * FROM vendors WHERE tenant_id = $1 AND is_active = true ORDER BY name`,
        [tenantId]
      )
      return r.rows.map(toCamel)
    },

    vendor: async (_: any, { id, tenantId }: any) => {
      const r = await pool.query(
        `SELECT * FROM vendors WHERE id = $1 AND tenant_id = $2`,
        [id, tenantId]
      )
      return toCamel(r.rows[0])
    },

    // ── Analytics
    analytics: async (_: any, { tenantId, days = 30 }: any) => {
      const stats = await pool.query(
        `SELECT
           COUNT(*)                                       AS total_orders,
           COALESCE(SUM(total_amount), 0)                AS total_revenue,
           COALESCE(AVG(total_amount), 0)                AS avg_order_value,
           COUNT(CASE WHEN status='fulfilled' THEN 1 END) AS fulfilled_orders,
           COUNT(CASE WHEN status='cancelled' THEN 1 END) AS cancelled_orders
         FROM orders
         WHERE tenant_id = $1
           AND created_at >= NOW() - INTERVAL '${days} days'`,
        [tenantId]
      )

      const topProducts = await pool.query(
        `SELECT
           p.sku, p.name,
           SUM((item->>'quantity')::int)          AS quantity,
           SUM((item->>'total')::numeric)          AS revenue
         FROM orders o,
           jsonb_array_elements(o.line_items::jsonb) AS item
         JOIN products p ON p.sku = item->>'sku'
           AND p.tenant_id = $1
         WHERE o.tenant_id = $1
           AND o.created_at >= NOW() - INTERVAL '${days} days'
         GROUP BY p.sku, p.name
         ORDER BY revenue DESC
         LIMIT 5`,
        [tenantId]
      )

      const s = stats.rows[0]
      return {
        totalOrders:     parseInt(s.total_orders),
        totalRevenue:    parseFloat(s.total_revenue),
        avgOrderValue:   parseFloat(s.avg_order_value),
        fulfilledOrders: parseInt(s.fulfilled_orders),
        cancelledOrders: parseInt(s.cancelled_orders),
        topProducts:     topProducts.rows.map((r) => ({
          sku:      r.sku,
          name:     r.name,
          quantity: parseInt(r.quantity),
          revenue:  parseFloat(r.revenue),
        })),
      }
    },
  },

  // ── Field resolvers
  Product: {
    vendor: (parent: any) =>
      parent.vendorId ? vendorLoader.load(parent.vendorId) : null,
  },

  Vendor: {
    products: async (parent: any) => {
      const r = await pool.query(
        `SELECT * FROM products WHERE vendor_id = $1 AND is_active = true LIMIT 10`,
        [parent.id]
      )
      return r.rows.map(toCamel)
    },
  },

  Mutation: {
    createOrder: async (_: any, { input, tenantId }: any) => {
      const total = input.lineItems.reduce(
        (sum: number, i: any) => sum + i.quantity * i.unitPrice, 0
      )
      const r = await pool.query(
        `INSERT INTO orders (tenant_id, status, line_items, total_amount, notes)
         VALUES ($1, 'draft', $2, $3, $4) RETURNING *`,
        [
          tenantId || input.tenantId,
          JSON.stringify(input.lineItems.map((i: any) => ({
            ...i, total: i.quantity * i.unitPrice, name: i.sku
          }))),
          total,
          input.notes || null,
        ]
      )
      return {
        ...toCamel(r.rows[0]),
        lineItems: input.lineItems,
      }
    },

    updateOrderStatus: async (_: any, { id, status, tenantId }: any) => {
      const r = await pool.query(
        `UPDATE orders SET status = $1, updated_at = NOW()
         WHERE id = $2 AND tenant_id = $3 RETURNING *`,
        [status, id, tenantId]
      )
      return {
        ...toCamel(r.rows[0]),
        lineItems: JSON.parse(r.rows[0].line_items || '[]'),
      }
    },

    cancelOrder: async (_: any, { id, tenantId }: any) => {
      const r = await pool.query(
        `UPDATE orders SET status = 'cancelled', updated_at = NOW()
         WHERE id = $1 AND tenant_id = $2 RETURNING *`,
        [id, tenantId]
      )
      return {
        ...toCamel(r.rows[0]),
        lineItems: JSON.parse(r.rows[0].line_items || '[]'),
      }
    },
  },
}