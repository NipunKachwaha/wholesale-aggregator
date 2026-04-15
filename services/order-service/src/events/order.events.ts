import axios from 'axios'

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://localhost:3000'

// ── Gateway ko event bhejo
const emitEvent = async (
  event:   string,
  data:    any,
  tenantId: string
): Promise<void> => {
  try {
    await axios.post(`${GATEWAY_URL}/internal/events`, {
      event,
      data,
      tenantId,
      timestamp: new Date().toISOString(),
    })
  } catch {
    // Event fail hone se order fail nahi hona chahiye
    console.warn(`Event emit failed: ${event}`)
  }
}

// ── Order created event
export const emitOrderCreated = async (
  order:    any,
  tenantId: string
): Promise<void> => {
  await emitEvent('order:created', {
    orderId:     order.id,
    status:      order.status,
    totalAmount: order.total_amount,
    itemCount:   Array.isArray(order.line_items)
                   ? order.line_items.length
                   : 0,
  }, tenantId)
}

// ── Order status changed event
export const emitOrderStatusChanged = async (
  orderId:   string,
  oldStatus: string,
  newStatus: string,
  tenantId:  string
): Promise<void> => {
  await emitEvent('order:status_changed', {
    orderId,
    oldStatus,
    newStatus,
  }, tenantId)
}