import Stripe from 'stripe'

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || 'sk_test_your_key',
  { apiVersion: '2024-12-18.acacia' }
)

// ── Payment Intent banao
export const createPaymentIntent = async (
  orderId:  string,
  amount:   number,
  currency: string = 'inr',
  metadata?: Record<string, string>
): Promise<{
  clientSecret: string
  paymentIntentId: string
}> => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount:   Math.round(amount * 100), // Paise mein convert karo
    currency,
    metadata: {
      orderId,
      ...metadata,
    },
    automatic_payment_methods: {
      enabled: true,
    },
  })

  return {
    clientSecret:    paymentIntent.client_secret!,
    paymentIntentId: paymentIntent.id,
  }
}

// ── Payment verify karo
export const verifyPayment = async (
  paymentIntentId: string
): Promise<{
  status:  string
  paid:    boolean
  amount:  number
}> => {
  const intent = await stripe.paymentIntents.retrieve(paymentIntentId)

  return {
    status: intent.status,
    paid:   intent.status === 'succeeded',
    amount: intent.amount / 100,
  }
}

// ── Refund karo
export const createRefund = async (
  paymentIntentId: string,
  amount?:         number
): Promise<boolean> => {
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount:         amount ? Math.round(amount * 100) : undefined,
  })
  return refund.status === 'succeeded'
}

// ── Webhook handle karo
export const handleWebhook = async (
  payload:   Buffer,
  signature: string,
  secret:    string
): Promise<Stripe.Event> => {
  return stripe.webhooks.constructEvent(payload, signature, secret)
}

// ── Checkout session banao
export const createCheckoutSession = async (
  orderId:    string,
  lineItems:  any[],
  totalAmount: number,
  successUrl: string,
  cancelUrl:  string
): Promise<string> => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems.map((item) => ({
      price_data: {
        currency:     'inr',
        product_data: { name: `${item.name} (${item.sku})` },
        unit_amount:  Math.round(item.unitPrice * 100),
      },
      quantity: item.quantity,
    })),
    mode:        'payment',
    success_url: successUrl,
    cancel_url:  cancelUrl,
    metadata:    { orderId },
  })
  return session.url!
}