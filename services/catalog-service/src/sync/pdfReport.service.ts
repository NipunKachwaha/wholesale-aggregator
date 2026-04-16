import PDFDocument from 'pdfkit'
import { pool }    from '../models/product.model'

// ── Colors
const COLORS = {
  primary:   '#2563eb',
  secondary: '#64748b',
  success:   '#16a34a',
  warning:   '#d97706',
  danger:    '#dc2626',
  light:     '#f8fafc',
  dark:      '#1e293b',
  border:    '#e2e8f0',
}

// ── Helper: Table draw karo
const drawTable = (
  doc:     PDFKit.PDFDocument,
  headers: string[],
  rows:    string[][],
  x:       number,
  y:       number,
  colWidths: number[]
): number => {
  const rowHeight = 22
  const padding   = 6

  // Header background
  doc.rect(x, y, colWidths.reduce((a, b) => a + b, 0), rowHeight)
     .fill(COLORS.primary)

  // Header text
  doc.fillColor('white').fontSize(8).font('Helvetica-Bold')
  let curX = x
  headers.forEach((h, i) => {
    doc.text(h, curX + padding, y + padding, {
      width: colWidths[i] - padding * 2,
      align: 'left',
    })
    curX += colWidths[i]
  })

  // Rows
  let curY = y + rowHeight
  rows.forEach((row, rowIdx) => {
    // Alternating row colors
    const bgColor = rowIdx % 2 === 0 ? '#ffffff' : '#f8fafc'
    doc.rect(x, curY, colWidths.reduce((a, b) => a + b, 0), rowHeight)
       .fill(bgColor)

    doc.fillColor(COLORS.dark).fontSize(7).font('Helvetica')
    curX = x
    row.forEach((cell, colIdx) => {
      doc.text(
        String(cell || '-').slice(0, 30),
        curX + padding,
        curY + padding,
        { width: colWidths[colIdx] - padding * 2, align: 'left' }
      )
      curX += colWidths[colIdx]
    })

    // Border
    doc.moveTo(x, curY + rowHeight)
       .lineTo(x + colWidths.reduce((a, b) => a + b, 0), curY + rowHeight)
       .strokeColor(COLORS.border)
       .lineWidth(0.5)
       .stroke()

    curY += rowHeight
  })

  return curY
}

// ── Header banao
const addHeader = (
  doc:      PDFKit.PDFDocument,
  title:    string,
  subtitle: string
): void => {
  // Background bar
  doc.rect(0, 0, doc.page.width, 70).fill(COLORS.primary)

  // Logo area
  doc.fontSize(20).fillColor('white').font('Helvetica-Bold')
     .text('🏪 Wholesale Aggregator', 40, 20)

  doc.fontSize(10).fillColor('rgba(255,255,255,0.8)').font('Helvetica')
     .text(subtitle, 40, 45)

  // Date
  doc.fontSize(8).fillColor('rgba(255,255,255,0.7)')
     .text(new Date().toLocaleDateString('en-IN', {
       day: '2-digit', month: 'long', year: 'numeric',
       hour: '2-digit', minute: '2-digit',
     }), doc.page.width - 180, 30)

  // Title below header
  doc.fillColor(COLORS.dark).fontSize(16).font('Helvetica-Bold')
     .text(title, 40, 90)

  doc.moveTo(40, 112)
     .lineTo(doc.page.width - 40, 112)
     .strokeColor(COLORS.primary)
     .lineWidth(2)
     .stroke()
}

// ── Footer banao
const addFooter = (doc: PDFKit.PDFDocument, pageNum: number): void => {
  const y = doc.page.height - 40
  doc.moveTo(40, y - 5)
     .lineTo(doc.page.width - 40, y - 5)
     .strokeColor(COLORS.border)
     .lineWidth(0.5)
     .stroke()

  doc.fontSize(8).fillColor(COLORS.secondary).font('Helvetica')
     .text('Wholesale Aggregator — Confidential', 40, y)
     .text(`Page ${pageNum}`, doc.page.width - 80, y)
}

