import { createExactRoute } from './route-utils.mjs'

function createRouteError(statusCode, message) {
  const error = new Error(message)
  error.statusCode = statusCode
  return error
}

function stripTrailingSlash(value) {
  return String(value || '').trim().replace(/\/+$/, '')
}

function firstString(candidates) {
  for (const candidate of candidates) {
    const value = String(candidate ?? '').trim()
    if (value) return value
  }
  return ''
}

function formatAmountCents(amountCents) {
  return (Math.max(0, Number(amountCents) || 0) / 100).toFixed(2)
}

function createOrderId(randomBytes) {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID().replace(/-/g, '')
  if (typeof randomBytes === 'function') return randomBytes(16).toString('hex')
  return Date.now().toString(36) + Math.random().toString(16).slice(2)
}

function getNowPaymentsSettings() {
  return {
    apiKey: String(process.env.NOWPAYMENTS_API_KEY || process.env.NOWPAYMENTS_KEY || '').trim(),
    baseUrl: stripTrailingSlash(process.env.NOWPAYMENTS_BASE_URL || 'https://api.nowpayments.io'),
    payCurrency: String(process.env.NOWPAYMENTS_PAY_CURRENCY || 'USDCMATIC').trim().toUpperCase(),
  }
}

async function createNowPaymentsInvoice(invoice) {
  const settings = getNowPaymentsSettings()
  if (!settings.apiKey) throw createRouteError(503, 'NOWPayments is not configured on this deployment.')

  const response = await fetch(settings.baseUrl + '/v1/invoice', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': settings.apiKey,
    },
    body: JSON.stringify(invoice),
  })
  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    const message = payload?.message || payload?.error || 'NOWPayments invoice could not be created.'
    throw createRouteError(response.status === 401 || response.status === 403 ? response.status : 502, message)
  }

  const checkoutUrl = firstString([payload?.invoice_url, payload?.invoiceUrl, payload?.url])
  const invoiceId = firstString([payload?.id, payload?.invoice_id, payload?.invoiceId])
  if (!checkoutUrl) throw createRouteError(502, 'NOWPayments invoice did not return a payment URL.')
  return { checkoutUrl, invoiceId, payCurrency: settings.payCurrency }
}

function resolvePlanForWallet(body, deps) {
  const planId = String(body?.planId ?? body?.selectionId ?? body?.plan ?? 'growth:monthly')
  const modelId = String(body?.modelId ?? '').trim()
  const options = {}
  if (modelId && typeof deps.getModelById === 'function') {
    try {
      options.model = deps.getModelById(modelId)
    } catch {
      options.model = null
    }
  }
  return deps.resolvePlanSelection(planId, options)
}

export function createNowPaymentsRoutes(deps) {
  const { getPublicAppOrigin, randomBytes, readJsonBody, sendJson } = deps

  return [
    createExactRoute('POST', '/api/nowpayments-checkout', async ({ request, response }) => {
      try {
        const body = await readJsonBody(request)
        const selection = resolvePlanForWallet(body, deps)
        const origin = stripTrailingSlash(
          typeof getPublicAppOrigin === 'function' ? getPublicAppOrigin(request) : request.headers.origin,
        )
        const orderId = createOrderId(randomBytes)
        const orderNumber = 'USDC-' + Date.now().toString(36).toUpperCase() + '-' + orderId.slice(0, 6).toUpperCase()
        const successUrl = new URL((origin || 'http://localhost') + '/')
        successUrl.searchParams.set('checkout', 'nowpayments_pending')
        successUrl.searchParams.set('provider', 'nowpayments')
        successUrl.searchParams.set('order', orderId)
        successUrl.searchParams.set('plan', selection.planId)
        const cancelUrl = new URL((origin || 'http://localhost') + '/')
        cancelUrl.searchParams.set('checkout', 'cancelled')
        cancelUrl.searchParams.set('provider', 'nowpayments')
        cancelUrl.searchParams.set('order', orderId)
        cancelUrl.searchParams.set('plan', selection.planId)

        const invoice = await createNowPaymentsInvoice({
          price_amount: formatAmountCents(selection.amountCents),
          price_currency: String(selection.plan?.currency || 'USD').toLowerCase(),
          pay_currency: String(process.env.NOWPAYMENTS_PAY_CURRENCY || 'USDCMATIC').trim().toUpperCase(),
          order_id: orderId,
          order_description: `${selection.plan?.name || selection.planId} ${selection.billingCycle || ''} wallet checkout - ${orderNumber}`.trim(),
          success_url: successUrl.toString(),
          cancel_url: cancelUrl.toString(),
          is_fixed_rate: true,
          is_fee_paid_by_user: false,
        })

        sendJson(response, 200, {
          ok: true,
          message: 'NOWPayments invoice is ready.',
          checkoutUrl: invoice.checkoutUrl,
          paymentProvider: 'nowpayments',
          provider: 'nowpayments',
          nowpaymentsInvoiceId: invoice.invoiceId || null,
          payCurrency: invoice.payCurrency,
          orderId,
          orderNumber,
          planId: selection.planId,
          billing: selection.billingCycle,
          amountCents: selection.amountCents,
          currency: selection.plan?.currency || 'USD',
        })
      } catch (error) {
        const status = Number(error?.statusCode) || 500
        const message = error instanceof Error ? error.message : 'NOWPayments checkout could not be started.'
        sendJson(response, status, { ok: false, message, error: message })
      }
    }),
  ]
}
