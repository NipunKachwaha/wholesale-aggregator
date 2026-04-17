import { Router } from "express";
import { loginValidation, registerValidation } from "../middleware/validate";
import { login, register, refreshToken, getMe } from "./auth.controller";
import {
  generate2FASecret,
  verify2FAToken,
  enable2FA,
  disable2FA,
} from '../services/twoFactor.service'

const router = Router();

// POST /auth/login
router.post("/login", loginValidation, login);

// POST /auth/register
router.post("/register", registerValidation, register);

// POST /auth/refresh
router.post("/refresh", refreshToken);

// GET /auth/me
router.get("/me", getMe);

// ── POST /auth/2fa/setup
router.post('/2fa/setup', async (req, res) => {
  try {
    const { userId, email } = req.body
    const result = await generate2FASecret(userId, email)
    res.json({ success: true, data: result })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// ── POST /auth/2fa/enable
router.post('/2fa/enable', async (req, res) => {
  try {
    const { userId, token } = req.body
    const enabled = await enable2FA(userId, token)
    if (!enabled) {
      res.status(400).json({ success: false, error: 'Invalid token' })
      return
    }
    res.json({ success: true, message: '2FA enabled successfully' })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// ── POST /auth/2fa/verify
router.post('/2fa/verify', async (req, res) => {
  try {
    const { userId, token } = req.body
    const valid = await verify2FAToken(userId, token)
    res.json({ success: valid, verified: valid })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// ── POST /auth/2fa/disable
router.post('/2fa/disable', async (req, res) => {
  try {
    const { userId } = req.body
    await disable2FA(userId)
    res.json({ success: true, message: '2FA disabled' })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router;