// ── Products Report generate karo
export const generateProductsReport = async (
  tenantId: string
): Promise<Buffer> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Data fetch karo
      const products = await pool.query(
        `SELECT p.sku, p.name, p.category, p.base_price,
                p.stock_qty, p.unit, v.name as vendor_name,
                p.last_synced_at
         FROM products p
         LEFT JOIN vendors v ON p.vendor_id = v.id
         WHERE p.tenant_id = $1 AND p.is_active = true
         ORDER BY p.category, p.name
         LIMIT 200`,
        [tenantId]
      )

      // Stats
      const stats = await pool.query(
        `SELECT
           COUNT(*)                                  AS total,
           COUNT(DISTINCT category)                  AS categories,
           AVG(base_price)::numeric(10,2)            AS avg_price,
           SUM(stock_qty)                            AS total_stock,
           COUNT(CASE WHEN stock_qty < 50 THEN 1 END) AS low_stock
         FROM products
         WHERE tenant_id = $1 AND is_active = true`,
        [tenantId]
      )

      const s = stats.rows[0]

      // PDF banao
      const doc     = new PDFDocument({ margin: 40, size: 'A4' })
      const buffers: Buffer[] = []
      doc.on('data', (chunk) => buffers.push(chunk))
      doc.on('end',  () => resolve(Buffer.concat(buffers)))
      doc.on('error', reject)

      // ── Page 1: Summary
      addHeader(doc, 'Product Catalog Report', 'Inventory & Pricing Overview')

      // KPI boxes
      const kpis = [
        { label: 'Total Products', value: s.total,        color: COLORS.primary  },
        { label: 'Categories',     value: s.categories,   color: '#8b5cf6'       },
        { label: 'Avg Price',      value: `₹${s.avg_price}`, color: COLORS.success },
        { label: 'Low Stock',      value: s.low_stock,    color: COLORS.danger   },
      ]

      const boxW = (doc.page.width - 80 - 30) / 4
      let   bx   = 40

      kpis.forEach((kpi) => {
        doc.rect(bx, 125, boxW, 55).fill(kpi.color)
        doc.fillColor('white').fontSize(20).font('Helvetica-Bold')
           .text(String(kpi.value), bx + 10, 135, { width: boxW - 20, align: 'center' })
        doc.fontSize(8).font('Helvetica')
           .text(kpi.label, bx + 10, 158, { width: boxW - 20, align: 'center' })
        bx += boxW + 10
      })

      // Category breakdown
      doc.fillColor(COLORS.dark).fontSize(12).font('Helvetica-Bold')
         .text('Category Breakdown', 40, 200)

      const catData = await pool.query(
        `SELECT category, COUNT(*) as count, AVG(base_price)::numeric(10,2) as avg_price
         FROM products
         WHERE tenant_id = $1 AND is_active = true
         GROUP BY category ORDER BY count DESC`,
        [tenantId]
      )

      drawTable(
        doc,
        ['Category', 'Products', 'Avg Price', 'Share %'],
        catData.rows.map((r) => [
          r.category || 'Uncategorized',
          r.count,
          `₹${r.avg_price}`,
          `${((r.count / s.total) * 100).toFixed(1)}%`,
        ]),
        40, 220,
        [150, 100, 100, 100]
      )

      // ── Page 2: Products List
      doc.addPage()
      addHeader(doc, 'Product List', `${s.total} products`)
      addFooter(doc, 1)

      const rows = products.rows.map((p) => [
        p.sku,
        p.name?.slice(0, 25),
        p.category || '-',
        `₹${Number(p.base_price).toFixed(2)}`,
        `${p.stock_qty} ${p.unit || ''}`,
        p.vendor_name || '-',
      ])

      let tableY = drawTable(
        doc,
        ['SKU', 'Name', 'Category', 'Price', 'Stock', 'Vendor'],
        rows.slice(0, 30),
        40, 130,
        [80, 130, 70, 70, 70, 100]
      )

      // Agar zyada rows hain — naya page
      if (rows.length > 30) {
        doc.addPage()
        addHeader(doc, 'Product List (Contd.)', '')
        drawTable(
          doc,
          ['SKU', 'Name', 'Category', 'Price', 'Stock', 'Vendor'],
          rows.slice(30),
          40, 130,
          [80, 130, 70, 70, 70, 100]
        )
        addFooter(doc, 3)
      }

      addFooter(doc, 2)
      doc.end()

    } catch (error) {
      reject(error)
    }
  })
}

