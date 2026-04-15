import { Router, Request, Response } from 'express'
import {
  broadcastToTenant,
  createNotification,
} from '../websocket/ws.server'

// createNotification import fix
import { createNotification as makeNotif } from '../websocket/ws.events'

const router = Router()

// ── POST /internal/events
// Services yahan events bhejte hain
router.post('/', async (req: Request, res: Response) => {
  try {
    const { event, data, tenantId } = req.body

    let notification

    switch (event) {
      case 'order:created':
        notification = makeNotif(
          event,
          '🛒 Naya Order!',
          `Order create hua — ₹${Number(data.totalAmount).toFixed(2)} — ${data.itemCount} items`,
          'success',
          data,
          tenantId
        )
        break

      case 'order:status_changed':
        notification = makeNotif(
          event,
          '📦 Order Update',
          `Order #${data.orderId?.slice(0, 8)} — ${data.oldStatus} → ${data.newStatus}`,
          data.newStatus === 'cancelled' ? 'warning' : 'info',
          data,
          tenantId
        )
        break

      case 'vendor:sync_complete':
        notification = makeNotif(
          event,
          '✅ Sync Complete',
          `${data.vendorName || 'Vendor'} sync hua — ${data.inserted || 0} products added`,
          'success',
          data,
          tenantId
        )
        break

      case 'product:stock_low':
        notification = makeNotif(
          event,
          '⚠️ Low Stock Alert',
          `${data.productName} (${data.sku}) — sirf ${data.stockQty} bache hain`,
          'warning',
          data,
          tenantId
        )
        break

      default:
        notification = makeNotif(
          event,
          'System Update',
          JSON.stringify(data).slice(0, 100),
          'info',
          data,
          tenantId
        )
    }

    // Broadcast karo
    broadcastToTenant(tenantId, notification)

    res.json({ success: true, notificationId: notification.id })

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router