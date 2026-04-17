import speakeasy from 'speakeasy'
import QRCode    from 'qrcode'
import { pool }  from '../models/user.model'

// ── 2FA Secret generate karo
export const generate2FASecret = async (
  userId: string,
  email:  string
): Promise<{ secret: string; qrCode: string; backupCodes: string[] }> => {

  const secret = speakeasy.generateSecret({
    name:   `Wholesale Aggregator (${email})`,
    length: 32,
  })

  // QR code banao
  const qrCode = await QRCode.toDataURL(secret.otpauth_url!)

  // Backup codes generate karo
  const backupCodes = Array.from({ length: 8 }, () =>
    Math.random().toString(36).slice(2, 8).toUpperCase()
  )

  // DB mein save karo (pending — abhi enable nahi)
  await pool.query(
    `UPDATE users
     SET mfa_secret      = $1,
         mfa_backup_codes = $2
     WHERE id = $3`,
    [secret.base32, JSON.stringify(backupCodes), userId]
  )

  return { secret: secret.base32, qrCode, backupCodes }
}

// ── 2FA verify karo
export const verify2FAToken = async (
  userId: string,
  token:  string
): Promise<boolean> => {

  const result = await pool.query(
    `SELECT mfa_secret, mfa_backup_codes FROM users WHERE id = $1`,
    [userId]
  )

  if (!result.rows[0]?.mfa_secret) return false

  const { mfa_secret, mfa_backup_codes } = result.rows[0]

  // TOTP verify karo
  const valid = speakeasy.totp.verify({
    secret:   mfa_secret,
    encoding: 'base32',
    token,
    window:   1, // ±30 second window
  })

  if (valid) return true

  // Backup code check karo
  const backupCodes: string[] = JSON.parse(mfa_backup_codes || '[]')
  const codeIndex = backupCodes.indexOf(token.toUpperCase())

  if (codeIndex !== -1) {
    // Used backup code remove karo
    backupCodes.splice(codeIndex, 1)
    await pool.query(
      `UPDATE users SET mfa_backup_codes = $1 WHERE id = $2`,
      [JSON.stringify(backupCodes), userId]
    )
    return true
  }

  return false
}

// ── 2FA enable karo
export const enable2FA = async (
  userId: string,
  token:  string
): Promise<boolean> => {

  const verified = await verify2FAToken(userId, token)
  if (!verified) return false

  await pool.query(
    `UPDATE users SET mfa_enabled = true WHERE id = $1`,
    [userId]
  )
  return true
}

// ── 2FA disable karo
export const disable2FA = async (userId: string): Promise<void> => {
  await pool.query(
    `UPDATE users
     SET mfa_enabled      = false,
         mfa_secret        = NULL,
         mfa_backup_codes  = NULL
     WHERE id = $1`,
    [userId]
  )
}