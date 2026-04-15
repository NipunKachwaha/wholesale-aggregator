// ── Event Types
export const WS_EVENTS = {
  // Order events
  ORDER_CREATED:       'order:created',
  ORDER_STATUS_CHANGED: 'order:status_changed',
  ORDER_CANCELLED:     'order:cancelled',

  // Product events
  PRODUCT_SYNCED:      'product:synced',
  STOCK_LOW:           'product:stock_low',

  // Vendor events
  VENDOR_SYNC_STARTED:  'vendor:sync_started',
  VENDOR_SYNC_COMPLETE: 'vendor:sync_complete',
  VENDOR_SYNC_FAILED:   'vendor:sync_failed',

  // System events
  SYSTEM_ALERT:        'system:alert',
  USER_JOINED:         'user:joined',

  // Connection events
  CONNECTED:           'connected',
  PING:                'ping',
  PONG:                'pong',
} as const

// ── Notification Type
export interface WsNotification {
  id:        string
  type:      string
  title:     string
  message:   string
  data?:     any
  severity:  'info' | 'success' | 'warning' | 'error'
  timestamp: string
  tenantId?: string
  userId?:   string
}

// ── Notification banao
export const createNotification = (
  type:     string,
  title:    string,
  message:  string,
  severity: 'info' | 'success' | 'warning' | 'error' = 'info',
  data?:    any,
  tenantId?: string
): WsNotification => ({
  id:        `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  type,
  title,
  message,
  data,
  severity,
  timestamp: new Date().toISOString(),
  tenantId,
})