// ── Orders Report
export const generateOrdersReport = async (
  tenantId: string,
  status?:  string
): Promise<Buffer> => {
  return new Promise(async (resolve, reject) => {
    try {
      let query = `
        SELECT o.id, o.status, o.total_amount,
               o.created_at, o.line_items, u.email as buyer_email
        FROM orders o
        LEFT JOIN users u ON o.buyer_id = u.id
        WHERE o.tenant_id = $1
      `
      const values: any[] = [tenantId]
      if (status) { query += ` AND o.status = $2`; values.push(status) }
      query += ` ORDER BY o.created_at DESC LIMIT 100`

      const orders = await pool.query(query, values)

      const statsQ = await pool.query(
        `SELECT
           COUNT(*)                                         AS total,
           SUM(total_amount)::numeric(12,2)                AS revenue,
           AVG(total_amount)::numeric(10,2)                AS avg,
           COUNT(CASE WHEN status='fulfilled' THEN 1 END)  AS fulfilled,
           COUNT(CASE WHEN status='cancelled' THEN 1 END)  AS cancelled
         FROM orders WHERE tenant_id = $1`,
        [tenantId]
      )

      const s   = statsQ.rows[0]
      const doc = new PDFDocument({ margin: 40, size: 'A4' })
      const buffers: Buffer[] = []
      doc.on('data', (c) => buffers.push(c))
      doc.on('end',  () => resolve(Buffer.concat(buffers)))
      doc.on('error', reject)

      addHeader(doc, 'Orders Report', status ? `Status: ${status}` : 'All Orders')

      // KPI
      const kpis = [
        { label: 'Total Orders', value: s.total,       color: COLORS.primary  },
        { label: 'Revenue',      value: `₹${s.revenue}`, color: COLORS.success },
        { label: 'Avg Value',    value: `₹${s.avg}`,   color: '#8b5cf6'       },
        { label: 'Fulfilled',    value: s.fulfilled,   color: '#06b6d4'       },
      ]

      const boxW = (doc.page.width - 80 - 30) / 4
      let   bx   = 40
      kpis.forEach((kpi) => {
        doc.rect(bx, 125, boxW, 55).fill(kpi.color)
        doc.fillColor('white').fontSize(18).font('Helvetica-Bold')
           .text(String(kpi.value), bx + 5, 135, { width: boxW - 10, align: 'center' })
        doc.fontSize(7).font('Helvetica')
           .text(kpi.label, bx + 5, 158, { width: boxW - 10, align: 'center' })
        bx += boxW + 10
      })

      doc.fillColor(COLORS.dark).fontSize(12).font('Helvetica-Bold')
         .text('Order Details', 40, 200)

      drawTable(
        doc,
        ['Order ID', 'Status', 'Amount', 'Items', 'Date'],
        orders.rows.map((o) => {
          const items = Array.isArray(o.line_items)
            ? o.line_items
            : JSON.parse(o.line_items || '[]')
          return [
            o.id?.slice(0, 8) + '...',
            o.status,
            `₹${Number(o.total_amount).toFixed(2)}`,
            `${items.length} items`,
            new Date(o.created_at).toLocaleDateString('en-IN'),
          ]
        }),
        40, 220,
        [100, 80, 90, 70, 100]
      )

      addFooter(doc, 1)
      doc.end()

    } catch (error) {
      reject(error)
    }
  })
}