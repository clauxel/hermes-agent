import { createExactRoute } from './route-utils.mjs'

export function createWebhookRoutes(deps) {
  const {
    readTextBody,
    verifyPolarWebhookSignature,
    getPolarWebhookEventType,
    getPolarWebhookOrderId,
    findOrderByIdStatement,
    queuePaidOrder,
    sendJson,
    verifyPayPalWebhookSignature,
    handlePayPalWebhook,
    HttpError,
  } = deps

  return [
    createExactRoute('POST', '/api/webhooks/polar', async ({ request, response }) => {
      const rawPayload = await readTextBody(request)
      const signatureHeader = request.headers['polar-signature']
      const signature = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader

      if (!verifyPolarWebhookSignature(rawPayload, String(signature ?? ''))) {
        throw new HttpError(401, 'Polar webhook signature is invalid.')
      }

      const payload = rawPayload ? JSON.parse(rawPayload) : {}
      const eventType = getPolarWebhookEventType(payload)

      if (eventType === 'checkout.completed') {
        const orderId = getPolarWebhookOrderId(payload)
        const order = orderId ? await findOrderByIdStatement.get(orderId) : null

        if (order) {
          await queuePaidOrder(order)
        }
      }

      sendJson(response, 200, { received: true })
    }),
    createExactRoute('POST', '/api/webhooks/paypal', async ({ request, response }) => {
      const rawPayload = await readTextBody(request)

      if (!(await verifyPayPalWebhookSignature(rawPayload, request.headers))) {
        throw new HttpError(401, 'PayPal webhook signature is invalid.')
      }

      const payload = rawPayload ? JSON.parse(rawPayload) : {}
      await handlePayPalWebhook(payload)

      sendJson(response, 200, { received: true })
    }),
  ]
}
