import { Router, Request, Response } from 'express'
import {
  createPaymentIntent,
  verifyPayment,
  createRefund,
  createCheckoutSession,
  handleWebhook,
} from '../services/stripe.service'
import { pool } from '../models/order.model'

const router = Router()

const DEFAULT_TENANT = '00000000-0000-0000-0000-000000000001'

// ── POST /payments/intent — Payment intent create karo
router.post('/intent', async (req: Request, res: Response) => {
  try {
    const { orderId, tenantId = DEFAULT_TENANT } = req.body

    // Order fetch karo
    const orderResult = await pool.query(
      `SELECT * FROM orders WHERE id = $1 AND tenant_id = $2`,
      [orderId, tenantId]
    )

    if (!orderResult.rows[0]) {
      res.status(404).json({ success: false, error: 'Order not found' })
      return
    }

    const order = orderResult.rows[0]
    const { clientSecret, paymentIntentId } = await createPaymentIntent(
      orderId,
      Number(order.total_amount),
      'inr',
      { tenantId, orderId }
    )

    // Payment intent ID save karo
    await pool.query(
      `UPDATE orders SET notes = CONCAT(COALESCE(notes,''), ' [PI:', $1, ']')
       WHERE id = $2`,
      [paymentIntentId, orderId]
    )

    res.json({
      success:         true,
      clientSecret,
      paymentIntentId,
      amount:          Number(order.total_amount),
    })

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// ── POST /payments/checkout — Stripe Checkout Session
router.post('/checkout', async (req: Request, res: Response) => {
  try {
    const { orderId, tenantId = DEFAULT_TENANT } = req.body

    const orderResult = await pool.query(
      `SELECT * FROM orders WHERE id = $1 AND tenant_id = $2`,
      [orderId, tenantId]
    )

    if (!orderResult.rows[0]) {
      res.status(404).json({ success: false, error: 'Order not found' })
      return
    }

    const order     = orderResult.rows[0]
    const lineItems = Array.isArray(order.line_items)
      ? order.line_items
      : JSON.parse(order.line_items || '[]')

    const sessionUrl = await createCheckoutSession(
      orderId,
      lineItems,
      Number(order.total_amount),
      `http://localhost:5173/orders?payment=success&orderId=${orderId}`,
      `http://localhost:5173/orders?payment=cancelled&orderId=${orderId}`
    )

    res.json({ success: true, checkoutUrl: sessionUrl })

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// ── GET /payments/verify/:paymentIntentId
router.get('/verify/:paymentIntentId', async (req: Request, res: Response) => {
  try {
    const result = await verifyPayment(req.params.paymentIntentId)

    if (result.paid) {
      // Order status update karo
      await pool.query(
        `UPDATE orders
         SET status = 'confirmed', updated_at = NOW()
         WHERE notes LIKE $1 AND status = 'draft'`,
        [`%[PI:${req.params.paymentIntentId}]%`]
      )
    }

    res.json({ success: true, data: result })

  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// ── POST /payments/refund
router.post('/refund', async (req: Request, res: Response) => {
  try {
    const { paymentIntentId, amount } = req.body
    const success = await createRefund(paymentIntentId, amount)
    res.json({ success, message: success ? 'Refund successful' : 'Refund failed' })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// ── POST /payments/webhook — Stripe webhooks
router.post(
  '/webhook',
  async (req: Request, res: Response) => {
    const sig    = req.headers['stripe-signature'] as string
    const secret = process.env.STRIPE_WEBHOOK_SECRET || ''

    try {
      const event = await handleWebhook(
        req.body as Buffer,
        sig,
        secret
      )

      switch (event.type) {
        case 'payment_intent.succeeded':
          console.log('✅ Payment succeeded:', event.data.object)
          break
        case 'payment_intent.payment_failed':
          console.log('❌ Payment failed:', event.data.object)
          break
      }

      res.json({ received: true })
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  }
)

export default router