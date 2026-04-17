import { Request, Response, NextFunction } from 'express'
import { pool } from '../models/user.model'

const ATTEMPTS_LIMIT = 5
const LOCK_DURATION  = 15 * 60 * 1000 // 15 minutes

export const bruteForceProtection = async (
  req:  Request,
  res:  Response,
  next: NextFunction
): Promise<void> => {

  const { email } = req.body
  if (!email) { next(); return }

  try {
    const result = await pool.query(
      `SELECT failed_logins, locked_until FROM users WHERE email = $1`,
      [email.toLowerCase()]
    )

    if (!result.rows[0]) { next(); return }

    const { failed_logins, locked_until } = result.rows[0]

    // Account locked hai?
    if (locked_until && new Date(locked_until) > new Date()) {
      const remaining = Math.ceil(
        (new Date(locked_until).getTime() - Date.now()) / 60000
      )
      res.status(423).json({
        success: false,
        error:   `Account locked. ${remaining} minutes mein try karo.`,
        code:    'ACCOUNT_LOCKED',
      })
      return
    }

    next()
  } catch {
    next()
  }
}

// Failed login record karo
export const recordFailedLogin = async (email: string): Promise<void> => {
  await pool.query(
    `UPDATE users
     SET failed_logins = failed_logins + 1,
         locked_until  = CASE
           WHEN failed_logins + 1 >= $1
           THEN NOW() + INTERVAL '15 minutes'
           ELSE NULL
         END
     WHERE email = $2`,
    [ATTEMPTS_LIMIT, email.toLowerCase()]
  )
}

// Successful login pe reset karo
export const resetFailedLogins = async (email: string): Promise<void> => {
  await pool.query(
    `UPDATE users SET failed_logins = 0, locked_until = NULL WHERE email = $1`,
    [email.toLowerCase()]
  )
}