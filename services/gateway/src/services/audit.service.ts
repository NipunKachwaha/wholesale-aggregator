import { Pool }   from 'pg'
import config     from '../config'

const pool = new Pool(config.postgres)

export interface AuditEvent {
  tenantId?:  string
  userId?:    string
  action:     string
  entity?:    string
  entityId?:  string
  oldData?:   any
  newData?:   any
  ipAddress?: string
  userAgent?: string
  severity:   'low' | 'medium' | 'high' | 'critical'
  metadata?:  Record<string, any>
}

// ── Audit event log karo
export const logAudit = async (event: AuditEvent): Promise<void> => {
  try {
    await pool.query(
      `INSERT INTO audit_logs
        (tenant_id, user_id, action, entity, entity_id,
         old_data, new_data, ip_address, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8::inet,NOW())`,
      [
        event.tenantId  || null,
        event.userId    || null,
        event.action,
        event.entity    || null,
        event.entityId  || null,
        event.oldData   ? JSON.stringify(event.oldData)   : null,
        event.newData   ? JSON.stringify(event.newData)   : null,
        event.ipAddress || null,
      ]
    )
  } catch (error) {
    console.error('Audit log failed:', error)
  }
}

// ── Security events log karo
export const logSecurityEvent = async (
  type:      string,
  userId:    string,
  ipAddress: string,
  details:   Record<string, any>
): Promise<void> => {
  await logAudit({
    action:    `security:${type}`,
    userId,
    ipAddress,
    newData:   details,
    severity:  type.includes('failed') ? 'high' : 'medium',
  })
}

// ── Audit logs fetch karo
export const getAuditLogs = async (
  tenantId: string,
  filters?: {
    userId?:   string
    action?:   string
    entity?:   string
    dateFrom?: string
    dateTo?:   string
    limit?:    number
    page?:     number
  }
): Promise<{ logs: any[]; total: number }> => {

  const { limit = 50, page = 1, ...rest } = filters || {}
  let   query  = `SELECT * FROM audit_logs WHERE tenant_id = $1`
  const values: any[] = [tenantId]
  let   idx    = 2

  if (rest.userId) {
    query += ` AND user_id = $${idx++}`
    values.push(rest.userId)
  }
  if (rest.action) {
    query += ` AND action ILIKE $${idx++}`
    values.push(`%${rest.action}%`)
  }
  if (rest.entity) {
    query += ` AND entity = $${idx++}`
    values.push(rest.entity)
  }
  if (rest.dateFrom) {
    query += ` AND created_at >= $${idx++}`
    values.push(rest.dateFrom)
  }
  if (rest.dateTo) {
    query += ` AND created_at <= $${idx++}`
    values.push(rest.dateTo)
  }

  const countR  = await pool.query(
    query.replace('SELECT *', 'SELECT COUNT(*)'), values
  )
  const total   = parseInt(countR.rows[0].count)

  query += ` ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx+1}`
  values.push(limit, (page - 1) * limit)

  const result = await pool.query(query, values)
  return { logs: result.rows, total }
}